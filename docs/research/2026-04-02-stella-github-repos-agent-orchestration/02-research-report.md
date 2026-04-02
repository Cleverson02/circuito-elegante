# Research Report: Repositorios GitHub para Acelerar Stella

## TL;DR

Nenhum repositorio unico replica 100% da arquitetura Stella (4 subagentes + Evolution API + Chatwoot + hotel booking + human-typing). Porem, a **combinacao de 3-4 repositorios** cobre ~85% da arquitetura do PRD. O caminho mais rapido e usar o **OpenAI Agents SDK (JS/TS)** como framework de orquestracao + **Evolution API** como gateway WhatsApp + **OpenAI CS Agents Demo** como blueprint de triage/handoff.

---

## 1. Repositorios Tier 1 — Altamente Relevantes

### 1.1 OpenAI Agents SDK (Python + JS/TS)

**O que faz:** Framework oficial da OpenAI para workflows multi-agente. Agents com instructions, tools, guardrails e handoffs. Provider-agnostic (suporta 100+ LLMs). MCP server integration nativa. Tracing built-in. [HIGH — 3 fontes]

**O que NAO faz:** Nao tem integracao WhatsApp, nao tem typing simulation, nao tem hotel domain logic, nao tem Redis session management out-of-the-box.

**Insight para Stella:** Este e o framework ideal para implementar o pipeline Intent -> Orchestrator -> Persona -> Safety. O conceito de "agents as tools" e "handoffs" mapeia diretamente para a arquitetura de 4 subagentes do PRD. A versao JS/TS (`openai-agents-js`) e a mais adequada dado que o PRD usa Fastify/TypeScript.

| Metrica | Valor |
|---------|-------|
| **Repo (Python)** | [openai/openai-agents-python](https://github.com/openai/openai-agents-python) |
| **Repo (JS/TS)** | [openai/openai-agents-js](https://github.com/openai/openai-agents-js) |
| **Stars (Python)** | ~19,000+ |
| **Stars (JS/TS)** | ~2,567+ |
| **Linguagem** | Python / TypeScript |
| **Licenca** | MIT |
| **Ultimo update** | Ativo (2026) |
| **npm downloads** | 10.3M/mes (Python), crescente (JS) |

**Fonte:** [OpenAI Agents SDK Docs](https://openai.github.io/openai-agents-python/) — 2025-2026

---

### 1.2 OpenAI CS Agents Demo

**O que faz:** Demo oficial de customer service com OpenAI Agents SDK. Implementa **Triage Agent** (roteador de intencoes) que distribui para 4 sub-agentes especializados: Seat Booking, Flight Status, Cancellation, FAQ. Inclui guardrails (relevancia + jailbreak), context management e UI Next.js. [HIGH — 2 fontes confirmam arquitetura]

**O que NAO faz:** Domain e aereo (nao hoteleiro), nao tem WhatsApp, nao tem typing simulation, nao tem RAG com pgvector.

**Insight para Stella:** **Blueprint mais proximo da arquitetura Stella.** O Triage Agent = Intent Agent. Os sub-agentes = Orchestrator tools. O pattern de guardrails = Safety Agent. Adaptar de "airline" para "hotel" e trocar sub-agentes (Seat Booking -> Room Search, Flight Status -> Reservation Status, FAQ -> RAG Knowledge Base) e o caminho mais rapido.

| Metrica | Valor |
|---------|-------|
| **Repo** | [openai/openai-cs-agents-demo](https://github.com/openai/openai-cs-agents-demo) |
| **Stars** | Repo oficial OpenAI (recente, crescendo) |
| **Stack** | Python backend + Next.js UI |
| **Licenca** | MIT |
| **Ultimo update** | 2025-2026 |

**Fonte:** [OpenAI CS Agents Demo](https://github.com/openai/openai-cs-agents-demo) — 2025

---

### 1.3 AWS Agent Squad (ex-Multi-Agent Orchestrator)

**O que faz:** Framework robusto para gerenciar multiplos agentes AI com classificacao inteligente de intencoes. Roteia queries dinamicamente para o agente mais adequado baseado em contexto e conteudo. Suporta streaming e non-streaming. Context management cross-agent. **Dual language: Python + TypeScript.** [HIGH — 7.2k stars, documentacao extensa]

**O que NAO faz:** Nao tem integracao WhatsApp direta, nao tem hotel domain logic, nao tem typing simulation.

**Insight para Stella:** Alternativa ao OpenAI Agents SDK se quisermos um classifier mais sofisticado. O sistema de classificacao de intencoes e mais maduro e configuravel. Pode ser usado como camada de roteamento antes do pipeline de subagentes. A versao TypeScript e compativel com o stack Fastify.

| Metrica | Valor |
|---------|-------|
| **Repo** | [awslabs/agent-squad](https://github.com/awslabs/agent-squad) |
| **Stars** | **7,200+** |
| **Linguagem** | Python + TypeScript |
| **Licenca** | Apache 2.0 |
| **Ultimo update** | Ativo (2026) |
| **Mantido por** | AWS Labs |

**Fonte:** [Agent Squad Docs](https://awslabs.github.io/agent-squad/) — 2026

---

### 1.4 Evolution API

**O que faz:** API open-source de integracao WhatsApp com arquitetura dual (Baileys + Cloud API). Integracoes nativas com Chatwoot, OpenAI, Dify, Typebot. Suporta composing/recording events, read receipts, presence online. Event streaming via WebSocket, RabbitMQ, Kafka ou SQS. [HIGH — projeto ja especificado no PRD]

**O que NAO faz:** Nao orquestra agentes LLM (e um gateway de mensageria), nao tem pipeline multi-agente, nao tem domain logic.

**Insight para Stella:** **Ja esta no PRD como escolha de gateway.** O repo confirma que todas as features necessarias (FR33-FR35: composing, read receipts, presence) estao disponiveis. A integracao nativa com Chatwoot simplifica o Epic 5.

| Metrica | Valor |
|---------|-------|
| **Repo** | [EvolutionAPI/evolution-api](https://github.com/EvolutionAPI/evolution-api) |
| **Stars** | **2,000+** (ativo, comunidade BR forte) |
| **Linguagem** | TypeScript/Node.js |
| **Licenca** | Apache 2.0 |
| **Ultimo update** | Ativo (2026) |

**Fonte:** [Evolution API Docs](https://doc.evolution-api.com/v2/en/integrations/chatwoot) — 2026

---

### 1.5 Mastra

**O que faz:** Framework TypeScript para agentes AI em producao. Criado pelo time do Gatsby, Y Combinator W25. Model routing (40+ providers), agents com tools e guardrails, Mastra Studio (IDE visual para debug), MCP support nativo, structured output com Zod. **22k+ stars, 300k+ npm downloads/semana.** [HIGH — 3 fontes, metricas verificadas]

**O que NAO faz:** Nao tem WhatsApp integration, nao tem hotel domain logic, nao tem typing simulation, nao tem Chatwoot.

**Insight para Stella:** Se o time preferir um framework TypeScript-first mais maduro que o OpenAI Agents JS (que tem apenas 2.5k stars), Mastra e a alternativa mais forte. A integracao com Zod para structured output e ideal para definir schemas de resposta dos agentes.

| Metrica | Valor |
|---------|-------|
| **Repo** | [mastra-ai/mastra](https://github.com/mastra-ai/mastra) |
| **Stars** | **22,300+** |
| **Linguagem** | TypeScript |
| **Licenca** | Apache 2.0 |
| **Ultimo update** | Ativo (2026) |
| **Funding** | $13M (YC W25) |

**Fonte:** [Mastra.ai](https://mastra.ai/) — 2026

---

## 2. Repositorios Tier 2 — Parcialmente Relevantes

### 2.1 Concierge-AI

**O que faz:** Agente conversacional WhatsApp-first para hoteis, multilingual, LLM-powered. Resolve requests comuns, roteia issues para staff, oferece upsells, mantem memoria cross-session. Stack: Twilio WhatsApp, Express.js, OpenAI, Redis, Supabase, Next.js dashboard, n8n workflows. [MEDIA — 1 fonte, repo pequeno]

**O que NAO faz:** Nao usa Evolution API (usa Twilio), nao tem pipeline multi-agente (LLM unico), nao tem typing simulation, nao tem BullMQ.

**Insight para Stella:** O mais proximo em domain (hotel + WhatsApp + Supabase + Redis). Pode servir como referencia para fluxos de conversa hoteleiros, logica de upsell, e integracao Supabase. Porem, a arquitetura e mais simples (monolitica vs multi-agente).

| Metrica | Valor |
|---------|-------|
| **Repo** | [chotushikari/Concierge-AI](https://github.com/chotushikari/Concierge-AI) |
| **Stars** | Baixo (projeto recente) |
| **Stack** | Express.js, Twilio, OpenAI, Redis, Supabase |
| **Licenca** | MIT |

**Fonte:** [Concierge-AI GitHub](https://github.com/chotushikari/Concierge-AI) — 2025

---

### 2.2 Agentic AI HotelBot

**O que faz:** Concierge virtual para hoteis de luxo usando GPT, LangGraph agents, LlamaIndex, FastAPI, Redis, PostgreSQL. Suporta room booking, FAQ search, real-time availability. Arquitetura multi-agente: Supervised Agent coordena RAG Agent + SQL Agent. Deploy via Docker (HuggingFace + AWS ECS). [MEDIA — 1 fonte, bem documentado]

**O que NAO faz:** Nao tem WhatsApp, nao tem typing simulation, nao tem Chatwoot, stack e Python (nao TypeScript).

**Insight para Stella:** **Melhor referencia para a logica de domain hoteleiro.** O pattern RAG Agent + SQL Agent e diretamente aplicavel ao Orchestrator da Stella (query_knowledge_base + search_hotels). O uso de LangGraph para orquestracao de agentes e uma alternativa se o time considerar Python.

| Metrica | Valor |
|---------|-------|
| **Repo** | [Jaber-Valinejad/agentic_ai_hotelbot](https://github.com/Jaber-Valinejad/agentic_ai_hotelbot) |
| **Stars** | Baixo-medio |
| **Stack** | Python, LangGraph, FastAPI, Redis, PostgreSQL |
| **Deploy** | Docker, HuggingFace, AWS ECS |

**Fonte:** [Agentic AI HotelBot](https://github.com/Jaber-Valinejad/agentic_ai_hotelbot) — 2025

---

### 2.3 Jack The Butler

**O que faz:** Hotel AI chatbot open-source, self-hosted. Suporta WhatsApp, SMS, Email, Web Chat unificados. Single Docker container, SQLite. Suporta Claude, GPT, Ollama, Transformers.js. Custo operacional: $5-20/mes para hotel pequeno. [MEDIA — HackerNews traction, projeto recente]

**O que NAO faz:** Nao tem multi-agent pipeline, usa SQLite (nao PostgreSQL/Supabase), nao tem pgvector/RAG, nao tem typing simulation, arquitetura mais simples.

**Insight para Stella:** Referencia para UX de comunicacao multi-canal unificada e deploy simplificado com Docker. O modelo de custo e inspirador para pricing. Porem, a arquitetura e fundamentalmente diferente (monolitica vs multi-agente).

| Metrica | Valor |
|---------|-------|
| **Repo** | [JackTheButler/JackTheButler](https://github.com/JackTheButler/JackTheButler) |
| **Stack** | Docker, SQLite, multi-LLM |
| **Licenca** | Open Source |

**Fonte:** [jackthebutler.com](https://jackthebutler.com) — 2025-2026

---

## 3. Frameworks Complementares (Tier 3)

### 3.1 Langroid

**O que faz:** Framework Python multi-agente com agents como cidadaos de primeira classe. Tools/functions via Pydantic. CMU + UW-Madison. 3.9k stars. [MEDIA — projeto academico maduro]

**Insight:** Alternativa Python ao OpenAI Agents SDK se o time migrar para Python. Nao recomendado dado que o PRD especifica TypeScript.

### 3.2 LangGraph (LangChain)

**O que faz:** Framework de orquestracao multi-agente baseado em grafos de estado. Lider em Python para 2026. [HIGH — amplamente adotado]

**Insight:** Lider em Python, mas o PRD e TypeScript. Util como referencia de patterns (state machines, conditional edges).

### 3.3 BuilderBot

**O que faz:** Framework para criar chatbots WhatsApp em minutos. Comunidade hispanohablante forte. [MEDIA — nao e multi-agente]

**Insight:** Referencia para WhatsApp bot patterns, mas sem multi-agent orchestration.

---

## 4. Analise Comparativa — Cobertura do PRD

| Componente PRD | OpenAI Agents JS | CS Demo | Agent Squad | Evolution API | Mastra | Concierge-AI | HotelBot |
|----------------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Multi-Agent Pipeline | **SIM** | **SIM** | **SIM** | - | **SIM** | - | Parcial |
| Intent Classification | **SIM** | **SIM** | **SIM** | - | **SIM** | - | - |
| Tool Calling | **SIM** | **SIM** | **SIM** | - | **SIM** | - | Parcial |
| Guardrails/Safety | **SIM** | **SIM** | - | - | **SIM** | - | - |
| Handoff/Triage | **SIM** | **SIM** | **SIM** | - | **SIM** | - | - |
| WhatsApp Integration | - | - | - | **SIM** | - | Twilio | - |
| Chatwoot Integration | - | - | - | **SIM** | - | - | - |
| Hotel Domain Logic | - | Airline | - | - | - | **SIM** | **SIM** |
| RAG/pgvector | - | FAQ Agent | - | - | - | Supabase | LlamaIndex |
| Redis Session | - | - | - | - | - | **SIM** | **SIM** |
| Typing Simulation | - | - | - | - | - | - | - |
| Human-Typing Queue | - | - | - | - | - | - | - |
| TypeScript | **SIM** | Python+Next | **SIM** | **SIM** | **SIM** | Express.js | Python |
| Multilingual | - | - | - | - | - | **SIM** | - |

**Observacao critica:** Nenhum repositorio implementa **Human-Typing Simulation com BullMQ** — esta e uma inovacao do PRD que sera desenvolvida do zero.

---

## 5. Estrategia de Composicao Recomendada

A melhor abordagem nao e "encontrar UM repo que faz tudo", mas **compor a arquitetura com os melhores repos por camada:**

```
CAMADA DE ORQUESTRACAO (Cerebro)
├── OpenAI Agents SDK (JS/TS) — Framework base multi-agente
│   OU Mastra — Se preferir mais features TypeScript-native
├── OpenAI CS Demo — Blueprint de triage/handoff (adaptar airline→hotel)
└── AWS Agent Squad — Classifier de intencoes (se precisar mais sofisticacao)

CAMADA DE MENSAGERIA (Comunicacao)
├── Evolution API — Gateway WhatsApp (composing, read receipts, presence)
└── Chatwoot — Handover humano (ja integrado com Evolution API)

CAMADA DE DOMAIN (Hotel Logic)
├── Concierge-AI — Referencia para fluxos de conversa hoteleiros
├── Agentic AI HotelBot — Referencia para RAG + SQL agent pattern
└── Custom — Elevare API integration, hotel data model

CAMADA DE INFRAESTRUTURA
├── Fastify — API Gateway (PRD spec)
├── BullMQ + Redis — Typing queue (desenvolvimento custom)
├── Supabase + pgvector — Database + RAG (PRD spec)
└── Docker — Deploy (PRD spec)
```

---

## References

- [OpenAI Agents SDK Python](https://github.com/openai/openai-agents-python) — 2025-2026
- [OpenAI Agents SDK JS/TS](https://github.com/openai/openai-agents-js) — 2025-2026
- [OpenAI CS Agents Demo](https://github.com/openai/openai-cs-agents-demo) — 2025
- [AWS Agent Squad](https://github.com/awslabs/agent-squad) — 2026
- [Evolution API](https://github.com/EvolutionAPI/evolution-api) — 2026
- [Mastra](https://github.com/mastra-ai/mastra) — 2026
- [Concierge-AI](https://github.com/chotushikari/Concierge-AI) — 2025
- [Agentic AI HotelBot](https://github.com/Jaber-Valinejad/agentic_ai_hotelbot) — 2025
- [Jack The Butler](https://jackthebutler.com) — 2025-2026
- [Langroid](https://github.com/langroid/langroid) — 2025-2026
- [Top AI Agent Frameworks 2026](https://blog.agentailor.com/posts/top-ai-agent-frameworks-github-2026) — 2026
- [Best Open Source AI Agent Frameworks 2026](https://aihaven.com/guides/best-open-source-ai-agent-frameworks-2026/) — 2026
- [7 Open-Source Frameworks for Messaging Bots 2026](https://aibotbuilder.hashnode.dev/7-open-source-frameworks-for-deploying-ai-bots-to-messaging-platforms-in-2026) — 2026
