/**
 * Business Hours Guard & Out-of-Hours Lead Registration.
 *
 * Story 4.7 — Fallback de Fora de Expediente
 *
 * Intercepts messages outside business hours (08:00-22:00 BRT) and
 * provides an elegant fallback response + registers a lead for follow-up.
 *
 * [Source: PRD §Fora de Expediente]
 */

import { writeFile, readFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { logger } from '../middleware/logging.js';

// ─── Configuration (AC2) ───────────────────────────────────────

export const BUSINESS_HOURS_START = 8;
export const BUSINESS_HOURS_END = 22;
export const BUSINESS_TIMEZONE = 'America/Sao_Paulo';

// ─── Fallback Messages (AC4, AC5) ──────────────────────────────

export const OUT_OF_HOURS_MESSAGE_WHATSAPP =
  'Boa noite! Obrigada por entrar em contato com o Circuito Elegante. ' +
  'Nosso atendimento personalizado funciona das 8h às 22h. ' +
  'Registrei sua mensagem e retornaremos no primeiro horário útil. ' +
  'Até breve! ✨';

export const OUT_OF_HOURS_MESSAGE_WEBSITE =
  'Boa noite! Obrigada por entrar em contato com o Circuito Elegante. ' +
  'Nosso atendimento personalizado funciona das 8h as 22h. ' +
  'Registrei sua mensagem e retornaremos no primeiro horario util. ' +
  'Ate breve!';

// ─── Types ─────────────────────────────────────────────────────

export interface OutOfHoursLead {
  leadId: string;
  phone: string;
  message: string;
  channel: 'whatsapp' | 'website';
  sessionId: string;
  receivedAt: string;
  scheduledFollowUp: string;
  status: 'pending';
}

// ─── Business Hours Check (AC1, AC9) ───────────────────────────

/**
 * Check if current time is within business hours.
 * Default: 08:00-22:00 in America/Sao_Paulo.
 * Fail-open: returns true on any error (AC9).
 */
export function isWithinBusinessHours(timezone?: string): boolean {
  try {
    const tz = timezone ?? BUSINESS_TIMEZONE;
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      hour: 'numeric',
      hour12: false,
    });
    const hour = Number(formatter.format(now));

    return hour >= BUSINESS_HOURS_START && hour < BUSINESS_HOURS_END;
  } catch (err) {
    logger.error('business_hours_check_failed', {
      event: 'business_hours_check_failed',
      error: err instanceof Error ? err.message : String(err),
    });
    return true; // Fail-open: don't block guest
  }
}

// ─── Scheduled Follow-Up Calculation (AC7) ─────────────────────

/**
 * Calculate next business day at 08:00 BRT.
 * Skips Saturday (6) and Sunday (0).
 */
export function calculateNextFollowUp(): string {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: BUSINESS_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  // Get tomorrow in BRT
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  // Find next weekday
  let candidate = tomorrow;
  for (let i = 0; i < 7; i++) {
    const dayStr = formatter.format(candidate);
    const dayOfWeek = new Date(dayStr + 'T12:00:00').getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      // Weekday found — return 08:00 BRT
      return `${dayStr}T08:00:00-03:00`;
    }
    candidate = new Date(candidate.getTime() + 24 * 60 * 60 * 1000);
  }

  // Fallback (should never happen)
  const fallbackStr = formatter.format(tomorrow);
  return `${fallbackStr}T08:00:00-03:00`;
}

// ─── Lead Registration (AC6, AC7, AC8) ─────────────────────────

const LEADS_DIR = join(process.cwd(), 'data');
const LEADS_FILE = join(LEADS_DIR, 'out-of-hours-leads.json');

/**
 * Register an out-of-hours lead for follow-up.
 * Appends to local JSON file (MVP storage).
 */
export async function registerOutOfHoursLead(
  phone: string,
  message: string,
  channel: 'whatsapp' | 'website',
  sessionId: string,
): Promise<void> {
  const lead: OutOfHoursLead = {
    leadId: randomUUID(),
    phone,
    message,
    channel,
    sessionId,
    receivedAt: new Date().toISOString(),
    scheduledFollowUp: calculateNextFollowUp(),
    status: 'pending',
  };

  try {
    await mkdir(LEADS_DIR, { recursive: true });

    let leads: OutOfHoursLead[] = [];
    try {
      const existing = await readFile(LEADS_FILE, 'utf-8');
      leads = JSON.parse(existing);
    } catch {
      // File doesn't exist yet — start fresh
    }

    leads.push(lead);
    await writeFile(LEADS_FILE, JSON.stringify(leads, null, 2), 'utf-8');

    logger.info('out_of_hours_lead_registered', {
      event: 'out_of_hours_lead_registered',
      phone,
      leadId: lead.leadId,
      channel,
      scheduledFollowUp: lead.scheduledFollowUp,
    });
  } catch (err) {
    logger.error('out_of_hours_lead_registration_failed', {
      event: 'out_of_hours_lead_registration_failed',
      phone,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
