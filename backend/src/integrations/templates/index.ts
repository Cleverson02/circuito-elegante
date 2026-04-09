import type { TemplateDefinition } from '../whatsapp-templates.js';
import { followUpQuoteExpiring } from './follow-up-quote-expiring.js';
import { reservationConfirmed } from './reservation-confirmed.js';
import { outOfHoursFollowup } from './out-of-hours-followup.js';
import { reengagement } from './reengagement.js';

/** Registry of all WhatsApp template definitions, keyed by name. */
export const templateRegistry = new Map<string, TemplateDefinition>([
  [followUpQuoteExpiring.name, followUpQuoteExpiring],
  [reservationConfirmed.name, reservationConfirmed],
  [outOfHoursFollowup.name, outOfHoursFollowup],
  [reengagement.name, reengagement],
]);
