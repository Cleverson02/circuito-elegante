import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getRedisClient } from '../state/redis-client.js';
import { REDIS_KEYS, REDIS_TTL } from '../state/keys.js';
import { env } from '../../../config/env.js';

/**
 * Dual-window rate limiter using Redis INCR + EXPIRE.
 *
 * Story 2.8 — updated from Story 1.5 base:
 *   - Per-minute: 30 msgs/min (RATE_LIMIT_PER_MINUTE env var)
 *   - Per-day: 500 msgs/day (RATE_LIMIT_PER_DAY env var)
 *
 * AC4: Responses are elegant concierge-style, not technical error messages.
 */
export async function registerRateLimiting(app: FastifyInstance): Promise<void> {
  app.addHook('onRequest', rateLimitHook);
}

/** Polite rate-limit messages (AC4) — no technical jargon. */
export const RATE_LIMIT_MESSAGES = {
  minute: 'Estou recebendo muitas mensagens. Por favor, aguarde um momento para que eu possa atendê-lo com a devida atenção.',
  daily: 'Alcançamos o limite de mensagens por hoje. Posso continuar ajudando amanhã, ou transferi-lo para um de nossos especialistas agora?',
} as const;

export async function rateLimitHook(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  // Skip health and webhook endpoints
  if (request.url.startsWith('/health')) return;
  if (request.url.startsWith('/webhooks')) return;

  const userId = extractUserId(request);
  if (!userId) return;

  const redis = getRedisClient();

  // Check per-minute limit
  const minuteKey = REDIS_KEYS.rateLimit(userId);
  const minuteLimit = env.RATE_LIMIT_PER_MINUTE;
  const minuteCount = await redis.incr(minuteKey);

  if (minuteCount === 1) {
    await redis.expire(minuteKey, REDIS_TTL.rateLimit);
  }

  const minuteTtl = await redis.ttl(minuteKey);
  reply.header('X-RateLimit-Limit', minuteLimit);
  reply.header('X-RateLimit-Remaining', Math.max(0, minuteLimit - minuteCount));
  reply.header('X-RateLimit-Reset', minuteTtl);

  if (minuteCount > minuteLimit) {
    return reply.status(429).send({
      error: 'Too Many Requests',
      message: RATE_LIMIT_MESSAGES.minute,
      retryAfter: minuteTtl,
    });
  }

  // Check per-day limit
  const dailyKey = REDIS_KEYS.rateLimitDaily(userId);
  const dailyLimit = env.RATE_LIMIT_PER_DAY;
  const dailyCount = await redis.incr(dailyKey);

  if (dailyCount === 1) {
    await redis.expire(dailyKey, REDIS_TTL.rateLimitDaily);
  }

  const dailyTtl = await redis.ttl(dailyKey);
  reply.header('X-RateLimit-Daily-Limit', dailyLimit);
  reply.header('X-RateLimit-Daily-Remaining', Math.max(0, dailyLimit - dailyCount));

  if (dailyCount > dailyLimit) {
    return reply.status(429).send({
      error: 'Too Many Requests',
      message: RATE_LIMIT_MESSAGES.daily,
      retryAfter: dailyTtl,
    });
  }
}

function extractUserId(request: FastifyRequest): string | null {
  // Try X-User-Id header first, then IP as fallback
  const userId = request.headers['x-user-id'];
  if (typeof userId === 'string' && userId.length > 0) return userId;
  return request.ip;
}
