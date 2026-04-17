import { z } from 'zod';
import { tool } from '@openai/agents';
import type { Logger } from 'winston';
import type { ElevareClient } from '../integrations/elevare/client.js';
import {
  getReservations,
  type ReservationStatusData,
} from '../integrations/elevare/reservations.js';

// ─── Tool Parameters ────────────────────────────────────────────

export const CheckReservationParams = z.object({
  identifier: z
    .string()
    .min(1)
    .describe(
      'Guest identifier to lookup reservation: confirmation code ' +
        '(e.g., "ABC123"), email (e.g., "guest@email.com"), or phone ' +
        '(e.g., "+5511999887766"). The tool auto-detects which one.',
    ),
});

export type CheckReservationParams = z.infer<typeof CheckReservationParams>;

// ─── Tool Response ──────────────────────────────────────────────

export type CheckReservationResponse =
  | {
      found: true;
      reservations: ReservationStatusData[];
      count: number;
    }
  | {
      found: false;
      error: boolean;
      suggestion: 'front_desk';
      message: string;
    };

// ─── Factory ────────────────────────────────────────────────────

/**
 * Execute logic extracted so tests can invoke it directly without the
 * runtime overhead of the FunctionTool wrapper.
 *
 * Auth is handled by the injected ElevareClient (x-client-id +
 * x-client-secret configured at boot).
 */
export async function executeCheckReservation(
  client: ElevareClient,
  logger: Logger,
  params: CheckReservationParams,
): Promise<CheckReservationResponse> {
  const result = await getReservations(client, logger, params.identifier);

  if (!result.found) {
    return {
      found: false,
      error: result.error ?? false,
      suggestion: 'front_desk',
      message: 'No reservations found for this identifier.',
    };
  }

  return {
    found: true,
    reservations: result.reservations,
    count: result.reservations.length,
  };
}

export function createCheckReservationTool(
  client: ElevareClient,
  logger: Logger,
): ReturnType<typeof tool> {
  return tool({
    name: 'check_reservation',
    description:
      'Check the status of an existing reservation. Guest can provide their ' +
      'confirmation code, email address, or phone number. Returns structured ' +
      'reservation data (hotel name, dates, status, room type) for the Persona ' +
      'Agent to format as a human-readable response in the session language. ' +
      'Use when the classified intent is STATUS.',
    parameters: CheckReservationParams,
    execute: async (params): Promise<CheckReservationResponse> =>
      executeCheckReservation(client, logger, params),
  });
}
