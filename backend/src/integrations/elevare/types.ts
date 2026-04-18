/**
 * Elevare API — TypeScript types for all request/response payloads.
 *
 * These types mirror the Elevare REST API contracts documented in
 * docs/architecture/architecture.md §6.1.
 *
 * Golden Discovery #1: Photos come directly in the /search response payload.
 * No need to store images in PostgreSQL — they are transactional assets.
 */

// ─── Search Request ─────────────────────────────────────────────

export interface ElevareSearchParams {
  hotelId: string;                // URL param: q
  checkIn: string;                // ISO 8601 date YYYY-MM-DD → URL param: CheckIn
  checkOut: string;               // ISO 8601 date YYYY-MM-DD → URL param: CheckOut
  adults: number;                 // >= 1 → URL param: ad
  children: number;               // >= 0 → URL param: ch
  childrenAges?: number[];        // ages 0-17 → URL param: ag (comma-separated)
}

export interface ElevareMultiSearchParams {
  city?: string;
  region?: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  maxResults?: number;
}

// ─── Search Response ────────────────────────────────────────────

export interface ElevarePhoto {
  url: string;
  caption?: string;
  type: 'room' | 'bathroom' | 'view' | 'general';
}

export interface ElevareOffer {
  offerId: string;
  roomType: string;
  ratePlan: string;
  totalPrice: number;
  currency: string;
  nights: number;
  pricePerNight: number;
  photos: ElevarePhoto[];
  amenities?: string[];
}

export interface ElevareSearchResponse {
  requestId: string;
  results: ElevareOffer[];
}

export interface ElevareMultiSearchHotel {
  hotelId: string;
  hotelName: string;
  results: ElevareOffer[];
}

export interface ElevareMultiSearchResponse {
  requestId: string;
  hotels: ElevareMultiSearchHotel[];
}

// ─── Error Response ─────────────────────────────────────────────

export interface ElevareErrorResponse {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// ─── Circuit Breaker ────────────────────────────────────────────

export type CircuitBreakerStatus = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerState {
  status: CircuitBreakerStatus;
  failureCount: number;
  successCount: number;
  lastFailureAt: number | null;
  nextAttemptAt: number | null;
}

export const CIRCUIT_BREAKER_CONFIG = {
  failureThreshold: 5,
  successThreshold: 3,
  cooldownMs: 60_000,
} as const;

// ─── Redis Storage ──────────────────────────────────────────────

export interface StoredSearchResult {
  requestId: string;
  results: ElevareOffer[];
  storedAt: string; // ISO 8601 timestamp
}

export interface StoredMultiSearchResult {
  requestId: string;
  hotels: ElevareMultiSearchHotel[];
  storedAt: string;
}

// ─── Redis Keys & TTL ───────────────────────────────────────────

export const ELEVARE_REDIS_KEYS = {
  searchResult: (requestId: string) => `elevare:request:${requestId}`,
} as const;

export const ELEVARE_REDIS_TTL = {
  searchResult: 30 * 60, // 30 minutes
} as const;
