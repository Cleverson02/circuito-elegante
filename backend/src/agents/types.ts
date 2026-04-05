import { z } from 'zod';

// --- Intent Types ---

export const IntentType = z.enum([
  'RAG',
  'API_SEARCH',
  'API_BOOKING',
  'CHAT',
  'MULTIMODAL',
  'HANDOVER',
  'STATUS',
]);
export type IntentType = z.infer<typeof IntentType>;

export const Language = z.enum(['pt', 'en', 'es']);
export type Language = z.infer<typeof Language>;

export const IntentOutput = z.object({
  intent: IntentType,
  confidence: z.number().min(0).max(1),
  subIntents: z.array(IntentType).default([]),
  language: Language,
  reasoning: z.string(),
});
export type IntentOutput = z.infer<typeof IntentOutput>;

// --- Guardrail Types ---

export const GuardrailOutput = z.object({
  isViolation: z.boolean(),
  category: z.string().optional(),
  explanation: z.string().optional(),
});
export type GuardrailOutput = z.infer<typeof GuardrailOutput>;

// --- Model Configuration ---

export const MODELS = {
  nano: 'gpt-4o-mini',     // Intent + Guardrails + Safety (lightweight)
  turbo: 'gpt-4o',          // Orchestrator (balanced)
  pro: 'gpt-4o',            // Persona (premium prose) — upgrade to gpt-5-pro when available
} as const;

export type ModelTier = keyof typeof MODELS;
