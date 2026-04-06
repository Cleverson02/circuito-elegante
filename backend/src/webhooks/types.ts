/**
 * TypeScript types for Elevare webhook events and follow-up processing.
 *
 * Story 3.7 — Webhook Listener & Auto-Follow-Up (FR25)
 *
 * Design notes:
 * - `ElevareWebhookBody` is the raw request body shape sent by Elevare.
 * - `ElevareWebhookPayload` is the discriminated union of all payload variants
 *   per event type. Narrow via `event_type` to get strong typing.
 * - `FollowUpData` is the structured, language-agnostic payload the webhook
 *   processor hands to the Persona Agent. The processor NEVER generates prose.
 * - `WebhookProcessingResult` is the internal return type from the async
 *   processor used for logging and tests.
 */

// ─── Event Types ────────────────────────────────────────────────

export type ElevareEventType =
  | 'quote_created'
  | 'quote_expiring'
  | 'reservation_confirmed'
  | 'payment_failed';

/**
 * Runtime-validated list of supported event types. Keep in sync with
 * `ElevareEventType`. Unknown event types bypass this list and are stored
 * with status `received` but never processed (audit trail only).
 */
export const SUPPORTED_EVENT_TYPES: readonly ElevareEventType[] = [
  'quote_created',
  'quote_expiring',
  'reservation_confirmed',
  'payment_failed',
] as const;

// ─── Incoming Webhook Body ──────────────────────────────────────

export interface ElevareWebhookBody {
  event_type: string; // Not narrowed — we must accept unknown types to store for audit
  payload: Record<string, unknown>;
  signature?: string;
  eventId?: string; // Optional — Elevare-provided idempotency key (preferred over hash)
}

// ─── Per-Event Payload Shapes ───────────────────────────────────

export interface QuoteCreatedPayload {
  quotationId: string;
  customerId: string;
  offerId: number;
  paymentLink: string;
  expiresAt: string;
}

export interface QuoteExpiringPayload {
  quotationId: string;
  expiresAt: string;
  hoursRemaining: number;
}

export interface ReservationConfirmedPayload {
  quotationId: string;
  reservationId: string;
  hotelName: string;
  checkIn: string;
  checkOut: string;
  totalAmount: number;
}

export interface PaymentFailedPayload {
  quotationId: string;
  failureReason: string;
  attemptNumber: number;
}

/**
 * Discriminated union of all supported Elevare webhook payloads.
 * Narrow via the parent `event_type` (carried on `ElevareWebhookBody`).
 */
export type ElevareWebhookPayload =
  | QuoteCreatedPayload
  | QuoteExpiringPayload
  | ReservationConfirmedPayload
  | PaymentFailedPayload;

// ─── Follow-Up Data (Persona Agent Input) ───────────────────────

export interface QuoteCreatedData {
  eventType: 'quote_created';
  quotationId: string;
}

export interface QuoteExpiringData {
  eventType: 'quote_expiring';
  quotationId: string;
  expiresAt: string;
  hotelName: string;
  guestName: string;
}

export interface ReservationConfirmedData {
  eventType: 'reservation_confirmed';
  quotationId: string;
  reservationId: string;
  hotelName: string;
  checkIn: string;
  checkOut: string;
  guestName: string;
}

export interface PaymentFailedData {
  eventType: 'payment_failed';
  quotationId: string;
  failureReason: string;
  newPaymentLink: string | null; // Null when regeneration failed — Persona crafts fallback prose
  guestName: string;
}

/**
 * Discriminated union passed to Persona Agent via `toolResults.webhookFollowUp`.
 * The Persona Agent is responsible for ALL prose generation — never include
 * raw text here.
 */
export type FollowUpData =
  | QuoteCreatedData
  | QuoteExpiringData
  | ReservationConfirmedData
  | PaymentFailedData;

// ─── Processing Result ──────────────────────────────────────────

export type WebhookProcessingStatus =
  | 'processed'
  | 'failed'
  | 'duplicate'
  | 'skipped';

export interface WebhookProcessingResult {
  eventId: string;
  status: WebhookProcessingStatus;
  followUpSent: boolean;
  error?: string;
}

// ─── Guest Context (resolved from quotationId) ─────────────────

export interface GuestContext {
  sessionId: string;
  guestId: string | null;
  guestName: string | undefined;
  language: 'pt' | 'en' | 'es';
}
