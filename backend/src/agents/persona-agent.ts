import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Agent, run } from '@openai/agents';
import { MODELS } from './types.js';

const PROMPT_PATH = join(import.meta.dirname, '..', 'prompts', 'persona-system.md');

let personaPrompt: string | null = null;

function getPrompt(): string {
  if (!personaPrompt) {
    personaPrompt = readFileSync(PROMPT_PATH, 'utf-8');
  }
  return personaPrompt;
}

export interface GenerateResponseInput {
  toolResults: Record<string, unknown>;
  sessionContext?: {
    guestName?: string;
    hotelFocus?: string;
    conversationHistory?: string[];
  };
  language: 'pt' | 'en' | 'es';
}

export const personaAgent = new Agent({
  name: 'StellaPersona',
  model: MODELS.pro,
  instructions: getPrompt(),
});

export async function generateResponse(input: GenerateResponseInput): Promise<string> {
  const contextParts: string[] = [];

  if (input.sessionContext?.guestName) {
    contextParts.push(`Guest name: ${input.sessionContext.guestName}`);
  }
  if (input.sessionContext?.hotelFocus) {
    contextParts.push(`Hotel of interest: ${input.sessionContext.hotelFocus}`);
  }
  if (input.language) {
    contextParts.push(`Respond in: ${input.language === 'pt' ? 'Portuguese' : input.language === 'en' ? 'English' : 'Spanish'}`);
  }

  contextParts.push(`Tool results:\n${JSON.stringify(input.toolResults, null, 2)}`);

  const message = contextParts.join('\n\n');
  const result = await run(personaAgent, message);

  return result.finalOutput as string;
}
