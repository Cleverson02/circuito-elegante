import { z } from 'zod';
import { tool } from '@openai/agents';
import type { Redis } from 'ioredis';
import { eq } from 'drizzle-orm';
import type { Logger } from 'winston';
import { getDatabase } from '../../database/client.js';
import { guestProfiles } from '../../database/schema.js';
import type { ElevareClient } from './client.js';
import { ElevareApiError } from './errors.js';

// ─── Types ──────────────────────────────────────────────────────

/**
 * Elevare customer payload (minimalista).
 *
 * Campos obrigatorios per Postman `/global-agent/customers` POST:
 *   primaryPhone, firstName, lastName
 *
 * Opcionais (recomendados para pre-reserva):
 *   email, cpf, birthDate
 *
 * Campos como `address{}`, `gender`, `rg`, `documentType`, etc ficam fora do
 * escopo da Story 3.11 — a Elevare provavelmente coleta dados completos de
 * billing no gateway de pagamento. Se a API rejeitar este payload minimo,
 * Story 3.12 expande com `address` estruturado.
 */
export interface ElevareCustomerPayload {
  primaryPhone: string;           // E.164 format (+5521999998888)
  firstName: string;
  lastName: string;
  email?: string;
  cpf?: string;                   // 11 digits, no formatting
  birthDate?: string;             // ISO YYYY-MM-DD
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
const CPF_DIGITS_REGEX = /^\d{11}$/;
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function validatePayload(payload: ElevareCustomerPayload): void {
  if (!E164_REGEX.test(payload.primaryPhone)) {
    throw new ElevareCustomerValidationError(
      'primaryPhone',
      'must be E.164 format (e.g., +5521999998888)',
    );
  }
  if (!payload.firstName || payload.firstName.trim().length === 0) {
    throw new ElevareCustomerValidationError('firstName', 'must not be empty');
  }
  if (!payload.lastName || payload.lastName.trim().length === 0) {
    throw new ElevareCustomerValidationError('lastName', 'must not be empty');
  }
  if (payload.email && !EMAIL_REGEX.test(payload.email)) {
    throw new ElevareCustomerValidationError('email', 'must be a valid email');
  }
  if (payload.cpf && !CPF_DIGITS_REGEX.test(payload.cpf)) {
    throw new ElevareCustomerValidationError(
      'cpf',
      'must be 11 digits, no formatting',
    );
  }
  if (payload.birthDate && !ISO_DATE_REGEX.test(payload.birthDate)) {
    throw new ElevareCustomerValidationError(
      'birthDate',
      'must be ISO YYYY-MM-DD',
    );
  }
}

// ─── Name Splitting ─────────────────────────────────────────────

/**
 * Splits a full name into first + last. Last-token wins as lastName; rest
 * is firstName. Single-name input yields lastName empty — caller layers
 * (e.g., Stella prompt) should request a full name before reaching this
 * point, but we degrade gracefully.
 */
export function splitName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: '', lastName: '' };
  if (parts.length === 1) return { firstName: parts[0]!, lastName: '' };
  const lastName = parts[parts.length - 1]!;
  const firstName = parts.slice(0, -1).join(' ');
  return { firstName, lastName };
}

// ─── PII Masking ────────────────────────────────────────────────

function maskPhone(phone: string): string {
  if (phone.length < 8) return '***';
  return `${phone.slice(0, 3)}***${phone.slice(-4)}`;
}

function maskEmail(email: string): string {
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
 * Consolidates guest profile data (from PostgreSQL) into the Elevare
 * customer payload minimalista. Throws ElevareCustomerValidationError
 * if required fields (phone, name) are missing or malformed.
 */
export async function extractCustomerData(
  phone: string,
  _sessionId: string,
): Promise<ElevareCustomerPayload> {
  if (!E164_REGEX.test(phone)) {
    throw new ElevareCustomerValidationError(
      'primaryPhone',
      'must be E.164 format (e.g., +5521999998888)',
    );
  }

  const db = getDatabase();
  const rows = await db
    .select({
      name: guestProfiles.name,
      email: guestProfiles.email,
      phoneNumber: guestProfiles.phoneNumber,
    })
    .from(guestProfiles)
    .where(eq(guestProfiles.phoneNumber, phone))
    .limit(1);

  const guest = rows[0];
  if (!guest) {
    throw new ElevareCustomerValidationError(
      'primaryPhone',
      `guest profile not found for phone ${maskPhone(phone)}`,
    );
  }

  if (!guest.name || guest.name.trim().length === 0) {
    throw new ElevareCustomerValidationError(
      'firstName',
      'guest profile has no name — cannot register with Elevare',
    );
  }

  const { firstName, lastName } = splitName(guest.name);

  const payload: ElevareCustomerPayload = {
    primaryPhone: guest.phoneNumber,
    firstName,
    lastName,
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
 * 3. Otherwise, POST /global-agent/customers
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

  const cacheKey = ELEVARE_CUSTOMER_REDIS_KEY(payload.primaryPhone);

  // 1. Check cache
  let cached: string | null = null;
  try {
    cached = await redis.get(cacheKey);
  } catch (err) {
    logger.warn('elevare_customer_cache_read_failed', {
      error: err instanceof Error ? err.message : String(err),
      phoneMasked: maskPhone(payload.primaryPhone),
    });
  }

  if (cached) {
    logger.warn('elevare_customer_cache_hit', {
      customerId: cached,
      phoneMasked: maskPhone(payload.primaryPhone),
    });
    return { customerId: cached };
  }

  // 2. Call API
  try {
    const response = await client.request<ElevareCustomerResponse>(
      '/global-agent/customers',
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
      phoneMasked: maskPhone(payload.primaryPhone),
      emailMasked: payload.email ? maskEmail(payload.email) : null,
    });

    return response;
  } catch (error) {
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
  sessionId: z.string().describe('Active session ID (currently unused; kept for future context enrichment)'),
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
      'Extracts guest data from guest_profiles, validates, registers via API, ' +
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
