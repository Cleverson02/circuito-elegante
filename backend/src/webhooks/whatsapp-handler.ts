/**
 * POST /webhook/whatsapp — Fastify route handler for Evolution API events.
 *
 * Story 4.1 — WhatsApp Business API — Recepcao de Mensagens
 *
 * Responsibilities:
 * 1. HMAC-SHA256 signature validation (timing-safe, fail-closed).
 * 2. Idempotency via messageId (Redis SET NX EX, 1h TTL).
 * 3. Per-phone rate limiting (30/min).
 * 4. APPEND-ONLY persistence in `webhook_events` table.
 * 5. Immediate 200 OK acknowledgement, async processing.
 * 6. Structured logging for every received message.
 *
 * Non-responsibilities:
 * - 20s buffer consolidation (Story 4.2)
 * - Message pipeline processing (exists, connected via 4.2)
 * - Read receipts / presence changes (deferred, FR34/FR35)
 *
 * Follows the same structural pattern as elevare-handler.ts (Story 3.7).
 */

import { createHmac, timingSafeEqual } from 'node:crypto';
import { randomUUID } from 'node:crypto';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import type { Logger } from 'winston';
import type { Redis } from 'ioredis';
import type { EvolutionWebhookPayload, EvolutionMessageData, ParsedMessage } from '../integrations/evolution/types.js';
import type { MessageBuffer } from '../buffer/message-buffer.js';
import { EVOLUTION_REDIS_KEYS, EVOLUTION_REDIS_TTL } from '../integrations/evolution/types.js';
import { insertWebhookEvent } from './elevare-repository.js';
import {
  isMessageEvent,
  isConnectionEvent,
  parseEvolutionMessage,
  extractPhoneFromJid,
  WHATSAPP_EVENT_TYPES,
} from './whatsapp-types.js';

// ─── Configuration ──────────────────────────────────────────────

const WEBHOOK_SOURCE = 'evolution';
const WEBHOOK_ROUTE = '/webhook/whatsapp';
const SIGNATURE_HEADER = 'x-evolution-signature';
const RATE_LIMIT_PER_MINUTE = 30;
const RATE_LIMIT_BURST = 5;      // per 10 seconds
const BURST_WINDOW_SECONDS = 10;

// ─── Dependencies (injected) ────────────────────────────────────

export interface WhatsAppWebhookDeps {
  redis: Redis;
  logger: Logger;
  webhookSecret: string | undefined;
  buffer?: MessageBuffer;
}

// ─── HMAC Signature Validation (AC5) ────────────────────────────

export function validateEvolutionSignature(
  rawBody: string,
  signature: string,
  secret: string,
): boolean {
  if (typeof signature !== 'string' || signature.length === 0) {
    return false;
  }

  let computed: string;
  try {
    computed = createHmac('sha256', secret).update(rawBody, 'utf8').digest('hex');
  } catch {
    return false;
  }

  const sigBuffer = Buffer.from(signature, 'utf8');
  const computedBuffer = Buffer.from(computed, 'utf8');

  if (sigBuffer.length !== computedBuffer.length) {
    return false;
  }

  return timingSafeEqual(sigBuffer, computedBuffer);
}

// ─── Rate Limiting (AC12) ───────────────────────────────────────

async function checkPhoneRateLimit(
  redis: Redis,
  logger: Logger,
  phone: string,
): Promise<boolean> {
  const key = EVOLUTION_REDIS_KEYS.rateLimit(phone);
  try {
    const count = await redis.incr(key);
    if (count === 1) {
      await redis.expire(key, EVOLUTION_REDIS_TTL.rateLimit);
    }
    return count <= RATE_LIMIT_PER_MINUTE;
  } catch (err) {
    logger.warn('whatsapp_rate_limit_check_failed', {
      phone,
      error: err instanceof Error ? err.message : String(err),
    });
    return true; // fail-open
  }
}

// ─── Idempotency Check (AC14) ──────────────────────────────────

async function checkAndMarkDedup(
  redis: Redis,
  messageId: string,
): Promise<boolean> {
  const key = EVOLUTION_REDIS_KEYS.messageDedup(messageId);
  const result = await redis.set(
    key,
    '1',
    'EX',
    EVOLUTION_REDIS_TTL.messageDedup,
    'NX',
  );
  // result === null means key already existed → duplicate
  return result === null;
}

// ─── Route Registration (AC4, AC17) ─────────────────────────────

export async function registerWhatsAppWebhookRoute(
  app: FastifyInstance,
  deps: WhatsAppWebhookDeps,
): Promise<void> {
  // Ensure raw-body preservation for HMAC validation
  const existingParser = app.hasContentTypeParser('application/json');
  if (!existingParser) {
    app.addContentTypeParser(
      'application/json',
      { parseAs: 'string' },
      (_req: FastifyRequest, body: string | Buffer, done) => {
        const bodyStr = typeof body === 'string' ? body : body.toString('utf8');
        try {
          const parsed = JSON.parse(bodyStr) as unknown;
          (_req as FastifyRequest & { rawBody: string }).rawBody = bodyStr;
          done(null, parsed);
        } catch (err) {
          done(err as Error, undefined);
        }
      },
    );
  }

  app.post(WEBHOOK_ROUTE, async (request: FastifyRequest, reply: FastifyReply) => {
    return handleWhatsAppWebhook(request, reply, deps);
  });
}

// ─── Handler Core (exported for tests) ──────────────────────────

export async function handleWhatsAppWebhook(
  request: FastifyRequest,
  reply: FastifyReply,
  deps: WhatsAppWebhookDeps,
): Promise<FastifyReply> {
  const { redis, logger, webhookSecret } = deps;
  const correlationId = randomUUID();

  // AC5: fail-closed if secret missing
  if (!webhookSecret || webhookSecret.length === 0) {
    logger.warn('whatsapp_webhook_secret_not_configured');
    return reply.status(503).send({
      error: 'Service Unavailable',
      message: 'Webhook secret not configured',
    });
  }

  // Validate payload structure
  const body = request.body as EvolutionWebhookPayload | undefined;
  if (!body || typeof body.event !== 'string') {
    logger.warn('whatsapp_webhook_body_malformed', { correlationId });
    return reply.status(400).send({
      error: 'Bad Request',
      message: 'Missing or invalid event / data',
    });
  }

  // AC5: HMAC signature validation
  const signatureHeader = request.headers[SIGNATURE_HEADER];
  const signature = Array.isArray(signatureHeader) ? signatureHeader[0] : signatureHeader;

  const rawBody = (request as FastifyRequest & { rawBody?: string }).rawBody
    ?? (typeof request.body === 'string' ? request.body : JSON.stringify(request.body));

  if (!signature || !validateEvolutionSignature(rawBody, signature, webhookSecret)) {
    logger.warn('whatsapp_webhook_signature_invalid', {
      correlationId,
      event: body.event,
    });
    return reply.status(401).send({ error: 'Unauthorized', message: 'Invalid signature' });
  }

  const eventType = body.event;

  // ─── connection.update (AC15) ──────────────────────────────
  if (isConnectionEvent(body)) {
    const state = body.data.state;
    if (state !== 'open') {
      logger.warn('whatsapp_connection_status', {
        correlationId,
        state,
        statusReason: body.data.statusReason,
      });
    } else {
      logger.info('whatsapp_connection_status', { correlationId, state });
    }
    return reply.status(200).send({ status: 'received' });
  }

  // ─── messages.update (status updates — delivery, read) ─────
  if (eventType === 'messages.update') {
    logger.info('whatsapp_message_status_update', {
      correlationId,
      event: eventType,
    });
    return reply.status(200).send({ status: 'received' });
  }

  // ─── messages.upsert (new message — primary flow) ──────────
  if (!isMessageEvent(body)) {
    logger.warn('whatsapp_webhook_unknown_event', {
      correlationId,
      event: eventType,
    });
    return reply.status(200).send({ status: 'received_unknown' });
  }

  const messageData: EvolutionMessageData = body.data;
  const messageId = messageData.key.id;
  const phone = extractPhoneFromJid(messageData.key.remoteJid);

  // Skip messages from us (fromMe)
  if (messageData.key.fromMe) {
    return reply.status(200).send({ status: 'received' });
  }

  // AC14: Idempotency check
  try {
    const isDuplicate = await checkAndMarkDedup(redis, messageId);
    if (isDuplicate) {
      logger.info('whatsapp_message_duplicate', {
        correlationId,
        messageId,
        phone,
      });
      return reply.status(200).send({ status: 'duplicate' });
    }
  } catch (err) {
    // Fail-open on Redis errors — process the message
    logger.warn('whatsapp_dedup_check_failed', {
      correlationId,
      error: err instanceof Error ? err.message : String(err),
    });
  }

  // AC12: Rate limiting per phone
  if (phone) {
    const allowed = await checkPhoneRateLimit(redis, logger, phone);
    if (!allowed) {
      logger.warn('whatsapp_rate_limit_exceeded', {
        correlationId,
        phone,
        limit: RATE_LIMIT_PER_MINUTE,
      });
      return reply.status(429).send({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded',
      });
    }
  }

  // Parse message into normalised format
  const parsed = parseEvolutionMessage(messageData);
  if (!parsed) {
    logger.warn('whatsapp_message_unsupported_type', {
      correlationId,
      messageType: messageData.messageType,
      messageId,
    });
    // Still store the event but skip further processing
  }

  // AC10: Store in webhook_events (reuse existing repository)
  try {
    await insertWebhookEvent({
      source: WEBHOOK_SOURCE,
      eventType,
      payload: body.data as unknown as Record<string, unknown>,
      sessionId: null,   // resolved during pipeline processing
      guestId: null,
    });
  } catch (err) {
    logger.error('whatsapp_webhook_insert_failed', {
      correlationId,
      messageId,
      error: err instanceof Error ? err.message : String(err),
    });
    return reply.status(500).send({
      error: 'Internal Server Error',
      message: 'Failed to persist webhook event',
    });
  }

  // Story 4.2 (AC6): Feed parsed message into the 20s buffer
  if (parsed && deps.buffer) {
    deps.buffer.add(parsed.phone, parsed);
  }

  // AC11: Structured log for every received message
  logger.info('whatsapp_message_received', {
    correlationId,
    event: 'whatsapp_message_received',
    source: 'evolution',
    eventType,
    phoneNumber: phone,
    sessionId: null, // resolved by buffer (Story 4.2)
    channel: 'whatsapp',
    mediaType: parsed?.type ?? 'unknown',
    messageId,
    timestamp: messageData.messageTimestamp,
  });

  // AC4: Return 200 OK immediately. Message will be consumed by
  // the 20s buffer (Story 4.2) for consolidation before pipeline.
  return reply.status(200).send({
    status: 'received',
    messageId,
  });
}
