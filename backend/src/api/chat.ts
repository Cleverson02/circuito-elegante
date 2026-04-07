/**
 * Chat endpoint for testing Stella pipeline.
 * POST /api/v1/chat — send a message and get Stella's response.
 *
 * This endpoint allows interactive testing of the full pipeline:
 * Intent → Orchestrator → Persona → Safety → Response.
 *
 * Use sessionId to maintain conversation context across messages.
 */

import type { FastifyInstance } from 'fastify';
import { processMessage } from '../agents/pipeline.js';
import { validateResponse } from '../agents/safety-agent.js';
import { logger } from '../middleware/logging.js';
import { sanitizeInput } from '../middleware/sanitize.js';

interface ChatRequest {
  message: string;
  sessionId?: string;
  guestName?: string;
  debug?: boolean;
}

export async function registerChatRoute(app: FastifyInstance): Promise<void> {
  app.post<{ Body: ChatRequest }>('/api/v1/chat', async (request, reply) => {
    const { message, guestName } = request.body;
    const sessionId = request.body.sessionId || crypto.randomUUID();

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return reply.status(400).send({
        error: 'Message is required',
        example: { message: 'Olá, quero um hotel na serra gaúcha', sessionId: 'optional-id' },
      });
    }

    const sanitized = sanitizeInput(message);

    const startTime = Date.now();

    try {
      const result = await processMessage({
        message: sanitized.sanitized,
        sessionId,
        sessionContext: {
          guestName: guestName || undefined,
        },
      });

      const latencyMs = Date.now() - startTime;

      logger.info('chat_response', {
        sessionId,
        intent: result.intent.intent,
        confidence: result.intent.confidence,
        language: result.intent.language,
        multiIntent: result.multiIntent,
        safetyApproved: result.safetyApproved,
        latencyMs,
        hotelFocus: result.hotelFocus,
      });

      return reply.send({
        reply: result.response,
        sessionId,
        meta: {
          intent: result.intent.intent,
          subIntents: result.intent.subIntents,
          confidence: result.intent.confidence,
          language: result.intent.language,
          safetyApproved: result.safetyApproved,
          multiIntent: result.multiIntent,
          hotelFocus: result.hotelFocus,
          latencyMs,
          injectionDetected: sanitized.injection.isInjection,
        },
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      logger.error('chat_error', {
        sessionId,
        error: errorMsg,
        stack: errorStack,
      });

      return reply.status(500).send({
        reply: 'Desculpe, estou com uma dificuldade momentânea. Poderia tentar novamente em alguns instantes?',
        sessionId,
        meta: { error: true, debug: errorMsg },
      });
    }
  });
}
