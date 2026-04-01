# AGENTS.md - Synkra AIOX + Squads Registry

Este arquivo define as instrucoes do projeto e o catalogo completo de agentes e squads.

<!-- AIOX-MANAGED-START: core -->
## Core Rules

1. Siga a Constitution em `.aiox-core/constitution.md`
2. Priorize `CLI First -> Observability Second -> UI Third`
3. Trabalhe por stories em `docs/stories/`
4. Nao invente requisitos fora dos artefatos existentes
<!-- AIOX-MANAGED-END: core -->

<!-- AIOX-MANAGED-START: quality -->
## Quality Gates

- Rode `npm run lint`
- Rode `npm run typecheck`
- Rode `npm test`
- Atualize checklist e file list da story antes de concluir
<!-- AIOX-MANAGED-END: quality -->

<!-- AIOX-MANAGED-START: codebase -->
## Project Map

- Core framework: `.aiox-core/`
- CLI entrypoints: `bin/`
- Shared packages: `packages/`
- Squads: `squads/`
- Tests: `tests/`
- Docs: `docs/`
<!-- AIOX-MANAGED-END: codebase -->

<!-- AIOX-MANAGED-START: commands -->
## Common Commands

- `npm run sync:ide`
- `npm run sync:ide:check`
- `npm run sync:skills:codex`
- `npm run sync:skills:codex:global` (opcional; neste repo o padrao e local-first)
- `npm run validate:structure`
- `npm run validate:agents`
<!-- AIOX-MANAGED-END: commands -->

<!-- AIOX-MANAGED-START: shortcuts -->
## AIOX Core Agents

Agentes do framework AIOX. Ativar via `/AIOX:agents:{id}` ou `@{id}`:

| Agent | Persona | Slash Command | Escopo |
|-------|---------|---------------|--------|
| `@aiox-master` | Orion | `/AIOX:agents:aiox-master` | Orquestrador master, framework dev |
| `@dev` | Dex | `/AIOX:agents:dev` | Implementacao de codigo |
| `@qa` | Quinn | `/AIOX:agents:qa` | Testes e qualidade |
| `@architect` | Aria | `/AIOX:agents:architect` | Arquitetura e design tecnico |
| `@pm` | Morgan | `/AIOX:agents:pm` | Product Management |
| `@po` | Pax | `/AIOX:agents:po` | Product Owner, stories/epics |
| `@sm` | River | `/AIOX:agents:sm` | Scrum Master |
| `@analyst` | Alex | `/AIOX:agents:analyst` | Pesquisa e analise |
| `@data-engineer` | Dara | `/AIOX:agents:data-engineer` | Database design |
| `@ux-design-expert` | Uma | `/AIOX:agents:ux-design-expert` | UX/UI design |
| `@devops` | Gage | `/AIOX:agents:devops` | CI/CD, git push (EXCLUSIVO) |
| `@squad-creator` | — | `/AIOX:agents:squad-creator` | Criacao de squads |
<!-- AIOX-MANAGED-END: shortcuts -->

<!-- AIOX-MANAGED-START: squads -->
## Squads Instalados

Todos os squads ficam em `squads/` com slash commands em `.claude/commands/`.
Ativar via `/{squad}:{agent}` ou usar o chief do squad como entry point.

### Catalogo Completo (21 squads, ~130 agentes)

| # | Squad | Icon | Slash Prefix | Entry Agent | Agentes | Dominio |
|---|-------|------|-------------|-------------|---------|---------|
| 1 | **asaas-payment** | 💳 | `/asaas-payment:` | `asaas-chief` | 4 | Payment gateway Asaas (PIX, splits, webhooks) |
| 2 | **audio-reels** | 🎬 | `/audio-reels:` | `audio-reels-chief` | 7 | Audio-to-video pipeline (Reels/TikTok/Shorts) |
| 3 | **curator** | 🎬 | `/curator:` | `curator-chief` | 12 | Curadoria de conteudo, video editing, transcripts |
| 4 | **db-sage** | 🗄️ | `/db-sage:` | `db-sage` | 1 | PostgreSQL/Supabase (schema, RLS, migrations) |
| 5 | **deep-research** | 🔬 | `/deep-research:` | `dr-orchestrator` | 11 | Pesquisa profunda evidence-based |
| 6 | **design** | 🎨 | `/design:` | `design-chief` | 8 | Design System (tokens, componentes, a11y) |
| 7 | **design-amorin** | 🎨 | `/design-amorin:` | `design-chief` | 10 | Design Elite (branding, foto, thumbnails) |
| 8 | **design-antigo** | 🎨 | `/design-antigo:` | `design-chief` | 9 | Design System (Brad Frost methodology, archive) |
| 9 | **dispatch** | ⚡ | `/dispatch:` | `dispatch-chief` | 4 | Parallel execution engine, task routing |
| 10 | **education** | 🧠 | `/education:` | `education-chief` | 16 | Curriculo, instructional design, MEC compliance |
| 11 | **etl-data-collector** | 📦 | `/etl-data-collector:` | `data-collector` | 6 | Coleta multi-source (YouTube, web, docs) |
| 12 | **etl-ops** | 🔧 | `/etl-ops:` | `etl-chief` | 3 | ETL operations (pipeline execution) |
| 13 | **etl-squad** | 🔄 | `/etl-squad:` | `etl-chief` | 6 | ETL pipeline (extract, parse, enrich, load) |
| 14 | **kaizen** | 📊 | `/kaizen:` | `kaizen-chief` | 7 | Melhoria continua, performance, tech radar |
| 15 | **kennedy** | 📬 | `/kennedy:` | `kennedy-chief` | 14 | Dan Kennedy direct response marketing |
| 16 | **marketing-opes** | 👑 | `/marketing-opes:` | `marketing-cmo` | 12 | Marketing board + content pipeline |
| 17 | **seo** | 🔍 | `/seo:` | `seo-chief` | 8 | SEO optimization (on-page, technical, schema) |
| 18 | **squad-creator** | 🏗️ | `/squad-creator:` | `squad-chief` | 1 | Meta-squad base (template-driven) |
| 19 | **squad-creator-pro** | 🏗️ | `/squad-creator-pro:` | `squad-chief` | 4 | Meta-squad pro (mind cloning, DNA extraction) |
| 20 | **tech-research** | 🔎 | `/tech-research:` | `tech-research` | skill | Deep technical research pipeline |
| 21 | **zona-genialidade** | 🌟 | `/zona-genialidade:` | `zona-genialidade-chief` | 8 | Assessment comportamental, zona de genialidade |

### Como Usar

**Ativar um squad (entry agent):**
```
/asaas-payment:asaas-chief
/kennedy:kennedy-chief
/education:education-chief
```

**Ativar um agente especifico:**
```
/deep-research:kahneman
/curator:mrbeast
/kennedy:kennedy-copy
/seo:technical-auditor
```

**Skill (tech-research):**
```
/tech-research:tech-research "como melhorar performance de queries SQL"
```

**Comandos dentro de um squad (apos ativacao):**
```
*help          — ver comandos do squad ativo
*audit         — executar auditoria (varia por squad)
*exit          — sair do modo agente
```

### Integracao com AIOX Agents

Os squads sao complementares aos AIOX core agents:

| Necessidade | Use | Comando |
|-------------|-----|---------|
| Implementar codigo | @dev | `/AIOX:agents:dev` |
| Criar story | @sm | `/AIOX:agents:sm` |
| Design system | Design Squad | `/design:design-chief` |
| Copywriting | Kennedy Squad | `/kennedy:kennedy-copy` |
| Pesquisa profunda | Deep Research | `/deep-research:dr-orchestrator` |
| SEO do site | SEO Squad | `/seo:seo-chief` |
| ETL de dados | ETL Squad | `/etl-squad:etl-chief` |
| Pagamentos Asaas | Asaas Squad | `/asaas-payment:asaas-chief` |
| Video de audio | Audio Reels | `/audio-reels:audio-reels-chief` |
| Curadoria conteudo | Curator | `/curator:curator-chief` |
| Marketing completo | Marketing OPES | `/marketing-opes:marketing-cmo` |
| Database design | DB Sage | `/db-sage:db-sage` |
| Educacao/curriculo | Education | `/education:education-chief` |
| Melhoria continua | Kaizen | `/kaizen:kaizen-chief` |
| Criar squads | Squad Creator Pro | `/squad-creator-pro:squad-chief` |
| Zona genialidade | Zona Genialidade | `/zona-genialidade:zona-genialidade-chief` |
<!-- AIOX-MANAGED-END: squads -->
