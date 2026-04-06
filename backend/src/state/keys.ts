/**
 * Redis key patterns for Stella session/state management.
 * Convention: {type}:{id}
 */
export const REDIS_KEYS = {
  session: (id: string) => `session:${id}`,
  sessionCtx: (id: string) => `session_ctx:${id}`,
  request: (id: string) => `request:${id}`,
  typingJob: (id: string) => `typing_job:${id}`,
  rateLimit: (id: string) => `rate_limit:${id}`,
  rateLimitDaily: (id: string) => `rate_limit_daily:${id}`,
  offers: (sessionId: string) => `offers:${sessionId}`,
  upsellOffered: (sessionId: string) => `upsell_offered:${sessionId}`,
  webhookDedup: (hash: string) => `webhook_dedup:${hash}`,
  webhookRateLimit: (ip: string) => `rate_limit:webhook:${ip}`,
} as const;

/** Default TTLs in seconds */
export const REDIS_TTL = {
  session: 24 * 60 * 60,       // 24h
  request: 5 * 60,             // 5min
  typingJob: 30,               // 30s
  rateLimit: 60,               // 1min (sliding window)
  rateLimitDaily: 24 * 60 * 60, // 24h (daily window)
  webhookDedup: 24 * 60 * 60,  // 24h — webhook idempotency window
  webhookRateLimit: 60,        // 1min — per-IP webhook rate limit window
} as const;
