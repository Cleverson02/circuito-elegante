# Recomendacoes

## Decisao Recomendada

**Adotar o OpenAI Agents SDK (JS/TS) como framework de orquestracao multi-agente**, complementado pela Evolution API (gateway WhatsApp) e pelo OpenAI CS Agents Demo como blueprint de referencia para o pattern triage/handoff.

**Justificativa:**
1. O PRD ja especifica OpenAI GPT-5 family — usar o SDK oficial maximiza compatibilidade
2. A versao JS/TS alinha com o stack Fastify/TypeScript do PRD
3. O CS Demo prova que o pattern Triage -> Sub-agents funciona em producao
4. Evolution API + Chatwoot ja estao no PRD e tem integracao nativa entre si

---

## Ranking de Repositorios por Valor de Aceleracao

| # | Repositorio | Stars | Valor para Stella | Uso Recomendado |
|---|-------------|-------|-------------------|-----------------|
| 1 | **OpenAI Agents SDK (JS/TS)** | 2,567+ | CRITICO | Framework base para pipeline 4 subagentes |
| 2 | **OpenAI CS Agents Demo** | Oficial | ALTO | Blueprint de triage + guardrails (adaptar airline->hotel) |
| 3 | **Evolution API** | 2,000+ | CRITICO | Gateway WhatsApp (ja no PRD) |
| 4 | **AWS Agent Squad** | 7,200+ | ALTO | Classifier de intencoes alternativo/complementar |
| 5 | **Mastra** | 22,300+ | MEDIO | Alternativa TS se SDK OpenAI nao atender |
| 6 | **Agentic AI HotelBot** | Baixo | MEDIO | Referencia para RAG + SQL agent pattern hoteleiro |
| 7 | **Concierge-AI** | Baixo | MEDIO | Referencia para fluxos de conversa hotel + Supabase |
| 8 | **Jack The Butler** | Recente | BAIXO | Referencia para deploy Docker simplificado |

---

## Implementation Roadmap

| Fase | Acao | Effort | Owner | Timeline |
|------|------|--------|-------|----------|
| 1 | Clonar e estudar `openai-cs-agents-demo` — entender pattern triage/handoff e adaptar para hotel domain | S (~2h) | @dev | Sprint 1 |
| 2 | Integrar `@openai/agents` (JS/TS) no projeto Fastify como framework de orquestracao | M (~4-8h) | @dev | Sprint 1 |
| 3 | Configurar Evolution API instance e testar integracao Chatwoot | M (~4-8h) | @devops | Sprint 1 |
| 4 | Estudar `agentic_ai_hotelbot` para extrair patterns de RAG + SQL agent para hotels | S (~2h) | @architect | Sprint 1 |
| 5 | Implementar Intent Agent usando OpenAI Agents SDK handoff pattern | M (~4-8h) | @dev | Sprint 2 |
| 6 | Implementar Orchestrator com tool calling (Drizzle, pgvector, Elevare) | L (~2-3d) | @dev | Sprint 2-3 |
| 7 | Implementar Persona Agent + Safety Agent com guardrails | M (~4-8h) | @dev | Sprint 3 |
| 8 | Implementar Human-Typing Simulation com BullMQ (custom, sem repo base) | L (~2-3d) | @dev | Sprint 3-4 |
| 9 | Integrar Evolution API events (composing, read receipts, presence) | M (~4-8h) | @dev | Sprint 4 |

---

## Anti-Patterns a Evitar

1. **NAO tentar usar um repo "pronto" como base inteira** — Nenhum cobre mais de 40% do PRD sozinho. A forca esta na composicao
2. **NAO migrar para Python** por causa de mais opcoes de frameworks — O PRD especifica TypeScript/Fastify e a decisao esta correta
3. **NAO subestimar o Human-Typing Simulation** — E a feature mais custom e nenhum repo implementa. Priorizar design antes de implementacao
4. **NAO usar Twilio como gateway WhatsApp** — Evolution API e superior para o caso (open-source, integracao Chatwoot nativa, composing events)
5. **NAO ignorar o AWS Agent Squad** — Mesmo que nao seja o framework principal, o classifier de intencoes pode complementar o OpenAI Agents SDK

---

## Mapping para o Projeto Stella

| Componente Stella (PRD) | Finding Relevante | Acao Recomendada | Effort |
|--------------------------|-------------------|------------------|--------|
| **Intent Agent** (GPT-5-nano) | OpenAI CS Demo tem Triage Agent com intent routing | Adaptar Triage Agent pattern para classificar: RAG, API_SEARCH, API_BOOKING, CHAT, MULTIMODAL, HANDOVER | M (~4h) |
| **Orchestrator** (GPT-5-turbo + Tools) | OpenAI Agents SDK tem tool calling + function tools nativo | Definir tools como functions no SDK: search_hotels, query_knowledge_base, check_availability, etc. | L (~2d) |
| **Persona Agent** (GPT-5-pro) | OpenAI CS Demo nao tem persona layer separada | Implementar como agente custom com system prompt AAA + handoff do Orchestrator | M (~4h) |
| **Safety Agent** (GPT-5-nano) | OpenAI Agents SDK tem guardrails que rodam em paralelo | Usar guardrails nativos do SDK para validacao pre-envio | S (~2h) |
| **WhatsApp Gateway** (Evolution API) | Evolution API confirma suporte a composing, read receipts, presence | Usar como esta — configurar instance e integrar com backend Fastify | M (~8h) |
| **Chatwoot Handover** | Evolution API tem integracao nativa com Chatwoot | Configurar integracao Evolution API <-> Chatwoot. Implementar entity memory no handoff | M (~4h) |
| **RAG / pgvector** | HotelBot usa RAG Agent + SQL Agent em pipeline | Implementar query_knowledge_base tool no Orchestrator com pgvector + Supabase | M (~8h) |
| **Human-Typing Queue** (BullMQ) | Nenhum repo implementa. Feature 100% custom | Desenvolver do zero: chunking logico + delay humanizado + BullMQ queue | L (~3d) |
| **Hotel Search + Booking** (Elevare API) | Nenhum repo integra com Elevare. Fluxo Golden Discovery e unico | Implementar tools search/quotation/customer usando requestId+offerId pattern | L (~2d) |

---

## Proximos Passos

1. **@architect** — Revisar esta pesquisa e decidir: OpenAI Agents SDK vs Mastra vs AWS Agent Squad como framework principal
2. **@pm** — Incorporar findings nas stories do Epic 2 (Stella Core), referenciando repos como "prior art"
3. **@dev** — Clonar `openai-cs-agents-demo` e `openai-agents-js`, rodar exemplos localmente para validar viabilidade
4. **@devops** — Provisionar Evolution API instance para testes de integracao

> Implementacao nao e meu escopo. Meu papel e pesquisar e documentar. Para implementar, recomendo acionar @pm para priorizacao ou @dev para execucao. A documentacao completa esta em `docs/research/2026-04-02-stella-github-repos-agent-orchestration/` para referencia.
