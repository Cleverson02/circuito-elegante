import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getRedisClient } from '../state/redis-client.js';
import { REDIS_KEYS, REDIS_TTL } from '../state/keys.js';
import { env } from '../../../config/env.js';

/**
 * Sliding window rate limiter using Redis INCR + EXPIRE.
 * Limits: RATE_LIMIT_PER_MINUTE msgs/min per user.
 */
export async function registerRateLimiting(app: FastifyInstance): Promise<void> {
  app.addHook('onRequest', rateLimitHook);
}

export async function rateLimitHook(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  // Skip health endpoints
  if (request.url.startsWith('/health')) return;

  const userId = extractUserId(request);
  if (!userId) return;

  const redis = getRedisClient();
  const key = REDIS_KEYS.rateLimit(userId);
  const limit = env.RATE_LIMIT_PER_MINUTE;

  const current = await redis.incr(key);

  // Set TTL on first request in the window
  if (current === 1) {
    await redis.expire(key, REDIS_TTL.rateLimit);
  }

  // Set rate limit headers
  const ttl = await redis.ttl(key);
  reply.header('X-RateLimit-Limit', limit);
  reply.header('X-RateLimit-Remaining', Math.max(0, limit - current));
  reply.header('X-RateLimit-Reset', ttl);

  if (current > limit) {
    reply.status(429).send({
      error: 'Too Many Requests',
      message: `Rate limit exceeded. Max ${limit} requests per minute.`,
      retryAfter: ttl,
    });
  }
}

function extractUserId(request: FastifyRequest): string | null {
  // Try X-User-Id header first, then IP as fallback
  const userId = request.headers['x-user-id'];
  if (typeof userId === 'string' && userId.length > 0) return userId;
  return request.ip;
}
