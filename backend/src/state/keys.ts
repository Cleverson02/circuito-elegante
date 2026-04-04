/**
 * Redis key patterns for Stella session/state management.
 * Convention: {type}:{id}
 */
export const REDIS_KEYS = {
  session: (id: string) => `session:${id}`,
  request: (id: string) => `request:${id}`,
  typingJob: (id: string) => `typing_job:${id}`,
  rateLimit: (id: string) => `rate_limit:${id}`,
} as const;

/** Default TTLs in seconds */
export const REDIS_TTL = {
  session: 24 * 60 * 60,     // 24h
  request: 5 * 60,           // 5min
  typingJob: 30,             // 30s
  rateLimit: 60,             // 1min (sliding window)
} as const;
