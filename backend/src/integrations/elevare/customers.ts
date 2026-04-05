import { z } from 'zod';
import { tool } from '@openai/agents';
import type { Redis } from 'ioredis';
import { eq } from 'drizzle-orm';
import type { Logger } from 'winston';
import { getDatabase } from '../../database/client.js';
import { guestProfiles } from '../../database/schema.js';
import { getSession } from '../../state/session-manager.js';
import type { ElevareClient } from './client.js';
import { ElevareApiError } from './errors.js';

// ─── Types ──────────────────────────────────────────────────────

export interface ElevareCustomerPayload {
  name: string;
  email?: string;
  phone: string;
  language: string;
}

export interface ElevareCustomerResponse {
  customerId: string;
}

export class ElevareCustomerValidationError extends Error {
  public readonly field: string;
  public readonly reason: string;

  constructor(field: string, reason: string) {
    super(`Elevare customer validation failed: ${field} — ${reason}`);
    this.name = 'ElevareCustomerValidationError';
    this.field = field;
    this.reason = reason;
  }
}

// ─── Validation ─────────────────────────────────────────────────

const E164_REGEX = /^\+[1-9]\d{1,14}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validatePayload(payload: ElevareCustomerPayload): void {
  if (!payload.name || payload.name.trim().length === 0) {
    throw new ElevareCustomerValidationError('name', 'must not be empty');
  }
  if (!E164_REGEX.test(payload.phone)) {
    throw new ElevareCustomerValidationError(
      'phone',
      'must be E.164 format (e.g., +5521999998888)',
    );
  }
  if (payload.email && !EMAIL_REGEX.test(payload.email)) {
    throw new ElevareCustomerValidationError('email', 'must be a valid email');
  }
}

// ─── PII Masking ────────────────────────────────────────────────

function maskPhone(phone: string): string {
  // +5521999998888 → +55***8888
  if (phone.length < 8) return '***';
  return `${phone.slice(0, 3)}***${phone.slice(-4)}`;
}

function maskEmail(email: string): string {
  // joao@email.com → j***@email.com
  const [local, domain] = email.split('@');
  if (!local || !domain) return '***';
  return `${local[0]}***@${domain}`;
}

// ─── Redis Cache ────────────────────────────────────────────────

export const ELEVARE_CUSTOMER_REDIS_KEY = (phone: string): string =>
  `elevare_customer:${phone}`;

export const ELEVARE_CUSTOMER_CACHE_TTL = 24 * 60 * 60; // 24 hours

// ─── extractCustomerData ────────────────────────────────────────

/**
 * Consolidates guest profile data (from PostgreSQL) + session context (Redis)
 * into the Elevare customer payload format.
 *
 * Throws ElevareCustomerValidationError if required fields are missing
 * or malformed.
 */
export async function extractCustomerData(
  phone: string,
  sessionId: string,
): Promise<ElevareCustomerPayload> {
  if (!E164_REGEX.test(phone)) {
    throw new ElevareCustomerValidationError(
      'phone',
      'must be E.164 format (e.g., +5521999998888)',
    );
  }

  const db = getDatabase();
  const rows = await db
    .select({
      name: guestProfiles.name,
      email: guestProfiles.email,
      phoneNumber: guestProfiles.phoneNumber,
      language: guestProfiles.language,
    })
    .from(guestProfiles)
    .where(eq(guestProfiles.phoneNumber, phone))
    .limit(1);

  const guest = rows[0];
  if (!guest) {
    throw new ElevareCustomerValidationError(
      'phone',
      `guest profile not found for phone ${maskPhone(phone)}`,
    );
  }

  if (!guest.name || guest.name.trim().length === 0) {
    throw new ElevareCustomerValidationError(
      'name',
      'guest profile has no name — cannot register with Elevare',
    );
  }

  // Prefer session language if available (more recent), fallback to guest profile
  const session = await getSession(sessionId);
  const language = session?.language ?? guest.language ?? 'pt';

  const payload: ElevareCustomerPayload = {
    name: guest.name,
    phone: guest.phoneNumber,
    language,
  };

  if (guest.email) {
    payload.email = guest.email;
  }

  validatePayload(payload);
  return payload;
}

// ─── registerCustomer ───────────────────────────────────────────

/**
 * Registers a customer with Elevare API, with Redis caching for idempotency.
 *
 * Flow:
 * 1. Check Redis cache for customerId by phone
 * 2. If cached, return immediately (skip API)
 * 3. Otherwise, POST /customers
 * 4. Cache the returned customerId (TTL 24h)
 * 5. Return customerId
 */
export async function registerCustomer(
  client: ElevareClient,
  redis: Redis,
  logger: Logger,
  payload: ElevareCustomerPayload,
): Promise<ElevareCustomerResponse> {
  validatePayload(payload);

  const cacheKey = ELEVARE_CUSTOMER_REDIS_KEY(payload.phone);

  // 1. Check cache
  let cached: string | null = null;
  try {
    cached = await redis.get(cacheKey);
  } catch (err) {
    logger.warn('elevare_customer_cache_read_failed', {
      error: err instanceof Error ? err.message : String(err),
      phoneMasked: maskPhone(payload.phone),
    });
  }

  if (cached) {
    logger.warn('elevare_customer_cache_hit', {
      customerId: cached,
      phoneMasked: maskPhone(payload.phone),
    });
    return { customerId: cached };
  }

  // 2. Call API
  try {
    const response = await client.request<ElevareCustomerResponse>(
      '/customers',
      'POST',
      payload,
    );

    // 3. Cache result
    try {
      await redis.set(
        cacheKey,
        response.customerId,
        'EX',
        ELEVARE_CUSTOMER_CACHE_TTL,
      );
    } catch (err) {
      logger.error('elevare_customer_cache_write_failed', {
        error: err instanceof Error ? err.message : String(err),
        customerId: response.customerId,
      });
    }

    logger.info('elevare_customer_registered', {
      customerId: response.customerId,
      phoneMasked: maskPhone(payload.phone),
      emailMasked: payload.email ? maskEmail(payload.email) : null,
      language: payload.language,
    });

    return response;
  } catch (error) {
    // Map 4xx → validation error, keep 5xx as ElevareApiError
    if (error instanceof ElevareApiError && error.statusCode >= 400 && error.statusCode < 500) {
      throw new ElevareCustomerValidationError(
        'payload',
        `Elevare rejected customer data (${error.statusCode}): ${error.message}`,
      );
    }
    throw error;
  }
}

// ─── Tool: register_customer ────────────────────────────────────

export const RegisterCustomerParams = z.object({
  phone: z.string().describe('Guest phone number in E.164 format (e.g., +5521999998888)'),
  sessionId: z.string().describe('Active session ID to extract language and context'),
});

export type RegisterCustomerParams = z.infer<typeof RegisterCustomerParams>;

/**
 * Creates the `register_customer` FunctionTool for the Orchestrator Agent.
 * Factory pattern: requires the ElevareClient, Redis, and Logger to be injected.
 */
export function createRegisterCustomerTool(
  client: ElevareClient,
  redis: Redis,
  logger: Logger,
): ReturnType<typeof tool> {
  return tool({
    name: 'register_customer',
    description:
      'Registers the guest as a customer in Elevare before generating a quotation. ' +
      'Extracts guest data from guest_profiles + session, validates, registers via API, ' +
      'caches customerId for 24h. Use during API_BOOKING flow after guest selects an option.',
    parameters: RegisterCustomerParams,
    execute: async (params) => {
      const payload = await extractCustomerData(params.phone, params.sessionId);
      const result = await registerCustomer(client, redis, logger, payload);
      return {
        customerId: result.customerId,
        registered: true,
      };
    },
  });
}
