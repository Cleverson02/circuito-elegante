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

## Quick Start

```
@hotel-enrichment:enrichment-chief
*enrich pousada-alma-charme-atins    # Um hotel
*enrich-all                           # Todos os 92
*status                               # Progresso
*coverage-report                      # Campos preenchidos vs vazios
```

## Output

Dados gravados no campo JSONB `data` da tabela `hotels` no PostgreSQL, com metadata de source e quality score.
