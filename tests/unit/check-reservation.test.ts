import {
  detectIdentifierType,
  mapStatus,
  maskPII,
  getReservations,
  type ReservationStatusData,
} from '../../backend/src/integrations/elevare/reservations';
import {
  ElevareApiError,
  ElevareTimeoutError,
  ElevareCircuitOpenError,
} from '../../backend/src/integrations/elevare/errors';
import {
  CheckReservationParams,
  createCheckReservationTool,
  type CheckReservationResponse,
} from '../../backend/src/tools/check-reservation';

// ─── Helpers ────────────────────────────────────────────────────

function makeLogger(): any {
  return {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    child: jest.fn().mockReturnThis(),
  };
}

function makeClient(requestResult: unknown): any {
  return {
    request: jest.fn().mockResolvedValue(requestResult),
  };
}

function makeFailingClient(error: Error): any {
  return {
    request: jest.fn().mockRejectedValue(error),
  };
}

const CREDS = { clientId: 'ci-test', clientSecret: 'cs-test' };

const RAW_RESERVATION = {
  id: 'resv-internal-001',
  reservationId: 'resv-internal-001',
  hotelId: 'HOTEL_FASANO',
  customerId: 'CUST-789',
  quotationId: 'QUOT-001',
  offerId: 'OFFER-1',
  requestId: 'REQ-001',
  confirmationNumber: 'ABC123',
  hotelName: 'Hotel Fasano',
  guestName: 'João Silva',
  checkIn: '2026-03-15',
  checkOut: '2026-03-18',
  status: 'confirmed',
  roomType: 'Suite Master',
  totalPrice: 2500,
  currency: 'BRL',
};

// ─── Tests ──────────────────────────────────────────────────────

describe('check_reservation tool', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ───── detectIdentifierType ────────────────────────────────

  describe('detectIdentifierType()', () => {
    // #1
    it('should detect email correctly', () => {
      const info = detectIdentifierType('joao@email.com');
      expect(info.type).toBe('email');
      expect(info.queryParam).toBe('email');
      expect(info.value).toBe('joao@email.com');
    });

    // #2
    it('should detect phone with + prefix', () => {
      const info = detectIdentifierType('+5511999887766');
      expect(info.type).toBe('phone');
      expect(info.queryParam).toBe('guestPhone');
      expect(info.value).toBe('+5511999887766');
    });

    // #3
    it('should detect phone without + prefix and normalize', () => {
      const info = detectIdentifierType('5511999887766');
      expect(info.type).toBe('phone');
      expect(info.value).toBe('+5511999887766');
    });

    // #4
    it('should default to confirmation number', () => {
      const info = detectIdentifierType('ABC123');
      expect(info.type).toBe('confirmationNumber');
      expect(info.queryParam).toBe('confirmationNumber');
      expect(info.value).toBe('ABC123');
    });

    // #5
    it('should detect email with subdomain', () => {
      const info = detectIdentifierType('user@sub.domain.com');
      expect(info.type).toBe('email');
      expect(info.value).toBe('user@sub.domain.com');
    });

    // #6 — Edge case: 11 digit numeric treated as phone (regex matches 10-15 digits)
    it('should treat ambiguous numeric strings (10-15 digits) as phone', () => {
      // 11 digits matches phone regex → phone wins
      const info = detectIdentifierType('12345678901');
      expect(info.type).toBe('phone');
    });

    // #6b — Confirmation code with letters stays as confirmation number
    it('should treat alphanumeric strings as confirmation number', () => {
      const info = detectIdentifierType('CONF123456');
      expect(info.type).toBe('confirmationNumber');
      expect(info.value).toBe('CONF123456');
    });

    it('should trim whitespace from identifiers', () => {
      const info = detectIdentifierType('  ABC123  ');
      expect(info.value).toBe('ABC123');
    });

    it('should normalize phone separators (spaces, hyphens, parens)', () => {
      const info = detectIdentifierType('+55 (11) 99988-7766');
      expect(info.type).toBe('phone');
      expect(info.value).toBe('+5511999887766');
    });

    it('should lowercase emails', () => {
      const info = detectIdentifierType('JOAO@EMAIL.COM');
      expect(info.value).toBe('joao@email.com');
    });

    it('should uppercase confirmation codes', () => {
      const info = detectIdentifierType('abc123');
      expect(info.value).toBe('ABC123');
    });
  });

  // ───── mapStatus ───────────────────────────────────────────

  describe('mapStatus()', () => {
    // #11
    it('should map "confirmed" → confirmed', () => {
      expect(mapStatus('confirmed')).toBe('confirmed');
    });

    // #12
    it('should map "pending" → pending_payment', () => {
      expect(mapStatus('pending')).toBe('pending_payment');
    });

    it('should map "pending_payment" → pending_payment', () => {
      expect(mapStatus('pending_payment')).toBe('pending_payment');
    });

    it('should map "awaiting_payment" → pending_payment', () => {
      expect(mapStatus('awaiting_payment')).toBe('pending_payment');
    });

    // #13
    it('should map "cancelled" → cancelled', () => {
      expect(mapStatus('cancelled')).toBe('cancelled');
    });

    // #26
    it('should map "canceled" (American spelling) → cancelled', () => {
      expect(mapStatus('canceled')).toBe('cancelled');
    });

    // #14
    it('should map "checked_in" → checked_in', () => {
      expect(mapStatus('checked_in')).toBe('checked_in');
    });

    // #27
    it('should map "in_house" → checked_in', () => {
      expect(mapStatus('in_house')).toBe('checked_in');
    });

    // #15
    it('should map "checked_out" → checked_out', () => {
      expect(mapStatus('checked_out')).toBe('checked_out');
    });

    // #28
    it('should map "departed" → checked_out', () => {
      expect(mapStatus('departed')).toBe('checked_out');
    });

    it('should map "active" → confirmed', () => {
      expect(mapStatus('active')).toBe('confirmed');
    });

    it('should map "completed" → checked_out', () => {
      expect(mapStatus('completed')).toBe('checked_out');
    });

    it('should be case-insensitive', () => {
      expect(mapStatus('CONFIRMED')).toBe('confirmed');
      expect(mapStatus('  Cancelled  ')).toBe('cancelled');
    });

    // #16
    it('should map unknown status → "unknown" and log warning', () => {
      const logger = makeLogger();
      const result = mapStatus('some_weird_status', logger);
      expect(result).toBe('unknown');
      expect(logger.warn).toHaveBeenCalledWith(
        'unknown_reservation_status',
        expect.objectContaining({ elevareStatus: 'some_weird_status' }),
      );
    });

    it('should map null/undefined status → "unknown" and log warning', () => {
      const logger = makeLogger();
      expect(mapStatus(null, logger)).toBe('unknown');
      expect(mapStatus(undefined, logger)).toBe('unknown');
      expect(logger.warn).toHaveBeenCalledTimes(2);
    });
  });

  // ───── maskPII ─────────────────────────────────────────────

  describe('maskPII()', () => {
    it('should mask email to first-char + domain', () => {
      expect(maskPII('joao@email.com', 'email')).toBe('j***@email.com');
    });

    it('should mask phone preserving prefix and suffix', () => {
      expect(maskPII('+5511999887766', 'phone')).toBe('+551***7766');
    });

    it('should leave confirmation codes unchanged (not PII)', () => {
      expect(maskPII('ABC123', 'confirmationNumber')).toBe('ABC123');
    });

    it('should handle very short phones gracefully', () => {
      expect(maskPII('+551', 'phone')).toBe('***');
    });
  });

  // ───── getReservations ─────────────────────────────────────

  describe('getReservations()', () => {
    // #7
    it('should return ReservationStatusData for confirmation code (happy path)', async () => {
      const client = makeClient({ reservations: [RAW_RESERVATION] });
      const logger = makeLogger();

      const result = await getReservations(client, logger, 'ABC123', CREDS);

      expect(result.found).toBe(true);
      if (result.found) {
        expect(result.reservations).toHaveLength(1);
        const r = result.reservations[0]!;
        expect(r.hotelName).toBe('Hotel Fasano');
        expect(r.checkIn).toBe('2026-03-15');
        expect(r.status).toBe('confirmed');
        expect(r.roomType).toBe('Suite Master');
      }
    });

    it('should call /global-agent/reservations with confirmationNumber query param', async () => {
      const client = makeClient({ reservations: [RAW_RESERVATION] });
      const logger = makeLogger();

      await getReservations(client, logger, 'ABC123', CREDS);

      expect(client.request).toHaveBeenCalledWith(
        expect.stringContaining('/global-agent/reservations?'),
        'GET',
        undefined,
        expect.objectContaining({
          overrideAuth: true,
          headers: expect.objectContaining({
            'x-client-id': 'ci-test',
            'x-client-secret': 'cs-test',
          }),
        }),
      );
      const callArgs = client.request.mock.calls[0];
      expect(callArgs[0]).toContain('confirmationNumber=ABC123');
      expect(callArgs[0]).toContain('limit=10');
    });

    // #8
    it('should return multiple reservations for email lookup', async () => {
      const client = makeClient({
        reservations: [
          RAW_RESERVATION,
          { ...RAW_RESERVATION, confirmationNumber: 'DEF456', checkIn: '2026-06-01' },
          { ...RAW_RESERVATION, confirmationNumber: 'GHI789', checkIn: '2026-09-15' },
        ],
      });
      const logger = makeLogger();

      const result = await getReservations(
        client,
        logger,
        'joao@email.com',
        CREDS,
      );

      expect(result.found).toBe(true);
      if (result.found) {
        expect(result.reservations).toHaveLength(3);
      }
      const callArgs = client.request.mock.calls[0];
      expect(callArgs[0]).toContain('email=joao%40email.com');
    });

    // #9
    it('should support phone identifier (best-effort via guestPhone param)', async () => {
      const client = makeClient({ reservations: [RAW_RESERVATION] });
      const logger = makeLogger();

      const result = await getReservations(
        client,
        logger,
        '+5511999887766',
        CREDS,
      );

      expect(result.found).toBe(true);
      const callArgs = client.request.mock.calls[0];
      expect(callArgs[0]).toContain('guestPhone=');
    });

    // #10
    it('should return { found: false, suggestion: front_desk } when no reservations', async () => {
      const client = makeClient({ reservations: [] });
      const logger = makeLogger();

      const result = await getReservations(client, logger, 'ZZZ999', CREDS);

      expect(result).toEqual({ found: false, suggestion: 'front_desk' });
      expect(logger.warn).toHaveBeenCalledWith(
        'reservation_not_found',
        expect.objectContaining({ identifierType: 'confirmationNumber' }),
      );
    });

    it('should handle response with "results" key fallback', async () => {
      const client = makeClient({ results: [RAW_RESERVATION] });
      const logger = makeLogger();

      const result = await getReservations(client, logger, 'ABC123', CREDS);
      expect(result.found).toBe(true);
    });

    it('should handle empty response body gracefully', async () => {
      const client = makeClient({});
      const logger = makeLogger();

      const result = await getReservations(client, logger, 'ABC123', CREDS);
      expect(result).toEqual({ found: false, suggestion: 'front_desk' });
    });

    // #17
    it('should return error result on timeout', async () => {
      const client = makeFailingClient(
        new ElevareTimeoutError(8000, '/global-agent/reservations'),
      );
      const logger = makeLogger();

      const result = await getReservations(client, logger, 'ABC123', CREDS);

      expect(result).toEqual({
        found: false,
        error: true,
        suggestion: 'front_desk',
      });
      expect(logger.error).toHaveBeenCalledWith(
        'reservation_lookup_failed',
        expect.objectContaining({ errorType: 'ElevareTimeoutError' }),
      );
    });

    // #18
    it('should return error result on 5xx after retries', async () => {
      const client = makeFailingClient(
        new ElevareApiError(
          'Internal Server Error',
          500,
          '/global-agent/reservations',
        ),
      );
      const logger = makeLogger();

      const result = await getReservations(client, logger, 'ABC123', CREDS);

      expect(result).toEqual({
        found: false,
        error: true,
        suggestion: 'front_desk',
      });
    });

    // #19
    it('should return error result when circuit breaker is open', async () => {
      const client = makeFailingClient(
        new ElevareCircuitOpenError(5, Date.now(), 60000),
      );
      const logger = makeLogger();

      const result = await getReservations(client, logger, 'ABC123', CREDS);

      expect(result).toEqual({
        found: false,
        error: true,
        suggestion: 'front_desk',
      });
    });

    it('should return found: false (no error flag) on 404', async () => {
      const client = makeFailingClient(
        new ElevareApiError('Not Found', 404, '/global-agent/reservations'),
      );
      const logger = makeLogger();

      const result = await getReservations(client, logger, 'ABC123', CREDS);

      expect(result).toEqual({ found: false, suggestion: 'front_desk' });
    });

    it('should return 401 as transient error (not surface credentials issue)', async () => {
      const client = makeFailingClient(
        new ElevareApiError('Unauthorized', 401, '/global-agent/reservations'),
      );
      const logger = makeLogger();

      const result = await getReservations(client, logger, 'ABC123', CREDS);

      expect(result).toEqual({
        found: false,
        error: true,
        suggestion: 'front_desk',
      });
    });

    it('should return error when credentials are missing', async () => {
      const client = makeClient({ reservations: [] });
      const logger = makeLogger();

      const result = await getReservations(client, logger, 'ABC123', {});

      expect(result).toEqual({
        found: false,
        error: true,
        suggestion: 'front_desk',
      });
      expect(client.request).not.toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalledWith(
        'reservation_lookup_failed',
        expect.objectContaining({ errorType: 'missing_credentials' }),
      );
    });

    it('should handle unknown runtime errors gracefully', async () => {
      const client = makeFailingClient(new Error('network blew up'));
      const logger = makeLogger();

      const result = await getReservations(client, logger, 'ABC123', CREDS);

      expect(result).toEqual({
        found: false,
        error: true,
        suggestion: 'front_desk',
      });
      expect(logger.error).toHaveBeenCalledWith(
        'reservation_lookup_failed',
        expect.objectContaining({ errorType: 'unknown' }),
      );
    });

    it('should defensively handle missing humanizable fields', async () => {
      const client = makeClient({
        reservations: [
          {
            // Only confirmationNumber + status provided
            confirmationNumber: 'ABC123',
            status: 'confirmed',
          },
        ],
      });
      const logger = makeLogger();

      const result = await getReservations(client, logger, 'ABC123', CREDS);

      expect(result.found).toBe(true);
      if (result.found) {
        const r = result.reservations[0]!;
        expect(r.hotelName).toBe('Hotel');
        expect(r.guestName).toBe('');
        expect(r.roomType).toBe('');
        expect(r.totalPrice).toBe(0);
        expect(r.currency).toBe('BRL');
      }
    });
  });

  // ───── Anti-Leak (AC11) ────────────────────────────────────

  describe('ReservationStatusData anti-leak', () => {
    // #20
    it('should NOT expose hotelId, customerId, quotationId, requestId, offerId', async () => {
      const client = makeClient({ reservations: [RAW_RESERVATION] });
      const logger = makeLogger();

      const result = await getReservations(client, logger, 'ABC123', CREDS);

      expect(result.found).toBe(true);
      if (result.found) {
        const r = result.reservations[0] as unknown as Record<string, unknown>;
        expect(r['hotelId']).toBeUndefined();
        expect(r['customerId']).toBeUndefined();
        expect(r['quotationId']).toBeUndefined();
        expect(r['requestId']).toBeUndefined();
        expect(r['offerId']).toBeUndefined();
        expect(r['id']).toBeUndefined();
        expect(r['reservationId']).toBeUndefined();
      }
    });

    it('should only expose the humanizable field surface', async () => {
      const client = makeClient({ reservations: [RAW_RESERVATION] });
      const logger = makeLogger();

      const result = await getReservations(client, logger, 'ABC123', CREDS);

      expect(result.found).toBe(true);
      if (result.found) {
        const allowedKeys = new Set<keyof ReservationStatusData>([
          'hotelName',
          'guestName',
          'checkIn',
          'checkOut',
          'status',
          'roomType',
          'totalPrice',
          'currency',
          'confirmationNumber',
        ]);
        const actualKeys = Object.keys(result.reservations[0]!);
        expect(actualKeys.sort()).toEqual(
          Array.from(allowedKeys).sort(),
        );
      }
    });
  });

  // ───── Logging PII Protection (AC14) ───────────────────────

  describe('logging & PII protection', () => {
    // #21
    it('should mask email in log entries', async () => {
      const client = makeClient({ reservations: [RAW_RESERVATION] });
      const logger = makeLogger();

      await getReservations(client, logger, 'joao@email.com', CREDS);

      const infoCall = logger.info.mock.calls.find(
        (c: any) => c[0] === 'reservation_lookup',
      );
      expect(infoCall).toBeDefined();
      const payload = JSON.stringify(infoCall[1]);
      expect(payload).not.toContain('joao@email.com');
      expect(payload).toContain('j***@email.com');
      expect(infoCall[1].identifierType).toBe('email');
    });

    // #22
    it('should mask phone in log entries', async () => {
      const client = makeClient({ reservations: [] });
      const logger = makeLogger();

      await getReservations(client, logger, '+5511999887766', CREDS);

      const warnCall = logger.warn.mock.calls.find(
        (c: any) => c[0] === 'reservation_not_found',
      );
      expect(warnCall).toBeDefined();
      const payload = JSON.stringify(warnCall[1]);
      expect(payload).not.toContain('+5511999887766');
      expect(payload).toContain('***');
    });

    it('should log resultCount on success', async () => {
      const client = makeClient({
        reservations: [RAW_RESERVATION, RAW_RESERVATION],
      });
      const logger = makeLogger();

      await getReservations(client, logger, 'ABC123', CREDS);

      const infoCall = logger.info.mock.calls.find(
        (c: any) => c[0] === 'reservation_lookup',
      );
      expect(infoCall[1].resultCount).toBe(2);
    });

    it('should leave confirmation codes unmasked in logs (not PII)', async () => {
      const client = makeClient({ reservations: [RAW_RESERVATION] });
      const logger = makeLogger();

      await getReservations(client, logger, 'ABC123', CREDS);

      const infoCall = logger.info.mock.calls.find(
        (c: any) => c[0] === 'reservation_lookup',
      );
      expect(infoCall[1].identifierMasked).toBe('ABC123');
    });
  });

  // ───── Zod params schema ───────────────────────────────────

  describe('CheckReservationParams schema', () => {
    it('should accept a valid identifier string', () => {
      const parsed = CheckReservationParams.parse({ identifier: 'ABC123' });
      expect(parsed.identifier).toBe('ABC123');
    });

    it('should reject empty string', () => {
      expect(() =>
        CheckReservationParams.parse({ identifier: '' }),
      ).toThrow();
    });

    it('should reject missing identifier', () => {
      expect(() => CheckReservationParams.parse({})).toThrow();
    });

    it('should reject non-string identifier', () => {
      expect(() =>
        CheckReservationParams.parse({ identifier: 123 }),
      ).toThrow();
    });
  });

  // ───── createCheckReservationTool integration (ACs 1, 2, 12, 24, 25) ────

  describe('createCheckReservationTool', () => {
    // #23
    it('should expose tool with name "check_reservation"', () => {
      const client = makeClient({ reservations: [RAW_RESERVATION] });
      const logger = makeLogger();
      const tool = createCheckReservationTool(client, logger, CREDS) as any;
      expect(tool.name).toBe('check_reservation');
    });

    it('should expose a descriptive description for the Orchestrator', () => {
      const client = makeClient({ reservations: [] });
      const logger = makeLogger();
      const tool = createCheckReservationTool(client, logger, CREDS) as any;
      expect(tool.description).toBeDefined();
      expect(tool.description.length).toBeGreaterThan(50);
      expect(tool.description.toLowerCase()).toContain('reservation');
    });

    // #24
    it('should pass structured data to Persona (no prose generation)', async () => {
      const client = makeClient({ reservations: [RAW_RESERVATION] });
      const logger = makeLogger();
      const tool = createCheckReservationTool(client, logger, CREDS) as any;

      const response = (await tool.execute({
        identifier: 'ABC123',
      })) as CheckReservationResponse;

      expect(response.found).toBe(true);
      if (response.found) {
        expect(response.count).toBe(1);
        expect(response.reservations[0]!.hotelName).toBe('Hotel Fasano');
        // Response is pure data — no prose fields
        expect((response as any).message).toBeUndefined();
      }
    });

    it('should return not-found structured response (with front_desk suggestion)', async () => {
      const client = makeClient({ reservations: [] });
      const logger = makeLogger();
      const tool = createCheckReservationTool(client, logger, CREDS) as any;

      const response = (await tool.execute({
        identifier: 'NOMATCH',
      })) as CheckReservationResponse;

      expect(response.found).toBe(false);
      if (!response.found) {
        expect(response.suggestion).toBe('front_desk');
        expect(response.error).toBe(false);
      }
    });

    it('should return error response when API fails', async () => {
      const client = makeFailingClient(
        new ElevareTimeoutError(8000, '/global-agent/reservations'),
      );
      const logger = makeLogger();
      const tool = createCheckReservationTool(client, logger, CREDS) as any;

      const response = (await tool.execute({
        identifier: 'ABC123',
      })) as CheckReservationResponse;

      expect(response.found).toBe(false);
      if (!response.found) {
        expect(response.error).toBe(true);
        expect(response.suggestion).toBe('front_desk');
      }
    });

    // #25
    it('should trim whitespace from identifier before lookup', async () => {
      const client = makeClient({ reservations: [RAW_RESERVATION] });
      const logger = makeLogger();
      const tool = createCheckReservationTool(client, logger, CREDS) as any;

      await tool.execute({ identifier: '  ABC123  ' });

      const callArgs = client.request.mock.calls[0];
      expect(callArgs[0]).toContain('confirmationNumber=ABC123');
      expect(callArgs[0]).not.toContain('%20');
    });
  });
});
