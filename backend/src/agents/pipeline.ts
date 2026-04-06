/**
 * Pipeline Integration & Multi-Intent — Story 2.6 (FR8, FR15).
 * Session Context Persistence — Story 2.7 (FR7).
 *
 * Entry point: processMessage() runs the full pipeline:
 * Intent → Orchestrator (2.11) → Persona → Safety → Response.
 *
 * Multi-intent decomposition with parallel tool execution (Promise.all)
 * and unified response generation by the Persona Agent.
 *
 * Session context (hotelFocus, conversationHistory, preferences)
 * is loaded before processing and persisted after each interaction.
 * Hotel focus is extracted from structured tool outputs via RunResult.newItems.
 */

import { classifyIntent } from './intent-agent.js';
import { runOrchestrator } from './orchestrator.js';
import { generateResponse } from './persona-agent.js';
import { validateResponse, SAFE_FALLBACKS } from './safety-agent.js';
import type { IntentType, IntentOutput, Language } from './types.js';
import { logger } from '../middleware/logging.js';
import {
  getSessionContext,
  updateSessionContext,
  addConversationMessage,
  type SessionContext,
} from '../state/session-manager.js';
import { saveSessionSnapshot } from '../state/session-snapshot.js';

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
  hotelFocus?: string | null;
}

// ─── Hotel Focus Extraction (Story 2.7, AC2) ─────────────────

interface HotelResult {
  id?: string;
  name?: string;
  slug?: string;
}

/**
 * Extracts hotel focus from structured tool outputs.
 * Receives actual tool return values collected from RunResult.newItems
 * (not the orchestrator text output).
 */
export function extractHotelFocus(toolOutputs: Record<string, unknown>): string | null {
  for (const value of Object.values(toolOutputs)) {
    if (value && typeof value === 'object') {
      const obj = value as Record<string, unknown>;
      // From search_hotels: { hotels: [...] }
      if (Array.isArray(obj['hotels']) && obj['hotels'].length > 0) {
        const first = obj['hotels'][0] as HotelResult;
        if (first?.name) return first.name;
      }
      // From query_knowledge_base with hotelName match
      if (obj['found'] === true && Array.isArray(obj['results']) && obj['results'].length > 0) {
        const firstResult = obj['results'][0] as Record<string, unknown>;
        if (firstResult?.['hotelName'] && typeof firstResult['hotelName'] === 'string') {
          return firstResult['hotelName'];
        }
      }
    }
  }
  return null;
}

// ─── Preference Extraction (Story 2.7, AC5) ──────────────────

const PREFERENCE_PATTERNS: Record<string, RegExp> = {
  petFriendly: /\bpet[- ]?friendly\b|\baceita\s+(?:pet|animal|cachorro|gato)\b/i,
  poolHeated: /\bpiscina\s+(?:aquecida|coberta)\b|\bheated\s+pool\b/i,
  region: /\b(?:serra\s+ga[uú]cha|litoral|serra\s+catarinense|campos\s+do\s+jord[aã]o)\b/i,
  bradescoCoupon: /\bbradesco\b|\bcupom\b|\bcoupon\b/i,
};

export function extractPreferences(message: string): Record<string, unknown> {
  const prefs: Record<string, unknown> = {};
  for (const [key, pattern] of Object.entries(PREFERENCE_PATTERNS)) {
    const match = message.match(pattern);
    if (match) {
      prefs[key] = key === 'region' ? match[0] : true;
    }
  }
  return prefs;
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

interface MultiIntentResult {
  results: Record<string, string>;
  toolOutputs: Record<string, unknown>;
  allFailed: boolean;
}

async function executeMultiIntent(
  intents: IntentType[],
  message: string,
  language: Language,
  sessionContext?: PipelineInput['sessionContext'],
): Promise<MultiIntentResult> {
  const { parallel, sequential } = partitionIntents(intents);
  const results: Record<string, string> = {};
  const toolOutputs: Record<string, unknown> = {};
  let failures = 0;

  // Execute independent intents in parallel with Promise.all (AC2)
  if (parallel.length > 0) {
    const settled = await Promise.all(
      parallel.map(async (intent) => {
        try {
          const orchResult = await runOrchestrator({
            intent,
            message,
            language,
            sessionContext,
          });
          return { intent, orchResult, success: true as const };
        } catch (err) {
          logger.warn('pipeline_multi_intent_failed', {
            intent,
            error: err instanceof Error ? err.message : String(err),
          });
          return { intent, orchResult: null, success: false as const };
        }
      }),
    );

    for (const r of settled) {
      if (r.success && r.orchResult) {
        results[r.intent] = r.orchResult.output;
        Object.assign(toolOutputs, r.orchResult.toolOutputs);
      } else {
        failures++;
      }
    }
  }

  // Execute dependent intents sequentially (AC3)
  for (const intent of sequential) {
    try {
      const orchResult = await runOrchestrator({
        intent,
        message,
        language,
        sessionContext,
      });
      results[intent] = orchResult.output;
      Object.assign(toolOutputs, orchResult.toolOutputs);
    } catch (err) {
      logger.warn('pipeline_multi_intent_failed', {
        intent,
        error: err instanceof Error ? err.message : String(err),
      });
      failures++;
    }
  }

  const total = parallel.length + sequential.length;
  return { results, toolOutputs, allFailed: failures === total };
}

// ─── Main Pipeline (AC1, AC6) ─────────────────────────────────

export async function processMessage(
  input: PipelineInput,
): Promise<PipelineResult> {
  const start = Date.now();

  // ── Story 2.7: Load session context ──────────────────────
  const sessionCtx = await getSessionContext(input.sessionId);

  // Merge persisted hotelFocus into sessionContext if not provided (AC3)
  const effectiveContext: PipelineInput['sessionContext'] = {
    ...input.sessionContext,
  };
  if (!effectiveContext.hotelFocus && sessionCtx?.hotelFocus) {
    effectiveContext.hotelFocus = sessionCtx.hotelFocus;
  }

  // Add user message to conversation history (AC4)
  await addConversationMessage(input.sessionId, 'user', input.message);

  // Extract preferences from user message (AC5)
  const newPrefs = extractPreferences(input.message);

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
  let structuredToolOutputs: Record<string, unknown> = {};

  if (hasMultiIntent) {
    // ── Multi-intent path (AC2, AC3, AC4) ──────────────────
    const allIntents = deduplicateIntents(intent.intent, intent.subIntents);

    const { results, toolOutputs, allFailed } = await executeMultiIntent(
      allIntents,
      input.message,
      intent.language,
      effectiveContext,
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

    structuredToolOutputs = toolOutputs;

    // AC4: Persona generates UNIFIED response from all partial results
    personaOutput = await generateResponse({
      toolResults: results,
      sessionContext: effectiveContext,
      language: intent.language,
    });
  } else {
    // ── Single intent path ─────────────────────────────────
    try {
      const orchResult = await runOrchestrator({
        intent: intent.intent,
        message: input.message,
        language: intent.language,
        sessionContext: effectiveContext,
      });
      personaOutput = orchResult.output;
      structuredToolOutputs = orchResult.toolOutputs;
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
    toolResults: structuredToolOutputs,
    language: intent.language,
  });

  // ── Story 2.7: Persist context after processing ──────────
  const detectedHotel = extractHotelFocus(structuredToolOutputs);
  const contextUpdates: Partial<Pick<SessionContext, 'hotelFocus' | 'preferences'>> = {};

  if (detectedHotel) {
    contextUpdates.hotelFocus = detectedHotel;
  }
  if (Object.keys(newPrefs).length > 0) {
    contextUpdates.preferences = newPrefs;
  }

  if (Object.keys(contextUpdates).length > 0) {
    await updateSessionContext(input.sessionId, contextUpdates);
  }

  // Add assistant response to conversation history (F2 fix: reuse return value)
  const finalCtx = await addConversationMessage(input.sessionId, 'assistant', safety.response);

  // Save snapshot to conversations table (async, non-blocking — AC6)
  saveSessionSnapshot(input.sessionId, finalCtx, input.sessionContext?.guestName).catch(
    (err) => logger.warn('session_snapshot_failed', {
      sessionId: input.sessionId,
      error: err instanceof Error ? err.message : String(err),
    }),
  );

  logger.info('pipeline_complete', {
    sessionId: input.sessionId,
    intent: intent.intent,
    multiIntent: hasMultiIntent,
    safetyApproved: safety.approved,
    hotelFocus: detectedHotel ?? effectiveContext.hotelFocus ?? null,
    latencyMs: Date.now() - start,
  });

  return {
    response: safety.response,
    intent,
    safetyApproved: safety.approved,
    multiIntent: hasMultiIntent,
    latencyMs: Date.now() - start,
    hotelFocus: detectedHotel ?? effectiveContext.hotelFocus ?? null,
  };
}
