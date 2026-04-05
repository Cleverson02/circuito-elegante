/**
 * Drizzle ORM operations for `webhook_events` table.
 *
 * Story 3.7 — Webhook Listener & Auto-Follow-Up (FR25)
 *
 * **APPEND-ONLY INVARIANT:** The `payload` column is NEVER updated after
 * INSERT. Only `status`, `processedAt`, `errorMessage`, and `sessionId`/
 * `guestId` (on late resolution) may be updated. This preserves the audit
 * trail integrity required by AC5/AC7.
 */

import { desc, eq, sql } from 'drizzle-orm';
import { getDatabase } from '../database/client.js';
import { webhookEvents } from '../database/schema.js';

// ─── Types ──────────────────────────────────────────────────────

export type WebhookEventStatus = 'received' | 'processing' | 'processed' | 'failed';

export interface InsertWebhookEventInput {
  source: string;
  eventType: string;
  payload: Record<string, unknown>;
  sessionId: string | null;
  guestId: string | null;
}

export interface HistoricalWebhookEvent {
  id: string;
  sessionId: string | null;
  guestId: string | null;
  payload: unknown;
}

// ─── insertWebhookEvent (AC5) ───────────────────────────────────

export async function insertWebhookEvent(
  data: InsertWebhookEventInput,
): Promise<string> {
  const db = getDatabase();
  const rows = await db
    .insert(webhookEvents)
    .values({
      source: data.source,
      eventType: data.eventType,
      payload: data.payload,
      sessionId: data.sessionId,
      guestId: data.guestId,
      status: 'received',
    })
    .returning({ id: webhookEvents.id });

  const row = rows[0];
  if (!row) {
    throw new Error('insertWebhookEvent: INSERT returned no rows');
  }
  return row.id;
}

// ─── updateWebhookEventStatus (AC7) ─────────────────────────────

/**
 * Updates ONLY the mutable columns. The `payload` column MUST NEVER be
 * touched after INSERT — audit trail integrity depends on this.
 */
export async function updateWebhookEventStatus(
  id: string,
  status: WebhookEventStatus,
  errorMessage?: string,
): Promise<void> {
  const db = getDatabase();
  const updateData: {
    status: WebhookEventStatus;
    processedAt: Date;
    errorMessage?: string;
  } = {
    status,
    processedAt: new Date(),
  };
  if (errorMessage !== undefined) {
    updateData.errorMessage = errorMessage;
  }

  await db
    .update(webhookEvents)
    .set(updateData)
    .where(eq(webhookEvents.id, id));
}

// ─── updateWebhookEventContext ──────────────────────────────────

/**
 * Late-binds `sessionId` and `guestId` once the guest has been resolved
 * during processing. Payload is NEVER modified.
 */
export async function updateWebhookEventContext(
  id: string,
  sessionId: string | null,
  guestId: string | null,
): Promise<void> {
  const db = getDatabase();
  await db
    .update(webhookEvents)
    .set({ sessionId, guestId })
    .where(eq(webhookEvents.id, id));
}

// ─── findHistoricalEventByQuotationId (AC12 fallback) ──────────

/**
 * Searches historical `webhook_events` for any record whose payload
 * contains the given `quotationId`. Returns the most recent match that
 * has a resolved `sessionId`.
 *
 * Uses `payload->>'quotationId'` (PostgreSQL JSONB text extraction).
 */
export async function findHistoricalEventByQuotationId(
  quotationId: string,
): Promise<HistoricalWebhookEvent | null> {
  const db = getDatabase();
  const rows = await db
    .select({
      id: webhookEvents.id,
      sessionId: webhookEvents.sessionId,
      guestId: webhookEvents.guestId,
      payload: webhookEvents.payload,
    })
    .from(webhookEvents)
    .where(sql`${webhookEvents.payload}->>'quotationId' = ${quotationId}`)
    .orderBy(desc(webhookEvents.createdAt))
    .limit(10);

  // Prefer events that already have a resolved sessionId
  const resolved = rows.find((r) => r.sessionId !== null);
  if (resolved) {
    return {
      id: resolved.id,
      sessionId: resolved.sessionId,
      guestId: resolved.guestId,
      payload: resolved.payload,
    };
  }
  return null;
}
