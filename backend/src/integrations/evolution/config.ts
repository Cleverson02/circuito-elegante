/**
 * Evolution API — Configuration loader with Zod validation.
 *
 * Story 4.1 — WhatsApp Business API — Recepcao de Mensagens
 *
 * Env vars EVOLUTION_API_URL, EVOLUTION_API_KEY, EVOLUTION_INSTANCE_NAME
 * already exist in config/env.ts (lines 22-25). This module wraps them
 * in a typed EvolutionConfig with caching (same pattern as elevare/config.ts).
 */

import { z } from 'zod';
import { env } from '../../../../config/env.js';
import type { EvolutionConfig } from './types.js';

const EvolutionConfigSchema = z.object({
  apiUrl: z.string().url(),
  apiKey: z.string().min(1),
  instanceName: z.string().min(1),
});

let cachedConfig: EvolutionConfig | null = null;

export function getEvolutionConfig(): EvolutionConfig {
  if (cachedConfig) return cachedConfig;

  const raw = {
    apiUrl: env.EVOLUTION_API_URL ?? 'http://evolution:8080',
    apiKey: env.EVOLUTION_API_KEY ?? '',
    instanceName: env.EVOLUTION_INSTANCE_NAME ?? 'stella-whatsapp',
  };

  cachedConfig = EvolutionConfigSchema.parse(raw);
  return cachedConfig;
}

/** Reset cached config (for testing). */
export function resetEvolutionConfig(): void {
  cachedConfig = null;
}
