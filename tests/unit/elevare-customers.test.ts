import {
  extractCustomerData,
  registerCustomer,
  splitName,
  ElevareCustomerValidationError,
  ELEVARE_CUSTOMER_REDIS_KEY,
  type ElevareCustomerPayload,
} from '../../backend/src/integrations/elevare/customers';
import { ElevareApiError } from '../../backend/src/integrations/elevare/errors';

// ─── Module Mocks ───────────────────────────────────────────────

jest.mock('../../backend/src/database/client', () => ({
  getDatabase: jest.fn(),
}));

const { getDatabase } = jest.requireMock('../../backend/src/database/client');

// ─── Fixtures ───────────────────────────────────────────────────

const TEST_PHONE = '+5521999998888';
const TEST_SESSION_ID = 'session-abc-123';

const GUEST_ROW = {
  name: 'João Silva',
  email: 'joao@example.com',
  phoneNumber: TEST_PHONE,
};

const PAYLOAD: ElevareCustomerPayload = {
  primaryPhone: TEST_PHONE,
  firstName: 'João',
  lastName: 'Silva',
  email: 'joao@example.com',
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

  describe('splitName()', () => {
    it('splits "João Silva" into firstName/lastName', () => {
      expect(splitName('João Silva')).toEqual({ firstName: 'João', lastName: 'Silva' });
    });

    it('treats last token as lastName, rest as firstName', () => {
      expect(splitName('Maria de Souza Santos')).toEqual({
        firstName: 'Maria de Souza',
        lastName: 'Santos',
      });
    });

    it('handles single-word names (lastName empty)', () => {
      expect(splitName('Madonna')).toEqual({ firstName: 'Madonna', lastName: '' });
    });

    it('handles empty input', () => {
      expect(splitName('')).toEqual({ firstName: '', lastName: '' });
    });

    it('normalizes whitespace', () => {
      expect(splitName('  João   Silva  ')).toEqual({
        firstName: 'João',
        lastName: 'Silva',
      });
    });
  });

  describe('extractCustomerData()', () => {
    it('extracts and splits name into primaryPhone/firstName/lastName', async () => {
      mockDbSelect([GUEST_ROW]);

      const result = await extractCustomerData(TEST_PHONE, TEST_SESSION_ID);

      expect(result).toEqual({
        primaryPhone: TEST_PHONE,
        firstName: 'João',
        lastName: 'Silva',
        email: 'joao@example.com',
      });
    });

    it('works for guest without email (email is optional)', async () => {
      mockDbSelect([{ ...GUEST_ROW, email: null }]);

      const result = await extractCustomerData(TEST_PHONE, TEST_SESSION_ID);

      expect(result.email).toBeUndefined();
      expect(result.firstName).toBe('João');
      expect(result.lastName).toBe('Silva');
    });

    it('throws validation error for invalid E.164 phone', async () => {
      await expect(
        extractCustomerData('21999998888', TEST_SESSION_ID),
      ).rejects.toThrow(ElevareCustomerValidationError);
    });

    it('throws when guest profile not found', async () => {
      mockDbSelect([]);

      await expect(
        extractCustomerData(TEST_PHONE, TEST_SESSION_ID),
      ).rejects.toThrow(ElevareCustomerValidationError);
    });

    it('throws when guest has no name', async () => {
      mockDbSelect([{ ...GUEST_ROW, name: null }]);

      await expect(
        extractCustomerData(TEST_PHONE, TEST_SESSION_ID),
      ).rejects.toThrow(ElevareCustomerValidationError);
    });

    it('throws when guest has whitespace-only name', async () => {
      mockDbSelect([{ ...GUEST_ROW, name: '   ' }]);

      await expect(
        extractCustomerData(TEST_PHONE, TEST_SESSION_ID),
      ).rejects.toThrow(ElevareCustomerValidationError);
    });
  });

  describe('registerCustomer()', () => {
    it('calls POST /global-agent/customers with minimalista payload', async () => {
      const redis = makeRedis(null);
      const logger = makeLogger();
      const client = makeClient({ customerId: 'CUST-789' });

      const result = await registerCustomer(client, redis, logger, PAYLOAD);

      expect(result.customerId).toBe('CUST-789');
      expect(client.request).toHaveBeenCalledWith(
        '/global-agent/customers',
        'POST',
        PAYLOAD,
      );
      expect(redis.set).toHaveBeenCalledWith(
        ELEVARE_CUSTOMER_REDIS_KEY(TEST_PHONE),
        'CUST-789',
        'EX',
        86400,
      );
    });

    it('returns cached customerId without calling API (cache hit)', async () => {
      const redis = makeRedis('CUST-CACHED');
      const logger = makeLogger();
      const client = makeClient({ customerId: 'CUST-SHOULD-NOT-BE-CALLED' });

      const result = await registerCustomer(client, redis, logger, PAYLOAD);

      expect(result.customerId).toBe('CUST-CACHED');
      expect(client.request).not.toHaveBeenCalled();
      expect(redis.set).not.toHaveBeenCalled();
    });

    it('accepts optional cpf and birthDate', async () => {
      const redis = makeRedis(null);
      const logger = makeLogger();
      const client = makeClient({ customerId: 'CUST-789' });

      const extended: ElevareCustomerPayload = {
        ...PAYLOAD,
        cpf: '12345678901',
        birthDate: '1990-05-15',
      };

      await registerCustomer(client, redis, logger, extended);

      expect(client.request).toHaveBeenCalledWith(
        '/global-agent/customers',
        'POST',
        extended,
      );
    });

    it('masks phone in logs', async () => {
      const redis = makeRedis(null);
      const logger = makeLogger();
      const client = makeClient({ customerId: 'CUST-789' });

      await registerCustomer(client, redis, logger, PAYLOAD);

      const infoCall = logger.info.mock.calls.find(
        (c: any) => c[0] === 'elevare_customer_registered',
      );
      expect(infoCall).toBeDefined();
      const logPayload = JSON.stringify(infoCall[1]);
      expect(logPayload).not.toContain('21999998888');
      expect(logPayload).toContain('***');
    });

    it('masks email in logs', async () => {
      const redis = makeRedis(null);
      const logger = makeLogger();
      const client = makeClient({ customerId: 'CUST-789' });

      await registerCustomer(client, redis, logger, PAYLOAD);

      const infoCall = logger.info.mock.calls.find(
        (c: any) => c[0] === 'elevare_customer_registered',
      );
      const logPayload = JSON.stringify(infoCall[1]);
      expect(logPayload).not.toContain('joao@example.com');
    });

    it('maps 400 API error to ElevareCustomerValidationError', async () => {
      const redis = makeRedis(null);
      const logger = makeLogger();
      const client = {
        request: jest.fn().mockRejectedValue(
          new ElevareApiError('Bad Request', 400, '/global-agent/customers', null),
        ),
      };

      await expect(
        registerCustomer(client as any, redis, logger, PAYLOAD),
      ).rejects.toThrow(ElevareCustomerValidationError);
    });

    it('propagates 500 as ElevareApiError', async () => {
      const redis = makeRedis(null);
      const logger = makeLogger();
      const client = {
        request: jest.fn().mockRejectedValue(
          new ElevareApiError('Server Error', 500, '/global-agent/customers', null),
        ),
      };

      await expect(
        registerCustomer(client as any, redis, logger, PAYLOAD),
      ).rejects.toThrow(ElevareApiError);
    });

    it('rejects invalid E.164 phone', async () => {
      const redis = makeRedis(null);
      const logger = makeLogger();
      const client = makeClient({ customerId: 'CUST-789' });

      await expect(
        registerCustomer(client, redis, logger, {
          ...PAYLOAD,
          primaryPhone: '21999998888',
        }),
      ).rejects.toThrow(ElevareCustomerValidationError);
      expect(client.request).not.toHaveBeenCalled();
    });

    it('rejects empty firstName', async () => {
      const redis = makeRedis(null);
      const logger = makeLogger();
      const client = makeClient({ customerId: 'CUST-789' });

      await expect(
        registerCustomer(client, redis, logger, { ...PAYLOAD, firstName: '' }),
      ).rejects.toThrow(ElevareCustomerValidationError);
    });

    it('rejects empty lastName', async () => {
      const redis = makeRedis(null);
      const logger = makeLogger();
      const client = makeClient({ customerId: 'CUST-789' });

      await expect(
        registerCustomer(client, redis, logger, { ...PAYLOAD, lastName: '' }),
      ).rejects.toThrow(ElevareCustomerValidationError);
    });

    it('rejects invalid email format', async () => {
      const redis = makeRedis(null);
      const logger = makeLogger();
      const client = makeClient({ customerId: 'CUST-789' });

      await expect(
        registerCustomer(client, redis, logger, { ...PAYLOAD, email: 'not-an-email' }),
      ).rejects.toThrow(ElevareCustomerValidationError);
    });

    it('rejects invalid cpf format', async () => {
      const redis = makeRedis(null);
      const logger = makeLogger();
      const client = makeClient({ customerId: 'CUST-789' });

      await expect(
        registerCustomer(client, redis, logger, { ...PAYLOAD, cpf: '123.456.789-01' }),
      ).rejects.toThrow(ElevareCustomerValidationError);
    });

    it('rejects invalid birthDate format', async () => {
      const redis = makeRedis(null);
      const logger = makeLogger();
      const client = makeClient({ customerId: 'CUST-789' });

      await expect(
        registerCustomer(client, redis, logger, { ...PAYLOAD, birthDate: '15/05/1990' }),
      ).rejects.toThrow(ElevareCustomerValidationError);
    });

    it('continues on Redis read failure (graceful degradation)', async () => {
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

    it('logs cache hit with warn level', async () => {
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
    it('builds correct key from phone', () => {
      expect(ELEVARE_CUSTOMER_REDIS_KEY(TEST_PHONE)).toBe(
        'elevare_customer:+5521999998888',
      );
    });
  });
});
