/**
 * Unit tests for Story 2.6 — Pipeline Integration & Multi-Intent.
 *
 * Covers AC1-AC7: Pipeline chain, multi-intent decomposition,
 * parallel execution (Promise.all), unified response, fallback,
 * tracing via Runner.run().
 *
 * All agent modules are mocked since they use import.meta.dirname
 * (incompatible with ts-jest CJS).
 */

// ─── Mock agent modules (must be before imports) ──────────────

jest.mock('../../backend/src/agents/intent-agent', () => ({
  classifyIntent: jest.fn(),
}));

jest.mock('../../backend/src/agents/orchestrator', () => ({
  runOrchestrator: jest.fn(),
}));

jest.mock('../../backend/src/agents/persona-agent', () => ({
  generateResponse: jest.fn(),
}));

jest.mock('../../backend/src/agents/safety-agent', () => ({
  validateResponse: jest.fn(),
  SAFE_FALLBACKS: {
    pt: 'Estou verificando as informações para garantir a melhor experiência para você. Um momento, por favor.',
    en: "I'm verifying the information to ensure the best experience for you. One moment, please.",
    es: 'Estoy verificando la información para garantizar la mejor experiencia para usted. Un momento, por favor.',
  },
}));

jest.mock('../../backend/src/middleware/logging', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

// Story 2.7: Mock session context modules (imported by pipeline)
const mockSessionRedis = {
  get: jest.fn().mockResolvedValue(null),
  set: jest.fn().mockResolvedValue('OK'),
  del: jest.fn().mockResolvedValue(1),
};

jest.mock('../../backend/src/state/redis-client', () => ({
  getRedisClient: () => mockSessionRedis,
}));

jest.mock('../../backend/src/api/health', () => ({
  registerHealthChecker: jest.fn(),
}));

jest.mock('../../backend/src/state/session-snapshot', () => ({
  saveSessionSnapshot: jest.fn().mockResolvedValue(undefined),
}));

// ─── Imports ──────────────────────────────────────────────────

import { processMessage, partitionIntents, type PipelineInput, type PipelineResult } from '../../backend/src/agents/pipeline';
import { classifyIntent } from '../../backend/src/agents/intent-agent';
import { runOrchestrator } from '../../backend/src/agents/orchestrator';
import { generateResponse } from '../../backend/src/agents/persona-agent';
import { validateResponse } from '../../backend/src/agents/safety-agent';
import type { IntentOutput, IntentType } from '../../backend/src/agents/types';

const mockClassify = classifyIntent as jest.MockedFunction<typeof classifyIntent>;
const mockOrchestrator = runOrchestrator as jest.MockedFunction<typeof runOrchestrator>;
const mockPersona = generateResponse as jest.MockedFunction<typeof generateResponse>;
const mockValidate = validateResponse as jest.MockedFunction<typeof validateResponse>;

const loggerMock = jest.requireMock('../../backend/src/middleware/logging').logger as {
  info: jest.Mock;
  warn: jest.Mock;
};

// ─── Helpers ──────────────────────────────────────────────────

function makeIntent(overrides: Partial<IntentOutput> = {}): IntentOutput {
  return {
    intent: 'API_SEARCH',
    confidence: 0.95,
    subIntents: [],
    language: 'pt',
    reasoning: 'Test intent',
    ...overrides,
  };
}

function orchResult(output: string, toolOutputs: Record<string, unknown> = {}) {
  return { output, toolOutputs };
}

const DEFAULT_INPUT: PipelineInput = {
  message: 'Quais hotéis pet-friendly na Serra Gaúcha?',
  sessionId: 'sess-001',
  sessionContext: { guestName: 'Maria', hotelFocus: 'Hotel Laje de Pedra' },
};

// ─── Setup ────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
});

// ═══════════════════════════════════════════════════════════════
// Pipeline Response Schema
// ═══════════════════════════════════════════════════════════════

describe('Pipeline response schema', () => {
  it('returns all required fields in PipelineResult', async () => {
    mockClassify.mockResolvedValue(makeIntent());
    mockOrchestrator.mockResolvedValue(orchResult('Encontrei 3 hotéis pet-friendly.'));
    mockValidate.mockResolvedValue({
      approved: true,
      response: 'Encontrei 3 hotéis pet-friendly.',
    });

    const result = await processMessage(DEFAULT_INPUT);

    expect(result).toHaveProperty('response');
    expect(result).toHaveProperty('intent');
    expect(result).toHaveProperty('safetyApproved');
    expect(result).toHaveProperty('multiIntent');
    expect(result).toHaveProperty('latencyMs');
    expect(typeof result.response).toBe('string');
    expect(typeof result.safetyApproved).toBe('boolean');
    expect(typeof result.multiIntent).toBe('boolean');
    expect(typeof result.latencyMs).toBe('number');
  });

  it('includes the classified intent in result', async () => {
    const intent = makeIntent({ intent: 'RAG', confidence: 0.88 });
    mockClassify.mockResolvedValue(intent);
    mockOrchestrator.mockResolvedValue(orchResult('Resposta FAQ.'));
    mockValidate.mockResolvedValue({ approved: true, response: 'Resposta FAQ.' });

    const result = await processMessage(DEFAULT_INPUT);

    expect(result.intent).toEqual(intent);
  });
});

// ═══════════════════════════════════════════════════════════════
// Single Intent Pipeline — AC1, AC6
// ═══════════════════════════════════════════════════════════════

describe('Single intent pipeline — AC1, AC6', () => {
  it('chains Intent → Orchestrator → Persona → Safety for single intent', async () => {
    mockClassify.mockResolvedValue(makeIntent());
    mockOrchestrator.mockResolvedValue(orchResult('Hotel Laje de Pedra aceita pets.'));
    mockPersona.mockResolvedValue('Hotel Laje de Pedra aceita pets.');
    mockValidate.mockResolvedValue({
      approved: true,
      response: 'Hotel Laje de Pedra aceita pets.',
    });

    const result = await processMessage(DEFAULT_INPUT);

    // Intent classified
    expect(mockClassify).toHaveBeenCalledWith(DEFAULT_INPUT.message);
    // Orchestrator called with correct params
    expect(mockOrchestrator).toHaveBeenCalledWith({
      intent: 'API_SEARCH',
      message: DEFAULT_INPUT.message,
      language: 'pt',
      sessionContext: DEFAULT_INPUT.sessionContext,
    });
    // Safety validates output
    expect(mockValidate).toHaveBeenCalledWith({
      personaOutput: 'Hotel Laje de Pedra aceita pets.',
      toolResults: {},
      language: 'pt',
    });
    // Final result
    expect(result.response).toBe('Hotel Laje de Pedra aceita pets.');
    expect(result.safetyApproved).toBe(true);
    expect(result.multiIntent).toBe(false);
  });

  it('delegates final response generation to Persona Agent for single intent', async () => {
    mockClassify.mockResolvedValue(makeIntent());
    mockOrchestrator.mockResolvedValue(orchResult('Raw orchestrator output.'));
    mockPersona.mockResolvedValue('Polished persona response.');
    mockValidate.mockResolvedValue({ approved: true, response: 'Polished persona response.' });

    await processMessage(DEFAULT_INPUT);

    expect(mockPersona).toHaveBeenCalledWith({
      toolResults: { API_SEARCH: 'Raw orchestrator output.' },
      sessionContext: DEFAULT_INPUT.sessionContext,
      language: 'pt',
    });
  });

  it('logs intent classification with sessionId', async () => {
    mockClassify.mockResolvedValue(makeIntent());
    mockOrchestrator.mockResolvedValue(orchResult('OK'));
    mockValidate.mockResolvedValue({ approved: true, response: 'OK' });

    await processMessage(DEFAULT_INPUT);

    expect(loggerMock.info).toHaveBeenCalledWith(
      'pipeline_intent_classified',
      expect.objectContaining({
        sessionId: 'sess-001',
        intent: 'API_SEARCH',
      }),
    );
  });

  it('logs pipeline completion with latency', async () => {
    mockClassify.mockResolvedValue(makeIntent());
    mockOrchestrator.mockResolvedValue(orchResult('OK'));
    mockValidate.mockResolvedValue({ approved: true, response: 'OK' });

    await processMessage(DEFAULT_INPUT);

    expect(loggerMock.info).toHaveBeenCalledWith(
      'pipeline_complete',
      expect.objectContaining({
        sessionId: 'sess-001',
        safetyApproved: true,
        multiIntent: false,
      }),
    );
  });
});

// ═══════════════════════════════════════════════════════════════
// Multi-Intent Decomposition — AC2, AC3, AC4
// ═══════════════════════════════════════════════════════════════

describe('Multi-intent decomposition — AC2, AC3, AC4', () => {
  it('runs 2 parallel intents with Promise.all', async () => {
    const intent = makeIntent({
      intent: 'API_SEARCH',
      subIntents: ['API_SEARCH', 'RAG'],
    });
    mockClassify.mockResolvedValue(intent);

    // Track call order to verify parallelism
    const callOrder: string[] = [];
    mockOrchestrator.mockImplementation(async (params) => {
      callOrder.push(`start-${params.intent}`);
      await new Promise((r) => setTimeout(r, 10));
      callOrder.push(`end-${params.intent}`);
      return orchResult(`Result for ${params.intent}`);
    });

    mockPersona.mockResolvedValue('Resposta unificada sobre hotéis e FAQ.');
    mockValidate.mockResolvedValue({
      approved: true,
      response: 'Resposta unificada sobre hotéis e FAQ.',
    });

    const result = await processMessage(DEFAULT_INPUT);

    // Both intents should have been called
    expect(mockOrchestrator).toHaveBeenCalledTimes(2);
    // Persona receives all results for unified response (AC4)
    expect(mockPersona).toHaveBeenCalledWith(
      expect.objectContaining({
        toolResults: expect.objectContaining({
          API_SEARCH: 'Result for API_SEARCH',
          RAG: 'Result for RAG',
        }),
      }),
    );
    expect(result.multiIntent).toBe(true);
    expect(result.response).toBe('Resposta unificada sobre hotéis e FAQ.');
  });

  it('deduplicates primary intent from subIntents', async () => {
    const intent = makeIntent({
      intent: 'API_SEARCH',
      subIntents: ['API_SEARCH', 'RAG'],
    });
    mockClassify.mockResolvedValue(intent);
    mockOrchestrator.mockResolvedValue(orchResult('Result'));
    mockPersona.mockResolvedValue('Unified');
    mockValidate.mockResolvedValue({ approved: true, response: 'Unified' });

    await processMessage(DEFAULT_INPUT);

    // Should call orchestrator 2 times (API_SEARCH + RAG), not 3
    expect(mockOrchestrator).toHaveBeenCalledTimes(2);
  });

  it('executes HANDOVER sequentially after parallel intents (AC3)', async () => {
    const intent = makeIntent({
      intent: 'API_SEARCH',
      subIntents: ['RAG', 'HANDOVER'],
    });
    mockClassify.mockResolvedValue(intent);

    const callOrder: string[] = [];
    mockOrchestrator.mockImplementation(async (params) => {
      callOrder.push(params.intent);
      return orchResult(`Result for ${params.intent}`);
    });

    mockPersona.mockResolvedValue('Unified');
    mockValidate.mockResolvedValue({ approved: true, response: 'Unified' });

    await processMessage(DEFAULT_INPUT);

    // HANDOVER should be last (sequential, after parallel intents)
    expect(callOrder[callOrder.length - 1]).toBe('HANDOVER');
  });
});

// ═══════════════════════════════════════════════════════════════
// partitionIntents — AC3
// ═══════════════════════════════════════════════════════════════

describe('partitionIntents — AC3', () => {
  it('puts HANDOVER in sequential, others in parallel', () => {
    const result = partitionIntents(['API_SEARCH', 'RAG', 'HANDOVER']);
    expect(result.parallel).toEqual(['API_SEARCH', 'RAG']);
    expect(result.sequential).toEqual(['HANDOVER']);
  });

  it('returns all in parallel when no HANDOVER', () => {
    const result = partitionIntents(['API_SEARCH', 'RAG', 'CHAT']);
    expect(result.parallel).toEqual(['API_SEARCH', 'RAG', 'CHAT']);
    expect(result.sequential).toEqual([]);
  });

  it('handles empty array', () => {
    const result = partitionIntents([]);
    expect(result.parallel).toEqual([]);
    expect(result.sequential).toEqual([]);
  });

  it('handles only HANDOVER', () => {
    const result = partitionIntents(['HANDOVER']);
    expect(result.parallel).toEqual([]);
    expect(result.sequential).toEqual(['HANDOVER']);
  });
});

// ═══════════════════════════════════════════════════════════════
// Fallback — AC5
// ═══════════════════════════════════════════════════════════════

describe('Fallback when all tools fail — AC5', () => {
  it('returns SAFE_FALLBACK when single-intent orchestrator fails', async () => {
    mockClassify.mockResolvedValue(makeIntent({ language: 'pt' }));
    mockOrchestrator.mockRejectedValue(new Error('Tool timeout'));
    // validateResponse should NOT be called in fallback path

    const result = await processMessage(DEFAULT_INPUT);

    expect(result.response).toContain('verificando as informações');
    expect(result.safetyApproved).toBe(false);
    expect(mockValidate).not.toHaveBeenCalled();
  });

  it('returns SAFE_FALLBACK when ALL multi-intent tools fail', async () => {
    const intent = makeIntent({
      intent: 'API_SEARCH',
      subIntents: ['RAG'],
    });
    mockClassify.mockResolvedValue(intent);
    mockOrchestrator.mockRejectedValue(new Error('All tools failed'));

    const result = await processMessage(DEFAULT_INPUT);

    expect(result.response).toContain('verificando as informações');
    expect(result.safetyApproved).toBe(false);
    expect(result.multiIntent).toBe(true);
    expect(mockPersona).not.toHaveBeenCalled();
  });

  it('logs fallback when orchestrator fails', async () => {
    mockClassify.mockResolvedValue(makeIntent());
    mockOrchestrator.mockRejectedValue(new Error('timeout'));

    await processMessage(DEFAULT_INPUT);

    expect(loggerMock.warn).toHaveBeenCalledWith(
      'pipeline_orchestrator_failed',
      expect.objectContaining({
        sessionId: 'sess-001',
        error: 'timeout',
      }),
    );
  });

  it('uses correct language fallback (es)', async () => {
    mockClassify.mockResolvedValue(makeIntent({ language: 'es' }));
    mockOrchestrator.mockRejectedValue(new Error('fail'));

    const result = await processMessage(DEFAULT_INPUT);

    expect(result.response).toContain('verificando la información');
  });
});

// ═══════════════════════════════════════════════════════════════
// Multi-Intent: 3 intents with 1 failure — AC7
// ═══════════════════════════════════════════════════════════════

describe('Multi-intent: partial failure — AC7', () => {
  it('succeeds when 2 of 3 intents succeed (1 fails)', async () => {
    const intent = makeIntent({
      intent: 'API_SEARCH',
      subIntents: ['RAG', 'CHAT'],
    });
    mockClassify.mockResolvedValue(intent);

    mockOrchestrator.mockImplementation(async (params) => {
      if (params.intent === 'RAG') throw new Error('KB unavailable');
      return orchResult(`Result for ${params.intent}`);
    });

    mockPersona.mockResolvedValue('Encontrei hotéis. Sobre a FAQ, não consegui encontrar no momento.');
    mockValidate.mockResolvedValue({
      approved: true,
      response: 'Encontrei hotéis. Sobre a FAQ, não consegui encontrar no momento.',
    });

    const result = await processMessage(DEFAULT_INPUT);

    // Pipeline should succeed with partial results
    expect(result.safetyApproved).toBe(true);
    expect(result.multiIntent).toBe(true);
    // Persona receives partial results (RAG missing)
    expect(mockPersona).toHaveBeenCalledWith(
      expect.objectContaining({
        toolResults: expect.objectContaining({
          API_SEARCH: 'Result for API_SEARCH',
          CHAT: 'Result for CHAT',
        }),
      }),
    );
    // RAG should NOT be in results
    const toolResults = mockPersona.mock.calls[0]![0].toolResults as Record<string, string>;
    expect(toolResults).not.toHaveProperty('RAG');
  });

  it('logs each failed intent individually', async () => {
    const intent = makeIntent({
      intent: 'API_SEARCH',
      subIntents: ['RAG'],
    });
    mockClassify.mockResolvedValue(intent);

    mockOrchestrator.mockImplementation(async (params) => {
      if (params.intent === 'RAG') throw new Error('KB down');
      return orchResult('OK');
    });

    mockPersona.mockResolvedValue('Partial response');
    mockValidate.mockResolvedValue({ approved: true, response: 'Partial response' });

    await processMessage(DEFAULT_INPUT);

    expect(loggerMock.warn).toHaveBeenCalledWith(
      'pipeline_multi_intent_failed',
      expect.objectContaining({ intent: 'RAG', error: 'KB down' }),
    );
  });
});

// ═══════════════════════════════════════════════════════════════
// Safety Validation Integration
// ═══════════════════════════════════════════════════════════════

describe('Safety validation integration', () => {
  it('returns safety-rejected response when validation fails', async () => {
    mockClassify.mockResolvedValue(makeIntent());
    mockOrchestrator.mockResolvedValue(orchResult('Resposta com hallucination.'));
    mockValidate.mockResolvedValue({
      approved: false,
      response: 'Estou verificando as informações...',
      rejection: {
        category: 'hallucination',
        explanation: 'Response contains fabricated data',
      },
    });

    const result = await processMessage(DEFAULT_INPUT);

    expect(result.safetyApproved).toBe(false);
    expect(result.response).toBe('Estou verificando as informações...');
  });

  it('passes structured toolOutputs to safety for cross-check in multi-intent', async () => {
    const intent = makeIntent({
      intent: 'API_SEARCH',
      subIntents: ['RAG'],
    });
    mockClassify.mockResolvedValue(intent);
    mockOrchestrator.mockResolvedValue(orchResult('Result', {
      search_hotels: { hotels: [{ name: 'Hotel X' }], count: 1 },
    }));
    mockPersona.mockResolvedValue('Unified response');
    mockValidate.mockResolvedValue({ approved: true, response: 'Unified response' });

    await processMessage(DEFAULT_INPUT);

    expect(mockValidate).toHaveBeenCalledWith(
      expect.objectContaining({
        toolResults: expect.objectContaining({
          search_hotels: expect.objectContaining({ count: 1 }),
        }),
      }),
    );
  });
});

// ═══════════════════════════════════════════════════════════════
// Source-level Verification — AC6 (Runner.run tracing)
// ═══════════════════════════════════════════════════════════════

describe('Pipeline source verification — AC6', () => {
  it('pipeline source imports runOrchestrator (which uses Runner.run internally)', () => {
    const { readFileSync } = require('fs');
    const { join } = require('path');
    const source = readFileSync(
      join(__dirname, '../../backend/src/agents/pipeline.ts'),
      'utf-8',
    );

    expect(source).toContain("import { runOrchestrator");
    expect(source).toContain("import { classifyIntent }");
    expect(source).toContain("import { generateResponse }");
    expect(source).toContain("import { validateResponse, SAFE_FALLBACKS }");
  });

  it('uses Promise.all for parallel execution', () => {
    const { readFileSync } = require('fs');
    const { join } = require('path');
    const source = readFileSync(
      join(__dirname, '../../backend/src/agents/pipeline.ts'),
      'utf-8',
    );

    expect(source).toContain('Promise.all');
  });
});

// ═══════════════════════════════════════════════════════════════
// Story 2.7 — Hotel Focus E2E via Pipeline (F1 fix)
// ═══════════════════════════════════════════════════════════════

describe('Story 2.7 — hotelFocus tracking end-to-end', () => {
  it('extracts hotelFocus from single-intent searchHotels result', async () => {
    mockClassify.mockResolvedValue(makeIntent({ intent: 'API_SEARCH' }));
    mockOrchestrator.mockResolvedValue(orchResult(
      'Encontrei o Hotel Laje de Pedra na Serra Gaúcha.',
      {
        search_hotels: {
          hotels: [{ id: 'h1', name: 'Hotel Laje de Pedra', region: 'Serra Gaúcha' }],
          count: 1,
        },
      },
    ));
    mockValidate.mockResolvedValue({
      approved: true,
      response: 'Encontrei o Hotel Laje de Pedra na Serra Gaúcha.',
    });

    const result = await processMessage({
      message: 'Hotéis na Serra Gaúcha',
      sessionId: 'sess-focus-001',
    });

    expect(result.hotelFocus).toBe('Hotel Laje de Pedra');
  });

  it('extracts hotelFocus from multi-intent with searchHotels', async () => {
    mockClassify.mockResolvedValue(makeIntent({
      intent: 'API_SEARCH',
      subIntents: ['RAG'],
    }));
    mockOrchestrator.mockImplementation(async (params) => {
      if (params.intent === 'API_SEARCH') {
        return orchResult('Hotels found', {
          search_hotels: {
            hotels: [{ name: 'Hotel Serrano' }],
            count: 1,
          },
        });
      }
      return orchResult('FAQ answer');
    });
    mockPersona.mockResolvedValue('Unified response');
    mockValidate.mockResolvedValue({ approved: true, response: 'Unified response' });

    const result = await processMessage({
      message: 'Hotéis com piscina e horário do check-in',
      sessionId: 'sess-focus-002',
    });

    expect(result.hotelFocus).toBe('Hotel Serrano');
  });

  it('follow-up without hotel uses persisted hotelFocus', async () => {
    // Simulate existing session context with hotelFocus
    const existingCtx = {
      hotelFocus: 'Hotel Laje de Pedra',
      conversationHistory: [],
      preferences: {},
      updatedAt: '2026-04-06T00:00:00.000Z',
    };
    mockSessionRedis.get.mockResolvedValueOnce(JSON.stringify(existingCtx));

    mockClassify.mockResolvedValue(makeIntent({ intent: 'RAG' }));
    mockOrchestrator.mockResolvedValue(orchResult('O check-in é às 15h.'));
    mockValidate.mockResolvedValue({
      approved: true,
      response: 'O check-in é às 15h.',
    });

    await processMessage({
      message: 'Qual o horário do check-in?',
      sessionId: 'sess-followup',
    });

    // Orchestrator should receive the persisted hotelFocus
    expect(mockOrchestrator).toHaveBeenCalledWith(
      expect.objectContaining({
        sessionContext: expect.objectContaining({
          hotelFocus: 'Hotel Laje de Pedra',
        }),
      }),
    );
  });

  it('returns null hotelFocus when no hotels in results', async () => {
    mockClassify.mockResolvedValue(makeIntent({ intent: 'CHAT' }));
    mockOrchestrator.mockResolvedValue(orchResult('Bom dia! Como posso ajudar?'));
    mockValidate.mockResolvedValue({
      approved: true,
      response: 'Bom dia! Como posso ajudar?',
    });

    const result = await processMessage({
      message: 'Bom dia',
      sessionId: 'sess-no-hotel',
    });

    expect(result.hotelFocus).toBeNull();
  });
});
