/**
 * Unit tests for Story 3.7 — Webhook Listener & Auto-Follow-Up.
 *
 * Covers all AC1-AC17 scenarios listed in docs/stories/3.7.story.md Testing.
 */

import { createHmac } from 'node:crypto';
import type { FastifyReply, FastifyRequest } from 'fastify';

import {
  computeWebhookHash,
  validateWebhookSignature,
  handleWebhookRequest,
  type WebhookHandlerDeps,
} from '../../backend/src/webhooks/elevare-handler';

import {
  SUPPORTED_EVENT_TYPES,
  type ElevareEventType,
  type FollowUpData,
  type PaymentFailedData,
  type QuoteCreatedData,
  type QuoteExpiringData,
  type ReservationConfirmedData,
  type WebhookProcessingResult,
} from '../../backend/src/webhooks/types';

// ─── Module Mocks ───────────────────────────────────────────────

jest.mock('../../backend/src/webhooks/elevare-repository', () => ({
  insertWebhookEvent: jest.fn(),
  updateWebhookEventStatus: jest.fn().mockResolvedValue(undefined),
  updateWebhookEventContext: jest.fn().mockResolvedValue(undefined),
  findHistoricalEventByQuotationId: jest.fn().mockResolvedValue(null),
}));

jest.mock('../../backend/src/state/cache-helpers', () => ({
  cacheGet: jest.fn(),
}));

jest.mock('../../backend/src/state/session-manager', () => ({
  getSession: jest.fn().mockResolvedValue(null),
}));

jest.mock('../../backend/src/webhooks/elevare-processor', () => {
  const actual = jest.requireActual('../../backend/src/webhooks/elevare-processor');
  return {
    ...actual,
    processWebhookEvent: jest.fn().mockResolvedValue({
      eventId: 'evt-mock',
      status: 'processed',
      followUpSent: true,
    }),
  };
});

const repo = jest.requireMock('../../backend/src/webhooks/elevare-repository') as {
  insertWebhookEvent: jest.Mock;
  updateWebhookEventStatus: jest.Mock;
  updateWebhookEventContext: jest.Mock;
  findHistoricalEventByQuotationId: jest.Mock;
};

const cacheHelpers = jest.requireMock('../../backend/src/state/cache-helpers') as {
  cacheGet: jest.Mock;
};

const sessionManager = jest.requireMock('../../backend/src/state/session-manager') as {
  getSession: jest.Mock;
};

const processorMock = jest.requireMock('../../backend/src/webhooks/elevare-processor') as {
  processWebhookEvent: jest.Mock;
  configureProcessorDeps: (d: unknown) => void;
  resolveGuestContext: (id: string) => Promise<unknown>;
};

// ─── Fixtures ───────────────────────────────────────────────────

const SECRET = 'test-webhook-secret-32chars-minimum';
const TEST_IP = '192.168.1.100';

const QUOTE_EXPIRING_PAYLOAD = {
  quotationId: 'quot_abc123',
  expiresAt: '2026-04-06T14:00:00Z',
  hoursRemaining: 2,
  hotelName: 'Hotel Fasano',
};

const RESERVATION_CONFIRMED_PAYLOAD = {
  quotationId: 'quot_abc123',
  reservationId: 'res_xyz789',
  hotelName: 'Hotel Fasano',
  checkIn: '2026-05-15',
  checkOut: '2026-05-18',
  totalAmount: 8500.0,
};

const PAYMENT_FAILED_PAYLOAD = {
  quotationId: 'quot_abc123',
  failureReason: 'card_declined',
  attemptNumber: 1,
};

const QUOTE_CREATED_PAYLOAD = {
  quotationId: 'quot_abc123',
  customerId: 'cust_xyz',
  offerId: 42,
  paymentLink: 'https://pay.elevare.com.br/quot_abc123',
  expiresAt: '2026-04-06T14:00:00Z',
};

// ─── Helpers ────────────────────────────────────────────────────

function signBody(body: unknown, secret: string = SECRET): string {
  const raw = JSON.stringify(body);
  return createHmac('sha256', secret).update(raw, 'utf8').digest('hex');
}

interface MockRedisOptions {
  setNxReturns?: string | null; // 'OK' = new, null = duplicate
  incrReturns?: number;
  throwOnIncr?: boolean;
  throwOnSet?: boolean;
}

function makeRedis(opts: MockRedisOptions = {}): any {
  // Use explicit undefined check — `??` would coerce `null` (a valid dedup-hit value) to 'OK'
  const setNxReturn = 'setNxReturns' in opts ? opts.setNxReturns : 'OK';
  const incrReturn = opts.incrReturns ?? 1;

  return {
    set: jest.fn().mockImplementation((...args: unknown[]) => {
      if (opts.throwOnSet) return Promise.reject(new Error('redis set failed'));
      // SET with NX flag — return null if exists, 'OK' if new
      if (args.includes('NX')) {
        return Promise.resolve(setNxReturn);
      }
      return Promise.resolve('OK');
    }),
    incr: jest.fn().mockImplementation(() => {
      if (opts.throwOnIncr) return Promise.reject(new Error('redis incr failed'));
      return Promise.resolve(incrReturn);
    }),
    expire: jest.fn().mockResolvedValue(1),
    get: jest.fn().mockResolvedValue(null),
  };
}

function makeLogger(): any {
  return {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  };
}

function makeReply(): FastifyReply {
  const reply: any = {
    status: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    header: jest.fn().mockReturnThis(),
  };
  return reply as FastifyReply;
}

interface MockRequestOptions {
  body?: unknown;
  signature?: string | null;
  signatureInHeader?: boolean;
  ip?: string;
  rawBody?: string;
}

function makeRequest(opts: MockRequestOptions = {}): FastifyRequest {
  const body = opts.body ?? { event_type: 'quote_created', payload: QUOTE_CREATED_PAYLOAD };
  const sig = opts.signature === null
    ? undefined
    : (opts.signature ?? signBody(body));
  const sigInHeader = opts.signatureInHeader ?? true;

  const headers: Record<string, string> = {};
  if (sig && sigInHeader) {
    headers['x-elevare-signature'] = sig;
  }

  const bodyWithSig: any = typeof body === 'object' && body !== null ? { ...body } : body;
  if (sig && !sigInHeader && typeof bodyWithSig === 'object') {
    bodyWithSig.signature = sig;
  }

  const rawBody = opts.rawBody ?? JSON.stringify(bodyWithSig);

  return {
    body: bodyWithSig,
    headers,
    ip: opts.ip ?? TEST_IP,
    rawBody,
  } as unknown as FastifyRequest;
}

function makeDeps(redis: any, logger: any, secret: string | undefined = SECRET): WebhookHandlerDeps {
  return {
    redis,
    logger,
    webhookSecret: secret,
    schedule: (fn) => fn(), // synchronous in tests
  };
}

// ─── Tests ──────────────────────────────────────────────────────

describe('Elevare Webhook — Signature & Hash Utilities', () => {
  // AC2, AC28
  it('validateWebhookSignature: returns true for valid HMAC-SHA256', () => {
    const body = JSON.stringify({ event_type: 'quote_created' });
    const sig = createHmac('sha256', SECRET).update(body, 'utf8').digest('hex');
    expect(validateWebhookSignature(body, sig, SECRET)).toBe(true);
  });

  it('validateWebhookSignature: returns false for tampered body', () => {
    const body = JSON.stringify({ event_type: 'quote_created' });
    const sig = createHmac('sha256', SECRET).update(body, 'utf8').digest('hex');
    expect(validateWebhookSignature(body + 'tampered', sig, SECRET)).toBe(false);
  });

  it('validateWebhookSignature: returns false for wrong secret', () => {
    const body = JSON.stringify({ event_type: 'quote_created' });
    const sig = createHmac('sha256', SECRET).update(body, 'utf8').digest('hex');
    expect(validateWebhookSignature(body, sig, 'wrong-secret')).toBe(false);
  });

  it('validateWebhookSignature: returns false for length mismatch', () => {
    expect(validateWebhookSignature('body', 'short', SECRET)).toBe(false);
  });

  it('validateWebhookSignature: returns false for empty signature', () => {
    expect(validateWebhookSignature('body', '', SECRET)).toBe(false);
  });

  // AC6: computeWebhookHash is deterministic
  it('computeWebhookHash: produces stable SHA-256 hex for same input', () => {
    const h1 = computeWebhookHash('elevare', 'quote_created', { quotationId: 'q1' });
    const h2 = computeWebhookHash('elevare', 'quote_created', { quotationId: 'q1' });
    expect(h1).toBe(h2);
    expect(h1).toMatch(/^[a-f0-9]{64}$/);
  });

  it('computeWebhookHash: differs when payload differs', () => {
    const h1 = computeWebhookHash('elevare', 'quote_created', { quotationId: 'q1' });
    const h2 = computeWebhookHash('elevare', 'quote_created', { quotationId: 'q2' });
    expect(h1).not.toBe(h2);
  });

  it('computeWebhookHash: differs when event type differs', () => {
    const h1 = computeWebhookHash('elevare', 'quote_created', { quotationId: 'q1' });
    const h2 = computeWebhookHash('elevare', 'quote_expiring', { quotationId: 'q1' });
    expect(h1).not.toBe(h2);
  });
});

describe('Elevare Webhook Handler — Security & Validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    repo.insertWebhookEvent.mockResolvedValue('evt-123');
  });

  // Test 5 — AC3: fail-closed on missing secret
  it('returns 503 when ELEVARE_WEBHOOK_SECRET is not configured', async () => {
    const redis = makeRedis();
    const logger = makeLogger();
    const req = makeRequest();
    const reply = makeReply();

    // Override webhookSecret explicitly — passing `undefined` to makeDeps
    // triggers its default parameter (JS semantics), so build deps directly.
    const deps: WebhookHandlerDeps = {
      ...makeDeps(redis, logger),
      webhookSecret: undefined,
    };
    await handleWebhookRequest(req, reply, deps);

    expect(reply.status).toHaveBeenCalledWith(503);
    expect(logger.warn).toHaveBeenCalledWith(
      'webhook_secret_not_configured',
      expect.any(Object),
    );
    expect(repo.insertWebhookEvent).not.toHaveBeenCalled();
  });

  // Test 3 — AC2: invalid signature
  it('returns 401 when HMAC signature is invalid', async () => {
    const redis = makeRedis();
    const logger = makeLogger();
    const req = makeRequest({ signature: 'definitely-not-a-valid-hmac-signature-xxxxx' });
    const reply = makeReply();

    await handleWebhookRequest(req, reply, makeDeps(redis, logger));

    expect(reply.status).toHaveBeenCalledWith(401);
    expect(repo.insertWebhookEvent).not.toHaveBeenCalled();
  });

  // Test 4 — AC2: missing signature
  it('returns 401 when signature is missing from header and body', async () => {
    const redis = makeRedis();
    const logger = makeLogger();
    const req = makeRequest({ signature: null });
    const reply = makeReply();

    await handleWebhookRequest(req, reply, makeDeps(redis, logger));

    expect(reply.status).toHaveBeenCalledWith(401);
    expect(logger.warn).toHaveBeenCalledWith(
      'webhook_signature_missing',
      expect.objectContaining({ ip: TEST_IP }),
    );
  });

  // Test 6 — AC1: malformed body (missing event_type)
  it('returns 400 when body is missing event_type', async () => {
    const redis = makeRedis();
    const logger = makeLogger();
    const body = { payload: { foo: 'bar' } };
    const req = makeRequest({ body, signature: signBody(body) });
    const reply = makeReply();

    await handleWebhookRequest(req, reply, makeDeps(redis, logger));

    expect(reply.status).toHaveBeenCalledWith(400);
    expect(repo.insertWebhookEvent).not.toHaveBeenCalled();
  });

  // Test 7 — AC1: malformed body (missing payload)
  it('returns 400 when body is missing payload', async () => {
    const redis = makeRedis();
    const logger = makeLogger();
    const body = { event_type: 'quote_created' };
    const req = makeRequest({ body, signature: signBody(body) });
    const reply = makeReply();

    await handleWebhookRequest(req, reply, makeDeps(redis, logger));

    expect(reply.status).toHaveBeenCalledWith(400);
  });

  // AC1: malformed body (null / non-object)
  it('returns 400 when body is not an object', async () => {
    const redis = makeRedis();
    const logger = makeLogger();
    const req = makeRequest({ body: 'not-an-object', signature: signBody('not-an-object') });
    const reply = makeReply();

    await handleWebhookRequest(req, reply, makeDeps(redis, logger));

    expect(reply.status).toHaveBeenCalledWith(400);
  });

  // Test 24 — AC14: signature failure logs IP and eventType
  it('logs IP and eventType on signature validation failure', async () => {
    const redis = makeRedis();
    const logger = makeLogger();
    const body = { event_type: 'quote_expiring', payload: QUOTE_EXPIRING_PAYLOAD };
    const req = makeRequest({ body, signature: 'bad-sig-xxxxxxxxxxxxxxxxxxxxxxxxx' });
    const reply = makeReply();

    await handleWebhookRequest(req, reply, makeDeps(redis, logger));

    expect(logger.warn).toHaveBeenCalledWith(
      'webhook_signature_invalid',
      expect.objectContaining({ ip: TEST_IP, eventType: 'quote_expiring' }),
    );
  });
});

describe('Elevare Webhook Handler — Happy Path & Persistence', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    repo.insertWebhookEvent.mockResolvedValue('evt-happy-123');
  });

  // Test 2 — AC1, AC2, AC5: happy path (quote_created — no follow-up)
  it('returns 200 OK and stores event when signature is valid', async () => {
    const redis = makeRedis();
    const logger = makeLogger();
    const body = { event_type: 'quote_created', payload: QUOTE_CREATED_PAYLOAD };
    const req = makeRequest({ body });
    const reply = makeReply();

    await handleWebhookRequest(req, reply, makeDeps(redis, logger));

    expect(reply.status).toHaveBeenCalledWith(200);
    expect(repo.insertWebhookEvent).toHaveBeenCalledTimes(1);
    expect(repo.insertWebhookEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        source: 'elevare',
        eventType: 'quote_created',
        sessionId: null,
        guestId: null,
      }),
    );
  });

  // Test 15 — AC5: correct Drizzle fields used
  it('INSERT uses correct fields: source, eventType, payload, status received', async () => {
    const redis = makeRedis();
    const logger = makeLogger();
    const body = { event_type: 'quote_expiring', payload: QUOTE_EXPIRING_PAYLOAD };
    const req = makeRequest({ body });
    const reply = makeReply();

    await handleWebhookRequest(req, reply, makeDeps(redis, logger));

    const call = repo.insertWebhookEvent.mock.calls[0][0];
    expect(call.source).toBe('elevare');
    expect(call.eventType).toBe('quote_expiring');
    expect(call.payload).toMatchObject(QUOTE_EXPIRING_PAYLOAD);
    expect(call.sessionId).toBeNull();
    expect(call.guestId).toBeNull();
  });

  // Test 23 — AC14: logs include webhookEventId correlation ID
  it('logs webhookEventId correlation ID after insertion', async () => {
    const redis = makeRedis();
    const logger = makeLogger();
    const body = { event_type: 'quote_created', payload: QUOTE_CREATED_PAYLOAD };
    const req = makeRequest({ body });
    const reply = makeReply();

    await handleWebhookRequest(req, reply, makeDeps(redis, logger));

    expect(logger.info).toHaveBeenCalledWith(
      'webhook_received',
      expect.objectContaining({ webhookEventId: 'evt-happy-123' }),
    );
  });

  // AC1, AC2: signature can come from body (not just header)
  it('accepts signature from body when header is absent', async () => {
    const redis = makeRedis();
    const logger = makeLogger();
    const body = { event_type: 'quote_created', payload: QUOTE_CREATED_PAYLOAD };
    const req = makeRequest({ body, signatureInHeader: false });
    const reply = makeReply();

    await handleWebhookRequest(req, reply, makeDeps(redis, logger));

    expect(reply.status).toHaveBeenCalledWith(200);
    expect(repo.insertWebhookEvent).toHaveBeenCalled();
  });

  // AC17: 500 on DB failure (the only non-200 after sig passes besides security)
  it('returns 500 when webhook_events INSERT fails', async () => {
    repo.insertWebhookEvent.mockRejectedValueOnce(new Error('db down'));
    const redis = makeRedis();
    const logger = makeLogger();
    const req = makeRequest();
    const reply = makeReply();

    await handleWebhookRequest(req, reply, makeDeps(redis, logger));

    expect(reply.status).toHaveBeenCalledWith(500);
    expect(logger.error).toHaveBeenCalledWith(
      'webhook_insert_failed',
      expect.any(Object),
    );
  });
});

describe('Elevare Webhook Handler — Idempotency (AC6)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    repo.insertWebhookEvent.mockResolvedValue('evt-dedup-123');
  });

  // Test 13 — AC6: duplicate webhook
  it('returns 200 OK with status=duplicate when dedup key exists', async () => {
    const redis = makeRedis({ setNxReturns: null });
    const logger = makeLogger();
    const req = makeRequest();
    const reply = makeReply();

    await handleWebhookRequest(req, reply, makeDeps(redis, logger));

    expect(reply.status).toHaveBeenCalledWith(200);
    expect(reply.send).toHaveBeenCalledWith({ status: 'duplicate' });
    expect(repo.insertWebhookEvent).not.toHaveBeenCalled();
    expect(logger.info).toHaveBeenCalledWith(
      'webhook_duplicate_acknowledged',
      expect.any(Object),
    );
  });

  // Test 14 — AC6: dedup by eventId when provided
  it('uses eventId as dedup key when provided (preferred over hash)', async () => {
    const redis = makeRedis({ setNxReturns: 'OK' });
    const logger = makeLogger();
    const body = {
      event_type: 'quote_created',
      payload: QUOTE_CREATED_PAYLOAD,
      eventId: 'elevare-evt-id-xyz',
    };
    const req = makeRequest({ body });
    const reply = makeReply();

    await handleWebhookRequest(req, reply, makeDeps(redis, logger));

    expect(redis.set).toHaveBeenCalledWith(
      'webhook_dedup:elevare-evt-id-xyz',
      '1',
      'EX',
      expect.any(Number),
      'NX',
    );
  });

  // Test 31 — AC6: Redis unavailable → process anyway (fail-open for dedup)
  it('processes event when Redis dedup check fails (fail-open with warn)', async () => {
    const redis = makeRedis({ throwOnSet: true });
    const logger = makeLogger();
    const req = makeRequest();
    const reply = makeReply();

    await handleWebhookRequest(req, reply, makeDeps(redis, logger));

    expect(reply.status).toHaveBeenCalledWith(200);
    expect(repo.insertWebhookEvent).toHaveBeenCalled();
    expect(logger.warn).toHaveBeenCalledWith(
      'webhook_dedup_check_failed',
      expect.any(Object),
    );
  });

  // AC6: dedup TTL is 24h
  it('sets dedup key with 24h TTL', async () => {
    const redis = makeRedis({ setNxReturns: 'OK' });
    const logger = makeLogger();
    const req = makeRequest();
    const reply = makeReply();

    await handleWebhookRequest(req, reply, makeDeps(redis, logger));

    const setCall = redis.set.mock.calls.find((c: unknown[]) => c.includes('NX'));
    expect(setCall).toBeDefined();
    expect(setCall[3]).toBe(24 * 60 * 60);
  });
});

describe('Elevare Webhook Handler — Rate Limiting (AC13)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    repo.insertWebhookEvent.mockResolvedValue('evt-rl-123');
  });

  // Test 22 — AC13: rate limit exceeded
  it('returns 429 when IP exceeds 100 requests/minute', async () => {
    const redis = makeRedis({ incrReturns: 101 });
    const logger = makeLogger();
    const req = makeRequest();
    const reply = makeReply();

    await handleWebhookRequest(req, reply, makeDeps(redis, logger));

    expect(reply.status).toHaveBeenCalledWith(429);
    expect(logger.warn).toHaveBeenCalledWith(
      'webhook_rate_limit_exceeded',
      expect.objectContaining({ ip: TEST_IP }),
    );
  });

  it('allows request at exactly 100 (inclusive limit)', async () => {
    const redis = makeRedis({ incrReturns: 100 });
    const logger = makeLogger();
    const req = makeRequest();
    const reply = makeReply();

    await handleWebhookRequest(req, reply, makeDeps(redis, logger));

    expect(reply.status).toHaveBeenCalledWith(200);
  });

  it('sets TTL on first request of window', async () => {
    const redis = makeRedis({ incrReturns: 1 });
    const logger = makeLogger();
    const req = makeRequest();
    const reply = makeReply();

    await handleWebhookRequest(req, reply, makeDeps(redis, logger));

    expect(redis.expire).toHaveBeenCalledWith(
      `rate_limit:webhook:${TEST_IP}`,
      60,
    );
  });

  it('fails-open when rate limit check throws (logs warn)', async () => {
    const redis = makeRedis({ throwOnIncr: true });
    const logger = makeLogger();
    const req = makeRequest();
    const reply = makeReply();

    await handleWebhookRequest(req, reply, makeDeps(redis, logger));

    expect(reply.status).toHaveBeenCalledWith(200);
    expect(logger.warn).toHaveBeenCalledWith(
      'webhook_rate_limit_check_failed',
      expect.any(Object),
    );
  });
});

describe('Elevare Webhook Handler — Event Routing', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    repo.insertWebhookEvent.mockResolvedValue('evt-route-123');
  });

  // Test 12 — AC4: unknown event types stored but not processed
  it('stores unknown event_type but does not trigger processor', async () => {
    const redis = makeRedis();
    const logger = makeLogger();
    const body = { event_type: 'mystery_event', payload: { foo: 'bar' } };
    const req = makeRequest({ body });
    const reply = makeReply();

    await handleWebhookRequest(req, reply, makeDeps(redis, logger));

    expect(reply.status).toHaveBeenCalledWith(200);
    expect(repo.insertWebhookEvent).toHaveBeenCalledWith(
      expect.objectContaining({ eventType: 'mystery_event' }),
    );
    expect(processorMock.processWebhookEvent).not.toHaveBeenCalled();
    expect(logger.warn).toHaveBeenCalledWith(
      'webhook_unknown_event_type',
      expect.any(Object),
    );
  });

  // Test 8 — AC4, AC11: quote_created stored but no follow-up triggered
  it('routes quote_created to processor (audit-only in processor)', async () => {
    const redis = makeRedis();
    const logger = makeLogger();
    const body = { event_type: 'quote_created', payload: QUOTE_CREATED_PAYLOAD };
    const req = makeRequest({ body });
    const reply = makeReply();

    await handleWebhookRequest(req, reply, makeDeps(redis, logger));

    expect(processorMock.processWebhookEvent).toHaveBeenCalledWith(
      'evt-route-123',
      'quote_created',
      QUOTE_CREATED_PAYLOAD,
    );
  });

  it('routes quote_expiring to processor', async () => {
    const redis = makeRedis();
    const logger = makeLogger();
    const body = { event_type: 'quote_expiring', payload: QUOTE_EXPIRING_PAYLOAD };
    const req = makeRequest({ body });
    const reply = makeReply();

    await handleWebhookRequest(req, reply, makeDeps(redis, logger));

    expect(processorMock.processWebhookEvent).toHaveBeenCalledWith(
      'evt-route-123',
      'quote_expiring',
      QUOTE_EXPIRING_PAYLOAD,
    );
  });

  it('routes reservation_confirmed to processor', async () => {
    const redis = makeRedis();
    const logger = makeLogger();
    const body = { event_type: 'reservation_confirmed', payload: RESERVATION_CONFIRMED_PAYLOAD };
    const req = makeRequest({ body });
    const reply = makeReply();

    await handleWebhookRequest(req, reply, makeDeps(redis, logger));

    expect(processorMock.processWebhookEvent).toHaveBeenCalledWith(
      'evt-route-123',
      'reservation_confirmed',
      RESERVATION_CONFIRMED_PAYLOAD,
    );
  });

  it('routes payment_failed to processor', async () => {
    const redis = makeRedis();
    const logger = makeLogger();
    const body = { event_type: 'payment_failed', payload: PAYMENT_FAILED_PAYLOAD };
    const req = makeRequest({ body });
    const reply = makeReply();

    await handleWebhookRequest(req, reply, makeDeps(redis, logger));

    expect(processorMock.processWebhookEvent).toHaveBeenCalledWith(
      'evt-route-123',
      'payment_failed',
      PAYMENT_FAILED_PAYLOAD,
    );
  });
});

describe('Elevare Webhook Handler — Performance & Async (AC17)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    repo.insertWebhookEvent.mockResolvedValue('evt-async-123');
  });

  // Test 27 — AC17: handler responds within 5s (processing is async)
  it('responds with 200 before processor completes (async processing)', async () => {
    // Delay processor resolution to prove handler returns first
    let processorResolved = false;
    processorMock.processWebhookEvent.mockImplementationOnce(
      () => new Promise<WebhookProcessingResult>((resolve) => {
        setTimeout(() => {
          processorResolved = true;
          resolve({ eventId: 'x', status: 'processed', followUpSent: true });
        }, 100);
      }),
    );
    const redis = makeRedis();
    const logger = makeLogger();
    const req = makeRequest();
    const reply = makeReply();

    // Use real async schedule to exercise the deferred path
    const deps: WebhookHandlerDeps = {
      redis,
      logger,
      webhookSecret: SECRET,
      schedule: (fn) => { setImmediate(fn); },
    };

    await handleWebhookRequest(req, reply, deps);

    // Handler returned 200 while processor is still pending
    expect(reply.status).toHaveBeenCalledWith(200);
    expect(processorResolved).toBe(false);
  });

  // Test 32 — AC7, AC17: processor failure doesn't break 200 response
  it('returns 200 OK even when processor throws (logged via catch)', async () => {
    processorMock.processWebhookEvent.mockRejectedValueOnce(new Error('persona down'));
    const redis = makeRedis();
    const logger = makeLogger();
    const req = makeRequest();
    const reply = makeReply();

    await handleWebhookRequest(req, reply, makeDeps(redis, logger));

    expect(reply.status).toHaveBeenCalledWith(200);
  });
});

describe('Elevare Webhook Processor — Status Lifecycle & Routing', () => {
  // Hoist the real processor module and test it directly
  const processorModule = jest.requireActual('../../backend/src/webhooks/elevare-processor') as {
    processWebhookEvent: (
      eventId: string,
      eventType: ElevareEventType,
      payload: Record<string, unknown>,
    ) => Promise<WebhookProcessingResult>;
    configureProcessorDeps: (d: unknown) => void;
  };

  // Shared stubs
  let generateResponseStub: jest.Mock;
  let deliverMessageStub: jest.Mock;
  let regeneratePaymentLinkStub: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    generateResponseStub = jest.fn().mockResolvedValue('Senhor Silva, o link expira em breve...');
    deliverMessageStub = jest.fn().mockResolvedValue(undefined);
    regeneratePaymentLinkStub = jest.fn().mockResolvedValue({
      paymentLink: 'https://pay.elevare.com.br/new-link',
      expiresAt: '2026-04-07T14:00:00Z',
    });

    processorModule.configureProcessorDeps({
      generateResponse: generateResponseStub,
      deliverMessage: deliverMessageStub,
      regeneratePaymentLink: regeneratePaymentLinkStub,
      logger: makeLogger(),
    });

    // Default: guest resolved from Redis
    cacheHelpers.cacheGet.mockResolvedValue({
      quotationId: 'quot_abc123',
      sessionId: 'sess-xyz',
      customerId: 'cust_abc',
      paymentLink: 'https://pay.elevare.com.br/x',
      expiresAt: '2026-04-06T14:00:00Z',
      status: 'active',
      requestId: 'req_x',
      offerId: 42,
      createdAt: '2026-04-05T14:00:00Z',
      updatedAt: '2026-04-05T14:00:00Z',
    });
  });

  // Test 17 — AC7: received → processing → processed
  it('updates status: received → processing → processed (success)', async () => {
    const result = await processorModule.processWebhookEvent(
      'evt-1',
      'quote_expiring',
      QUOTE_EXPIRING_PAYLOAD,
    );

    expect(repo.updateWebhookEventStatus).toHaveBeenNthCalledWith(1, 'evt-1', 'processing');
    expect(repo.updateWebhookEventStatus).toHaveBeenNthCalledWith(2, 'evt-1', 'processed');
    expect(result.status).toBe('processed');
    expect(result.followUpSent).toBe(true);
  });

  // Test 18 — AC7: received → processing → failed (with error_message)
  it('updates status: received → processing → failed (with error_message)', async () => {
    generateResponseStub.mockRejectedValueOnce(new Error('persona unavailable'));

    const result = await processorModule.processWebhookEvent(
      'evt-2',
      'quote_expiring',
      QUOTE_EXPIRING_PAYLOAD,
    );

    expect(repo.updateWebhookEventStatus).toHaveBeenNthCalledWith(1, 'evt-2', 'processing');
    expect(repo.updateWebhookEventStatus).toHaveBeenCalledWith(
      'evt-2',
      'failed',
      'persona unavailable',
    );
    expect(result.status).toBe('failed');
    expect(result.followUpSent).toBe(false);
  });

  // Test 16 — AC5, AC7: payload column NEVER updated (only status fields)
  it('NEVER updates payload column — only status/processedAt/errorMessage', async () => {
    await processorModule.processWebhookEvent('evt-3', 'quote_expiring', QUOTE_EXPIRING_PAYLOAD);

    // Assert all updateWebhookEventStatus calls carry only status/errorMessage args
    for (const call of repo.updateWebhookEventStatus.mock.calls) {
      expect(call[0]).toBe('evt-3');
      expect(['processing', 'processed', 'failed']).toContain(call[1]);
      // arg[2] is errorMessage (string) or undefined — never a payload object
      if (call[2] !== undefined) {
        expect(typeof call[2]).toBe('string');
      }
    }
  });

  // Test 8, AC11: quote_created is audit-only (no follow-up)
  it('quote_created: stored, status=processed, no follow-up sent', async () => {
    const result = await processorModule.processWebhookEvent(
      'evt-qc',
      'quote_created',
      QUOTE_CREATED_PAYLOAD,
    );

    expect(result.status).toBe('processed');
    expect(result.followUpSent).toBe(false);
    expect(generateResponseStub).not.toHaveBeenCalled();
    expect(deliverMessageStub).not.toHaveBeenCalled();
  });

  // Test 9, AC8: quote_expiring builds QuoteExpiringData
  it('quote_expiring: builds structured QuoteExpiringData for Persona Agent', async () => {
    await processorModule.processWebhookEvent(
      'evt-qe',
      'quote_expiring',
      QUOTE_EXPIRING_PAYLOAD,
    );

    expect(generateResponseStub).toHaveBeenCalledTimes(1);
    const callArg = generateResponseStub.mock.calls[0][0];
    expect(callArg.toolResults.webhookFollowUp).toMatchObject({
      eventType: 'quote_expiring',
      quotationId: 'quot_abc123',
      expiresAt: QUOTE_EXPIRING_PAYLOAD.expiresAt,
      hotelName: 'Hotel Fasano',
    });
    expect(callArg.language).toBe('pt');
  });

  // Test 10, AC9: reservation_confirmed builds ReservationConfirmedData
  it('reservation_confirmed: builds structured data with reservation details', async () => {
    await processorModule.processWebhookEvent(
      'evt-rc',
      'reservation_confirmed',
      RESERVATION_CONFIRMED_PAYLOAD,
    );

    const callArg = generateResponseStub.mock.calls[0][0];
    expect(callArg.toolResults.webhookFollowUp).toMatchObject({
      eventType: 'reservation_confirmed',
      quotationId: 'quot_abc123',
      reservationId: 'res_xyz789',
      hotelName: 'Hotel Fasano',
      checkIn: '2026-05-15',
      checkOut: '2026-05-18',
    });
  });

  // Test 11, AC10: payment_failed calls regeneratePaymentLink
  it('payment_failed: calls regeneratePaymentLink and includes new link', async () => {
    await processorModule.processWebhookEvent(
      'evt-pf',
      'payment_failed',
      PAYMENT_FAILED_PAYLOAD,
    );

    expect(regeneratePaymentLinkStub).toHaveBeenCalledWith('quot_abc123');
    const callArg = generateResponseStub.mock.calls[0][0];
    expect(callArg.toolResults.webhookFollowUp).toMatchObject({
      eventType: 'payment_failed',
      quotationId: 'quot_abc123',
      failureReason: 'card_declined',
      newPaymentLink: 'https://pay.elevare.com.br/new-link',
    });
  });

  // Test 30 — AC10: payment_failed with regeneration failure
  it('payment_failed: continues with newPaymentLink=null on regeneration failure', async () => {
    regeneratePaymentLinkStub.mockRejectedValueOnce(new Error('link generation failed'));

    const result = await processorModule.processWebhookEvent(
      'evt-pf-fail',
      'payment_failed',
      PAYMENT_FAILED_PAYLOAD,
    );

    expect(result.status).toBe('processed');
    const callArg = generateResponseStub.mock.calls[0][0];
    expect(callArg.toolResults.webhookFollowUp.newPaymentLink).toBeNull();
  });
});

describe('Elevare Webhook Processor — Guest Resolution (AC12)', () => {
  const processorModule = jest.requireActual('../../backend/src/webhooks/elevare-processor') as {
    processWebhookEvent: (
      eventId: string,
      eventType: ElevareEventType,
      payload: Record<string, unknown>,
    ) => Promise<WebhookProcessingResult>;
    resolveGuestContext: (quotationId: string) => Promise<unknown>;
    configureProcessorDeps: (d: unknown) => void;
  };

  let generateResponseStub: jest.Mock;
  let deliverMessageStub: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    generateResponseStub = jest.fn().mockResolvedValue('luxury prose');
    deliverMessageStub = jest.fn().mockResolvedValue(undefined);

    processorModule.configureProcessorDeps({
      generateResponse: generateResponseStub,
      deliverMessage: deliverMessageStub,
      regeneratePaymentLink: jest.fn().mockResolvedValue({
        paymentLink: 'link',
        expiresAt: 'x',
      }),
      logger: makeLogger(),
    });
  });

  // Test 19 — AC12: Redis fast path
  it('resolves guest from Redis quotation state (fast path)', async () => {
    cacheHelpers.cacheGet.mockResolvedValueOnce({
      sessionId: 'sess-fast',
      customerId: 'c1',
      quotationId: 'quot_abc123',
    });

    const result = await processorModule.resolveGuestContext('quot_abc123');

    expect(result).toMatchObject({ sessionId: 'sess-fast' });
    expect(repo.findHistoricalEventByQuotationId).not.toHaveBeenCalled();
  });

  // Test 20 — AC12: DB fallback when Redis expired
  it('falls back to DB when Redis returns null', async () => {
    cacheHelpers.cacheGet.mockResolvedValueOnce(null);
    repo.findHistoricalEventByQuotationId.mockResolvedValueOnce({
      id: 'evt-old',
      sessionId: 'sess-from-db',
      guestId: 'guest-123',
      payload: {},
    });

    const result = await processorModule.resolveGuestContext('quot_abc123');

    expect(result).toMatchObject({ sessionId: 'sess-from-db', guestId: 'guest-123' });
    expect(repo.findHistoricalEventByQuotationId).toHaveBeenCalledWith('quot_abc123');
  });

  // Test 21 — AC12: guest not resolved → processed with error_message
  it('stores event as processed with "guest_not_resolved" when guest cannot be found', async () => {
    cacheHelpers.cacheGet.mockResolvedValueOnce(null);
    repo.findHistoricalEventByQuotationId.mockResolvedValueOnce(null);

    const result = await processorModule.processWebhookEvent(
      'evt-no-guest',
      'quote_expiring',
      QUOTE_EXPIRING_PAYLOAD,
    );

    expect(result.status).toBe('processed');
    expect(result.followUpSent).toBe(false);
    expect(result.error).toBe('guest_not_resolved');
    expect(repo.updateWebhookEventStatus).toHaveBeenCalledWith(
      'evt-no-guest',
      'processed',
      'guest_not_resolved',
    );
    expect(generateResponseStub).not.toHaveBeenCalled();
  });

  it('returns null when both Redis and DB return no context', async () => {
    cacheHelpers.cacheGet.mockResolvedValueOnce(null);
    repo.findHistoricalEventByQuotationId.mockResolvedValueOnce(null);

    const result = await processorModule.resolveGuestContext('quot_missing');

    expect(result).toBeNull();
  });

  // AC16: language must come from the session, not a hardcoded default
  it('resolves language from session.language when available', async () => {
    cacheHelpers.cacheGet.mockResolvedValueOnce({
      sessionId: 'sess-en',
      customerId: 'c1',
      quotationId: 'quot_abc123',
    });
    sessionManager.getSession.mockResolvedValueOnce({
      hotelId: 'h1',
      guestPhone: '+5511999999999',
      language: 'en',
      context: { guestName: 'John Smith' },
      createdAt: '2026-04-05T10:00:00Z',
      updatedAt: '2026-04-05T10:00:00Z',
    });

    const result = await processorModule.resolveGuestContext('quot_abc123');

    expect(result).toMatchObject({
      sessionId: 'sess-en',
      language: 'en',
      guestName: 'John Smith',
    });
    expect(sessionManager.getSession).toHaveBeenCalledWith('sess-en');
  });

  it('defaults to pt when session.language is unsupported', async () => {
    cacheHelpers.cacheGet.mockResolvedValueOnce({
      sessionId: 'sess-fr',
      customerId: 'c1',
      quotationId: 'quot_abc123',
    });
    sessionManager.getSession.mockResolvedValueOnce({
      hotelId: 'h1',
      guestPhone: '+33612345678',
      language: 'fr',
      context: {},
      createdAt: '2026-04-05T10:00:00Z',
      updatedAt: '2026-04-05T10:00:00Z',
    });

    const result = await processorModule.resolveGuestContext('quot_abc123');

    expect(result).toMatchObject({ language: 'pt' });
  });

  it('defaults to pt and undefined guestName when session lookup fails', async () => {
    cacheHelpers.cacheGet.mockResolvedValueOnce({
      sessionId: 'sess-fail',
      customerId: 'c1',
      quotationId: 'quot_abc123',
    });
    sessionManager.getSession.mockRejectedValueOnce(new Error('redis down'));

    const result = await processorModule.resolveGuestContext('quot_abc123');

    expect(result).toMatchObject({
      sessionId: 'sess-fail',
      language: 'pt',
      guestName: undefined,
    });
  });
});

describe('Elevare Webhook — Persona Agent Integration (AC16)', () => {
  const processorModule = jest.requireActual('../../backend/src/webhooks/elevare-processor') as {
    processWebhookEvent: (
      eventId: string,
      eventType: ElevareEventType,
      payload: Record<string, unknown>,
    ) => Promise<WebhookProcessingResult>;
    configureProcessorDeps: (d: unknown) => void;
  };

  let generateResponseStub: jest.Mock;
  let deliverMessageStub: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    generateResponseStub = jest.fn().mockResolvedValue('Senhor Silva, o link expira...');
    deliverMessageStub = jest.fn().mockResolvedValue(undefined);

    processorModule.configureProcessorDeps({
      generateResponse: generateResponseStub,
      deliverMessage: deliverMessageStub,
      regeneratePaymentLink: jest.fn().mockResolvedValue({
        paymentLink: 'link',
        expiresAt: 'x',
      }),
      logger: makeLogger(),
    });

    cacheHelpers.cacheGet.mockResolvedValue({
      sessionId: 'sess-abc',
      customerId: 'c1',
      quotationId: 'quot_abc123',
    });
  });

  // Test 25 — AC16: generateResponse is called
  it('passes follow-up data to Persona Agent via generateResponse', async () => {
    await processorModule.processWebhookEvent(
      'evt-persona',
      'quote_expiring',
      QUOTE_EXPIRING_PAYLOAD,
    );

    expect(generateResponseStub).toHaveBeenCalledTimes(1);
    expect(generateResponseStub).toHaveBeenCalledWith(
      expect.objectContaining({
        toolResults: expect.objectContaining({
          webhookFollowUp: expect.any(Object),
        }),
        language: 'pt',
      }),
    );
  });

  // Test 26 — AC16: processor passes STRUCTURED data, never raw prose
  it('follow-up data contains structured fields only (no raw prose)', async () => {
    await processorModule.processWebhookEvent(
      'evt-struct',
      'quote_expiring',
      QUOTE_EXPIRING_PAYLOAD,
    );

    const callArg = generateResponseStub.mock.calls[0][0];
    const followUp = callArg.toolResults.webhookFollowUp as FollowUpData;

    // Shape check — must be discriminated union with structured fields
    expect(followUp.eventType).toBe('quote_expiring');
    expect(followUp).toHaveProperty('quotationId');
    // No 'message' or 'prose' or 'text' field allowed
    expect(followUp).not.toHaveProperty('message');
    expect(followUp).not.toHaveProperty('prose');
    expect(followUp).not.toHaveProperty('text');
  });

  it('delivers Persona Agent output via deliverMessage to the resolved session', async () => {
    await processorModule.processWebhookEvent(
      'evt-deliver',
      'quote_expiring',
      QUOTE_EXPIRING_PAYLOAD,
    );

    expect(deliverMessageStub).toHaveBeenCalledWith(
      'sess-abc',
      'Senhor Silva, o link expira...',
    );
  });
});

describe('Elevare Webhook — TypeScript Types (AC15)', () => {
  // Test 29 — AC15: types exported correctly (compile-time + runtime contract)
  it('SUPPORTED_EVENT_TYPES contains all 4 supported types', () => {
    expect(SUPPORTED_EVENT_TYPES).toEqual([
      'quote_created',
      'quote_expiring',
      'reservation_confirmed',
      'payment_failed',
    ]);
  });

  it('FollowUpData discriminated union narrows via eventType', () => {
    // Compile-time checks (must not throw at runtime)
    const qc: QuoteCreatedData = { eventType: 'quote_created', quotationId: 'q1' };
    const qe: QuoteExpiringData = {
      eventType: 'quote_expiring',
      quotationId: 'q1',
      expiresAt: 'x',
      hotelName: 'h',
      guestName: 'g',
    };
    const rc: ReservationConfirmedData = {
      eventType: 'reservation_confirmed',
      quotationId: 'q1',
      reservationId: 'r1',
      hotelName: 'h',
      checkIn: 'c1',
      checkOut: 'c2',
      guestName: 'g',
    };
    const pf: PaymentFailedData = {
      eventType: 'payment_failed',
      quotationId: 'q1',
      failureReason: 'card_declined',
      newPaymentLink: 'link',
      guestName: 'g',
    };

    const all: FollowUpData[] = [qc, qe, rc, pf];
    expect(all).toHaveLength(4);
    expect(all.every((d) => typeof d.eventType === 'string')).toBe(true);
  });
});
