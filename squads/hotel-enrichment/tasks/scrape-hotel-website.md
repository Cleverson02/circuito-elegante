# Task: Scrape Hotel Website

**Task ID:** scrape-hotel-website
**Agent:** @web-scraper
**Squad:** hotel-enrichment
**Elicit:** false
**Idempotent:** true (cache-aware)

## Purpose

Buscar e extrair conteúdo textual e imagens de todas as páginas relevantes do site oficial de um hotel.

## Inputs

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `hotel_slug` | string | Yes | Slug do hotel |
| `website_url` | string | Yes | URL do site oficial |
| `force_refresh` | boolean | No | Ignorar cache (default: false) |

## Steps

1. **Check cache** — Se página já foi scraped nas últimas 72h e `force_refresh=false`, retornar cache
2. **Check robots.txt** — Verificar permissões de scraping no domínio
3. **Detect site type** — SPA (precisa Playwright) vs SSR/static (fetch simples)
4. **Discover pages** — Navegar a partir da homepage, buscar links para:
   - `/quartos` ou `/acomodacoes` ou `/rooms` ou `/suites`
   - `/lazer` ou `/experiencias` ou `/amenities` ou `/atividades`
   - `/gastronomia` ou `/restaurante` ou `/dining` ou `/culinaria`
   - `/sobre` ou `/o-hotel` ou `/about` ou `/historia`
   - `/politicas` ou `/termos` ou `/policies` ou `/regulamento`
   - `/faq` ou `/perguntas-frequentes` ou `/duvidas`
   - `/como-chegar` ou `/localizacao` ou `/contato`
5. **Fetch each page** — GET com delay de 2-5s entre requests
6. **Clean HTML** — Remover nav, footer, scripts, styles, ads
7. **Extract text** — Preservar headings, lists, tables, paragraphs
8. **Capture images** — Coletar URLs de imagens (src, srcset)
9. **Cache result** — Salvar para reutilização (TTL: 72h)

## Output

```json
{
  "hotel_slug": "string",
  "source_type": "hotel_website",
  "website_url": "string",
  "scrape_date": "ISO timestamp",
  "pages": [
    {
      "url": "string",
      "page_type": "homepage|rooms|leisure|dining|about|policies|faq|directions",
      "title": "string",
      "text_content": "string (cleaned text)",
      "image_urls": ["string"],
      "status_code": 200,
      "scraped_at": "ISO timestamp"
    }
  ],
  "pages_not_found": ["string"],
  "errors": ["string"],
  "site_type": "ssr|spa|static"
}
```

## Veto Conditions

- robots.txt proíbe → STOP, reportar
- Site requer login → STOP, reportar
- 3+ timeouts → STOP, marcar como inacessível
- 403 Forbidden → STOP, reportar

## Completion Criteria

- Pelo menos homepage scraped com sucesso
- Texto limpo extraído (sem HTML tags)
- Imagens URLs capturadas
- Cache salvo
- Resultado entregue ao @data-extractor
