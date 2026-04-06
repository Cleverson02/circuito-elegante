# EPIC-3: Integração Elevare — O Fluxo de Ouro

| Campo | Valor |
|-------|-------|
| **Epic ID** | EPIC-3 |
| **Status** | Ready |
| **Prioridade** | P0-critical |
| **Owner** | @pm (Morgan) |
| **Criado em** | 2026-04-05 |
| **PRD Ref** | `docs/prd/PRD-Concierge-Digital-Stella.md` §Epic 3 (L982) |
| **Arch Ref** | `docs/architecture/architecture.md` §6.1 Elevare API |
| **Execution Plan** | `docs/stories/epics/EPIC-3-EXECUTION.yaml` |
| **Esforço Estimado** | 5-8 dias de desenvolvimento |
| **Target** | 2026-04-15 |

---

## Epic Goal

Implementar o pipeline completo de reservas Elevare — do `/search` ao `/quotations` — com curadoria inteligente de opções, mapeamento de estado oculto (correferência), webhook listener para eventos transacionais, e fallback elegante. Resultado: Stella consegue orquestrar o fluxo de reserva end-to-end sem intervenção humana.

---

## Epic Description

### Existing System Context

- **Pipeline Multi-Agente:** Intent Agent → Orchestrator → Persona Agent (EPIC-2 ✅)
- **Technology Stack:** TypeScript, Fastify, OpenAI Agents SDK, Supabase (PostgreSQL + pgvector), Redis, BullMQ
- **Integration Points:** Orchestrator tools (`search_hotels`, `generate_payment_link`) já definidos como stubs em EPIC-2; agora conectam à API Elevare real
- **Data Layer:** 92 hotéis (32 API Elevare + 60 manuais) em PostgreSQL (EPIC-1 ✅)

### Enhancement Details

**O que está sendo adicionado:**

O "Fluxo de Ouro" — a integração completa com a API Elevare que transforma Stella de um chatbot informativo em um agente de reservas funcional:

1. **ElevareClient** — Cliente TypeScript com auth, retry, circuit breaker
2. **Search** — Busca disponibilidade com requestId management e multi-search
3. **Customer + Quotation** — Registro de hóspede e geração de link de pagamento
4. **Curadoria** — Seleção inteligente de 3-4 opções representativas (econômica → premium)
5. **Correferência** — "Quero a segunda" resolve para offerId exato sem exposição técnica
6. **Upsell Elegante** — Menção sutil de upgrade sem pressão
7. **Webhooks** — Listener para quote_expiring, reservation_confirmed, payment_failed
8. **Fallback** — Recovery elegante quando API falha (nunca "Erro de conexão")
9. **Pós-Venda** — Consulta de status de reservas
10. **Integration Tests** — Validação E2E com Postman fixtures

**Como integra:** Os tools do Orchestrator (definidos em EPIC-2) passam a chamar o ElevareClient real. Redis mantém session state (requestId, offerIds). Webhooks alimentam auto-follow-up via Persona Agent.

**Success Criteria:**

- Fluxo completo: search → customer → quotation → payment link funcional
- Curadoria apresenta 3-4 opções representativas por consulta
- Correferência: "quero a segunda" resolve para offerId correto
- Webhooks Elevare processados e armazenados com idempotência
- Fallback elegante quando API falha (handover silencioso para Chatwoot)
- Zero exposição de IDs técnicos (requestId, offerId) ao hóspede

---

## FR Coverage

| FR | Requisito | Story |
|---|---|---|
| FR2 | Consulta Disponibilidade Elevare | 3.1 |
| FR3 | Geração Link Pagamento | 3.3 |
| FR4 | Consulta Status Reservas | 3.9 |
| FR16 | Curadoria de Disponibilidade | 3.4 |
| FR18 | Mapeamento Estado Oculto | 3.5 |
| FR19 | Upsell Elegante | 3.6 |
| FR20 | Fallback & Recovery Elegante | 3.8 |
| FR22 | Renderização Transacional Assets | 3.1 |
| FR23 | Global Search-to-Quotation Flow | 3.1, 3.2, 3.3 |
| FR24 | requestId State Isolation | 3.1 |
| FR25 | Webhook Listener & Auto-Follow-Up | 3.7 |
| FR29 | Regeneração Link Pagamento | 3.3 |
| FR30 | Extensão Validade Cotação | 3.3 |
| FR31 | Multi-Search Cidade/Região | 3.1 |

### NFR Impact

| NFR | Requisito | Meta |
|-----|-----------|------|
| NFR1 | Latência | < 10s para /search response |
| NFR2 | Acurácia | 100% preços e regras de cupom |

---

## Dependencies

### Blocked By (Resolved)

| Epic | Requisito | Status |
|------|-----------|--------|
| EPIC-1 | PostgreSQL + Redis (dados de hotéis, cache) | ✅ Done |
| EPIC-2 | Pipeline multi-agente funcional | ✅ Done (Wave 2) |

### Blocks

| Epic | Razão |
|------|-------|
| EPIC-4 | Multi-canal precisa de tools prontos |
| EPIC-5 | Handover precisa de webhooks prontos |

### External

- Elevare API credentials (API Key) — `X-Api-Key` header
- Postman collection salva em `tests/fixtures/`

---

## Waves & Stories

### Wave 1: Elevare Client Foundation (Sequential)

> Search → Customer → Quotation é sequencial (Golden Discovery #2)

| Story | Título | Executor | Quality Gate | QG Tools | Effort | Blocked By |
|-------|--------|----------|--------------|----------|--------|------------|
| 3.1 | ElevareClient — Search + requestId Management | @dev | @architect | `[api_contract, retry_logic, state_isolation]` | M (~4-8h) | — |
| 3.2 | ElevareClient — Customer Registration | @dev | @architect | `[api_contract, idempotency_check]` | S (~2h) | 3.1 |
| 3.3 | ElevareClient — Quotation (Link de Pagamento) | @dev | @architect | `[api_contract, payment_security, link_lifecycle]` | S (~2-4h) | 3.2 |

**Quality Gate Post-Wave 1:** Fluxo search → customer → quotation funciona com Elevare real.

---

### Wave 2: UX Intelligence (Parallel)

> Curadoria, correferência e upsell são features independentes sobre o client base

| Story | Título | Executor | Quality Gate | QG Tools | Effort | Blocked By |
|-------|--------|----------|--------------|----------|--------|------------|
| 3.4 | Motor de Curadoria (3-4 opções representativas) | @dev | @architect | `[algorithm_review, price_mix_validation]` | M (~4-8h) | 3.1 |
| 3.5 | Mapeamento de Estado Oculto (Correferência) | @dev | @architect | `[state_management, redis_ttl, ux_validation]` | M (~4-8h) | 3.1 |
| 3.6 | Upsell Elegante | @dev | @architect | `[persona_alignment, no_pressure_check]` | S (~2-4h) | 3.4 |

---

### Wave 3: Events & Recovery (Parallel)

> Webhooks, fallback e pós-venda são independentes

| Story | Título | Executor | Quality Gate | QG Tools | Effort | Blocked By |
|-------|--------|----------|--------------|----------|--------|------------|
| 3.7 | Webhook Listener & Auto-Follow-Up | @dev | @architect | `[webhook_security, idempotency, state_machine]` | M (~4-8h) | 3.3 |
| 3.8 | Fallback & Recovery Elegante | @dev | @architect | `[error_handling, i18n, chatwoot_integration]` | S (~2-4h) | — |
| 3.9 | Consulta de Status de Reservas (Pós-Venda) | @dev | @architect | `[tool_integration, persona_formatting]` | S (~2-4h) | — |

---

### Wave 4: Integration Tests

> Testes de integração validam tudo junto

| Story | Título | Executor | Quality Gate | QG Tools | Effort | Blocked By |
|-------|--------|----------|--------------|----------|--------|------------|
| 3.10 | Integration Tests (Postman Fixture) | @qa | @dev | `[e2e_coverage, fixture_quality, regression_check]` | M (~4-8h) | 3.7, 3.8, 3.9 |

**Quality Gate Post-Wave 4:** Integration tests 100% verde. QA gate PASS para iniciar Epic 4.

---

## Executor Assignment Summary

| Executor | Stories | Count |
|----------|---------|-------|
| @dev (Dex) | 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9 | 9 |
| @qa (Quinn) | 3.10 | 1 |

| Quality Gate | Stories | Count |
|--------------|---------|-------|
| @architect (Aria) | 3.1-3.9 | 9 |
| @dev (Dex) | 3.10 | 1 |

**Rule check:** executor != quality_gate em todas as stories ✅

---

## Elevare API Reference

| Método | Endpoint | Propósito | Story |
|--------|----------|-----------|-------|
| `GET` | `/search` | Busca disponibilidade → requestId + results com fotos | 3.1 |
| `GET` | `/multi-search` | Busca múltiplos hotéis por cidade/região | 3.1 |
| `POST` | `/customers` | Registra/atualiza hóspede | 3.2 |
| `POST` | `/quotations` | Gera link pagamento (requestId + offerId) | 3.3 |
| `PUT` | `/quotations/{id}/payment-link` | Regenera link expirado | 3.3 |
| `PUT` | `/quotations/{id}/extend` | Estende validade cotação | 3.3 |
| `POST` | `/webhooks` | Recebe eventos transacionais | 3.7 |

**Auth:** API Key via header `X-Api-Key`
**Base URL:** `https://api.elevare.com.br/v1` (configurável)

---

## Risk Mitigation

### Risk 1: Rate Limits Elevare (não documentados)

- **Probabilidade:** Média
- **Impacto:** Alto — busca pode falhar em pico
- **Mitigação:** Circuit breaker (5 falhas → open 60s) + retry exponential backoff (1s → 2s → 4s, max 3)
- **Rollback:** Fallback para dados cached em Redis (TTL 15min)

### Risk 2: Webhooks Fora de Ordem

- **Probabilidade:** Baixa
- **Impacto:** Médio — estado inconsistente
- **Mitigação:** State machine com idempotence check em Redis. Eventos duplicados descartados silenciosamente.
- **Rollback:** Reprocessamento manual via audit trail (`webhook_events` table)

### Risk 3: Latência API Elevare > 10s

- **Probabilidade:** Baixa
- **Impacto:** Alto — UX degradada
- **Mitigação:** Timeout 8s hard limit. Mensagem elegante: "Estou verificando as melhores opções para você..."
- **Rollback:** Handover silencioso para Chatwoot com contexto preservado

---

## Quality Assurance Strategy

### Pre-Commit (todas as stories)

- Lint + typecheck passing
- Unit tests cobrindo happy path + error cases
- Nenhum segredo hardcoded

### Pre-PR (stories API)

- API contract validation contra Postman collection
- Circuit breaker testado (mock API down)
- State isolation verificado (requestId não vaza entre sessões)

### Pre-Merge (Wave 4)

- Integration tests E2E 100% verde
- Correferência testada ("quero a segunda" → offerId correto)
- Webhook idempotência verificada
- Fallback testado com API indisponível

---

## Compatibility Requirements

- [x] Tools existentes do Orchestrator (EPIC-2) mantêm interface — ElevareClient é injetado internamente
- [x] Schema PostgreSQL (EPIC-1) não requer alterações — usa tabelas existentes
- [x] Redis session management compatível com estado existente
- [x] Persona Agent continua formatando respostas — recebe dados estruturados do Orchestrator

---

## Definition of Done

- [ ] Todas as 10 stories completadas com acceptance criteria atendidos
- [ ] Fluxo E2E: search → select → customer → quotation → payment link funcional
- [ ] Curadoria apresenta 3-4 opções com mix de preços
- [ ] Correferência resolve "quero a N-ésima" corretamente
- [ ] Webhooks processados com idempotência
- [ ] Fallback elegante testado
- [ ] Integration tests 100% verde
- [ ] QA gate: PASS
- [ ] Nenhuma regressão em funcionalidades EPIC-1 e EPIC-2

---

## Change Log

| Data | Descrição | Autor |
|------|-----------|-------|
| 2026-04-02 | EXECUTION.yaml criado (10 stories, 4 waves) | Morgan (PM) |
| 2026-04-05 | Epic formal criado a partir do EXECUTION.yaml | Morgan (PM) |

---

## SM Handoff

> **Para @sm (River):** Criar stories detalhadas para EPIC-3.

**Contexto:**
- Enhancement ao sistema existente rodando TypeScript/Fastify/OpenAI Agents SDK
- Integration points: Orchestrator tools (stubs) → ElevareClient (real API)
- Patterns existentes: seguir estrutura de `src/tools/` e `src/integrations/` (EPIC-2)
- Compatibilidade crítica: tools do Orchestrator mantêm interface pública
- Cada story deve verificar que funcionalidades EPIC-1/EPIC-2 permanecem intactas

**Ordem de criação:**
1. Stories 3.1 → 3.2 → 3.3 (Wave 1 — sequential)
2. Stories 3.4, 3.5, 3.6 (Wave 2 — parallel, blocked by 3.1/3.4)
3. Stories 3.7, 3.8, 3.9 (Wave 3 — parallel, blocked by 3.3)
4. Story 3.10 (Wave 4 — blocked by 3.7-3.9)

**Referências:**
- EXECUTION.yaml: `docs/stories/epics/EPIC-3-EXECUTION.yaml`
- Architecture §6.1: `docs/architecture/architecture.md`
- PRD Epic 3: `docs/prd/PRD-Concierge-Digital-Stella.md` (L982)
