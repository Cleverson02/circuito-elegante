import {
  createQuotation,
  regeneratePaymentLink,
  extendQuotationValidity,
  getQuotationStatus,
  deriveQuotationStatus,
  getStoredQuotationState,
  QuotationApiError,
  RequestExpiredError,
  InvalidOfferError,
  QuotationNotFoundError,
  QUOTATION_REDIS_KEYS,
  type CreateQuotationParams,
} from '../../backend/src/integrations/elevare/quotations';
import { ElevareApiError } from '../../backend/src/integrations/elevare/errors';

// ─── Fixtures ───────────────────────────────────────────────────

const VALID_PARAMS: CreateQuotationParams = {
  requestId: 'req_xyz789',
  offerId: 42,
  customerId: 'cust_abc123',
  sessionId: 'sess_123',
};

const NOW = new Date('2026-04-05T14:00:00Z').getTime();
const EXPIRES_24H = new Date('2026-04-06T14:00:00Z').toISOString();
const EXPIRES_1H = new Date('2026-04-05T15:00:00Z').toISOString();
const EXPIRES_PAST = new Date('2026-04-04T14:00:00Z').toISOString();

const MOCK_QUOTATION = {
  quotationId: 'quot_abc123',
  paymentLink: 'https://pay.elevare.com.br/pay/quot_abc123',
  expiresAt: EXPIRES_24H,
  status: 'active',
};

// ─── Helpers ────────────────────────────────────────────────────

function makeLogger(): any {
  return {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  };
}

function makeRedis(options: {
  requestExists?: boolean;
  quotationState?: string | null;
} = {}): any {
  return {
    exists: jest.fn().mockResolvedValue(options.requestExists === false ? 0 : 1),
    get: jest.fn().mockResolvedValue(options.quotationState ?? null),
    set: jest.fn().mockResolvedValue('OK'),
    sadd: jest.fn().mockResolvedValue(1),
  };
}

function makeClient(requestResult: unknown): any {
  return {
    request: jest.fn().mockResolvedValue(requestResult),
  };
}

function makeFailingClient(error: Error): any {
  return {
    request: jest.fn().mockRejectedValue(error),
  };
}

// ─── Tests ──────────────────────────────────────────────────────

describe('elevare quotations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── createQuotation ─────────────────────────────────────────

  describe('createQuotation()', () => {
    it('should create quotation (happy path)', async () => {
      const redis = makeRedis();
      const logger = makeLogger();
      const client = makeClient({ data: MOCK_QUOTATION });

      const result = await createQuotation(client, redis, logger, VALID_PARAMS);

      expect(result.quotationId).toBe('quot_abc123');
      expect(result.paymentLink).toContain('pay.elevare.com.br');
      expect(client.request).toHaveBeenCalledWith(
        '/global-agent/quotations',
        'POST',
        expect.objectContaining({
          requestId: 'req_xyz789',
          offerId: 42,
          customerId: 'cust_abc123',
          validityDays: 1,
          includePaymentLink: true,
        }),
      );
    });

    it('should handle unwrapped response shape', async () => {
      const redis = makeRedis();
      const logger = makeLogger();
      const client = makeClient(MOCK_QUOTATION); // no { data: ... } wrapper

      const result = await createQuotation(client, redis, logger, VALID_PARAMS);
      expect(result.quotationId).toBe('quot_abc123');
    });

    it('should throw RequestExpiredError when requestId missing in Redis', async () => {
      const redis = makeRedis({ requestExists: false });
      const logger = makeLogger();
      const client = makeClient({ data: MOCK_QUOTATION });

      await expect(
        createQuotation(client, redis, logger, VALID_PARAMS),
      ).rejects.toThrow(RequestExpiredError);
      expect(client.request).not.toHaveBeenCalled();
    });

    it('should throw InvalidOfferError for negative offerId', async () => {
      const redis = makeRedis();
      const logger = makeLogger();
      const client = makeClient({ data: MOCK_QUOTATION });

      await expect(
        createQuotation(client, redis, logger, { ...VALID_PARAMS, offerId: -1 }),
      ).rejects.toThrow(InvalidOfferError);
    });

    it('should throw InvalidOfferError for string offerId', async () => {
      const redis = makeRedis();
      const logger = makeLogger();
      const client = makeClient({ data: MOCK_QUOTATION });

      await expect(
        createQuotation(client, redis, logger, { ...VALID_PARAMS, offerId: '42' as any }),
      ).rejects.toThrow(InvalidOfferError);
    });

    it('should throw InvalidOfferError for non-integer offerId', async () => {
      const redis = makeRedis();
      const logger = makeLogger();
      const client = makeClient({ data: MOCK_QUOTATION });

      await expect(
        createQuotation(client, redis, logger, { ...VALID_PARAMS, offerId: 1.5 }),
      ).rejects.toThrow(InvalidOfferError);
    });

    it('should accept offerId = 0 (valid first offer)', async () => {
      const redis = makeRedis();
      const logger = makeLogger();
      const client = makeClient({ data: MOCK_QUOTATION });

      const result = await createQuotation(client, redis, logger, { ...VALID_PARAMS, offerId: 0 });
      expect(result.quotationId).toBe('quot_abc123');
    });

    it('should persist QuotationState in Redis with correct key', async () => {
      const redis = makeRedis();
      const logger = makeLogger();
      const client = makeClient({ data: MOCK_QUOTATION });

      await createQuotation(client, redis, logger, VALID_PARAMS);

      expect(redis.set).toHaveBeenCalledWith(
        'quotation:quot_abc123',
        expect.any(String),
        'EX',
        expect.any(Number),
      );

      const stateJson = redis.set.mock.calls[0][1];
      const state = JSON.parse(stateJson);
      expect(state.quotationId).toBe('quot_abc123');
      expect(state.requestId).toBe('req_xyz789');
      expect(state.offerId).toBe(42);
      expect(state.customerId).toBe('cust_abc123');
      expect(state.sessionId).toBe('sess_123');
    });

    it('should compute dynamic TTL from expiresAt', async () => {
      const redis = makeRedis();
      const logger = makeLogger();
      // Create with expiresAt 2 hours from now
      const expiresIn2h = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
      const client = makeClient({ data: { ...MOCK_QUOTATION, expiresAt: expiresIn2h } });

      await createQuotation(client, redis, logger, VALID_PARAMS);

      const ttl = redis.set.mock.calls[0][3];
      // TTL should be ~2h + 1h margin = ~3h = ~10800s
      expect(ttl).toBeGreaterThan(10000);
      expect(ttl).toBeLessThan(11000);
    });

    it('should add quotationId to session_quotations set', async () => {
      const redis = makeRedis();
      const logger = makeLogger();
      const client = makeClient({ data: MOCK_QUOTATION });

      await createQuotation(client, redis, logger, VALID_PARAMS);

      expect(redis.sadd).toHaveBeenCalledWith(
        'session_quotations:sess_123',
        'quot_abc123',
      );
    });

    it('should skip session tracking when sessionId not provided', async () => {
      const redis = makeRedis();
      const logger = makeLogger();
      const client = makeClient({ data: MOCK_QUOTATION });

      const { sessionId: _, ...params } = VALID_PARAMS;
      await createQuotation(client, redis, logger, params);

      expect(redis.sadd).not.toHaveBeenCalled();
    });

    it('should map 400 API error to QuotationApiError', async () => {
      const redis = makeRedis();
      const logger = makeLogger();
      const client = makeFailingClient(
        new ElevareApiError('Bad Request', 400, '/global-agent/quotations', { code: 'INVALID' }),
      );

      await expect(
        createQuotation(client, redis, logger, VALID_PARAMS),
      ).rejects.toThrow(QuotationApiError);
    });

    it('should map 500 API error to QuotationApiError', async () => {
      const redis = makeRedis();
      const logger = makeLogger();
      const client = makeFailingClient(
        new ElevareApiError('Server Error', 500, '/global-agent/quotations'),
      );

      await expect(
        createQuotation(client, redis, logger, VALID_PARAMS),
      ).rejects.toThrow(QuotationApiError);
    });

    it('should log with quotationId and sessionId', async () => {
      const redis = makeRedis();
      const logger = makeLogger();
      const client = makeClient({ data: MOCK_QUOTATION });

      await createQuotation(client, redis, logger, VALID_PARAMS);

      expect(logger.info).toHaveBeenCalledWith(
        'elevare_quotation_created',
        expect.objectContaining({
          quotationId: 'quot_abc123',
          sessionId: 'sess_123',
          offerId: 42,
        }),
      );
    });
  });

  // ─── regeneratePaymentLink ───────────────────────────────────

  describe('regeneratePaymentLink()', () => {
    it('should regenerate payment link (happy path)', async () => {
      const redis = makeRedis({ quotationState: JSON.stringify({
        quotationId: 'quot_abc123',
        paymentLink: 'old',
        expiresAt: EXPIRES_1H,
        sessionId: 'sess_123',
        requestId: 'req_xyz789',
        offerId: 42,
        customerId: 'cust_abc123',
        status: 'expiring',
        createdAt: '2026-04-05T13:00:00Z',
        updatedAt: '2026-04-05T13:00:00Z',
      }) });
      const logger = makeLogger();
      const client = makeClient({
        data: { paymentLink: 'https://pay.elevare.com.br/new', expiresAt: EXPIRES_24H },
      });

      const result = await regeneratePaymentLink(client, redis, logger, 'quot_abc123', {
        validityDays: 2,
        reason: 'Cliente solicitou',
      });

      expect(result.paymentLink).toBe('https://pay.elevare.com.br/new');
      expect(client.request).toHaveBeenCalledWith(
        '/global-agent/quotations/quot_abc123/payment-link',
        'PUT',
        expect.objectContaining({ validityDays: 2, reason: 'Cliente solicitou' }),
      );
    });

    it('should update Redis state with new paymentLink', async () => {
      const existingState = {
        quotationId: 'quot_abc123',
        paymentLink: 'old-link',
        expiresAt: EXPIRES_1H,
        sessionId: null,
        requestId: 'req_xyz',
        offerId: 1,
        customerId: 'cust_1',
        status: 'expiring',
        createdAt: '2026-04-05T13:00:00Z',
        updatedAt: '2026-04-05T13:00:00Z',
      };
      const redis = makeRedis({ quotationState: JSON.stringify(existingState) });
      const logger = makeLogger();
      const client = makeClient({
        data: { paymentLink: 'new-link', expiresAt: EXPIRES_24H },
      });

      await regeneratePaymentLink(client, redis, logger, 'quot_abc123');

      const updatedJson = redis.set.mock.calls[0][1];
      const updated = JSON.parse(updatedJson);
      expect(updated.paymentLink).toBe('new-link');
      expect(updated.expiresAt).toBe(EXPIRES_24H);
    });

    it('should throw QuotationNotFoundError on 404', async () => {
      const redis = makeRedis();
      const logger = makeLogger();
      const client = makeFailingClient(
        new ElevareApiError('Not Found', 404, '/global-agent/quotations/missing/payment-link'),
      );

      await expect(
        regeneratePaymentLink(client, redis, logger, 'missing'),
      ).rejects.toThrow(QuotationNotFoundError);
    });

    it('should map 500 error to QuotationApiError', async () => {
      const redis = makeRedis();
      const logger = makeLogger();
      const client = makeFailingClient(
        new ElevareApiError('Server Error', 500, '/global-agent/quotations/quot/payment-link'),
      );

      await expect(
        regeneratePaymentLink(client, redis, logger, 'quot'),
      ).rejects.toThrow(QuotationApiError);
    });

    it('should URL-encode quotationId', async () => {
      const redis = makeRedis();
      const logger = makeLogger();
      const client = makeClient({ data: { paymentLink: 'new', expiresAt: EXPIRES_24H } });

      await regeneratePaymentLink(client, redis, logger, 'quot with spaces');

      expect(client.request).toHaveBeenCalledWith(
        '/global-agent/quotations/quot%20with%20spaces/payment-link',
        'PUT',
        expect.any(Object),
      );
    });
  });

  // ─── extendQuotationValidity ─────────────────────────────────

  describe('extendQuotationValidity()', () => {
    it('should extend validity (happy path)', async () => {
      const redis = makeRedis();
      const logger = makeLogger();
      const client = makeClient({ data: { expiresAt: EXPIRES_24H } });

      const result = await extendQuotationValidity(client, redis, logger, 'quot_abc', {
        additionalDays: 1,
      });

      expect(result.expiresAt).toBe(EXPIRES_24H);
      expect(client.request).toHaveBeenCalledWith(
        '/global-agent/quotations/quot_abc/extend',
        'PUT',
        { additionalDays: 1, generateNewPaymentLink: false },
      );
    });

    it('should return new paymentLink when generateNewPaymentLink=true', async () => {
      const redis = makeRedis();
      const logger = makeLogger();
      const client = makeClient({
        data: { expiresAt: EXPIRES_24H, paymentLink: 'https://pay.elevare/new' },
      });

      const result = await extendQuotationValidity(client, redis, logger, 'quot_abc', {
        additionalDays: 1,
        generateNewPaymentLink: true,
      });

      expect(result.paymentLink).toBe('https://pay.elevare/new');
    });

    it('should throw QuotationNotFoundError on 404', async () => {
      const redis = makeRedis();
      const logger = makeLogger();
      const client = makeFailingClient(
        new ElevareApiError('Not Found', 404, '/global-agent/quotations/missing/extend'),
      );

      await expect(
        extendQuotationValidity(client, redis, logger, 'missing', { additionalDays: 1 }),
      ).rejects.toThrow(QuotationNotFoundError);
    });
  });

  // ─── getQuotationStatus ──────────────────────────────────────

  describe('getQuotationStatus()', () => {
    it('should return status with derived state machine value', async () => {
      const logger = makeLogger();
      const futureExpires = new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString();
      const client = makeClient({
        data: {
          quotationId: 'quot_abc',
          paymentLink: 'link',
          expiresAt: futureExpires,
          status: 'active',
        },
      });

      const result = await getQuotationStatus(client, logger, 'quot_abc');
      expect(result.status).toBe('active');
      expect(result.derivedStatus).toBe('active');
    });

    it('should throw QuotationNotFoundError on 404', async () => {
      const logger = makeLogger();
      const client = makeFailingClient(
        new ElevareApiError('Not Found', 404, '/global-agent/quotations/missing'),
      );

      await expect(getQuotationStatus(client, logger, 'missing')).rejects.toThrow(
        QuotationNotFoundError,
      );
    });
  });

  // ─── deriveQuotationStatus (State Machine) ───────────────────

  describe('deriveQuotationStatus()', () => {
    it('should return "expired" when expiresAt is in past', () => {
      expect(deriveQuotationStatus(EXPIRES_PAST, undefined, NOW)).toBe('expired');
    });

    it('should return "created" within 5min of creation', () => {
      const createdAt = new Date(NOW - 2 * 60 * 1000).toISOString();
      expect(deriveQuotationStatus(EXPIRES_24H, createdAt, NOW)).toBe('created');
    });

    it('should return "active" with > 2h remaining', () => {
      const expires4h = new Date(NOW + 4 * 60 * 60 * 1000).toISOString();
      const createdAt = new Date(NOW - 10 * 60 * 1000).toISOString();
      expect(deriveQuotationStatus(expires4h, createdAt, NOW)).toBe('active');
    });

    it('should return "expiring" with < 2h remaining', () => {
      const expires1h = new Date(NOW + 60 * 60 * 1000).toISOString();
      const createdAt = new Date(NOW - 10 * 60 * 1000).toISOString();
      expect(deriveQuotationStatus(expires1h, createdAt, NOW)).toBe('expiring');
    });

    it('should return "expired" exactly at expiresAt', () => {
      const expiresNow = new Date(NOW).toISOString();
      expect(deriveQuotationStatus(expiresNow, undefined, NOW)).toBe('expired');
    });
  });

  // ─── QUOTATION_REDIS_KEYS ────────────────────────────────────

  describe('QUOTATION_REDIS_KEYS', () => {
    it('should build quotation key from id', () => {
      expect(QUOTATION_REDIS_KEYS.quotation('quot_123')).toBe('quotation:quot_123');
    });

    it('should build session_quotations key from sessionId', () => {
      expect(QUOTATION_REDIS_KEYS.sessionQuotations('sess_1')).toBe(
        'session_quotations:sess_1',
      );
    });
  });

  // ─── getStoredQuotationState ─────────────────────────────────

  describe('getStoredQuotationState()', () => {
    it('should return parsed state from Redis', async () => {
      const state = { quotationId: 'quot_abc', paymentLink: 'link' };
      const redis = makeRedis({ quotationState: JSON.stringify(state) });

      const result = await getStoredQuotationState(redis, 'quot_abc');
      expect(result).toEqual(state);
    });

    it('should return null when quotation not in Redis', async () => {
      const redis = makeRedis({ quotationState: null });

      const result = await getStoredQuotationState(redis, 'missing');
      expect(result).toBeNull();
    });
  });
});
