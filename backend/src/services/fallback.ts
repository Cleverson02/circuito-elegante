/**
 * Fallback & Recovery Elegante — Story 3.8.
 *
 * Stateless orchestrator that converts Elevare API failures into luxury-
 * concierge experiences. When the API times out, returns 5xx, breaks the
 * circuit, or fails the network, the guest NEVER sees technical details.
 * Instead, Stella masks the failure as a silent, premium handover to a
 * human specialist via Chatwoot, preserving full conversational context.
 *
 * Philosophy (PRD §3.3 — Graceful Degradation):
 *   A luxury concierge never says "our system is down". They say "allow
 *   me to check with our reservations team — one of our specialists will
 *   continue assisting you shortly". This module is the last line of
 *   defense between a technical failure and the guest experience.
 *
 * Architecture:
 *   - 100% STATELESS: no module-level mutable state, no caches, no
 *     singletons. Each call is independent — safe under concurrency.
 *   - 1-retry policy for transient 5xx: if a `retryFn` callback is
 *     provided, we give the caller exactly ONE more chance before
 *     triggering the full fallback path. Never more than one.
 *   - 4xx errors are NEVER retried (they're client-side bugs, not
 *     transient) — go straight to fallback.
 *   - `timeout` errors do NOT trigger immediate handover — they may be
 *     recoverable by the next natural request cycle (AC13). All other
 *     classifications trigger handover immediately (AC14).
 *   - Every fallback path reports to Sentry with fingerprinting by
 *     `errorType` so repeated failures collapse into ONE issue (AC12).
 *
 * Consumers:
 *   ```ts
 *   try {
 *     return await elevareClient.search(params);
 *   } catch (error) {
 *     const { guestMessage, handoverTriggered } = await handleElevareFailure(
 *       error,
 *       sessionData,
 *       'pt',
 *       () => elevareClient.search(params),
 *     );
 *     // send guestMessage via WhatsApp; if handoverTriggered, Chatwoot
 *     // already has the full HandoverSummary.
 *   }
 *   ```
 */

import * as Sentry from '@sentry/node';
import { logger } from '../middleware/logging.js';
import type { SessionData } from '../state/session-manager.js';
import {
  buildHandoverSummary,
  type HandoverSummary,
  type TransferParams,
} from '../tools/transfer-to-human.js';
import {
  ElevareApiError,
  ElevareTimeoutError,
  ElevareCircuitOpenError,
} from '../integrations/elevare/errors.js';
import {
  selectFallbackMessage,
  validateLanguage,
  type ElevareErrorType,
  type SupportedLanguage,
} from './fallback-messages.js';

// Re-export the public type surface for consumers that want to import
// everything from one location.
export type {
  ElevareErrorType,
  SupportedLanguage,
  FallbackMessages,
} from './fallback-messages.js';

// ─── Types ──────────────────────────────────────────────────────

/**
 * Result returned by `handleElevareFailure`.
 *
 * - `guestMessage`: elegant concierge phrase to send to the guest. Empty
 *   string ONLY when `retryResult` is populated (retry succeeded path).
 * - `handoverTriggered`: `true` iff the conversation was transferred to
 *   Chatwoot in this call. `timeout` → `false` (AC13); all other
 *   classifications → `true` (AC14).
 * - `sentryEventId`: event id returned by `Sentry.captureException`;
 *   empty string when Sentry is not configured (dev local).
 * - `retryResult`: populated only when the optional `retryFn` succeeded.
 *   When present, the caller should use it as the normal operation
 *   result and ignore `guestMessage`.
 */
export interface FallbackResult<TRetry = unknown> {
  readonly guestMessage: string;
  readonly handoverTriggered: boolean;
  readonly sentryEventId: string;
  readonly retryResult?: TRetry;
  /** The error classification — surfaced for analytics / testing. */
  readonly errorType: ElevareErrorType;
}

/**
 * Tunable knobs for the fallback orchestrator.
 *
 * Defaults are production-safe. Override via the optional `config` arg
 * to `handleElevareFailure` when you need a different retry delay.
 */
export interface FallbackConfig {
  /** Delay before the single retry attempt, in milliseconds. Default: 1000. */
  readonly retryDelayMs: number;
  /** Optional Sentry DSN marker — informational only; Sentry init happens at server boot. */
  readonly sentryDsn?: string;
}

/**
 * Diagnostic envelope attached to the `HandoverSummary` when a handover
 * is triggered due to an Elevare failure (AC10). It is intended for the
 * human attendant on the Chatwoot side, NOT the guest.
 */
export interface ErrorContext {
  readonly errorType: ElevareErrorType;
  readonly originalError: string;
  readonly timestamp: string;
  readonly sessionId: string;
  readonly lastElevareEndpoint: string;
}

/**
 * Extension of `HandoverSummary` carrying the `errorContext` diagnostic
 * envelope. Re-shaped from the base type without mutating it.
 */
export type FallbackHandoverSummary = HandoverSummary & {
  readonly errorContext: ErrorContext;
};

// ─── Defaults ───────────────────────────────────────────────────

/** Default config used when no override is supplied. */
const DEFAULT_CONFIG: FallbackConfig = Object.freeze({
  retryDelayMs: 1000,
});

/** Unknown endpoint marker — when the error does not carry one. */
const UNKNOWN_ENDPOINT = 'unknown';

// ─── Error Classification (AC2) ─────────────────────────────────

/**
 * Classifies an arbitrary thrown value into one of the 4 buckets that
 * drive messaging and handover logic.
 *
 * Hierarchy (most-specific first):
 *   1. ElevareCircuitOpenError → 'circuit_open'
 *   2. ElevareTimeoutError / DOMException('AbortError') → 'timeout'
 *   3. ElevareApiError (any 4xx or 5xx) → 'api_error'
 *   4. Error with node error code in {ECONNRESET, ECONNREFUSED, ETIMEDOUT}
 *      OR message containing 'fetch failed' → 'network_error'
 *   5. Everything else → 'api_error' (safe default — triggers handover)
 *
 * Defensive by design: unknown errors get the `api_error` bucket, which
 * escalates to a human. Leaving the guest stranded is worse than a
 * slightly generic concierge message.
 */
export function classifyError(error: unknown): ElevareErrorType {
  if (error instanceof ElevareCircuitOpenError) {
    return 'circuit_open';
  }

  if (error instanceof ElevareTimeoutError) {
    return 'timeout';
  }

  // DOMException with name 'AbortError' is emitted by AbortController.
  // We compare by name to avoid depending on the DOM `DOMException` in
  // Node typings that may not be globally available.
  if (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    (error as { name?: unknown }).name === 'AbortError'
  ) {
    return 'timeout';
  }

  if (error instanceof ElevareApiError) {
    return 'api_error';
  }

  if (error instanceof Error) {
    const code = (error as Error & { code?: unknown }).code;
    if (
      typeof code === 'string' &&
      (code === 'ECONNRESET' ||
        code === 'ECONNREFUSED' ||
        code === 'ETIMEDOUT')
    ) {
      return 'network_error';
    }

    if (typeof error.message === 'string' && error.message.includes('fetch failed')) {
      return 'network_error';
    }
  }

  return 'api_error';
}

// ─── Retry Logic (AC3/AC4) ──────────────────────────────────────

/**
 * Returns `true` iff the error is a transient 5xx status from Elevare
 * that is eligible for a single retry attempt. 4xx statuses (400-499)
 * are NEVER retried — they indicate client bugs that won't resolve.
 */
export function isTransient5xx(error: unknown): boolean {
  if (error instanceof ElevareApiError) {
    return error.statusCode >= 500 && error.statusCode < 600;
  }
  return false;
}

// ─── Silent Handover (AC9/AC10) ─────────────────────────────────

/**
 * Compiles the conversation so far into a human-readable summary the
 * Chatwoot attendant can use to continue seamlessly. Only non-secret,
 * guest-safe context fields are included.
 */
function buildConversationSummary(sessionData: SessionData): string {
  const parts: string[] = [];
  parts.push(`Hotel: ${sessionData.hotelId}`);
  parts.push(`Idioma: ${sessionData.language}`);

  const ctx = sessionData.context ?? {};

  const lastIntent = ctx['lastIntent'];
  if (typeof lastIntent === 'string' && lastIntent.length > 0) {
    parts.push(`Última intenção: ${lastIntent}`);
  }

  if (sessionData.agentState) {
    parts.push(`Estado do agente: ${sessionData.agentState}`);
  }

  const checkIn = ctx['checkIn'];
  if (typeof checkIn === 'string' && checkIn.length > 0) {
    parts.push(`Check-in: ${checkIn}`);
  }

  const checkOut = ctx['checkOut'];
  if (typeof checkOut === 'string' && checkOut.length > 0) {
    parts.push(`Check-out: ${checkOut}`);
  }

  const adults = ctx['adults'];
  if (typeof adults === 'number' || typeof adults === 'string') {
    parts.push(`Adultos: ${adults}`);
  }

  const children = ctx['children'];
  if (typeof children === 'number' || typeof children === 'string') {
    parts.push(`Crianças: ${children}`);
  }

  return parts.join(' | ');
}

/**
 * Derives the Elevare endpoint that failed, from the error metadata.
 * Used to enrich the `errorContext` envelope for the attendant.
 */
function detectLastEndpoint(error: unknown): string {
  if (error instanceof ElevareApiError) {
    return error.endpoint;
  }
  return UNKNOWN_ENDPOINT;
}

/**
 * Builds the Chatwoot-ready `HandoverSummary` enriched with an
 * `errorContext` diagnostic envelope (AC9/AC10).
 *
 * The summary is stateless data — the actual transport to Chatwoot is
 * the responsibility of a downstream consumer (orchestrator). This
 * function simply prepares the payload and logs the trigger.
 */
export function triggerSilentHandover(
  sessionData: SessionData,
  error: unknown,
  errorType: ElevareErrorType,
): FallbackHandoverSummary {
  const ctx = sessionData.context ?? {};
  const rawGuestName = ctx['guestName'];
  const guestName =
    typeof rawGuestName === 'string' && rawGuestName.length > 0
      ? rawGuestName
      : null;

  const rawLastIntent = ctx['lastIntent'];
  const lastIntent =
    typeof rawLastIntent === 'string' && rawLastIntent.length > 0
      ? rawLastIntent
      : null;

  const rawPreferences = ctx['preferences'];
  const preferences =
    rawPreferences !== null &&
    typeof rawPreferences === 'object' &&
    !Array.isArray(rawPreferences)
      ? (rawPreferences as Record<string, unknown>)
      : {};

  const transferParams: TransferParams = {
    reason: 'api_failure',
    guestName,
    guestPhone: sessionData.guestPhone,
    hotelFocus: sessionData.hotelId,
    conversationSummary: buildConversationSummary(sessionData),
    lastIntent,
    preferences,
  };

  const baseSummary = buildHandoverSummary(transferParams);

  const sessionId = `${sessionData.hotelId}:${sessionData.guestPhone}`;
  const errorContext: ErrorContext = Object.freeze({
    errorType,
    originalError: error instanceof Error ? error.message : String(error),
    timestamp: new Date().toISOString(),
    sessionId,
    lastElevareEndpoint: detectLastEndpoint(error),
  });

  const enriched: FallbackHandoverSummary = Object.freeze({
    ...baseSummary,
    errorContext,
  });

  logger.info('silent_handover_triggered', {
    sessionId,
    errorType,
    reason: 'api_failure',
  });

  return enriched;
}

// ─── Sentry Reporting (AC11/AC12) ───────────────────────────────

/**
 * Reports an Elevare failure to Sentry with fingerprinting by
 * `errorType`, so 1000 timeouts collapse into ONE issue instead of
 * 1000 noisy alerts. Returns the Sentry event id, or an empty string
 * when Sentry is not configured (dev local).
 */
export function reportToSentry(
  error: unknown,
  sessionData: SessionData,
  errorType: ElevareErrorType,
  language: SupportedLanguage,
): string {
  // Sentry v9: `getClient()` returns undefined when not initialized.
  if (Sentry.getClient() === undefined) {
    logger.info('sentry_not_configured', {
      message: 'Skipping Sentry report — Sentry client not initialized',
      errorType,
    });
    return '';
  }

  let eventId = '';

  Sentry.withScope((scope) => {
    // Fingerprint by error type: repeated failures of the same shape
    // collapse into a single issue (AC12).
    scope.setFingerprint(['elevare-fallback', errorType]);

    // Tags — indexable filters in the Sentry dashboard.
    scope.setTag('module', 'elevare-fallback');
    scope.setTag('errorType', errorType);
    scope.setTag('language', language);

    // Extras — visible per event.
    const sessionId = `${sessionData.hotelId}:${sessionData.guestPhone}`;
    scope.setExtra('sessionId', sessionId);
    scope.setExtra('errorType', errorType);
    scope.setExtra('language', language);
    scope.setExtra('hotelFocus', sessionData.hotelId);

    const ctx = sessionData.context ?? {};
    const lastIntent = ctx['lastIntent'];
    scope.setExtra(
      'lastIntent',
      typeof lastIntent === 'string' ? lastIntent : null,
    );

    scope.setExtra('agentState', sessionData.agentState ?? null);

    // Endpoint (from ElevareApiError.endpoint, if present).
    scope.setExtra('lastElevareEndpoint', detectLastEndpoint(error));

    const normalizedError =
      error instanceof Error ? error : new Error(String(error));
    eventId = Sentry.captureException(normalizedError);
  });

  return eventId;
}

// ─── Core Orchestrator (AC1/AC3/AC4/AC13/AC14/AC15) ─────────────

/**
 * Main entry point. Converts an Elevare failure into a guest-facing
 * elegant response + optional silent handover + Sentry report.
 *
 * Flow:
 *   1. Classify error (closed union of 4 types).
 *   2. If `api_error` AND transient 5xx AND `retryFn` provided →
 *      wait `retryDelayMs`, retry once. On success: short-circuit
 *      with `retryResult` (no handover, no Sentry). On failure:
 *      continue with the retry error.
 *   3. Build guest-facing message in the validated language.
 *   4. Determine handover: `timeout` → false; else → true.
 *   5. If handover: build `FallbackHandoverSummary` (side effect: log).
 *   6. Report to Sentry (if configured).
 *   7. Emit `elevare_fallback_triggered` analytics log.
 *   8. Return the `FallbackResult`.
 *
 * @param error      The caught value from the Elevare call.
 * @param sessionData Current session context.
 * @param language   Guest language — invalid values default to 'pt'.
 * @param retryFn    Optional callback that re-runs the Elevare call.
 *                   When provided AND the error is a transient 5xx, we
 *                   retry EXACTLY ONCE before triggering the fallback.
 * @param config     Optional config override (retryDelayMs).
 *
 * @returns A `FallbackResult` describing what the caller should do next.
 */
export async function handleElevareFailure<TRetry = unknown>(
  error: unknown,
  sessionData: SessionData,
  language: unknown,
  retryFn?: () => Promise<TRetry>,
  config?: Partial<FallbackConfig>,
): Promise<FallbackResult<TRetry>> {
  const effectiveConfig: FallbackConfig = {
    ...DEFAULT_CONFIG,
    ...(config ?? {}),
  };
  const validLanguage = validateLanguage(language);
  let classified = classifyError(error);
  let workingError: unknown = error;

  // AC3/AC4 — Single retry for transient 5xx only, only when retryFn is
  // provided. Never for 4xx, timeout, network_error, circuit_open.
  if (
    classified === 'api_error' &&
    isTransient5xx(workingError) &&
    retryFn !== undefined
  ) {
    try {
      if (effectiveConfig.retryDelayMs > 0) {
        await delay(effectiveConfig.retryDelayMs);
      }
      const retryResult = await retryFn();
      logger.info('fallback_retry_succeeded', {
        sessionId: sessionData.guestPhone,
        hotelId: sessionData.hotelId,
      });
      return {
        guestMessage: '',
        handoverTriggered: false,
        sentryEventId: '',
        retryResult,
        errorType: classified,
      };
    } catch (retryError) {
      logger.warn('fallback_retry_failed', {
        sessionId: sessionData.guestPhone,
        hotelId: sessionData.hotelId,
        originalErrorType: classified,
      });
      // Re-classify using the retry error — the new error may have a
      // different shape (e.g. circuit breaker tripped).
      workingError = retryError;
      classified = classifyError(retryError);
    }
  }

  const guestMessage = selectFallbackMessage(classified, validLanguage);

  // AC13 — timeout keeps the door open for a natural next attempt.
  // AC14 — every other classification triggers handover immediately.
  const handoverTriggered = classified !== 'timeout';

  if (handoverTriggered) {
    // Side-effect: logs 'silent_handover_triggered'. The returned
    // summary is the Chatwoot payload; the orchestrator is responsible
    // for actually pushing it to Chatwoot.
    triggerSilentHandover(sessionData, workingError, classified);
  }

  const sentryEventId = reportToSentry(
    workingError,
    sessionData,
    classified,
    validLanguage,
  );

  // AC15 — analytics for fallback rate by error type.
  logger.warn('elevare_fallback_triggered', {
    errorType: classified,
    language: validLanguage,
    sessionId: sessionData.guestPhone,
    hotelId: sessionData.hotelId,
    handoverTriggered,
    sentryEventId,
  });

  return {
    guestMessage,
    handoverTriggered,
    sentryEventId,
    errorType: classified,
  };
}

// ─── Internal helpers ───────────────────────────────────────────

/** Promise-based sleep. */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
