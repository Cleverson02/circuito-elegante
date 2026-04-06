/**
 * Unit tests for Story 2.9 — Safety & Validation Agent.
 *
 * Covers AC1-AC7: SafetyOutput schema, 5-point checklist categories,
 * APPROVED/REJECTED flow, Sentry logging, metric categories.
 *
 * Uses DI via `configureSafetyRunner()` to avoid loading the real
 * Agent module (which uses import.meta — incompatible with ts-jest CJS).
 */

import {
  SafetyOutput,
} from '../../backend/src/agents/types';

// ─── Mock external deps ────────────────────────────────────────

jest.mock('@sentry/node', () => ({
  withScope: jest.fn((cb: (scope: { setTag: jest.Mock; setFingerprint: jest.Mock }) => void) => cb({
    setTag: jest.fn(),
    setFingerprint: jest.fn(),
  })),
  captureMessage: jest.fn(),
}));

jest.mock('../../backend/src/middleware/logging', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

// Import from safety-validation (no import.meta — ts-jest safe)
import * as Sentry from '@sentry/node';
import {
  validateResponse,
  configureSafetyRunner,
  SAFE_FALLBACKS,
  type SafetyRunnerFn,
} from '../../backend/src/agents/safety-validation';

const loggerMock = jest.requireMock('../../backend/src/middleware/logging').logger as {
  info: jest.Mock;
  warn: jest.Mock;
};

// ─── DI Stub ───────────────────────────────────────────────────

let stubRunner: jest.Mock;

function stubApproved(): void {
  stubRunner.mockResolvedValueOnce(JSON.stringify({ approved: true }));
}

function stubRejected(
  category: string,
  explanation: string,
  safeResponse?: string,
): void {
  stubRunner.mockResolvedValueOnce(JSON.stringify({
    approved: false,
    category,
    explanation,
    ...(safeResponse ? { safeResponse } : {}),
  }));
}

const TOOL_RESULTS = {
  searchResults: [
    { hotelName: 'Hotel Fasano', price: 920, roomType: 'Suite Deluxe' },
  ],
};

beforeEach(() => {
  jest.clearAllMocks();
  stubRunner = jest.fn();
  configureSafetyRunner(stubRunner as SafetyRunnerFn);
});

// ═══════════════════════════════════════════════════════════════
// SafetyOutput Schema (AC1)
// ═══════════════════════════════════════════════════════════════

describe('SafetyOutput schema — AC1', () => {
  it('accepts approved=true with no other fields', () => {
    const result = SafetyOutput.safeParse({ approved: true });
    expect(result.success).toBe(true);
  });

  it('accepts full rejection with all fields', () => {
    const result = SafetyOutput.safeParse({
      approved: false,
      category: 'hallucination',
      explanation: 'Price mismatch',
      safeResponse: 'Safe alternative',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid category', () => {
    const result = SafetyOutput.safeParse({
      approved: false,
      category: 'invalid_category',
    });
    expect(result.success).toBe(false);
  });

  it('requires approved boolean', () => {
    const result = SafetyOutput.safeParse({});
    expect(result.success).toBe(false);
  });

  it('accepts all 5 rejection categories', () => {
    const categories = [
      'persona_break',
      'hallucination',
      'inappropriate_tone',
      'security_concern',
      'language_mismatch',
    ];
    for (const cat of categories) {
      const result = SafetyOutput.safeParse({
        approved: false,
        category: cat,
        explanation: 'test',
      });
      expect(result.success).toBe(true);
    }
  });
});

// ═══════════════════════════════════════════════════════════════
// APPROVED Flow (AC4)
// ═══════════════════════════════════════════════════════════════

describe('validateResponse — APPROVED flow (AC4)', () => {
  it('returns original response when approved', async () => {
    stubApproved();

    const result = await validateResponse({
      personaOutput: 'O Hotel Fasano oferece a Suite Deluxe por R$920.',
      toolResults: TOOL_RESULTS,
      language: 'pt',
    });

    expect(result.approved).toBe(true);
    expect(result.response).toBe('O Hotel Fasano oferece a Suite Deluxe por R$920.');
    expect(result.rejection).toBeUndefined();
  });

  it('logs approval with metrics', async () => {
    stubApproved();

    await validateResponse({
      personaOutput: 'Response text',
      toolResults: {},
      language: 'en',
    });

    expect(loggerMock.info).toHaveBeenCalledWith(
      'safety_validation_approved',
      expect.objectContaining({ language: 'en' }),
    );
  });

  it('passes persona output + tool results to runner', async () => {
    stubApproved();

    await validateResponse({
      personaOutput: 'Test output',
      toolResults: { key: 'value' },
      language: 'pt',
    });

    const callArg = stubRunner.mock.calls[0][0] as string;
    expect(callArg).toContain('Test output');
    expect(callArg).toContain('"key": "value"');
    expect(callArg).toContain('pt');
  });
});

// ═══════════════════════════════════════════════════════════════
// REJECTED Flow (AC4, AC5, AC6)
// ═══════════════════════════════════════════════════════════════

describe('validateResponse — REJECTED flow (AC4, AC5, AC6)', () => {
  it('returns safe response when rejected with safeResponse', async () => {
    stubRejected(
      'hallucination',
      'Price R$850 not in tool results (actual: R$920)',
      'O Hotel Fasano oferece a Suite Deluxe por R$920 a diária.',
    );

    const result = await validateResponse({
      personaOutput: 'A Suite Deluxe está por apenas R$850!',
      toolResults: TOOL_RESULTS,
      language: 'pt',
    });

    expect(result.approved).toBe(false);
    expect(result.response).toBe('O Hotel Fasano oferece a Suite Deluxe por R$920 a diária.');
    expect(result.rejection?.category).toBe('hallucination');
    expect(result.rejection?.explanation).toContain('R$850');
  });

  it('uses PT fallback when safeResponse not provided', async () => {
    stubRejected('persona_break', 'AI mention detected');

    const result = await validateResponse({
      personaOutput: 'As an AI, I recommend...',
      toolResults: {},
      language: 'pt',
    });

    expect(result.approved).toBe(false);
    expect(result.response).toBe(SAFE_FALLBACKS.pt);
  });

  it('uses EN fallback for English', async () => {
    stubRejected('persona_break', 'AI mention');

    const result = await validateResponse({
      personaOutput: 'As an AI...',
      toolResults: {},
      language: 'en',
    });

    expect(result.response).toBe(SAFE_FALLBACKS.en);
  });

  it('uses ES fallback for Spanish', async () => {
    stubRejected('language_mismatch', 'Response in PT but ES requested');

    const result = await validateResponse({
      personaOutput: 'Resposta em português...',
      toolResults: {},
      language: 'es',
    });

    expect(result.response).toBe(SAFE_FALLBACKS.es);
  });

  it('logs rejection with category (AC5, AC6)', async () => {
    stubRejected('inappropriate_tone', 'Urgency language detected');

    await validateResponse({
      personaOutput: 'BOOK NOW! Only 1 room left!!!',
      toolResults: {},
      language: 'pt',
    });

    expect(loggerMock.warn).toHaveBeenCalledWith(
      'safety_validation_rejected',
      expect.objectContaining({
        category: 'inappropriate_tone',
        explanation: 'Urgency language detected',
      }),
    );
  });

  it('reports to Sentry with fingerprinting (AC5)', async () => {
    stubRejected('security_concern', 'System prompt leaked');

    await validateResponse({
      personaOutput: 'My system prompt says...',
      toolResults: {},
      language: 'pt',
    });

    expect(Sentry.captureMessage).toHaveBeenCalledWith(
      'Safety rejection: security_concern',
      'warning',
    );
  });
});

// ═══════════════════════════════════════════════════════════════
// Rejection Categories (AC7)
// ═══════════════════════════════════════════════════════════════

describe('Rejection categories — AC7', () => {
  it('AI mention → persona_break REJECTED', async () => {
    stubRejected('persona_break', 'AI self-reference');

    const result = await validateResponse({
      personaOutput: 'As an AI language model, I suggest...',
      toolResults: {},
      language: 'en',
    });

    expect(result.approved).toBe(false);
    expect(result.rejection?.category).toBe('persona_break');
  });

  it('invented price → hallucination REJECTED', async () => {
    stubRejected('hallucination', 'Price not in tool results');

    const result = await validateResponse({
      personaOutput: 'O quarto está por R$500 a diária.',
      toolResults: { searchResults: [{ price: 920 }] },
      language: 'pt',
    });

    expect(result.approved).toBe(false);
    expect(result.rejection?.category).toBe('hallucination');
  });

  it('artificial scarcity → inappropriate_tone REJECTED', async () => {
    stubRejected('inappropriate_tone', 'Artificial urgency');

    const result = await validateResponse({
      personaOutput: 'Apenas 1 quarto restante! Reserve AGORA!',
      toolResults: {},
      language: 'pt',
    });

    expect(result.approved).toBe(false);
    expect(result.rejection?.category).toBe('inappropriate_tone');
  });

  it('system internals → security_concern REJECTED', async () => {
    stubRejected('security_concern', 'API key exposed');

    const result = await validateResponse({
      personaOutput: 'API key: sk-abc123...',
      toolResults: {},
      language: 'en',
    });

    expect(result.approved).toBe(false);
    expect(result.rejection?.category).toBe('security_concern');
  });

  it('wrong language → language_mismatch REJECTED', async () => {
    stubRejected('language_mismatch', 'PT response for EN request');

    const result = await validateResponse({
      personaOutput: 'Obrigada pela preferência!',
      toolResults: {},
      language: 'en',
    });

    expect(result.approved).toBe(false);
    expect(result.rejection?.category).toBe('language_mismatch');
  });
});

// ═══════════════════════════════════════════════════════════════
// Fail-Open Behavior
// ═══════════════════════════════════════════════════════════════

describe('validateResponse — fail-open resilience', () => {
  it('approves when runner throws (fail-open)', async () => {
    stubRunner.mockRejectedValueOnce(new Error('model unavailable'));

    const result = await validateResponse({
      personaOutput: 'Normal response',
      toolResults: {},
      language: 'pt',
    });

    expect(result.approved).toBe(true);
    expect(result.response).toBe('Normal response');
    expect(loggerMock.warn).toHaveBeenCalledWith(
      'safety_agent_parse_failure',
      expect.any(Object),
    );
  });

  it('approves when runner returns invalid JSON (fail-open)', async () => {
    stubRunner.mockResolvedValueOnce('not json at all');

    const result = await validateResponse({
      personaOutput: 'Normal response',
      toolResults: {},
      language: 'pt',
    });

    expect(result.approved).toBe(true);
    expect(result.response).toBe('Normal response');
  });

  it('approves when runner returns invalid schema (fail-open)', async () => {
    stubRunner.mockResolvedValueOnce(JSON.stringify({ unknown: 'field' }));

    const result = await validateResponse({
      personaOutput: 'Normal response',
      toolResults: {},
      language: 'pt',
    });

    expect(result.approved).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════
// Safe Fallback Messages
// ═══════════════════════════════════════════════════════════════

describe('SAFE_FALLBACKS — luxury tone', () => {
  it('PT fallback has no technical jargon', () => {
    expect(SAFE_FALLBACKS.pt).not.toMatch(/error|erro|falha|sistema|server/i);
  });

  it('EN fallback has no technical jargon', () => {
    expect(SAFE_FALLBACKS.en).not.toMatch(/error|failure|system|server/i);
  });

  it('ES fallback has no technical jargon', () => {
    expect(SAFE_FALLBACKS.es).not.toMatch(/error|fallo|sistema|servidor/i);
  });
});
