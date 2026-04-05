import { z } from 'zod';
import { tool } from '@openai/agents';

export const HandoverReason = z.enum([
  'hotel_manual',
  'guest_requested',
  'low_confidence',
  'api_failure',
  'sensitive_topic',
]);
export type HandoverReason = z.infer<typeof HandoverReason>;

export const TransferParams = z.object({
  reason: HandoverReason.describe('Reason for transferring to human agent'),
  guestName: z.string().nullable().describe('Guest name if known'),
  guestPhone: z.string().nullable().describe('Guest phone number'),
  hotelFocus: z.string().nullable().describe('Hotel the guest was asking about'),
  conversationSummary: z.string().describe('Brief summary of the conversation so far'),
  lastIntent: z.string().nullable().describe('Last classified intent'),
  preferences: z.record(z.string(), z.unknown()).nullable().describe('Guest preferences collected during conversation'),
});

export type TransferParams = z.infer<typeof TransferParams>;

export interface HandoverSummary {
  guest: {
    name: string | null;
    phone: string | null;
  };
  conversation: {
    summary: string;
    lastIntent: string | null;
  };
  hotelFocus: string | null;
  reason: HandoverReason;
  preferences: Record<string, unknown>;
  handover: true;
  chatwootReady: true;
  timestamp: string;
}

export function buildHandoverSummary(params: TransferParams): HandoverSummary {
  return {
    guest: {
      name: params.guestName ?? null,
      phone: params.guestPhone ?? null,
    },
    conversation: {
      summary: params.conversationSummary,
      lastIntent: params.lastIntent ?? null,
    },
    hotelFocus: params.hotelFocus ?? null,
    reason: params.reason,
    preferences: (params.preferences as Record<string, unknown>) ?? {},
    handover: true,
    chatwootReady: true,
    timestamp: new Date().toISOString(),
  };
}

export const transferToHumanTool = tool({
  name: 'transfer_to_human',
  description: 'Transfer conversation to human agent. Compiles session context into structured summary. Use when: hotel has no API, guest requests human, confidence is low, API failure, or sensitive topic.',
  parameters: TransferParams,
  execute: async (params) => {
    const summary = buildHandoverSummary(params);
    return {
      transferred: true,
      summary,
      message: `Transferência solicitada: ${params.reason}. Contexto compilado para atendente humano.`,
    };
  },
});
