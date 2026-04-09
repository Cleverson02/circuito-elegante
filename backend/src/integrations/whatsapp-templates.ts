/**
 * WhatsApp Template Messages — Renderer & Orchestrator.
 *
 * Story 4.9 — WhatsApp Template Messages (FR37)
 *
 * Renders pre-approved WhatsApp templates with variable substitution,
 * sends via Evolution API, and handles fallback when templates are
 * not yet approved by Meta.
 *
 * [Source: PRD FR37, architecture.md]
 */

import type { EvolutionResponse } from './evolution/types.js';
import type { EvolutionClient } from './evolution/client.js';
import { templateRegistry } from './templates/index.js';
import { logger } from '../middleware/logging.js';

// ─── Types (AC9) ───────────────────────────────────────────────

export interface TemplateDefinition {
  name: string;
  language: string;
  variables: string[];
  body: string;
}

export interface RenderedTemplate {
  name: string;
  language: string;
  body: string;
  parameters: Array<{ type: 'text'; text: string }>;
}

export type TemplateSendResult =
  | { sent: true; response: EvolutionResponse }
  | { sent: false; reason: string };

// ─── Error Classes (AC9) ───────────────────────────────────────

export class TemplateNotFoundError extends Error {
  public readonly templateName: string;

  constructor(templateName: string) {
    super(`Template '${templateName}' not found in registry`);
    this.name = 'TemplateNotFoundError';
    this.templateName = templateName;
  }
}

export class MissingTemplateVariableError extends Error {
  public readonly templateName: string;
  public readonly missingVariables: string[];

  constructor(templateName: string, missingVariables: string[]) {
    super(`Template '${templateName}' missing variables: ${missingVariables.join(', ')}`);
    this.name = 'MissingTemplateVariableError';
    this.templateName = templateName;
    this.missingVariables = missingVariables;
  }
}

// ─── Template Renderer (AC2, AC3) ──────────────────────────────

/**
 * Render a template by substituting variables into the body.
 * Throws TemplateNotFoundError if template doesn't exist.
 * Throws MissingTemplateVariableError if required variables are missing.
 * Extra variables are silently ignored (AC3).
 */
export function renderTemplate(
  templateName: string,
  variables: Record<string, string>,
): RenderedTemplate {
  const definition = templateRegistry.get(templateName);
  if (!definition) {
    throw new TemplateNotFoundError(templateName);
  }

  // Validate required variables
  const missing = definition.variables.filter((v) => !(v in variables));
  if (missing.length > 0) {
    throw new MissingTemplateVariableError(templateName, missing);
  }

  // Substitute {{variable}} in body
  let body = definition.body;
  for (const varName of definition.variables) {
    body = body.replace(new RegExp(`\\{\\{${varName}\\}\\}`, 'g'), variables[varName]!);
  }

  // Build positional parameters (order matches definition.variables)
  const parameters = definition.variables.map((v) => ({
    type: 'text' as const,
    text: variables[v]!,
  }));

  return {
    name: definition.name,
    language: definition.language,
    body,
    parameters,
  };
}

// ─── Orchestrator (AC6, AC8) ───────────────────────────────────

/**
 * Render and send a WhatsApp template message.
 * Handles fallback when template is not approved (error 470).
 */
export async function sendTemplateMessage(
  evolutionClient: EvolutionClient,
  phone: string,
  templateName: string,
  variables: Record<string, string>,
): Promise<TemplateSendResult> {
  try {
    const rendered = renderTemplate(templateName, variables);

    const response = await evolutionClient.sendTemplate(
      phone,
      rendered.name,
      rendered.language,
      rendered.parameters,
    );

    logger.info('template_sent', {
      event: 'template_sent',
      templateName,
      phone,
      variableCount: rendered.parameters.length,
    });

    return { sent: true, response };
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);

    logger.warn('template_skipped', {
      event: 'template_skipped',
      templateName,
      phone,
      reason,
    });

    return { sent: false, reason };
  }
}
