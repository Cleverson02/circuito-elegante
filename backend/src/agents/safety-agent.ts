/**
 * Safety & Validation Agent — Story 2.9 (FR14).
 *
 * This module creates the Agent instance and wires it to the validation
 * logic in safety-validation.ts. Separated because import.meta.dirname
 * (needed for prompt file loading) is incompatible with ts-jest CJS.
 *
 * Production: import from this file (gets the real Agent + runner).
 * Tests: import from safety-validation.ts directly + configureSafetyRunner().
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Agent, run } from '@openai/agents';
import { MODELS } from './types.js';
import { configureSafetyRunner } from './safety-validation.js';

// Re-export validation API for consumers that want a single import
export {
  validateResponse,
  configureSafetyRunner,
  SAFE_FALLBACKS,
  type SafetyValidationInput,
  type SafetyValidationResult,
  type SafetyRunnerFn,
} from './safety-validation.js';

// ─── Prompt Loading ────────────────────────────────────────────

const PROMPT_PATH = join(import.meta.dirname, '..', 'prompts', 'safety-agent.md');

let safetyPrompt: string | null = null;

function getPrompt(): string {
  if (!safetyPrompt) {
    safetyPrompt = readFileSync(PROMPT_PATH, 'utf-8');
  }
  return safetyPrompt;
}

// ─── Agent Instance ────────────────────────────────────────────

export const safetyAgent = new Agent({
  name: 'StellaSafety',
  model: MODELS.nano,
  instructions: getPrompt(),
});

// ─── Wire Runner to Real Agent ─────────────────────────────────

configureSafetyRunner(async (message: string) => {
  const result = await run(safetyAgent, message);
  return result.finalOutput as string;
});
