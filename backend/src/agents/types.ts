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
  // Story 1.9: Granular intents
  'DETAIL_QUERY',
  'COMPARISON',
  // Backwards-compatible aliases (mapped internally)
  'OPEN_QUESTION',
  'SEARCH',
  'BOOKING',
]);
export type IntentType = z.infer<typeof IntentType>;

/** Map new intent names to legacy ones for backwards compatibility */
export const INTENT_ALIASES: Record<string, IntentType> = {
  OPEN_QUESTION: 'RAG',
  SEARCH: 'API_SEARCH',
  BOOKING: 'API_BOOKING',
};

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

// --- Safety Agent Types ---

export const SafetyCategory = z.enum([
  'persona_break',
  'hallucination',
  'inappropriate_tone',
  'security_concern',
  'language_mismatch',
]);
export type SafetyCategory = z.infer<typeof SafetyCategory>;

export const SafetyOutput = z.object({
  approved: z.boolean(),
  category: SafetyCategory.optional(),
  explanation: z.string().optional(),
  safeResponse: z.string().optional(),
});
export type SafetyOutput = z.infer<typeof SafetyOutput>;

// --- Model Configuration ---

export const MODELS = {
  nano: 'gpt-4o-mini',     // Intent + Guardrails + Safety (lightweight)
  turbo: 'gpt-4o',          // Orchestrator (balanced)
  pro: 'gpt-4o',            // Persona (premium prose) — upgrade to gpt-5-pro when available
} as const;

export type ModelTier = keyof typeof MODELS;
