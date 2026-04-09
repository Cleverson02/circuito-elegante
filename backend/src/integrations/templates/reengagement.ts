import type { TemplateDefinition } from '../whatsapp-templates.js';

export const reengagement: TemplateDefinition = {
  name: 'reengagement',
  language: 'pt_BR',
  variables: ['guest_name', 'hotel_name'],
  body: 'Ola {{guest_name}}! Notei que voce demonstrou interesse no {{hotel_name}}. Posso ajudar com mais informacoes ou uma cotacao atualizada?',
};
