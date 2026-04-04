import { getSession, setSession, deleteSession, getRequest, setRequest, deleteRequest } from '../../backend/src/state/session-manager';
import type { SessionData, RequestData } from '../../backend/src/state/session-manager';

// Mock Redis client
const mockRedis = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
};

jest.mock('../../backend/src/state/redis-client', () => ({
  getRedisClient: () => mockRedis,
}));

jest.mock('../../backend/src/middleware/logging', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

jest.mock('../../backend/src/api/health', () => ({
  registerHealthChecker: jest.fn(),
}));

describe('Session Manager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const sessionData: SessionData = {
    hotelId: 'hotel-001',
    guestPhone: '+5511999999999',
    language: 'pt-BR',
    agentState: 'greeting',
    createdAt: '2026-04-02T00:00:00.000Z',
    updatedAt: '2026-04-02T00:00:00.000Z',
  };

  const requestData: RequestData = {
    sessionId: 'sess-001',
    intent: 'check_in',
    createdAt: '2026-04-02T00:00:00.000Z',
  };

  describe('getSession', () => {
    it('should return session data when key exists', async () => {
      mockRedis.get.mockResolvedValue(JSON.stringify(sessionData));
      const result = await getSession('sess-001');
      expect(result).toEqual(sessionData);
      expect(mockRedis.get).toHaveBeenCalledWith('session:sess-001');
    });

    it('should return null when key does not exist', async () => {
      mockRedis.get.mockResolvedValue(null);
      const result = await getSession('nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('setSession', () => {
    it('should store session with default TTL', async () => {
      mockRedis.set.mockResolvedValue('OK');
      await setSession('sess-001', sessionData);
      expect(mockRedis.set).toHaveBeenCalledWith(
        'session:sess-001',
        expect.any(String),
        'EX',
        86400,
      );
      const storedData = JSON.parse(mockRedis.set.mock.calls[0][1]);
      expect(storedData.hotelId).toBe('hotel-001');
      expect(storedData.updatedAt).toBeDefined();
    });

    it('should store session with custom TTL', async () => {
      mockRedis.set.mockResolvedValue('OK');
      await setSession('sess-001', sessionData, 3600);
      expect(mockRedis.set).toHaveBeenCalledWith(
        'session:sess-001',
        expect.any(String),
        'EX',
        3600,
      );
    });
  });

  describe('deleteSession', () => {
    it('should delete session key', async () => {
      mockRedis.del.mockResolvedValue(1);
      await deleteSession('sess-001');
      expect(mockRedis.del).toHaveBeenCalledWith('session:sess-001');
    });
  });

  describe('getRequest', () => {
    it('should return request data when key exists', async () => {
      mockRedis.get.mockResolvedValue(JSON.stringify(requestData));
      const result = await getRequest('req-001');
      expect(result).toEqual(requestData);
      expect(mockRedis.get).toHaveBeenCalledWith('request:req-001');
    });

    it('should return null when key does not exist', async () => {
      mockRedis.get.mockResolvedValue(null);
      const result = await getRequest('nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('setRequest', () => {
    it('should store request with default TTL (5min)', async () => {
      mockRedis.set.mockResolvedValue('OK');
      await setRequest('req-001', requestData);
      expect(mockRedis.set).toHaveBeenCalledWith(
        'request:req-001',
        JSON.stringify(requestData),
        'EX',
        300,
      );
    });
  });

  describe('deleteRequest', () => {
    it('should delete request key', async () => {
      mockRedis.del.mockResolvedValue(1);
      await deleteRequest('req-001');
      expect(mockRedis.del).toHaveBeenCalledWith('request:req-001');
    });
  });
});
