/**
 * Unit tests for the Motor de Curadoria (Story 3.4).
 *
 * The module is a pure function — no mocks for infrastructure are needed.
 * Tests use fixture factories to generate representative ElevareOffer arrays.
 */

import {
  curateOptions,
  curateNextPage,
  formatPriceBRL,
  type CuratedOption,
  type CuradoriaConfig,
} from '../../backend/src/services/curadoria';
import type { ElevareOffer, ElevarePhoto } from '../../backend/src/integrations/elevare/types';

// ─── Fixture Factory ────────────────────────────────────────────

interface OfferOverrides {
  offerId?: string;
  roomType?: string;
  ratePlan?: string;
  totalPrice?: number;
  currency?: string;
  nights?: number;
  pricePerNight?: number;
  photos?: ElevarePhoto[];
  amenities?: string[];
}

function createMockOffer(overrides: OfferOverrides = {}): ElevareOffer {
  const totalPrice = overrides.totalPrice ?? 500;
  const nights = overrides.nights ?? 2;
  return {
    offerId: overrides.offerId ?? 'OFF-001',
    roomType: overrides.roomType ?? 'Standard',
    ratePlan: overrides.ratePlan ?? 'Cafe da Manha',
    totalPrice,
    currency: overrides.currency ?? 'BRL',
    nights,
    pricePerNight: overrides.pricePerNight ?? totalPrice / nights,
    photos: overrides.photos ?? [{ url: 'https://cdn/1.jpg', type: 'room' }],
    amenities: overrides.amenities ?? ['Wi-Fi'],
  };
}

function createOffers(count: number, pricesAsc: number[] = []): ElevareOffer[] {
  return Array.from({ length: count }, (_, i) => {
    const price = pricesAsc[i] ?? 200 + i * 50;
    return createMockOffer({
      offerId: `OFF-${String(i + 1).padStart(3, '0')}`,
      totalPrice: price,
      roomType: `Room ${i + 1}`,
    });
  });
}

const defaultConfig: CuradoriaConfig = { bradescoCoupon: false };
const bradescoConfig: CuradoriaConfig = { bradescoCoupon: true };

// ─── Tests ──────────────────────────────────────────────────────

describe('Motor de Curadoria', () => {
  // ═══ curateOptions() — happy path ═══════════════════════════════
  describe('curateOptions() — happy path', () => {
    it('should return 4 options (3 buckets + wildcard) for 15 offers', () => {
      const offers = createOffers(15);
      const result = curateOptions(offers, defaultConfig);

      expect(result.options).toHaveLength(4);
      expect(result.totalAvailable).toBe(15);
      expect(result.hasMore).toBe(true);
      expect(result.page).toBe(1);
      expect(result.options.map((o) => o.priceBucket)).toEqual([
        'budget',
        'mid-range',
        'premium',
        'wildcard',
      ]);
      expect(result.options.map((o) => o.curatedRank)).toEqual([1, 2, 3, 4]);
    });

    it('should return 3 options (3 buckets, no wildcard) for 6 offers', () => {
      const offers = createOffers(6);
      const result = curateOptions(offers, defaultConfig);

      expect(result.options).toHaveLength(3);
      expect(result.options.map((o) => o.priceBucket)).toEqual([
        'budget',
        'mid-range',
        'premium',
      ]);
      expect(result.hasMore).toBe(true);
    });

    it('should return 3 options for 9 offers (no wildcard — below 10 threshold)', () => {
      const offers = createOffers(9);
      const result = curateOptions(offers, defaultConfig);
      expect(result.options).toHaveLength(3);
      expect(result.options.every((o) => o.priceBucket !== 'wildcard')).toBe(true);
    });

    it('should return 4 options for exactly 10 offers (wildcard threshold)', () => {
      const offers = createOffers(10);
      const result = curateOptions(offers, defaultConfig);
      expect(result.options).toHaveLength(4);
      expect(result.options[3]?.priceBucket).toBe('wildcard');
    });
  });

  // ═══ Edge cases — few offers ════════════════════════════════════
  describe('curateOptions() — edge cases: few offers', () => {
    it('should return all 2 offers when input has only 2', () => {
      const offers = createOffers(2, [300, 500]);
      const result = curateOptions(offers, defaultConfig);

      expect(result.options).toHaveLength(2);
      expect(result.hasMore).toBe(false);
      expect(result.totalAvailable).toBe(2);
      expect(result.options.map((o) => o.curatedRank)).toEqual([1, 2]);
    });

    it('should return single offer when input has only 1', () => {
      const offers = createOffers(1, [450]);
      const result = curateOptions(offers, defaultConfig);

      expect(result.options).toHaveLength(1);
      expect(result.options[0]?.curatedRank).toBe(1);
      expect(result.hasMore).toBe(false);
      expect(result.totalAvailable).toBe(1);
    });

    it('should return empty result when input is empty', () => {
      const result = curateOptions([], defaultConfig);

      expect(result.options).toEqual([]);
      expect(result.hasMore).toBe(false);
      expect(result.totalAvailable).toBe(0);
      expect(result.page).toBe(1);
      expect(result.priceRange).toEqual({ min: 0, max: 0 });
      expect(result.priceVariety).toBe('none');
    });

    it('should return all 3 offers with ranks 1-2-3 when input has exactly 3', () => {
      const offers = createOffers(3, [200, 400, 800]);
      const result = curateOptions(offers, defaultConfig);

      expect(result.options).toHaveLength(3);
      expect(result.options.map((o) => o.curatedRank)).toEqual([1, 2, 3]);
      expect(result.options.map((o) => o.priceBucket)).toEqual([
        'budget',
        'mid-range',
        'premium',
      ]);
      expect(result.hasMore).toBe(false);
    });

    it('should never throw on empty input', () => {
      expect(() => curateOptions([], defaultConfig)).not.toThrow();
      expect(() => curateOptions([], bradescoConfig)).not.toThrow();
    });
  });

  // ═══ Price bucket selection rules ═══════════════════════════════
  describe('curateOptions() — price bucket selection', () => {
    it('should prioritize offers with photos within a bucket', () => {
      // 6 offers in 3 buckets of 2. In the budget bucket, put one without
      // photos first (cheaper) and one with photos second (slightly pricier).
      const offers: ElevareOffer[] = [
        createMockOffer({ offerId: 'OFF-A', totalPrice: 100, photos: [] }),
        createMockOffer({
          offerId: 'OFF-B',
          totalPrice: 120,
          photos: [{ url: 'https://x/1.jpg', type: 'room' }],
        }),
        createMockOffer({ offerId: 'OFF-C', totalPrice: 300 }),
        createMockOffer({ offerId: 'OFF-D', totalPrice: 400 }),
        createMockOffer({ offerId: 'OFF-E', totalPrice: 700 }),
        createMockOffer({ offerId: 'OFF-F', totalPrice: 900 }),
      ];
      const result = curateOptions(offers, defaultConfig);

      // Budget bucket pick should be OFF-B (has photos) even though OFF-A is cheaper
      expect(result.options[0]?.offerId).toBe('OFF-B');
      expect(result.options[0]?.priceBucket).toBe('budget');
    });

    it('should break tie by amenities count when both have photos', () => {
      const photo: ElevarePhoto = { url: 'https://x/1.jpg', type: 'room' };
      const offers: ElevareOffer[] = [
        createMockOffer({ offerId: 'OFF-A', totalPrice: 100, photos: [photo], amenities: ['Wi-Fi'] }),
        createMockOffer({
          offerId: 'OFF-B',
          totalPrice: 120,
          photos: [photo],
          amenities: ['Wi-Fi', 'Piscina', 'Spa'],
        }),
        createMockOffer({ offerId: 'OFF-C', totalPrice: 300, photos: [photo] }),
        createMockOffer({ offerId: 'OFF-D', totalPrice: 400, photos: [photo] }),
        createMockOffer({ offerId: 'OFF-E', totalPrice: 700, photos: [photo] }),
        createMockOffer({ offerId: 'OFF-F', totalPrice: 900, photos: [photo] }),
      ];
      const result = curateOptions(offers, defaultConfig);

      // OFF-B has more amenities, wins over the cheaper OFF-A
      expect(result.options[0]?.offerId).toBe('OFF-B');
    });

    it('should break final tie by lowest price when photos & amenities match', () => {
      const photo: ElevarePhoto = { url: 'https://x/1.jpg', type: 'room' };
      const offers: ElevareOffer[] = [
        createMockOffer({ offerId: 'OFF-A', totalPrice: 120, photos: [photo], amenities: ['Wi-Fi'] }),
        createMockOffer({ offerId: 'OFF-B', totalPrice: 100, photos: [photo], amenities: ['Wi-Fi'] }),
        createMockOffer({ offerId: 'OFF-C', totalPrice: 300, photos: [photo] }),
        createMockOffer({ offerId: 'OFF-D', totalPrice: 400, photos: [photo] }),
        createMockOffer({ offerId: 'OFF-E', totalPrice: 700, photos: [photo] }),
        createMockOffer({ offerId: 'OFF-F', totalPrice: 900, photos: [photo] }),
      ];
      const result = curateOptions(offers, defaultConfig);

      // OFF-B is cheaper, wins the final tiebreak
      expect(result.options[0]?.offerId).toBe('OFF-B');
    });

    it('should handle all same price — return first 3 by offerId (priceVariety=none)', () => {
      const offers = [
        createMockOffer({ offerId: 'OFF-Z', totalPrice: 500 }),
        createMockOffer({ offerId: 'OFF-M', totalPrice: 500 }),
        createMockOffer({ offerId: 'OFF-A', totalPrice: 500 }),
        createMockOffer({ offerId: 'OFF-K', totalPrice: 500 }),
        createMockOffer({ offerId: 'OFF-B', totalPrice: 500 }),
        createMockOffer({ offerId: 'OFF-C', totalPrice: 500 }),
      ];
      const result = curateOptions(offers, defaultConfig);

      expect(result.options).toHaveLength(3);
      expect(result.priceVariety).toBe('none');
      // Sorted by offerId ASC: OFF-A, OFF-B, OFF-C, OFF-K, OFF-M, OFF-Z
      // Buckets of 2 each: budget=[A,B], mid=[C,K], premium=[M,Z]
      // Best of each (default photos/amenities identical) -> lowest price -> first offerId
      expect(result.options[0]?.offerId).toBe('OFF-A');
      expect(result.options[1]?.offerId).toBe('OFF-C');
      expect(result.options[2]?.offerId).toBe('OFF-M');
    });

    it('should still return a pick when no offer in a bucket has photos', () => {
      const offers: ElevareOffer[] = [
        createMockOffer({ offerId: 'OFF-A', totalPrice: 100, photos: [] }),
        createMockOffer({ offerId: 'OFF-B', totalPrice: 120, photos: [] }),
        createMockOffer({ offerId: 'OFF-C', totalPrice: 300 }),
        createMockOffer({ offerId: 'OFF-D', totalPrice: 400 }),
        createMockOffer({ offerId: 'OFF-E', totalPrice: 700 }),
        createMockOffer({ offerId: 'OFF-F', totalPrice: 900 }),
      ];
      const result = curateOptions(offers, defaultConfig);

      // Budget bucket has no photos anywhere — fall back to cheapest (OFF-A)
      expect(result.options[0]?.offerId).toBe('OFF-A');
    });
  });

  // ═══ Wildcard ═══════════════════════════════════════════════════
  describe('curateOptions() — wildcard', () => {
    it('should add wildcard (best value per night) when >= 10 offers', () => {
      // 12 offers. Put a ridiculous deal (low price, many nights) at index 4.
      const offers: ElevareOffer[] = createOffers(12);
      // Overwrite offer at index 4 to be a best-value-per-night deal:
      // price 500, 10 nights -> 50/night (lowest)
      offers[4] = createMockOffer({
        offerId: 'OFF-WILDCARD',
        totalPrice: 500,
        nights: 10,
      });

      const result = curateOptions(offers, defaultConfig);
      expect(result.options).toHaveLength(4);

      const wildcard = result.options.find((o) => o.priceBucket === 'wildcard');
      expect(wildcard).toBeDefined();
      expect(wildcard?.offerId).toBe('OFF-WILDCARD');
    });

    it('should not duplicate already-selected offer in wildcard', () => {
      const offers = createOffers(12);
      const result = curateOptions(offers, defaultConfig);

      const offerIds = result.options.map((o) => o.offerId);
      const uniqueIds = new Set(offerIds);
      expect(uniqueIds.size).toBe(offerIds.length);
    });

    it('should not add wildcard when fewer than 10 offers', () => {
      const offers = createOffers(9);
      const result = curateOptions(offers, defaultConfig);
      expect(result.options).toHaveLength(3);
      expect(result.options.every((o) => o.priceBucket !== 'wildcard')).toBe(true);
    });
  });

  // ═══ Determinism ════════════════════════════════════════════════
  describe('curateOptions() — determinism', () => {
    it('should return identical output for identical input — 100 iterations', () => {
      const offers = createOffers(20);
      const first = curateOptions(offers, defaultConfig);
      const firstJson = JSON.stringify(first);

      for (let i = 0; i < 100; i++) {
        const result = curateOptions(offers, defaultConfig);
        expect(JSON.stringify(result)).toBe(firstJson);
      }
    });

    it('should not mutate the input array', () => {
      const offers = createOffers(10);
      const originalOrder = offers.map((o) => o.offerId);
      curateOptions(offers, defaultConfig);
      expect(offers.map((o) => o.offerId)).toEqual(originalOrder);
    });
  });

  // ═══ Bradesco coupon ════════════════════════════════════════════
  describe('curateOptions() — Bradesco coupon', () => {
    it('should apply 10% discount to displayPrice when enabled', () => {
      const offers = createOffers(6, [100, 200, 300, 400, 500, 600]);
      const result = curateOptions(offers, bradescoConfig);

      result.options.forEach((opt) => {
        expect(opt.hasBradescoDiscount).toBe(true);
        expect(opt.displayPrice).toBeCloseTo(opt.totalPrice * 0.9, 2);
      });
    });

    it('should set displayPrice === totalPrice when disabled', () => {
      const offers = createOffers(6);
      const result = curateOptions(offers, defaultConfig);

      result.options.forEach((opt) => {
        expect(opt.hasBradescoDiscount).toBe(false);
        expect(opt.displayPrice).toBe(opt.totalPrice);
        expect(opt.displayPricePerNight).toBe(opt.pricePerNight);
      });
    });

    it('should handle floating point precision correctly (1005 * 0.90 = 904.50)', () => {
      const offers = [
        createMockOffer({ offerId: 'OFF-FP1', totalPrice: 1005.00 }),
        createMockOffer({ offerId: 'OFF-FP2', totalPrice: 1005.00 }),
        createMockOffer({ offerId: 'OFF-FP3', totalPrice: 1005.00 }),
      ];
      const result = curateOptions(offers, bradescoConfig);

      result.options.forEach((opt) => {
        expect(opt.displayPrice).toBe(904.5);
        // Must be a clean 2-decimal number, not 904.4999999999...
        expect(Number.isInteger(opt.displayPrice * 100)).toBe(true);
      });
    });

    it('should handle floating point with 1.005 * 0.90 edge case', () => {
      const offers = [createMockOffer({ offerId: 'OFF-EDGE', totalPrice: 1.005, nights: 1 })];
      const result = curateOptions(offers, bradescoConfig);
      const opt = result.options[0];
      expect(opt).toBeDefined();
      // 1.005 * 0.90 = 0.9045 -> round to centavos = 0.90
      expect(opt?.displayPrice).toBe(0.9);
      expect(Number.isInteger((opt?.displayPrice ?? 0) * 100)).toBe(true);
    });

    it('should always preserve originalPrice regardless of coupon', () => {
      const offers = createOffers(6, [100, 200, 300, 400, 500, 600]);
      const withCoupon = curateOptions(offers, bradescoConfig);
      const withoutCoupon = curateOptions(offers, defaultConfig);

      withCoupon.options.forEach((opt) => {
        expect(opt.originalPrice).toBe(opt.totalPrice);
        expect(opt.originalPrice).not.toBe(opt.displayPrice);
      });
      withoutCoupon.options.forEach((opt) => {
        expect(opt.originalPrice).toBe(opt.totalPrice);
        expect(opt.originalPrice).toBe(opt.displayPrice);
      });
    });
  });

  // ═══ Metadata ═══════════════════════════════════════════════════
  describe('curateOptions() — metadata', () => {
    it('should calculate correct priceRange', () => {
      const offers = createOffers(10, [120, 150, 200, 280, 350, 450, 600, 800, 1200, 1800]);
      const result = curateOptions(offers, defaultConfig);

      expect(result.priceRange.min).toBe(120);
      expect(result.priceRange.max).toBe(1800);
    });

    it('should calculate priceVariety=high for >50% variation', () => {
      const offers = createOffers(6, [100, 200, 400, 600, 800, 1500]); // 15x range
      const result = curateOptions(offers, defaultConfig);
      expect(result.priceVariety).toBe('high');
    });

    it('should calculate priceVariety=low for <20% variation', () => {
      // 500 -> 580: (580-500)/580 = 0.1379 = ~14%
      const offers = createOffers(6, [500, 515, 535, 550, 565, 580]);
      const result = curateOptions(offers, defaultConfig);
      expect(result.priceVariety).toBe('low');
    });

    it('should calculate priceVariety=medium for 20-50% variation', () => {
      // 500 -> 800: (800-500)/800 = 0.375 = 37.5%
      const offers = createOffers(6, [500, 550, 620, 680, 740, 800]);
      const result = curateOptions(offers, defaultConfig);
      expect(result.priceVariety).toBe('medium');
    });

    it('should preserve offerId from each ElevareOffer in CuratedOption', () => {
      const offers = createOffers(10);
      const result = curateOptions(offers, defaultConfig);

      result.options.forEach((opt) => {
        const source = offers.find((o) => o.offerId === opt.offerId);
        expect(source).toBeDefined();
        expect(opt.roomType).toBe(source?.roomType);
      });
    });
  });

  // ═══ Stress / performance ══════════════════════════════════════
  describe('curateOptions() — stress test', () => {
    it('should return 4 options for 50 offers (high volume)', () => {
      const offers = createOffers(50);
      const result = curateOptions(offers, defaultConfig);

      expect(result.options).toHaveLength(4);
      expect(result.totalAvailable).toBe(50);
      expect(result.hasMore).toBe(true);
      expect(result.options.map((o) => o.priceBucket)).toEqual([
        'budget',
        'mid-range',
        'premium',
        'wildcard',
      ]);
    });

    it('should handle skewed distribution (45 cheap + 5 expensive)', () => {
      const prices = [
        ...Array.from({ length: 45 }, (_, i) => 100 + i),
        1500, 1700, 1900, 2100, 2500,
      ];
      const offers = createOffers(50, prices);
      const result = curateOptions(offers, defaultConfig);

      expect(result.options).toHaveLength(4);
      // All three tiers must be represented
      const buckets = result.options.map((o) => o.priceBucket);
      expect(buckets).toContain('budget');
      expect(buckets).toContain('mid-range');
      expect(buckets).toContain('premium');
    });
  });

  // ═══ curateNextPage() ═══════════════════════════════════════════
  describe('curateNextPage()', () => {
    it('should return page 1 via curateOptions when page=1', () => {
      const offers = createOffers(15);
      const page1 = curateNextPage(offers, defaultConfig, 1);
      const curated = curateOptions(offers, defaultConfig);
      expect(JSON.stringify(page1)).toBe(JSON.stringify(curated));
    });

    it('should return next batch excluding previous pages on page 2', () => {
      const offers = createOffers(15);
      const page2 = curateNextPage(offers, defaultConfig, 2);

      expect(page2.page).toBe(2);
      expect(page2.options).toHaveLength(4);
      // page 2 starts at absolute index 4 in the price-sorted list
      // With prices 200, 250, 300, ... -> index 4 => 400
      expect(page2.options[0]?.totalPrice).toBe(400);
      expect(page2.options[3]?.totalPrice).toBe(550);
    });

    it('should return hasMore=false on last page', () => {
      const offers = createOffers(15);
      // With maxOptions=4: page1 offset 0-3, page2 4-7, page3 8-11, page4 12-14 (last)
      const page4 = curateNextPage(offers, defaultConfig, 4);
      expect(page4.hasMore).toBe(false);
      expect(page4.options).toHaveLength(3);
    });

    it('should return empty options when page beyond total', () => {
      const offers = createOffers(8);
      const page99 = curateNextPage(offers, defaultConfig, 99);
      expect(page99.options).toEqual([]);
      expect(page99.hasMore).toBe(false);
      expect(page99.page).toBe(99);
      expect(page99.totalAvailable).toBe(8);
    });

    it('should reset ranks to 1..N on each page', () => {
      const offers = createOffers(15);
      const page2 = curateNextPage(offers, defaultConfig, 2);
      expect(page2.options.map((o) => o.curatedRank)).toEqual([1, 2, 3, 4]);

      const page3 = curateNextPage(offers, defaultConfig, 3);
      expect(page3.options.map((o) => o.curatedRank)).toEqual([1, 2, 3, 4]);
    });

    it('should apply Bradesco discount on page 2+', () => {
      const offers = createOffers(15);
      const page2 = curateNextPage(offers, bradescoConfig, 2);
      page2.options.forEach((opt) => {
        expect(opt.hasBradescoDiscount).toBe(true);
        expect(opt.displayPrice).toBeCloseTo(opt.totalPrice * 0.9, 2);
      });
    });

    it('should throw on invalid page input', () => {
      const offers = createOffers(10);
      expect(() => curateNextPage(offers, defaultConfig, 0)).toThrow();
      expect(() => curateNextPage(offers, defaultConfig, -1)).toThrow();
      expect(() => curateNextPage(offers, defaultConfig, 1.5)).toThrow();
    });

    it('should handle empty offers gracefully on page 2+', () => {
      const result = curateNextPage([], defaultConfig, 2);
      expect(result.options).toEqual([]);
      expect(result.hasMore).toBe(false);
      expect(result.totalAvailable).toBe(0);
    });
  });

  // ═══ formatPriceBRL() ═══════════════════════════════════════════
  describe('formatPriceBRL()', () => {
    it('should format 1250 as "R$ 1.250,00"', () => {
      expect(formatPriceBRL(1250)).toBe('R$ 1.250,00');
    });

    it('should format 0 as "R$ 0,00"', () => {
      expect(formatPriceBRL(0)).toBe('R$ 0,00');
    });

    it('should format 99.90 as "R$ 99,90" (no thousand separator)', () => {
      expect(formatPriceBRL(99.9)).toBe('R$ 99,90');
    });

    it('should format 1000000 as "R$ 1.000.000,00" (two thousand separators)', () => {
      expect(formatPriceBRL(1000000)).toBe('R$ 1.000.000,00');
    });

    it('should format 904.50 as "R$ 904,50"', () => {
      expect(formatPriceBRL(904.5)).toBe('R$ 904,50');
    });

    it('should throw on negative values', () => {
      expect(() => formatPriceBRL(-1)).toThrow();
    });

    it('should throw on NaN', () => {
      expect(() => formatPriceBRL(NaN)).toThrow();
    });
  });

  // ═══ Output shape assertions ════════════════════════════════════
  describe('CuratedOption shape', () => {
    it('should include all required fields per AC9', () => {
      const offers = createOffers(10);
      const result = curateOptions(offers, bradescoConfig);
      const opt = result.options[0] as CuratedOption;

      expect(opt).toHaveProperty('offerId');
      expect(opt).toHaveProperty('roomType');
      expect(opt).toHaveProperty('ratePlan');
      expect(opt).toHaveProperty('totalPrice');
      expect(opt).toHaveProperty('displayPrice');
      expect(opt).toHaveProperty('originalPrice');
      expect(opt).toHaveProperty('hasBradescoDiscount');
      expect(opt).toHaveProperty('nights');
      expect(opt).toHaveProperty('pricePerNight');
      expect(opt).toHaveProperty('displayPricePerNight');
      expect(opt).toHaveProperty('photos');
      expect(opt).toHaveProperty('amenities');
      expect(opt).toHaveProperty('curatedRank');
      expect(opt).toHaveProperty('priceBucket');
    });

    it('should pass photos through transparently from Elevare', () => {
      const photos: ElevarePhoto[] = [
        { url: 'https://cdn/a.jpg', type: 'room', caption: 'Suite' },
        { url: 'https://cdn/b.jpg', type: 'view' },
      ];
      const offers = [
        createMockOffer({ offerId: 'OFF-PIC', totalPrice: 500, photos }),
        createMockOffer({ offerId: 'OFF-X', totalPrice: 600 }),
        createMockOffer({ offerId: 'OFF-Y', totalPrice: 700 }),
      ];
      const result = curateOptions(offers, defaultConfig);
      expect(result.options[0]?.photos).toEqual(photos);
    });
  });
});
