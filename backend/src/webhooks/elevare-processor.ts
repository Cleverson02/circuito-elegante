/**
 * Event processor for Elevare webhook events.
 *
 * Story 3.7 — Webhook Listener & Auto-Follow-Up (FR25)
 *
 * Flow (per event):
 *   1. UPDATE status received → processing
 *   2. Route by event type to a handler
 *   3. Resolve guest context (Redis fast path → DB fallback)
 *   4. Construct structured FollowUpData
 *   5. Pass to Persona Agent for prose generation
 *   6. Deliver via session (logged as sent)
 *   7. UPDATE status → processed | failed (payload untouched)
 *
 * The processor NEVER generates prose. All language/tone handling belongs
 * to the Persona Agent.
 */

import { cacheGet } from '../state/cache-helpers.js';
import { getSession } from '../state/session-manager.js';
import { QUOTATION_REDIS_KEYS, type QuotationState } from '../integrations/elevare/quotations.js';
import {
  findHistoricalEventByQuotationId,
  updateWebhookEventContext,
  updateWebhookEventStatus,
} from './elevare-repository.js';
import type {
  ElevareEventType,
  FollowUpData,
  GuestContext,
  PaymentFailedData,
  QuoteExpiringData,
  ReservationConfirmedData,
  WebhookProcessingResult,
} from './types.js';

// ─── Injection Points (for tests) ──────────────────────────────

/**
 * The processor depends on a small set of async collaborators. In production
 * these bind to concrete modules via `configureProcessorDeps`. In tests we
 * swap them with stubs.
 */
export interface ProcessorDeps {
  generateResponse: (input: {
    toolResults: Record<string, unknown>;
    sessionContext?: { guestName?: string; hotelFocus?: string };
    language: 'pt' | 'en' | 'es';
  }) => Promise<string>;
  regeneratePaymentLink: (quotationId: string) => Promise<{
    paymentLink: string;
    expiresAt: string;
  }>;
  deliverMessage: (sessionId: string, message: string) => Promise<void>;
  logger: {
    info: (msg: string, meta?: Record<string, unknown>) => void;
    warn: (msg: string, meta?: Record<string, unknown>) => void;
    error: (msg: string, meta?: Record<string, unknown>) => void;
  };
}

let deps: ProcessorDeps | null = null;

export function configureProcessorDeps(d: ProcessorDeps): void {
  deps = d;
}

function getDeps(): ProcessorDeps {
  if (!deps) {
    throw new Error(
      'Webhook processor dependencies not configured. ' +
      'Call configureProcessorDeps() at app startup.',
    );
  }
  return deps;
}

// ─── Guest Resolution (AC12) ────────────────────────────────────

const SUPPORTED_LANGUAGES: readonly string[] = ['pt', 'en', 'es'];

/**
 * Validates a raw language string and coerces to the supported union.
 * Falls back to 'pt' (mercado principal) when the value is missing or
 * unsupported — aligned with Story 3.8 fallback-messages convention.
 */
function validateLanguage(raw: string | undefined): 'pt' | 'en' | 'es' {
  if (raw && SUPPORTED_LANGUAGES.includes(raw)) {
    return raw as 'pt' | 'en' | 'es';
  }
  return 'pt';
}

/**
 * Builds the GuestContext by looking up the session's language and
 * guest name once the sessionId is known. Never throws — on any failure
 * returns the caller's sessionId + pt language + undefined guestName.
 */
async function buildGuestContext(
  sessionId: string,
  guestId: string | null,
): Promise<GuestContext> {
  const session = await getSession(sessionId).catch(() => null);
  const language = validateLanguage(session?.language);

  const rawGuestName = session?.context?.['guestName'];
  const guestName =
    typeof rawGuestName === 'string' && rawGuestName.length > 0
      ? rawGuestName
      : undefined;

  return { sessionId, guestId, guestName, language };
}

/**
 * Resolves guest context from a `quotationId`:
 *   1. Fast path: Redis `quotation:{quotationId}` → sessionId
 *   2. Fallback: DB historical `webhook_events` scan
 *   3. Otherwise: null (event stored, no follow-up sent)
 *
 * After resolving sessionId, looks up the session in Redis to extract
 * language and guestName — avoids the hardcoded 'pt' language that
 * previously defeated AC16 (PT/EN/ES prose generation).
 */
export async function resolveGuestContext(
  quotationId: string,
): Promise<GuestContext | null> {
  // Step 1: Redis fast path
  const quotationState = await cacheGet<QuotationState>(
    QUOTATION_REDIS_KEYS.quotation(quotationId),
  ).catch(() => null);

  if (quotationState?.sessionId) {
    // customerId is an Elevare id, not our guestId → pass null
    return buildGuestContext(quotationState.sessionId, null);
  }

  // Step 2: DB historical fallback
  const historical = await findHistoricalEventByQuotationId(quotationId).catch(() => null);
  if (historical?.sessionId) {
    return buildGuestContext(historical.sessionId, historical.guestId);
  }

  // Step 3: unresolved
  return null;
}

// ─── Payload Helpers ────────────────────────────────────────────

function getString(payload: Record<string, unknown>, key: string): string | null {
  const v = payload[key];
  return typeof v === 'string' && v.length > 0 ? v : null;
}

function getNumber(payload: Record<string, unknown>, key: string): number | null {
  const v = payload[key];
  return typeof v === 'number' && Number.isFinite(v) ? v : null;
}

// ─── Follow-Up Delivery ─────────────────────────────────────────

async function sendFollowUp(
  followUpData: FollowUpData,
  guestContext: GuestContext,
): Promise<void> {
  const d = getDeps();
  const sessionContext: { guestName?: string } = {};
  if (guestContext.guestName !== undefined) {
    sessionContext.guestName = guestContext.guestName;
  }
  const response = await d.generateResponse({
    toolResults: { webhookFollowUp: followUpData },
    sessionContext,
    language: guestContext.language,
  });
  await d.deliverMessage(guestContext.sessionId, response);
}

// ─── Event Handlers ─────────────────────────────────────────────

/**
 * AC8 — `quote_expiring`: gentle reminder.
 */
async function handleQuoteExpiring(
  payload: Record<string, unknown>,
  guestContext: GuestContext,
): Promise<void> {
  const quotationId = getString(payload, 'quotationId');
  const expiresAt = getString(payload, 'expiresAt');
  if (!quotationId || !expiresAt) {
    throw new Error('quote_expiring payload missing quotationId or expiresAt');
  }
  const hotelName = getString(payload, 'hotelName') ?? '';
  const guestName = guestContext.guestName ?? '';

  const data: QuoteExpiringData = {
    eventType: 'quote_expiring',
    quotationId,
    expiresAt,
    hotelName,
    guestName,
  };
  await sendFollowUp(data, guestContext);
}

/**
 * AC9 — `reservation_confirmed`: congratulations + next steps.
 */
async function handleReservationConfirmed(
  payload: Record<string, unknown>,
  guestContext: GuestContext,
): Promise<void> {
  const quotationId = getString(payload, 'quotationId');
  const reservationId = getString(payload, 'reservationId');
  const hotelName = getString(payload, 'hotelName');
  const checkIn = getString(payload, 'checkIn');
  const checkOut = getString(payload, 'checkOut');
  if (!quotationId || !reservationId || !hotelName || !checkIn || !checkOut) {
    throw new Error('reservation_confirmed payload missing required fields');
  }

  const data: ReservationConfirmedData = {
    eventType: 'reservation_confirmed',
    quotationId,
    reservationId,
    hotelName,
    checkIn,
    checkOut,
    guestName: guestContext.guestName ?? '',
  };
  await sendFollowUp(data, guestContext);
}

/**
 * AC10 — `payment_failed`: regenerate link + empathetic retry.
 * If link regeneration fails, continue with `newPaymentLink: null` and let
 * the Persona Agent craft appropriate fallback prose.
 */
async function handlePaymentFailed(
  payload: Record<string, unknown>,
  guestContext: GuestContext,
): Promise<void> {
  const d = getDeps();
  const quotationId = getString(payload, 'quotationId');
  const failureReason = getString(payload, 'failureReason');
  if (!quotationId || !failureReason) {
    throw new Error('payment_failed payload missing quotationId or failureReason');
  }

  let newPaymentLink: string | null = null;
  try {
    const regenResult = await d.regeneratePaymentLink(quotationId);
    newPaymentLink = regenResult.paymentLink;
  } catch (err) {
    d.logger.error('webhook_payment_link_regeneration_failed', {
      quotationId,
      error: err instanceof Error ? err.message : String(err),
    });
  }

  const data: PaymentFailedData = {
    eventType: 'payment_failed',
    quotationId,
    failureReason,
    newPaymentLink,
    guestName: guestContext.guestName ?? '',
  };
  await sendFollowUp(data, guestContext);
}

// ─── Main Processor (AC4, AC7, AC8-AC12, AC16) ─────────────────

export async function processWebhookEvent(
  eventId: string,
  eventType: ElevareEventType,
  payload: Record<string, unknown>,
): Promise<WebhookProcessingResult> {
  const d = getDeps();
  d.logger.info('webhook_processing_start', { webhookEventId: eventId, eventType });

  // AC7: received → processing
  await updateWebhookEventStatus(eventId, 'processing');

  try {
    // AC11: `quote_created` is audit-only — no follow-up
    if (eventType === 'quote_created') {
      await updateWebhookEventStatus(eventId, 'processed');
      d.logger.info('webhook_processing_audit_only', {
        webhookEventId: eventId,
        eventType,
      });
      return { eventId, status: 'processed', followUpSent: false };
    }

    // Resolve guest context (AC12)
    const quotationId = getString(payload, 'quotationId');
    if (!quotationId) {
      await updateWebhookEventStatus(eventId, 'processed', 'missing_quotationId');
      d.logger.warn('webhook_processing_missing_quotation_id', {
        webhookEventId: eventId,
        eventType,
      });
      return { eventId, status: 'skipped', followUpSent: false, error: 'missing_quotationId' };
    }

    const guestContext = await resolveGuestContext(quotationId);
    if (!guestContext) {
      // AC12: store as processed with error_message (NOT failed — webhook was valid)
      await updateWebhookEventStatus(eventId, 'processed', 'guest_not_resolved');
      d.logger.warn('webhook_guest_not_resolved', {
        webhookEventId: eventId,
        eventType,
        quotationId,
      });
      return {
        eventId,
        status: 'processed',
        followUpSent: false,
        error: 'guest_not_resolved',
      };
    }

    // Late-bind context to the event row
    await updateWebhookEventContext(
      eventId,
      guestContext.sessionId,
      guestContext.guestId,
    );

    // Route to handler
    switch (eventType) {
      case 'quote_expiring':
        await handleQuoteExpiring(payload, guestContext);
        break;
      case 'reservation_confirmed':
        await handleReservationConfirmed(payload, guestContext);
        break;
      case 'payment_failed':
        await handlePaymentFailed(payload, guestContext);
        break;
      default: {
        // exhaustive check
        const _exhaustive: never = eventType;
        throw new Error(`Unhandled event type: ${String(_exhaustive)}`);
      }
    }

    await updateWebhookEventStatus(eventId, 'processed');
    d.logger.info('webhook_processing_success', {
      webhookEventId: eventId,
      eventType,
      sessionId: guestContext.sessionId,
    });
    return { eventId, status: 'processed', followUpSent: true };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    await updateWebhookEventStatus(eventId, 'failed', errorMessage).catch(() => { /* best-effort */ });
    d.logger.error('webhook_processing_failed', {
      webhookEventId: eventId,
      eventType,
      error: errorMessage,
    });
    return { eventId, status: 'failed', followUpSent: false, error: errorMessage };
  }
}
