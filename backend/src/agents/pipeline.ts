/**
 * Pipeline Integration & Multi-Intent — Story 2.6 (FR8, FR15).
 *
 * Entry point: processMessage() runs the full pipeline:
 * Intent → Orchestrator (2.11) → Persona → Safety → Response.
 *
 * Multi-intent decomposition with parallel tool execution (Promise.all)
 * and unified response generation by the Persona Agent.
 */

import { classifyIntent } from './intent-agent.js';
import { runOrchestrator } from './orchestrator.js';
import { generateResponse } from './persona-agent.js';
import { validateResponse, SAFE_FALLBACKS } from './safety-agent.js';
import type { IntentType, IntentOutput, Language } from './types.js';
import { logger } from '../middleware/logging.js';

// ─── Types ────────────────────────────────────────────────────

export interface PipelineInput {
  message: string;
  sessionId: string;
  sessionContext?: {
    guestName?: string;
    hotelFocus?: string;
  };
}

export interface PipelineResult {
  response: string;
  intent: IntentOutput;
  safetyApproved: boolean;
  multiIntent: boolean;
  latencyMs: number;
}

// ─── Intent Dependency Rules (AC3) ────────────────────────────

/**
 * HANDOVER always executes last (sequential) — transferring to a human
 * should only happen after other tool results are collected.
 * All other intents are independent and run in parallel.
 */
const SEQUENTIAL_INTENTS: ReadonlySet<string> = new Set<string>(['HANDOVER']);

export function partitionIntents(
  intents: IntentType[],
): { parallel: IntentType[]; sequential: IntentType[] } {
  const parallel: IntentType[] = [];
  const sequential: IntentType[] = [];
  for (const intent of intents) {
    if (SEQUENTIAL_INTENTS.has(intent)) {
      sequential.push(intent);
    } else {
      parallel.push(intent);
    }
  }
  return { parallel, sequential };
}

// ─── Deduplicate Intents ──────────────────────────────────────

function deduplicateIntents(
  primary: IntentType,
  subIntents: IntentType[],
): IntentType[] {
  const seen = new Set<IntentType>([primary]);
  const result: IntentType[] = [primary];
  for (const si of subIntents) {
    if (!seen.has(si)) {
      seen.add(si);
      result.push(si);
    }
  }
  return result;
}

// ─── Multi-Intent Execution (AC2, AC3) ────────────────────────

async function executeMultiIntent(
  intents: IntentType[],
  message: string,
  language: Language,
  sessionContext?: PipelineInput['sessionContext'],
): Promise<{ results: Record<string, string>; allFailed: boolean }> {
  const { parallel, sequential } = partitionIntents(intents);
  const results: Record<string, string> = {};
  let failures = 0;

  // Execute independent intents in parallel with Promise.all (AC2)
  if (parallel.length > 0) {
    const settled = await Promise.all(
      parallel.map(async (intent) => {
        try {
          const output = await runOrchestrator({
            intent,
            message,
            language,
            sessionContext,
          });
          return { intent, output, success: true as const };
        } catch (err) {
          logger.warn('pipeline_multi_intent_failed', {
            intent,
            error: err instanceof Error ? err.message : String(err),
          });
          return { intent, output: '', success: false as const };
        }
      }),
    );

    for (const r of settled) {
      if (r.success) {
        results[r.intent] = r.output;
      } else {
        failures++;
      }
    }
  }

  // Execute dependent intents sequentially (AC3)
  for (const intent of sequential) {
    try {
      const output = await runOrchestrator({
        intent,
        message,
        language,
        sessionContext,
      });
      results[intent] = output;
    } catch (err) {
      logger.warn('pipeline_multi_intent_failed', {
        intent,
        error: err instanceof Error ? err.message : String(err),
      });
      failures++;
    }
  }

  const total = parallel.length + sequential.length;
  return { results, allFailed: failures === total };
}

// ─── Main Pipeline (AC1, AC6) ─────────────────────────────────

export async function processMessage(
  input: PipelineInput,
): Promise<PipelineResult> {
  const start = Date.now();

  // Stage 1: Intent Classification
  const intent = await classifyIntent(input.message);

  logger.info('pipeline_intent_classified', {
    sessionId: input.sessionId,
    intent: intent.intent,
    subIntents: intent.subIntents,
    confidence: intent.confidence,
    language: intent.language,
  });

  const hasMultiIntent = intent.subIntents.length > 0;
  let personaOutput: string;
  let toolResults: Record<string, unknown> = {};

  if (hasMultiIntent) {
    // ── Multi-intent path (AC2, AC3, AC4) ──────────────────
    const allIntents = deduplicateIntents(intent.intent, intent.subIntents);

    const { results, allFailed } = await executeMultiIntent(
      allIntents,
      input.message,
      intent.language,
      input.sessionContext,
    );

    // AC5: All tools failed → fallback via Safety Agent
    if (allFailed) {
      logger.warn('pipeline_all_tools_failed', {
        sessionId: input.sessionId,
        intents: allIntents,
      });
      return {
        response: SAFE_FALLBACKS[intent.language],
        intent,
        safetyApproved: false,
        multiIntent: true,
        latencyMs: Date.now() - start,
      };
    }

    toolResults = results;

    // AC4: Persona generates UNIFIED response from all partial results
    personaOutput = await generateResponse({
      toolResults: results,
      sessionContext: input.sessionContext,
      language: intent.language,
    });
  } else {
    // ── Single intent path ─────────────────────────────────
    try {
      personaOutput = await runOrchestrator({
        intent: intent.intent,
        message: input.message,
        language: intent.language,
        sessionContext: input.sessionContext,
      });
    } catch (err) {
      // AC5: Orchestrator failure → fallback
      logger.warn('pipeline_orchestrator_failed', {
        sessionId: input.sessionId,
        error: err instanceof Error ? err.message : String(err),
      });
      return {
        response: SAFE_FALLBACKS[intent.language],
        intent,
        safetyApproved: false,
        multiIntent: false,
        latencyMs: Date.now() - start,
      };
    }
  }

  // Stage 3: Safety Validation
  const safety = await validateResponse({
    personaOutput,
    toolResults,
    language: intent.language,
  });

  logger.info('pipeline_complete', {
    sessionId: input.sessionId,
    intent: intent.intent,
    multiIntent: hasMultiIntent,
    safetyApproved: safety.approved,
    latencyMs: Date.now() - start,
  });

  return {
    response: safety.response,
    intent,
    safetyApproved: safety.approved,
    multiIntent: hasMultiIntent,
    latencyMs: Date.now() - start,
  };
}
