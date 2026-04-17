import { z } from 'zod';
import { env } from '../../../../config/env.js';

const ElevareConfigSchema = z.object({
  apiUrl: z.string().url(),
  clientId: z.string().min(1),
  clientSecret: z.string().min(1),
  webhookSecret: z.string().min(1),
  timeoutMs: z.number().int().positive().default(8000),
  maxRetries: z.number().int().min(0).max(10).default(3),
});

export type ElevareConfig = z.infer<typeof ElevareConfigSchema>;

let cachedConfig: ElevareConfig | null = null;

export function getElevareConfig(): ElevareConfig {
  if (cachedConfig) return cachedConfig;

  const raw = {
    apiUrl: env.ELEVARE_API_URL,
    clientId: env.ELEVARE_CLIENT_ID,
    clientSecret: env.ELEVARE_CLIENT_SECRET,
    webhookSecret: env.ELEVARE_WEBHOOK_SECRET,
    timeoutMs: env.ELEVARE_TIMEOUT_MS ?? 8000,
    maxRetries: env.ELEVARE_MAX_RETRIES ?? 3,
  };

  cachedConfig = ElevareConfigSchema.parse(raw);
  return cachedConfig;
}

/** Reset cached config (for testing). */
export function resetElevareConfig(): void {
  cachedConfig = null;
}
