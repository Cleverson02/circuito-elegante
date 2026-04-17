import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().default(3000),
    LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),

    // Database (Supabase) — required from Story 1.2+
    DATABASE_URL: z.string().url().optional(),
    SUPABASE_URL: z.string().url().optional(),
    SUPABASE_ANON_KEY: z.string().min(1).optional(),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),

    // Redis — required from Story 1.5+
    REDIS_URL: z.string().default('redis://localhost:6379'),

    // OpenAI — required from Story 1.4+
    OPENAI_API_KEY: z.string().min(1).optional(),

    // Evolution API — required from Epic 2+
    EVOLUTION_API_URL: z.string().url().optional(),
    EVOLUTION_API_KEY: z.string().min(1).optional(),
    EVOLUTION_INSTANCE_NAME: z.string().default('stella-whatsapp'),
    EVOLUTION_WEBHOOK_SECRET: z.string().min(1).optional(), // Story 4.1 — webhook HMAC validation

    // Elevare API — required from Epic 3+
    // Auth: x-client-id + x-client-secret (ambos obrigatorios, per Postman)
    ELEVARE_API_URL: z.string().url(),
    ELEVARE_CLIENT_ID: z.string().min(1),
    ELEVARE_CLIENT_SECRET: z.string().min(1),
    ELEVARE_WEBHOOK_SECRET: z.string().min(1),
    ELEVARE_TIMEOUT_MS: z.coerce.number().int().positive().default(8000),
    ELEVARE_MAX_RETRIES: z.coerce.number().int().min(0).max(10).default(3),

    // Chatwoot — required from Epic 2+
    CHATWOOT_API_URL: z.string().url().optional(),
    CHATWOOT_API_TOKEN: z.string().min(1).optional(),
    CHATWOOT_ACCOUNT_ID: z.coerce.number().default(1),

    // Google Drive (FAQ Sync) — required from Story 1.4+
    GOOGLE_DRIVE_FOLDER_ID: z.string().min(1).optional(),
    GOOGLE_SERVICE_ACCOUNT_KEY: z.string().min(1).optional(),

    // Sentry
    SENTRY_DSN: z.string().url().optional(),

    // Rate Limiting
    RATE_LIMIT_PER_MINUTE: z.coerce.number().default(30),
    RATE_LIMIT_PER_DAY: z.coerce.number().default(500),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
