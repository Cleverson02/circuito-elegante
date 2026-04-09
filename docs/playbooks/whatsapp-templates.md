# WhatsApp Template Messages — Playbook

## Templates Registrados

### 1. `follow_up_quote_expiring`
- **Evento:** Cotacao proxima de expirar
- **Variaveis:** `guest_name`, `hotel_name`, `expiry_time`
- **Body:** "Ola {{guest_name}}! Sua cotacao para o {{hotel_name}} expira {{expiry_time}}. Gostaria de confirmar a reserva? Estou aqui para ajudar!"

### 2. `reservation_confirmed`
- **Evento:** Reserva confirmada
- **Variaveis:** `guest_name`, `hotel_name`, `check_in_date`, `check_out_date`
- **Body:** "Ola {{guest_name}}! Sua reserva no {{hotel_name}} esta confirmada. Check-in: {{check_in_date}}, Check-out: {{check_out_date}}. Qualquer duvida, estou a disposicao!"

### 3. `out_of_hours_followup`
- **Evento:** Follow-up apos mensagem fora de expediente
- **Variaveis:** `guest_name`
- **Body:** "Bom dia {{guest_name}}! Recebemos sua mensagem ontem e estamos prontos para ajudar. Como posso auxiliar com sua viagem?"

### 4. `reengagement`
- **Evento:** Reengajamento pos-atendimento
- **Variaveis:** `guest_name`, `hotel_name`
- **Body:** "Ola {{guest_name}}! Notei que voce demonstrou interesse no {{hotel_name}}. Posso ajudar com mais informacoes ou uma cotacao atualizada?"

## Processo de Submissao ao Meta

1. Acesse o **WhatsApp Business Manager** em business.facebook.com
2. Navegue para **WhatsApp > Message Templates**
3. Clique **Create Template**
4. Preencha: Category = `UTILITY`, Language = `Portuguese (BR)`
5. Cole o body do template usando variaveis posicionais `{{1}}`, `{{2}}`, etc.
6. Submeta para aprovacao (normalmente 24-48h)
7. Apos aprovado, o nome do template deve corresponder EXATAMENTE ao `name` no registro

## Como Testar Localmente

```typescript
import { renderTemplate, sendTemplateMessage } from './integrations/whatsapp-templates';

// Testar rendering
const rendered = renderTemplate('follow_up_quote_expiring', {
  guest_name: 'Maria',
  hotel_name: 'Hotel Fasano Rio',
  expiry_time: '18:00 de hoje',
});
console.log(rendered.body);

// Testar envio (requer Evolution API rodando)
const result = await sendTemplateMessage(evolutionClient, '+5521999999999', 'follow_up_quote_expiring', {
  guest_name: 'Maria',
  hotel_name: 'Hotel Fasano Rio',
  expiry_time: '18:00 de hoje',
});
```

## Como Adicionar Novos Templates

1. Crie arquivo em `backend/src/integrations/templates/novo-template.ts`
2. Exporte uma `TemplateDefinition` com `name`, `language`, `variables`, `body`
3. Importe e adicione ao `templateRegistry` em `templates/index.ts`
4. Submeta o template ao Meta seguindo o processo acima
5. Adicione testes em `tests/unit/whatsapp-templates.test.ts`
