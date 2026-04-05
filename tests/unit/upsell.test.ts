/**
 * Unit tests for Upsell Elegante — Story 3.6.
 *
 * The engine has two surfaces:
 *   1. `detectUpsell()` — 100% pure function (no I/O, no logging).
 *   2. Redis one-shot — `shouldOfferUpsell()` / `markUpsellOffered()`.
 *
 * Config is validated via Zod at first read and memoized. Tests that touch
 * env vars MUST call `resetUpsellConfig()` and clean up in `afterEach`.
 *
 * 28 scenarios per story — adapted: detectUpsell is pure (by design),
 * so logging ACs are validated indirectly (purity tests) rather than by
 * spying on a logger that isn't called.
 */

import {
  detectUpsell,
  shouldOfferUpsell,
  markUpsellOffered,
  UPSELL_REDIS_KEYS,
  type CuratedOffer,
  type UpsellHint,
} from '../../backend/src/services/upsell';
import {
  getUpsellConfig,
  resetUpsellConfig,
  ConfigValidationError,
  UPSELL_THRESHOLD_ENV_VAR,
  DEFAULT_UPSELL_THRESHOLD_PERCENT,
  type UpsellConfig,
} from '../../backend/src/config/upsell';

// ─── Fixture factory ────────────────────────────────────────────

let nextOfferId = 1;

function makeOffer(overrides: Partial<CuratedOffer> = {}): CuratedOffer {
  return {
    offerId: nextOfferId++,
    price: 500,
    name: 'Quarto Superior',
    ...overrides,
  };
}

function resetOfferIds(): void {
  nextOfferId = 1;
}

/** Injects an explicit config into `detectUpsell` so tests avoid env coupling. */
function withThreshold(thresholdPercent: number): UpsellConfig {
  return { thresholdPercent };
}

// ─── Env/config housekeeping ────────────────────────────────────

const ORIGINAL_ENV = process.env[UPSELL_THRESHOLD_ENV_VAR];

function restoreEnv(): void {
  if (ORIGINAL_ENV === undefined) {
    delete process.env[UPSELL_THRESHOLD_ENV_VAR];
  } else {
    process.env[UPSELL_THRESHOLD_ENV_VAR] = ORIGINAL_ENV;
  }
  resetUpsellConfig();
}

beforeEach(() => {
  resetOfferIds();
  resetUpsellConfig();
});

afterEach(() => {
  restoreEnv();
});

// ────────────────────────────────────────────────────────────────
// detectUpsell — Core engine
// ────────────────────────────────────────────────────────────────

describe('detectUpsell — happy path (AC1, AC2)', () => {
  it('scenario 1: detects upgrade within 15% threshold', () => {
    const offers: CuratedOffer[] = [
      makeOffer({ offerId: 1, price: 800, name: 'Standard' }),
      makeOffer({ offerId: 2, price: 900, name: 'Superior' }),
    ];
    const hint = detectUpsell(offers, 0, withThreshold(15));
    expect(hint.detected).toBe(true);
    expect(hint.upgrade?.offerId).toBe(2);
  });

  it('scenario 2: detects upgrade at exactly 15% threshold (boundary)', () => {
    const offers: CuratedOffer[] = [
      makeOffer({ offerId: 1, price: 1000, name: 'Standard' }),
      // 1150 is exactly +15% → within threshold.
      makeOffer({ offerId: 2, price: 1150, name: 'Suite' }),
    ];
    const hint = detectUpsell(offers, 0, withThreshold(15));
    expect(hint.detected).toBe(true);
    expect(hint.upgrade?.priceDiffPercent).toBe(15);
  });

  it('scenario 3: rejects upgrade at 15.01% threshold', () => {
    const offers: CuratedOffer[] = [
      makeOffer({ offerId: 1, price: 1000, name: 'Standard' }),
      // 1150.10 is +15.01% → just over threshold.
      makeOffer({ offerId: 2, price: 1150.1, name: 'Suite' }),
    ];
    const hint = detectUpsell(offers, 0, withThreshold(15));
    expect(hint.detected).toBe(false);
  });
});

describe('detectUpsell — UpsellHint structure (AC3)', () => {
  it('scenario 4: returns complete UpsellHint structure when detected', () => {
    const offers: CuratedOffer[] = [
      makeOffer({ offerId: 10, price: 800, name: 'Standard' }),
      makeOffer({ offerId: 20, price: 900, name: 'Suite Premium' }),
    ];
    const hint = detectUpsell(offers, 0, withThreshold(15));

    expect(hint).toEqual({
      detected: true,
      original: { offerId: 10, price: 800, name: 'Standard' },
      upgrade: {
        offerId: 20,
        price: 900,
        name: 'Suite Premium',
        priceDiff: 100,
        priceDiffPercent: 12.5,
      },
      reason: expect.any(String),
    });
  });
});

describe('detectUpsell — upgrade selection (AC4)', () => {
  it('scenario 5: selects smallest priceDiff when multiple upgrades qualify', () => {
    const offers: CuratedOffer[] = [
      makeOffer({ offerId: 1, price: 1000, name: 'Base' }),
      makeOffer({ offerId: 2, price: 1050, name: 'Plus' }),      // +5%  (smallest)
      makeOffer({ offerId: 3, price: 1120, name: 'Deluxe' }),    // +12%
      makeOffer({ offerId: 4, price: 1140, name: 'Executive' }), // +14%
    ];
    const hint = detectUpsell(offers, 0, withThreshold(15));
    expect(hint.detected).toBe(true);
    expect(hint.upgrade?.offerId).toBe(2);
    expect(hint.upgrade?.priceDiff).toBe(50);
  });
});

describe('detectUpsell — reason derivation (AC5)', () => {
  it('scenario 6: reason derived from amenities diff vs original', () => {
    const offers: CuratedOffer[] = [
      makeOffer({
        offerId: 1,
        price: 800,
        name: 'Standard',
        category: 'room',
        amenities: ['wifi'],
      }),
      makeOffer({
        offerId: 2,
        price: 900,
        name: 'Ocean Suite',
        category: 'suite',
        amenities: ['wifi', 'ocean-view', 'balcony'],
      }),
    ];
    const hint = detectUpsell(offers, 0, withThreshold(15));
    expect(hint.detected).toBe(true);
    // Category changes + two new amenities are in `reason`.
    expect(hint.reason).toContain('suite');
    expect(hint.reason).toContain('ocean-view');
    expect(hint.reason).toContain('balcony');
    // Existing amenity (wifi) is NOT re-listed.
    expect(hint.reason).not.toContain('wifi');
  });

  it('scenario 7: reason falls back to upgrade name when no differential', () => {
    const offers: CuratedOffer[] = [
      makeOffer({ offerId: 1, price: 800, name: 'Standard' }),
      makeOffer({ offerId: 2, price: 900, name: 'Deluxe' }),
    ];
    const hint = detectUpsell(offers, 0, withThreshold(15));
    expect(hint.detected).toBe(true);
    expect(hint.reason).toBe('Deluxe');
  });
});

describe('detectUpsell — anti-pressure contract (AC6)', () => {
  it('scenario 8: UpsellHint carries no scarcity/urgency fields', () => {
    const offers: CuratedOffer[] = [
      makeOffer({ offerId: 1, price: 800, name: 'Standard' }),
      makeOffer({ offerId: 2, price: 900, name: 'Suite' }),
    ];
    const hint = detectUpsell(offers, 0, withThreshold(15));

    // Type-level guarantee is enforced by TypeScript, but we also verify
    // runtime keys to guard against accidental enrichment in the future.
    const forbidden = [
      'availableRooms',
      'lastRoom',
      'limitedTime',
      'expiresIn',
      'onlyToday',
      'urgency',
      'scarcity',
    ];
    for (const key of forbidden) {
      expect(hint).not.toHaveProperty(key);
      if (hint.detected) {
        expect(hint.original).not.toHaveProperty(key);
        expect(hint.upgrade).not.toHaveProperty(key);
      }
    }
  });
});

describe('detectUpsell — edge cases (AC9/AC10/AC11)', () => {
  it('scenario 13: single offer → detected: false (AC9)', () => {
    const offers: CuratedOffer[] = [makeOffer({ price: 800 })];
    expect(detectUpsell(offers, 0, withThreshold(15))).toEqual({ detected: false });
  });

  it('scenario 14: empty offers array → detected: false (AC9)', () => {
    expect(detectUpsell([], 0, withThreshold(15))).toEqual({ detected: false });
  });

  it('scenario 15: all offers same price → detected: false (AC10)', () => {
    const offers: CuratedOffer[] = [
      makeOffer({ price: 1000 }),
      makeOffer({ price: 1000 }),
      makeOffer({ price: 1000 }),
    ];
    expect(detectUpsell(offers, 0, withThreshold(15))).toEqual({ detected: false });
  });

  it('scenario 16: selected is the most expensive → detected: false (AC11)', () => {
    const offers: CuratedOffer[] = [
      makeOffer({ price: 800 }),
      makeOffer({ price: 900 }),
      makeOffer({ price: 1200 }),
    ];
    expect(detectUpsell(offers, 2, withThreshold(15))).toEqual({ detected: false });
  });
});

describe('detectUpsell — defensive guards', () => {
  it('scenario 26: selectedIndex out of bounds (high) → detected: false', () => {
    const offers: CuratedOffer[] = [makeOffer({ price: 800 }), makeOffer({ price: 900 })];
    expect(detectUpsell(offers, 2, withThreshold(15))).toEqual({ detected: false });
    expect(detectUpsell(offers, 99, withThreshold(15))).toEqual({ detected: false });
  });

  it('scenario 27: negative selectedIndex → detected: false', () => {
    const offers: CuratedOffer[] = [makeOffer({ price: 800 }), makeOffer({ price: 900 })];
    expect(detectUpsell(offers, -1, withThreshold(15))).toEqual({ detected: false });
  });

  it('scenario 27b: non-integer selectedIndex → detected: false', () => {
    const offers: CuratedOffer[] = [makeOffer({ price: 800 }), makeOffer({ price: 900 })];
    expect(detectUpsell(offers, 0.5, withThreshold(15))).toEqual({ detected: false });
    expect(detectUpsell(offers, NaN, withThreshold(15))).toEqual({ detected: false });
  });
});

describe('detectUpsell — numeric precision (AC3/AC15/AC25/AC28)', () => {
  it('scenario 25: handles decimal prices correctly (R$ 849.90 vs R$ 929.90)', () => {
    const offers: CuratedOffer[] = [
      makeOffer({ offerId: 1, price: 849.9, name: 'Standard' }),
      makeOffer({ offerId: 2, price: 929.9, name: 'Suite' }),
    ];
    const hint = detectUpsell(offers, 0, withThreshold(15));
    expect(hint.detected).toBe(true);
    expect(hint.upgrade?.priceDiff).toBeCloseTo(80, 5);
    // (80 / 849.90) * 100 ≈ 9.41
    expect(hint.upgrade?.priceDiffPercent).toBe(9.41);
  });

  it('scenario 28: priceDiffPercent rounded to 2 decimal places', () => {
    const offers: CuratedOffer[] = [
      makeOffer({ offerId: 1, price: 333, name: 'Standard' }),
      // 333 + 33 = 366 → exactly 9.909909...% → rounded to 9.91
      makeOffer({ offerId: 2, price: 366, name: 'Upgraded' }),
    ];
    const hint = detectUpsell(offers, 0, withThreshold(15));
    expect(hint.detected).toBe(true);
    // Must have at most 2 decimal places.
    const percent = hint.upgrade?.priceDiffPercent ?? 0;
    expect(Math.round(percent * 100) / 100).toBe(percent);
    expect(percent).toBe(9.91);
  });
});

describe('detectUpsell — custom threshold (AC2/AC12/AC24)', () => {
  it('scenario 24: custom threshold (10%) filters correctly', () => {
    const offers: CuratedOffer[] = [
      makeOffer({ offerId: 1, price: 1000, name: 'Standard' }),
      makeOffer({ offerId: 2, price: 1120, name: 'Plus' }), // +12% → rejected at 10%
    ];
    const hintStrict = detectUpsell(offers, 0, withThreshold(10));
    expect(hintStrict.detected).toBe(false);

    const hintLoose = detectUpsell(offers, 0, withThreshold(15));
    expect(hintLoose.detected).toBe(true);
  });
});

describe('detectUpsell — purity (replaces AC13 logging)', () => {
  it('scenario 22: is deterministic — same input yields same output', () => {
    const offers: CuratedOffer[] = [
      makeOffer({ offerId: 1, price: 800, name: 'Standard' }),
      makeOffer({ offerId: 2, price: 900, name: 'Suite' }),
      makeOffer({ offerId: 3, price: 1500, name: 'Presidential' }),
    ];
    const first = detectUpsell(offers, 0, withThreshold(15));
    const second = detectUpsell(offers, 0, withThreshold(15));
    const third = detectUpsell(offers, 0, withThreshold(15));
    expect(first).toEqual(second);
    expect(second).toEqual(third);
  });

  it('scenario 23: does not mutate its inputs', () => {
    const offers: CuratedOffer[] = [
      makeOffer({ offerId: 1, price: 800, name: 'Standard' }),
      makeOffer({ offerId: 2, price: 900, name: 'Suite' }),
    ];
    const snapshot = JSON.stringify(offers);
    detectUpsell(offers, 0, withThreshold(15));
    expect(JSON.stringify(offers)).toBe(snapshot);
  });
});

// ────────────────────────────────────────────────────────────────
// One-shot Redis logic
// ────────────────────────────────────────────────────────────────

type RedisShouldMock = { get: jest.Mock };
type RedisMarkMock = { set: jest.Mock };

function makeShouldRedis(returnValue: string | null): RedisShouldMock {
  return {
    get: jest.fn().mockResolvedValue(returnValue),
  };
}

function makeMarkRedis(): RedisMarkMock {
  return {
    set: jest.fn().mockResolvedValue('OK'),
  };
}

describe('shouldOfferUpsell — one-shot read (AC7)', () => {
  it('scenario 9: returns true when key does not exist in Redis', async () => {
    const redis = makeShouldRedis(null);
    const ok = await shouldOfferUpsell(redis as never, 'session-123');
    expect(ok).toBe(true);
    expect(redis.get).toHaveBeenCalledWith('upsell_offered:session-123');
  });

  it('scenario 10: returns false when key exists in Redis', async () => {
    const redis = makeShouldRedis('true');
    const ok = await shouldOfferUpsell(redis as never, 'session-123');
    expect(ok).toBe(false);
  });

  it('uses the exposed UPSELL_REDIS_KEYS pattern', () => {
    expect(UPSELL_REDIS_KEYS.upsellOffered('abc')).toBe('upsell_offered:abc');
  });
});

describe('markUpsellOffered — one-shot write (AC8)', () => {
  it('scenario 11: sets key with 24h TTL (86400 seconds)', async () => {
    const redis = makeMarkRedis();
    await markUpsellOffered(redis as never, 'session-xyz');
    expect(redis.set).toHaveBeenCalledWith(
      'upsell_offered:session-xyz',
      'true',
      'EX',
      24 * 60 * 60,
    );
  });

  it('scenario 12: after markUpsellOffered, shouldOfferUpsell returns false', async () => {
    // Simulate a Redis with a single in-memory key.
    const store = new Map<string, string>();
    const redis = {
      get: jest.fn(async (key: string) => store.get(key) ?? null),
      set: jest.fn(async (key: string, value: string) => {
        store.set(key, value);
        return 'OK';
      }),
    };

    expect(await shouldOfferUpsell(redis as never, 'session-42')).toBe(true);
    await markUpsellOffered(redis as never, 'session-42');
    expect(await shouldOfferUpsell(redis as never, 'session-42')).toBe(false);
  });
});

// ────────────────────────────────────────────────────────────────
// Config — getUpsellConfig
// ────────────────────────────────────────────────────────────────

describe('getUpsellConfig — validation (AC12)', () => {
  it('scenario 17: default threshold is 15', () => {
    delete process.env[UPSELL_THRESHOLD_ENV_VAR];
    resetUpsellConfig();
    const cfg = getUpsellConfig();
    expect(cfg.thresholdPercent).toBe(DEFAULT_UPSELL_THRESHOLD_PERCENT);
    expect(cfg.thresholdPercent).toBe(15);
  });

  it('scenario 18: reads from env UPSELL_THRESHOLD_PERCENT', () => {
    process.env[UPSELL_THRESHOLD_ENV_VAR] = '20';
    resetUpsellConfig();
    expect(getUpsellConfig().thresholdPercent).toBe(20);
  });

  it('scenario 19: throws ConfigValidationError for threshold 0', () => {
    process.env[UPSELL_THRESHOLD_ENV_VAR] = '0';
    resetUpsellConfig();
    expect(() => getUpsellConfig()).toThrow(ConfigValidationError);
  });

  it('scenario 20: throws ConfigValidationError for threshold 51', () => {
    process.env[UPSELL_THRESHOLD_ENV_VAR] = '51';
    resetUpsellConfig();
    expect(() => getUpsellConfig()).toThrow(ConfigValidationError);
  });

  it('scenario 21: throws ConfigValidationError for NaN (non-numeric string)', () => {
    process.env[UPSELL_THRESHOLD_ENV_VAR] = 'abc';
    resetUpsellConfig();
    expect(() => getUpsellConfig()).toThrow(ConfigValidationError);
  });

  it('caches the config after the first call', () => {
    process.env[UPSELL_THRESHOLD_ENV_VAR] = '12';
    resetUpsellConfig();
    const first = getUpsellConfig();
    // Change env — cache should still return the previous value.
    process.env[UPSELL_THRESHOLD_ENV_VAR] = '30';
    const second = getUpsellConfig();
    expect(second).toBe(first);
    expect(second.thresholdPercent).toBe(12);
  });

  it('empty string env var falls back to the default', () => {
    process.env[UPSELL_THRESHOLD_ENV_VAR] = '';
    resetUpsellConfig();
    expect(getUpsellConfig().thresholdPercent).toBe(DEFAULT_UPSELL_THRESHOLD_PERCENT);
  });

  it('rejects non-integer thresholds (float)', () => {
    process.env[UPSELL_THRESHOLD_ENV_VAR] = '15.5';
    resetUpsellConfig();
    expect(() => getUpsellConfig()).toThrow(ConfigValidationError);
  });
});

// ────────────────────────────────────────────────────────────────
// Integration — detectUpsell × getUpsellConfig (no explicit config)
// ────────────────────────────────────────────────────────────────

describe('detectUpsell — uses default config when none provided', () => {
  it('honours env-configured threshold when config argument is omitted', () => {
    process.env[UPSELL_THRESHOLD_ENV_VAR] = '5';
    resetUpsellConfig();
    const offers: CuratedOffer[] = [
      makeOffer({ offerId: 1, price: 1000, name: 'Standard' }),
      makeOffer({ offerId: 2, price: 1080, name: 'Plus' }), // +8% → rejected at 5%
    ];
    const hint: UpsellHint = detectUpsell(offers, 0);
    expect(hint.detected).toBe(false);
  });
});
