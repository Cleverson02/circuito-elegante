/**
 * Evolution API — Convenience wrappers for Presence & Read Receipts.
 *
 * Story 4.1 — FR34 (Read Receipts Inteligentes), FR35 (Presenca Online Dinamica)
 *
 * These wrappers add error handling + logging around the raw client methods.
 * They are the public API that other stories (4.2, 4.3) should import.
 */

import type { Logger } from 'winston';
import type { EvolutionClient } from './client.js';

/**
 * Mark a message as read — DEFERRED call.
 *
 * FR34: Must be called AFTER the 20s buffer consolidation (Story 4.2),
 * NOT on message receipt. This prevents the "luxury vacuum" where the
 * guest sees the message was read but gets no response for 20+ seconds.
 *
 * @param client - EvolutionClient instance
 * @param remoteJid - Full WhatsApp JID (e.g., '5521999999999@s.whatsapp.net')
 * @param messageId - The message ID to mark as read
 * @param logger - Logger instance
 */
export async function markAsReadDeferred(
  client: EvolutionClient,
  remoteJid: string,
  messageId: string,
  logger: Logger,
): Promise<void> {
  try {
    await client.markAsRead(remoteJid, messageId);
    logger.info('evolution_mark_as_read', { remoteJid, messageId });
  } catch (error) {
    // Non-fatal: failing to mark as read should not break the pipeline
    logger.warn('evolution_mark_as_read_failed', {
      remoteJid,
      messageId,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Set Stella's WhatsApp presence to "Online".
 *
 * FR35: Called when pipeline starts processing a message.
 * Stella appears human — online only during active processing.
 */
export async function setPresenceOnline(
  client: EvolutionClient,
  logger: Logger,
): Promise<void> {
  try {
    await client.updatePresence('available');
    logger.info('evolution_presence_online');
  } catch (error) {
    logger.warn('evolution_presence_update_failed', {
      targetStatus: 'available',
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Set Stella's WhatsApp presence to "Offline".
 *
 * FR35: Called when pipeline finishes processing.
 * Default state — Stella appears offline when not actively engaged.
 */
export async function setPresenceOffline(
  client: EvolutionClient,
  logger: Logger,
): Promise<void> {
  try {
    await client.updatePresence('unavailable');
    logger.info('evolution_presence_offline');
  } catch (error) {
    logger.warn('evolution_presence_update_failed', {
      targetStatus: 'unavailable',
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
