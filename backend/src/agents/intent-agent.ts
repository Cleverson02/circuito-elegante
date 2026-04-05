import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Agent, run } from '@openai/agents';
import { MODELS, IntentOutput, type IntentOutput as IntentOutputType } from './types.js';
import { relevanceGuardrail, jailbreakGuardrail } from './guardrails.js';

const PROMPT_PATH = join(import.meta.dirname, '..', 'prompts', 'intent-agent.md');

let intentPrompt: string | null = null;

function getPrompt(): string {
  if (!intentPrompt) {
    intentPrompt = readFileSync(PROMPT_PATH, 'utf-8');
  }
  return intentPrompt;
}

export const intentAgent = new Agent({
  name: 'IntentClassifier',
  model: MODELS.nano,
  instructions: getPrompt(),
  outputType: IntentOutput,
  inputGuardrails: [relevanceGuardrail, jailbreakGuardrail],
});

export async function classifyIntent(message: string): Promise<IntentOutputType> {
  const result = await run(intentAgent, message);
  return result.finalOutput as IntentOutputType;
}
