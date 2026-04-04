import { rateLimitHook } from '../../backend/src/middleware/rate-limit';
import type { FastifyRequest, FastifyReply } from 'fastify';

// Mock Redis client
const mockRedis = {
  incr: jest.fn(),
  expire: jest.fn(),
  ttl: jest.fn(),
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

jest.mock('../../config/env', () => ({
  env: {
    RATE_LIMIT_PER_MINUTE: 30,
    REDIS_URL: 'redis://localhost:6379',
  },
}));

function createMockRequest(overrides: Partial<FastifyRequest> = {}): FastifyRequest {
  return {
    url: '/api/messages',
    headers: {},
    ip: '127.0.0.1',
    ...overrides,
  } as unknown as FastifyRequest;
}

function createMockReply(): FastifyReply {
  const reply = {
    header: jest.fn().mockReturnThis(),
    status: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
  };
  return reply as unknown as FastifyReply;
}

describe('Rate Limit Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should skip health endpoints', async () => {
    const request = createMockRequest({ url: '/health' });
    const reply = createMockReply();

    await rateLimitHook(request, reply);

    expect(mockRedis.incr).not.toHaveBeenCalled();
  });

  it('should allow requests under the limit', async () => {
    mockRedis.incr.mockResolvedValue(1);
    mockRedis.ttl.mockResolvedValue(60);

    const request = createMockRequest();
    const reply = createMockReply();

    await rateLimitHook(request, reply);

    expect(mockRedis.incr).toHaveBeenCalledWith('rate_limit:127.0.0.1');
    expect(mockRedis.expire).toHaveBeenCalledWith('rate_limit:127.0.0.1', 60);
    expect(reply.header).toHaveBeenCalledWith('X-RateLimit-Limit', 30);
    expect(reply.header).toHaveBeenCalledWith('X-RateLimit-Remaining', 29);
  });

  it('should not reset TTL on subsequent requests', async () => {
    mockRedis.incr.mockResolvedValue(5);
    mockRedis.ttl.mockResolvedValue(45);

    const request = createMockRequest();
    const reply = createMockReply();

    await rateLimitHook(request, reply);

    expect(mockRedis.expire).not.toHaveBeenCalled();
    expect(reply.header).toHaveBeenCalledWith('X-RateLimit-Remaining', 25);
  });

  it('should block requests over the limit with 429', async () => {
    mockRedis.incr.mockResolvedValue(31);
    mockRedis.ttl.mockResolvedValue(30);

    const request = createMockRequest();
    const reply = createMockReply();

    await rateLimitHook(request, reply);

    expect(reply.status).toHaveBeenCalledWith(429);
    expect(reply.send).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Too Many Requests',
        retryAfter: 30,
      }),
    );
  });

  it('should use X-User-Id header when available', async () => {
    mockRedis.incr.mockResolvedValue(1);
    mockRedis.ttl.mockResolvedValue(60);

    const request = createMockRequest({
      headers: { 'x-user-id': 'user-123' },
    });
    const reply = createMockReply();

    await rateLimitHook(request, reply);

    expect(mockRedis.incr).toHaveBeenCalledWith('rate_limit:user-123');
  });

  it('should show 0 remaining when at limit', async () => {
    mockRedis.incr.mockResolvedValue(30);
    mockRedis.ttl.mockResolvedValue(15);

    const request = createMockRequest();
    const reply = createMockReply();

    await rateLimitHook(request, reply);

    expect(reply.header).toHaveBeenCalledWith('X-RateLimit-Remaining', 0);
    // At exactly 30, should NOT return 429 (limit is 30 inclusive)
    expect(reply.status).not.toHaveBeenCalled();
  });
});
