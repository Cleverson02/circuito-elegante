# Rituaali Spa — WhatsApp Follow-up (Manual Contact)

**Date:** 2026-04-03  
**Hotel:** Rituaali Clínica & Spa  
**Contact:** WhatsApp (24) 98815-3728 | Phone (24) 2107-3883 | Email [email protected]  
**Status:** 8 campos null — requer resposta do hotel

---

## Perguntas a Enviar via WhatsApp

Copie e envie as perguntas abaixo para obter as respostas que faltam:

### Mensagem Sugerida:

```
Olá! Estou pesquisando informações sobre o Rituaali para uma plataforma de reservas. 
Poderiam responder rapidamente a 8 perguntas sobre políticas?

1. Qual o horário de check-in e check-out?
2. Qual a política de cancelamento?
3. Vocês aceitam crianças? A partir de qual idade?
4. O hotel aceita pets? Tem restrição de porte ou taxa?
5. Vocês têm estacionamento? É gratuito?
6. O Wi-Fi é gratuito? A conexão é boa?
7. Qual a política para fumantes?
8. Tem idade mínima para hospedagem?

Obrigado!
```

---

## Mapeamento de Campos

| Campo | Pergunta | Resposta |
|-------|----------|----------|
| `check_in_out` | #1 | _pendente_ |
| `cancellation_policy` | #2 | _pendente_ |
| `children_policy` | #3 | _pendente_ |
| `pet_policy` | #4 | _pendente_ |
| `parking` | #5 | _pendente_ |
| `wifi` | #6 | _pendente_ |
| `smoking_policy` | #7 | _pendente_ |
| `min_age_solo` | #8 | _pendente_ |

---

## Próximos Passos

1. **Enviar mensagem via WhatsApp** (24) 98815-3728
2. **Aguardar resposta** (typically 24-48h)
3. **Atualizar** `data/enrichment/rituaali-spa.json` com `chatbot_manual_responses`
4. **Re-rodar validação** com @data-extractor
5. **Marcar como COMPLETE** quando todos os 58 campos estiverem preenchidos

---

## Current Status

- **Completeness:** 43/58 (74%)
- **Quality Score:** 0.88/1.0 ✅
- **Pending:** 8 fields (policy fields)
- **Status:** PARTIAL — Awaiting manual contact responses
