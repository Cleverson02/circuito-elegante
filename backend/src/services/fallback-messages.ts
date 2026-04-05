/**
 * Fallback Messages — i18n catalog of elegant concierge messages.
 *
 * Story 3.8 — Fallback & Recovery Elegante.
 *
 * Each message sounds like something a 5-star hotel concierge would say
 * naturally. No message should ever look like a website error page. The
 * guest NEVER sees "error", "timeout", "system failure" etc.
 *
 * PRD §3.3 (Graceful Degradation): in luxury hospitality, failures are
 * invisible. A human concierge never says "our system went down" — they
 * say "allow me to check with our reservations team, one of our
 * specialists will continue assisting you shortly". Stella replicates
 * that exact experience.
 *
 * This module is 100% pure — no I/O, no side effects. It exports static
 * message data plus a pure selector (`selectFallbackMessage`) and a
 * banned-terms list for enforcement in unit tests.
 */

import { logger } from '../middleware/logging.js';

// ─── Types ──────────────────────────────────────────────────────

/**
 * Supported guest-facing languages. Elevare failures may occur during
 * conversations in any of these; the fallback ALWAYS produces a message
 * in the guest's own language (with PT as safety-net default).
 */
export type SupportedLanguage = 'pt' | 'en' | 'es';

/**
 * Classification of the underlying Elevare failure. Determines both the
 * guest-facing wording and the handover decision (see `fallback.ts`).
 */
export type ElevareErrorType =
  | 'timeout'
  | 'api_error'
  | 'network_error'
  | 'circuit_open';

/**
 * Full catalog shape: for each error type, one elegant phrase per
 * supported language. Consumers should prefer `selectFallbackMessage`.
 */
export type FallbackMessages = Record<
  ElevareErrorType,
  Record<SupportedLanguage, string>
>;

// ─── Message Catalog (AC5/AC6/AC7) ──────────────────────────────

/**
 * Elegant fallback phrases keyed by (errorType, language).
 *
 * Tone rules (every message MUST comply):
 *   - Sounds like a luxury concierge, not a website error.
 *   - Never admits failure, never apologises for system issues.
 *   - Never contains any term from `BANNED_TERMS`.
 *   - Reads as a proactive, natural action the concierge is taking.
 */
export const FALLBACK_MESSAGES: FallbackMessages = Object.freeze({
  timeout: Object.freeze({
    pt: 'Estou verificando as melhores opções para você, um momento...',
    en: "I'm checking the best options for you, just a moment...",
    es: 'Estoy verificando las mejores opciones para usted, un momento...',
  }),
  api_error: Object.freeze({
    pt: 'Vou conectar você com um de nossos especialistas que pode ajudar de forma mais ágil.',
    en: 'Let me connect you with one of our specialists who can assist you more promptly.',
    es: 'Permítame conectarlo con uno de nuestros especialistas que puede asistirle de manera más ágil.',
  }),
  network_error: Object.freeze({
    pt: 'Vou conectar você com um de nossos especialistas que pode ajudar de forma mais ágil.',
    en: 'Let me connect you with one of our specialists who can assist you more promptly.',
    es: 'Permítame conectarlo con uno de nuestros especialistas que puede asistirle de manera más ágil.',
  }),
  circuit_open: Object.freeze({
    pt: 'Deixa eu verificar com nossa equipe de reservas. Um dos nossos especialistas vai dar continuidade ao seu atendimento em instantes.',
    en: 'Let me check with our reservations team. One of our specialists will continue assisting you shortly.',
    es: 'Permítame verificar con nuestro equipo de reservas. Uno de nuestros especialistas continuará atendiéndole en breve.',
  }),
}) as FallbackMessages;

// ─── Banned Terms (AC8) ─────────────────────────────────────────

/**
 * Technical / failure-evoking terms that MUST NOT appear in any fallback
 * message in any language. Enforced by unit tests that scan every entry
 * in `FALLBACK_MESSAGES` case-insensitively.
 *
 * Extending this list: prefer to add more guards. Removing entries is
 * a product decision that requires a PO/QA review.
 */
export const BANNED_TERMS: readonly string[] = Object.freeze([
  'erro',
  'error',
  'falha',
  'failure',
  'fail',
  'api',
  'timeout',
  'servidor',
  'server',
  'sistema',
  'system',
  'bug',
  'crash',
  'indisponível',
  'indisponivel',
  'unavailable',
  'down',
  '500',
  '503',
  '502',
  '504',
  'exception',
  'exceção',
  'excecao',
  'retry',
  'conexão',
  'conexao',
  'connection',
  'network',
]);

// ─── Language Validation ────────────────────────────────────────

/** Runtime whitelist of supported languages. */
const SUPPORTED_LANGUAGES: readonly SupportedLanguage[] = Object.freeze([
  'pt',
  'en',
  'es',
]);

/** Market-primary default when the input language is unknown (AC16). */
const DEFAULT_LANGUAGE: SupportedLanguage = 'pt';

/**
 * Returns a guaranteed-valid `SupportedLanguage`. Logs a warning on
 * fallback so analytics can track language-detection drift upstream.
 *
 * AC16 — defaults to PT (primary market) when `language` is unknown.
 */
export function validateLanguage(language: unknown): SupportedLanguage {
  if (
    typeof language === 'string' &&
    (SUPPORTED_LANGUAGES as readonly string[]).includes(language)
  ) {
    return language as SupportedLanguage;
  }

  logger.warn('fallback_unknown_language', {
    language: typeof language === 'string' ? language : String(language),
    defaultedTo: DEFAULT_LANGUAGE,
  });

  return DEFAULT_LANGUAGE;
}

// ─── Selector ───────────────────────────────────────────────────

/**
 * Returns the elegant fallback phrase for the given (errorType, language).
 *
 * Invalid `language` falls back to PT (AC16). `errorType` is a closed
 * union so TypeScript already guarantees exhaustiveness at call sites,
 * but a defensive runtime guard is kept in case of runtime casts.
 */
export function selectFallbackMessage(
  errorType: ElevareErrorType,
  language: unknown,
): string {
  const validLanguage = validateLanguage(language);
  const entry = FALLBACK_MESSAGES[errorType];

  if (entry === undefined) {
    // Defensive: if an unknown error type sneaks through, use api_error
    // phrasing (handover copy) which is the safest concierge response.
    const safe = FALLBACK_MESSAGES.api_error[validLanguage];
    return safe;
  }

  return entry[validLanguage];
}
