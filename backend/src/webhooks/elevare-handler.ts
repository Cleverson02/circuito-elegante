/**
 * POST /webhooks/elevare — Fastify route handler for Elevare transactional events.
 *
 * Story 3.7 — Webhook Listener & Auto-Follow-Up (FR25)
 *
 * Responsibilities:
 * 1. HMAC-SHA256 signature validation (timing-safe, fail-closed).
 * 2. Idempotency via SHA-256 payload hash (Redis dedup, 24h TTL).
 * 3. Per-IP rate limiting (100 req/min).
 * 4. APPEND-ONLY persistence in `webhook_events` table.
 * 5. Immediate 200 OK acknowledgement (<5s), async processing.
 *
 * Non-responsibilities:
 * - Prose generation (delegated to Persona Agent via the processor).
 * - Retry/redelivery (Elevare owns upstream retries).
 */

import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import type { Logger } from 'winston';
import type { Redis } from 'ioredis';
import { REDIS_KEYS, REDIS_TTL } from '../state/keys.js';
import { insertWebhookEvent } from './elevare-repository.js';
import { processWebhookEvent } from './elevare-processor.js';
import {
  SUPPORTED_EVENT_TYPES,
  type ElevareEventType,
  type ElevareWebhookBody,
} from './types.js';

// ─── Configuration ──────────────────────────────────────────────

const WEBHOOK_SOURCE = 'elevare';
const WEBHOOK_ROUTE = '/webhooks/elevare';
const SIGNATURE_HEADER = 'x-elevare-signature';
const WEBHOOK_RATE_LIMIT = 100; // requests per minute per IP

// ─── Dependencies (injected) ────────────────────────────────────

export interface WebhookHandlerDeps {
  redis: Redis;
  logger: Logger;
  webhookSecret: string | undefined;
  /** Optional async trigger — defaults to `setImmediate`. Override in tests. */
  schedule?: (fn: () => void) => void;
}

// ─── HMAC Signature Validation (AC2, AC3) ──────────────────────

/**
 * Computes `HMAC-SHA256(rawBody, secret)` as hex and compares against the
 * provided signature using `crypto.timingSafeEqual` to prevent timing
 * side-channel attacks.
 *
 * Returns `false` on any length mismatch or malformed input — never throws.
 */
export function validateWebhookSignature(
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

// ─── Idempotency Hash (AC6) ─────────────────────────────────────

/**
 * SHA-256 hash of `${source}:${eventType}:${JSON.stringify(payload)}`.
 * Used as the dedup key when Elevare does not provide an `eventId`.
 */
export function computeWebhookHash(
  source: string,
  eventType: string,
  payload: unknown,
): string {
  const data = `${source}:${eventType}:${JSON.stringify(payload)}`;
  return createHash('sha256').update(data, 'utf8').digest('hex');
}

// ─── Rate Limiting (AC13) ───────────────────────────────────────

/**
 * Per-IP rate limit via Redis INCR + EXPIRE (sliding 1-minute window).
 * Returns `true` if the request is allowed, `false` if it exceeds the limit.
 *
 * If Redis is unavailable, fail-open (return true) and log a warning — we
 * never block legitimate webhooks due to infrastructure issues.
 */
export async function checkWebhookRateLimit(
  redis: Redis,
  logger: Logger,
  ip: string,
): Promise<boolean> {
  const key = REDIS_KEYS.webhookRateLimit(ip);
  try {
    const count = await redis.incr(key);
    if (count === 1) {
      await redis.expire(key, REDIS_TTL.webhookRateLimit);
    }
    return count <= WEBHOOK_RATE_LIMIT;
  } catch (err) {
    logger.warn('webhook_rate_limit_check_failed', {
      ip,
      error: err instanceof Error ? err.message : String(err),
    });
    return true;
  }
}

// ─── Body Validation (AC1) ──────────────────────────────────────

interface ValidatedBody {
  eventType: string;
  payload: Record<string, unknown>;
  eventId: string | undefined;
}

function validateBody(body: unknown): ValidatedBody | null {
  if (typeof body !== 'object' || body === null) return null;
  const b = body as Partial<ElevareWebhookBody>;

  if (typeof b.event_type !== 'string' || b.event_type.length === 0) return null;
  if (typeof b.payload !== 'object' || b.payload === null || Array.isArray(b.payload)) {
    return null;
  }

  const eventId = typeof b.eventId === 'string' && b.eventId.length > 0 ? b.eventId : undefined;

  return {
    eventType: b.event_type,
    payload: b.payload,
    eventId,
  };
}

// ─── Dedup Key Selection (AC6) ──────────────────────────────────

function buildDedupKey(
  eventType: string,
  payload: Record<string, unknown>,
  eventId: string | undefined,
): string {
  if (eventId) {
    return REDIS_KEYS.webhookDedup(eventId);
  }
  const hash = computeWebhookHash(WEBHOOK_SOURCE, eventType, payload);
  return REDIS_KEYS.webhookDedup(hash);
}

// ─── Dedup Check ────────────────────────────────────────────────

async function checkAndMarkDedup(
  redis: Redis,
  logger: Logger,
  dedupKey: string,
): Promise<{ duplicate: boolean; redisOk: boolean }> {
  try {
    // SET NX EX — atomic "set if not exists" with TTL
    const result = await redis.set(
      dedupKey,
      '1',
      'EX',
      REDIS_TTL.webhookDedup,
      'NX',
    );
    // `result === null` means the key already existed (duplicate)
    return { duplicate: result === null, redisOk: true };
  } catch (err) {
    logger.warn('webhook_dedup_check_failed', {
      error: err instanceof Error ? err.message : String(err),
    });
    // Fail-open: process the event even if Redis is down (AC-aligned)
    return { duplicate: false, redisOk: false };
  }
}

// ─── Route Registration (AC1, T4, T8) ───────────────────────────

export async function registerElevareWebhookRoute(
  app: FastifyInstance,
  deps: WebhookHandlerDeps,
): Promise<void> {
  // Ensure raw-body preservation for HMAC validation. If an app-level JSON
  // parser is already configured, avoid overriding it — callers are expected
  // to have set up `request.rawBody` themselves.
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
    return handleWebhookRequest(request, reply, deps);
  });
}

// ─── Handler Core (exported for tests) ──────────────────────────

export async function handleWebhookRequest(
  request: FastifyRequest,
  reply: FastifyReply,
  deps: WebhookHandlerDeps,
): Promise<FastifyReply> {
  const { redis, logger, webhookSecret, schedule } = deps;
  const ip = request.ip ?? 'unknown';

  // AC3: fail-closed if secret missing
  if (!webhookSecret || webhookSecret.length === 0) {
    logger.warn('webhook_secret_not_configured', { ip });
    return reply.status(503).send({
      error: 'Service Unavailable',
      message: 'Webhook secret not configured',
    });
  }

  // AC13: per-IP rate limit (100/min)
  const allowed = await checkWebhookRateLimit(redis, logger, ip);
  if (!allowed) {
    logger.warn('webhook_rate_limit_exceeded', { ip });
    return reply.status(429).send({
      error: 'Too Many Requests',
      message: 'Webhook rate limit exceeded',
    });
  }

  // AC1: body validation (400 on malformed)
  const validated = validateBody(request.body);
  if (!validated) {
    logger.warn('webhook_body_malformed', { ip });
    return reply.status(400).send({
      error: 'Bad Request',
      message: 'Missing or invalid event_type / payload',
    });
  }

  // AC2: signature validation (401 on invalid)
  const signatureHeader = request.headers[SIGNATURE_HEADER];
  const signatureFromHeader = Array.isArray(signatureHeader)
    ? signatureHeader[0]
    : signatureHeader;
  const signatureFromBody = (request.body as ElevareWebhookBody | undefined)?.signature;
  const signature = signatureFromHeader ?? signatureFromBody;

  if (typeof signature !== 'string' || signature.length === 0) {
    logger.warn('webhook_signature_missing', { ip, eventType: validated.eventType });
    return reply.status(401).send({ error: 'Unauthorized', message: 'Missing signature' });
  }

  // When signature comes from the body, it cannot be part of the signed
  // payload (self-reference). Strip the signature field and re-serialize
  // for HMAC validation. When signature comes from header, use rawBody as-is.
  let bodyForValidation: string;
  if (signatureFromHeader) {
    bodyForValidation = (request as FastifyRequest & { rawBody?: string }).rawBody
      ?? (typeof request.body === 'string' ? request.body : JSON.stringify(request.body));
  } else {
    const bodyObj = request.body as Record<string, unknown>;
    const { signature: _sig, ...bodyWithoutSig } = bodyObj;
    void _sig;
    bodyForValidation = JSON.stringify(bodyWithoutSig);
  }

  const valid = validateWebhookSignature(bodyForValidation, signature, webhookSecret);
  if (!valid) {
    logger.warn('webhook_signature_invalid', { ip, eventType: validated.eventType });
    return reply.status(401).send({ error: 'Unauthorized', message: 'Invalid signature' });
  }

  // AC6: idempotency check (prefer eventId over payload hash)
  const dedupKey = buildDedupKey(validated.eventType, validated.payload, validated.eventId);
  const { duplicate } = await checkAndMarkDedup(redis, logger, dedupKey);
  if (duplicate) {
    logger.info('webhook_duplicate_acknowledged', {
      ip,
      eventType: validated.eventType,
      dedupKey,
    });
    return reply.status(200).send({ status: 'duplicate' });
  }

  // AC4: unknown event types are stored but never processed
  const isKnownType = (SUPPORTED_EVENT_TYPES as readonly string[]).includes(validated.eventType);
  if (!isKnownType) {
    logger.warn('webhook_unknown_event_type', {
      ip,
      eventType: validated.eventType,
    });
  }

  // AC5, AC7: INSERT webhook_events (status=received). Payload is immutable.
  let eventId: string;
  try {
    eventId = await insertWebhookEvent({
      source: WEBHOOK_SOURCE,
      eventType: validated.eventType,
      payload: { ...validated.payload, event_type: validated.eventType },
      // sessionId/guestId are resolved asynchronously during processing.
      sessionId: null,
      guestId: null,
    });
  } catch (err) {
    logger.error('webhook_insert_failed', {
      ip,
      eventType: validated.eventType,
      error: err instanceof Error ? err.message : String(err),
    });
    return reply.status(500).send({
      error: 'Internal Server Error',
      message: 'Failed to persist webhook event',
    });
  }

  logger.info('webhook_received', {
    webhookEventId: eventId,
    ip,
    eventType: validated.eventType,
  });

  // AC17: respond 200 OK immediately (<5s). Process asynchronously.
  if (isKnownType) {
    const scheduler = schedule ?? ((fn) => { setImmediate(fn); });
    scheduler(() => {
      void processWebhookEvent(
        eventId,
        validated.eventType as ElevareEventType,
        validated.payload,
      ).catch((err: unknown) => {
        logger.error('webhook_async_processing_failed', {
          webhookEventId: eventId,
          eventType: validated.eventType,
          error: err instanceof Error ? err.message : String(err),
        });
      });
    });
  }

  return reply.status(200).send({
    status: isKnownType ? 'received' : 'received_unknown',
    webhookEventId: eventId,
  });
}
