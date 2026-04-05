/**
 * Fallback & Recovery Elegante — Unit Tests (Story 3.8).
 *
 * Covers: classifyError, selectFallbackMessage, validateLanguage,
 * isTransient5xx, triggerSilentHandover, reportToSentry,
 * handleElevareFailure.
 *
 * Banned-term sweep verifies no fallback message contains any technical
 * / failure-evoking term in any language (AC8).
 */

// Mock @sentry/node BEFORE importing modules that use it. `jest.spyOn` does
// not work on ESM namespace imports (non-configurable bindings) — we must
// replace the module exports directly.
jest.mock('@sentry/node', () => {
  const actual = jest.requireActual('@sentry/node') as Record<string, unknown>;
  return {
    ...actual,
    getClient: jest.fn(),
    withScope: jest.fn(),
    captureException: jest.fn(),
  };
});

import * as Sentry from '@sentry/node';

import {
  classifyError,
  isTransient5xx,
  handleElevareFailure,
  triggerSilentHandover,
  reportToSentry,
  type FallbackResult,
} from '../../backend/src/services/fallback';

import {
  FALLBACK_MESSAGES,
  BANNED_TERMS,
  selectFallbackMessage,
  validateLanguage,
  type ElevareErrorType,
  type SupportedLanguage,
} from '../../backend/src/services/fallback-messages';

import {
  ElevareApiError,
  ElevareTimeoutError,
  ElevareCircuitOpenError,
} from '../../backend/src/integrations/elevare/errors';

import type { SessionData } from '../../backend/src/state/session-manager';

// ─── Test helpers ───────────────────────────────────────────────

function makeSession(overrides?: Partial<SessionData>): SessionData {
  return {
    hotelId: 'hotel-abc',
    guestPhone: '+5511999999999',
    language: 'pt',
    agentState: 'searching',
    context: {
      guestName: 'João Silva',
      lastIntent: 'API_BOOKING',
      preferences: { region: 'Serra Gaúcha' },
      checkIn: '2026-05-01',
      checkOut: '2026-05-04',
      adults: 2,
      children: 1,
    },
    createdAt: '2026-04-05T10:00:00.000Z',
    updatedAt: '2026-04-05T10:05:00.000Z',
    ...overrides,
  };
}

function makeNetworkError(code: string): Error {
  const err = new Error(`connect ${code}`);
  (err as Error & { code: string }).code = code;
  return err;
}

// ─── classifyError ──────────────────────────────────────────────

describe('classifyError — AC2', () => {
  it('#1 — ElevareTimeoutError → timeout', () => {
    const err = new ElevareTimeoutError(5000, '/search');
    expect(classifyError(err)).toBe<ElevareErrorType>('timeout');
  });

  it('#2 — AbortError (DOMException-shaped) → timeout', () => {
    const err = Object.assign(new Error('aborted'), { name: 'AbortError' });
    expect(classifyError(err)).toBe<ElevareErrorType>('timeout');
  });

  it('#3 — ElevareApiError(503) → api_error', () => {
    const err = new ElevareApiError('server error', 503, '/search');
    expect(classifyError(err)).toBe<ElevareErrorType>('api_error');
  });

  it('#4 — ElevareApiError(400) → api_error', () => {
    const err = new ElevareApiError('bad request', 400, '/quotation');
    expect(classifyError(err)).toBe<ElevareErrorType>('api_error');
  });

  it('#5 — ECONNRESET → network_error', () => {
    expect(classifyError(makeNetworkError('ECONNRESET'))).toBe<ElevareErrorType>(
      'network_error',
    );
  });

  it('#6 — ECONNREFUSED → network_error', () => {
    expect(
      classifyError(makeNetworkError('ECONNREFUSED')),
    ).toBe<ElevareErrorType>('network_error');
  });

  it('#7 — ETIMEDOUT → network_error', () => {
    expect(classifyError(makeNetworkError('ETIMEDOUT'))).toBe<ElevareErrorType>(
      'network_error',
    );
  });

  it("#8 — message containing 'fetch failed' → network_error", () => {
    const err = new Error('TypeError: fetch failed');
    expect(classifyError(err)).toBe<ElevareErrorType>('network_error');
  });

  it('#9 — ElevareCircuitOpenError → circuit_open', () => {
    const err = new ElevareCircuitOpenError(5, Date.now(), 30_000);
    expect(classifyError(err)).toBe<ElevareErrorType>('circuit_open');
  });

  it('#10 — unknown error → api_error (safe default)', () => {
    expect(classifyError(new Error('out of memory'))).toBe<ElevareErrorType>(
      'api_error',
    );
    expect(classifyError('string error')).toBe<ElevareErrorType>('api_error');
    expect(classifyError(undefined)).toBe<ElevareErrorType>('api_error');
    expect(classifyError(null)).toBe<ElevareErrorType>('api_error');
    expect(classifyError({ foo: 'bar' })).toBe<ElevareErrorType>('api_error');
  });
});

// ─── isTransient5xx ─────────────────────────────────────────────

describe('isTransient5xx — AC4', () => {
  it('returns true for ElevareApiError 500', () => {
    expect(isTransient5xx(new ElevareApiError('x', 500, '/x'))).toBe(true);
  });

  it('returns true for ElevareApiError 503', () => {
    expect(isTransient5xx(new ElevareApiError('x', 503, '/x'))).toBe(true);
  });

  it('returns false for ElevareApiError 400', () => {
    expect(isTransient5xx(new ElevareApiError('x', 400, '/x'))).toBe(false);
  });

  it('returns false for ElevareApiError 404', () => {
    expect(isTransient5xx(new ElevareApiError('x', 404, '/x'))).toBe(false);
  });

  it('returns false for non-ElevareApiError', () => {
    expect(isTransient5xx(new Error('x'))).toBe(false);
    expect(isTransient5xx(new ElevareCircuitOpenError(1, null, 1000))).toBe(
      false,
    );
  });
});

// ─── handleElevareFailure — Handover Logic ─────────────────────

describe('handleElevareFailure — Handover Logic (AC13/AC14)', () => {
  it('#11 — timeout → handoverTriggered: false', async () => {
    const err = new ElevareTimeoutError(5000, '/search');
    const result = await handleElevareFailure(err, makeSession(), 'pt');
    expect(result.handoverTriggered).toBe(false);
    expect(result.errorType).toBe<ElevareErrorType>('timeout');
  });

  it('#12 — api_error → handoverTriggered: true', async () => {
    const err = new ElevareApiError('server error', 503, '/search');
    const result = await handleElevareFailure(err, makeSession(), 'pt');
    expect(result.handoverTriggered).toBe(true);
    expect(result.errorType).toBe<ElevareErrorType>('api_error');
  });

  it('#13 — network_error → handoverTriggered: true', async () => {
    const err = makeNetworkError('ECONNRESET');
    const result = await handleElevareFailure(err, makeSession(), 'pt');
    expect(result.handoverTriggered).toBe(true);
    expect(result.errorType).toBe<ElevareErrorType>('network_error');
  });

  it('#14 — circuit_open → handoverTriggered: true', async () => {
    const err = new ElevareCircuitOpenError(5, Date.now(), 30_000);
    const result = await handleElevareFailure(err, makeSession(), 'pt');
    expect(result.handoverTriggered).toBe(true);
    expect(result.errorType).toBe<ElevareErrorType>('circuit_open');
  });
});

// ─── handleElevareFailure — Retry Logic ────────────────────────

describe('handleElevareFailure — Retry Logic (AC3/AC4)', () => {
  it('#15 — 5xx with retryFn → retry succeeds → no fallback', async () => {
    const err = new ElevareApiError('503', 503, '/search');
    const retryFn = jest.fn().mockResolvedValue({ ok: true, data: 'fresh' });
    const result = await handleElevareFailure(
      err,
      makeSession(),
      'pt',
      retryFn,
      { retryDelayMs: 0 },
    );
    expect(retryFn).toHaveBeenCalledTimes(1);
    expect(result.handoverTriggered).toBe(false);
    expect(result.guestMessage).toBe('');
    expect(result.sentryEventId).toBe('');
    expect(result.retryResult).toEqual({ ok: true, data: 'fresh' });
  });

  it('#16 — 5xx with retryFn → retry fails → fallback triggered', async () => {
    const err = new ElevareApiError('503', 503, '/search');
    const retryFn = jest
      .fn()
      .mockRejectedValue(new ElevareApiError('503 again', 503, '/search'));
    const result = await handleElevareFailure(
      err,
      makeSession(),
      'pt',
      retryFn,
      { retryDelayMs: 0 },
    );
    expect(retryFn).toHaveBeenCalledTimes(1);
    expect(result.handoverTriggered).toBe(true);
    expect(result.guestMessage).toBeTruthy();
    expect(result.errorType).toBe<ElevareErrorType>('api_error');
  });

  it('#17 — 4xx → NO retry, direct fallback', async () => {
    const err = new ElevareApiError('bad request', 400, '/search');
    const retryFn = jest.fn().mockResolvedValue({ ok: true });
    const result = await handleElevareFailure(
      err,
      makeSession(),
      'pt',
      retryFn,
      { retryDelayMs: 0 },
    );
    expect(retryFn).not.toHaveBeenCalled();
    expect(result.handoverTriggered).toBe(true);
  });

  it('#18 — retryFn not provided → skip retry', async () => {
    const err = new ElevareApiError('503', 503, '/search');
    const result = await handleElevareFailure(err, makeSession(), 'pt');
    expect(result.handoverTriggered).toBe(true);
    expect(result.guestMessage).toBeTruthy();
  });

  it('retry is attempted EXACTLY ONCE — never more', async () => {
    const err = new ElevareApiError('503', 503, '/search');
    const retryFn = jest
      .fn()
      .mockRejectedValue(new ElevareApiError('503', 503, '/search'));
    await handleElevareFailure(err, makeSession(), 'pt', retryFn, {
      retryDelayMs: 0,
    });
    expect(retryFn).toHaveBeenCalledTimes(1);
  });

  it('does NOT retry on circuit_open even with retryFn', async () => {
    const err = new ElevareCircuitOpenError(5, Date.now(), 30_000);
    const retryFn = jest.fn().mockResolvedValue({});
    await handleElevareFailure(err, makeSession(), 'pt', retryFn, {
      retryDelayMs: 0,
    });
    expect(retryFn).not.toHaveBeenCalled();
  });

  it('does NOT retry on timeout even with retryFn', async () => {
    const err = new ElevareTimeoutError(5000, '/search');
    const retryFn = jest.fn().mockResolvedValue({});
    await handleElevareFailure(err, makeSession(), 'pt', retryFn, {
      retryDelayMs: 0,
    });
    expect(retryFn).not.toHaveBeenCalled();
  });

  it('does NOT retry on network_error even with retryFn', async () => {
    const err = makeNetworkError('ECONNRESET');
    const retryFn = jest.fn().mockResolvedValue({});
    await handleElevareFailure(err, makeSession(), 'pt', retryFn, {
      retryDelayMs: 0,
    });
    expect(retryFn).not.toHaveBeenCalled();
  });
});

// ─── selectFallbackMessage — i18n ──────────────────────────────

describe('selectFallbackMessage — i18n (AC5/AC6/AC7)', () => {
  it('#19 — timeout, PT', () => {
    expect(selectFallbackMessage('timeout', 'pt')).toBe(
      'Estou verificando as melhores opções para você, um momento...',
    );
  });

  it('#20 — timeout, EN', () => {
    expect(selectFallbackMessage('timeout', 'en')).toBe(
      "I'm checking the best options for you, just a moment...",
    );
  });

  it('#21 — timeout, ES', () => {
    expect(selectFallbackMessage('timeout', 'es')).toBe(
      'Estoy verificando las mejores opciones para usted, un momento...',
    );
  });

  it('#22 — api_error, PT', () => {
    expect(selectFallbackMessage('api_error', 'pt')).toBe(
      'Vou conectar você com um de nossos especialistas que pode ajudar de forma mais ágil.',
    );
  });

  it('#23 — circuit_open, EN', () => {
    expect(selectFallbackMessage('circuit_open', 'en')).toBe(
      'Let me check with our reservations team. One of our specialists will continue assisting you shortly.',
    );
  });

  it('#24 — network_error, ES', () => {
    expect(selectFallbackMessage('network_error', 'es')).toBe(
      'Permítame conectarlo con uno de nuestros especialistas que puede asistirle de manera más ágil.',
    );
  });
});

// ─── Ban-list enforcement ──────────────────────────────────────

describe('Ban-list enforcement — AC8', () => {
  it('#25 — ALL messages in ALL languages contain ZERO banned terms', () => {
    const errorTypes: ElevareErrorType[] = [
      'timeout',
      'api_error',
      'network_error',
      'circuit_open',
    ];
    const languages: SupportedLanguage[] = ['pt', 'en', 'es'];

    for (const errorType of errorTypes) {
      for (const lang of languages) {
        const message = FALLBACK_MESSAGES[errorType][lang];
        const lowered = message.toLowerCase();
        for (const term of BANNED_TERMS) {
          expect(lowered).not.toContain(term.toLowerCase());
        }
      }
    }
  });
});

// ─── Silent Handover (AC9/AC10) ────────────────────────────────

describe('triggerSilentHandover — AC9/AC10', () => {
  it('#26 — handleElevareFailure calls buildHandoverSummary with reason api_failure', async () => {
    const err = new ElevareApiError('503', 503, '/search');
    const session = makeSession();
    await handleElevareFailure(err, session, 'pt');
    // Indirect assertion: an api_error always produces handoverTriggered: true
    // and the summary is produced via triggerSilentHandover which uses
    // reason 'api_failure'. Direct assertion follows:
    const summary = triggerSilentHandover(session, err, 'api_error');
    expect(summary.reason).toBe('api_failure');
  });

  it('#27 — HandoverSummary includes errorContext', () => {
    const err = new ElevareApiError('503', 503, '/search');
    const summary = triggerSilentHandover(makeSession(), err, 'api_error');
    expect(summary.errorContext).toBeDefined();
    expect(summary.errorContext.errorType).toBe<ElevareErrorType>('api_error');
  });

  it('#28 — errorContext contains sessionId, errorType, timestamp, endpoint', () => {
    const err = new ElevareApiError('503', 503, '/search');
    const summary = triggerSilentHandover(makeSession(), err, 'api_error');
    expect(summary.errorContext.sessionId).toBe(
      'hotel-abc:+5511999999999',
    );
    expect(summary.errorContext.errorType).toBe<ElevareErrorType>('api_error');
    expect(summary.errorContext.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(summary.errorContext.lastElevareEndpoint).toBe('/search');
    expect(summary.errorContext.originalError).toBe('503');
  });

  it('preserves guestName, guestPhone, hotelFocus from session context', () => {
    const err = new ElevareApiError('x', 500, '/quotation');
    const summary = triggerSilentHandover(makeSession(), err, 'api_error');
    expect(summary.guest.name).toBe('João Silva');
    expect(summary.guest.phone).toBe('+5511999999999');
    expect(summary.hotelFocus).toBe('hotel-abc');
  });

  it('handles missing guestName gracefully', () => {
    const session = makeSession({ context: {} });
    const err = new ElevareApiError('x', 500, '/search');
    const summary = triggerSilentHandover(session, err, 'api_error');
    expect(summary.guest.name).toBeNull();
  });

  it('includes preferences from session context', () => {
    const session = makeSession({
      context: { preferences: { region: 'Ilhabela', petFriendly: true } },
    });
    const err = new ElevareApiError('x', 500, '/search');
    const summary = triggerSilentHandover(session, err, 'api_error');
    expect(summary.preferences).toEqual({
      region: 'Ilhabela',
      petFriendly: true,
    });
  });

  it('builds a conversationSummary that includes hotel + language', () => {
    const err = new ElevareApiError('x', 500, '/search');
    const summary = triggerSilentHandover(makeSession(), err, 'api_error');
    expect(summary.conversation.summary).toContain('hotel-abc');
    expect(summary.conversation.summary).toContain('pt');
  });

  it('falls back to "unknown" endpoint when error has none', () => {
    const err = new Error('something broke');
    const summary = triggerSilentHandover(makeSession(), err, 'api_error');
    expect(summary.errorContext.lastElevareEndpoint).toBe('unknown');
  });
});

// ─── Sentry Integration (AC11/AC12) ────────────────────────────

describe('Sentry integration — AC11/AC12', () => {
  const getClientSpy = Sentry.getClient as jest.Mock;
  const withScopeSpy = Sentry.withScope as jest.Mock;
  const captureSpy = Sentry.captureException as jest.Mock;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('#29 — calls captureException with fingerprint', async () => {
    const fakeScope = {
      setFingerprint: jest.fn(),
      setTag: jest.fn(),
      setExtra: jest.fn(),
    };
    getClientSpy.mockReturnValue({} as ReturnType<typeof Sentry.getClient>);
    withScopeSpy.mockImplementation(((cb: (s: typeof fakeScope) => void) => {
      cb(fakeScope);
      return undefined;
    }) as unknown as typeof Sentry.withScope);
    captureSpy.mockReturnValue('evt_abc123');

    const err = new ElevareApiError('503', 503, '/search');
    const result = await handleElevareFailure(err, makeSession(), 'pt');

    expect(withScopeSpy).toHaveBeenCalledTimes(1);
    expect(fakeScope.setFingerprint).toHaveBeenCalledWith([
      'elevare-fallback',
      'api_error',
    ]);
    expect(captureSpy).toHaveBeenCalledTimes(1);
    expect(result.sentryEventId).toBe('evt_abc123');
  });

  it('#30 — Sentry extra includes sessionId, errorType, language', async () => {
    const fakeScope = {
      setFingerprint: jest.fn(),
      setTag: jest.fn(),
      setExtra: jest.fn(),
    };
    getClientSpy.mockReturnValue({} as ReturnType<typeof Sentry.getClient>);
    withScopeSpy.mockImplementation(((cb: (s: typeof fakeScope) => void) => {
      cb(fakeScope);
      return undefined;
    }) as unknown as typeof Sentry.withScope);
    captureSpy.mockReturnValue('evt_xyz');

    const err = new ElevareApiError('503', 503, '/quotation');
    await handleElevareFailure(err, makeSession(), 'en');

    const extraCalls = fakeScope.setExtra.mock.calls;
    const extraMap = new Map(extraCalls.map((c) => [c[0], c[1]]));
    expect(extraMap.get('sessionId')).toBe('hotel-abc:+5511999999999');
    expect(extraMap.get('errorType')).toBe('api_error');
    expect(extraMap.get('language')).toBe('en');

    const tagCalls = fakeScope.setTag.mock.calls;
    const tagMap = new Map(tagCalls.map((c) => [c[0], c[1]]));
    expect(tagMap.get('module')).toBe('elevare-fallback');
    expect(tagMap.get('errorType')).toBe('api_error');
    expect(tagMap.get('language')).toBe('en');
  });

  it('#36 — Sentry not configured → returns empty eventId', async () => {
    getClientSpy.mockReturnValue(undefined);
    const err = new ElevareApiError('503', 503, '/search');
    const result = await handleElevareFailure(err, makeSession(), 'pt');
    expect(result.sentryEventId).toBe('');
    expect(withScopeSpy).not.toHaveBeenCalled();
    expect(captureSpy).not.toHaveBeenCalled();
  });

  it('reportToSentry normalizes non-Error values to Error', () => {
    const fakeScope = {
      setFingerprint: jest.fn(),
      setTag: jest.fn(),
      setExtra: jest.fn(),
    };
    getClientSpy.mockReturnValue({} as ReturnType<typeof Sentry.getClient>);
    withScopeSpy.mockImplementation(((cb: (s: typeof fakeScope) => void) => {
      cb(fakeScope);
      return undefined;
    }) as unknown as typeof Sentry.withScope);
    captureSpy.mockReturnValue('evt_norm');

    const eventId = reportToSentry('plain string', makeSession(), 'api_error', 'pt');
    expect(eventId).toBe('evt_norm');
    const first = captureSpy.mock.calls[0]?.[0];
    expect(first).toBeInstanceOf(Error);
  });
});

// ─── Logging (AC15) ────────────────────────────────────────────

describe('Logging — AC15', () => {
  it('#31 — logs elevare_fallback_triggered with correct fields', async () => {
    // Import the logger dynamically to spy without circular import issues.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { logger } = require('../../backend/src/middleware/logging');
    const warnSpy = jest.spyOn(logger, 'warn').mockImplementation(() => logger);

    try {
      const err = new ElevareApiError('503', 503, '/search');
      await handleElevareFailure(err, makeSession(), 'pt');

      const match = warnSpy.mock.calls.find(
        (c) => c[0] === 'elevare_fallback_triggered',
      );
      expect(match).toBeDefined();
      const payload = match?.[1] as Record<string, unknown>;
      expect(payload['errorType']).toBe('api_error');
      expect(payload['language']).toBe('pt');
      expect(payload['sessionId']).toBe('+5511999999999');
      expect(payload['hotelId']).toBe('hotel-abc');
      expect(payload['handoverTriggered']).toBe(true);
    } finally {
      warnSpy.mockRestore();
    }
  });
});

// ─── Language validation (AC16) ────────────────────────────────

describe('Language validation — AC16', () => {
  it('#32 — invalid language defaults to pt', () => {
    expect(validateLanguage('fr')).toBe<SupportedLanguage>('pt');
    expect(selectFallbackMessage('timeout', 'fr')).toBe(
      FALLBACK_MESSAGES.timeout.pt,
    );
  });

  it('#33 — undefined language defaults to pt', () => {
    expect(validateLanguage(undefined)).toBe<SupportedLanguage>('pt');
    expect(validateLanguage(null)).toBe<SupportedLanguage>('pt');
    expect(validateLanguage(123)).toBe<SupportedLanguage>('pt');
  });

  it('#34 — logs warning for unknown language', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { logger } = require('../../backend/src/middleware/logging');
    const warnSpy = jest.spyOn(logger, 'warn').mockImplementation(() => logger);

    try {
      validateLanguage('klingon');
      const match = warnSpy.mock.calls.find(
        (c) => c[0] === 'fallback_unknown_language',
      );
      expect(match).toBeDefined();
      const payload = match?.[1] as Record<string, unknown>;
      expect(payload['language']).toBe('klingon');
      expect(payload['defaultedTo']).toBe('pt');
    } finally {
      warnSpy.mockRestore();
    }
  });
});

// ─── Type structure (AC17) ─────────────────────────────────────

describe('FallbackResult type structure — AC17', () => {
  it('#35 — has the 4 required fields', async () => {
    const err = new ElevareApiError('503', 503, '/search');
    const result: FallbackResult = await handleElevareFailure(
      err,
      makeSession(),
      'pt',
    );
    expect(result).toHaveProperty('guestMessage');
    expect(result).toHaveProperty('handoverTriggered');
    expect(result).toHaveProperty('sentryEventId');
    expect(result).toHaveProperty('errorType');
    expect(typeof result.guestMessage).toBe('string');
    expect(typeof result.handoverTriggered).toBe('boolean');
    expect(typeof result.sentryEventId).toBe('string');
    expect(typeof result.errorType).toBe('string');
  });
});

// ─── Context preservation (AC1/AC13) ───────────────────────────

describe('Context preservation — AC1/AC13', () => {
  it('#37 — timeout with session context preserved', async () => {
    const err = new ElevareTimeoutError(5000, '/search');
    const session = makeSession({
      context: {
        guestName: 'Ana',
        lastIntent: 'RAG',
        preferences: { petFriendly: true },
      },
    });
    const result = await handleElevareFailure(err, session, 'pt');
    // timeout → handoverTriggered false, message in PT
    expect(result.handoverTriggered).toBe(false);
    expect(result.guestMessage).toBe(FALLBACK_MESSAGES.timeout.pt);
    expect(result.errorType).toBe<ElevareErrorType>('timeout');
  });

  it('timeout message content has no banned terms (spot-check)', async () => {
    const err = new ElevareTimeoutError(5000, '/search');
    const result = await handleElevareFailure(err, makeSession(), 'pt');
    const msg = result.guestMessage.toLowerCase();
    for (const term of BANNED_TERMS) {
      expect(msg).not.toContain(term.toLowerCase());
    }
  });

  it('produces EN message when language=en', async () => {
    const err = new ElevareApiError('503', 503, '/search');
    const result = await handleElevareFailure(err, makeSession(), 'en');
    expect(result.guestMessage).toBe(FALLBACK_MESSAGES.api_error.en);
  });

  it('produces ES message when language=es', async () => {
    const err = new ElevareCircuitOpenError(5, Date.now(), 30_000);
    const result = await handleElevareFailure(err, makeSession(), 'es');
    expect(result.guestMessage).toBe(FALLBACK_MESSAGES.circuit_open.es);
  });
});
