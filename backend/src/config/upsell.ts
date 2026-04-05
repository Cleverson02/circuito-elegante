/**
 * Upsell configuration module — Story 3.6.
 *
 * Loads and validates the `UPSELL_THRESHOLD_PERCENT` configuration used by
 * the Upsell Engine (`backend/src/services/upsell.ts`).
 *
 * Threshold philosophy:
 *   - Default: 15% — based on luxury hospitality benchmarks.
 *   - Min: 1%  — reasonable lower bound; below this no upsell would ever fire.
 *   - Max: 50% — anything higher stops being a "gentle" upsell and starts
 *     sounding like a sales pitch, violating PRD §3.2/3.3 tone rules.
 *
 * Validation is performed once per process; `getUpsellConfig()` caches the
 * result. Use `resetUpsellConfig()` in tests to re-read `process.env`.
 */

import { z } from 'zod';

// ─── Constants ──────────────────────────────────────────────────

/** Default upsell threshold when no env var is set. */
export const DEFAULT_UPSELL_THRESHOLD_PERCENT = 15;

/** Environment variable name for the threshold override. */
export const UPSELL_THRESHOLD_ENV_VAR = 'UPSELL_THRESHOLD_PERCENT';

// ─── Errors ─────────────────────────────────────────────────────

/**
 * Thrown when the upsell configuration fails validation (e.g. threshold
 * outside the [1, 50] range, or non-numeric value). Bubbles up at startup.
 */
export class ConfigValidationError extends Error {
  public readonly field: string;
  public readonly value: unknown;

  constructor(field: string, value: unknown, reason: string) {
    super(`Invalid configuration for ${field}: ${reason} (got: ${String(value)})`);
    this.name = 'ConfigValidationError';
    this.field = field;
    this.value = value;
  }
}

// ─── Schema ─────────────────────────────────────────────────────

const UpsellConfigSchema = z.object({
  thresholdPercent: z
    .number()
    .int('thresholdPercent must be an integer')
    .min(1, 'thresholdPercent must be >= 1')
    .max(50, 'thresholdPercent must be <= 50'),
});

// ─── Public types ───────────────────────────────────────────────

/** Immutable configuration consumed by the upsell engine. */
export interface UpsellConfig {
  /** Integer percent: an upgrade qualifies iff its price diff% <= this value. */
  readonly thresholdPercent: number;
}

// ─── Module state ───────────────────────────────────────────────

let cachedConfig: UpsellConfig | null = null;

// ─── Public API ─────────────────────────────────────────────────

/**
 * Returns the (cached) upsell configuration. Reads `UPSELL_THRESHOLD_PERCENT`
 * from `process.env` on first call, validates it, and memoizes the result.
 *
 * Throws `ConfigValidationError` if the env var is set but invalid.
 */
export function getUpsellConfig(): UpsellConfig {
  if (cachedConfig !== null) return cachedConfig;

  const raw = process.env[UPSELL_THRESHOLD_ENV_VAR];
  const thresholdPercent = parseThreshold(raw);

  const parsed = UpsellConfigSchema.safeParse({ thresholdPercent });
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    const message = firstIssue?.message ?? 'validation failed';
    throw new ConfigValidationError(
      UPSELL_THRESHOLD_ENV_VAR,
      raw ?? thresholdPercent,
      message,
    );
  }

  cachedConfig = Object.freeze({ thresholdPercent: parsed.data.thresholdPercent });
  return cachedConfig;
}

/**
 * Clears the cached config — call in tests before re-reading env. NOT for
 * production use.
 */
export function resetUpsellConfig(): void {
  cachedConfig = null;
}

// ─── Internal helpers ───────────────────────────────────────────

/**
 * Parses the raw env string into a number. Returns the default when the env
 * var is unset/empty. Returns NaN when the env var is present but malformed
 * (schema validation will then reject).
 */
function parseThreshold(raw: string | undefined): number {
  if (raw === undefined || raw.trim() === '') {
    return DEFAULT_UPSELL_THRESHOLD_PERCENT;
  }
  const parsed = Number(raw);
  return parsed;
}
