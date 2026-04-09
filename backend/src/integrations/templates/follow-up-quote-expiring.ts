import type { TemplateDefinition } from '../whatsapp-templates.js';

export const followUpQuoteExpiring: TemplateDefinition = {
  name: 'follow_up_quote_expiring',
  language: 'pt_BR',
  variables: ['guest_name', 'hotel_name', 'expiry_time'],
  body: 'Ola {{guest_name}}! Sua cotacao para o {{hotel_name}} expira {{expiry_time}}. Gostaria de confirmar a reserva? Estou aqui para ajudar!',
};
