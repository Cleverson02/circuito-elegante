/**
 * Motor de Curadoria — Pure function module.
 *
 * Transforms a raw list of Elevare offers (10-50 options) into a curated
 * selection of 3-4 representative options using price-bucket diversity +
 * a "wildcard" best-value pick, with optional Bradesco coupon discount
 * applied to the displayed price.
 *
 * This module is 100% pure:
 *   - NO I/O, NO side effects
 *   - NO external dependencies beyond type imports
 *   - Deterministic output for identical input
 *
 * Flow:
 *   Elevare /search -> ElevareOffer[] -> curateOptions() -> CuratedResult
 *                                     -> Persona Agent (formats prose)
 *                                     -> Correference (maps curatedRank back to offerId)
 *
 * See docs/stories/3.4.story.md for full acceptance criteria and algorithm.
 */

import type { ElevareOffer, ElevarePhoto } from '../integrations/elevare/types.js';

// ─── Constants ──────────────────────────────────────────────────

/** Bradesco coupon discount rate (10%). */
const BRADESCO_DISCOUNT_RATE = 0.10;

/** Default maximum number of options per curated page. */
const DEFAULT_MAX_OPTIONS = 4;

/** Default minimum number of options per curated page. */
const DEFAULT_MIN_OPTIONS = 3;

/** Minimum total offers required before we add a wildcard (4th) option. */
const WILDCARD_MIN_OFFERS = 10;

/** Below this relative delta, all offers are treated as having the same price. */
const PRICE_VARIETY_THRESHOLD_NONE = 0.01;

/** Below this relative delta, price variety is considered 'low'. */
const PRICE_VARIETY_THRESHOLD_LOW = 0.20;

/** Below this relative delta, price variety is considered 'medium'. */
const PRICE_VARIETY_THRESHOLD_MED = 0.50;

// ─── Types ──────────────────────────────────────────────────────

/** Bucket label for a curated option's position in the price distribution. */
export type PriceBucket = 'budget' | 'mid-range' | 'premium' | 'wildcard';

/** Variety classification of the input offers' price distribution. */
export type PriceVariety = 'high' | 'medium' | 'low' | 'none';

/**
 * Config passed to the curadoria engine.
 * `bradescoCoupon` comes from hotels.bradescoCoupon (PostgreSQL, Story 1.2).
 */
export interface CuradoriaConfig {
  /** Whether the hotel accepts a Bradesco coupon (10% off on displayPrice). */
  bradescoCoupon: boolean;
  /** Maximum options per page. Default: 4. */
  maxOptions?: number;
  /** Minimum options per page. Default: 3. */
  minOptions?: number;
}

/**
 * A single curated option — enriched from ElevareOffer with discount,
 * bucket classification, and sequential rank.
 */
export interface CuratedOption {
  /** Preserved from ElevareOffer for correference (Story 3.5). */
  offerId: string;
  roomType: string;
  ratePlan: string;
  /** Original Elevare price (before any discount). */
  totalPrice: number;
  /** Price shown to the guest (may include Bradesco discount). */
  displayPrice: number;
  /** Alias of totalPrice — semantic clarity for the quotation payload. */
  originalPrice: number;
  /** True when a 10% Bradesco discount has been applied to displayPrice. */
  hasBradescoDiscount: boolean;
  nights: number;
  /** Original pricePerNight (totalPrice / nights). */
  pricePerNight: number;
  /** Discounted pricePerNight (displayPrice / nights). */
  displayPricePerNight: number;
  photos: ElevarePhoto[];
  amenities: string[];
  /** Sequential rank 1..N in the current page. Used for correference. */
  curatedRank: number;
  /** Which bucket the option came from. */
  priceBucket: PriceBucket;
}

/** Output of curateOptions() / curateNextPage(). */
export interface CuratedResult {
  options: CuratedOption[];
  /** True when there are more pages beyond the one returned. */
  hasMore: boolean;
  /** 1-indexed page number. */
  page: number;
  /** Total number of offers available in the input. */
  totalAvailable: number;
  /** Min and max totalPrice from the input. */
  priceRange: { min: number; max: number };
  /** Variety classification of the input offers. */
  priceVariety: PriceVariety;
}

// ─── Public API ─────────────────────────────────────────────────

/**
 * Curates a list of Elevare offers into 3-4 representative options using
 * price-bucket diversity + optional best-value wildcard.
 *
 * PURE FUNCTION — identical input always yields identical output.
 */
export function curateOptions(
  offers: ElevareOffer[],
  config: CuradoriaConfig,
): CuratedResult {
  const maxOptions = config.maxOptions ?? DEFAULT_MAX_OPTIONS;
  const minOptions = config.minOptions ?? DEFAULT_MIN_OPTIONS;
  const totalAvailable = offers.length;

  // Empty input guard — never throw
  if (totalAvailable === 0) {
    return {
      options: [],
      hasMore: false,
      page: 1,
      totalAvailable: 0,
      priceRange: { min: 0, max: 0 },
      priceVariety: 'none',
    };
  }

  // Deterministic sort: price ASC, then offerId ASC as tiebreaker
  const sorted = sortByPrice(offers);

  // Fewer than minOptions: return all, no bucketing
  if (totalAvailable < minOptions) {
    const options = sorted.map((offer, index) =>
      toCuratedOption(offer, resolveBucketLabel(index, totalAvailable), index + 1, config.bradescoCoupon),
    );
    return buildResult(options, sorted, totalAvailable, 1, totalAvailable);
  }

  // Exactly minOptions: return all, assign budget/mid/premium labels
  if (totalAvailable === minOptions) {
    const labels: PriceBucket[] = ['budget', 'mid-range', 'premium'];
    const options = sorted.map((offer, index) => {
      // Safe: we just verified length === minOptions (=== 3) so index < 3
      const label = labels[index] ?? 'mid-range';
      return toCuratedOption(offer, label, index + 1, config.bradescoCoupon);
    });
    return buildResult(options, sorted, totalAvailable, 1, totalAvailable);
  }

  // >= 4 offers: bucket into thirds and pick the best from each
  const buckets = splitIntoBuckets(sorted);
  const selectedOffers: Array<{ offer: ElevareOffer; bucket: PriceBucket }> = [];

  const budgetPick = selectBestFromBucket(buckets.budget);
  if (budgetPick) selectedOffers.push({ offer: budgetPick, bucket: 'budget' });

  const midPick = selectBestFromBucket(buckets.mid);
  if (midPick) selectedOffers.push({ offer: midPick, bucket: 'mid-range' });

  const premiumPick = selectBestFromBucket(buckets.premium);
  if (premiumPick) selectedOffers.push({ offer: premiumPick, bucket: 'premium' });

  // Wildcard: add a 4th option when we have enough offers
  if (totalAvailable >= WILDCARD_MIN_OFFERS && selectedOffers.length < maxOptions) {
    const alreadySelectedIds = new Set(selectedOffers.map((s) => s.offer.offerId));
    const wildcard = selectWildcard(sorted, alreadySelectedIds);
    if (wildcard !== null) {
      selectedOffers.push({ offer: wildcard, bucket: 'wildcard' });
    }
  }

  // Transform to CuratedOption with sequential ranks
  const options = selectedOffers.map((sel, i) =>
    toCuratedOption(sel.offer, sel.bucket, i + 1, config.bradescoCoupon),
  );

  return buildResult(options, sorted, totalAvailable, 1, options.length);
}

/**
 * Returns the next page of offers after the initial curated page.
 *
 * Page 1 uses the smart price-bucket algorithm (identical to curateOptions).
 * Page 2+ uses simple pagination over the price-sorted list: the next
 * `maxOptions` offers by ascending price.
 *
 * PURE FUNCTION — offset is deterministic from (page, maxOptions).
 */
export function curateNextPage(
  offers: ElevareOffer[],
  config: CuradoriaConfig,
  page: number,
): CuratedResult {
  if (!Number.isInteger(page) || page < 1) {
    throw new Error(`page must be a positive integer, got: ${String(page)}`);
  }

  const maxOptions = config.maxOptions ?? DEFAULT_MAX_OPTIONS;
  const totalAvailable = offers.length;

  if (page === 1) {
    return curateOptions(offers, config);
  }

  // Empty input — same contract
  if (totalAvailable === 0) {
    return {
      options: [],
      hasMore: false,
      page,
      totalAvailable: 0,
      priceRange: { min: 0, max: 0 },
      priceVariety: 'none',
    };
  }

  const sorted = sortByPrice(offers);
  const offset = (page - 1) * maxOptions;

  // Page beyond total
  if (offset >= totalAvailable) {
    return {
      options: [],
      hasMore: false,
      page,
      totalAvailable,
      priceRange: {
        min: sorted[0]?.totalPrice ?? 0,
        max: sorted[sorted.length - 1]?.totalPrice ?? 0,
      },
      priceVariety: calculatePriceVariety(sorted),
    };
  }

  const slice = sorted.slice(offset, offset + maxOptions);
  // Page 2+ does not re-bucket — classify by position in original sorted list
  const options = slice.map((offer, i) => {
    const absoluteIndex = offset + i;
    const bucket = resolveBucketLabel(absoluteIndex, totalAvailable);
    return toCuratedOption(offer, bucket, i + 1, config.bradescoCoupon);
  });

  return buildResult(options, sorted, totalAvailable, page, offset + options.length);
}

/**
 * Formats a numeric price value as a BRL currency string.
 *
 * Example: `1250` -> `"R$ 1.250,00"`, `99.9` -> `"R$ 99,90"`.
 *
 * Throws when value is negative — a price is never negative in Stella.
 */
export function formatPriceBRL(value: number): string {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    throw new Error(`formatPriceBRL: value must be a number, got: ${String(value)}`);
  }
  if (value < 0) {
    throw new Error(`formatPriceBRL: value must be non-negative, got: ${value}`);
  }

  const formatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  // Intl.NumberFormat('pt-BR', currency=BRL) outputs e.g. "R$\u00A01.250,00"
  // with a non-breaking space (U+00A0). Normalize to a regular ASCII space
  // to match the documented contract "R$ 1.250,00".
  return formatter.format(value).replace(/\u00A0/g, ' ');
}

// ─── Internal Helpers ───────────────────────────────────────────

/**
 * Returns a new array sorted by totalPrice ASC, with offerId string
 * comparison as the deterministic tiebreaker.
 */
function sortByPrice(offers: ElevareOffer[]): ElevareOffer[] {
  return [...offers].sort((a, b) => {
    if (a.totalPrice !== b.totalPrice) return a.totalPrice - b.totalPrice;
    return a.offerId.localeCompare(b.offerId);
  });
}

/**
 * Splits a sorted offer list into three cardinality-based buckets.
 *
 * Uses floor(n/3) for the budget and mid buckets; premium absorbs the
 * remainder so that premium always has >= bucketSize entries.
 */
function splitIntoBuckets(sorted: ElevareOffer[]): {
  budget: ElevareOffer[];
  mid: ElevareOffer[];
  premium: ElevareOffer[];
} {
  const n = sorted.length;
  const bucketSize = Math.floor(n / 3);

  return {
    budget: sorted.slice(0, bucketSize),
    mid: sorted.slice(bucketSize, bucketSize * 2),
    premium: sorted.slice(bucketSize * 2),
  };
}

/**
 * Selects the best offer from a bucket using the priority rules:
 *   1. Has photos (photos.length > 0)
 *   2. More amenities
 *   3. Lowest totalPrice
 *   4. offerId (string compare) for absolute determinism
 *
 * Returns undefined only when the bucket is empty.
 */
function selectBestFromBucket(bucket: ElevareOffer[]): ElevareOffer | undefined {
  if (bucket.length === 0) return undefined;

  const withPhotos = bucket.filter((o) => o.photos.length > 0);
  const candidates = withPhotos.length > 0 ? withPhotos : bucket;

  // Defensive copy before sort
  const ranked = [...candidates].sort((a, b) => {
    const aAmenities = a.amenities?.length ?? 0;
    const bAmenities = b.amenities?.length ?? 0;
    if (aAmenities !== bAmenities) return bAmenities - aAmenities; // more first
    if (a.totalPrice !== b.totalPrice) return a.totalPrice - b.totalPrice;
    return a.offerId.localeCompare(b.offerId);
  });

  return ranked[0];
}

/**
 * Selects the best-value (lowest totalPrice / nights) offer excluding
 * the already-selected offerIds. Returns null when all are taken.
 */
function selectWildcard(
  sorted: ElevareOffer[],
  alreadySelectedIds: Set<string>,
): ElevareOffer | null {
  const remaining = sorted.filter((o) => !alreadySelectedIds.has(o.offerId));
  if (remaining.length === 0) return null;

  const ranked = [...remaining].sort((a, b) => {
    const aPpn = a.nights > 0 ? a.totalPrice / a.nights : Number.POSITIVE_INFINITY;
    const bPpn = b.nights > 0 ? b.totalPrice / b.nights : Number.POSITIVE_INFINITY;
    if (aPpn !== bPpn) return aPpn - bPpn;
    if (a.totalPrice !== b.totalPrice) return a.totalPrice - b.totalPrice;
    return a.offerId.localeCompare(b.offerId);
  });

  return ranked[0] ?? null;
}

/**
 * Classifies price variety based on (max - min) / max relative delta.
 */
function calculatePriceVariety(sorted: ElevareOffer[]): PriceVariety {
  if (sorted.length === 0) return 'none';
  const min = sorted[0]?.totalPrice ?? 0;
  const max = sorted[sorted.length - 1]?.totalPrice ?? 0;
  if (max === 0) return 'none';

  const delta = (max - min) / max;

  if (delta < PRICE_VARIETY_THRESHOLD_NONE) return 'none';
  if (delta < PRICE_VARIETY_THRESHOLD_LOW) return 'low';
  if (delta < PRICE_VARIETY_THRESHOLD_MED) return 'medium';
  return 'high';
}

/**
 * Rounds to centavos (2 decimals) — safer than toFixed() for downstream
 * arithmetic since it returns a number, not a string.
 */
function roundToCentavos(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Transforms an ElevareOffer into a CuratedOption with the given rank
 * and bucket label. Applies Bradesco discount when enabled.
 *
 * originalPrice is ALWAYS preserved as totalPrice — it is used by the
 * quotation payload (Story 3.3) and must never reflect the discount.
 */
function toCuratedOption(
  offer: ElevareOffer,
  bucket: PriceBucket,
  rank: number,
  bradescoCoupon: boolean,
): CuratedOption {
  const amenities = offer.amenities ?? [];
  const pricePerNight = offer.nights > 0
    ? roundToCentavos(offer.totalPrice / offer.nights)
    : offer.totalPrice;

  let displayPrice = offer.totalPrice;
  let displayPricePerNight = pricePerNight;
  let hasBradescoDiscount = false;

  if (bradescoCoupon) {
    displayPrice = roundToCentavos(offer.totalPrice * (1 - BRADESCO_DISCOUNT_RATE));
    displayPricePerNight = offer.nights > 0
      ? roundToCentavos(displayPrice / offer.nights)
      : displayPrice;
    hasBradescoDiscount = true;
  }

  return {
    offerId: offer.offerId,
    roomType: offer.roomType,
    ratePlan: offer.ratePlan,
    totalPrice: offer.totalPrice,
    displayPrice,
    originalPrice: offer.totalPrice,
    hasBradescoDiscount,
    nights: offer.nights,
    pricePerNight,
    displayPricePerNight,
    photos: offer.photos,
    amenities,
    curatedRank: rank,
    priceBucket: bucket,
  };
}

/**
 * Heuristic bucket label for an offer at a given absolute index in the
 * price-sorted list. Used for page 2+ pagination (no re-bucketing).
 */
function resolveBucketLabel(absoluteIndex: number, total: number): PriceBucket {
  if (total <= 0) return 'mid-range';
  const ratio = absoluteIndex / total;
  if (ratio < 1 / 3) return 'budget';
  if (ratio < 2 / 3) return 'mid-range';
  return 'premium';
}

/**
 * Assembles the final CuratedResult with metadata computed from the
 * full sorted list. `returned` is the number of options consumed so
 * far across all pages (determines hasMore).
 */
function buildResult(
  options: CuratedOption[],
  sorted: ElevareOffer[],
  totalAvailable: number,
  page: number,
  consumedTotal: number,
): CuratedResult {
  const min = sorted[0]?.totalPrice ?? 0;
  const max = sorted[sorted.length - 1]?.totalPrice ?? 0;

  return {
    options,
    hasMore: consumedTotal < totalAvailable,
    page,
    totalAvailable,
    priceRange: { min, max },
    priceVariety: calculatePriceVariety(sorted),
  };
}
