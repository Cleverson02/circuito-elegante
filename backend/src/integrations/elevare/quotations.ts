import type { Redis } from 'ioredis';
import type { Logger } from 'winston';
import type { ElevareClient } from './client.js';
import { ElevareApiError } from './errors.js';
import { ELEVARE_REDIS_KEYS } from './types.js';

// ─── Types ──────────────────────────────────────────────────────

export interface CreateQuotationParams {
  requestId: string;
  offerId: number;
  customerId: string;
  validityDays?: number;
  includePaymentLink?: boolean;
  customerMessage?: string;
  internalNotes?: string;
  sessionId?: string;
}

export interface CreateQuotationResult {
  quotationId: string;
  paymentLink: string;
  expiresAt: string;
  status: string;
}

export interface RegeneratePaymentLinkParams {
  validityDays?: number;
  reason?: string;
}

export interface RegeneratePaymentLinkResult {
  paymentLink: string;
  expiresAt: string;
}

export interface ExtendQuotationParams {
  additionalDays: number;
  generateNewPaymentLink?: boolean;
}

export interface ExtendQuotationResult {
  expiresAt: string;
  paymentLink?: string;
}

export type QuotationStatus = 'created' | 'active' | 'expiring' | 'expired';

export interface QuotationState {
  quotationId: string;
  paymentLink: string;
  expiresAt: string;
  status: string;
  sessionId: string | null;
  requestId: string;
  offerId: number;
  customerId: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Custom Errors ──────────────────────────────────────────────

export class QuotationApiError extends Error {
  public readonly statusCode: number;
  public readonly endpoint: string;
  public readonly responseBody: unknown;

  constructor(
    message: string,
    statusCode: number,
    endpoint: string,
    responseBody: unknown = null,
  ) {
    super(message);
    this.name = 'QuotationApiError';
    this.statusCode = statusCode;
    this.endpoint = endpoint;
    this.responseBody = responseBody;
  }
}

export class RequestExpiredError extends Error {
  public readonly requestId: string;

  constructor(requestId: string) {
    super(
      `The search context has expired. Please start a new search.`,
    );
    this.name = 'RequestExpiredError';
    this.requestId = requestId;
  }
}

export class InvalidOfferError extends Error {
  public readonly offerId: unknown;

  constructor(offerId: unknown, reason: string) {
    super(`Invalid offer: ${reason}`);
    this.name = 'InvalidOfferError';
    this.offerId = offerId;
  }
}

export class QuotationNotFoundError extends Error {
  public readonly quotationId: string;

  constructor(quotationId: string) {
    super(`Quotation ${quotationId} not found`);
    this.name = 'QuotationNotFoundError';
    this.quotationId = quotationId;
  }
}

// ─── Redis Keys ─────────────────────────────────────────────────

export const QUOTATION_REDIS_KEYS = {
  quotation: (id: string): string => `quotation:${id}`,
  sessionQuotations: (sessionId: string): string =>
    `session_quotations:${sessionId}`,
} as const;

// ─── State Machine ──────────────────────────────────────────────

const CREATED_WINDOW_MS = 5 * 60 * 1000;       // 5 min
const EXPIRING_THRESHOLD_MS = 2 * 60 * 60 * 1000; // 2 h
const TTL_MARGIN_MS = 60 * 60 * 1000;          // 1 h

/**
 * Derives quotation status from expiresAt + createdAt timestamps.
 * Pure function — safe to call from anywhere.
 */
export function deriveQuotationStatus(
  expiresAt: string,
  createdAt?: string,
  now: number = Date.now(),
): QuotationStatus {
  const expiresAtMs = new Date(expiresAt).getTime();

  if (expiresAtMs <= now) {
    return 'expired';
  }

  if (createdAt) {
    const createdAtMs = new Date(createdAt).getTime();
    if (now - createdAtMs < CREATED_WINDOW_MS) {
      return 'created';
    }
  }

  if (expiresAtMs - now <= EXPIRING_THRESHOLD_MS) {
    return 'expiring';
  }

  return 'active';
}

/**
 * Computes dynamic Redis TTL based on expiresAt + 1h margin for cleanup.
 * Returns TTL in seconds. Minimum 60s (avoid negative/zero TTL).
 */
function computeTtlSeconds(expiresAt: string, now: number = Date.now()): number {
  const expiresAtMs = new Date(expiresAt).getTime();
  const ttlMs = expiresAtMs - now + TTL_MARGIN_MS;
  return Math.max(60, Math.ceil(ttlMs / 1000));
}

// ─── Validation ─────────────────────────────────────────────────

function validateOfferId(offerId: unknown): asserts offerId is number {
  if (typeof offerId !== 'number' || !Number.isInteger(offerId) || offerId < 0) {
    throw new InvalidOfferError(
      offerId,
      'offerId must be a non-negative integer',
    );
  }
}

// ─── createQuotation ────────────────────────────────────────────

/**
 * Creates a quotation via Elevare POST /quotations.
 *
 * Flow:
 * 1. Validate offerId is non-negative integer
 * 2. Verify requestId exists in Redis (from Story 3.1 search) — fail with
 *    RequestExpiredError if missing
 * 3. POST /quotations with { requestId, offerId, customerId, ... }
 * 4. Persist QuotationState in Redis with dynamic TTL
 * 5. Add quotationId to session_quotations set (if sessionId provided)
 * 6. Return { quotationId, paymentLink, expiresAt, status }
 */
export async function createQuotation(
  client: ElevareClient,
  redis: Redis,
  logger: Logger,
  params: CreateQuotationParams,
): Promise<CreateQuotationResult> {
  validateOfferId(params.offerId);

  // Verify requestId exists in Redis (from search). Isolates state (FR24).
  const requestKey = ELEVARE_REDIS_KEYS.searchResult(params.requestId);
  const requestExists = await redis.exists(requestKey);
  if (requestExists === 0) {
    throw new RequestExpiredError(params.requestId);
  }

  // Call Elevare API
  const body = {
    customerId: params.customerId,
    offerId: params.offerId,
    requestId: params.requestId,
    validityDays: params.validityDays ?? 1,
    includePaymentLink: params.includePaymentLink ?? true,
    ...(params.customerMessage && { customerMessage: params.customerMessage }),
    ...(params.internalNotes && { internalNotes: params.internalNotes }),
  };

  let response: { data: CreateQuotationResult } | CreateQuotationResult;
  try {
    response = await client.request<
      { data: CreateQuotationResult } | CreateQuotationResult
    >('/global-agent/quotations', 'POST', body);
  } catch (error) {
    if (error instanceof ElevareApiError) {
      throw new QuotationApiError(
        `POST /global-agent/quotations failed: ${error.message}`,
        error.statusCode,
        '/global-agent/quotations',
        error.responseBody,
      );
    }
    throw error;
  }

  // Handle both wrapped ({ data: {...} }) and unwrapped response shapes
  const result: CreateQuotationResult = 'data' in response
    ? response.data
    : response;

  // Persist QuotationState in Redis
  const now = new Date().toISOString();
  const state: QuotationState = {
    quotationId: result.quotationId,
    paymentLink: result.paymentLink,
    expiresAt: result.expiresAt,
    status: result.status,
    sessionId: params.sessionId ?? null,
    requestId: params.requestId,
    offerId: params.offerId,
    customerId: params.customerId,
    createdAt: now,
    updatedAt: now,
  };

  const ttl = computeTtlSeconds(result.expiresAt);
  await redis.set(
    QUOTATION_REDIS_KEYS.quotation(result.quotationId),
    JSON.stringify(state),
    'EX',
    ttl,
  );

  // Track quotation in session (for listing/cleanup)
  if (params.sessionId) {
    await redis.sadd(
      QUOTATION_REDIS_KEYS.sessionQuotations(params.sessionId),
      result.quotationId,
    );
  }

  logger.info('elevare_quotation_created', {
    quotationId: result.quotationId,
    sessionId: params.sessionId ?? null,
    offerId: params.offerId,
    expiresAt: result.expiresAt,
  });

  return result;
}

// ─── regeneratePaymentLink ──────────────────────────────────────

/**
 * Regenerates an expired or expiring payment link for a quotation (FR29).
 * PUT /quotations/{id}/payment-link
 */
export async function regeneratePaymentLink(
  client: ElevareClient,
  redis: Redis,
  logger: Logger,
  quotationId: string,
  params: RegeneratePaymentLinkParams = {},
): Promise<RegeneratePaymentLinkResult> {
  const body = {
    validityDays: params.validityDays ?? 1,
    ...(params.reason && { reason: params.reason }),
  };

  let response: { data: RegeneratePaymentLinkResult } | RegeneratePaymentLinkResult;
  try {
    response = await client.request<
      { data: RegeneratePaymentLinkResult } | RegeneratePaymentLinkResult
    >(`/global-agent/quotations/${encodeURIComponent(quotationId)}/payment-link`, 'PUT', body);
  } catch (error) {
    if (error instanceof ElevareApiError) {
      if (error.statusCode === 404) {
        throw new QuotationNotFoundError(quotationId);
      }
      throw new QuotationApiError(
        `PUT /global-agent/quotations/${quotationId}/payment-link failed: ${error.message}`,
        error.statusCode,
        `/global-agent/quotations/${quotationId}/payment-link`,
        error.responseBody,
      );
    }
    throw error;
  }

  const result: RegeneratePaymentLinkResult = 'data' in response
    ? response.data
    : response;

  // Update Redis state
  const stateKey = QUOTATION_REDIS_KEYS.quotation(quotationId);
  const existing = await redis.get(stateKey);
  if (existing) {
    const state = JSON.parse(existing) as QuotationState;
    state.paymentLink = result.paymentLink;
    state.expiresAt = result.expiresAt;
    state.updatedAt = new Date().toISOString();
    const ttl = computeTtlSeconds(result.expiresAt);
    await redis.set(stateKey, JSON.stringify(state), 'EX', ttl);
  }

  logger.info('elevare_quotation_regenerated', {
    quotationId,
    reason: params.reason ?? null,
    expiresAt: result.expiresAt,
  });

  return result;
}

// ─── extendQuotationValidity ────────────────────────────────────

/**
 * Extends quotation validity (FR30). Optionally generates a new payment link.
 * PUT /quotations/{id}/extend
 */
export async function extendQuotationValidity(
  client: ElevareClient,
  redis: Redis,
  logger: Logger,
  quotationId: string,
  params: ExtendQuotationParams,
): Promise<ExtendQuotationResult> {
  const body = {
    additionalDays: params.additionalDays,
    generateNewPaymentLink: params.generateNewPaymentLink ?? false,
  };

  let response: { data: ExtendQuotationResult } | ExtendQuotationResult;
  try {
    response = await client.request<
      { data: ExtendQuotationResult } | ExtendQuotationResult
    >(`/global-agent/quotations/${encodeURIComponent(quotationId)}/extend`, 'PUT', body);
  } catch (error) {
    if (error instanceof ElevareApiError) {
      if (error.statusCode === 404) {
        throw new QuotationNotFoundError(quotationId);
      }
      throw new QuotationApiError(
        `PUT /global-agent/quotations/${quotationId}/extend failed: ${error.message}`,
        error.statusCode,
        `/global-agent/quotations/${quotationId}/extend`,
        error.responseBody,
      );
    }
    throw error;
  }

  const result: ExtendQuotationResult = 'data' in response
    ? response.data
    : response;

  // Update Redis state
  const stateKey = QUOTATION_REDIS_KEYS.quotation(quotationId);
  const existing = await redis.get(stateKey);
  if (existing) {
    const state = JSON.parse(existing) as QuotationState;
    state.expiresAt = result.expiresAt;
    if (result.paymentLink) {
      state.paymentLink = result.paymentLink;
    }
    state.updatedAt = new Date().toISOString();
    const ttl = computeTtlSeconds(result.expiresAt);
    await redis.set(stateKey, JSON.stringify(state), 'EX', ttl);
  }

  logger.info('elevare_quotation_extended', {
    quotationId,
    additionalDays: params.additionalDays,
    generateNewPaymentLink: params.generateNewPaymentLink ?? false,
    expiresAt: result.expiresAt,
  });

  return result;
}

// ─── getQuotationStatus ─────────────────────────────────────────

export interface GetQuotationStatusResult {
  quotationId: string;
  paymentLink: string;
  expiresAt: string;
  status: string;
  derivedStatus: QuotationStatus;
}

/**
 * Gets the current quotation status from Elevare API, enriched with
 * client-derived status (state machine).
 */
export async function getQuotationStatus(
  client: ElevareClient,
  logger: Logger,
  quotationId: string,
): Promise<GetQuotationStatusResult> {
  let response: { data: GetQuotationStatusResult } | GetQuotationStatusResult;
  try {
    response = await client.request<
      { data: GetQuotationStatusResult } | GetQuotationStatusResult
    >(`/global-agent/quotations/${encodeURIComponent(quotationId)}`, 'GET');
  } catch (error) {
    if (error instanceof ElevareApiError) {
      if (error.statusCode === 404) {
        throw new QuotationNotFoundError(quotationId);
      }
      throw new QuotationApiError(
        `GET /global-agent/quotations/${quotationId} failed: ${error.message}`,
        error.statusCode,
        `/global-agent/quotations/${quotationId}`,
        error.responseBody,
      );
    }
    throw error;
  }

  const data: GetQuotationStatusResult = 'data' in response
    ? response.data
    : response;

  const derivedStatus = deriveQuotationStatus(data.expiresAt);

  logger.info('elevare_quotation_status_queried', {
    quotationId,
    status: data.status,
    derivedStatus,
  });

  return { ...data, derivedStatus };
}

// ─── Helpers ────────────────────────────────────────────────────

/**
 * Retrieves stored quotation state from Redis. Returns null if not found
 * or expired.
 */
export async function getStoredQuotationState(
  redis: Redis,
  quotationId: string,
): Promise<QuotationState | null> {
  const data = await redis.get(QUOTATION_REDIS_KEYS.quotation(quotationId));
  if (!data) return null;
  return JSON.parse(data) as QuotationState;
}
