# Hotel Enrichment Squad

Squad especializado em coletar, extrair e enriquecer dados dos 92 hotéis do Circuito Elegante para consumo pelo concierge digital Stella.

## Princípio Constitucional

> **ZERO INVENÇÃO** — campo sem dado encontrado = `null`. NUNCA fabricar, inferir ou inventar dados. Só preencher campos com dados reais encontrados na fonte.

## Agents

| Agent | Tier | Role |
|-------|------|------|
| `enrichment-chief` | 0 | Pipeline orchestrator — coordena coleta e progresso |
| `web-scraper` | 1 | Web scraping — busca conteúdo de sites (CE + hotéis) |
| `data-extractor` | 1 | Extração estruturada — texto livre para 58 campos |
| `data-validator` | 2 | Quality gate — accuracy, completeness, consistency |

## Pipeline

```
Scrape (3 fontes) → Extract (58 campos) → Validate (quality gate) → Store (JSONB)
```

## Fontes de Dados

| Fonte | Cobertura | Prioridade | Qualidade |
|-------|-----------|------------|-----------|
| Google Drive (formulários) | ~30 hotéis | P0 | Alta |
| Site Circuito Elegante | 92 hotéis | P1 | Média |
| Sites oficiais dos hotéis | ~62 hotéis | P2 | Média-Alta |

## Taxonomia

58 campos em 10 categorias. Documento completo: `docs/architecture/HOTEL-DATA-TAXONOMY.md`

## Methodologies

| Expert | Framework | Aplicação |
|--------|-----------|-----------|
| Ryan Mitchell | Web Scraping Decision Framework | Estratégia de scraping |
| Tobias Mayer (Apify) | Actor Model | Scrapers composáveis |
| Oren Etzioni | OpenIE | Extração estruturada |
| Abe Gong | Great Expectations | Validação declarativa |
| Carlo Batini | Data Quality Dimensions | Quality scoring |
| Pramod Sadalage | Aggregate Design | JSONB boundaries |
| Natalya Noy | Ontology 101 | Taxonomia validation |

## Status

**Version:** 2.0.0  
**Agent: chatbot-interviewer** — CSS Widget Activation (HE_006) + Response Awaiting (HE_005)  
**Validation:** ✅ Phase 5 Test #1 (Rituaali Spa) — Both heuristics 100% success  
**Readiness:** ✅ **PRODUCTION READY — Batch enrichment of 92 hotels approved**

## Quick Start

```
@hotel-enrichment:enrichment-chief
*enrich pousada-alma-charme-atins    # Um hotel
*enrich-batch 1-10                    # Batch initial (Phase 6a)
*enrich-all                           # Todos os 92 (após validar batch)
*status                               # Progresso
*coverage-report                      # Campos preenchidos vs vazios
```

## What's New in v2.0.0

| Feature | Purpose | Status |
|---------|---------|--------|
| **HE_006** | Remove CSS classes desativadoras (infochat_off, hidden, etc) | ✅ Validated |
| **HE_005** | Enforce 3-5 segunda delays entre perguntas → zero message loss | ✅ Validated |
| **Veto Conditions** | Hard stops para widget bloqueado, timeout, delay violation | ✅ Implemented |
| **Fallback** | Se chatbot falha ou não existe → @web-scraper | ✅ Ready |

## Production Deployment

See `outputs/squad_upgrade/hotel-enrichment/PRODUCTION-READINESS.md` for:
- Validation results (Phase 3-5)
- Batch rollout strategy (Phase 6a-6c)
- Success criteria & monitoring
- Fallback strategy (→ web-scraper)

## Output

Dados gravados no campo JSONB `data` da tabela `hotels` no PostgreSQL, com metadata de source e quality score.
