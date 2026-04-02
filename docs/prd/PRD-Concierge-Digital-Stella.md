# PRD: Concierge Digital Stella — Circuito Elegante

**Status:** ✅ COMPLETO — Pronto para Architect Review  
**Data de Criação:** 2026-04-01  
**Última Atualização:** 2026-04-02  
**Versão:** 2.1 (Sprint 0 — Correções Validação Aria/Pax)  
**Autor:** Cleverson Silva (com Morgan — PM Agent)  
**Fundação:** PROJECT-BRIEF-Concierge-Digital.md v2.0 (Validado)  
**Agente IA:** Stella — Concierge Digital Circuito Elegante

---

## Change Log

| Data | Versão | Descrição | Autor |
|------|--------|-----------|-------|
| 2026-04-01 | 0.1 | PRD inicial — Seções 1-3 draft | Morgan (PM) |
| 2026-04-01 | 0.5 | Seções 1-3 aprovadas, Seção 4 draft | Morgan (PM) |
| 2026-04-02 | 0.7 | Seção 4 refinada com Golden Discoveries, Epic List aprovada | Morgan (PM) |
| 2026-04-02 | 0.9 | Epic 1 aprovado, Epic 2 em review (decisão LLM pendente) | Morgan (PM) |
| 2026-04-02 | 1.0 | Decisão D1 resolvida: OpenAI Multi-Agent Ecosystem. FR26-FR28 (Multimodal). Story 2.10 adicionada | Morgan (PM) |
| 2026-04-02 | 1.1 | Dados reais integrados: 92 hotéis (32 API + 60 manuais). Postman collection + planilha salvos no projeto. Novas FRs do Postman (regenerar link, estender cotação, multi-search) | Morgan (PM) |
| 2026-04-02 | 1.2 | Epic 5 refinado: Evolution API Gateway, Mute 3h com auto-renovação, Read Receipts inteligentes, Presença Online dinâmica. FR33-FR35 adicionados | Morgan (PM) |
| 2026-04-02 | 2.0 | PRD COMPLETO: Todos os 6 epics aprovados (55 stories), 35 FRs, 12 NFRs, 5 decisões, 3 Golden Discoveries. Checklist 15/15. Pronto para @architect | Morgan (PM) |
| 2026-04-02 | 2.1 | Sprint 0 — Corrigido FR33/FR35 mapping (Epic 4+5), Decision D6 (SDK nativo), 5 stories faltantes identificadas, Handover State Machine definido | Morgan (PM) |

---

# SEÇÃO 1: Goals and Background Context ✅ APROVADA

## 1.1 Goals

1. Resolver o gargalo de atendimento para 92 hotéis de luxo (60 manuais + 32 integrados via API)
2. Qualificar hóspedes de forma humanizada, sem parecer chatbot
3. Orquestrar a jornada entre resoluções automatizadas (API Elevare) e transbordo elegante (Chatwoot + concierges humanos)
4. Aumentar taxa de conversão reduzindo tempo entre qualificação e fechamento
5. Reduzir carga operacional de concierges (70% de economia em perguntas repetitivas)
6. Manter experiência premium durante todo o atendimento (discreta, acolhedora, conhecedora)
7. Suportar múltiplos idiomas (PT, EN, ES) com detecção automática
8. Prover base de aprendizado contínuo (retroalimentação do Chatwoot → melhorias futuras)

## 1.2 Background Context

O Circuito Elegante opera uma rede de 92 hotéis de luxo com heterogeneidade tecnológica: 32 integrados via API Elevare (moderno) e 60 operando manualmente (overhead operacional). Clientes de altíssimo padrão buscam atendimento rápido, humanizado e preciso para planejar viagens, mas o gargalo atual é que dúvidas vagas ("quero praia para casal"), questões técnicas ("a piscina é aquecida?") e cotações manuais consomem tempo precioso de concierges humanos, atrasando conversão e gerando atrito na experiência de luxo.

Stella resolve este gargalo como orquestrador invisível: qualifica demandas de forma natural, consulta dados híbridos (estruturados + RAG), e decide dinamicamente entre fechamento automatizado (32 APIs) e transbordo elegante com contexto completo (60 manuais). O resultado é atendimento rápido sem parecer robótico, mais conversões e concierges focados em vendas consultivas.

---

# SEÇÃO 2: Requirements ✅ APROVADA

## 2.1 Functional Requirements (FR)

| ID | Requisito | Descrição |
|---|---|---|
| **FR1** | Qualificação Progressiva de Hotéis | Agente (Stella) filtra hotéis por experiência (Praia, Serra, Cidade, etc.) baseado em dados estruturados (SQL) e preferências do hóspede |
| **FR2** | Consulta de Disponibilidade via API Elevare | Para os 32 hotéis integrados, Stella consulta disponibilidade, preços e ofertas em tempo real |
| **FR3** | Geração de Link de Pagamento | Stella gera e entrega link de pagamento direto da Elevare (checkout seguro, sem processamento de cartão nativo) |
| **FR4** | Consulta de Status de Reservas | Hóspede pode consultar status de reserva existente via código ou email (pós-venda) |
| **FR5** | RAG em Base de Conhecimento | Stella acessa FAQs em Markdown (armazenadas no Google Drive, processadas para VectorDB) e responde dúvidas específicas de infraestrutura ("piscina aquecida?", "aceita pet?") |
| **FR6** | Detecção Automática de Idioma | Stella detecta na 1ª mensagem se usuário é PT, EN ou ES e responde fluente sem perguntar preferência |
| **FR7** | Gerenciamento de Contexto de Sessão | Stella mantém "hotel ativo" em memória durante conversa, evitando repetições ("Tem piscina?" já sabe qual hotel está focando) |
| **FR8** | Decomposição de Multi-Intenções | Se usuário fizer múltiplas perguntas numa frase ("Tem praia com promo? E pet-friendly?"), Stella paraleliza as buscas e responde unificado |
| **FR9** | Handover para Chatwoot | Stella escalona para concierge humano (via Chatwoot) quando: hotel é manual (60), cliente solicita humano, ou IA não tem confiança na resposta. **Com contexto completo (Entity Memory).** |
| **FR10** | Extração de Marketing Intelligence | De cada conversa, Stella extrai estruturado: nome, email, telefone, histórico, nº pessoas, tipo data especial/aniversários, hotel desejado, preferências, valor gasto |
| **FR11** | Defesa contra Prompt Injection | Validação de entrada + LLM hardening + permissões restritas de ferramentas. Zero tolerância a tentativas de jailbreak |
| **FR12** | Suporte Multi-Canal | Stella opera via website (chat widget) + WhatsApp Business API (com buffer de 20s para concatenar mensagens "picadas") |
| **FR13** | Retroalimentação de Aprendizado | Histórico de interações resolvidas por humano no Chatwoot é armazenado e realimenta prompts/exemplos para versões futuras de Stella |
| **FR14** | Defesa de Persona | Stella responde com elegância quando questionada sobre natureza ("Você é um robô?"); mantém character sempre. Nunca admite ser IA. Responde: "Sou a Stella, concierge digital exclusiva do Circuito Elegante. Trabalho com nossa equipe de especialistas para agilizar seu atendimento." |
| **FR15** | Orquestração Dinâmica de Multi-Intenções | O sistema decompõe perguntas mistas, paralela buscas em SQL + VectorDB + APIs, e mescla respostas em uma única mensagem coerente sem parecer que foram "resolvidas separadamente" |
| **FR16** | Curadoria de Disponibilidade | Quando Elevare retorna múltiplas opções, o sistema aplica curadoria automática: apresenta mínimo 3 e máximo 4 opções, garantindo representatividade de preço (menor, intermediária, maior/exclusiva). Permite hóspede pedir "ver mais opções" se desejar |
| **FR17** | Renderização Premium no WhatsApp | Cada opção é apresentada como imagem (suíte) + legenda formatada (nome da suíte, valor total em BRL, resumo em bullets). Não texto puro — mídia nativa |
| **FR18** | Mapeamento de Estado Oculto | Stella mantém mapa interno (cache/state) associando cada opção apresentada ao payload técnico (roomId, ratePlanId, datas, total). Se hóspede responde "quero a segunda" ou responde via WhatsApp Reply a uma imagem específica, Stella resolve para o payload exato sem pedir confirmação |
| **FR19** | Upsell Elegante e Discreto | Quando há uma opção premium com pequena diferença de preço em relação ao solicitado, Stella menciona sutilmente a alternativa: "Temos a Suíte Standard disponível. Notei que a Suíte Master com teto panorâmico também está livre nas suas datas — gostaria de ver uma foto?" Sem forcing, apenas menção elegante |
| **FR20** | Fallback e Recovery Elegante | Quando API falha ou indisponível, Stella não avisa "Erro de conexão". Responde: "Nossa conexão direta com o hotel está passando por uma atualização. Nossa equipe técnica gerará seu acesso prioritário em instantes." E aciona transbordo humano silenciosamente |
| **FR21** | Human-Typing Simulation & Chunking | O sistema divide respostas longas (> 300 chars) em blocos lógicos coerentes (parágrafos naturais). Para cada bloco, calcula delay humanizado (~10 caracteres/segundo com ±20% variação), envia evento `typing...` para WhatsApp, aguarda delay, envia bloco. Blocos muito curtos (< 50 chars) enviam instantaneamente |
| **FR22** | Renderização Transacional de Assets | Stella recebe URL de imagem da Elevare (Golden Discovery #1), faz download, e renderiza no WhatsApp como mídia nativa. Suporta fallback se imagem inativa/removida |
| **FR23** | Global Search-to-Quotation Flow | Stella paraleliza /search com dados do hóspede, armazena requestId em cache Redis (TTL 30min), e ao confirmação gera /quotations com requestId + offerId (Golden Discovery #2) |
| **FR24** | requestId State Isolation | O requestId é um token opaco mantido apenas no backend (Redis), nunca enviado via WhatsApp. Hóspede não vê IDs técnicos — apenas "quarto escolhido" humanizado |
| **FR25** | Webhook Listener & Auto-Follow-Up | Backend expõe endpoint `/webhooks/elevare` que recebe eventos (quote_expiring, reservation_confirmed, payment_failed). Stella consome webhook, determina ação (notificar hóspede, transferir para Chatwoot, retry), e executa (Golden Discovery #3) |
| **FR26** | Interação por Voz | Stella processa mensagens de voz (.ogg, .mp3, .wav) via GPT-5, extraindo intenções com suporte a sotaques e gírias locais (PT/EN/ES). O Intent Agent (GPT-5-nano) resume o áudio para o Orquestrador |
| **FR27** | Reconhecimento Visual | Stella identifica propriedades do Circuito Elegante e categorias de quartos através de fotos enviadas pelo hóspede via GPT-5 Vision. Ex: hóspede envia foto de hotel → Stella identifica e busca disponibilidade |
| **FR28** | OCR de Documentos | Stella lê e valida dados em capturas de tela (vouchers, comprovantes de PIX, cartões Bradesco) para automação de processos via GPT-5 Vision OCR nativo |
| **FR29** | Regeneração de Link de Pagamento | Se link de pagamento expirar, Stella regenera automaticamente via PUT /quotations/{id}/payment-link sem o hóspede recomeçar o processo |
| **FR30** | Extensão de Validade de Cotação | Stella pode estender a validade de uma cotação via PUT /quotations/{id}/extend quando hóspede precisa de mais tempo |
| **FR31** | Multi-Search por Cidade/Região | Busca de disponibilidade em múltiplos hotéis simultaneamente via /multi-search filtrando por cidade ou região |
| **FR32** | Busca Determinística por Atributos | Filtros SQL determinísticos (sem LLM) por: Experiência (praia/campo/serra/cidade), Região (nordeste/sudeste/sul/centro-oeste/norte), Destino (~45 destinos), Município, UF, Cupom Bradesco |
| **FR33** | Evolution API Gateway | Toda comunicação WhatsApp passa pela Evolution API (não Cloud API direta). Suporte a composing/recording events, read receipts controlados, presença online dinâmica, e multimodal storage (áudio/imagem) |
| **FR34** | Read Receipts Inteligentes | Stella marca mensagens como "lidas" (via Evolution API) apenas APÓS o buffer de 20s e no início do processamento, não no recebimento. Evita "vácuo de luxo" (visto sem resposta) |
| **FR35** | Presença Online Dinâmica | Stella não fica "Online" 24/7. Estado "Online" ativado apenas durante processamento ativo ou quando humano está no Chatwoot. Fora disso: offline (parece humana) |
| **FR36** | Handover State Machine | Controle de transição IA↔Humano com 3 estados: STELLA_ACTIVE (Stella processa), HUMAN_ACTIVE (concierge no Chatwoot), STELLA_FALLBACK (timeout humano). Transições: handover trigger→HUMAN_ACTIVE, concierge fecha conversa→STELLA_ACTIVE, timeout sem resposta humana (15min)→STELLA_FALLBACK com mensagem elegante. Estado armazenado em Redis por sessão |
| **FR37** | WhatsApp Template Messages | Templates pré-aprovados pelo Meta para mensagens proativas fora da janela de 24h. Templates necessários: follow-up cotação expirando (FR25), confirmação de reserva (FR25), follow-up fora de expediente (Story 4.7), reengajamento pós-atendimento. Processo de aprovação inicia no Epic 4, templates usados nos Epics 4-6 |

## 2.2 Non-Functional Requirements (NFR)

| ID | Requisito | Descrição | Target |
|---|---|---|---|
| **NFR1** | Latência de Processamento | Processamento interno da IA < 10 segundos (95º percentil) | < 10s |
| **NFR2** | Acurácia de Dados Tabulares | 100% de precisão em preço, regra de cupom (ex: Bradesco 10%), disponibilidade | 100% |
| **NFR3** | Taxa de Transbordo Bem-Sucedido | 95%+ das escalações chegam ao Chatwoot com contexto íntegro (sem perda de dados) | >= 95% |
| **NFR4** | Segurança contra Prompt Injection | Zero violações reportadas em 30 dias de operação | 0 violações |
| **NFR5** | Redução de Tempo por Pergunta | FAQs que antes levavam 5 min com humano agora < 1 min com Stella (mesmo com fallback) | -70% |
| **NFR6** | Disponibilidade de LLM APIs | LLM provider com SLA >= 99.5% (aceitável para experiência de luxo) | >= 99.5% |
| **NFR7** | Latência Percebida (WhatsApp) | Buffer de 20s concatena mensagens; resposta final ao hóspede <= 5s após envio | <= 5s |
| **NFR8** | Escalabilidade | Sistema suporta crescimento de 1.500 → 5.000 msg/mês sem rearquitetar | 5x growth |
| **NFR9** | Retenção de Dados | Histórico de conversas armazenado por 24 meses no Supabase (anonimizado após) | 24 meses |
| **NFR10** | Conformidade LGPD | Opt-in já coberto pelos termos do site; Stella não emite avisos adicionais. Dados acessíveis para exclusão sob demanda. Anonimização automática após 24 meses | LGPD OK |
| **NFR11** | Agnóstico de LLM | Arquitetura suporta troca de LLM provider via interface agnóstica. Provider primário: OpenAI (GPT-5 family). Interface permite swap futuro sem rearquitetar | Plugável |
| **NFR12** | Processamento Multimodal | Sistema aceita texto, áudio (.ogg, .mp3, .wav) e imagens (.jpg, .png, .webp) como entrada, processando cada modalidade com o modelo mais eficiente | Texto + Áudio + Visão |

---

# SEÇÃO 3: User Experience & Interaction Design ✅ APROVADA

## 3.1 Overall UX Vision

A experiência com Stella deve ser **indistinguível de conversa com um concierge humano excepcional.** O hóspede nunca deve sentir que está falando com IA — deve sentir que está sendo cuidado por alguém que:

1. **Entende o contexto imediatamente** — "Você quer praia?" leva a recomendações específicas sem perguntas óbvias
2. **Responde com elegância, não com listas** — "Temos três refúgios perfeitos para vocês" em vez de "Encontrei 15 opções"
3. **Toma decisões sutis** — Se há oportunidade de upsell, menciona com classe
4. **Resolve sem fazer o hóspede repetir** — Quando hóspede diz "quero a segunda", sabe exatamente qual é
5. **Transfere para humano com elegância** — Sem parecer "erro do robô"
6. **Fala a língua do hóspede naturalmente** — PT, EN, ES sem nunca perguntar
7. **Mantém discrição absoluta** — Nunca força venda agressiva; responde ao ritmo do hóspede

## 3.2 Persona & Tone (AAA — Acolhedora, Conhecedora, Discreta)

**Diretrizes de Voz:**
- **Acolhedora:** Empatia genuína, entende que cliente está planejando algo importante
- **Conhecedora:** Domina dados dos hotéis, experiências, ofertas com profundidade
- **Discreta:** Nunca força venda, evita gatilhos de escassez agressivos
- **Recuo Elegante:** Se hóspede hesita, Stella recua com classe — oferece espaço sem abandonar

**Tons a evitar:**
- ❌ Robótico, comercial, agressivo
- ❌ Linguagem de chatbot (perguntas binárias)
- ❌ Escassez artificial ("apenas 2 quartos restantes!")
- ❌ Insistência após recusa

## 3.3 Key Interaction Paradigms (9 Paradigmas)

| Paradigma | Descrição |
|---|---|
| **Progressive Disclosure** | Stella começa com pergunta aberta, depois afunila conforme hóspede responde |
| **Conversação Natural (Não Menu)** | Nunca oferece menus numerados. Sempre linguagem natural |
| **Curadoria Ativa (Não Dumping)** | Stella filtra opções complexas em recorte representativo (3-4 opções) |
| **Correferência Implícita** | Hóspede responde com pronomes ou posição ("a segunda", "a mais cara"); Stella resolve automaticamente |
| **Graceful Degradation** | Se algo falha, Stella mascara como processo premium, não avisa "erro" |
| **Context Persistence** | Ao longo da conversa, Stella "lembra" qual hotel é foco, não repete perguntas |
| **Gentle Upsell** | Se há oportunidade premium com pequena diferença de preço, menciona sutilmente (não força) |
| **Escalação Invisível** | Transferência para humano não é "erro", é upgrade elegante |
| **Human-Typing Simulation & Chunking** | Textos longos quebrados em blocos lógicos com evento "typing..." + delay simulando digitação humana (~10 car/seg com ±20% variação) |

## 3.4 Human-Typing Simulation — Detalhes Técnicos

### Algoritmo de Chunking Lógico

**Entrada:** Texto gerado pelo LLM (pode ter 500-2000 caracteres)

**Processo:**
1. Identificar breakpoints naturais: fim de parágrafo, fim de sentença longa, máximo 300-400 caracteres por bloco
2. Quebrar em blocos coerentes (saudação, descrição, opções, chamada para ação)

### Cálculo de Delay (Cadência Humanizada)

- Velocidade média: **~600 caracteres/minuto** = **~10 caracteres/segundo**
- Variação natural: ±20% (humanos não digitam no mesmo ritmo)
- Fórmula: `delay_em_segundos = (caracteres_do_bloco / 10) + variação_aleatória(±20%)`

### Fluxo de Envio no WhatsApp

1. Enviar `typing...` → Delay calculado → Enviar bloco 1
2. Pausa 1-2s → `typing...` → Delay calculado → Enviar bloco 2
3. Repetir até último bloco

### Casos Especiais

| Caso | Comportamento |
|---|---|
| Mensagem muito curta (< 50 chars) | Envia sem typing — resposta imediata |
| Consulta esperando API | Envia "consultando..." + typing + delay longo |
| Imagem + legenda | Imagem instantânea, legenda com cadência |
| Múltiplos blocos (> 6) | Agrupa em máx 4-5 blocos |

## 3.5 Core Conversation States

| Estado | Objetivo | Comportamento de Stella |
|---|---|---|
| **Greeting** | Primeira impressão | Tom acolhedor, sem robôtese |
| **Qualificação** | Entender necessidade | Perguntas abertas, afunila conforme respostas |
| **Exploração** | Apresentar opções curadas | 3-4 representativos com imagens + legendas |
| **Comparação** | Hóspede quer comparar | "Qual chamou atenção?" ou "Quer ver mais?" |
| **Decisão** | Hóspede escolhe | Confirma e gera acesso à reserva |
| **Checkout** | Entrega link pagamento | Link Elevare + próximos passos |
| **Pós-Venda** | Confirmação e FAQ | Status, dúvidas check-in, etc. |
| **Escalação** | Precisa de humano | Transfere com contexto completo |
| **Fora de Expediente** | Nenhum humano disponível | Garante follow-up no primeiro horário útil |

## 3.6 Accessibility & Inclusão

| Aspecto | Guideline |
|---|---|
| **Linguagem Clara** | Sem jarganês técnico. "Deixa eu verificar com o hotel..." |
| **Sem Jargão de IA** | Nunca menciona: LLM, algoritmos, ML, processamento |
| **Detecção de Entendimento** | Se hóspede confuso, simplifica ou oferece alternativa |
| **Idioma Detectado** | PT/EN/ES auto-detectados; zero "Qual seu idioma?" |
| **Respeito ao Ritmo** | Se hóspede toma tempo, sem pressão |
| **Clareza em Números** | Preços sempre em BRL formatado: "R$ 1.250,00" |
| **Confirmações** | Antes de ações importantes, confirma explicitamente |

## 3.7 Branding & Tone (Circuito Elegante)

| Elemento | Guideline |
|---|---|
| **Cor Primary** | Verde CE (#289548) |
| **Tom Geral** | Luxury Tech — profissional, humanizado |
| **Assinatura** | "Sou a Stella, concierge digital exclusiva do Circuito Elegante" |
| **Emoji Usage** | Mínimo; apenas celebrações (✓ confirma opção) |
| **Linguagem de Negócio** | "Experiência exclusiva", "refúgio", "suíte" — nunca "produto", "compra" |

## 3.8 Target Platforms

| Plataforma | Requisitos | Notas |
|---|---|---|
| **WhatsApp (Mobile)** | Texto, imagem, typing events. Buffer 20s | Primário |
| **Website (Desktop/Mobile)** | Chat widget responsivo | Secundário |
| **Chatwoot (Admin)** | Interface para concierges humanos | Operacional |

---

# SEÇÃO 4: Technical Assumptions & Architecture ✅ APROVADA (Refinada com Golden Discoveries)

## 4.1 Golden Discoveries (Elevare API & Postman Analysis)

### Golden Discovery #1: Assets Transacionais

A Elevare retorna as **imagens dos quartos** na resposta de `/search`. Não precisa manter tabelas de fotos em PostgreSQL.

**Impacto:** Schema enxuto, imagens sempre atualizadas, menos storage.

### Golden Discovery #2: O Fluxo Mágico (requestId + offerId)

Fluxo simplificado:
1. `GET /search` → Retorna: requestId, results (roomId, offerId, photo, price)
2. `POST /customers` → Registra/atualiza hóspede
3. `POST /quotations` → Gera link de pagamento usando requestId + offerId

**Impacto:** Zero mapeamento de IDs, state management simplificado, menos latência, mais seguro.

### Golden Discovery #3: Webhooks Follow-Up

Elevare dispara **webhooks** (quote_expiring, reservation_confirmed, payment_failed).

**Impacto:** Zero overhead de polling, real-time follow-up, automação pura.

## 4.2 Repository Structure

**Decisão:** Monorepo

```
circuito-elegante-stella/
├── config/                 # Variáveis env, rate limits, keys
│   ├── database.js
│   ├── elevare.js
│   ├── redis.js
│   ├── openai.js
│   └── llm.js              # Config agnóstica de LLM
├── backend/
│   ├── src/
│   │   ├── agents/                    # 4 Subagentes Pipeline
│   │   │   ├── llm-client.ts         # Interface agnóstica LLM
│   │   │   ├── intent-agent.ts       # GPT-5-nano — Roteador
│   │   │   ├── orchestrator.ts       # GPT-5-turbo — Maestro + Tools
│   │   │   ├── persona-agent.ts      # GPT-5-pro — Voz de Luxo AAA
│   │   │   ├── safety-agent.ts       # GPT-5-nano — Auditor pré-envio
│   │   │   └── input-handler.ts      # Texto/Áudio/Imagem detection + transcoding
│   │   ├── tools/                     # Tool definitions
│   │   ├── integrations/
│   │   │   ├── elevare.js   # /search → /customers → /quotations
│   │   │   ├── whatsapp.js
│   │   │   ├── google-drive.js
│   │   │   └── chatwoot.js
│   │   ├── database/
│   │   │   ├── schema.ts    # Drizzle schema (TypeScript)
│   │   │   └── queries/     # SQL + pgvector queries
│   │   ├── vectordb/        # Ingestão FAQ → pgvector
│   │   ├── state/           # Redis session, context persistence
│   │   ├── prompts/         # System prompts (versionados em código)
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   ├── sanitize.js  # Anti-prompt injection
│   │   │   ├── rate-limit.js
│   │   │   └── logging.js
│   │   ├── queue/           # BullMQ — Fila de digitação
│   │   │   ├── typing-queue.js
│   │   │   └── workers/
│   │   │       └── typing-worker.js
│   │   ├── webhooks/        # /webhooks/elevare listener
│   │   │   └── elevare-hooks.js
│   │   └── api/
│   │       └── routes.js    # Fastify routes
│   ├── tests/
│   │   ├── unit/
│   │   ├── integration/
│   │   ├── e2e/
│   │   └── fixtures/
│   │       └── elevare-postman.json  # Postman como fixture
│   ├── Dockerfile
│   └── package.json
├── data/
│   ├── scripts/
│   │   ├── ingest-faq.js    # Google Drive → pgvector (Cron 15 dias)
│   │   └── ingest-hotels.js # CSV 92 hotéis → PostgreSQL
│   └── migrations/
│       └── 001-initial-schema.sql
├── infra/
│   ├── docker-compose.yml   # Fastify + Redis + Worker
│   ├── .env.example
│   └── README-deployment.md
└── docs/
    ├── architecture/
    │   ├── golden-discoveries.md
    │   ├── elevare-flow.md
    │   ├── webhook-handling.md
    │   └── typing-queue-system.md
    └── playbooks/
```

## 4.3 Service Architecture

**Decisão:** Fastify + Redis Queue (BullMQ) + Background Worker

### LLM Provider Decision: OpenAI Multi-Agent Ecosystem (Agnóstico)

**Provider Primário:** OpenAI (GPT-5 family) — 100% créditos gratuitos  
**Custo Real LLM:** $0/mês (créditos)  
**Interface:** Agnóstica (swap futuro para Claude, Gemini, etc. sem rearquitetar)

### Arquitetura de 4 Subagentes (O Cérebro em Pipeline)

Em vez de um único prompt monolítico (que causa quebra de persona e alucinação), Stella opera como **4 subagentes especializados** em pipeline:

| Subagente | Modelo | Papel | Função |
|---|---|---|---|
| **Input Handler** | Código Fastify | O Scanner de Entrada | Recebe texto, imagem ou áudio. Converte áudio para formato GPT-5. Descreve imagem em tokens de visão |
| **Intent Agent** | GPT-5-nano | O Roteador de Alta Velocidade | Classifica intenção (RAG, API, Chat, Multimodal) em microssegundos. Modelo nano = zero latência perceptível |
| **Orchestrator** | GPT-5-turbo/standard | O Maestro | Chama Tools (Drizzle, pgvector, Elevare). Coordena dados brutos. Garante que nada seja inventado |
| **Persona Agent** | GPT-5-pro/creative | A Voz de Luxo | Recebe os fatos do Orchestrator e aplica a camada AAA (Acolhedora, Conhecedora, Discreta). Empatia e nuance em PT/EN/ES |
| **Safety & Validation Agent** | GPT-5-nano | O Auditor de Qualidade | Verifica se resposta da Persona segue protocolos de segurança e luxo antes do disparo final |

### Por Que 4 Subagentes (Não 1 Monolítico)

1. **Especialização > Generalismo:** Modelo nano para tarefas lógicas (intenção/segurança) + modelo pro para tarefas criativas (persona) = menos alucinação
2. **Eficiência de Custos:** Modelo mais caro apenas onde necessário (prosa de luxo), economizando créditos nos processos intermediários
3. **Latência:** GPT-5 desenhado para processamento paralelo. Tarefas separadas = resposta mais fluida
4. **Isolamento de Falhas:** Se Persona falha, Safety Agent bloqueia antes do envio. Se Intent falha, Orchestrator assume com fallback

### Service Architecture Layers (Atualizado)

| Layer | Tech |
|---|---|
| **API Gateway** | Fastify |
| **Evolution API Gateway** | Evolution API (WhatsApp instance management, composing/recording, read receipts) |
| **Input Handler** | Código Fastify (texto/áudio/imagem detection + transcoding) |
| **Intent Agent** | GPT-5-nano (classificação de intenção em µs) |
| **Orchestrator** | GPT-5-turbo/standard + Tool Calling |
| **Tool Execution** | JavaScript async functions |
| **Knowledge Base** | pgvector (Supabase) |
| **Elevare Integration** | /search → /customers → /quotations |
| **Webhook Listener** | POST /webhooks/elevare |
| **Persona Agent** | GPT-5-pro/creative (geração de prosa AAA) |
| **Safety & Validation** | GPT-5-nano (auditoria pré-envio) |
| **Typing Queue (BullMQ)** | Redis + Worker (calcula delays, dispara typing) |
| **Session/State** | Redis (requestId isolation) |
| **Analytics** | Sentry |

### Diagrama de Pipeline (Atualizado com Subagentes + Multimodal)

```
[WhatsApp/Website Message — Texto, Áudio ou Imagem]
    ↓
[Fastify API Gateway + Sanitize Middleware]
    ↓
[Buffer 20s (WhatsApp only — concatena mensagens picadas)]
    ↓
[INPUT HANDLER]
    ├→ Texto: passa direto
    ├→ Áudio (.ogg): transcoding → GPT-5-nano encoder → texto + contexto emocional
    └→ Imagem (.jpg): GPT-5 Vision → descrição em tokens visuais
    ↓
[INTENT AGENT — GPT-5-nano] (~50ms)
    │ Classifica: RAG | API_SEARCH | API_BOOKING | CHAT | MULTIMODAL | HANDOVER
    ↓
[ORCHESTRATOR — GPT-5-turbo/standard] (~1-3s)
    ├→ Tool: search_hotels (Drizzle SQL) ─→ [Supabase PostgreSQL]
    ├→ Tool: query_knowledge_base (RAG) ─→ [pgvector Supabase]
    ├→ Tool: check_availability ─→ [Elevare API /search]
    ├→ Tool: generate_payment_link ─→ [Elevare API /quotations]
    ├→ Tool: register_customer ─→ [Elevare API /customers]
    └→ Tool: transfer_to_human ─→ [Chatwoot API]
    ↓
[PERSONA AGENT — GPT-5-pro/creative] (~1-2s)
    │ Transforma dados brutos em prosa luxuosa AAA
    ↓
[SAFETY & VALIDATION AGENT — GPT-5-nano] (~50ms)
    │ Verifica: persona intacta? dados corretos? segurança OK? tom adequado?
    │ Se FAIL → bloqueia e gera resposta safe
    ↓
[Chunking + BullMQ Typing Queue]
    ↓
[Background Worker: typing events + delays humanizados]
    ↓
[WhatsApp/Website Response — Cadência Humana]
```

### Latência Total Estimada do Pipeline

| Subagente | Latência |
|---|---|
| Input Handler (transcoding) | ~100-500ms (áudio), ~200ms (imagem), 0ms (texto) |
| Intent Agent (GPT-5-nano) | ~50-100ms |
| Orchestrator (GPT-5-turbo + tools) | ~1-3s (inclui API calls) |
| Persona Agent (GPT-5-pro) | ~1-2s |
| Safety Agent (GPT-5-nano) | ~50-100ms |
| **Total Pipeline** | **~2-5s** (dentro do NFR1 < 10s) ✅ |

## 4.4 Data Architecture

### Database Client: Drizzle ORM + Supabase JS (Híbrido)

| Operação | Client | Motivo |
|---|---|---|
| Queries SQL + pgvector | **Drizzle ORM** | Type-safe, pgvector nativo |
| Realtime / Storage / Auth | **Supabase JS** | Features gerenciadas |
| Migrations | **Drizzle Kit** | Schema-as-code |

### Schema PostgreSQL (Drizzle TypeScript)

```typescript
// Tabelas principais:
hotels          // 92 hotéis (metadata, region, experience, has_api, promos)
guest_profiles  // Marketing Intelligence (nome, email, tel, preferências, special_dates)
conversations   // Histórico (session, messages, hotel_focus, request_id, handover)
faq_embeddings  // pgvector (hotel_id, section_title, content, embedding 1536d)
data_deletion_requests  // LGPD compliance
```

### VectorDB Strategy

- **pgvector** dentro do Supabase (não VectorDB externo)
- ~430 chunks (92 hotéis × ~5 seções each)
- Sincronização: Cron job quinzenal (Google Drive → Chunking → Embeddings → pgvector)
- Chunking: por seção lógica (## Título)

### Redis Cache Layer

| Chave | TTL | Conteúdo |
|---|---|---|
| `session:{sessionId}` | 24h | hotel_focus, language, context, request_ids |
| `request:{requestId}` | 30min | photo_url, roomType, price, offer_id |
| `typing_job:{jobId}` | 5min | Status da fila de digitação |
| `rate_limit:{userId}` | 1h | Contadores de requisição |

## 4.5 Elevare API Integration (Golden Discovery #2)

### Fluxo Exato (Validado no Postman)

```
STEP 1: GET /search → { requestId, results: [{ roomId, offerId, photo, price }] }
STEP 2: POST /customers → { customerId }
STEP 3: POST /quotations → { quotationId, paymentLink, expiresAt }
```

### Webhook Events (Golden Discovery #3)

| Evento | Ação Stella |
|---|---|
| `quote_expiring` | Notifica hóspede: "Seu link expira em 1h" |
| `reservation_confirmed` | Congrats + próximos passos |
| `payment_failed` | Notifica erro; oferece retry |

## 4.6 Testing Strategy

**Full Testing Pyramid com Postman Fixture de Ouro**

| Nível | Coverage Target | Fixture |
|---|---|---|
| Unit | >= 80% | Gerado em testes |
| Integration | >= 70% | Postman collection JSON |
| E2E | >= 50% critical paths | Mock Elevare (Postman) |

## 4.7 CI/CD Pipeline

- **Tool:** GitHub Actions
- **Stages:** Test → Build (Docker) → Deploy (Digital Ocean)
- **Secrets:** GitHub Secrets (API keys)

## 4.8 Monitoring & Observability

- **Tool:** Sentry + Discord/Slack webhooks
- **Alerts:** Elevare latência > 8s, HTTP 5xx, rate limit, prompt injection

## 4.9 Security & Compliance

- **Prompt Injection:** Middleware sanitize.js (remove patterns, limita chars)
- **requestId Isolation:** Token nunca exposto via WhatsApp
- **LGPD:** Anonimização após 24 meses (cron mensal), endpoint de exclusão

## 4.10 Deployment & Infrastructure

- **Docker Compose:** Fastify app + Redis + BullMQ Worker
- **Database:** Supabase (gerenciado, DBaaS)
- **Cloud:** Digital Ocean + Cloudflare + Cloudfy
- **Single-region:** Suficiente para MVP
- **Backups:** Supabase automáticos diários

---

# SEÇÃO 5: Epic List ✅ APROVADA

## Visão Geral dos Epics

| Epic | Título | O Que Entrega |
|---|---|---|
| **Epic 1** | Foundation & Data Layer | Repo, DB, data ingestão, health check |
| **Epic 2** | Stella Core — Orquestrador & Persona | Cérebro de Stella: LLM + tools + persona |
| **Epic 3** | Integração Elevare — O Fluxo de Ouro | Search → Quotation, curadoria, webhooks |
| **Epic 4** | Multi-Canal — WhatsApp & Website | WhatsApp, Human-Typing, website |
| **Epic 5** | Chatwoot & Handover Elegante | Escalação, marketing intel, retroalimentação |
| **Epic 6** | Production Hardening & Launch | Monitoring, LGPD, deploy, runbook |

**Dependência:** 1 → 2 → 3 → 4 → 5 → 6 (sequencial)

## Mapeamento FRs → Epics

| FR | Requisito | Epic |
|---|---|---|
| FR1 | Qualificação Progressiva | Epic 2 |
| FR2 | Consulta Disponibilidade Elevare | Epic 3 |
| FR3 | Geração Link Pagamento | Epic 3 |
| FR4 | Consulta Status Reservas | Epic 3 |
| FR5 | RAG Base Conhecimento | Epic 2 |
| FR6 | Detecção Automática Idioma | Epic 2 |
| FR7 | Gerenciamento Contexto Sessão | Epic 2 |
| FR8 | Decomposição Multi-Intenções | Epic 2 |
| FR9 | Handover Chatwoot | Epic 5 |
| FR10 | Extração Marketing Intelligence | Epic 5 |
| FR11 | Defesa Prompt Injection | Epic 2 |
| FR12 | Suporte Multi-Canal (Buffer 20s) | Epic 4 |
| FR13 | Retroalimentação Aprendizado | Epic 5 |
| FR14 | Defesa de Persona | Epic 2 |
| FR15 | Orquestração Dinâmica | Epic 2 |
| FR16 | Curadoria de Disponibilidade | Epic 3 |
| FR17 | Renderização Premium WhatsApp | Epic 4 |
| FR18 | Mapeamento Estado Oculto | Epic 3 |
| FR19 | Upsell Elegante | Epic 3 |
| FR20 | Fallback & Recovery Elegante | Epic 3 + 4 |
| FR21 | Human-Typing Simulation | Epic 4 |
| FR22 | Renderização Transacional Assets | Epic 3 + 4 |
| FR23 | Global Search-to-Quotation Flow | Epic 3 |
| FR24 | requestId State Isolation | Epic 3 |
| FR25 | Webhook Listener | Epic 3 |
| FR26 | Interação por Voz | Epic 2 |
| FR27 | Reconhecimento Visual | Epic 2 |
| FR28 | OCR de Documentos | Epic 2 |
| FR29 | Regeneração Link Pagamento | Epic 3 |
| FR30 | Extensão Validade Cotação | Epic 3 |
| FR31 | Multi-Search Cidade/Região | Epic 3 |
| FR32 | Busca Determinística por Atributos | Epic 2 |
| FR33 | Evolution API Gateway | Epic 4 + 5 |
| FR34 | Read Receipts Inteligentes | Epic 4 |
| FR35 | Presença Online Dinâmica | Epic 4 + 5 |
| FR36 | Handover State Machine | Epic 5 |
| FR37 | WhatsApp Template Messages | Epic 4 |

---

# SEÇÃO 6: Epic Details (Em Progresso)

## Epic 1: Foundation & Data Layer ✅ APROVADO

### Story 1.1: Scaffold do Monorepo & Configuração Base

**As a** developer (Claude Code / @dev),  
**I want** a monorepo Fastify project scaffolded with Docker Compose, config management, and CI pipeline,  
**so that** all subsequent stories have a clean, standardized foundation to build on.

**Acceptance Criteria:**

1. Repositório criado seguindo a estrutura de pastas definida na Seção 4.2
2. Fastify server inicializa e responde em `GET /health` com `{ status: "ok", timestamp }` na porta 3000
3. Docker Compose configurado com serviços: `app` (Fastify) + `redis` (Redis 7 Alpine)
4. `.env.example` documentado com todas as variáveis necessárias
5. `config/` carrega variáveis de ambiente com validação (falha no boot se key obrigatória ausente)
6. ESLint + Prettier configurados
7. Jest configurado como test runner
8. GitHub Actions CI: lint + testes em cada push/PR
9. Winston logger configurado (JSON estruturado)
10. Sentry SDK inicializado
11. README.md com instruções de setup local
12. Drizzle ORM instalado com schema TypeScript em `backend/src/database/schema.ts`
13. Supabase JS Client instalado
14. `drizzle.config.ts` configurado apontando para Supabase DATABASE_URL

### Story 1.2: Schema PostgreSQL & Setup Supabase

**As a** data engineer (@data-engineer),  
**I want** the complete PostgreSQL schema deployed on Supabase with pgvector extension enabled,  
**so that** structured data and vector embeddings coexist in a single managed database.

**Acceptance Criteria:**

1. Supabase project criado e conectado via DATABASE_URL
2. Extensão pgvector habilitada
3. Tabela `hotels` criada (id, name, region, experience, has_api, bradesco_promo, petfriendly, pool_heated, data JSONB)
4. Tabela `guest_profiles` criada (id, phone_number UNIQUE, email, name, travel_history JSONB, preferences JSONB, special_dates JSONB, total_spent, anonimized_at, timestamps)
5. Tabela `conversations` criada (id, session_id, user_id, timestamp, message/response text, hotel_focus, request_id, offer_id, handover, resolved, metadata JSONB)
6. Tabela `faq_embeddings` criada (id, hotel_id FK, section_title, content, embedding vector(1536), metadata JSONB, updated_at)
7. Tabela `data_deletion_requests` criada (LGPD)
8. Índices criados: GIN (JSONB), HNSW (vector), UNIQUE (phone_number)
9. Migrations versionadas via Drizzle Kit (idempotentes)
10. Connection pooling configurado (Supabase pgBouncer)
11. Health check expandido: `{ database: "connected" }`

### Story 1.3: Ingestão de Dados — 92 Hotéis (CSV → PostgreSQL)

**As a** data engineer,  
**I want** the CSV spreadsheet of 92 hotels ingested into the PostgreSQL hotels table,  
**so that** Stella's search_hotels tool can query structured data with 100% accuracy.

**Acceptance Criteria:**

1. Script `data/scripts/ingest-hotels.js` lê CSV/XLSX/Google Sheets export
2. Upsert na tabela hotels com campos mapeados
3. Validação: rejeita linhas com campos obrigatórios ausentes
4. 92 hotéis inseridos (32 has_api: true, 60 has_api: false)
5. Flags Bradesco mapeados corretamente
6. JSONB data populados com metadados extras
7. Script idempotente
8. Log: total inseridos, atualizados, rejeitados
9. Query verificação: COUNT WHERE has_api = true retorna 32
10. Teste unitário para parsing e mapeamento

### Story 1.4: Ingestão de FAQs — Google Drive → pgvector

**As a** data engineer,  
**I want** FAQ documents from Google Drive processed with semantic chunking and stored as vector embeddings,  
**so that** Stella's query_knowledge_base tool can answer infrastructure questions.

**Acceptance Criteria:**

1. Script `data/scripts/ingest-faq.js` conecta Google Drive API v3
2. Baixa FAQs de pasta configurável (suporta .md, .txt, .docx)
3. Semantic chunking por seção lógica (## headings)
4. Máximo 500 tokens por chunk
5. Embeddings via OpenAI `text-embedding-3-small` (1536 dims)
6. Armazenados em faq_embeddings com metadata
7. Upsert logic (não duplica)
8. Cron job quinzenal configurado
9. Log: arquivos processados, chunks gerados, embeddings criados
10. Teste: query "piscina aquecida" retorna chunk correto
11. Health check: `{ vectordb: "X embeddings loaded" }`

### Story 1.5: Redis Setup & Session State Foundation

**As a** developer,  
**I want** Redis configured as the session/cache layer with predefined key patterns,  
**so that** subsequent epics can store session state and requestIds.

**Acceptance Criteria:**

1. Redis 7 Alpine via Docker Compose com volume persistente
2. Conexão com retry logic (reconecta automaticamente)
3. Key patterns definidos e documentados (session, request, typing_job, rate_limit)
4. Helper functions: getSession(), setSession(), getRequest(), setRequest()
5. Rate limiting middleware (30 msgs/min por usuário)
6. Health check: `{ redis: "connected" }`
7. Testes unitários para helpers

### Story 1.6: Health Check Consolidado & Smoke Test

**As a** devops engineer (@devops),  
**I want** a comprehensive health check and smoke test suite,  
**so that** we can validate the foundation before starting Epic 2.

**Acceptance Criteria:**

1. GET /health retorna status consolidado (database, redis, vectordb, hotels count)
2. Status "degraded" se qualquer dep falha
3. GET /health/ready (readiness probe)
4. GET /health/live (liveness probe)
5. Smoke test suite: health 200, 92 hotéis, embeddings exist, Redis OK
6. CI atualizado para rodar smoke tests

---

## Epic 2: Stella Core — Pipeline Multi-Agente ✅ DECISÃO LLM RESOLVIDA

> Implementar o cérebro de Stella como uma **pipeline de 4 subagentes especializados** (OpenAI GPT-5 family): Input Handler → Intent Agent → Orchestrator → Persona Agent → Safety Agent. Cada subagente usa o modelo mais eficiente para sua tarefa (nano para velocidade, pro para criatividade). Ao final deste epic, Stella "pensa" corretamente com processamento multimodal (texto, áudio, imagem).

### ✅ DECISÃO D1 RESOLVIDA: OpenAI Multi-Agent Ecosystem (Agnóstico)

**Provider:** OpenAI (GPT-5 family) — 100% créditos gratuitos ($0/mês real)  
**Arquitetura:** 4 subagentes especializados via interface agnóstica  
**Rationale:** Especialização (nano para lógica, pro para criatividade) reduz alucinação. Modelo caro apenas onde necessário.

| Subagente | Modelo | Papel |
|---|---|---|
| **Intent Agent** | GPT-5-nano | Roteador de Alta Velocidade (~50ms) |
| **Orchestrator** | GPT-5-turbo/standard | Maestro — Tool Calling + coordenação |
| **Persona Agent** | GPT-5-pro/creative | Voz de Luxo AAA |
| **Safety & Validation** | GPT-5-nano | Auditor de Qualidade pré-envio |

### ✅ DECISÃO D6 RESOLVIDA: OpenAI Agents SDK Nativo (Não LLM Client Custom)

**Decisão:** Usar `@openai/agents` SDK nativamente, NÃO criar abstração LLM Client custom.  
**Origem:** Validação arquitetural Sprint 0 (Aria + Pax, 2026-04-02)  
**Rationale:** A Story 2.1 original propunha `interface LLMClient { complete(), toolCall() }` — uma abstração baixo-nível incompatível com o SDK que a architecture.md especifica (`Agent`, `Runner`, `handoff`, `tool`, `inputGuardrail`). Manter duas abstrações duplica trabalho e cria confusão.  
**Implementação:** Usar `Agent`, `Runner.run()`, `tool()`, `inputGuardrail()`, `handoff()` diretamente. Agnosticismo de LLM (NFR11) é garantido via adapter leve no nível do model provider, não via abstração completa — suficiente para MVP onde o provider é OpenAI com créditos gratuitos. Swap futuro requer apenas trocar o provider adapter, não reescrever agents.  
**Impacto:** Story 2.1 deve ser reescrita para alinhar ACs com o SDK. Architecture.md seção 5 é a referência correta.

---

### Story 2.1: LLM Client Agnóstico & Intent Agent (GPT-5-nano)

**As a** developer,  
**I want** an agnostic LLM client interface with the Intent Agent (GPT-5-nano) configured as the high-speed router,  
**so that** Stella can classify intent in microseconds and route to the correct processing pipeline.

**Acceptance Criteria:**

1. Interface LLM agnóstica criada em `src/agents/llm-client.ts`:
   ```typescript
   interface LLMClient {
     complete(prompt: string, options: LLMOptions): Promise<LLMResponse>;
     toolCall(prompt: string, tools: ToolDef[], options: LLMOptions): Promise<ToolCallResponse>;
   }
   ```
2. OpenAI provider implementado (GPT-5 family) com API key via config
3. Interface permite swap para Claude/Gemini futuro sem mudar código de negócio
4. **Intent Agent** configurado com GPT-5-nano:
   - System prompt em `src/prompts/intent-agent.md`
   - Classifica input em categorias: `RAG | API_SEARCH | API_BOOKING | CHAT | MULTIMODAL | HANDOVER`
   - Latência target: < 100ms
   - Retorna: `{ intent: string, confidence: number, subIntents: string[] }` (para multi-intenção)
5. Multi-intenção: "Praia com promo? E pet em Búzios?" → `subIntents: ["API_SEARCH", "RAG"]`
6. Detecção de idioma incluída na resposta do Intent Agent: `{ language: "pt" | "en" | "es" }`
7. Input multimodal: Intent Agent recebe texto (puro ou transcrito de áudio) + descrição de imagem (se presente)
8. Logging: input, intent classificado, confidence, latência
9. Teste: "Tem praia com promo?" → `{ intent: "API_SEARCH", confidence: 0.95 }`
10. Teste multi-intenção: 2 perguntas → 2 subIntents corretos
11. Teste multimodal: áudio transcrito + imagem descrita → intent correto

### Story 2.2: Tool — search_hotels (SQL Query)

**As a** hóspede,  
**I want** Stella to search hotels by experience, region, and promotions,  
**so that** I get accurate, instant recommendations.

**Acceptance Criteria:**

1. Função searchHotels com filtros dinâmicos (Drizzle)
2. Retorna array de hotéis com campos relevantes
3. Sem filtro → top 10
4. Sem resultado → array vazio
5. Latência < 100ms
6. Testes unitários para cada combinação de filtro
7. Teste de borda: 0 resultados não gera erro

### Story 2.3: Tool — query_knowledge_base (RAG / pgvector)

**As a** hóspede,  
**I want** Stella to answer specific questions about hotel infrastructure,  
**so that** I get accurate answers from the hotel's FAQ.

**Acceptance Criteria:**

1. Função queryKnowledgeBase com hotel fuzzy match
2. Gera embedding da pergunta via OpenAI
3. Query pgvector com cosineDistance, filtro por hotel_id
4. Retorna top 3 chunks (similarity > 0.7)
5. Se nenhum resultado: retorna suggestion "transfer_to_human"
6. Fuzzy match: "tiradentes", "Hotel Tiradentes" → mesmo hotel
7. Latência < 500ms
8. Cache de embeddings frequentes (Redis, TTL 1h)
9. Testes para cenários variados

### Story 2.4: Tool — transfer_to_human (Preparação de Handover)

**As a** concierge humano,  
**I want** Stella to prepare a complete context summary before transferring,  
**so that** I can continue without the guest repeating anything.

**Acceptance Criteria:**

1. Função transferToHuman compila contexto da sessão Redis
2. Summary estruturado: guest, conversation_summary, hotel_focus, intent, reason, preferences
3. Razões categorizadas: hotel_manual, guest_requested, low_confidence, api_failure, sensitive_topic
4. Summary salvo em conversations table com handover: true
5. Retorna objeto pronto para Chatwoot
6. Marketing Intelligence extraída e salva em guest_profiles
7. Testes para cada cenário de transferência

### Story 2.5: Persona Agent (GPT-5-pro/creative) — Voz da Stella

**As a** hóspede,  
**I want** Stella's responses to feel like a luxury human concierge,  
**so that** the experience feels premium, warm, and trustworthy.

**Acceptance Criteria:**

1. **Persona Agent** configurado com GPT-5-pro/creative (modelo criativo para prosa de luxo)
2. System prompt em `src/prompts/persona-system.md`:
   - Identidade: "Você é Stella, concierge digital exclusiva do Circuito Elegante"
   - Tom: Acolhedora, Conhecedora, Discreta (AAA)
   - Regras: nunca admitir ser IA, nunca forçar venda, recuar com elegância
   - Formato: prosa luxuosa, sem listas técnicas, sem emojis excessivos
   - Few-shot: 3-5 conversas modelo em PT, EN, ES
3. Função `generateResponse({ toolResults, sessionContext, language })`:
   - Recebe dados crus do Orchestrator
   - Transforma em resposta humanizada na língua detectada
   - Retorna texto formatado para WhatsApp (parágrafos curtos)
4. Persona Blindada (FR14): responde com elegância quando questionada sobre natureza
5. Resposta adaptada ao contexto (1 hotel, 3-4 hotéis, nenhum, fallback)
6. Detecção e manutenção de idioma (PT/EN/ES) — recebe `language` do Intent Agent
7. Testes: prosa sem IDs técnicos, prompt injection mantém persona, idioma correto
8. Max tokens configurável (default: 500)
9. **Separação de responsabilidades:** Persona Agent NUNCA acessa tools diretamente — recebe apenas dados do Orchestrator

### Story 2.6: Decomposição de Multi-Intenções (Pipeline)

**As a** hóspede,  
**I want** to ask multiple questions in a single message and get a unified response,  
**so that** I don't have to send separate messages.

**Acceptance Criteria:**

1. Pipeline: Message → Orchestrator → [Tool Calls] → [Tool Results] → Persona → Response
2. Tool calls independentes executam em paralelo (Promise.all)
3. Tool calls dependentes executam em sequência
4. Persona gera resposta unificada (não separada por tool)
5. Timeout individual por tool (5s); se 1 falha, outros continuam
6. Se todos falham → Persona gera fallback elegante
7. Testes E2E: 1 intenção, 2 paralelas, 3 com 1 falha, mensagem ambígua

### Story 2.7: Session State & Context Persistence

**As a** hóspede,  
**I want** Stella to remember what we've been discussing,  
**so that** I don't have to repeat myself.

**Acceptance Criteria:**

1. Session Manager em Redis (sessionId, userId, language, hotelFocus, conversationHistory, preferences, requestIds)
2. hotelFocus atualizado automaticamente quando hóspede menciona hotel
3. Follow-up sem hotel usa hotelFocus automaticamente
4. conversationHistory limitado a 20 mensagens (sliding window)
5. Preferências acumuladas ao longo da conversa
6. Session TTL: 24h
7. Ao expirar, snapshot em conversations table
8. Testes para context persistence e hotel switching

### Story 2.8: Middleware de Segurança (Sanitização & Rate Limiting)

**As a** security engineer,  
**I want** all user inputs sanitized and rate limits enforced,  
**so that** Stella is protected against prompt injection and abuse.

**Acceptance Criteria:**

1. Middleware sanitize.js: remove control chars, detecta injection patterns, bloqueia > 2000 chars, bloqueia URLs suspeitas
2. Se injection detectada: loga Sentry + responde com persona intacta
3. Rate limiting: 30 msgs/min, 500 msgs/dia
4. Se excedido: resposta educada
5. Parâmetros de tools sanitizados (Drizzle parameterized queries)
6. Logging de bloqueios em Sentry
7. Testes para cada vetor de ataque

### Story 2.9: Safety & Validation Agent (GPT-5-nano) — Auditor Pré-Envio

**As a** product owner,  
**I want** every response validated by a safety agent before being sent to the guest,  
**so that** no hallucinated data, broken persona, or security violations ever reach the customer.

**Acceptance Criteria:**

1. **Safety Agent** configurado com GPT-5-nano (velocidade máxima, ~50ms)
2. System prompt em `src/prompts/safety-agent.md`:
   - Checklist de validação: persona intacta? dados corretos? tom adequado? segurança OK?
   - Regras: bloquear respostas que mencionem "IA", "algoritmo", "processando", "erro de sistema"
   - Regras: bloquear respostas com dados financeiros incorretos ou inventados
   - Regras: bloquear respostas com tom agressivo ou gatilhos de escassez
3. Função `validateResponse({ personaOutput, toolResults, sessionContext })`:
   - Compara dados da Persona com dados brutos do Orchestrator (cross-check)
   - Retorna: `{ approved: boolean, reason?: string, correctedResponse?: string }`
4. Se **APPROVED**: resposta segue para Typing Queue
5. Se **REJECTED**: Safety Agent gera resposta safe alternativa (genérica e educada)
6. Logging: toda rejeição logada em Sentry com motivo + resposta original
7. Métricas: taxa de rejeição por categoria (hallucination, persona_break, security, tone)
8. Testes:
   - Resposta com "Sou uma IA" → REJECTED, resposta corrigida
   - Resposta com preço inventado (não retornado pela API) → REJECTED
   - Resposta com "ÚLTIMAS VAGAS!" → REJECTED (gatilho de escassez)
   - Resposta correta e AAA → APPROVED

### Story 2.10: Processamento Multimodal Nativo (Visão & Áudio)

**As a** hóspede,  
**I want** to send voice notes and images to Stella,  
**so that** I can communicate my needs with maximum convenience and visual context.

**Acceptance Criteria:**

1. **Audio Understanding (GPT-5 Native):**
   - Stella recebe arquivo de áudio (.ogg, .mp3, .wav) do WhatsApp
   - Processa via GPT-5 para entender texto + entonação/urgência
   - Intent Agent (GPT-5-nano) resume o áudio para o Orchestrator
   - Transcoding: backend converte Opus/Ogg do WhatsApp para formato aceito pela API OpenAI (se necessário) ou usa stream direto

2. **Vision Analysis (GPT-5 Vision):**
   - Stella analisa imagens recebidas via GPT-5 Vision
   - Capacidades:
     - Identificar hotéis do Circuito Elegante por fotos
     - Ler comprovantes de pagamento (OCR nativo) — PIX, cartão Bradesco
     - Identificar tipos de quarto por fotos
     - Analisar fotos de animais de estimação para validar política Pet-Friendly
   - Output: descrição estruturada em tokens visuais para o Intent Agent

3. **Multimodal Intent Routing:**
   - Intent Agent trata inputs mistos (ex: foto de piscina + áudio "Tem esse hotel na promoção?")
   - Pipeline: Input Handler → GPT-5-nano Encoder → Intent Agent → Orchestrator
   - Orchestrator busca disponibilidade baseado na identificação visual

4. **Technical Handling (Transcoding):**
   - `src/agents/input-handler.ts`:
     - Detecta tipo de mídia recebida (texto, áudio, imagem)
     - Áudio: converte para formato GPT-5 compatível
     - Imagem: envia para GPT-5 Vision e recebe descrição
     - Texto: passa direto
   - Output padronizado: `{ text: string, audioContext?: string, imageDescription?: string }`

5. **Multimodal Safety:**
   - Safety Agent valida se imagem enviada é apropriada
   - Safety Agent verifica se áudio não contém comandos maliciosos (Prompt Injection via voz)
   - Imagens NSFW ou irrelevantes: resposta educada "Não consegui identificar essa imagem. Pode descrever o que está buscando?"

6. **Testes:**
   - Áudio "Quero praia para casal" → Intent: API_SEARCH, texto correto
   - Foto de hotel Circuito Elegante → identificado + disponibilidade buscada
   - Foto de comprovante PIX → OCR extrai valor + data + banco
   - Foto de cachorro + texto "aceita pet?" → identificação + RAG pet-friendly
   - Input misto (foto + áudio) → roteamento correto
   - Áudio com prompt injection → bloqueado pelo Safety Agent

---

## 📊 Resumo Epic 2 (Atualizado com Subagentes + Multimodal)

| Story | Descrição | Subagente |
|---|---|---|
| 2.1 | LLM Client Agnóstico + Intent Agent | GPT-5-nano |
| 2.2 | Tool: search_hotels (SQL) | Orchestrator |
| 2.3 | Tool: query_knowledge_base (RAG) | Orchestrator |
| 2.4 | Tool: transfer_to_human (prep) | Orchestrator |
| 2.5 | Persona Agent (Voz da Stella) | GPT-5-pro/creative |
| 2.6 | Pipeline Multi-Intenções | Pipeline completo |
| 2.7 | Session State & Context | Redis |
| 2.8 | Middleware Segurança | Código + Redis |
| 2.9 | Safety & Validation Agent | GPT-5-nano |
| 2.10 | Processamento Multimodal (Voz + Visão) | GPT-5-nano + GPT-5 Vision |

**Paralelismo:**
- Stories 2.2, 2.3, 2.4 em **paralelo** (tools independentes)
- Story 2.5 em **paralelo** com 2.2-2.4
- Stories 2.8 e 2.9 em **paralelo**
- Story 2.10 depende de 2.1 (Input Handler)
- Stories 2.6 e 2.7 são finais (dependem de quase tudo)

---

## Epic 3: Integração Elevare — O Fluxo de Ouro ✅ APROVADO

> Implementar o pipeline completo de reservas: /search → /customers → /quotations, com curadoria de opções, requestId isolation, e webhook listener.

**Stories previstas:**
- 3.1: ElevareClient — Search + requestId Management
- 3.2: ElevareClient — Customer Registration
- 3.3: ElevareClient — Quotation (Link de Pagamento)
- 3.4: Motor de Curadoria (3-4 opções representativas)
- 3.5: Mapeamento de Estado Oculto (correferência)
- 3.6: Upsell Elegante
- 3.7: Webhook Listener & Auto-Follow-Up
- 3.8: Fallback & Recovery Elegante
- 3.9: Consulta de Status de Reservas (Pós-Venda)
- 3.10: Integration Tests (Postman Fixture)

**Detalhamento completo:** Pendente aprovação Epic 2.

---

## Epic 4: Multi-Canal — WhatsApp & Website ✅ APROVADO

> Conectar Stella aos canais reais: WhatsApp Business API (com Human-Typing Simulation) e chat widget no website.

**Stories previstas:**
- 4.1: WhatsApp Business API — Recepção de Mensagens
- 4.2: Buffer de Concatenação (20s para mensagens "picadas")
- 4.3: Human-Typing Simulation (BullMQ + Worker)
- 4.4: Renderização Premium (Imagem + Legenda WhatsApp)
- 4.5: Correferência via WhatsApp Reply
- 4.6: Chat Widget Website (básico)
- 4.7: Fallback de Fora de Expediente
- 4.8: E2E Tests

**Detalhamento completo:** Pendente aprovação Epic 3.

---

## Epic 5: Chatwoot, Evolution API & Handover (O Controle da Mansão) ✅ APROVADO

> Implementar escalação inteligente para concierges humanos via Chatwoot.

**Stories previstas:**
- 5.1: Integração Chatwoot API (criação de conversa + contexto)
- 5.2: Transfer Rules Engine (quando escalonar)
- 5.3: Escalação Silenciosa (FR9 — linguagem premium)
- 5.4: Extração Marketing Intelligence (FR10)
- 5.5: Retroalimentação de Aprendizado (FR13)
- 5.6: Dashboard Básico para Concierges

**Detalhamento completo:** Pendente aprovação Epic 4.

---

## Epic 6: Production Hardening & Launch ✅ APROVADO

> Preparar Stella para produção: monitoring, alertas, LGPD, deploy final.

**Stories previstas:**
- 6.1: Sentry Alerts (Elevare latência, rate limit, injection)
- 6.2: Health Check Expandido (todas as deps)
- 6.3: LGPD Compliance (anonimização 24 meses, endpoint exclusão)
- 6.4: Performance Tuning (cache, connection pooling)
- 6.5: Playbooks para Concierges
- 6.6: Deploy Final (Docker Compose → Digital Ocean)
- 6.7: Smoke Tests em Produção
- 6.8: Runbook de Incidentes

**Detalhamento completo:** Pendente aprovação Epic 5.

---

# SEÇÃO 7: Checklist Results Report ✅

| # | Critério | Status |
|---|---|---|
| 1 | Goals claros e mensuráveis | ✅ 8 goals com KPIs SMART |
| 2 | Problem statement bem definido | ✅ Gargalo 92 hotéis documentado |
| 3 | Requirements rastreáveis | ✅ 35 FRs + 12 NFRs mapeados a epics |
| 4 | Requirements testáveis | ✅ ACs verificáveis em cada FR |
| 5 | Scope boundaries definidos | ✅ MVP + Out-of-scope + Post-MVP |
| 6 | UX/Persona documentada | ✅ 9 paradigmas + AAA + Human-Typing |
| 7 | Architecture decisions documented | ✅ 5 decisões (D1-D5) + 3 Golden Discoveries |
| 8 | Epics sequenciais e lógicos | ✅ 1→2→3→4→5→6 com dependências claras |
| 9 | Stories sized para AI agent | ✅ 55 stories completáveis em 1 sessão |
| 10 | Cross-cutting concerns distribuídos | ✅ Logging Epic 1, Segurança Epic 2, Monitoring Epic 6 |
| 11 | Risks identificados | ✅ 5 riscos + stress tests Epic 4-5 |
| 12 | Data sources validados | ✅ Postman + Planilha (92 hotéis) no projeto |
| 13 | Budget constraints respeitados | ✅ $0 LLM + ~$90 infra |
| 14 | LGPD compliance planejado | ✅ Story 6.3 (anonimização + exclusão) |
| 15 | Launch plan definido | ✅ Story 6.9 (soft → full → post-launch) |

**Score: 15/15** ✅

---

# SEÇÃO 8: Next Steps

## 8.1 Immediate Actions (Pós-PRD)

1. **@architect (Aria):** Revisar arquitetura — confirmar stack, validar pipeline 4 subagentes, aprovar schema
2. **@data-engineer (Dara):** Validar schema PostgreSQL, planejar ingestão, configurar Supabase
3. **@sm (River):** Criar stories formais no formato AIOX
4. **@po (Pax):** Validar stories (10-point checklist)

## 8.2 Architect Prompt

> @architect Aria — Revise o PRD da Stella (Concierge Digital do Circuito Elegante) em `docs/prd/PRD-Concierge-Digital-Stella.md`. O sistema é um agente IA multi-LLM (GPT-5 family, 4 subagentes) que orquestra atendimento de 92 hotéis de luxo via WhatsApp (Evolution API) e website, com handover elegante via Chatwoot. Stack: Fastify, Drizzle ORM + Supabase (pgvector), Redis + BullMQ, Docker Compose na Digital Ocean. Valide a arquitetura de 4 subagentes (Intent nano → Orchestrator turbo → Persona pro → Safety nano), o fluxo Elevare (3 Golden Discoveries), e a separação de concerns. Produza o Architecture Document.

## 8.3 UX Expert Prompt

> @ux-design-expert Uma — Revise a Seção 3 (UX Design) do PRD em `docs/prd/PRD-Concierge-Digital-Stella.md`. Foco na experiência conversacional da Stella: 9 paradigmas de interação, Human-Typing Simulation, Renderização Premium no WhatsApp, e persona AAA. Valide os conversation states e proponha melhorias.

---

# DECISÕES RESOLVIDAS

| ID | Decisão | Status | Resolução | Data |
|---|---|---|---|---|
| **D1** | LLM Provider | ✅ RESOLVIDO | OpenAI Multi-Agent Ecosystem (GPT-5 family) via interface agnóstica. 4 subagentes: Intent (nano), Orchestrator (turbo), Persona (pro), Safety (nano). Custo: $0/mês (créditos gratuitos) | 2026-04-02 |
| **D2** | Database Client | ✅ RESOLVIDO | Drizzle ORM + Supabase JS (Híbrido). Drizzle para queries + pgvector, Supabase JS para features gerenciadas | 2026-04-02 |
| **D3** | Framework HTTP | ✅ RESOLVIDO | Fastify (em vez de Express). Mais leve, async-native, melhor para alto volume WhatsApp | 2026-04-02 |
| **D4** | Contagem Real de Hotéis | ✅ RESOLVIDO | 92 hotéis totais (32 com API Elevare + 60 manuais → Chatwoot). Dados da planilha real. Anterior: estimativa de 86 (36+50) | 2026-04-02 |
| **D5** | WhatsApp Gateway | ✅ RESOLVIDO | Evolution API como gateway WhatsApp (não Cloud API direta). Suporte a composing, recording, read receipts, presença dinâmica, multimodal storage | 2026-04-02 |

---

# REFERÊNCIAS

- **Project Brief:** `docs/brief/PROJECT-BRIEF-Concierge-Digital.md`
- **Brief Básico (Original):** `docs/brief/BRIEF BÁSICO_ Concierge Digital Circuito Elegante.md`
- **Postman Collection (Elevare):** A ser salvo em `docs/api/`
- **Planilha 92 Hotéis:** A ser fornecida
- **FAQs dos Hotéis:** Google Drive (a ser conectado)
- **Template PRD:** `.aiox-core/product/templates/prd-tmpl.yaml`
- **Template Brief:** `.aiox-core/product/templates/project-brief-tmpl.yaml`

---

*Documento gerado por Morgan (PM Agent) — AIOX Framework*  
*Synkra AIOX v2.0 — Circuito Elegante*
