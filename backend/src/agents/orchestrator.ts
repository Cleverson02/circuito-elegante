/**
 * Orchestrator Agent — Story 2.11 (FR8, FR15).
 *
 * Second stage of the pipeline: receives classified intent, executes
 * appropriate tools (searchHotels, queryKnowledgeBase, transferToHuman),
 * then hands off to the Persona Agent.
 *
 * Tools are wrapped with 5s timeout and structured logging (AC6, AC7).
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Agent, run, tool } from '@openai/agents';
import { MODELS, type Language } from './types.js';
import { personaAgent } from './persona-agent.js';
import { SearchHotelsParams, searchHotels } from '../tools/search-hotels.js';
import { QueryKBParams, queryKnowledgeBase } from '../tools/query-knowledge-base.js';
import { TransferParams, buildHandoverSummary } from '../tools/transfer-to-human.js';
import { logger } from '../middleware/logging.js';

// ─── Prompt Loading ────────────────────────────────────────────

const PROMPT_PATH = join(import.meta.dirname, '..', 'prompts', 'orchestrator.md');

let orchestratorPrompt: string | null = null;

function getPrompt(): string {
  if (!orchestratorPrompt) {
    orchestratorPrompt = readFileSync(PROMPT_PATH, 'utf-8');
  }
  return orchestratorPrompt;
}

// ─── Tool Timeout ──────────────────────────────────────────────

export const TOOL_TIMEOUT_MS = 5_000;

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(
      () => reject(new Error(`Tool timeout after ${ms}ms`)),
      ms,
    );
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(timeoutId!);
  }
}

function logToolCall(
  toolName: string,
  latencyMs: number,
  success: boolean,
  meta?: Record<string, unknown>,
): void {
  const logFn = success ? logger.info.bind(logger) : logger.warn.bind(logger);
  logFn('orchestrator_tool_call', {
    tool: toolName,
    latencyMs,
    success,
    ...meta,
  });
}

// ─── Instrumented Tools (AC6: timeout, AC7: logging) ──────────

const instrumentedSearchHotels = tool({
  name: 'search_hotels',
  description:
    'Search hotels by criteria: experience, region, destination, petFriendly, poolHeated, bradescoCoupon. Returns up to 10 matching hotels.',
  parameters: SearchHotelsParams,
  execute: async (params) => {
    const start = Date.now();
    try {
      const results = await withTimeout(searchHotels(params), TOOL_TIMEOUT_MS);
      logToolCall('search_hotels', Date.now() - start, true, {
        count: results.length,
      });
      return results.length === 0
        ? { hotels: [], message: 'No hotels found matching the criteria.' }
        : { hotels: results, count: results.length };
    } catch (err) {
      logToolCall('search_hotels', Date.now() - start, false, {
        error: err instanceof Error ? err.message : String(err),
      });
      return {
        hotels: [],
        error: err instanceof Error ? err.message : 'Tool execution failed',
      };
    }
  },
});

const instrumentedQueryKB = tool({
  name: 'query_knowledge_base',
  description:
    'Search the FAQ knowledge base using semantic search. Optionally filter by hotel name. Returns top relevant chunks.',
  parameters: QueryKBParams,
  execute: async (params) => {
    const start = Date.now();
    try {
      const result = await withTimeout(
        queryKnowledgeBase(params),
        TOOL_TIMEOUT_MS,
      );
      logToolCall('query_knowledge_base', Date.now() - start, true, {
        count: result.results.length,
        suggestion: result.suggestion,
      });
      if (result.results.length === 0) {
        return {
          found: false,
          suggestion: result.suggestion ?? 'transfer_to_human',
          message: 'No relevant information found in knowledge base.',
        };
      }
      return { found: true, results: result.results, count: result.results.length };
    } catch (err) {
      logToolCall('query_knowledge_base', Date.now() - start, false, {
        error: err instanceof Error ? err.message : String(err),
      });
      return {
        found: false,
        error: err instanceof Error ? err.message : 'Tool execution failed',
      };
    }
  },
});

const instrumentedTransferToHuman = tool({
  name: 'transfer_to_human',
  description:
    'Transfer conversation to human agent. Compiles session context into structured summary.',
  parameters: TransferParams,
  execute: async (params) => {
    const start = Date.now();
    try {
      const summary = await withTimeout(
        Promise.resolve(buildHandoverSummary(params)),
        TOOL_TIMEOUT_MS,
      );
      logToolCall('transfer_to_human', Date.now() - start, true, {
        reason: params.reason,
      });
      return {
        transferred: true,
        summary,
        message: `Transferência solicitada: ${params.reason}. Contexto compilado para atendente humano.`,
      };
    } catch (err) {
      logToolCall('transfer_to_human', Date.now() - start, false, {
        error: err instanceof Error ? err.message : String(err),
      });
      return {
        transferred: false,
        error: err instanceof Error ? err.message : 'Tool execution failed',
      };
    }
  },
});

// ─── Agent Instance (AC1, AC2, AC3) ───────────────────────────

export const orchestratorAgent = new Agent({
  name: 'StellaOrchestrator',
  model: MODELS.turbo,
  instructions: getPrompt(),
  tools: [instrumentedSearchHotels, instrumentedQueryKB, instrumentedTransferToHuman],
  handoffs: [personaAgent],
  handoffDescription:
    'Orchestrates hotel search, FAQ lookup, and human transfer. Hands off to the Persona Agent for natural language response generation.',
});

// ─── Public API ───────────────────────────────────────────────

export interface OrchestratorInput {
  intent: string;
  message: string;
  language: Language;
  sessionContext?: {
    guestName?: string;
    hotelFocus?: string;
  };
}

export async function runOrchestrator(
  input: OrchestratorInput,
): Promise<string> {
  const contextParts: string[] = [
    `Intent: ${input.intent}`,
    `Language: ${input.language}`,
  ];

  if (input.sessionContext?.guestName) {
    contextParts.push(`Guest: ${input.sessionContext.guestName}`);
  }
  if (input.sessionContext?.hotelFocus) {
    contextParts.push(`Hotel focus: ${input.sessionContext.hotelFocus}`);
  }

  contextParts.push(`\nUser message: ${input.message}`);

  const message = contextParts.join('\n');

  const start = Date.now();

  try {
    const result = await run(orchestratorAgent, message);
    const latency = Date.now() - start;

    logger.info('orchestrator_run_complete', {
      intent: input.intent,
      language: input.language,
      latencyMs: latency,
    });

    return result.finalOutput as string;
  } catch (err) {
    const latency = Date.now() - start;

    logger.warn('orchestrator_run_failed', {
      intent: input.intent,
      language: input.language,
      latencyMs: latency,
      error: err instanceof Error ? err.message : String(err),
    });

    throw err;
  }
}
