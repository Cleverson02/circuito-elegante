# Task: Validate Hotel Data

**Task ID:** validate-hotel-data
**Agent:** @data-validator
**Squad:** hotel-enrichment
**Elicit:** false

## Purpose

Validar qualidade dos dados extraídos antes de gravar no PostgreSQL.

## Inputs

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `extracted_data` | object | Yes | Output do @data-extractor |
| `hotel_slug` | string | Yes | Slug do hotel |

## Steps

1. **Field-level validation** — Verificar tipo, formato, range de cada campo
2. **Cross-source consistency** — Se múltiplas fontes, verificar coerência
3. **Geographic consistency** — UF ↔ região ↔ município ↔ experiência
4. **Zero Invention Audit** — Verificar que NENHUM campo foi fabricado
5. **Quality scoring** — Calcular score ponderado (accuracy 35%, completeness 30%, consistency 20%, currency 15%)
6. **Emit verdict** — PASS, WARN ou FAIL

## Output

```json
{
  "hotel_slug": "string",
  "verdict": "PASS|WARN|FAIL",
  "quality_score": 0.0-1.0,
  "dimensions": {
    "accuracy": 0.0-1.0,
    "completeness": 0.0-1.0,
    "consistency": 0.0-1.0,
    "currency": 0.0-1.0
  },
  "issues": [
    {
      "severity": "CRITICAL|HIGH|MEDIUM|LOW",
      "field": "field_id",
      "description": "string",
      "recommendation": "string"
    }
  ],
  "zero_invention_passed": true
}
```

## Veto Conditions

- accuracy < 0.5 → FAIL
- Zero Invention Audit failed → FAIL
- CRITICAL issue não resolvido → FAIL
