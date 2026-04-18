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
import { InputGuardrailTripwireTriggered } from '@openai/agents';
import { processMessage } from '../agents/pipeline.js';
import { logger } from '../middleware/logging.js';
import { sanitizeInput } from '../middleware/sanitize.js';

// Polite redirect when a guardrail blocks the request (off-topic or injection attempt).
// Stella remains in character rather than exposing a raw error.
const GUARDRAIL_REDIRECT =
  'Agradeço o contato! Como concierge do Circuito Elegante, minha especialidade são as experiências nos nossos hotéis boutique pelo Brasil — hospedagem, destinos, amenidades, reservas e cotações. Em que posso te ajudar dentro desse universo?';

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
      // Guardrail tripwire → polite redirect, stay in character
      if (error instanceof InputGuardrailTripwireTriggered) {
        const latencyMs = Date.now() - startTime;
        const guardrailName = error.result?.guardrail?.name;
        logger.info('chat_guardrail_redirect', {
          sessionId,
          guardrail: guardrailName,
          latencyMs,
        });
        return reply.status(200).send({
          reply: GUARDRAIL_REDIRECT,
          sessionId,
          meta: {
            intent: 'GUARDRAIL_BLOCKED',
            safetyApproved: false,
            guardrailTripped: true,
            guardrailName,
            latencyMs,
            injectionDetected: sanitized.injection.isInjection,
          },
        });
      }

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
