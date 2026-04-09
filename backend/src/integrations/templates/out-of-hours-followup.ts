import type { TemplateDefinition } from '../whatsapp-templates.js';

export const outOfHoursFollowup: TemplateDefinition = {
  name: 'out_of_hours_followup',
  language: 'pt_BR',
  variables: ['guest_name'],
  body: 'Bom dia {{guest_name}}! Recebemos sua mensagem ontem e estamos prontos para ajudar. Como posso auxiliar com sua viagem?',
};
