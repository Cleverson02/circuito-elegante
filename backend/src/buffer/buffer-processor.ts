/**
 * BufferProcessor — Connects the 20s message buffer to the agent pipeline.
 *
 * Story 4.2 — Buffer de Concatenacao (FR12, FR34, FR35)
 *
 * After the buffer consolidates "chopped" messages, this processor:
 * 1. Resolves sessionId from phone number
 * 2. Marks messages as read (FR34 — deferred read receipts)
 * 3. Sets presence "online" (FR35 — dynamic presence)
 * 4. Sanitizes consolidated text (anti-injection)
 * 5. Invokes the agent pipeline
 * 6. Delivers the response via Evolution API
 * 7. Sets presence "offline" (FR35)
 *
 * [Source: docs/architecture/architecture.md#section-7.1]
 */

import type { Logger } from 'winston';
import type { EvolutionClient } from '../integrations/evolution/client.js';
import type { OnFlushCallback } from './message-buffer.js';
import { markAsReadDeferred, setPresenceOnline, setPresenceOffline } from '../integrations/evolution/presence.js';
import { processMessage } from '../agents/pipeline.js';
import { getSession, setSession, type SessionData } from '../state/session-manager.js';
import { sanitizeInput } from '../middleware/sanitize.js';
import { chunkResponse, enqueueResponse, getTypingQueue } from '../queue/index.js';
import { renderCuratedOptions } from '../services/media-renderer.js';
import { resolveCoreference } from '../services/coreference.js';
import { isWithinBusinessHours, registerOutOfHoursLead, OUT_OF_HOURS_MESSAGE_WHATSAPP } from '../services/business-hours.js';

// ─── Constants ──────────────────────────────────────────────────

const FALLBACK_MESSAGE =
  'Desculpe, tive uma dificuldade momentânea. Poderia repetir?';

// ─── Types ──────────────────────────────────────────────────────

export interface BufferProcessorDeps {
  evolutionClient: EvolutionClient;
  logger: Logger;
}

// ─── Session Resolution (AC5) ───────────────────────────────────

/**
 * Derive sessionId from E.164 phone number.
 * "+5521999999999" → "5521999999999"
 */
function phoneToSessionId(phone: string): string {
  return phone.replace('+', '');
}

/**
 * Reconstruct WhatsApp JID from E.164 phone for Evolution API calls.
 * "+5521999999999" → "5521999999999@s.whatsapp.net"
 */
function phoneToJid(phone: string): string {
  return `${phone.replace('+', '')}@s.whatsapp.net`;
}

// ─── Factory ────────────────────────────────────────────────────

/**
 * Creates the onFlush callback that the MessageBuffer invokes after
 * 20s of silence. Wires together: session → read receipts → presence →
 * sanitize → pipeline → response delivery → presence off.
 */
export function createBufferProcessor(deps: BufferProcessorDeps): OnFlushCallback {
  const { evolutionClient, logger } = deps;

  return async (phone: string, consolidated: string, messageIds: string[], quotedMessageId?: string): Promise<void> => {
    const sessionId = phoneToSessionId(phone);
    const remoteJid = phoneToJid(phone);
    const startTime = Date.now();

    try {
      // Step 1: Resolve or create session (AC5)
      let session = await getSession(sessionId);
      if (!session) {
        const now = new Date().toISOString();
        const newSession: SessionData = {
          hotelId: '',
          guestPhone: phone,
          language: 'pt',
          createdAt: now,
          updatedAt: now,
        };
        await setSession(sessionId, newSession);
        session = newSession;
        logger.info('buffer_session_created', { sessionId, phone });
      }

      // Step 2: Mark messages as read — FR34 deferred read receipts (AC4)
      for (const messageId of messageIds) {
        await markAsReadDeferred(evolutionClient, remoteJid, messageId, logger);
      }

      // Step 3: Set presence online — FR35 (AC4)
      await setPresenceOnline(evolutionClient, logger);

      // Story 4.7 (AC3): Business hours guard — intercept before pipeline
      if (!isWithinBusinessHours()) {
        const currentHour = new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo', hour: 'numeric', hour12: false });
        logger.info('out_of_hours_intercepted', {
          event: 'out_of_hours_intercepted',
          phone,
          channel: 'whatsapp',
          sessionId,
          currentHourBRT: currentHour,
          message: consolidated.slice(0, 100),
        });

        await evolutionClient.sendText(phone, OUT_OF_HOURS_MESSAGE_WHATSAPP);
        await registerOutOfHoursLead(phone, consolidated, 'whatsapp', sessionId);

        const latencyMs = Date.now() - startTime;
        logger.info('buffer_pipeline_complete', { sessionId, latencyMs, intent: 'out_of_hours', messageCount: messageIds.length, safetyApproved: true });
        return;
      }

      // Step 4: Sanitize consolidated text (SF-1 fix — anti-injection)
      const sanitized = sanitizeInput(consolidated);

      // Story 4.5 (AC6/AC7/AC8): Resolve coreference via WhatsApp Reply
      if (quotedMessageId) {
        const corefResult = await resolveCoreference(sessionId, { whatsappMessageId: quotedMessageId });

        if (corefResult.resolved) {
          logger.info('coreference_reply_resolved', {
            event: 'coreference_reply_resolved',
            sessionId,
            quotedMessageId,
            resolvedOfferId: corefResult.option.offerId,
            curatedPosition: corefResult.option.position,
          });

          // Enrich pipeline input with resolved offer (AC7)
          const result = await processMessage({
            message: sanitized.sanitized,
            sessionId,
            resolvedOfferId: corefResult.option.offerId,
            resolvedOption: corefResult.option,
            selectionMethod: 'whatsapp_reply',
          });

          // Deliver response (same logic as normal flow)
          const queue = getTypingQueue();
          if (queue) {
            try {
              const chunks = result.curatedOptions && result.curatedOptions.length > 0
                ? renderCuratedOptions(result.curatedOptions, phone, sessionId, 'whatsapp')
                : chunkResponse(result.response);
              await enqueueResponse(sessionId, phone, chunks, 'whatsapp');
            } catch (queueErr) {
              logger.warn('typing_queue_enqueue_failed_fallback_direct', {
                sessionId,
                phone,
                error: queueErr instanceof Error ? queueErr.message : String(queueErr),
              });
              await evolutionClient.sendText(phone, result.response);
            }
          } else {
            await evolutionClient.sendText(phone, result.response);
          }

          const latencyMs = Date.now() - startTime;
          logger.info('buffer_pipeline_complete', {
            sessionId,
            latencyMs,
            intent: result.intent?.intent,
            messageCount: messageIds.length,
            safetyApproved: result.safetyApproved,
            selectionMethod: 'whatsapp_reply',
          });
          return;
        }

        // AC8: Fallback — messageId not found, proceed with normal text flow
        logger.info('coreference_reply_fallback', {
          event: 'coreference_reply_fallback',
          sessionId,
          quotedMessageId,
          reason: corefResult.mapExpired ? 'map_expired' : 'message_id_not_found',
        });
      }

      // Step 5: Invoke agent pipeline (AC4)
      const result = await processMessage({
        message: sanitized.sanitized,
        sessionId,
      });

      // Step 6: Deliver response via typing simulation queue (Story 4.3, AC11)
      // Story 4.4: When curated options are present, render as image+caption chunks.
      // Falls back to direct send if queue is unavailable.
      const queue = getTypingQueue();
      if (queue) {
        try {
          // Story 4.4 (AC10): Premium rendering for curated options
          const chunks = result.curatedOptions && result.curatedOptions.length > 0
            ? renderCuratedOptions(result.curatedOptions, phone, sessionId, 'whatsapp')
            : chunkResponse(result.response);
          await enqueueResponse(sessionId, phone, chunks, 'whatsapp');
        } catch (queueErr) {
          logger.warn('typing_queue_enqueue_failed_fallback_direct', {
            sessionId,
            phone,
            error: queueErr instanceof Error ? queueErr.message : String(queueErr),
          });
          await evolutionClient.sendText(phone, result.response);
        }
      } else {
        // Queue not initialized — direct send as fallback
        await evolutionClient.sendText(phone, result.response);
      }

      const latencyMs = Date.now() - startTime;
      logger.info('buffer_pipeline_complete', {
        sessionId,
        latencyMs,
        intent: result.intent?.intent,
        messageCount: messageIds.length,
        safetyApproved: result.safetyApproved,
      });
    } catch (error) {
      // AC10: Error does NOT crash — fallback message + log
      logger.error('buffer_processing_error', {
        sessionId,
        phone,
        messageCount: messageIds.length,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });

      try {
        await evolutionClient.sendText(phone, FALLBACK_MESSAGE);
      } catch (sendError) {
        logger.error('buffer_fallback_send_failed', {
          phone,
          error: sendError instanceof Error ? sendError.message : String(sendError),
        });
      }
    } finally {
      // Step 7: Set presence offline — FR35 (always, even on error)
      await setPresenceOffline(evolutionClient, logger);
    }
  };
}
