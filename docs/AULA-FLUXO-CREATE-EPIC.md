# 🎓 AULA: Fluxo AIOX de Create-Epic & Dependências

**Data:** 2026-04-05  
**Contexto:** Por que PM cria Epic, SM cria Stories separadamente? Pode paralelizar Epic 3 com Epic 2?

---

## Parte 1: Dependências Entre Epics

### Grafo de Dependências (PRD Completo)

```
Epic 1: Foundation & Data Layer ✅ DONE
   ├─ PostgreSQL schema (92 hotéis, FAQs)
   ├─ Redis session state
   └─ Health check
        ↓ (bloqueador)

Epic 2: Stella Core (Em Execução 🔄)
   ├─ Intent Agent (GPT-5-nano)
   ├─ Orchestrator (GPT-5-turbo)
   ├─ Persona Agent (GPT-5-pro)
   ├─ Safety Agent (GPT-5-nano)
   └─ Input Handler (Multimodal)
        ↓ (dados brutos do Orchestrator)
        
Epic 3: Integração Elevare (PODE COMEÇAR AGORA! ✅)
   ├─ Elevare Client (GET /search, POST /quotations)
   ├─ Curadoria de Disponibilidade
   ├─ Mapeamento Estado Oculto
   ├─ Webhook Listener
   └─ Regeneração de Link
        ↓ (depende de 2.x.2 Orchestrator estar pronto)

Epic 4: Multi-Canal (Depende de 2 + 3)
   ├─ WhatsApp API Integration
   ├─ Website Chat Widget
   ├─ Human-Typing Simulation
   └─ Buffer 20s

Epic 5: Chatwoot & Handover (Depende de 2 + 3 + 4)
   ├─ Handover Elegante
   ├─ Marketing Intelligence
   └─ Retroalimentação

Epic 6: Production (Final)
   ├─ Monitoring
   ├─ LGPD
   └─ Deploy
```

### ✅ POR QUE PODE PREPARAR EPIC 3 AGORA?

**Epic 3 requisitos mínimos:**
- ✅ Banco PostgreSQL (temos em Epic 1)
- ✅ Redis (temos em Epic 1)
- ✅ Elevare API client (agnóstica — não depende do Orchestrator)
- ⏳ Orchestrator pronto (vem de Epic 2 — PODE SER INTEGRADO DEPOIS)

**A correlação é fraca:**
1. Epic 3 define as **tools do Elevare** (schema, helpers)
2. Epic 2 define quem **CHAMA** essas tools (Orchestrator)
3. A integração (2.x.2 Orchestrator → 3 tools) é **late binding** (sem bloqueio hard)

**Resultado:** Epic 3 pode ser implementado + testado com mocks do Orchestrator. Quando Epic 2.2 terminar, você só "plugga" o Orchestrator real.

---

## Parte 2: O Fluxo AIOX de Create-Epic (A Aula Real)

### ⚠️ Confusão Comum: "Por que PM cria e depois SM cria?"

**É uma separação INTENCIONAL de responsabilidades:**

```
Responsabilidade PM (Morgan)          Responsabilidade SM (River)
─────────────────────────────         ──────────────────────────

👤 Product Manager               👤 Scrum Master
   ├─ Estratégia/Visão           ├─ Decomposição/Planejamento
   ├─ Priorização Epic            ├─ Story Breakdown
   ├─ Requisitos Gerais           ├─ Estimativas T-shirt
   ├─ Aceitação Critério          ├─ Complexidade/Dependências
   └─ CRIAR EPIC (visão alta)     └─ CRIAR STORIES (implementação)
```

### Fluxo Detalhado (São 3 Fases!)

#### **FASE 1: PM Cria Epic (`*create-epic`)**

**O que faz:**
1. Lê seção do PRD (ex: "Epic 3: Integração Elevare")
2. **Cria arquivo único** `EPIC-3-EXECUTION.yaml`
3. Define **título, descrição, FRs cobertas, NFRs, riscos**
4. Estrutura stories **genericamente** (sem detalhe ainda)

**Exemplo output:**
```yaml
# EPIC-3-EXECUTION.yaml
epic_id: EPIC-3
title: "Integração Elevare — O Fluxo de Ouro"
description: "Implementar o fluxo end-to-end Elevare: /search → /quotations com curadoria, webhooks e state management"
status: Draft

stories:
  - story_id: "3.1"
    title: "Elevare API Client"
    description: "..."  # GENÉRICA
  - story_id: "3.2"
    title: "Search & Curadoria"
  - story_id: "3.3"
    title: "Quotations & State"
  # ... (SEM DETALHES, SEM UX, SEM AC)
```

**Por que separado?** Porque PM pensa em BUSINESS, não em CÓDIGO.

---

#### **FASE 2: SM Cria Stories (`*create-next-story` × N)**

**O que SM faz:**
1. Lê o `EPIC-3-EXECUTION.yaml` criado pelo PM
2. Para **cada story.id**, cria detalhe completo:
   - ✅ Acceptance criteria (Given/When/Then)
   - ✅ Scope IN/OUT
   - ✅ Complexidade real (não genérica)
   - ✅ Dependências (qual story bloqueia qual)
   - ✅ QA Gate tools
   - ✅ Branch name (`feat/3.1-elevare-api-client`)

**Exemplo output:**
```markdown
# Story 3.1 — Elevare API Client

| Campo | Valor |
|-------|-------|
| **Epic** | EPIC-3 |
| **Status** | Draft |
| **Branch** | feat/3.1-elevare-api-client |

## Acceptance Criteria

- [ ] AC1: Client funciona com autenticação Bearer token
- [ ] AC2: GET /search com filtros (cidade, data, guests)
- [ ] AC3: POST /customers registra hóspede
- [ ] AC4: POST /quotations gera link com requestId
- [ ] AC5: Tests: 15+ cases para cada endpoint
```

**Por que separado?** Porque SM pensa em IMPLEMENTAÇÃO, não em estratégia.

---

#### **FASE 3: PO Valida & @dev Implementa**

```
     PM cria              SM cria              PO valida            Dev implementa
   EPIC-3.yaml    3.1.story.md              (10-ponto)            (Code + Tests)
    (genérica)     (detalhe)              ✅ GO/NO-GO
```

---

### 🔄 O Fluxo Completo em Código

```bash
# Terminal 1: PM cria Epic
@pm *create-epic EPIC-3

# Terminal 2: SM cria Stories (em paralelo é OK)
@sm *create-next-story      # Cria 3.1
@sm *create-next-story      # Cria 3.2
@sm *create-next-story      # Cria 3.3
@sm *create-next-story      # Cria 3.4
@sm *create-next-story      # Cria 3.5

# Terminal 3: PO valida
@po *validate-story-draft 3.1
@po *validate-story-draft 3.2
# ... etc

# Terminal 4: Dev implementa
@dev *develop-story 3.1
@dev *develop-story 3.2
# ... (parallelizado por dev/turno)
```

---

## Parte 3: Por Que NÃO Criar Stories Junto no `*create-epic`?

### Razão #1: Responsabilidade Clara
- **PM**: Estratégia (o QUE fazer)
- **SM**: Tática (COMO fazer)
- **Misturar = dúvida quem decide**

### Razão #2: Validação Gates
```
PM cria → ✅ Validado (estratégia OK)
SM cria → ⏳ Aguarda validação SM
PO aprova → ✅ Validado (critério OK)
Dev implementa
```

Se tudo vem junto:
```
PM cria (com detalhe) → ⏳ Aguarda SM validar detalhe → ⏳ PO valida → Dev
# 3 validators = demora + confusão
```

### Razão #3: Mudanças Isoladas
- PM muda estratégia? Edita só `EPIC-3.yaml`
- SM descobre complexidade? Edita só `3.1.story.md`
- Não quebra tudo junto

---

## Parte 4: Otimização Proposta (Seu Insight!)

### Você estava certo em questionar!

**Situação atual (4 comando
s):**
```
@pm *create-epic EPIC-3                 # 1 arquivo output
@sm *create-next-story 3.1              # 5 arquivo outputs
@sm *create-next-story 3.2
@sm *create-next-story 3.3
@sm *create-next-story 3.4
@sm *create-next-story 3.5
```

**Otimização possível (1 comando, múltiplo input):**
```bash
# Se houvesse *create-epic-with-stories
@pm *create-epic-with-stories EPIC-3 stories.csv
# Cria Epic + 5 Stories em uma passada
```

**Por que não existe?**
- Requer PM + SM judgment juntos (perderia separação)
- Mas **CAN BE** criado como macro em `.claude/commands/`

**Você quer implementar? Posso criar:**
```yaml
# .claude/commands/create-epic-bulk.md
Command: create-epic-bulk
Description: "Create EPIC + all stories from CSV template"
Input: epic_number, csv_file_with_story_specs
Output: EPIC-N.yaml + N × story files
```

---

## Parte 5: Próximos Passos (Sua Situação)

### ✅ Pode Fazer AGORA (em paralelo com Epic 2):

**Terminal 1 (já rodando):** Epic 2 implementation (em outro terminal com @dev)

**Terminal 2 (este):** Epic 3 preparation
```bash
# 1. PM cria
@pm *create-epic EPIC-3

# 2. SM cria stories (depende de pouco — data layer já existe)
@sm *create-next-story      # 3.1 Elevare API Client
@sm *create-next-story      # 3.2 Search & Curadoria
@sm *create-next-story      # 3.3 Quotations & State
@sm *create-next-story      # 3.4 Webhook Listener
@sm *create-next-story      # 3.5 Regeneração de Link

# 3. PO valida (assíncrono)
@po *validate-story-draft 3.1
# ... (pode rodar paralelo)
```

**Resultado ao fim do Epic 2:** Epic 3 está Ready for Development, zero blockers.

---

## Parte 6: Dependência Real Entre Epic 2 e Epic 3

```
Epic 2 Orchestrator (2.2) ← Epic 3 tools (3.1-3.5)
            ↓
    Integração: 3-4 horas
    Quando? Após 2.2 estar pronto, plugg tools
    Risco? Nenhum (3.x testado com mocks)
```

**Estratégia recomendada:**
1. Epic 3 implementação: **mocks do Orchestrator**
   - Teste com `const mockOrchestrator = { tools: {...} }`
   - Full coverage sem Epic 2

2. Epic 3 integration: **Orchestrator real**
   - Após Epic 2.2 pronto
   - Plug&play (6h max)
   - Zero refactor

---

## Resumo (TL;DR)

| Pergunta | Resposta |
|----------|----------|
| **Pode preparar Epic 3 agora?** | ✅ **SIM** — zero dependência hard de Epic 2 |
| **Devo usar `*create-epic`?** | ✅ **SIM** — é o comando PM-exclusive |
| **Por que PM cria e SM cria depois?** | 🎯 **Separação intencional:** Business (PM) vs Tática (SM) |
| **Não deveria vir junto?** | ⚠️ **Poderia,** mas perderia clareza. Possível otimizar com `*create-epic-bulk` custom |
| **Qual é o fluxo correto?** | 1️⃣ PM `*create-epic` → 2️⃣ SM `*create-next-story` × N → 3️⃣ PO valida → 4️⃣ Dev implementa |

---

## Referências

- **CLAUDE.md** → Agent Authority (PM-exclusive, SM-exclusive)
- **story-lifecycle.md** → Phase 1 (Create) detalhe
- **PRD** → Seção 4: Epic 3-6 specs
