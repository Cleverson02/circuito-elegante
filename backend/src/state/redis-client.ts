import { Redis } from 'ioredis';
import { env } from '../../../config/env.js';
import { logger } from '../middleware/logging.js';
import { registerHealthChecker } from '../api/health.js';

let redis: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redis) {
    redis = createRedisClient();
  }
  return redis;
}

function createRedisClient(): Redis {
  const client = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    retryStrategy(times: number) {
      const delay = Math.min(times * 200, 5000);
      logger.warn(`Redis reconnecting, attempt ${times}, delay ${delay}ms`);
      return delay;
    },
    reconnectOnError(err: Error) {
      const targetErrors = ['READONLY', 'ECONNRESET', 'ECONNREFUSED'];
      return targetErrors.some((e) => err.message.includes(e));
    },
  });

  client.on('connect', () => {
    logger.info('Redis connected');
  });

  client.on('error', (err: Error) => {
    logger.error('Redis error', { error: err.message });
  });

  client.on('close', () => {
    logger.warn('Redis connection closed');
  });

  // Register health checker
  registerHealthChecker('redis', async () => {
    try {
      const pong = await client.ping();
      return {
        status: pong === 'PONG' ? 'connected' : 'degraded',
        details: { latency: 'ok' },
      };
    } catch (error) {
      return {
        status: 'disconnected',
        details: { error: error instanceof Error ? error.message : 'Unknown' },
      };
    }
  });

  return client;
}

export async function disconnectRedis(): Promise<void> {
  if (redis) {
    await redis.quit();
    redis = null;
    logger.info('Redis disconnected');
  }
}
