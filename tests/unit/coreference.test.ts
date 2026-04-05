import {
  createOfferMap,
  getOfferMap,
  updateOfferMapMessageIds,
  deleteOfferMap,
  invalidateOfferMap,
  resolveCoreference,
  resolveByPosition,
  resolveByMessageId,
  resolveBySuperlative,
  resolveByRelativePosition,
  PositionOutOfRangeError,
  MessageIdNotFoundError,
  type OfferMap,
  type CuratedOption,
} from '../../backend/src/services/coreference';

// Mock Redis client
const mockRedis = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
};

jest.mock('../../backend/src/state/redis-client', () => ({
  getRedisClient: () => mockRedis,
}));

jest.mock('../../backend/src/middleware/logging', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

jest.mock('../../backend/src/api/health', () => ({
  registerHealthChecker: jest.fn(),
}));

// ─── Fixtures ───────────────────────────────────────────────────

const curatedOptions: CuratedOption[] = [
  {
    offerId: 'offer_001',
    requestId: 'req_xyz789',
    roomId: 'room_101',
    ratePlanId: 'rp_breakfast',
    hotelName: 'Hotel Fasano Rio',
    roomType: 'Suite Standard',
    totalPrice: 2400.0,
    currency: 'BRL',
    photoUrl: 'https://cdn.example.com/room_101.jpg',
  },
  {
    offerId: 'offer_002',
    requestId: 'req_xyz789',
    roomId: 'room_201',
    ratePlanId: 'rp_halfboard',
    hotelName: 'Hotel Fasano Rio',
    roomType: 'Suite Master',
    totalPrice: 3800.0,
    currency: 'BRL',
    photoUrl: 'https://cdn.example.com/room_201.jpg',
  },
  {
    offerId: 'offer_003',
    requestId: 'req_xyz789',
    roomId: 'room_301',
    ratePlanId: 'rp_allincl',
    hotelName: 'Hotel Fasano Rio',
    roomType: 'Suite Presidencial',
    totalPrice: 7200.0,
    currency: 'BRL',
    photoUrl: 'https://cdn.example.com/room_301.jpg',
  },
];

function buildOfferMap(options: CuratedOption[]): OfferMap {
  const now = new Date('2026-04-05T14:30:00Z');
  const expires = new Date('2026-04-06T14:30:00Z');
  return {
    sessionId: 'sess_abc123',
    requestId: 'req_xyz789',
    options: options.map((opt, idx) => ({ ...opt, position: idx + 1 })),
    createdAt: now.toISOString(),
    expiresAt: expires.toISOString(),
  };
}

// Prime the mocked get to return this map
function primeGet(map: OfferMap | null): void {
  mockRedis.get.mockResolvedValue(map === null ? null : JSON.stringify(map));
}

describe('Coreference — OfferMap CRUD', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('createOfferMap persists 3 options in Redis under offers:{sessionId} with 24h TTL', async () => {
    mockRedis.set.mockResolvedValue('OK');
    const map = await createOfferMap('sess_abc123', 'req_xyz789', curatedOptions);
    expect(mockRedis.set).toHaveBeenCalledWith(
      'offers:sess_abc123',
      expect.any(String),
      'EX',
      86400,
    );
    expect(map.options).toHaveLength(3);
    expect(map.options[0]?.position).toBe(1);
    expect(map.options[1]?.position).toBe(2);
    expect(map.options[2]?.position).toBe(3);
    expect(map.sessionId).toBe('sess_abc123');
    expect(map.requestId).toBe('req_xyz789');
  });

  it('createOfferMap overwrites previous map (invalidation)', async () => {
    mockRedis.set.mockResolvedValue('OK');
    await createOfferMap('sess_abc123', 'req_first', curatedOptions.slice(0, 1));
    await createOfferMap('sess_abc123', 'req_second', curatedOptions);
    // Both calls use the same key → second call overwrites first
    expect(mockRedis.set).toHaveBeenCalledTimes(2);
    expect(mockRedis.set.mock.calls[0]?.[0]).toBe('offers:sess_abc123');
    expect(mockRedis.set.mock.calls[1]?.[0]).toBe('offers:sess_abc123');
  });

  it('createOfferMap TTL is aligned with session (24h = 86400s)', async () => {
    mockRedis.set.mockResolvedValue('OK');
    await createOfferMap('sess_abc123', 'req_xyz789', curatedOptions);
    expect(mockRedis.set).toHaveBeenCalledWith(
      'offers:sess_abc123',
      expect.any(String),
      'EX',
      86400,
    );
  });

  it('getOfferMap returns null when map does not exist', async () => {
    primeGet(null);
    const result = await getOfferMap('sess_missing');
    expect(result).toBeNull();
    expect(mockRedis.get).toHaveBeenCalledWith('offers:sess_missing');
  });

  it('getOfferMap returns null when stored JSON is malformed', async () => {
    mockRedis.get.mockResolvedValue('{not valid json');
    const result = await getOfferMap('sess_bad');
    expect(result).toBeNull();
  });

  it('updateOfferMapMessageIds updates whatsappMessageId for specified positions', async () => {
    primeGet(buildOfferMap(curatedOptions));
    mockRedis.set.mockResolvedValue('OK');
    const updated = await updateOfferMapMessageIds('sess_abc123', {
      1: 'wa_msg_aaa',
      2: 'wa_msg_bbb',
    });
    expect(updated).not.toBeNull();
    expect(updated?.options[0]?.whatsappMessageId).toBe('wa_msg_aaa');
    expect(updated?.options[1]?.whatsappMessageId).toBe('wa_msg_bbb');
    expect(updated?.options[2]?.whatsappMessageId).toBeUndefined();
    expect(mockRedis.set).toHaveBeenCalledWith(
      'offers:sess_abc123',
      expect.any(String),
      'EX',
      86400,
    );
  });

  it('updateOfferMapMessageIds returns null when map does not exist', async () => {
    primeGet(null);
    const result = await updateOfferMapMessageIds('sess_missing', { 1: 'wa_x' });
    expect(result).toBeNull();
    expect(mockRedis.set).not.toHaveBeenCalled();
  });

  it('deleteOfferMap removes the map key', async () => {
    mockRedis.del.mockResolvedValue(1);
    await deleteOfferMap('sess_abc123');
    expect(mockRedis.del).toHaveBeenCalledWith('offers:sess_abc123');
  });

  it('invalidateOfferMap removes the map key (alias for delete)', async () => {
    mockRedis.del.mockResolvedValue(1);
    await invalidateOfferMap('sess_abc123');
    expect(mockRedis.del).toHaveBeenCalledWith('offers:sess_abc123');
  });
});

describe('Coreference — Internal resolvers', () => {
  const offerMap = buildOfferMap(curatedOptions);

  it('resolveByPosition returns option at valid position', () => {
    const opt = resolveByPosition(offerMap, 2);
    expect(opt.offerId).toBe('offer_002');
    expect(opt.position).toBe(2);
  });

  it('resolveByPosition throws PositionOutOfRangeError for position > length', () => {
    expect(() => resolveByPosition(offerMap, 5)).toThrow(PositionOutOfRangeError);
  });

  it('resolveByPosition throws PositionOutOfRangeError for position < 1', () => {
    expect(() => resolveByPosition(offerMap, 0)).toThrow(PositionOutOfRangeError);
  });

  it('resolveByPosition throws PositionOutOfRangeError for non-integer', () => {
    expect(() => resolveByPosition(offerMap, 1.5)).toThrow(PositionOutOfRangeError);
  });

  it('resolveByMessageId returns option with matching whatsappMessageId', () => {
    const withIds: OfferMap = {
      ...offerMap,
      options: offerMap.options.map((o, i) => ({
        ...o,
        whatsappMessageId: `wa_msg_${i}`,
      })),
    };
    const opt = resolveByMessageId(withIds, 'wa_msg_1');
    expect(opt.offerId).toBe('offer_002');
  });

  it('resolveByMessageId throws MessageIdNotFoundError when id does not match', () => {
    expect(() => resolveByMessageId(offerMap, 'wa_nonexistent')).toThrow(
      MessageIdNotFoundError,
    );
  });

  it('resolveBySuperlative returns cheapest option', () => {
    const opt = resolveBySuperlative(offerMap, 'cheapest');
    expect(opt.offerId).toBe('offer_001'); // 2400
  });

  it('resolveBySuperlative returns most expensive option', () => {
    const opt = resolveBySuperlative(offerMap, 'most_expensive');
    expect(opt.offerId).toBe('offer_003'); // 7200
  });

  it('resolveBySuperlative with equal-priced options returns earliest position', () => {
    const tied: CuratedOption[] = [
      { ...curatedOptions[0]!, totalPrice: 1000 },
      { ...curatedOptions[1]!, totalPrice: 1000 },
      { ...curatedOptions[2]!, totalPrice: 1000 },
    ];
    const tiedMap = buildOfferMap(tied);
    const cheapest = resolveBySuperlative(tiedMap, 'cheapest');
    expect(cheapest.position).toBe(1);
    const expensive = resolveBySuperlative(tiedMap, 'most_expensive');
    expect(expensive.position).toBe(3); // stable sort — last of ties
  });

  it('resolveByRelativePosition("middle") with 3 options returns position 2', () => {
    const opt = resolveByRelativePosition(offerMap, 'middle');
    expect(opt.position).toBe(2);
  });

  it('resolveByRelativePosition("middle") with 4 options returns position 2', () => {
    const four: CuratedOption[] = [
      ...curatedOptions,
      { ...curatedOptions[0]!, offerId: 'offer_004' },
    ];
    const opt = resolveByRelativePosition(buildOfferMap(four), 'middle');
    expect(opt.position).toBe(2);
  });

  it('resolveByRelativePosition("middle") with 2 options returns position 1', () => {
    const two = buildOfferMap(curatedOptions.slice(0, 2));
    const opt = resolveByRelativePosition(two, 'middle');
    expect(opt.position).toBe(1);
  });
});

describe('Coreference — resolveCoreference (main entry)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('resolves "quero a segunda" to position 2', async () => {
    primeGet(buildOfferMap(curatedOptions));
    const result = await resolveCoreference('sess_abc123', {
      text: 'quero a segunda',
      language: 'pt',
    });
    expect(result.resolved).toBe(true);
    if (result.resolved) {
      expect(result.option.position).toBe(2);
      expect(result.option.offerId).toBe('offer_002');
    }
  });

  it('resolves "I want the first one" to position 1 (EN)', async () => {
    primeGet(buildOfferMap(curatedOptions));
    const result = await resolveCoreference('sess_abc123', {
      text: 'I want the first one',
      language: 'en',
    });
    expect(result.resolved).toBe(true);
    if (result.resolved) {
      expect(result.option.position).toBe(1);
    }
  });

  it('resolves "quiero la tercera" to position 3 (ES)', async () => {
    primeGet(buildOfferMap(curatedOptions));
    const result = await resolveCoreference('sess_abc123', {
      text: 'quiero la tercera',
      language: 'es',
    });
    expect(result.resolved).toBe(true);
    if (result.resolved) {
      expect(result.option.position).toBe(3);
    }
  });

  it('resolves "2a opcao" to position 2', async () => {
    primeGet(buildOfferMap(curatedOptions));
    const result = await resolveCoreference('sess_abc123', {
      text: '2a opcao',
    });
    expect(result.resolved).toBe(true);
    if (result.resolved) {
      expect(result.option.position).toBe(2);
    }
  });

  it('resolves "a mais barata" to the cheapest option', async () => {
    primeGet(buildOfferMap(curatedOptions));
    const result = await resolveCoreference('sess_abc123', {
      text: 'a mais barata',
      language: 'pt',
    });
    expect(result.resolved).toBe(true);
    if (result.resolved) {
      expect(result.option.totalPrice).toBe(2400);
      expect(result.option.offerId).toBe('offer_001');
    }
  });

  it('resolves "the most expensive" to the highest-priced option', async () => {
    primeGet(buildOfferMap(curatedOptions));
    const result = await resolveCoreference('sess_abc123', {
      text: 'the most expensive',
      language: 'en',
    });
    expect(result.resolved).toBe(true);
    if (result.resolved) {
      expect(result.option.totalPrice).toBe(7200);
    }
  });

  it('resolves "mas economica" to cheapest (ES)', async () => {
    primeGet(buildOfferMap(curatedOptions));
    const result = await resolveCoreference('sess_abc123', {
      text: 'la mas economica',
      language: 'es',
    });
    expect(result.resolved).toBe(true);
    if (result.resolved) {
      expect(result.option.totalPrice).toBe(2400);
    }
  });

  it('resolves "a do meio" to middle position (3 options → 2)', async () => {
    primeGet(buildOfferMap(curatedOptions));
    const result = await resolveCoreference('sess_abc123', {
      text: 'a do meio',
      language: 'pt',
    });
    expect(result.resolved).toBe(true);
    if (result.resolved) {
      expect(result.option.position).toBe(2);
    }
  });

  it('resolves "the middle one" to middle position (4 options → 2)', async () => {
    const four: CuratedOption[] = [
      ...curatedOptions,
      { ...curatedOptions[0]!, offerId: 'offer_004' },
    ];
    primeGet(buildOfferMap(four));
    const result = await resolveCoreference('sess_abc123', {
      text: 'the middle one',
      language: 'en',
    });
    expect(result.resolved).toBe(true);
    if (result.resolved) {
      expect(result.option.position).toBe(2);
    }
  });

  it('resolves via WhatsApp Reply messageId', async () => {
    const withIds = buildOfferMap(curatedOptions);
    withIds.options[1]!.whatsappMessageId = 'wa_msg_xyz';
    primeGet(withIds);
    const result = await resolveCoreference('sess_abc123', {
      whatsappMessageId: 'wa_msg_xyz',
    });
    expect(result.resolved).toBe(true);
    if (result.resolved) {
      expect(result.option.offerId).toBe('offer_002');
    }
  });

  it('returns clarification when WhatsApp messageId not found and no text provided', async () => {
    primeGet(buildOfferMap(curatedOptions));
    const result = await resolveCoreference('sess_abc123', {
      whatsappMessageId: 'wa_bogus',
    });
    expect(result.resolved).toBe(false);
    if (!result.resolved) {
      expect(result.clarificationNeeded).toBe(true);
      expect(result.message).not.toContain('offer_');
      expect(result.message).not.toContain('room_');
      expect(result.message).not.toContain('wa_bogus');
    }
  });

  it('falls back to text parsing when WhatsApp messageId fails but text matches', async () => {
    primeGet(buildOfferMap(curatedOptions));
    const result = await resolveCoreference('sess_abc123', {
      whatsappMessageId: 'wa_bogus',
      text: 'a terceira',
      language: 'pt',
    });
    expect(result.resolved).toBe(true);
    if (result.resolved) {
      expect(result.option.position).toBe(3);
    }
  });

  it('throws PositionOutOfRangeError when parsed position > options length', async () => {
    primeGet(buildOfferMap(curatedOptions.slice(0, 2))); // only 2 options
    await expect(
      resolveCoreference('sess_abc123', { text: 'a quarta', language: 'pt' }),
    ).rejects.toThrow(PositionOutOfRangeError);
  });

  it('returns mapExpired when OfferMap does not exist', async () => {
    primeGet(null);
    const result = await resolveCoreference('sess_missing', {
      text: 'primeira',
      language: 'pt',
    });
    expect(result.resolved).toBe(false);
    if (!result.resolved) {
      expect(result.mapExpired).toBe(true);
      expect(result.message).toContain('nao estao mais disponiveis');
    }
  });

  it('returns mapExpired with EN message when language=en', async () => {
    primeGet(null);
    const result = await resolveCoreference('sess_missing', {
      text: 'first',
      language: 'en',
    });
    expect(result.resolved).toBe(false);
    if (!result.resolved) {
      expect(result.mapExpired).toBe(true);
      expect(result.message).toContain('no longer available');
    }
  });

  it('auto-resolves when map has exactly 1 option (no ordinal in text)', async () => {
    primeGet(buildOfferMap(curatedOptions.slice(0, 1)));
    const result = await resolveCoreference('sess_abc123', {
      text: 'sim, essa mesmo quero',
      language: 'pt',
    });
    expect(result.resolved).toBe(true);
    if (result.resolved) {
      expect(result.option.position).toBe(1);
    }
  });

  it('auto-resolves single-option map even without text', async () => {
    primeGet(buildOfferMap(curatedOptions.slice(0, 1)));
    const result = await resolveCoreference('sess_abc123', {});
    expect(result.resolved).toBe(true);
  });

  it('returns clarificationNeeded when text has no ordinal and map has multiple options', async () => {
    primeGet(buildOfferMap(curatedOptions));
    const result = await resolveCoreference('sess_abc123', {
      text: 'qual?',
      language: 'pt',
    });
    expect(result.resolved).toBe(false);
    if (!result.resolved) {
      expect(result.clarificationNeeded).toBe(true);
      expect(result.message).toContain('primeira');
      expect(result.message).toContain('segunda');
      expect(result.message).toContain('terceira');
    }
  });

  it('clarification message contains NO technical IDs', async () => {
    primeGet(buildOfferMap(curatedOptions));
    const result = await resolveCoreference('sess_abc123', {
      text: 'hmm nao sei',
      language: 'pt',
    });
    expect(result.resolved).toBe(false);
    if (!result.resolved) {
      expect(result.message).not.toContain('offer_');
      expect(result.message).not.toContain('room_');
      expect(result.message).not.toContain('rp_');
      expect(result.message).not.toContain('req_');
      expect(result.message).not.toMatch(/[0-9a-f]{32}/i); // no hex ids
    }
  });

  it('returns clarificationNeeded when neither text nor messageId provided (multi-option map)', async () => {
    primeGet(buildOfferMap(curatedOptions));
    const result = await resolveCoreference('sess_abc123', {});
    expect(result.resolved).toBe(false);
    if (!result.resolved) {
      expect(result.clarificationNeeded).toBe(true);
    }
  });

  it('language auto-detect resolves PT text without explicit language param', async () => {
    primeGet(buildOfferMap(curatedOptions));
    const result = await resolveCoreference('sess_abc123', {
      text: 'a primeira por favor',
    });
    expect(result.resolved).toBe(true);
    if (result.resolved) {
      expect(result.option.position).toBe(1);
    }
  });

  it('language auto-detect resolves EN text without explicit language param', async () => {
    primeGet(buildOfferMap(curatedOptions));
    const result = await resolveCoreference('sess_abc123', {
      text: 'the second please',
    });
    expect(result.resolved).toBe(true);
    if (result.resolved) {
      expect(result.option.position).toBe(2);
    }
  });

  it('language auto-detect resolves ES text to valid position', async () => {
    // Build a map with 4 options so "la cuarta" (4) is valid
    const fourOptions: CuratedOption[] = [
      ...curatedOptions,
      { ...curatedOptions[0]!, offerId: 'offer_004' },
    ];
    primeGet(buildOfferMap(fourOptions));
    const result = await resolveCoreference('sess_abc123', {
      text: 'la cuarta',
    });
    expect(result.resolved).toBe(true);
    if (result.resolved) {
      expect(result.option.position).toBe(4);
    }
  });

  it('empty text with multi-option map returns clarificationNeeded', async () => {
    primeGet(buildOfferMap(curatedOptions));
    const result = await resolveCoreference('sess_abc123', { text: '   ' });
    expect(result.resolved).toBe(false);
    if (!result.resolved) {
      expect(result.clarificationNeeded).toBe(true);
    }
  });

  it('clarification message in ES uses Spanish positional words', async () => {
    primeGet(buildOfferMap(curatedOptions));
    const result = await resolveCoreference('sess_abc123', {
      text: 'no se',
      language: 'es',
    });
    expect(result.resolved).toBe(false);
    if (!result.resolved) {
      expect(result.message.toLowerCase()).toContain('primera');
      expect(result.message.toLowerCase()).toContain('segunda');
      expect(result.message.toLowerCase()).toContain('tercera');
    }
  });

  it('clarification message in EN uses English positional words', async () => {
    primeGet(buildOfferMap(curatedOptions));
    const result = await resolveCoreference('sess_abc123', {
      text: 'hmm idk',
      language: 'en',
    });
    expect(result.resolved).toBe(false);
    if (!result.resolved) {
      expect(result.message.toLowerCase()).toContain('first');
      expect(result.message.toLowerCase()).toContain('second');
      expect(result.message.toLowerCase()).toContain('third');
    }
  });
});
