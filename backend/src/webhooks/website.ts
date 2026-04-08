/**
 * Website WebSocket Handler — Chat widget connection endpoint.
 *
 * Story 4.6 — Chat Widget Website (FR12)
 *
 * Handles WebSocket connections from the website chat widget.
 * Messages bypass the 20s buffer (website = immediate response)
 * and go directly to the agent pipeline.
 *
 * [Source: architecture.md#section-9.1]
 */

import type { FastifyInstance } from 'fastify';
import { randomUUID } from 'crypto';
import { getWebSocketManager } from '../websocket/manager.js';
import { processMessage } from '../agents/pipeline.js';
import { chunkResponse, enqueueResponse, getTypingQueue } from '../queue/index.js';
import { renderCuratedOptions } from '../services/media-renderer.js';
import { sanitizeInput } from '../middleware/sanitize.js';
import { logger } from '../middleware/logging.js';
import { isWithinBusinessHours, registerOutOfHoursLead, OUT_OF_HOURS_MESSAGE_WEBSITE } from '../services/business-hours.js';

// ─── Constants ──────────────────────────────────────────────────

const WELCOME_MESSAGE = 'Ola! Sou a Stella, concierge digital do Circuito Elegante. Como posso ajudar?';

// ─── Types ──────────────────────────────────────────────────────

interface ClientMessage {
  type: string;
  text: string;
}

// ─── Validation ─────────────────────────────────────────────────

function isValidClientMessage(data: unknown): data is ClientMessage {
  if (typeof data !== 'object' || data === null) return false;
  const obj = data as Record<string, unknown>;
  return obj.type === 'message' && typeof obj.text === 'string' && obj.text.trim().length > 0;
}

// ─── Route Registration ─────────────────────────────────────────

export async function registerWebSocketRoute(app: FastifyInstance): Promise<void> {
  app.get('/ws/chat', { websocket: true }, (socket, _req) => {
    const sessionId = randomUUID();
    const wsManager = getWebSocketManager();

    // Register connection
    wsManager.register(sessionId, socket);

    // Send welcome message (AC3)
    socket.send(JSON.stringify({
      type: 'welcome',
      sessionId,
      message: WELCOME_MESSAGE,
    }));

    // Handle incoming messages
    socket.on('message', async (raw: Buffer | string) => {
      let parsed: unknown;
      try {
        parsed = JSON.parse(typeof raw === 'string' ? raw : raw.toString('utf-8'));
      } catch {
        socket.send(JSON.stringify({ type: 'error', message: 'Formato invalido' }));
        return;
      }

      // Validate format (AC4)
      if (!isValidClientMessage(parsed)) {
        socket.send(JSON.stringify({ type: 'error', message: 'Formato invalido' }));
        return;
      }

      logger.info('websocket_message_received', {
        event: 'websocket_message_received',
        sessionId,
        textLength: parsed.text.length,
      });

      try {
        // Story 4.7 (AC3/AC5): Business hours guard
        if (!isWithinBusinessHours()) {
          logger.info('out_of_hours_intercepted', {
            event: 'out_of_hours_intercepted',
            phone: sessionId,
            channel: 'website',
            sessionId,
            currentHourBRT: new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo', hour: 'numeric', hour12: false }),
            message: parsed.text.slice(0, 100),
          });

          wsManager.send(sessionId, { type: 'message', text: OUT_OF_HOURS_MESSAGE_WEBSITE, chunkIndex: 0, totalChunks: 1 });
          await registerOutOfHoursLead(sessionId, parsed.text, 'website', sessionId);
          return;
        }

        // Sanitize input
        const sanitized = sanitizeInput(parsed.text);

        // Process directly via pipeline — no 20s buffer (AC5)
        const result = await processMessage({
          message: sanitized.sanitized,
          sessionId,
        });

        // Deliver response via typing queue (AC6)
        const queue = getTypingQueue();
        if (queue) {
          const chunks = result.curatedOptions && result.curatedOptions.length > 0
            ? renderCuratedOptions(result.curatedOptions, sessionId, sessionId, 'website')
            : chunkResponse(result.response);
          await enqueueResponse(sessionId, sessionId, chunks, 'website');
        } else {
          // Fallback: send directly via WebSocket
          wsManager.send(sessionId, {
            type: 'message',
            text: result.response,
            chunkIndex: 0,
            totalChunks: 1,
          });
        }
      } catch (error) {
        logger.error('websocket_processing_error', {
          event: 'websocket_processing_error',
          sessionId,
          error: error instanceof Error ? error.message : String(error),
        });

        wsManager.send(sessionId, {
          type: 'error',
          message: 'Desculpe, tive uma dificuldade momentanea. Poderia repetir?',
        });
      }
    });

    // Handle disconnect
    socket.on('close', () => {
      wsManager.remove(sessionId);
    });
  });
}
