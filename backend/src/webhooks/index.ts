// Elevare Webhook Listener — Public API
// Barrel export for backend/src/webhooks/

export {
  registerElevareWebhookRoute,
  handleWebhookRequest,
  validateWebhookSignature,
  computeWebhookHash,
  checkWebhookRateLimit,
  type WebhookHandlerDeps,
} from './elevare-handler.js';

export {
  processWebhookEvent,
  resolveGuestContext,
  configureProcessorDeps,
  type ProcessorDeps,
} from './elevare-processor.js';

export {
  insertWebhookEvent,
  updateWebhookEventStatus,
  updateWebhookEventContext,
  findHistoricalEventByQuotationId,
  type WebhookEventStatus,
  type InsertWebhookEventInput,
  type HistoricalWebhookEvent,
} from './elevare-repository.js';

export type {
  ElevareEventType,
  ElevareWebhookBody,
  ElevareWebhookPayload,
  QuoteCreatedPayload,
  QuoteExpiringPayload,
  ReservationConfirmedPayload,
  PaymentFailedPayload,
  FollowUpData,
  QuoteCreatedData,
  QuoteExpiringData,
  ReservationConfirmedData,
  PaymentFailedData,
  WebhookProcessingResult,
  WebhookProcessingStatus,
  GuestContext,
} from './types.js';

export { SUPPORTED_EVENT_TYPES } from './types.js';
