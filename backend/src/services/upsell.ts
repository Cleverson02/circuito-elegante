/**
 * Upsell Elegante — Story 3.6.
 *
 * The upsell engine identifies, quietly, when a premium option is within
 * reach of the guest's likely selection and hands a structured hint to the
 * Persona Agent so it can craft language-appropriate prose.
 *
 * Philosophy (PRD §3.2/3.3):
 *   - Luxury upsell is curation, not sales. Mention possibilities with
 *     naturalness — never insistence, pressure, or artificial scarcity.
 *   - One-shot per session: once the hint is delivered, the subject dies
 *     for that session. No retries, no nagging.
 *   - When several upgrades qualify, pick the SMALLEST price difference
 *     (guest-friendly) — NOT revenue maximization.
 *
 * Architecture:
 *   `detectUpsell()` is 100% pure — no I/O, no Redis, no logger. Redis
 *   one-shot tracking is exposed separately via `shouldOfferUpsell()` /
 *   `markUpsellOffered()`. This separation is intentional: detection is
 *   a deterministic function of the curated offers; persistence is an
 *   orchestration concern.
 *
 * Anti-pressure by design:
 *   The `UpsellHint` type MUST NOT contain fields such as `availableRooms`,
 *   `lastRoom`, `limitedTime`, `expiresIn`, `onlyToday`, `urgency`. Their
 *   absence is the enforcement — the type system prevents leaks. See
 *   Dev Notes → "Anti-Patterns to AVOID" in `docs/stories/3.6.story.md`.
 */

import type { Redis } from 'ioredis';
import { getUpsellConfig, type UpsellConfig } from '../config/upsell.js';

// ─── Constants ──────────────────────────────────────────────────

/** One-shot TTL: matches the 24h session TTL from REDIS_TTL.session. */
const UPSELL_ONE_SHOT_TTL_SECONDS = 24 * 60 * 60;

/** Redis sentinel value for "already offered". */
const UPSELL_OFFERED_VALUE = 'true';

// ─── Public types ───────────────────────────────────────────────

/**
 * Minimal offer shape consumed by the upsell engine. This is a structural
 * contract: any curated offer producer (e.g. Story 3.4 `CuratedOption`)
 * that exposes these fields may feed the engine.
 *
 * Numeric `offerId` matches the Elevare API offer identifier.
 */
export interface CuratedOffer {
  /** Stable identifier of the offer (Elevare offerId). */
  readonly offerId: number;
  /** Original (pre-discount) price — threshold math uses this field. */
  readonly price: number;
  /** Display name — e.g. "Suíte Vista Mar". */
  readonly name: string;
  /** Optional room category — e.g. "suite", "executive". Used for `reason`. */
  readonly category?: string;
  /** Optional amenity codes — e.g. ["ocean-view", "balcony"]. Used for `reason`. */
  readonly amenities?: readonly string[];
}

/**
 * Structured data describing an upsell opportunity (or the absence of one).
 *
 * **Anti-pressure contract:** this shape intentionally omits any field that
 * could leak scarcity/urgency pressure downstream. Do NOT add such fields.
 */
export interface UpsellHint {
  /** True iff a qualified upgrade exists. */
  readonly detected: boolean;
  /** The selected offer (present only when `detected: true`). */
  readonly original?: {
    readonly offerId: number;
    readonly price: number;
    readonly name: string;
  };
  /** The chosen upgrade (present only when `detected: true`). */
  readonly upgrade?: {
    readonly offerId: number;
    readonly price: number;
    readonly name: string;
    readonly priceDiff: number;
    readonly priceDiffPercent: number;
  };
  /**
   * Structured description of the upgrade's differential — e.g.
   * "suite, ocean-view, balcony". NOT prose: downstream consumers turn this
   * into guest-facing text.
   */
  readonly reason?: string;
}

/** Alias for semantic clarity in call sites that want the "result" name. */
export type UpsellDetectionResult = UpsellHint;

// Re-export config types so consumers don't need to import from two modules.
export type { UpsellConfig } from '../config/upsell.js';

// ─── Redis keys ─────────────────────────────────────────────────

/** Redis key pattern for the one-shot upsell tracker. */
export const UPSELL_REDIS_KEYS = {
  upsellOffered: (sessionId: string): string => `upsell_offered:${sessionId}`,
} as const;

// ─── Internal sentinels ─────────────────────────────────────────

const NO_UPSELL: UpsellHint = Object.freeze({ detected: false });

// ─── detectUpsell — Core Engine (PURE) ──────────────────────────

/**
 * Analyses a curated offer list and returns an `UpsellHint` describing the
 * best-value upgrade (if any) within the configured threshold.
 *
 * PURE FUNCTION — no I/O, no logging, no side effects. Deterministic.
 *
 * @param offers        Curated offers (output of Story 3.4 curation).
 * @param selectedIndex Index (into `offers`) of the guest's current pick.
 * @param config        Optional override; defaults to `getUpsellConfig()`.
 *
 * Returns `{ detected: false }` in any of these cases (AC9/AC10/AC11):
 *   - `offers.length <= 1`           — nothing to compare.
 *   - `selectedIndex` out of bounds  — defensive.
 *   - All offers share the same price — no meaningful upgrade.
 *   - Selected is already the most expensive — already premium.
 *   - No candidate's priceDiff% <= threshold — nothing within reach.
 *
 * When multiple qualified upgrades exist, returns the one with the SMALLEST
 * `priceDiff` (AC4 — guest-friendly, not revenue-max).
 */
export function detectUpsell(
  offers: readonly CuratedOffer[],
  selectedIndex: number,
  config?: UpsellConfig,
): UpsellHint {
  // Guard: need at least 2 offers to have an upgrade candidate (AC9).
  if (offers.length <= 1) {
    return NO_UPSELL;
  }

  // Guard: selectedIndex must be a valid integer in range (AC1 — defensive).
  if (
    !Number.isInteger(selectedIndex) ||
    selectedIndex < 0 ||
    selectedIndex >= offers.length
  ) {
    return NO_UPSELL;
  }

  const selected = offers[selectedIndex];
  if (selected === undefined) {
    // Belt-and-suspenders: noUncheckedIndexedAccess makes this a type-narrowing
    // step. The bounds check above already guarantees it.
    return NO_UPSELL;
  }

  // Guard: all offers share the same price → no meaningful upgrade (AC10).
  const allSamePrice = offers.every((o) => o.price === selected.price);
  if (allSamePrice) {
    return NO_UPSELL;
  }

  // Guard: selected is already the max-priced offer → already premium (AC11).
  const maxPrice = offers.reduce((max, o) => (o.price > max ? o.price : max), selected.price);
  if (selected.price >= maxPrice) {
    return NO_UPSELL;
  }

  // Resolve threshold from injected config or the cached module config.
  const threshold = (config ?? getUpsellConfig()).thresholdPercent;

  // Find candidates strictly more expensive than selected, within threshold,
  // then sort by priceDiff ASC — smallest diff wins (AC4).
  type Scored = {
    offer: CuratedOffer;
    priceDiff: number;
    priceDiffPercent: number;
  };

  const qualified: Scored[] = [];
  for (const o of offers) {
    if (o.price <= selected.price) continue;
    const priceDiff = o.price - selected.price;
    const priceDiffPercent = (priceDiff / selected.price) * 100;
    if (priceDiffPercent <= threshold) {
      qualified.push({ offer: o, priceDiff, priceDiffPercent });
    }
  }

  if (qualified.length === 0) {
    return NO_UPSELL;
  }

  qualified.sort((a, b) => a.priceDiff - b.priceDiff);
  const best = qualified[0];
  if (best === undefined) {
    // Unreachable — `qualified.length === 0` handled above.
    return NO_UPSELL;
  }

  return Object.freeze({
    detected: true,
    original: Object.freeze({
      offerId: selected.offerId,
      price: selected.price,
      name: selected.name,
    }),
    upgrade: Object.freeze({
      offerId: best.offer.offerId,
      price: best.offer.price,
      name: best.offer.name,
      priceDiff: best.priceDiff,
      // 2-decimal rounding for clean analytics/logging (AC3).
      priceDiffPercent: roundTo2(best.priceDiffPercent),
    }),
    reason: deriveReason(selected, best.offer),
  });
}

// ─── One-shot Redis logic ───────────────────────────────────────

/**
 * Returns `true` iff an upsell has NOT yet been offered in this session.
 *
 * AC7 — one-shot enforcement. The Persona Agent should suppress the hint
 * when this returns `false`.
 */
export async function shouldOfferUpsell(
  redis: Pick<Redis, 'get'>,
  sessionId: string,
): Promise<boolean> {
  const value = await redis.get(UPSELL_REDIS_KEYS.upsellOffered(sessionId));
  return value === null;
}

/**
 * Marks the session as having received an upsell. Call AFTER the Persona
 * Agent has actually surfaced the hint to the guest (AC8).
 *
 * TTL: 24h (matches session TTL). Subsequent `shouldOfferUpsell()` calls
 * for the same `sessionId` will return `false` until the key expires.
 */
export async function markUpsellOffered(
  redis: Pick<Redis, 'set'>,
  sessionId: string,
): Promise<void> {
  await redis.set(
    UPSELL_REDIS_KEYS.upsellOffered(sessionId),
    UPSELL_OFFERED_VALUE,
    'EX',
    UPSELL_ONE_SHOT_TTL_SECONDS,
  );
}

// ─── Internal helpers ───────────────────────────────────────────

/**
 * Derives a structured `reason` from the differentials between the original
 * selection and the upgrade. Returns a comma-joined list of structured
 * descriptors (category + new amenities) — NOT prose (AC5).
 *
 * Fallback: returns `upgrade.name` when no meaningful differential exists.
 */
function deriveReason(original: CuratedOffer, upgrade: CuratedOffer): string {
  const parts: string[] = [];

  if (upgrade.category && upgrade.category !== original.category) {
    parts.push(upgrade.category);
  }

  if (upgrade.amenities && upgrade.amenities.length > 0) {
    const originalSet = new Set(original.amenities ?? []);
    for (const amenity of upgrade.amenities) {
      if (!originalSet.has(amenity)) {
        parts.push(amenity);
      }
    }
  }

  return parts.length > 0 ? parts.join(', ') : upgrade.name;
}

/** Rounds to 2 decimal places — avoids float noise in logs/analytics. */
function roundTo2(n: number): number {
  return Math.round(n * 100) / 100;
}
