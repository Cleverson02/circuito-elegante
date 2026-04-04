import { getRedisClient } from './redis-client.js';

/**
 * Get a cached value, parsing JSON automatically.
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  const redis = getRedisClient();
  const data = await redis.get(key);
  if (!data) return null;
  return JSON.parse(data) as T;
}

/**
 * Set a cached value with optional TTL (seconds).
 */
export async function cacheSet<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
  const redis = getRedisClient();
  const payload = JSON.stringify(value);
  if (ttlSeconds) {
    await redis.set(key, payload, 'EX', ttlSeconds);
  } else {
    await redis.set(key, payload);
  }
}

/**
 * Delete a cached key.
 */
export async function cacheDel(key: string): Promise<void> {
  const redis = getRedisClient();
  await redis.del(key);
}

/**
 * Check if a key exists.
 */
export async function cacheExists(key: string): Promise<boolean> {
  const redis = getRedisClient();
  return (await redis.exists(key)) === 1;
}

/**
 * Get remaining TTL for a key (in seconds). Returns -2 if key doesn't exist, -1 if no TTL.
 */
export async function cacheTtl(key: string): Promise<number> {
  const redis = getRedisClient();
  return redis.ttl(key);
}
