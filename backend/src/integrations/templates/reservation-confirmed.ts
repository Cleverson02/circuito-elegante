import type { TemplateDefinition } from '../whatsapp-templates.js';

export const reservationConfirmed: TemplateDefinition = {
  name: 'reservation_confirmed',
  language: 'pt_BR',
  variables: ['guest_name', 'hotel_name', 'check_in_date', 'check_out_date'],
  body: 'Ola {{guest_name}}! Sua reserva no {{hotel_name}} esta confirmada. Check-in: {{check_in_date}}, Check-out: {{check_out_date}}. Qualquer duvida, estou a disposicao!',
};
