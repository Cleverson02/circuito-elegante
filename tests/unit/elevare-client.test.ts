import { ElevareClient } from '../../backend/src/integrations/elevare/client';
import {
  ElevareApiError,
  ElevareTimeoutError,
  ElevareCircuitOpenError,
  ElevareValidationError,
} from '../../backend/src/integrations/elevare/errors';
import {
  searchAndStore,
  multiSearchAndStore,
  getStoredSearchResult,
} from '../../backend/src/integrations/elevare/search';
import { ELEVARE_REDIS_KEYS, ELEVARE_REDIS_TTL } from '../../backend/src/integrations/elevare/types';
import type { ElevareConfig } from '../../backend/src/integrations/elevare/config';
import type { ElevareSearchResponse, ElevareMultiSearchResponse } from '../../backend/src/integrations/elevare/types';

// ─── Mocks ──────────────────────────────────────────────────────

const mockLogger = {
  child: jest.fn().mockReturnThis(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
} as any;

const testConfig: ElevareConfig = {
  apiUrl: 'https://api.elevare.test/v1',
  apiKey: 'test-api-key-secret-123',
  timeoutMs: 8000,
  maxRetries: 3,
};

const mockRedis = {
  set: jest.fn().mockResolvedValue('OK'),
  get: jest.fn().mockResolvedValue(null),
};

function createClient(overrides?: Partial<ElevareConfig>): ElevareClient {
  return new ElevareClient({ ...testConfig, ...overrides }, mockLogger);
}

const SEARCH_PARAMS = {
  hotelId: 'hotel-001',
  checkIn: '2026-08-10',
  checkOut: '2026-08-15',
  adults: 2,
  children: 0,
};

const MULTI_SEARCH_PARAMS = {
  city: 'Búzios',
  checkIn: '2026-08-10',
  checkOut: '2026-08-15',
  adults: 2,
  children: 0,
};

const MOCK_SEARCH_RESPONSE: ElevareSearchResponse = {
  requestId: 'REQ-abc123',
  results: [
    {
      offerId: 'OFF-001',
      roomType: 'Suite Master',
      ratePlan: 'Café da Manhã Incluso',
      totalPrice: 4500.0,
      currency: 'BRL',
      nights: 5,
      pricePerNight: 900.0,
      photos: [
        { url: 'https://cdn.elevare.com/room1.jpg', caption: 'Vista mar', type: 'view' },
        { url: 'https://cdn.elevare.com/room1-bath.jpg', type: 'bathroom' },
      ],
      amenities: ['Wi-Fi', 'Ar-condicionado', 'Frigobar'],
    },
  ],
};

const MOCK_MULTI_RESPONSE: ElevareMultiSearchResponse = {
  requestId: 'REQ-multi-456',
  hotels: [
    {
      hotelId: 'hotel-001',
      hotelName: 'Hotel Búzios Palace',
      results: [MOCK_SEARCH_RESPONSE.results[0]!],
    },
  ],
};

// ─── Test Suite ──────────────────────────────────────────────────

describe('ElevareClient', () => {
  let originalFetch: typeof globalThis.fetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  function mockFetch(
    status: number,
    body: unknown,
    options?: { delay?: number },
  ): void {
    globalThis.fetch = jest.fn().mockImplementation(
      async (_url: string, init: RequestInit) => {
        if (options?.delay) {
          await new Promise<void>((resolve, reject) => {
            const timer = setTimeout(resolve, options.delay);
            init?.signal?.addEventListener('abort', () => {
              clearTimeout(timer);
              reject(new DOMException('The operation was aborted.', 'AbortError'));
            });
          });
        }
        return new Response(JSON.stringify(body), {
          status,
          headers: { 'Content-Type': 'application/json' },
        });
      },
    );
  }

  function mockFetchSequence(responses: Array<{ status: number; body: unknown }>): void {
    let callIndex = 0;
    globalThis.fetch = jest.fn().mockImplementation(async () => {
      const resp = responses[callIndex] ?? responses[responses.length - 1]!;
      callIndex++;
      if (resp.status >= 500) {
        return new Response(JSON.stringify(resp.body), {
          status: resp.status,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify(resp.body), {
        status: resp.status,
        headers: { 'Content-Type': 'application/json' },
      });
    });
  }

  // ─── search() ───────────────────────────────────────────────

  describe('search()', () => {
    it('should return requestId and results with photos on success', async () => {
      mockFetch(200, MOCK_SEARCH_RESPONSE);
      const client = createClient();
      const result = await client.search(SEARCH_PARAMS);

      expect(result.requestId).toBe('REQ-abc123');
      expect(result.results).toHaveLength(1);
      expect(result.results[0]!.photos).toHaveLength(2);
      expect(result.results[0]!.photos[0]!.url).toContain('cdn.elevare.com');
    });

    it('should send X-Api-Key header', async () => {
      mockFetch(200, MOCK_SEARCH_RESPONSE);
      const client = createClient();
      await client.search(SEARCH_PARAMS);

      const fetchCall = (globalThis.fetch as jest.Mock).mock.calls[0] as [string, RequestInit];
      const headers = fetchCall[1].headers as Record<string, string>;
      expect(headers['X-Api-Key']).toBe('test-api-key-secret-123');
    });

    it('should build correct URL with query params', async () => {
      mockFetch(200, MOCK_SEARCH_RESPONSE);
      const client = createClient();
      await client.search(SEARCH_PARAMS);

      const fetchCall = (globalThis.fetch as jest.Mock).mock.calls[0] as [string, RequestInit];
      const url = fetchCall[0];
      expect(url).toContain('/search?');
      expect(url).toContain('hotelId=hotel-001');
      expect(url).toContain('checkIn=2026-08-10');
      expect(url).toContain('adults=2');
    });

    it('should pass photos transparently without processing (Golden Discovery #1)', async () => {
      mockFetch(200, MOCK_SEARCH_RESPONSE);
      const client = createClient();
      const result = await client.search(SEARCH_PARAMS);

      expect(result.results[0]!.photos).toEqual(MOCK_SEARCH_RESPONSE.results[0]!.photos);
    });
  });

  // ─── multiSearch() ──────────────────────────────────────────

  describe('multiSearch()', () => {
    it('should return results grouped by hotel', async () => {
      mockFetch(200, MOCK_MULTI_RESPONSE);
      const client = createClient();
      const result = await client.multiSearch(MULTI_SEARCH_PARAMS);

      expect(result.requestId).toBe('REQ-multi-456');
      expect(result.hotels).toHaveLength(1);
      expect(result.hotels[0]!.hotelName).toBe('Hotel Búzios Palace');
    });

    it('should accept city parameter', async () => {
      mockFetch(200, MOCK_MULTI_RESPONSE);
      const client = createClient();
      await client.multiSearch({ ...MULTI_SEARCH_PARAMS, city: 'Búzios' });

      const fetchCall = (globalThis.fetch as jest.Mock).mock.calls[0] as [string, RequestInit];
      expect(fetchCall[0]).toContain('city=B');
    });

    it('should accept region parameter', async () => {
      mockFetch(200, MOCK_MULTI_RESPONSE);
      const client = createClient();
      await client.multiSearch({ region: 'nordeste', checkIn: '2026-08-10', checkOut: '2026-08-15', adults: 2, children: 0 });

      const fetchCall = (globalThis.fetch as jest.Mock).mock.calls[0] as [string, RequestInit];
      expect(fetchCall[0]).toContain('region=nordeste');
    });

    it('should throw validation error when neither city nor region provided', async () => {
      const client = createClient();
      await expect(
        client.multiSearch({ checkIn: '2026-08-10', checkOut: '2026-08-15', adults: 2, children: 0 }),
      ).rejects.toThrow(ElevareValidationError);
    });
  });

  // ─── Input Validation ───────────────────────────────────────

  describe('input validation', () => {
    it('should throw on invalid date format', async () => {
      const client = createClient();
      await expect(
        client.search({ ...SEARCH_PARAMS, checkIn: '10/08/2026' }),
      ).rejects.toThrow(ElevareValidationError);
    });

    it('should throw on adults < 1', async () => {
      const client = createClient();
      await expect(
        client.search({ ...SEARCH_PARAMS, adults: 0 }),
      ).rejects.toThrow(ElevareValidationError);
    });

    it('should throw on negative children', async () => {
      const client = createClient();
      await expect(
        client.search({ ...SEARCH_PARAMS, children: -1 }),
      ).rejects.toThrow(ElevareValidationError);
    });

    it('should throw on empty hotelId', async () => {
      const client = createClient();
      await expect(
        client.search({ ...SEARCH_PARAMS, hotelId: '' }),
      ).rejects.toThrow(ElevareValidationError);
    });
  });

  // ─── Retry Logic ────────────────────────────────────────────

  describe('retry logic', () => {
    it('should retry on 503 up to maxRetries times', async () => {
      mockFetchSequence([
        { status: 503, body: { code: 'SERVICE_UNAVAILABLE', message: 'Down' } },
        { status: 503, body: { code: 'SERVICE_UNAVAILABLE', message: 'Down' } },
        { status: 503, body: { code: 'SERVICE_UNAVAILABLE', message: 'Down' } },
        { status: 200, body: MOCK_SEARCH_RESPONSE },
      ]);

      const client = createClient({ maxRetries: 3 });
      const result = await client.search(SEARCH_PARAMS);

      expect(result.requestId).toBe('REQ-abc123');
      expect(globalThis.fetch).toHaveBeenCalledTimes(4); // 1 initial + 3 retries
    });

    it('should NOT retry on 400 client error', async () => {
      mockFetch(400, { code: 'BAD_REQUEST', message: 'Invalid params' });
      const client = createClient();

      await expect(client.search(SEARCH_PARAMS)).rejects.toThrow(ElevareApiError);
      expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    });

    it('should NOT retry on 401 unauthorized', async () => {
      mockFetch(401, { code: 'UNAUTHORIZED', message: 'Invalid API key' });
      const client = createClient();

      await expect(client.search(SEARCH_PARAMS)).rejects.toThrow(ElevareApiError);
      expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    });

    it('should succeed on 3rd attempt after 2 failures', async () => {
      mockFetchSequence([
        { status: 500, body: { code: 'INTERNAL', message: 'Error' } },
        { status: 502, body: { code: 'BAD_GATEWAY', message: 'Error' } },
        { status: 200, body: MOCK_SEARCH_RESPONSE },
      ]);

      const client = createClient({ maxRetries: 3 });
      const result = await client.search(SEARCH_PARAMS);

      expect(result.requestId).toBe('REQ-abc123');
      expect(globalThis.fetch).toHaveBeenCalledTimes(3);
    });

    it('should throw after exhausting all retries', async () => {
      mockFetchSequence([
        { status: 500, body: { code: 'INTERNAL', message: 'Error' } },
        { status: 500, body: { code: 'INTERNAL', message: 'Error' } },
        { status: 500, body: { code: 'INTERNAL', message: 'Error' } },
        { status: 500, body: { code: 'INTERNAL', message: 'Error' } },
      ]);

      const client = createClient({ maxRetries: 3 });
      await expect(client.search(SEARCH_PARAMS)).rejects.toThrow(ElevareApiError);
      expect(globalThis.fetch).toHaveBeenCalledTimes(4);
    });
  });

  // ─── Timeout ────────────────────────────────────────────────

  describe('timeout', () => {
    it('should abort after timeoutMs and throw ElevareTimeoutError', async () => {
      mockFetch(200, MOCK_SEARCH_RESPONSE, { delay: 15000 });
      const client = createClient({ timeoutMs: 50, maxRetries: 0 });

      await expect(client.search(SEARCH_PARAMS)).rejects.toThrow(ElevareTimeoutError);
    });

    it('should include timeoutMs in the error', async () => {
      mockFetch(200, MOCK_SEARCH_RESPONSE, { delay: 15000 });
      const client = createClient({ timeoutMs: 50, maxRetries: 0 });

      try {
        await client.search(SEARCH_PARAMS);
        expect(true).toBe(false); // Should not reach
      } catch (error) {
        expect(error).toBeInstanceOf(ElevareTimeoutError);
        expect((error as ElevareTimeoutError).timeoutMs).toBe(50);
      }
    });
  });

  // ─── Circuit Breaker ────────────────────────────────────────

  describe('circuit breaker', () => {
    it('should start in CLOSED state', () => {
      const client = createClient();
      expect(client.getCircuitBreakerState().status).toBe('CLOSED');
    });

    it('should open after 5 consecutive failures', async () => {
      mockFetch(500, { code: 'INTERNAL', message: 'Error' });
      const client = createClient({ maxRetries: 0 });

      for (let i = 0; i < 5; i++) {
        await expect(client.search(SEARCH_PARAMS)).rejects.toThrow(ElevareApiError);
      }

      expect(client.getCircuitBreakerState().status).toBe('OPEN');
    });

    it('should throw ElevareCircuitOpenError when circuit is open', async () => {
      mockFetch(500, { code: 'INTERNAL', message: 'Error' });
      const client = createClient({ maxRetries: 0 });

      for (let i = 0; i < 5; i++) {
        await expect(client.search(SEARCH_PARAMS)).rejects.toThrow(ElevareApiError);
      }

      // 6th call should get circuit open error without making HTTP request
      await expect(client.search(SEARCH_PARAMS)).rejects.toThrow(ElevareCircuitOpenError);
      expect(globalThis.fetch).toHaveBeenCalledTimes(5); // Not 6
    });

    it('should transition to HALF_OPEN after cooldown', async () => {
      jest.useFakeTimers();
      mockFetch(500, { code: 'INTERNAL', message: 'Error' });
      const client = createClient({ maxRetries: 0 });

      for (let i = 0; i < 5; i++) {
        await expect(client.search(SEARCH_PARAMS)).rejects.toThrow(ElevareApiError);
      }

      expect(client.getCircuitBreakerState().status).toBe('OPEN');

      // Advance time past cooldown
      jest.advanceTimersByTime(61_000);

      // Next call should be allowed (half-open)
      mockFetch(200, MOCK_SEARCH_RESPONSE);
      const result = await client.search(SEARCH_PARAMS);
      expect(result.requestId).toBe('REQ-abc123');
    });

    it('should close after 3 successes in HALF_OPEN', async () => {
      jest.useFakeTimers();
      mockFetch(500, { code: 'INTERNAL', message: 'Error' });
      const client = createClient({ maxRetries: 0 });

      // Open the circuit
      for (let i = 0; i < 5; i++) {
        await expect(client.search(SEARCH_PARAMS)).rejects.toThrow(ElevareApiError);
      }

      jest.advanceTimersByTime(61_000);
      mockFetch(200, MOCK_SEARCH_RESPONSE);

      // 3 successes in half-open → CLOSED
      await client.search(SEARCH_PARAMS);
      await client.search(SEARCH_PARAMS);
      await client.search(SEARCH_PARAMS);

      expect(client.getCircuitBreakerState().status).toBe('CLOSED');
    });

    it('should re-open on failure during HALF_OPEN', async () => {
      jest.useFakeTimers();
      const client = createClient({ maxRetries: 0 });

      // Open the circuit with 500s
      globalThis.fetch = jest.fn().mockResolvedValue(
        new Response(JSON.stringify({ code: 'INTERNAL', message: 'Error' }), { status: 500 }),
      );
      for (let i = 0; i < 5; i++) {
        await expect(client.search(SEARCH_PARAMS)).rejects.toThrow();
      }

      jest.advanceTimersByTime(61_000);

      // Fail during half-open
      await expect(client.search(SEARCH_PARAMS)).rejects.toThrow(ElevareApiError);
      expect(client.getCircuitBreakerState().status).toBe('OPEN');
    });

    it('should reset failure count on success in CLOSED state', async () => {
      const client = createClient({ maxRetries: 0 });

      // 3 failures
      globalThis.fetch = jest.fn().mockResolvedValue(
        new Response(JSON.stringify({ code: 'ERR', message: 'Error' }), { status: 500 }),
      );
      for (let i = 0; i < 3; i++) {
        await expect(client.search(SEARCH_PARAMS)).rejects.toThrow();
      }
      expect(client.getCircuitBreakerState().failureCount).toBe(3);

      // 1 success resets
      mockFetch(200, MOCK_SEARCH_RESPONSE);
      await client.search(SEARCH_PARAMS);
      expect(client.getCircuitBreakerState().failureCount).toBe(0);
    });
  });

  // ─── Logging ────────────────────────────────────────────────

  describe('logging', () => {
    it('should log request with endpoint', async () => {
      mockFetch(200, MOCK_SEARCH_RESPONSE);
      const client = createClient();
      await client.search(SEARCH_PARAMS);

      expect(mockLogger.info).toHaveBeenCalledWith(
        'elevare_request',
        expect.objectContaining({ method: 'GET', endpoint: expect.stringContaining('/search') }),
      );
    });

    it('should log response with statusCode and durationMs', async () => {
      mockFetch(200, MOCK_SEARCH_RESPONSE);
      const client = createClient();
      await client.search(SEARCH_PARAMS);

      expect(mockLogger.info).toHaveBeenCalledWith(
        'elevare_response',
        expect.objectContaining({
          statusCode: 200,
          durationMs: expect.any(Number),
          requestId: 'REQ-abc123',
        }),
      );
    });

    it('should NEVER include API key in logs', async () => {
      mockFetch(200, MOCK_SEARCH_RESPONSE);
      const client = createClient();
      await client.search(SEARCH_PARAMS);

      const allLogCalls = [
        ...mockLogger.info.mock.calls,
        ...mockLogger.warn.mock.calls,
        ...mockLogger.error.mock.calls,
      ];

      for (const call of allLogCalls) {
        const serialized = JSON.stringify(call);
        expect(serialized).not.toContain('test-api-key-secret-123');
      }
    });
  });

  // ─── Error Mapping ──────────────────────────────────────────

  describe('error mapping', () => {
    it('should map 401 to ElevareApiError with statusCode', async () => {
      mockFetch(401, { code: 'UNAUTHORIZED', message: 'Bad key' });
      const client = createClient({ maxRetries: 0 });

      try {
        await client.search(SEARCH_PARAMS);
      } catch (error) {
        expect(error).toBeInstanceOf(ElevareApiError);
        expect((error as ElevareApiError).statusCode).toBe(401);
      }
    });

    it('should map 404 to ElevareApiError', async () => {
      mockFetch(404, { code: 'NOT_FOUND', message: 'Hotel not found' });
      const client = createClient({ maxRetries: 0 });

      await expect(client.search(SEARCH_PARAMS)).rejects.toThrow(ElevareApiError);
    });

    it('should map 429 to ElevareApiError (not retryable)', async () => {
      mockFetch(429, { code: 'RATE_LIMITED', message: 'Too many requests' });
      const client = createClient({ maxRetries: 3 });

      await expect(client.search(SEARCH_PARAMS)).rejects.toThrow(ElevareApiError);
      expect(globalThis.fetch).toHaveBeenCalledTimes(1); // No retry on 429
    });
  });

  // ─── Redis Storage (searchAndStore) ─────────────────────────

  describe('searchAndStore()', () => {
    it('should store result in Redis with 30min TTL', async () => {
      mockFetch(200, MOCK_SEARCH_RESPONSE);
      const client = createClient();

      await searchAndStore(client, mockRedis as any, SEARCH_PARAMS);

      expect(mockRedis.set).toHaveBeenCalledWith(
        'elevare:request:REQ-abc123',
        expect.any(String),
        'EX',
        1800,
      );
    });

    it('should store full payload including photos', async () => {
      mockFetch(200, MOCK_SEARCH_RESPONSE);
      const client = createClient();

      await searchAndStore(client, mockRedis as any, SEARCH_PARAMS);

      const storedJson = mockRedis.set.mock.calls[0]![1] as string;
      const stored = JSON.parse(storedJson);
      expect(stored.requestId).toBe('REQ-abc123');
      expect(stored.results[0].photos).toHaveLength(2);
    });

    it('should return the search response', async () => {
      mockFetch(200, MOCK_SEARCH_RESPONSE);
      const client = createClient();

      const result = await searchAndStore(client, mockRedis as any, SEARCH_PARAMS);
      expect(result.requestId).toBe('REQ-abc123');
    });
  });

  describe('multiSearchAndStore()', () => {
    it('should store multi-search result in Redis', async () => {
      mockFetch(200, MOCK_MULTI_RESPONSE);
      const client = createClient();

      await multiSearchAndStore(client, mockRedis as any, MULTI_SEARCH_PARAMS);

      expect(mockRedis.set).toHaveBeenCalledWith(
        'elevare:request:REQ-multi-456',
        expect.any(String),
        'EX',
        1800,
      );
    });
  });

  describe('getStoredSearchResult()', () => {
    it('should return parsed result from Redis', async () => {
      const stored = { requestId: 'REQ-abc123', results: [], storedAt: '2026-04-05T10:00:00Z' };
      mockRedis.get.mockResolvedValueOnce(JSON.stringify(stored));

      const result = await getStoredSearchResult(mockRedis as any, 'REQ-abc123');
      expect(result).toEqual(stored);
    });

    it('should return null when requestId not found (expired)', async () => {
      mockRedis.get.mockResolvedValueOnce(null);

      const result = await getStoredSearchResult(mockRedis as any, 'REQ-expired');
      expect(result).toBeNull();
    });
  });
});
