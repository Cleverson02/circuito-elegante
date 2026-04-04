# 👑 STATUS REAL DO PROJETO — 04 de abril de 2026

## EPIC 1: Foundation & Data Layer — 83% COMPLETO

### Stories Completadas ✅

| Story | Título | Status | Commits | Tests |
|-------|--------|--------|---------|-------|
| **1.1** | Scaffold Monorepo + Fastify | ✅ DONE | `00d52bd` | N/A |
| **1.2** | Schema PostgreSQL (7 tables) | ✅ DONE | `a9f0542` | Schema validado |
| **1.5** | Redis Setup + Session Mgmt | ✅ DONE | `7636608` | ✅ 19 testes passando |
| **1.3** | Ingestão 92 Hotéis (XLSX) | ✅ DONE | `af24974` | ✅ 15 testes passando |

**Testes Unitários Atuais:**
- `tests/unit/rate-limit.test.ts` — 12 testes ✅
- `tests/unit/session-manager.test.ts` — 7 testes ✅
- `tests/unit/ingest-hotels.test.ts` — 15 testes ✅
- **Total: 34 testes, 100% passando**

### Stories Incompletas ❌

| Story | Título | Status | Bloqueador | Estimativa |
|-------|--------|--------|-----------|-----------|
| **1.4** | FAQ Ingestion (pgvector) | ❌ NOT STARTED | Nenhum | 4-8h |
| **1.6** | Health Check Consolidado | 🟡 PARTIAL | Falta registrar checkers DB/vectordb | 2-4h |

### Status Real vs Documentação

**O que estava documentado como "feito":**
- FAQ embeddings (vectordb/) — ❌ FALSO, diretório está vazio
- Health check consolidado — 🟡 PARCIAL, só tem `/health` básico sem checkers registrados

**O que REALMENTE está feito:**
- ✅ Scaffold completo (Fastify 5, Docker, CI/CD GitHub Actions)
- ✅ Schema PostgreSQL com 7 tabelas + 11 migration files
- ✅ Redis client com retry logic
- ✅ Session management + rate limiting
- ✅ Hotel ingestion script com parsing XLSX complexo
- ✅ 34 testes unitários passando
- ✅ Linting + typecheck + CI pipeline

---

## 📋 BLOQUEADORES & FATOS

1. **Story 1.4 não foi iniciada** — vectordb/ está completamente vazio
   - Precisa de: Google Drive API client (ou fallback para data/faqs/ local)
   - Precisa de: Chunking engine
   - Precisa de: OpenAI embeddings integration
   - Precisa de: pgvector storage + upsert

2. **Story 1.6 incomplete** — health.ts existe mas não está integrado
   - Falta: registrar database health checker em server.ts
   - Falta: registrar vectordb health checker
   - Falta: smoke tests suite (e2e)

3. **CI/CD está ok** — mas não roda smoke tests (porque não existem)

---

## ⏱️ TIMELINE REALISTA — Próximos 48h

### HOJE (4h restantes)

**T1: Completar Story 1.4 — FAQ Ingestion [4-8h]**
- [ ] Implementar `backend/src/vectordb/chunker.ts` (semantic chunking por ## headings)
- [ ] Implementar `backend/src/vectordb/embedding.ts` (OpenAI text-embedding-3-small)
- [ ] Implementar `backend/src/vectordb/google-drive-client.ts` (ou fallback local)
- [ ] Script `data/scripts/ingest-faq.ts` para seed inicial
- [ ] Tests para chunker + embeddings
- [ ] Database upsert com UNIQUE(hotel_id, content_hash)

**T2: Completar Story 1.6 — Health Check Consolidado [2-4h]**
- [ ] Registrar database health checker em `server.ts`
- [ ] Registrar vectordb health checker em `server.ts`
- [ ] Criar `tests/e2e/smoke-test.test.ts`
- [ ] Atualizar `.github/workflows/ci.yml` para rodar smoke tests
- [ ] Validar: GET /health retorna { database, redis, vectordb, hotels_count }

### AMANHÃ (Dia 1 — 8h)

**T3: Epic 2.1 — Intent Agent [4-6h]**
- [ ] Criar `backend/src/agents/llm-client.ts` (interface agnóstica OpenAI)
- [ ] Criar `backend/src/agents/intent-agent.ts` (classificação de intenção)
- [ ] Testes unitários
- [ ] Integração com Orchestrator (próxima story)

**T4: Epic 2.2 — Orchestrator [4-6h]**
- [ ] Criar `backend/src/agents/orchestrator.ts` (tool calling)
- [ ] Tool definitions: search_hotels, query_knowledge_base, check_availability, etc.
- [ ] Integration com Elevare API (stub para começar)
- [ ] Testes

### DIA 2 (8h)

**T5: Epic 2.3 — Persona Agent [3-4h]**
- [ ] Criar `backend/src/agents/persona-agent.ts` (prosa AAA)
- [ ] System prompts (PT/EN/ES)
- [ ] Tone + persona validation

**T6: Epic 2.4 — Safety Agent [2-3h]**
- [ ] Criar `backend/src/agents/safety-agent.ts`
- [ ] Validation rules
- [ ] Injection attack detection

**T7: Input Handler [2-3h]**
- [ ] Criar `backend/src/agents/input-handler.ts`
- [ ] Text/Audio/Image detection
- [ ] Multimodal preprocessing

**T8: Pipeline Integration & E2E Tests [2-3h]**
- [ ] Wire all 4 agents + input handler
- [ ] End-to-end flow test
- [ ] Latency profiling

---

## 🎯 PRIORIDADES PARA 48h

### CRÍTICO (Sem isso, Epic 2 não sai):
1. ✅ Story 1.4 — FAQ Ingestion + vectordb
2. ✅ Story 1.6 — Health Check consolidado + smoke tests
3. ✅ Epic 2 pipeline core (Intent → Orchestrator → Persona → Safety)

### NÃO FAZER (para economizar tempo):
- ❌ BullMQ typing queue (Epic 4)
- ❌ Evolution API integration (Epic 5)
- ❌ Chatwoot handover (Epic 5)
- ❌ Production hardening (Epic 6)
- ❌ Supabase RLS policies

---

## 📊 MÉTRICAS DE SUCESSO

Ao final de 48h:
- ✅ Epic 1 = 100% completo (6/6 stories)
- ✅ Epic 2 = Core pipeline functional (4 agents + input handler)
- ✅ 50+ testes passando (unit + integration + smoke)
- ✅ CI/CD verde
- ✅ Health check consolidado retornando status de todas as dependências

**Não será MVP pronto**, mas será o **core da IA funcional** para começar testes com E2E.

---

## 🔧 PRÓXIMO COMANDO

```bash
@dev *task develop-story 1.4    # Iniciar FAQ Ingestion
```

Ou:

```bash
*workflow epic-1-completion     # Se existir workflow
```
