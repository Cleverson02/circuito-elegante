# Task: Scrape Circuito Elegante Website

**Task ID:** scrape-ce-website
**Agent:** @web-scraper
**Squad:** hotel-enrichment
**Elicit:** false
**Idempotent:** true

## Purpose

Buscar dados de um hotel (ou todos os 92) no site circuitoelegante.com.br.

## Inputs

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `hotel_slug` | string | No | Slug do hotel (se omitido, busca todos) |
| `base_url` | string | No | Default: https://circuitoelegante.com.br |

## Steps

1. **Discover hotel URLs** — Buscar listagem de hotéis no site CE para mapear URL de cada hotel
2. **For each hotel:**
   a. Fetch página do hotel no CE
   b. Extrair: descrição, fotos, experiência, região, destino
   c. Registrar URL como source
3. **Cache results** — TTL: 72h

## Output

Mesmo formato de `scrape-hotel-website`, com `source_type: "circuito_elegante"`.

## Notes

- O site CE tem estrutura padronizada para todos os hotéis
- Priorizar descoberta do URL pattern antes de processar individualmente
- Se hotel não encontrado no CE → registrar como "not_found", não inventar
