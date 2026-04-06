/**
 * Session Snapshot Persistence — Story 2.7 (AC6).
 *
 * Saves session context to the `conversations` table in PostgreSQL.
 * Called async (fire-and-forget) after each pipeline interaction so that
 * when the Redis key expires (24h TTL), the data is already persisted.
 */

import { eq } from 'drizzle-orm';
import { getDatabase } from '../database/client.js';
import { conversations } from '../database/schema.js';
import type { SessionContext } from './session-manager.js';
import { logger } from '../middleware/logging.js';

export async function saveSessionSnapshot(
  sessionId: string,
  context: SessionContext | null,
  guestName?: string,
): Promise<void> {
  if (!context) return;

  const db = getDatabase();
  const now = new Date();

  const existing = await db
    .select({ id: conversations.id })
    .from(conversations)
    .where(eq(conversations.sessionId, sessionId))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(conversations)
      .set({
        messages: context.conversationHistory,
        messageCount: context.conversationHistory.length,
        metadata: {
          preferences: context.preferences,
          hotelFocusName: context.hotelFocus,
          guestName: guestName ?? null,
        },
        updatedAt: now,
      })
      .where(eq(conversations.sessionId, sessionId));
  } else {
    await db.insert(conversations).values({
      sessionId,
      userId: sessionId,
      channel: 'whatsapp',
      messages: context.conversationHistory,
      messageCount: context.conversationHistory.length,
      metadata: {
        preferences: context.preferences,
        hotelFocusName: context.hotelFocus,
        guestName: guestName ?? null,
      },
      startedAt: now,
      createdAt: now,
      updatedAt: now,
    });
  }

  logger.info('session_snapshot_saved', {
    sessionId,
    messageCount: context.conversationHistory.length,
    hotelFocus: context.hotelFocus,
  });
}
