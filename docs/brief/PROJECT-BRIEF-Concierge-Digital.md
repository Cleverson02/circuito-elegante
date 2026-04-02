# PROJECT BRIEF: Concierge Digital Circuito Elegante

**Status:** ✅ VALIDADO — Pronto para PRD  
**Data de Criação:** 2026-04-01  
**Data de Validação:** 2026-04-01  
**Versão:** 2.0 (Completo)  
**Autor:** Cleverson Silva (com Morgan — PM)  
**Agente IA:** Stella — Concierge Digital Circuito Elegante

---

## 1. Executive Summary

Concierge Digital inteligente que resolve o gargalo de atendimento de 86 hotéis de luxo, qualificando hóspedes e orquestrando a jornada de forma fluida entre resoluções automatizadas e transbordos para concierges humanos com contexto completo. O projeto foca inflexivelmente na experiência premium e conversão, mas mantém sua arquitetura técnica aberta e agnóstica para evoluir e absorver os melhores modelos e infraestruturas de IA que o mercado oferecer.

---

## 2. Problem Statement

### O Gargalo Atual

Clientes de altíssimo padrão (luxo) do Circuito Elegante buscam atendimento **rápido, humanizado e preciso** para planejar suas viagens. Hoje, a rede enfrenta um gargalo crítico:

- **86 hotéis com tecnologia mista:** 36 integrados via API Elevare (moderno) + 50 operando manualmente (overhead operacional)
- **Demandas vagas e específicas:** Perguntas como "quero praia para casal" exigem qualificação manual. Dúvidas técnicas ("a piscina é aquecida?") precisam ser consultadas individualmente
- **Impacto direto na experiência:** O tempo entre pergunta e resposta gera atrito, atrasa conversão e prejudica a percepção de "luxo"
- **Custo operacional elevado:** Concierges humanos atrasados respondendo perguntas repetitivas que poderiam ser automatizadas

**Urgência:** Esta é uma dor global em redes de hotéis de luxo, mas a diferença competitiva está em quem resolve primeiro.

---

## 3. Proposed Solution

Um **Agente de IA Multi-LLM** que atua como a **linha de frente invisível do atendimento**, operando como Orquestrador inteligente:

### Fluxo de Operação

1. **Qualificação Inteligente** — O usuário chega (site/WhatsApp) e descreve sua necessidade de forma natural
2. **Orquestração de Dados Híbrida** — O agente paralela múltiplas ações:
   - Consulta estruturada (SQL) para filtro exato: região, experiência, descontos aplicáveis
   - Consulta RAG/VectorDB para dúvidas de infraestrutura ("aquecida?", "pet-friendly?")
   - Verifica disponibilidade via API Elevare (para os 36 integrados)
3. **Decisão de Fechamento vs. Transbordo:**
   - **Se** hotel tem API → Gera link de pagamento e entrega
   - **Se** hotel é manual ou questão é sensível → Transfere para humano **com contexto completo** (Entity Memory)
4. **Memória de Sessão** — Durante a conversa, mantém o "hotel ativo" em contexto, evitando repetições

### Por Que Funciona

- **Para o Hóspede:** Atendimento rápido, humanizado (não parece robô), preciso
- **Para o Concierge Humano:** Chega contexto mastigado, economia de 70% do tempo repetitivo
- **Para a Rede:** Escalabilidade sem custo linear, conversões mais rápidas

---

## 4. Key Differentiators (Críticos)

| Diferencial | Por Quê Importa |
|---|---|
| **Agentic Workflow** (não classificador linear) | Lida com múltiplas perguntas na mesma frase sem "resolver" para a primeira pergunta apenas |
| **Dados Híbridos** (estruturado + não-estruturado) | 100% precisão em preço/regra + conhecimento contextual rico (sem alucinação) |
| **Handover Elegante** | O transbordo não é "erro do robô", mas ação planejada de luxo com contexto íntegro |
| **Agnóstico de LLM** | Pronto para Gemini, OpenAI, Anthropic ou modelos futuros sem rearquitetar |

---

## 5. Target Users

### Primary User Segment: Hóspedes de Luxo (Decisores de Viagem)

**Perfil:**
- Classe alta/ultra-alta, buscando experiência premium
- Idade: 35-65 anos (principalmente; secundário 25-35)
- Comportamento: Pesquisam antes de reservar, comparam, buscam garantias (melhor preço, inclusões)
- Dispositivos: Mobile (WhatsApp) e desktop (site)
- Padrão de viagem: Fins de semana, feriados, occasiões especiais (aniversários, lua de mel, retiros executivos)

**Necessidades:**
- Resposta rápida a dúvidas
- Linguagem que responda ("não vejo piscina") com segurança
- Confirmação de descontos e benefícios aplicáveis
- Ofertas exclusivas (Bradesco, etc.)

### Secondary User Segment: Concierges Humanos (Equipe de Atendimento)

**Perfil:**
- Operadores experientes em hotéis de luxo
- Responsáveis por conversões finais e ajustes sensíveis
- Horários comerciais (9-18) + suporte 24h para emergências

**Necessidades:**
- Receber contexto completo (não começar do zero)
- Economia de tempo em perguntas repetitivas
- Ferramenta que aumente sua capacidade, não substitua
- Interface clara para handover

---

## 6. Goals & Success Metrics

### Business Objectives

- **Aumentar taxa de conversão** — Reduzir tempo entre qualificação e fechamento
- **Reduzir carga operacional** — Concierges focarem em vendas consultivas, não FAQs repetitivas
- **Elevar NPS** — Atendimento rápido = experiência premium
- **Escalabilidade sem custo linear** — Absorver crescimento sem contratar mais concierges

### Success Metrics (SMART)

| Métrica | Target | Timeline |
|---------|--------|----------|
| **Tempo de resposta** | < 5 seg (95º percentil) | Mês 1 |
| **Acurácia em dados tabulares** | 100% (preço, regra Bradesco, disponibilidade) | Contínuo |
| **Taxa de transbordo bem-sucedido** | 95%+ (contexto chega íntegro ao humano) | Contínuo |
| **Segurança contra Prompt Injection** | Zero violações reportadas | Contínuo |
| **Redução de tempo/pergunta** | -70% para FAQs (de 5min para ~1min com humano) | Mês 2 |
| **Aumento de conversão** | +15-20% (hipótese: mais rápido = mais vendas) | Mês 3 |

---

## 7. MVP Scope

### Must-Have (Fase 1)

- [x] Filtro progressivo de hotéis por experiência (Praia, Serra, etc.) usando dados estruturados
- [x] Consulta de disponibilidade e preço via API Elevare (36 hotéis integrados)
- [x] Geração e entrega de link de pagamento Elevare
- [x] Consulta de status de reservas existentes (pós-venda)
- [x] RAG em arquivos Markdown para dúvidas de infraestrutura
- [x] Handover para humano com resumo de contexto (Entity Memory)
- [x] Defesa contra Prompt Injection (segurança)
- [x] Suporte multi-canal (site + WhatsApp via API)
- [x] Orquestrador inteligente (paralela múltiplas tarefas)

### Out of Scope (MVP)

- [ ] Processamento financeiro nativo (usa API externa Elevare)
- [ ] Alteração/cancelamento de reservas (apenas consulta; mudanças → humano)
- [ ] Negociação de descontos fora de regras documentadas
- [ ] Suporte a hotéis manuais com geração de link (manual → humano)
- [ ] Análise preditiva de churn (futuro)
- [ ] Multi-idioma (v1: português; futuro: ES, EN)

### MVP Success Criteria

1. Agente responde 80% das perguntas comuns sem transbordo
2. 95% das transferências chegam ao humano com contexto completo
3. Tempo total < 5 segundos para respostas (exceto API lenta da Elevare)
4. Zero violações de segurança em 30 dias de beta

---

## 8. Post-MVP Vision

### Phase 2 (Meses 4-6)

- **Análise Preditiva:** Detectar churn risk e oferecer proativamente benefícios exclusivos
- **Multi-Idioma:** Expandir para espanhol e inglês
- **Integração com Hotéis Manuais:** Gerar cotação semi-automática com fallback humano
- **Personalização:** Lembrar preferências do hóspede entre viagens

### Phase 3+ (Long-term Vision)

- **Integração com OTAs:** Monitorar competição de preço em tempo real
- **Ecosistema de Parceiros:** Concierge digital também recomenda experiências (restaurantes, tours, spas)
- **Agente Autônomo 24/7:** Completar reservas à noite/fim de semana sem humano (com aprovações assincronizadas)
- **Modelo Multi-Tenant:** Oferecer plataforma como white-label para outras redes de hotéis

---

## 9. Technical Considerations

### Architecture Overview

- **LLM Provider:** OpenAI (GPT-5 family) — 100% créditos gratuitos ($0/mês)
- **Arquitetura Multi-Agente (4 Subagentes):**
  - **Intent Agent (GPT-5-nano):** Roteador de alta velocidade (~50ms)
  - **Orchestrator (GPT-5-turbo/standard):** Maestro — tool calling + coordenação
  - **Persona Agent (GPT-5-pro/creative):** Voz de luxo AAA — prosa humanizada
  - **Safety & Validation Agent (GPT-5-nano):** Auditor de qualidade pré-envio
- **Interface Agnóstica:** Permite swap futuro para Claude, Gemini, etc. sem rearquitetar
- **Data Layer Híbrida:**
  - **Estruturado:** PostgreSQL + pgvector (hotel data, preços, regras)
  - **Não-Estruturado:** Vector DB (Pinecone/Qdrant) para FAQs em Markdown
- **APIs Externas:**
  - Elevare (reservas, disponibilidade, pagamento)
  - WhatsApp Business API (canal de entrada)
- **Ferramentas do Orquestrador (Tool Calling):**
  1. `search_hotels(experience, region, has_promo)` — SQL query
  2. `query_hotel_knowledge(hotel_name, question)` — RAG vetorial
  3. `check_api_availability(hotel_id, dates)` — Elevare API
  4. `generate_payment_link(hotel_id, room_id, guest_data)` — Elevare API
  5. `check_reservation_status(reservation_code)` — Elevare API
  6. `transfer_to_human_concierge(reason, context_summary)` — Escalação com memória

### Repository & Deployment

- **Monorepo** — /backend (Node.js/Python), /data (scripts ingestão), /docs
- **Deployment:** Docker + K8s (escalabilidade horizontal)
- **Infra:** AWS/GCP (agnóstico — escolher após Phase 0)

---

## 10. Constraints & Assumptions

### Constraints

| Constraint | Details |
|---|---|
| **Disponibilidade de Dados** | FAQs dos 86 hotéis em Google Drive (formato texto padrão), atualizadas a cada 2 meses pela equipe de concierges |
| **Integração Elevare** | Apenas 36 hotéis com API; 50 manuais exigem transbordo para Chatwoot |
| **Timeline** | MVP em ~3 meses; não é projeto de 6+ meses |
| **Orçamento** | US$ 90/mês total (LLM APIs + infra); aprovado e pronto para iniciar |
| **Volume MVP** | 1.500 mensagens/mês; sem picos de simultaneidade extrema |
| **Latência Processamento** | < 10s interno; buffer de 20s no WhatsApp para concatenar mensagens |
| **Infraestrutura** | Docker containerizado; Digital Ocean + Cloudflare + Cloudfy; single-region; Supabase para persistência |
| **Processamento de Pagamento** | Zero processamento de cartão; apenas link Elevare gerado |

### Assumptions

- Hóspedes em português, inglês e espanhol (detecção automática MVP)
- Concierges humanos disponíveis via Chatwoot para transbordo
- FAQs atualizadas regularmente (responsabilidade: equipe de concierges / 2 meses)
- Google Drive pode ser consumido por automação (APIs disponíveis)
- Elevare API SLA aceitável (99.5%) com fallback elegante para timeout
- Supabase suficiente para retenção indefinida de dados de conversas

---

## 11. Operational Premises (Stella — Agente de IA)

O agente recebe o nome **Stella** e deve operar sob as seguintes premissas essenciais:

### 11.1 Plataforma de Handover (Inbox): Chatwoot

- **Central de orquestração:** Chatwoot como plataforma única de atendimento
- **Transferência automática:** Stella pausa automação e transfere para fila Chatwoot quando:
  - Hotel não integrado via API Elevare (50 hotéis manuais)
  - Hóspede solicita humano explicitamente
  - Stella não tem resposta confiável
- **Contexto completo:** Concierge humano lê contexto integral na mesma interface (sem perder histórico)
- **Retroalimentação:** Toda interação resolvida pelo humano no Chatwoot realimenta Stella para aprendizado futuro

### 11.2 Persona & Técnicas AAA (Acolhedora, Conhecedora, Acima de tudo Discreta)

**Diretrizes de Voz:**
- **Acolhedora:** Empatia genuína, entende que está atendendo hóspedes de luxo
- **Conhecedora:** Domina dados dos hotéis, experiências, ofertas com profundidade
- **Discreta:** Nunca força venda, evita gatilhos de escassez agressivos
- **Recuo Elegante:** Se hóspede hesita, Stella recua com classe — oferece espaço sem abandonar

**Tons a evitar:**
- ❌ Robótico, comercial, agressivo
- ❌ Linguagem de chatbot (perguntas binárias)
- ❌ Escassez artificial ("apenas 2 quartos restantes!")
- ❌ Insistência após recusa

### 11.3 Multilíngue Nativo

- **Detecção automática:** Stella detecta idioma do usuário na 1ª mensagem (PT, EN, ES)
- **Resposta fluente:** Mantém tom de voz consistente em qualquer idioma
- **Sem pergunta de idioma:** Nunca solicita confirmação ("qual seu idioma preferido?")
- **Mudança dinâmica:** Se hóspede muda de idioma mid-conversation, acompanha naturalmente
- **MVP:** Português com suporte nativo; Inglês e Espanhol já habilitados desde o início

### 11.4 Autoaprendizado Futuro

- **Base de conhecimento viva:** Toda interação resolvida por concierge humano no Chatwoot é armazenada
- **Feedback loop:** Histórico alimenta prompts e exemplos para versões futuras de Stella
- **Melhoria iterativa:** A cada 2 meses, análise de transbordo → refinamento de regras/personas
- **Métrica:** Redução progressiva de taxa de transbordo (objetivo: atingir 85%+ de resolução sem humano em 6 meses)

---

## 12. Risks & Open Questions

### Key Risks

| Risk | Impact | Mitigation |
|---|---|---|
| **Alucinação de IA em dado sensível** | Alto — hóspede fica com informação errada | Dados híbridos (estruturado + RAG); testes rigorosos; fallback para humano |
| **Latência da API Elevare** | Médio — resposta lenta = experiência ruim | Circuit breaker; cache; fallback para mensagem "consultando..." |
| **Adoção por concierges** | Médio — se tool é confusa, não usam | Design iterativo com usuários reais; treinamento; feedback loop |
| **Prompt Injection** | Alto — ataque pode vazar dados/contexto | Validação de entrada; LLM hardening; permissões de ferramenta restritivas |
| **Dependência de LLM proprietário** | Médio-Alto — preço sobe, modelo muda | Arquitetura agnóstica; testes com múltiplos modelos; SLA clara |

### Open Questions — ✅ RESPONDIDAS

✅ **Q1: Latência SLA**
- Processamento interno: < 10s
- Latência final ao hóspede: propositalmente maior (buffer de ~20s no WhatsApp para concatenar mensagens "picadas")
- Fallback Elevare: Mensagem elegante ("Um momento, estou verificando as suítes exclusivas...") sem timeout brusco; tentar novamente; se falhar → transferir para humano

✅ **Q2: Manutenção de FAQs**
- Equipe de concierges atualiza a cada 2 meses
- Armazenamento: Google Drive (formato texto padrão, não .md obrigatório)
- IA consome direto do Drive → VectorDB (tecnologia moderna definida na arquitetura)

✅ **Q3: Orçamento**
- Aprovado: SIM ✓
- Teto: US$ 90/mês total (LLM APIs + infra)
- Status: Pronto para iniciar

✅ **Q4: Volume & Escalabilidade**
- MVP: 1.500 mensagens/mês
- Sem picos de simultaneidade extrema
- Arquitetura enxuta suficiente

✅ **Q5: Compliance & Segurança**
- Retenção: Indefinida (Supabase)
- LGPD: Coberto por termos de uso (opt-in existente)
- PCI-DSS: Zero processamento de cartão (apenas link Elevare)
- Marketing Intelligence: Extrair e salvar estruturado — nome, email, telefone, histórico, nº pessoas, tipo data especial/aniversários, hotel reservado, preferências, valor gasto

✅ **Q6: Hosting**
- Containerizado: Docker
- Cloud: Digital Ocean (existente) + Cloudflare + Cloudfy
- BD: Supabase
- Redundância: Single-region OK
- Foco: Menor custo sem comprometer qualidade/estabilidade

---

## 13. Appendices

### A. Referências Técnicas

- **LangGraph / CrewAI / AutoGen** — Frameworks para agentic workflows (2026)
- **pgvector (PostgreSQL)** — Vector DB integrado (sem terceiros)
- **Semantic Chunking** — Técnica para fatiar Markdown (vs. ingênuo character-split)
- **Elevare API Docs** — [link a ser confirmado]
- **WhatsApp Business API** — https://developers.facebook.com/docs/whatsapp/business-platform/get-started

### B. Stakeholder Input

_A ser preenchido conforme feedback de:_
- CEO/Direção do Circuito Elegante
- Gerentes de hotéis (especialmente os 50 manuais)
- Concierges experientes (user interviews)

### C. Data Provided

- CSV com 86 hotéis (região, experiência, cupom Bradesco, flag API)
- Brief básico com reqs de negócio e arquitetura

---

## 15. Golden Discoveries (Elevare API & Postman Analysis)

Durante a análise profunda do Postman collection da Elevare e do JSON de respostas, identificamos **3 descobertas críticas** que redefiniram completamente a arquitetura técnica:

### **Golden Discovery #1: Assets Transacionais (Imagens Retornadas pela API)**

**Descoberta:** A Elevare retorna as imagens dos quartos na resposta de `/search`, junto com descrições e IDs. Não precisa manter tabelas gigantes de fotos em PostgreSQL.

**Impacto Técnico:**
- ✅ Schema PostgreSQL **muito mais enxuto** (remove tabelas de room_images, media_metadata)
- ✅ Respostas carregam foto + descrição direto da API → renderiza no WhatsApp instantaneamente
- ✅ Reduz custo de storage (não armazena assets transacionais)
- ✅ Imagens sempre atualizadas (nunca obsoletas no banco local)

**Nova FR resultante:**
- **FR22 (Renderização Transacional de Assets):** Stella recebe URL de imagem da Elevare, faz download, e renderiza no WhatsApp como mídia nativa (sem salvar em disco). Suporta fallback se imagem inativa/removida.

---

### **Golden Discovery #2: O Fluxo Mágico da Elevare (requestId + offerId)**

**Descoberta:** O fluxo de integração Elevare é **muito mais elegante** do que assumido:

1. **GET /search** → Busca vagas, retorna: `[{ roomId, offerId, photo, price, requestId }]`
2. **POST /customers** → Registra/atualiza hóspede com dados pessoais
3. **POST /quotations** → Gera link de pagamento usando `requestId` + `offerId` (não precisa de IDs complexos)

**Antes (Arquitetura Assumida):**
```
Hóspede escolhe → Stella mapeia IDs internos → Chama API complexa → Gera link
```

**Depois (Fluxo Real Elevare):**
```
Hóspede escolhe → Stella usa requestId + offerId da /search → POST /quotations → Link pronto
```

**Impacto Técnico:**
- ✅ **Zero mapeamento de IDs** — requestId é o token único da transação
- ✅ **State management simplificado** — salva apenas requestId em sessão (Redis)
- ✅ **Menos latência** — 3 chamadas diretas vs. complex query routing
- ✅ **Mais seguro** — requestId nunca exposto ao hóspede (stays in backend cache)

**Novas FRs resultantes:**
- **FR23 (Global Search-to-Quotation Flow):** Stella paraleliza /search com dados do hóspede, armazena requestId em cache Redis (TTL 30min), e ao confirmação gera /quotations com requestId + offerId.
- **FR24 (requestId State Isolation):** O requestId é um token opaco mantido apenas no backend (Redis), nunca enviado via WhatsApp. Hóspede não vê IDs técnicos — apenas "quarto escolhido" humanizado.

---

### **Golden Discovery #3: Webhooks Follow-Up (Stella Não Precisa de Crons Pesados)**

**Descoberta:** A Elevare dispara **webhooks de follow-up** (ex: "Link expira em 1h", "Reserva confirmada", "Pagamento recusado").

**Antes (Arquitetura Assumida):**
```
Cron job a cada 5 min → Stella consulta status da reserva → Decide se notifica hóspede
```

**Depois (Webhooks Reais):**
```
Elevare dispara webhook → Stella escuta e reage (notifica hóspede, escalona, etc.)
```

**Impacto Técnico:**
- ✅ **Zero overhead de polling** — reativo, não proativo
- ✅ **Real-time follow-up** — hóspede recebe "link expira em 1h" instantaneamente
- ✅ **Menos carga** — não simula cron jobs pesados
- ✅ **Automação pura** — webhook triggers → automação no Chatwoot ou Stella

**Nova FR resultante:**
- **FR25 (Webhook Listener & Auto-Follow-Up):** Backend expõe endpoint `/webhooks/elevare` que recebe eventos (quote_expiring, reservation_confirmed, payment_failed). Stella consome webhook, determina ação (notifique hóspede, transfira para Chatwoot, upsell), e executa.

---

## 14. Technical Assumptions & Architecture (Seção 4 — Refinada com Golden Discoveries)

### **4A: Repository Structure (Refinado)**

**Decisão:** Monorepo com suporte a Assets & Configuração

```
circuito-elegante-stella/
├── config/                 # [NOVO] Variáveis de env, rate limits, keys
│   ├── database.js
│   ├── elevare.js
│   ├── redis.js
│   ├── openai.js
│   └── gemini.js
├── backend/
│   ├── src/
│   │   ├── agents/                    # Orquestrador (Gemini) + Persona (OpenAI)
│   │   ├── tools/                     # Tool definitions (search_hotels, etc.)
│   │   ├── integrations/
│   │   │   ├── elevare.js             # Fluxo /search → /customers → /quotations
│   │   │   ├── whatsapp.js
│   │   │   ├── google-drive.js
│   │   │   └── chatwoot.js
│   │   ├── database/
│   │   │   ├── queries/               # SQL diretos + pgvector queries
│   │   │   └── migrations/            # Schema setup
│   │   ├── vectordb/                  # Ingestão FAQ → pgvector
│   │   ├── state/                     # Redis session, context persistence
│   │   ├── prompts/                   # System prompts (versionados em código MVP)
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   ├── sanitize.js            # [NOVO] Validação contra prompt injection
│   │   │   ├── rate-limit.js
│   │   │   └── logging.js
│   │   ├── queue/                     # [NOVO] BullMQ — Fila de digitação + delays
│   │   │   ├── typing-queue.js        # Human-Typing Simulation dispatcher
│   │   │   └── workers/
│   │   │       └── typing-worker.js
│   │   ├── webhooks/                  # [NOVO] /webhooks/elevare listener
│   │   │   └── elevare-hooks.js
│   │   └── api/
│   │       └── routes.js              # Fastify routes
│   ├── tests/
│   │   ├── unit/
│   │   ├── integration/
│   │   ├── e2e/
│   │   └── fixtures/
│   │       └── elevare-postman.json   # [OURO] Postman collection como fixture
│   ├── Dockerfile
│   └── package.json
├── data/
│   ├── scripts/
│   │   ├── ingest-faq.js              # Google Drive → pgvector (Cron 15 dias)
│   │   └── ingest-hotels.js           # CSV 86 hotéis → PostgreSQL
│   └── migrations/
│       └── 001-initial-schema.sql
├── infra/
│   ├── docker-compose.yml             # MVP: Fastify + Supabase (remote) + Redis
│   ├── .env.example
│   └── README-deployment.md
└── docs/
    ├── architecture/
    │   ├── golden-discoveries.md       # [NOVO] As 3 descobertas
    │   ├── elevare-flow.md             # /search → /customers → /quotations
    │   ├── webhook-handling.md
    │   └── typing-queue-system.md
    └── playbooks/
```

---

### **4B: Service Architecture Layers (Refinado com Queue)**

**Decisão:** Fastify + Redis Queue (BullMQ) + Background Worker

**Layers:**

| Layer | Tech | Mudança |
|---|---|---|
| **API Gateway** | Fastify | Express → Fastify (mais rápido, async-native) |
| **Agent Orchestration** | Gemini API | (sem mudança) |
| **Tool Execution** | JavaScript async | (sem mudança) |
| **Knowledge Base** | pgvector (Supabase) | (sem mudança) |
| **Elevare Integration** | /search → /quotations | [NOVO] Fluxo Golden Discovery #2 |
| **Webhook Listener** | POST /webhooks/elevare | [NOVO] Golden Discovery #3 |
| **Response Generation** | OpenAI API | (sem mudança) |
| **Typing Queue (BullMQ)** | Redis + Worker | [NOVO] Calcula delays, dispara typing..., chunking |
| **Session/State** | Redis | Adiciona requestId para isolamento |
| **Analytics** | Sentry | [NOVO] Exception tracking |

**Novo Fluxo com Queue:**

```
[Stella Gera Resposta Longa]
    ↓
[Chunking em Blocos Lógicos]
    ↓
[Job entra em BullMQ]
    ↓
[Background Worker calcula delays]
    ↓
[Worker dispara typing..., aguarda, envia bloco 1, typing..., bloco 2, etc.]
    ↓
[WhatsApp recebe com cadência humanizada]
```

---

### **4C: Data Architecture (Simplificado com Golden Discoveries)**

#### **4C.1 Schema PostgreSQL (Enxuto)**

**Mudança:** Remove tabelas de media/images (Elevare retorna fotos)

```sql
-- Hotels (apenas metadados)
CREATE TABLE hotels (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  region VARCHAR(100),
  experience VARCHAR(100),
  has_api BOOLEAN,
  bradesco_promo DECIMAL,
  petfriendly BOOLEAN,
  pool_heated BOOLEAN,
  data JSONB
);

-- Conversations (histórico)
CREATE TABLE conversations (
  id UUID PRIMARY KEY,
  session_id UUID,
  user_id VARCHAR(255),
  timestamp TIMESTAMP,
  message_text TEXT,
  response_text TEXT,
  hotel_focus VARCHAR(255),
  request_id VARCHAR(255),    -- [NOVO] Token da Elevare
  offer_id VARCHAR(255),      -- [NOVO] Offer token
  handover BOOLEAN,
  resolved BOOLEAN,
  metadata JSONB
);

-- Guest Profiles (Marketing Intelligence)
CREATE TABLE guest_profiles (
  id UUID PRIMARY KEY,
  phone_number VARCHAR(20) UNIQUE,
  email VARCHAR(255),
  name VARCHAR(255),
  travel_history JSONB,
  preferences JSONB,
  special_dates JSONB,
  total_spent DECIMAL,
  anonimized_at TIMESTAMP,    -- [NOVO] LGPD: após 24 meses, anonimiza
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- VectorDB Embeddings (pgvector)
CREATE TABLE faq_embeddings (
  id UUID PRIMARY KEY,
  hotel_id UUID REFERENCES hotels,
  section_title VARCHAR(255),  -- "Piscinas", "Pet-Friendly"
  content TEXT,
  embedding vector(1536),      -- OpenAI embeddings (1536 dims)
  metadata JSONB,              -- {chunk_order: 1, length: 250}
  updated_at TIMESTAMP
);

-- LGPD Compliance
CREATE TABLE data_deletion_requests (
  id UUID PRIMARY KEY,
  guest_id UUID REFERENCES guest_profiles,
  requested_at TIMESTAMP,
  processed_at TIMESTAMP,
  status VARCHAR(50)           -- "pending", "processed", "archived"
);
```

#### **4C.2 VectorDB Strategy**

**Decisão:** pgvector no Supabase (não VectorDB externo)

**Rationale:**
- Supabase já tem pgvector habilitado
- Reduz dependências (não precisa Pinecone/Qdrant)
- FAQ não é massive (86 hotéis × ~5 seções each = ~430 chunks)
- Latência aceitável para MVP (< 100ms query)

**Sincronização de FAQs:**
- **Frequência:** Cron job a cada 15 dias (quinzenalmente)
- **Processo:**
  1. Conecta Google Drive API
  2. Baixa .md de cada hotel
  3. Semantic Chunking (por ## Título)
  4. Gera embeddings (OpenAI API)
  5. Upsert em pgvector
- **Chunking Strategy:** Por seção lógica (## Piscinas, ## Pet-Friendly)

#### **4C.3 Redis Cache Layer**

**Uso específico:**

| Chave | TTL | Conteúdo |
|---|---|---|
| `session:{sessionId}` | 24h | { hotel_focus, language, request_id, offer_id } |
| `request:{requestId}` | 30min | { photo_url, roomType, price, offer_id } |
| `typing_job:{jobId}` | 5min | Status da fila de digitação |
| `rate_limit:{userId}` | 1h | Contadores de requisição |

---

### **4D: API Integrations (Golden Discovery #2 — O Fluxo)**

#### **4D.1 Elevare Integration Flow**

**Fluxo Exato (validado no Postman):**

```javascript
// STEP 1: /search (busca vagas + fotos)
GET /search?region=praia&experience=romantica
Response: {
  requestId: "req_abc123xyz",    // Token único da transação
  results: [
    {
      roomId: "room_001",
      offerId: "offer_001",
      photo: "https://elevare.s3.../suite-standard.jpg",
      roomType: "Suíte Standard",
      price: 1250,
      currency: "BRL"
    },
    { ... }
  ]
}

// STEP 2: /customers (registra/atualiza hóspede)
POST /customers
Body: {
  name: "João Silva",
  email: "joao@email.com",
  phone: "+55 11 98765-4321",
  customerId: "cust_001"  // ou undefined se novo
}
Response: { customerId: "cust_001" }

// STEP 3: /quotations (gera link de pagamento)
POST /quotations
Body: {
  requestId: "req_abc123xyz",    // [OURO] Token da /search
  offerId: "offer_001",           // [OURO] Offer da /search
  customerId: "cust_001",
  checkIn: "2026-04-15",
  checkOut: "2026-04-18"
}
Response: {
  quotationId: "quot_xyz789",
  paymentLink: "https://elevare.pay/quot_xyz789",
  expiresAt: "2026-04-02T18:00:00Z"
}
```

**Implementação em Backend:**

```javascript
// src/integrations/elevare.js
class ElevareClient {
  async searchHotels(params) {
    const response = await fetch(API_URL + '/search', { params });
    const { requestId, results } = await response.json();
    // Salva requestId em Redis por 30min
    await redis.setex(`request:${requestId}`, 1800, JSON.stringify(results));
    return { requestId, results };
  }

  async registerCustomer(guestData) {
    return await fetch(API_URL + '/customers', {
      method: 'POST',
      body: JSON.stringify(guestData)
    });
  }

  async generateQuotation(requestId, offerId, customerId, dates) {
    // requestId vem do cache Redis (isolado, nunca exposto)
    return await fetch(API_URL + '/quotations', {
      method: 'POST',
      body: JSON.stringify({ requestId, offerId, customerId, ...dates })
    });
  }
}
```

#### **4D.2 Webhook Listener (Golden Discovery #3)**

**Novo endpoint:** POST `/webhooks/elevare`

**Eventos escutados:**

| Evento | Ação Stella |
|---|---|
| `quote_created` | Nada (cliente já tem link) |
| `quote_expiring` | Notifica hóspede: "Seu link expira em 1h" |
| `reservation_confirmed` | Congrats message + próximos passos |
| `payment_failed` | Notifica erro; oferece retry |
| `customer_note_added` | Concierge adicionou nota; Stella mostra ao hóspede |

**Implementação:**

```javascript
// src/webhooks/elevare-hooks.js
app.post('/webhooks/elevare', async (req, res) => {
  const { event, data } = req.body;
  
  switch(event) {
    case 'quote_expiring':
      await stella.notifyExpiring(data.customerId, data.expiresAt);
      break;
    case 'reservation_confirmed':
      await stella.celebrateBooking(data.customerId, data.reservationId);
      break;
    case 'payment_failed':
      await stella.handlePaymentFailure(data.customerId, data.reason);
      break;
  }
  
  res.status(200).json({ received: true });
});
```

#### **4D.3 Outras APIs**

| API | Propósito | Crítica? |
|---|---|---|
| **Google Drive API** | Sincronização FAQ (cron 15 dias) | Média |
| **WhatsApp Business API** | Mensagens + typing events | ✅ Sim |
| **Gemini API** | Orquestração | ✅ Sim |
| **OpenAI API** | Geração de respostas | ✅ Sim |
| **Chatwoot API** | Escalação para humano | ✅ Sim |
| **Sentry API** | Exception tracking | Média |

---

### **4E: Testing Requirements (com Postman Fixture)**

**Estratégia:** Full Pyramid com fixtures do Postman real

| Nível | Exemplos | Fixture |
|---|---|---|
| **Unit** | Chunking logic, delay math, prompt sanitization | (gerado em testes) |
| **Integration** | Tool execution, RAG queries, /search → /quotations flow | **Postman collection JSON** |
| **E2E** | Full conversation: greeting → search → quotation → webhook | Mock Elevare (Postman) |

**Fixture de Ouro:**

```javascript
// tests/fixtures/elevare-postman.json
// [Salvar o Postman collection real do usuário]
// Usado para: mockar respostas da API sem chamar servidor real
```

**Exemplo de teste:**

```javascript
// tests/integration/elevare-flow.test.js
const FIXTURE = require('../fixtures/elevare-postman.json');

test('search → customers → quotations flow', async () => {
  // Mock Elevare com respostas reais do Postman
  nock(ELEVARE_URL)
    .get('/search')
    .reply(200, FIXTURE.responses.search)
    .post('/customers')
    .reply(200, FIXTURE.responses.customers)
    .post('/quotations')
    .reply(200, FIXTURE.responses.quotations);
  
  // Executa fluxo
  const result = await elevareClient.completeFlow(params);
  
  // Valida parsing de imagens, valores, IDs
  expect(result.quotation.paymentLink).toBeDefined();
  expect(result.quotation.expiresAt).toBeDefined();
});
```

---

### **4F: CI/CD Pipeline (Novo)**

**Tool:** GitHub Actions

**Stages:**

1. **Test Stage:**
   - `npm run test:unit` (80%+ coverage)
   - `npm run test:integration` (Postman fixtures)
   - `npm run lint` (ESLint)

2. **Build Stage:**
   - `docker build -t circuito-elegante-stella:latest .`
   - Push to Docker Hub (ou GitHub Container Registry)

3. **Deploy Stage:**
   - Deploy to Digital Ocean (via Docker Compose)
   - Health check (GET `/health`)
   - Smoke tests (basic conversation flow)

**Secrets Management:**
- GitHub Secrets: ELEVARE_API_KEY, OPENAI_KEY, GEMINI_KEY, etc.
- Injetadas em Docker build como ENV vars

---

### **4G: Monitoring & Observability (Com Sentry)**

**Tool:** Sentry + Discord/Slack webhooks

**Alerts Críticos:**

| Condição | Action |
|---|---|
| Elevare API latência > 8s | Alert Discord + FR20 (fallback elegante) |
| Elevare HTTP 5xx | Sentry capture + escalate para Chatwoot |
| Rate limit atingido | Throttle requests, notificar equipe |
| Webhook inválido | Log + manual review |
| Prompt injection detectada | Block request + log Sentry |

**Dashboard:**
- Response time por endpoint
- Error rate (Gemini, OpenAI, Elevare)
- Queue depth (BullMQ)
- Conversion funnel (search → quotation → payment)

---

### **4H: Security & Compliance (Sanitização + Isolamento)**

#### **4H.1 Prompt Injection Defense**

**Middleware novo:** `src/middleware/sanitize.js`

```javascript
const sanitizePrompt = (input) => {
  // Remove caracteres suspeitos
  // Valida comprimento (max 500 chars)
  // Detecta patterns de injection (system:, ignore all:, etc.)
  // Bloqueia URLs (evita exfiltração)
};
```

#### **4H.2 requestId Isolation (Golden Discovery #2)**

**Garantia:** requestId **nunca** é enviado via WhatsApp

```
Frontend (WhatsApp): "Quero a segunda opção"
Backend (Redis): request:req_abc123xyz = [{ offerId, photo, etc. }]
Backend (Elevare): POST /quotations com requestId (interno, seguro)
Hóspede nunca vê: requestId, offerId, ou IDs técnicos
```

#### **4H.3 LGPD Compliance (24 meses + anonimização)**

**Implementação:**

```javascript
// Cron job (mensal)
SELECT * FROM guest_profiles 
WHERE created_at < NOW() - INTERVAL '24 months'
UPDATE guest_profiles SET name = NULL, phone_number = NULL WHERE id = X
// Mantém preferences + travel_history para analytics (anonimizado)
```

---

### **4I: Deployment & Infrastructure (Docker Compose MVP)**

**Decisão:** Docker Compose + Supabase (gerenciado) + Digital Ocean

**Stack:**

```yaml
services:
  app:
    image: circuito-elegante-stella:latest
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://...  # Supabase
      - REDIS_URL=redis://redis:6379
      - OPENAI_KEY=${OPENAI_KEY}
      - GEMINI_KEY=${GEMINI_KEY}
    depends_on:
      - redis
      - db (external: Supabase)

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  worker:
    # Background worker para BullMQ (typing queue)
    image: circuito-elegante-stella:latest
    command: "npm run worker"
    depends_on:
      - redis

volumes:
  redis_data:
```

**Deployment na Digital Ocean:**
- 1x App Server (1 CPU, 2GB RAM — suficiente para 1.500 msg/mês)
- 1x Redis (managed, optional — pode usar Cloud Redis)
- 1x Database (Supabase — gerenciado)
- Cloudflare CDN (cache estático)

**Backups & Disaster Recovery:**
- Supabase: Backups automáticos diários
- RTO (Recovery Time Objective): 1h
- RPO (Recovery Point Objective): 24h

---

## 15. Summary: Golden Discoveries Impact

| Descoberta | Antes | Depois | Ganho |
|---|---|---|---|
| **#1: Assets da API** | Tabelas gigantes de fotos | API retorna URL diretamente | -50% storage, +10% speed |
| **#2: requestId Flow** | Mapping complexo de IDs | /search → /quotations simples | -30% latência, +security |
| **#3: Webhooks** | Cron polling pesado | Event-driven (webhook) | -70% CPU, real-time |

---

## 16. Next Steps

### Immediate Actions (Antes de PRD)

1. **Validar Open Questions** — Stakeholder alignment on latency, budget, hosting
2. **Confirmar Dados** — CSV está completo? Há FAQs em Markdown para os hotéis?
3. **Definir Personas de LLM** — Gemini para orquestração, OpenAI para diálogo? Confirmar custos
4. **Planning Session** — Mapear tarefas de Data Ingestion, VectorDB setup, Tool definitions

### PM Handoff to PRD

Uma vez validado este Project Brief, procederemos com:

1. **Create PRD** — Estruturar requisitos formais (FR, NFR, epics, stories)
2. **Architect Review** — Design técnico detalhado (schema, fluxos, deploy)
3. **Dev Roadmap** — Epic breakdown e estimativas
4. **Launch Phase 1** — Orquestrador + Diálogo + Dados Híbridos (MVP)

---

**Status:** Aguardando validação e preenchimento de Open Questions  
**Próximo Passo:** Você quer que eu clarifique alguma seção ou vamos validar as Open Questions com stakeholders?
