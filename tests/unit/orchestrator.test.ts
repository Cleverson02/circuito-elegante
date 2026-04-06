/**
 * Unit tests for Story 2.11 — Orchestrator Agent.
 *
 * Covers AC1-AC8: Agent definition, tool registration, model config,
 * system prompt anti-hallucination rules, handoff to Persona Agent.
 *
 * Tests read the prompt file directly and verify tool/model constants
 * without importing orchestrator.ts (which uses import.meta).
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { MODELS } from '../../backend/src/agents/types';

// ─── Prompt Content (read directly — avoids import.meta) ──────

const PROMPT_PATH = join(
  __dirname,
  '../../backend/src/prompts/orchestrator.md',
);
const promptContent = readFileSync(PROMPT_PATH, 'utf-8');

// ════��══════════════════════════════════��═══════════════════════
// Agent Definition (AC1, AC2)
// ════════════════��══════════════════════════════════════════════

describe('Orchestrator Agent definition — AC1, AC2', () => {
  it('uses the turbo model tier (gpt-4o)', () => {
    expect(MODELS.turbo).toBe('gpt-4o');
  });

  it('model tier "turbo" exists in MODELS config', () => {
    expect(MODELS).toHaveProperty('turbo');
    expect(typeof MODELS.turbo).toBe('string');
  });

  it('orchestrator source registers all 3 tools', () => {
    const source = readFileSync(
      join(__dirname, '../../backend/src/agents/orchestrator.ts'),
      'utf-8',
    );

    expect(source).toContain('instrumentedSearchHotels');
    expect(source).toContain('instrumentedQueryKB');
    expect(source).toContain('instrumentedTransferToHuman');
    expect(source).toContain(
      "tools: [instrumentedSearchHotels, instrumentedQueryKB, instrumentedTransferToHuman]",
    );
  });

  it('orchestrator source configures handoff to personaAgent', () => {
    const source = readFileSync(
      join(__dirname, '../../backend/src/agents/orchestrator.ts'),
      'utf-8',
    );

    expect(source).toContain("import { personaAgent }");
    expect(source).toContain('handoffs: [personaAgent]');
  });

  it('orchestrator is named StellaOrchestrator', () => {
    const source = readFileSync(
      join(__dirname, '../../backend/src/agents/orchestrator.ts'),
      'utf-8',
    );

    expect(source).toContain("name: 'StellaOrchestrator'");
  });
});

// ═══════��═══════════════════════════════════════════════════════
// System Prompt Anti-Hallucination (AC4)
// ════════��═════���════════════════════════════════════���═══════════

describe('Orchestrator system prompt — AC4', () => {
  it('contains NEVER invent data rule', () => {
    expect(promptContent).toMatch(/NEVER invent/i);
  });

  it('enforces using ONLY tool results', () => {
    expect(promptContent).toMatch(/ONLY.*results.*tools|ONLY the results returned by tools/i);
  });

  it('prohibits fabricating prices', () => {
    expect(promptContent).toMatch(/NEVER fabricate prices/i);
  });

  it('prohibits fabricating availability', () => {
    expect(promptContent).toMatch(/NEVER fabricate.*availability/i);
  });

  it('prohibits fabricating amenities', () => {
    expect(promptContent).toMatch(/NEVER fabricate.*amenities/i);
  });

  it('handles empty tool results explicitly', () => {
    expect(promptContent).toMatch(/empty results|no results|no matching/i);
  });

  it('handles tool failures explicitly', () => {
    expect(promptContent).toMatch(/tool fails|failure/i);
  });

  it('contains all 5 anti-hallucination rules', () => {
    // 5 numbered CRITICAL rules
    expect(promptContent).toContain('1.');
    expect(promptContent).toContain('2.');
    expect(promptContent).toContain('3.');
    expect(promptContent).toContain('4.');
    expect(promptContent).toContain('5.');
  });
});

// ══════════════��════════════════════════════════════════════════
// Tool Registration (AC2, AC5)
// ════════════════���════════════════════════════════��═════════════

describe('Orchestrator tool registration — AC2, AC5', () => {
  it('registers search_hotels tool', () => {
    const source = readFileSync(
      join(__dirname, '../../backend/src/agents/orchestrator.ts'),
      'utf-8',
    );
    expect(source).toContain("name: 'search_hotels'");
  });

  it('registers query_knowledge_base tool', () => {
    const source = readFileSync(
      join(__dirname, '../../backend/src/agents/orchestrator.ts'),
      'utf-8',
    );
    expect(source).toContain("name: 'query_knowledge_base'");
  });

  it('registers transfer_to_human tool', () => {
    const source = readFileSync(
      join(__dirname, '../../backend/src/agents/orchestrator.ts'),
      'utf-8',
    );
    expect(source).toContain("name: 'transfer_to_human'");
  });
});

// ═══════════════���═══════════════════════════════════════════════
// Tool Timeout Configuration (AC6)
// ═════════════════════��══════════════════════════���══════════════

describe('Orchestrator tool timeout — AC6', () => {
  it('defines 5s timeout constant', () => {
    const source = readFileSync(
      join(__dirname, '../../backend/src/agents/orchestrator.ts'),
      'utf-8',
    );
    expect(source).toContain('TOOL_TIMEOUT_MS = 5_000');
  });

  it('wraps search_hotels with timeout', () => {
    const source = readFileSync(
      join(__dirname, '../../backend/src/agents/orchestrator.ts'),
      'utf-8',
    );
    expect(source).toMatch(
      /withTimeout\(searchHotels\(params\),\s*TOOL_TIMEOUT_MS\)/,
    );
  });

  it('wraps query_knowledge_base with timeout', () => {
    const source = readFileSync(
      join(__dirname, '../../backend/src/agents/orchestrator.ts'),
      'utf-8',
    );
    expect(source).toMatch(
      /withTimeout\(\s*queryKnowledgeBase\(params\)/,
    );
  });

  it('wraps transfer_to_human with timeout', () => {
    const source = readFileSync(
      join(__dirname, '../../backend/src/agents/orchestrator.ts'),
      'utf-8',
    );
    expect(source).toMatch(
      /withTimeout\(\s*Promise\.resolve\(buildHandoverSummary\(params\)\)/,
    );
  });
});

// ═══════════════════════════════════════════════════════════════
// Tool Logging (AC7)
// ═════���═════════════════════════════════════════════════════════

describe('Orchestrator tool logging — AC7', () => {
  it('logs tool name on each call', () => {
    const source = readFileSync(
      join(__dirname, '../../backend/src/agents/orchestrator.ts'),
      'utf-8',
    );
    expect(source).toContain("logToolCall('search_hotels'");
    expect(source).toContain("logToolCall('query_knowledge_base'");
    expect(source).toContain("logToolCall('transfer_to_human'");
  });

  it('logs latency via Date.now() delta', () => {
    const source = readFileSync(
      join(__dirname, '../../backend/src/agents/orchestrator.ts'),
      'utf-8',
    );
    // Each tool captures start time and computes delta
    const startCount = (source.match(/const start = Date\.now\(\)/g) ?? []).length;
    expect(startCount).toBeGreaterThanOrEqual(3);
  });

  it('logs success and error states', () => {
    const source = readFileSync(
      join(__dirname, '../../backend/src/agents/orchestrator.ts'),
      'utf-8',
    );
    // Each tool has true (success) and false (error) logToolCall invocations
    const successCalls = (source.match(/logToolCall\(.+?,\s*true,/g) ?? []).length;
    const errorCalls = (source.match(/logToolCall\(.+?,\s*false,/g) ?? []).length;
    expect(successCalls).toBe(3);
    expect(errorCalls).toBe(3);
  });

  it('uses logger.warn for error cases (F1 fix)', () => {
    const source = readFileSync(
      join(__dirname, '../../backend/src/agents/orchestrator.ts'),
      'utf-8',
    );
    // logToolCall routes to logger.warn when success=false
    expect(source).toContain('success ? logger.info.bind(logger) : logger.warn.bind(logger)');
  });
});

// ═════���═════════════════════════════════════════════════════════
// Handoff Configuration (AC3)
// ═══════════��═════════════════════════════════════��═════════════

describe('Orchestrator handoff — AC3', () => {
  it('prompt describes handoff to Persona Agent', () => {
    expect(promptContent).toMatch(/hand.?off.*Persona Agent/i);
  });

  it('prompt maps intents to tools', () => {
    expect(promptContent).toContain('RAG');
    expect(promptContent).toContain('API_SEARCH');
    expect(promptContent).toContain('HANDOVER');
    expect(promptContent).toContain('query_knowledge_base');
    expect(promptContent).toContain('search_hotels');
    expect(promptContent).toContain('transfer_to_human');
  });
});

// ═══════════════���═══════════════════════════════════════════════
// Tool Fallback Behavior (AC8)
// ════════════════════════════��══════════════════════════════════

describe('Orchestrator tool fallback — AC8', () => {
  it('search_hotels returns error message on failure instead of throwing', () => {
    const source = readFileSync(
      join(__dirname, '../../backend/src/agents/orchestrator.ts'),
      'utf-8',
    );
    // The catch block returns a fallback object instead of re-throwing
    expect(source).toMatch(
      /catch.*err[\s\S]*?return\s*\{[\s\S]*?hotels:\s*\[\]/,
    );
  });

  it('query_knowledge_base returns error message on failure instead of throwing', () => {
    const source = readFileSync(
      join(__dirname, '../../backend/src/agents/orchestrator.ts'),
      'utf-8',
    );
    expect(source).toMatch(
      /catch.*err[\s\S]*?return\s*\{[\s\S]*?found:\s*false/,
    );
  });

  it('transfer_to_human returns error message on failure instead of throwing', () => {
    const source = readFileSync(
      join(__dirname, '../../backend/src/agents/orchestrator.ts'),
      'utf-8',
    );
    expect(source).toMatch(
      /catch.*err[\s\S]*?return\s*\{[\s\S]*?transferred:\s*false/,
    );
  });
});

// ═══════════════════════════════════════════════════════════════
// runOrchestrator Error Handling (F2 fix)
// ═══════════════════════════════════════════════════════════════

describe('runOrchestrator error handling — F2 fix', () => {
  it('wraps run() in try/catch', () => {
    const source = readFileSync(
      join(__dirname, '../../backend/src/agents/orchestrator.ts'),
      'utf-8',
    );
    // Verify try/catch around run(orchestratorAgent, message)
    expect(source).toMatch(
      /try\s*\{[\s\S]*?run\(orchestratorAgent,\s*message\)[\s\S]*?\}\s*catch/,
    );
  });

  it('logs failure with logger.warn on run() error', () => {
    const source = readFileSync(
      join(__dirname, '../../backend/src/agents/orchestrator.ts'),
      'utf-8',
    );
    expect(source).toContain("logger.warn('orchestrator_run_failed'");
  });

  it('uses Language type from types.ts (F3 fix)', () => {
    const source = readFileSync(
      join(__dirname, '../../backend/src/agents/orchestrator.ts'),
      'utf-8',
    );
    expect(source).toContain("type Language } from './types.js'");
    expect(source).toContain('language: Language');
  });
});
