import {
  extractCustomerData,
  registerCustomer,
  ElevareCustomerValidationError,
  ELEVARE_CUSTOMER_REDIS_KEY,
  type ElevareCustomerPayload,
} from '../../backend/src/integrations/elevare/customers';
import { ElevareApiError } from '../../backend/src/integrations/elevare/errors';

// ─── Module Mocks ───────────────────────────────────────────────

jest.mock('../../backend/src/database/client', () => ({
  getDatabase: jest.fn(),
}));

jest.mock('../../backend/src/state/session-manager', () => ({
  getSession: jest.fn(),
}));

const { getDatabase } = jest.requireMock('../../backend/src/database/client');
const { getSession } = jest.requireMock('../../backend/src/state/session-manager');

// ─── Fixtures ───────────────────────────────────────────────────

const TEST_PHONE = '+5521999998888';
const TEST_SESSION_ID = 'session-abc-123';

const GUEST_ROW = {
  name: 'João Silva',
  email: 'joao@example.com',
  phoneNumber: TEST_PHONE,
  language: 'pt',
};

const SESSION = {
  hotelId: 'hotel-001',
  guestPhone: TEST_PHONE,
  language: 'pt',
  createdAt: '2026-04-05T10:00:00Z',
  updatedAt: '2026-04-05T10:05:00Z',
};

const PAYLOAD: ElevareCustomerPayload = {
  name: 'João Silva',
  email: 'joao@example.com',
  phone: TEST_PHONE,
  language: 'pt',
};

// ─── Helpers ────────────────────────────────────────────────────

function mockDbSelect(result: unknown[]): void {
  const limitMock = jest.fn().mockResolvedValue(result);
  const whereMock = jest.fn().mockReturnValue({ limit: limitMock });
  const fromMock = jest.fn().mockReturnValue({ where: whereMock });
  const selectMock = jest.fn().mockReturnValue({ from: fromMock });
  getDatabase.mockReturnValue({ select: selectMock });
}

function makeLogger(): any {
  return {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    child: jest.fn().mockReturnThis(),
  };
}

function makeRedis(getResult: string | null = null): any {
  return {
    get: jest.fn().mockResolvedValue(getResult),
    set: jest.fn().mockResolvedValue('OK'),
  };
}

function makeClient(requestResult: unknown): any {
  return {
    request: jest.fn().mockResolvedValue(requestResult),
  };
}

// ─── Tests ──────────────────────────────────────────────────────

describe('elevare customers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('extractCustomerData()', () => {
    it('should extract and consolidate guest + session data', async () => {
      mockDbSelect([GUEST_ROW]);
      getSession.mockResolvedValueOnce(SESSION);

      const result = await extractCustomerData(TEST_PHONE, TEST_SESSION_ID);

      expect(result).toEqual({
        name: 'João Silva',
        email: 'joao@example.com',
        phone: TEST_PHONE,
        language: 'pt',
      });
    });

    it('should work for guest without email (email is optional)', async () => {
      mockDbSelect([{ ...GUEST_ROW, email: null }]);
      getSession.mockResolvedValueOnce(SESSION);

      const result = await extractCustomerData(TEST_PHONE, TEST_SESSION_ID);

      expect(result.email).toBeUndefined();
      expect(result.name).toBe('João Silva');
    });

    it('should prefer session language over guest profile language', async () => {
      mockDbSelect([{ ...GUEST_ROW, language: 'pt' }]);
      getSession.mockResolvedValueOnce({ ...SESSION, language: 'en' });

      const result = await extractCustomerData(TEST_PHONE, TEST_SESSION_ID);
      expect(result.language).toBe('en');
    });

    it('should default to pt when neither session nor guest has language', async () => {
      mockDbSelect([{ ...GUEST_ROW, language: null }]);
      getSession.mockResolvedValueOnce(null);

      const result = await extractCustomerData(TEST_PHONE, TEST_SESSION_ID);
      expect(result.language).toBe('pt');
    });

    it('should throw validation error for invalid E.164 phone', async () => {
      await expect(
        extractCustomerData('21999998888', TEST_SESSION_ID),
      ).rejects.toThrow(ElevareCustomerValidationError);
    });

    it('should throw when guest profile not found', async () => {
      mockDbSelect([]);

      await expect(
        extractCustomerData(TEST_PHONE, TEST_SESSION_ID),
      ).rejects.toThrow(ElevareCustomerValidationError);
    });

    it('should throw when guest has no name', async () => {
      mockDbSelect([{ ...GUEST_ROW, name: null }]);
      getSession.mockResolvedValueOnce(SESSION);

      await expect(
        extractCustomerData(TEST_PHONE, TEST_SESSION_ID),
      ).rejects.toThrow(ElevareCustomerValidationError);
    });

    it('should throw when guest has empty name string', async () => {
      mockDbSelect([{ ...GUEST_ROW, name: '   ' }]);
      getSession.mockResolvedValueOnce(SESSION);

      await expect(
        extractCustomerData(TEST_PHONE, TEST_SESSION_ID),
      ).rejects.toThrow(ElevareCustomerValidationError);
    });
  });

  describe('registerCustomer()', () => {
    it('should call API and cache customerId (happy path)', async () => {
      const redis = makeRedis(null);
      const logger = makeLogger();
      const client = makeClient({ customerId: 'CUST-789' });

      const result = await registerCustomer(client, redis, logger, PAYLOAD);

      expect(result.customerId).toBe('CUST-789');
      expect(client.request).toHaveBeenCalledWith('/customers', 'POST', PAYLOAD);
      expect(redis.set).toHaveBeenCalledWith(
        ELEVARE_CUSTOMER_REDIS_KEY(TEST_PHONE),
        'CUST-789',
        'EX',
        86400,
      );
    });

    it('should return cached customerId without calling API (cache hit)', async () => {
      const redis = makeRedis('CUST-CACHED');
      const logger = makeLogger();
      const client = makeClient({ customerId: 'CUST-SHOULD-NOT-BE-CALLED' });

      const result = await registerCustomer(client, redis, logger, PAYLOAD);

      expect(result.customerId).toBe('CUST-CACHED');
      expect(client.request).not.toHaveBeenCalled();
      expect(redis.set).not.toHaveBeenCalled();
    });

    it('should mask phone in logs', async () => {
      const redis = makeRedis(null);
      const logger = makeLogger();
      const client = makeClient({ customerId: 'CUST-789' });

      await registerCustomer(client, redis, logger, PAYLOAD);

      const infoCall = logger.info.mock.calls.find((c: any) => c[0] === 'elevare_customer_registered');
      expect(infoCall).toBeDefined();
      const logPayload = JSON.stringify(infoCall[1]);
      expect(logPayload).not.toContain('21999998888');
      expect(logPayload).toContain('***');
    });

    it('should mask email in logs', async () => {
      const redis = makeRedis(null);
      const logger = makeLogger();
      const client = makeClient({ customerId: 'CUST-789' });

      await registerCustomer(client, redis, logger, PAYLOAD);

      const infoCall = logger.info.mock.calls.find((c: any) => c[0] === 'elevare_customer_registered');
      const logPayload = JSON.stringify(infoCall[1]);
      expect(logPayload).not.toContain('joao@example.com');
    });

    it('should map 400 API error to ElevareCustomerValidationError', async () => {
      const redis = makeRedis(null);
      const logger = makeLogger();
      const client = {
        request: jest.fn().mockRejectedValue(
          new ElevareApiError('Bad Request', 400, '/customers', null),
        ),
      };

      await expect(
        registerCustomer(client as any, redis, logger, PAYLOAD),
      ).rejects.toThrow(ElevareCustomerValidationError);
    });

    it('should propagate 500 as ElevareApiError', async () => {
      const redis = makeRedis(null);
      const logger = makeLogger();
      const client = {
        request: jest.fn().mockRejectedValue(
          new ElevareApiError('Server Error', 500, '/customers', null),
        ),
      };

      await expect(
        registerCustomer(client as any, redis, logger, PAYLOAD),
      ).rejects.toThrow(ElevareApiError);
    });

    it('should reject invalid E.164 phone', async () => {
      const redis = makeRedis(null);
      const logger = makeLogger();
      const client = makeClient({ customerId: 'CUST-789' });

      await expect(
        registerCustomer(client, redis, logger, { ...PAYLOAD, phone: '21999998888' }),
      ).rejects.toThrow(ElevareCustomerValidationError);
      expect(client.request).not.toHaveBeenCalled();
    });

    it('should reject empty name', async () => {
      const redis = makeRedis(null);
      const logger = makeLogger();
      const client = makeClient({ customerId: 'CUST-789' });

      await expect(
        registerCustomer(client, redis, logger, { ...PAYLOAD, name: '' }),
      ).rejects.toThrow(ElevareCustomerValidationError);
    });

    it('should reject invalid email format', async () => {
      const redis = makeRedis(null);
      const logger = makeLogger();
      const client = makeClient({ customerId: 'CUST-789' });

      await expect(
        registerCustomer(client, redis, logger, { ...PAYLOAD, email: 'not-an-email' }),
      ).rejects.toThrow(ElevareCustomerValidationError);
    });

    it('should continue on Redis read failure (graceful degradation)', async () => {
      const redis = {
        get: jest.fn().mockRejectedValue(new Error('Redis down')),
        set: jest.fn().mockResolvedValue('OK'),
      };
      const logger = makeLogger();
      const client = makeClient({ customerId: 'CUST-789' });

      const result = await registerCustomer(client, redis as any, logger, PAYLOAD);

      expect(result.customerId).toBe('CUST-789');
      expect(client.request).toHaveBeenCalled();
    });

    it('should log cache hit with warn level', async () => {
      const redis = makeRedis('CUST-CACHED');
      const logger = makeLogger();
      const client = makeClient({ customerId: 'NEVER' });

      await registerCustomer(client, redis, logger, PAYLOAD);

      expect(logger.warn).toHaveBeenCalledWith(
        'elevare_customer_cache_hit',
        expect.objectContaining({ customerId: 'CUST-CACHED' }),
      );
    });
  });

  describe('ELEVARE_CUSTOMER_REDIS_KEY', () => {
    it('should build correct key from phone', () => {
      expect(ELEVARE_CUSTOMER_REDIS_KEY(TEST_PHONE)).toBe(
        'elevare_customer:+5521999998888',
      );
    });
  });
});
