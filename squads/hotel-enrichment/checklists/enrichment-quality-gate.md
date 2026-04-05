# Enrichment Quality Gate Checklist

**Squad:** hotel-enrichment
**Purpose:** Validar qualidade dos dados enriquecidos antes de gravar no PostgreSQL
**Agent:** @data-validator
**Gate:** Per-hotel, executado após Phase 3 (Validate) do pipeline

---

## Pre-Conditions

- [ ] Pelo menos 1 fonte de dados consultada com sucesso
- [ ] Extração mapeou campos para a taxonomia de 58 campos
- [ ] Source metadata (URLs, timestamps) presentes para cada campo

---

## Quality Dimensions

### Accuracy (peso: 35%)

- [ ] URLs de site oficial respondem com HTTP 200
- [ ] UF corresponde ao município
- [ ] Região geográfica coerente com UF
- [ ] Horários de check-in/out em formato válido (HH:MM)
- [ ] Tipo de experiência coerente com localização
- [ ] Nenhum campo marcado como "inferido" ou "provavelmente"
- [ ] Score accuracy >= 0.8 (PASS) ou >= 0.6 (WARN)

### Completeness (peso: 30%)

- [ ] Campos preenchidos contabilizados corretamente
- [ ] Campos null marcados como "não encontrado" (não como bug)
- [ ] Completeness score calculado: campos preenchidos / 58
- [ ] Se completeness < 30%: verificar se scraping funcionou

### Consistency (peso: 20%)

- [ ] Dados de múltiplas fontes não conflitam
- [ ] Se conflitam: prioridade Drive > CE > Site aplicada
- [ ] Nome do hotel consistente entre fontes
- [ ] Booleans (pet, pool) não contradizem entre fontes

### Currency (peso: 15%)

- [ ] Fontes acessadas nos últimos 30 dias
- [ ] Dados não referenciam eventos/datas passadas
- [ ] Preços/políticas não referenciam anos anteriores

---

## Zero Invention Audit

- [ ] **CRÍTICO:** Nenhum campo foi preenchido sem source_text correspondente
- [ ] **CRÍTICO:** Nenhum campo foi inferido de "hotéis similares"
- [ ] **CRÍTICO:** Nenhum campo tem confidence alta sem evidência
- [ ] Campos genuinamente não encontrados = null (não string vazia)

---

## JSONB Structure

- [ ] Todas as chaves em snake_case
- [ ] Arrays não contêm nulls
- [ ] _meta.sources presente com URLs rastreáveis
- [ ] _meta.enriched_at com timestamp ISO
- [ ] _meta.quality_score presente
- [ ] _meta.completeness presente
- [ ] Tamanho total JSONB < 500KB

---

## Verdict

| Resultado | Condição | Ação |
|-----------|----------|------|
| **PASS** | accuracy >= 0.8, no CRITICAL issues | Gravar no PostgreSQL |
| **WARN** | accuracy >= 0.6, minor issues | Gravar com flags de atenção |
| **FAIL** | accuracy < 0.6 ou CRITICAL issue | Retornar para re-extração |

---

## Post-Gate

- [ ] Dados gravados no JSONB (se PASS/WARN)
- [ ] Schema columns atualizadas (pet_friendly, pool_heated se encontrados)
- [ ] Progress tracker atualizado
- [ ] Issues registradas para revisão futura (se WARN)
