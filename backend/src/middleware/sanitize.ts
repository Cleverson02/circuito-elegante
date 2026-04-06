/**
 * Input sanitization middleware for the Stella agent pipeline.
 *
 * Story 2.8 — Middleware de Segurança (Sanitização & Rate Limiting)
 *
 * Defense-in-depth layer 1 (of 3):
 *   1. THIS middleware — strips control chars, detects injection, truncates
 *   2. Guardrails (Story 2.1) — LLM-based input classification
 *   3. Safety Agent (Story 2.9) — dedicated validation agent
 *
 * Design: sanitize-and-warn, NOT block. Valid messages ALWAYS pass through
 * (possibly truncated). Injection attempts are logged for Sentry/analytics
 * but do NOT prevent the message from reaching the pipeline — the
 * downstream guardrails handle blocking decisions.
 */

import { logger } from './logging.js';

// ─── Constants ─────────────────────────────────────────────────

/** Maximum allowed message length. Longer messages are truncated. */
export const MAX_MESSAGE_LENGTH = 2000;

/** Truncation suffix appended when a message exceeds MAX_MESSAGE_LENGTH. */
const TRUNCATION_SUFFIX = '…';

// ─── Control Character Removal (AC1) ───────────────────────────

/**
 * Strips control characters (U+0000–U+001F) EXCEPT \n (0x0A) and \t (0x09)
 * which are legitimate in guest messages (line breaks, pasted text).
 *
 * Also strips:
 *   - U+007F (DEL)
 *   - U+200B (zero-width space) — used in some injection bypass tricks
 *   - U+FEFF (BOM) — sometimes injected by copy-paste
 */
// eslint-disable-next-line no-control-regex -- Intentional: this regex targets control chars for sanitization
const CONTROL_CHAR_REGEX = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F\u200B\uFEFF]/g;

export function removeControlChars(input: string): string {
  return input.replace(CONTROL_CHAR_REGEX, '');
}

// ─── Injection Detection (AC1, AC2) ────────────────────────────

/**
 * Patterns that indicate prompt injection or code injection attempts.
 * Each pattern is case-insensitive and tested against the sanitized input.
 *
 * False-positive mitigation: patterns are specific enough to avoid
 * triggering on normal hotel booking conversations. E.g., "ignore" alone
 * is fine; "ignore previous instructions" is flagged.
 */
const INJECTION_PATTERNS: readonly RegExp[] = [
  // Prompt injection — attempts to override system instructions
  /ignore\s+(all\s+)?(previous|prior|above|earlier)\s+(instructions|prompts|context)/i,
  /disregard\s+(all\s+)?(previous|prior|above)\s+(instructions|prompts)/i,
  /you\s+are\s+now\s+(a|an|the)\s+/i,
  /system\s*prompt/i,
  /\bDAN\b.*\bjailbreak\b/i,
  /act\s+as\s+(if\s+)?you\s+(have\s+)?no\s+(restrictions|rules|limits)/i,
  /override\s+(safety|security|content)\s+(filters?|policies|rules)/i,
  /pretend\s+(you\s+are|to\s+be)\s+(a\s+)?(different|new|unrestricted)/i,

  // XSS / HTML injection
  /<script[\s>]/i,
  /<\/script>/i,
  /javascript\s*:/i,
  /on(error|load|click|mouseover)\s*=/i,

  // SQL injection (basic patterns)
  /'\s*(OR|AND)\s+'?\d*'?\s*=\s*'?\d*/i,
  /;\s*(DROP|DELETE|UPDATE|INSERT|ALTER|EXEC)\s/i,
  /UNION\s+(ALL\s+)?SELECT\s/i,

  // Command injection
  /\$\(\s*(curl|wget|bash|sh|cmd)\b/i,
  /`\s*(curl|wget|bash|sh|cmd)\b/i,
];

export interface InjectionDetectionResult {
  isInjection: boolean;
  matchedPattern: string | null;
}

/**
 * Scans input for known injection patterns. Returns the first match
 * for logging purposes. Does NOT block the message — that decision
 * belongs to downstream guardrails.
 */
export function detectInjection(input: string): InjectionDetectionResult {
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(input)) {
      return {
        isInjection: true,
        matchedPattern: pattern.source,
      };
    }
  }
  return { isInjection: false, matchedPattern: null };
}

// ─── Truncation (AC1) ──────────────────────────────────────────

/**
 * Truncates input to MAX_MESSAGE_LENGTH, appending '…' if truncated.
 * Preserves full content when under the limit.
 */
export function truncateMessage(input: string, maxLength: number = MAX_MESSAGE_LENGTH): string {
  if (input.length <= maxLength) return input;
  return input.slice(0, maxLength - TRUNCATION_SUFFIX.length) + TRUNCATION_SUFFIX;
}

// ─── Main Sanitize Function (AC1, AC2) ─────────────────────────

export interface SanitizeResult {
  sanitized: string;
  original: string;
  wasModified: boolean;
  wasTruncated: boolean;
  injection: InjectionDetectionResult;
}

/**
 * Full sanitization pipeline:
 *   1. Remove control characters
 *   2. Detect injection patterns (log, don't block)
 *   3. Truncate to MAX_MESSAGE_LENGTH
 *
 * Always returns a usable string — never throws, never blocks.
 */
export function sanitizeInput(input: string): SanitizeResult {
  // Step 1: strip control chars
  const cleaned = removeControlChars(input);

  // Step 2: detect injection (before truncation — scan full input)
  const injection = detectInjection(cleaned);

  if (injection.isInjection) {
    logger.warn('injection_attempt_detected', {
      matchedPattern: injection.matchedPattern,
      inputLength: input.length,
      // Do NOT log the full input — it may contain PII or attack payloads
      // that shouldn't be stored in plain text.
      inputPreview: cleaned.slice(0, 80),
    });
  }

  // Step 3: truncate
  const sanitized = truncateMessage(cleaned);
  const wasTruncated = sanitized.length < cleaned.length;

  if (wasTruncated) {
    logger.info('message_truncated', {
      originalLength: cleaned.length,
      truncatedTo: sanitized.length,
    });
  }

  return {
    sanitized,
    original: input,
    wasModified: sanitized !== input,
    wasTruncated,
    injection,
  };
}
