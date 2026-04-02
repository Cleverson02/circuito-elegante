import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().default(3000),
    LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),

    // Database (Supabase)
    DATABASE_URL: z.string().url(),
    SUPABASE_URL: z.string().url(),
    SUPABASE_ANON_KEY: z.string().min(1),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

    // Redis
    REDIS_URL: z.string().default('redis://localhost:6379'),

    // OpenAI
    OPENAI_API_KEY: z.string().min(1),

    // Evolution API
    EVOLUTION_API_URL: z.string().url(),
    EVOLUTION_API_KEY: z.string().min(1),
    EVOLUTION_INSTANCE_NAME: z.string().default('stella-whatsapp'),

    // Elevare API
    ELEVARE_API_URL: z.string().url(),
    ELEVARE_API_KEY: z.string().min(1),

    // Chatwoot
    CHATWOOT_API_URL: z.string().url(),
    CHATWOOT_API_TOKEN: z.string().min(1),
    CHATWOOT_ACCOUNT_ID: z.coerce.number().default(1),

    // Google Drive (FAQ Sync)
    GOOGLE_DRIVE_FOLDER_ID: z.string().min(1),
    GOOGLE_SERVICE_ACCOUNT_KEY: z.string().min(1),

    // Sentry
    SENTRY_DSN: z.string().url().optional(),

    // Rate Limiting
    RATE_LIMIT_PER_MINUTE: z.coerce.number().default(30),
    RATE_LIMIT_PER_DAY: z.coerce.number().default(500),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
