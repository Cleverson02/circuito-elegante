# 🚀 PLANO 48h — TUDO DO PRD ORIGINAL, SEM CORTES

## 📋 COMPOSIÇÃO DA EQUIPE (24/7)

### Equipe de Desenvolvimento (24/7 rotation)
- **@dev (Dex)** — Implementação código (principal)
- **@dev (Dex)** — Segundo turno
- **@dev (Dex)** — Terceiro turno
- **@architect (Aria)** — Code review + architecture decisions

### Equipe de QA (24/7 rotation)
- **@qa (Quinn)** — QA Gate + testes
- **@qa (Quinn)** — Segundo turno smoke tests

### Equipe de Gestão & Coordenação
- **@pm (Morgan)** — Epic orchestration + blockers
- **@sm (River)** — Story management + progress tracking
- **@po (Pax)** — Story validation + acceptance criteria
- **@aiox-master (Orion)** — Meta-orchestration + agent coordination

### Equipe de DevOps
- **@devops (Gage)** — Git push, CI/CD, releases

### Equipe de Especialistas
- **@data-engineer (Dara)** — Database design (já feito)
- **@analyst (Alex)** — Research + complex decisions

---

## ⏱️ TIMELINE 48h — SEM CORTES

### HOJE (20:00 até 20:00 amanhã) — 24h

#### **FASE 1: Epic 1 Completion (4-6h)**

**Turno 1 (20:00-04:00 = 8h):**
- @dev: Story 1.4 — FAQs Ingestion (T1-T4: Google Drive + Chunker + Embeddings + Storage)
- @qa: Preparar testes para 1.4
- @pm: Monitorar blockers

**Turno 2 (04:00-12:00 = 8h):**
- @dev: Continuar 1.4 (T5-T8: Logging + Health Check + Tests)
- @qa: Story 1.6 — Health Check + Smoke Tests (parallelizar)
- @po: Validar ACs de 1.4 conforme ficar pronto

**Turno 3 (12:00-20:00 = 8h):**
- @qa: Finalizar smoke tests para 1.6
- @dev: QA gate stories 1.4 + 1.6
- @devops: Preparar para merge na main após QA pass

**Resultado esperado ao final do Turno 3:**
- ✅ Epic 1 = 100% completo (6/6 stories)
- ✅ CI/CD verde
- ✅ Health check consolidado
- ✅ 50+ testes passando

---

#### **FASE 2: Epic 2 — 4 Agentes (16h restantes de hoje)**

**Turno 3 continuação (20:00 hoje → 04:00 amanhã = 8h):**

**Parallelizado:**
- @dev (Turno 3): Story 2.1 — Intent Agent
  - Create: `backend/src/agents/llm-client.ts` (agnóstic LLM interface)
  - Create: `backend/src/agents/intent-agent.ts` (intent classification)
  - Tests: intent classification accuracy
  - Estimated: 4-6h

- @dev (Turno 3 segundo): Story 2.2 — Orchestrator (começar)
  - Scaffold: `backend/src/agents/orchestrator.ts`
  - Define tools schema
  - Estimated: 2-3h (continua amanhã)

- @architect: Code review async
- @qa: Preparar testes para agentes

---

### AMANHÃ (20:00 até 20:00 depois de amanhã) — 24h

#### **FASE 3: Epic 2 Core (Complete)**

**Turno 1 (04:00-12:00 = 8h):**
- @dev: Story 2.1 — Intent Agent (finalizar + testes)
- @dev (turno 2): Story 2.2 — Orchestrator (completar implementation)
  - Implement: search_hotels, query_knowledge_base, check_availability tools
  - Tests unitários
  - Estimated: 6h

**Turno 2 (12:00-20:00 = 8h):**
- @dev: Story 2.3 — Persona Agent
  - Create: `backend/src/agents/persona-agent.ts`
  - System prompts (PT/EN/ES)
  - Tone validation
  - Tests
  - Estimated: 4h

- @dev (turno 2): Story 2.4 — Safety Agent + Input Handler (parallelizar)
  - Create: `backend/src/agents/safety-agent.ts`
  - Create: `backend/src/agents/input-handler.ts`
  - Injection detection
  - Tests
  - Estimated: 4h

**Turno 3 (20:00-04:00 = 8h):**
- @dev: Story 2.5 — Pipeline Integration
  - Wire: Input → Intent → Orchestrator → Persona → Safety
  - Create: `tests/integration/stella-4agent-pipeline.test.ts`
  - Latency profiling
  - Estimated: 4h

- @qa: E2E smoke tests para pipeline
  - Testes de ponta a ponta
  - Validação de latência < 10s
  - Estimated: 4h

- @architect: Architecture validation
- @po: Acceptance criteria validation

**Resultado esperado ao final de 48h:**
- ✅ Epic 1 = 100% DONE
- ✅ Epic 2 Core = 100% DONE (4 agentes + input handler)
- ✅ 100+ testes passando (unit + integration + smoke + e2e)
- ✅ CI/CD verde completo
- ✅ Pipeline IA funcional e testado

---

## 📊 DISTRIBUIÇÃO DE TAREFAS

### Story 1.4 — FAQ Ingestion & pgvector (4-6h)

**Subtasks Serial:**
1. T1: Google Drive Client — 1h
   - `backend/src/integrations/google-drive.ts`
   - Service account auth
   - File download (.md, .txt, .docx)
   
2. T2: Chunking Engine — 1.5h
   - `backend/src/vectordb/chunker.ts`
   - Semantic chunking por ## headings
   - Max 500 tokens
   - SHA-256 content_hash

3. T3: Embedding Generator — 1.5h
   - `backend/src/vectordb/embedding.ts`
   - OpenAI text-embedding-3-small integration
   - Batch processing para performance

4. T4: Storage + Upsert — 1h
   - pgvector upsert logic
   - UNIQUE(hotel_id, content_hash)
   - Idempotence guarantee

5. T5-T8: Logging + Health + Tests — 1-2h
   - `data/scripts/ingest-faq.ts`
   - Health checker registration
   - Unit tests (chunker, embedding)
   - Integration test (RAG query)

---

### Story 1.6 — Health Check Consolidado (2-4h)

**Subtasks Serial:**
1. Register database health checker — 30min
2. Register vectordb health checker — 30min
3. Create smoke test suite — 1h
4. E2E validation — 1h
5. CI update — 30min

---

### Epic 2.1 — Intent Agent (4-6h)

**Subtasks:**
1. LLM Client abstraction (`llm-client.ts`) — 1-2h
   - OpenAI primary
   - Claude fallback interface
   - Token counting
   - Error handling

2. Intent Agent implementation (`intent-agent.ts`) — 2-3h
   - Classify: RAG | API_SEARCH | API_BOOKING | CHAT | MULTIMODAL | HANDOVER
   - Confidence scoring
   - Fast routing

3. Tests — 1-2h
   - Unit: 50+ test cases para each intent class
   - Coverage >= 95%

---

### Epic 2.2 — Orchestrator (4-6h)

**Subtasks:**
1. Tool definitions — 1.5h
   - search_hotels (Drizzle SQL)
   - query_knowledge_base (pgvector)
   - check_availability (Elevare API)
   - generate_payment_link (Elevare API)
   - register_customer (Elevare API)
   - transfer_to_human (Chatwoot)

2. Orchestrator implementation — 2-3h
   - Tool calling logic
   - Data coordination
   - Error handling

3. Tests — 1-2h
   - Tool accuracy tests
   - Data flow validation
   - Error scenarios

---

### Epic 2.3 — Persona Agent (3-4h)

**Subtasks:**
1. System prompts — 1h
   - PT (português)
   - EN (english)
   - ES (español)
   - AAA persona definition

2. Persona Agent implementation — 1.5-2h
   - Prosa conversion
   - Tone validation
   - Luxury language patterns

3. Tests — 1h
   - Persona consistency tests
   - Tone validation tests

---

### Epic 2.4 — Safety Agent + Input Handler (3-4h)

**Subtasks:**
1. Safety Agent — 1.5-2h
   - Injection attack detection
   - Persona integrity check
   - Data correctness validation
   - Pre-send audit

2. Input Handler — 1-1.5h
   - Text detection + passthrough
   - Audio detection + transcoding
   - Image detection + vision processing

3. Tests — 0.5-1h
   - Security tests
   - Multimodal handling tests

---

### Epic 2 — Pipeline Integration (2-3h)

**Subtasks:**
1. Wire agents — 1h
   - Input → Intent → Orchestrator → Persona → Safety
   - Error handling between stages
   - Fallback paths

2. E2E tests — 1-1.5h
   - End-to-end message flow
   - Latency profiling
   - Stress tests (100 msgs/sec)

3. Final validation — 0.5h
   - NFR1 compliance (< 10s latency)
   - All AC met

---

## ✅ ACCEPTANCE CRITERIA POR STORY

### Story 1.4 (FAQ Ingestion)
- [ ] AC1: Google Drive API v3 client functional
- [ ] AC2: Downloads .md, .txt, .docx
- [ ] AC3: Semantic chunking por ## headings implemented
- [ ] AC4: Max 500 tokens per chunk enforced
- [ ] AC5: OpenAI text-embedding-3-small integration working
- [ ] AC6: Chunks stored in faq_embeddings with content_hash
- [ ] AC7: Upsert logic with UNIQUE(hotel_id, content_hash)
- [ ] AC8: Logging of files/chunks/embeddings
- [ ] AC9: Query 'piscina aquecida' returns correct chunk
- [ ] AC10: Health check includes vectordb status
- [ ] Tests: 20+ unit tests + 5+ integration tests
- [ ] CI: All tests passing, lint clean, typecheck clean

### Story 1.6 (Health Check)
- [ ] AC1: /health returns { database, redis, vectordb, hotels_count }
- [ ] AC2: Status 'degraded' if any dep fails (not 500)
- [ ] AC3: /health/ready probe for Docker readiness
- [ ] AC4: /health/live probe for Docker liveness
- [ ] AC5: Smoke test suite created (5+ tests)
- [ ] AC6: CI updated to run smoke tests
- [ ] Tests: 10+ smoke tests passing

### Epic 2.1 (Intent Agent)
- [ ] AC1: Intent classification for 6 intent types
- [ ] AC2: Confidence scoring
- [ ] AC3: Fast routing (< 100ms)
- [ ] AC4: LLM client abstraction working
- [ ] Tests: 50+ unit tests, 95%+ coverage

### Epic 2.2 (Orchestrator)
- [ ] AC1: Tool calling functional
- [ ] AC2: 6 tools implemented (search, RAG, APIs, transfer)
- [ ] AC3: Data coordination between tools
- [ ] AC4: Error handling for all tools
- [ ] Tests: 30+ unit tests, integration tests

### Epic 2.3 (Persona Agent)
- [ ] AC1: Prosa luxury generation working
- [ ] AC2: PT/EN/ES language support
- [ ] AC3: AAA persona maintained
- [ ] AC4: Tone validation
- [ ] Tests: 20+ unit tests

### Epic 2.4 (Safety Agent + Input Handler)
- [ ] AC1: Injection attack detection
- [ ] AC2: Persona integrity validation
- [ ] AC3: Data correctness check
- [ ] AC4: Text/audio/image handling
- [ ] AC5: Multimodal preprocessing
- [ ] Tests: 15+ security tests, 10+ multimodal tests

### Epic 2 Pipeline Integration
- [ ] AC1: Full pipeline functional (Input → 4 Agents → Output)
- [ ] AC2: End-to-end message flow tested
- [ ] AC3: Latency < 10s (NFR1)
- [ ] AC4: Error handling for all stages
- [ ] AC5: Fallback paths functional
- [ ] Tests: 20+ E2E tests, stress tests

---

## 🎯 SUCCESS METRICS (Final)

**Código:**
- ✅ 150+ testes passando (unit + integration + E2E + smoke)
- ✅ 95%+ code coverage
- ✅ 0 linting errors
- ✅ 0 typecheck errors
- ✅ All AC met (Epic 1 + Epic 2 core)

**Qualidade:**
- ✅ CI/CD 100% verde
- ✅ All critical paths tested
- ✅ Security validation complete
- ✅ Latency profiling done (< 10s)
- ✅ Multimodal handling validated

**Documentação:**
- ✅ All stories updated with final status
- ✅ Code comments for complex logic
- ✅ Architecture decisions documented
- ✅ API contract documented

---

## 🚀 COMANDO PARA COMEÇAR

```bash
@pm *execute-epic 1                    # Inicia Epic 1 com todas waves parallelizadas
                                       # @dev executa em rotation 24/7
```

Ou (se preferir manual):

```bash
@dev *task develop-story 1.4           # Turno 1 começa Story 1.4
@dev *task develop-story 1.6           # Parallelizar Story 1.6 em segundo @dev
```

---

**TEMPO TOTAL: 48h**  
**RESULTADO: Epic 1 (100%) + Epic 2 Core (100%)**  
**QUALIDADE: 150+ testes, 95%+ coverage, CI verde**

Começamos? 🚀
