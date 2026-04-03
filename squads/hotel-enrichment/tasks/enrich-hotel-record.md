# Task: Enrich Hotel Record

**Task ID:** enrich-hotel-record
**Agent:** @enrichment-chief
**Squad:** hotel-enrichment
**Elicit:** false
**Idempotent:** true

## Purpose

Gravar dados validados no campo JSONB `data` da tabela hotels no PostgreSQL.

## Inputs

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `hotel_slug` | string | Yes | Slug do hotel |
| `validated_data` | object | Yes | Output do @data-validator (verdict PASS ou WARN) |

## Pre-Conditions

- Dados passaram pelo quality gate (PASS ou WARN)
- Zero Invention Audit = passed
- hotel_slug existe na tabela hotels

## Steps

1. **Read current JSONB** — Buscar hotels.data atual para o slug
2. **Merge strategy** — Novos dados complementam (não sobrescrevem) dados existentes
   - Se campo já tem valor e nova fonte é inferior → MANTER existente
   - Se campo é null e nova fonte tem dado → PREENCHER
   - Se campo tem valor e nova fonte superior tem valor diferente → ATUALIZAR
3. **Add metadata** — Incluir _meta com enriched_at, sources, quality_score
4. **Update schema columns** — Se extração encontrou pet_friendly ou pool_heated com confidence >= 0.9, atualizar coluna do schema
5. **Upsert** — UPDATE hotels SET data = merged_jsonb WHERE slug = hotel_slug
6. **Log** — Registrar resultado no progress tracker

## Output

```json
{
  "hotel_slug": "string",
  "status": "enriched",
  "fields_added": "number",
  "fields_updated": "number",
  "fields_unchanged": "number",
  "quality_score": "number",
  "completeness": "number (fields_filled / 58)"
}
```

## Veto Conditions

- Dados sem quality gate → REJECT (não gravar)
- hotel_slug não existe na tabela → HALT
- JSONB resultante > 500KB → HALT para revisão
