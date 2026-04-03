# Task: Extract Hotel Data

**Task ID:** extract-hotel-data
**Agent:** @data-extractor
**Squad:** hotel-enrichment
**Elicit:** false

## Purpose

Extrair dados estruturados do conteúdo raw de um hotel, mapeando para os 58 campos da taxonomia.

## Inputs

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `raw_content` | object | Yes | Output do @web-scraper (pages JSON) |
| `hotel_slug` | string | Yes | Slug do hotel |
| `taxonomy` | string | No | Default: data/hotel-taxonomy-fields.yaml |

## Steps

1. **Load taxonomy** — Ler 58 campos com tipos esperados
2. **For each category (1-10):**
   a. Identificar quais páginas scraped são mais relevantes para a categoria
   b. Processar texto buscando dados que mapeiam para cada campo
   c. Para cada campo encontrado: registrar value, confidence, source_url, source_text
   d. Para cada campo NÃO encontrado: registrar null com nota
3. **Apply confidence scoring** — HIGH (literal), MEDIUM (normalizado), LOW (implícito), REJECT
4. **Reject low confidence** — Campos com confidence < 0.5 → null

## CRITICAL RULES

- **NUNCA** preencher campo sem source_text que comprove
- **NUNCA** inferir dados de "hotéis similares" ou "prática comum"
- Se texto diz "piscina" mas não diz "aquecida" → pool_heated = null
- Se texto diz "restaurante" mas não diz culinária → cuisine = null
- Campo sem evidência = null, SEMPRE

## Output

```json
{
  "hotel_slug": "string",
  "extraction_date": "ISO timestamp",
  "source_type": "hotel_website|circuito_elegante|google_drive",
  "fields": {
    "field_id": {
      "value": "any",
      "confidence": 0.0-1.0,
      "source_url": "string|null",
      "source_text": "string|null"
    }
  },
  "summary": {
    "total_fields": 58,
    "extracted": "number",
    "null_fields": "number",
    "avg_confidence": "number"
  }
}
```

## Veto Conditions

- Campo com confidence > 0.7 mas sem source_text → REJECT
- Campo fabricado ou inferido → REJECT
- 0 campos extraídos → reportar ao chief
