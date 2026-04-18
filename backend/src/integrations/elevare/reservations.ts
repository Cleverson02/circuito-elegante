import type { Logger } from 'winston';
import type { ElevareClient } from './client.js';
import {
  ElevareApiError,
  ElevareTimeoutError,
  ElevareCircuitOpenError,
} from './errors.js';

// ─── Types ──────────────────────────────────────────────────────

/**
 * Normalized reservation status, mapped from heterogeneous Elevare API values.
 * `unknown` signals a status value that is not in our mapping table — the
 * Persona Agent must fall back to a generic acknowledgement in that case.
 */
export type ReservationStatus =
  | 'confirmed'
  | 'pending_payment'
  | 'cancelled'
  | 'checked_in'
  | 'checked_out'
  | 'unknown';

/**
 * Humanizable reservation data passed to the Persona Agent.
 *
 * ANTI-LEAK BY DESIGN: this interface deliberately omits every technical
 * identifier from the Elevare API (reservationId, hotelId, customerId,
 * requestId, quotationId, offerId). The absence of those fields is the
 * protection — the Persona Agent literally cannot leak what it cannot see.
 *
 * `checkIn` / `checkOut` are ISO 8601 date strings (YYYY-MM-DD). The
 * Persona Agent is responsible for formatting them with Intl.DateTimeFormat
 * in the session language.
 */
export interface ReservationStatusData {
  hotelName: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  status: ReservationStatus;
  roomType: string;
  totalPrice: number;
  currency: string;
  confirmationNumber: string;
}

export type ReservationLookupResult =
  | { found: true; reservations: ReservationStatusData[] }
  | { found: false; error?: boolean; suggestion: 'front_desk' };

export type IdentifierType = 'confirmationNumber' | 'email' | 'phone';

export interface IdentifierInfo {
  type: IdentifierType;
  queryParam: 'confirmationNumber' | 'email' | 'guestPhone';
  value: string;
}

// ─── Identifier Detection ───────────────────────────────────────

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?\d{10,15}$/;

/**
 * Detects whether the guest-supplied identifier is an email, phone number
 * or confirmation code. Order of precedence: email (most specific) → phone
 * (strict digit regex) → confirmationNumber (fallback).
 */
export function detectIdentifierType(identifier: string): IdentifierInfo {
  const trimmed = identifier.trim();

  if (trimmed.includes('@') && EMAIL_REGEX.test(trimmed)) {
    return {
      type: 'email',
      queryParam: 'email',
      value: trimmed.toLowerCase(),
    };
  }

  const phoneNormalized = trimmed.replace(/[\s\-()]/g, '');
  if (PHONE_REGEX.test(phoneNormalized)) {
    const withPlus = phoneNormalized.startsWith('+')
      ? phoneNormalized
      : `+${phoneNormalized}`;
    return {
      type: 'phone',
      queryParam: 'guestPhone',
      value: withPlus,
    };
  }

  return {
    type: 'confirmationNumber',
    queryParam: 'confirmationNumber',
    value: trimmed.toUpperCase(),
  };
}

// ─── PII Masking ────────────────────────────────────────────────

/**
 * Masks PII before logging. Confirmation codes are NOT PII and are
 * returned unchanged.
 */
export function maskPII(value: string, type: IdentifierType): string {
  switch (type) {
    case 'email': {
      const atIndex = value.indexOf('@');
      if (atIndex <= 0) return '***';
      const local = value.slice(0, atIndex);
      const domain = value.slice(atIndex + 1);
      const firstChar = local[0] ?? '*';
      return `${firstChar}***@${domain}`;
    }
    case 'phone': {
      if (value.length < 8) return '***';
      return `${value.slice(0, 4)}***${value.slice(-4)}`;
    }
    default:
      return value;
  }
}

// ─── Status Mapping ─────────────────────────────────────────────

const STATUS_MAP: Record<string, ReservationStatus> = {
  confirmed: 'confirmed',
  active: 'confirmed',
  pending: 'pending_payment',
  pending_payment: 'pending_payment',
  awaiting_payment: 'pending_payment',
  cancelled: 'cancelled',
  canceled: 'cancelled',
  checked_in: 'checked_in',
  in_house: 'checked_in',
  checked_out: 'checked_out',
  departed: 'checked_out',
  completed: 'checked_out',
};

/**
 * Defensively maps an Elevare API status string to our internal enum.
 * Unknown values are logged as warnings and mapped to 'unknown' so the
 * Persona Agent can generate a safe generic acknowledgement.
 */
export function mapStatus(
  elevareStatus: string | null | undefined,
  logger?: Logger,
): ReservationStatus {
  if (elevareStatus == null) {
    logger?.warn('unknown_reservation_status', { elevareStatus: null });
    return 'unknown';
  }
  const normalized = elevareStatus.toLowerCase().trim();
  const mapped = STATUS_MAP[normalized];
  if (!mapped) {
    logger?.warn('unknown_reservation_status', { elevareStatus });
    return 'unknown';
  }
  return mapped;
}

// ─── Response Mapping ───────────────────────────────────────────

interface ElevareRawReservation {
  // IDs técnicos — DESCARTAR
  id?: string;
  reservationId?: string;
  hotelId?: string;
  customerId?: string;
  quotationId?: string;
  offerId?: string;
  requestId?: string;

  // Dados humanizáveis — MANTER
  confirmationNumber?: string;
  hotelName?: string;
  guestName?: string;
  checkIn?: string;
  checkOut?: string;
  status?: string;
  roomType?: string;
  totalPrice?: number;
  currency?: string;
}

interface ElevareReservationsResponse {
  reservations?: ElevareRawReservation[];
  results?: ElevareRawReservation[];
}

function mapToStatusData(
  raw: ElevareRawReservation,
  logger?: Logger,
): ReservationStatusData {
  return {
    hotelName: raw.hotelName ?? 'Hotel',
    guestName: raw.guestName ?? '',
    checkIn: raw.checkIn ?? '',
    checkOut: raw.checkOut ?? '',
    status: mapStatus(raw.status, logger),
    roomType: raw.roomType ?? '',
    totalPrice: typeof raw.totalPrice === 'number' ? raw.totalPrice : 0,
    currency: raw.currency ?? 'BRL',
    confirmationNumber: raw.confirmationNumber ?? '',
  };
}

// ─── getReservations ────────────────────────────────────────────

const RESERVATIONS_ENDPOINT = '/global-agent/reservations';
const DEFAULT_LIMIT = 10;

/**
 * Queries the Elevare Global Agent API for reservations matching the
 * guest-supplied identifier. Never throws — all errors are mapped to a
 * `{ found: false, error: true }` result so the Persona Agent can emit
 * a graceful fallback message.
 *
 * Auth: ElevareClient sends x-client-id + x-client-secret automatically
 * (credentials validated at boot via zod in config.ts).
 *
 * Known ambiguity: Postman documents query params email, confirmationNumber,
 * guestName, checkInFrom, checkInTo, hotelId, limit. `guestPhone` used by
 * detectIdentifierType is NOT in the Postman — pending Elevare confirmation
 * (tracked in Story 3.12 followup).
 */
export async function getReservations(
  client: ElevareClient,
  logger: Logger,
  identifier: string,
): Promise<ReservationLookupResult> {
  const info = detectIdentifierType(identifier);
  const identifierMasked = maskPII(info.value, info.type);
  const queryParams = new URLSearchParams({
    [info.queryParam]: info.value,
    limit: String(DEFAULT_LIMIT),
  });

  try {
    const response = await client.request<ElevareReservationsResponse>(
      `${RESERVATIONS_ENDPOINT}?${queryParams.toString()}`,
      'GET',
    );

    const rawReservations = response.reservations ?? response.results ?? [];
    const reservations = rawReservations.map((r) => mapToStatusData(r, logger));

    if (reservations.length === 0) {
      logger.warn('reservation_not_found', {
        identifierType: info.type,
        identifierMasked,
      });
      return { found: false, suggestion: 'front_desk' };
    }

    logger.info('reservation_lookup', {
      identifierType: info.type,
      identifierMasked,
      resultCount: reservations.length,
    });

    return { found: true, reservations };
  } catch (error) {
    // Known Elevare errors → graceful degradation, never expose to Persona
    if (
      error instanceof ElevareApiError ||
      error instanceof ElevareTimeoutError ||
      error instanceof ElevareCircuitOpenError
    ) {
      const errorName = error.name;
      const errorMessage = error.message;
      logger.error('reservation_lookup_failed', {
        identifierType: info.type,
        identifierMasked,
        errorType: errorName,
        errorMessage,
      });

      // 404 → not found (no error flag); everything else → transient error
      if (error instanceof ElevareApiError && error.statusCode === 404) {
        return { found: false, suggestion: 'front_desk' };
      }
      return { found: false, error: true, suggestion: 'front_desk' };
    }

    // Unknown errors still get mapped to graceful degradation — the tool
    // contract forbids exposing raw errors to the Persona Agent.
    logger.error('reservation_lookup_failed', {
      identifierType: info.type,
      identifierMasked,
      errorType: 'unknown',
      errorMessage: error instanceof Error ? error.message : String(error),
    });
    return { found: false, error: true, suggestion: 'front_desk' };
  }
}
