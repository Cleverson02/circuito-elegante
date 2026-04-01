# Asaas Payment Gateway Squad

Squad especialista em integração com Asaas Payment Gateway. Genérico e reutilizável para qualquer projeto.

## Agents

| Agent | Tier | Foco |
|-------|------|------|
| `asaas-chief` | 0 | Orquestrador, router, teacher |
| `payment-architect` | 1 | Pagamentos, checkout transparente, PIX QR, tokenização |
| `webhook-guardian` | 1 | Webhooks, status transitions, idempotência |
| `split-specialist` | 2 | Splits, subcontas, transferências, comissões |

## Ativação

```
/asaas-payment:agents:asaas-chief
```

## Comandos Principais

- `*audit-payment {path}` — Auditar código de pagamento
- `*design-checkout` — Desenhar checkout transparente
- `*diagnose-bug` — Diagnosticar bug de pagamento
- `*validate-payload {type}` — Validar payload
- `*webhook-guide` — Guia de webhooks
- `*pix-guide` — Guia PIX QR code
- `*refund-guide` — Guia de estornos
- `*sandbox-guide` — Guia de testes sandbox

## Knowledge Base

- `data/asaas-api-reference.md` — Referência completa da API Asaas
- `data/production-lessons.md` — 18 lições de produção real (PlayScout)
- `checklists/payment-integration-checklist.md` — Checklist de integração

## Fontes

- [Asaas API Reference](https://docs.asaas.com/reference/criar-nova-cobranca)
- [Asaas Webhook Events](https://docs.asaas.com/docs/payment-events)
- [PIX QR Code](https://docs.asaas.com/docs/payments-via-pix-or-dynamic-qr-code)
- [Credit Card](https://docs.asaas.com/docs/payments-via-credit-card)
- [Subaccounts](https://docs.asaas.com/docs/creating-subaccounts)
- [Transfers](https://docs.asaas.com/docs/transfer-to-asaas-account)
