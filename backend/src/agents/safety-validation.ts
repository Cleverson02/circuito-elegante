/**
 * Safety validation logic — pure, testable module (no import.meta).
 *
 * Story 2.9 — Safety & Validation Agent (FR14).
 *
 * Separated from safety-agent.ts so tests can import this module
 * without triggering import.meta.dirname (incompatible with ts-jest CJS).
 */

import * as Sentry from '@sentry/node';
import { logger } from '../middleware/logging.js';
import { SafetyOutput, type SafetyCategory } from './types.js';

// ─── DI for Runner ─────────────────────────────────────────────

export interface SafetyRunnerFn {
  (message: string): Promise<string>;
}

let runnerFn: SafetyRunnerFn | null = null;

export function configureSafetyRunner(fn: SafetyRunnerFn): void {
  runnerFn = fn;
}

function getRunner(): SafetyRunnerFn {
  if (!runnerFn) {
    throw new Error(
      'Safety runner not configured. Call configureSafetyRunner() at app startup.',
    );
  }
  return runnerFn;
}

// ─── Types ─────────────────────────────────────────────────────

export interface SafetyValidationInput {
  personaOutput: string;
  toolResults: Record<string, unknown>;
  language: 'pt' | 'en' | 'es';
}

export interface SafetyValidationResult {
  approved: boolean;
  response: string;
  rejection?: {
    category: SafetyCategory;
    explanation: string;
  };
}

// ─── Safe Fallback Responses ───────────────────────────────────

export const SAFE_FALLBACKS: Record<'pt' | 'en' | 'es', string> = {
  pt: 'Estou verificando as informações para garantir a melhor experiência para você. Um momento, por favor.',
  en: "I'm verifying the information to ensure the best experience for you. One moment, please.",
  es: 'Estoy verificando la información para garantizar la mejor experiencia para usted. Un momento, por favor.',
};

// ─── Validation Function ───────────────────────────────────────

export async function validateResponse(
  input: SafetyValidationInput,
): Promise<SafetyValidationResult> {
  const { personaOutput, toolResults, language } = input;
  const runner = getRunner();

  const contextMessage = [
    `## Response to Validate`,
    `Language requested: ${language}`,
    ``,
    `### Persona Agent Output`,
    personaOutput,
    ``,
    `### Tool Results (ground truth for factual cross-check)`,
    JSON.stringify(toolResults, null, 2),
  ].join('\n');

  let safetyOutput: SafetyOutput;

  try {
    const rawOutput = await runner(contextMessage);
    const parsed = JSON.parse(rawOutput) as unknown;
    safetyOutput = SafetyOutput.parse(parsed);
  } catch (err) {
    logger.warn('safety_agent_parse_failure', {
      error: err instanceof Error ? err.message : String(err),
      personaOutputLength: personaOutput.length,
    });
    return { approved: true, response: personaOutput };
  }

  if (safetyOutput.approved) {
    logger.info('safety_validation_approved', {
      language,
      personaOutputLength: personaOutput.length,
    });
    return { approved: true, response: personaOutput };
  }

  const category = safetyOutput.category ?? 'security_concern';
  const explanation = safetyOutput.explanation ?? 'No explanation provided';
  const safeResponse = safetyOutput.safeResponse ?? SAFE_FALLBACKS[language];

  logger.warn('safety_validation_rejected', {
    category,
    explanation,
    language,
    personaOutputLength: personaOutput.length,
  });

  Sentry.withScope((scope) => {
    scope.setTag('module', 'safety-agent');
    scope.setTag('category', category);
    scope.setTag('language', language);
    scope.setFingerprint(['safety-rejection', category]);
    Sentry.captureMessage(`Safety rejection: ${category}`, 'warning');
  });

  return {
    approved: false,
    response: safeResponse,
    rejection: { category, explanation },
  };
}
