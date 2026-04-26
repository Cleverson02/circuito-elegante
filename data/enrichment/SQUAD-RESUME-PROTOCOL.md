# 🔄 Protocolo de Retomada — Squad Enrichment Iteration 1

**Última sessão:** 2026-04-26
**Branch:** `feat/enrich-squad-iteration-1`
**Status:** 9/100 hotéis processados (Wave 1 em progresso)
**Próximo:** Hotel #10 `carmel-taiba-exclusive-resort`

---

## ⚡ COMANDO DE RETOMADA (cole na nova sessão)

```
/hotel-enrichment:enrichment-chief

Contexto: continuando squad iteration 1 da branch feat/enrich-squad-iteration-1.
Leia OBRIGATORIAMENTE em ordem:
1. data/enrichment/SQUAD-RESUME-PROTOCOL.md (este arquivo - estado completo)
2. data/enrichment/SQUAD-PLAYBOOK.md (procedimento por hotel)
3. data/enrichment/SQUAD-PROGRESS.md (último hotel feito + próximo)

Depois retome do hotel #10 carmel-taiba-exclusive-resort em modo YOLO alta qualidade,
processando em ordem da lista POOR de MERGE-v2-ANALYTICS.json, 1 commit por hotel
com prefixo "enrich({slug}):", usando --no-verify (autorizado pelo usuário pois
husky roda full test suite e há 7 testes pre-existentes falhando não relacionados).

Continue até o final dos 100 hotéis.
```

---

## 🎯 OBJETIVO DA TAREFA

Enriquecer os 100 hotéis classificados como POOR no `MERGE-v2-ANALYTICS.json`,
elevando coverage de ~18% (POOR) para o máximo possível (alvo: 60%+ FAIR ou
80%+ GOOD), respeitando **Article Zero — Zero Invenção**:

- Fonte real obrigatória por campo (`source_type` + `source_url`)
- Campo sem dado = `null` (NUNCA inferir, deduzir ou inventar)
- Schema usa **template codes** (1.1 a 10.2 conforme `TEMPLATE-DADOS-MINIMOS-OBRIGATORIOS.md`)

---

## 📊 ESTADO ATUAL (snapshot 2026-04-26)

### Branch & Git
- Branch: `feat/enrich-squad-iteration-1` (criada de `main` HEAD `3e8b2d0`)
- Commits feitos: 1 baseline + 9 enrichment = 10 commits
- Working tree: limpo (após commit hotel #9)
- Husky pre-commit: roda `npm test` com 7 falhas pre-existentes
  (`transfer-to-human` schema mismatch — bug pre-existente da branch). USAR `--no-verify`.
- Stash original (pre-squad): `stash@{0}` com framework AIOX (978 untracked files)

### Hotéis Processados (9/100)
| # | Slug | Antes | Depois | Fonte | Notas |
|---|------|-------|--------|-------|-------|
| 1 | atins-charme | 18% | **94%** | FAQ | GOLD |
| 2 | bahia-bonita-hotel-boutique-quadrado | 18% | **91%** | FAQ | GOLD |
| 3 | baia-das-caraubas | 18% | 34% | web | Site minimalista |
| 4 | botanique-hotel-experience | 18% | **63%** | web | Site corrigido (era floripa) |
| 5 | bupitanga-hotel | 18% | **94%** | FAQ | GOLD |
| 6 | cabanas-do-vale | 18% | 22% | excel | Site offline; cidade corrigida (Petrópolis/RJ) |
| 7 | caiman-pantanal | 18% | 34% | web | Site corrigido (caiman.com.br) |
| 8 | capim-do-mato-pousada-spa | 18% | **88%** | FAQ | GOLD adults-only |
| 9 | carmel-charme | 18% | 41% | web | Site redirect (carmelhoteis.com.br) |

### Hotéis Pendentes (91/100)
Em ordem da lista POOR de `MERGE-v2-ANALYTICS.json`:

**Wave 1 restante (hotéis 10-25):**
10. carmel-taiba-exclusive-resort — sem FAQ
11. casa-da-montanha-hotel — sem FAQ
12. casa-de-santo-antonio — sem FAQ
13. casa-do-arandis — sem FAQ
14. casa-marambaia — sem FAQ
15. casa-nah-praia — sem FAQ
16. casa-poema — sem FAQ
17. casa-rosa — sem FAQ
18. **casa-turquesa** — FAQ ⭐
19. clara-arte-resort — sem FAQ
20. **clara-dourado-resort** — FAQ ⭐
21. **clara-ibiuna-resort** — FAQ ⭐
22. fairmont-rio-de-janeiro-copacabana — sem FAQ
23. fasano-angra-dos-reis — sem FAQ
24. fasano-bh — sem FAQ
25. fasano-boavista — sem FAQ

**Waves 2-4 (hotéis 26-100):**
fasano-sp, fasano-ssa, floresta-amazonica-lodge, fragata-pousada, franca-pousada,
gloria-pousada-hotel, goiabada-branca-pousada, grande-hotel-termas-araxa,
hcm-hotel-corais-de-manaira, hotel-belmond-cataratas, hotel-emiliano-rj,
hotel-emiliano-sp, hotel-fazenda-do-conde, hotel-fazenda-garganta,
**hotel-fazenda-suica-le-canton** (FAQ ⭐ "Le Canton"), hotel-geotermico,
hotel-gourmet, hotel-graciosa, hotel-gran-marquise, hotel-grande-bahia,
kenoa, **lk-design-hotel** (FAQ ⭐), madeiro-beach-hotel, **nomaa-hotel** (FAQ ⭐),
**parador-lumiar-hotel-spa** (FAQ ⭐), **ponta-de-inhambupe-hotel-boutique-spa** (FAQ ⭐),
quebra-noz-hotel-boutique, rancharia-charme-beach (compartilha FAQ Atins ⭐),
**rancho-do-peixe** (FAQ ⭐), refugio-na-serra, **saint-andrews-hotel** (FAQ ⭐),
santa-teresa-rj-mgallery, segredo-na-serra, solar-do-imperio,
**tiradentes-boutique-hotel** (FAQ ⭐), tivoli-mofarrej, tuju-boutique-hotel,
unique-sp, **valle-dincanto-hotel** (FAQ ⭐), **vila-cerrado** (FAQ ⭐),
vila-de-alter, vila-entre-chaves, **vila-kalango** (FAQ ⭐), **villa-kandui** (FAQ ⭐),
... e demais até completar 100.

**FAQ-backed POOR hotels** (alta prioridade): ~16 dos 91 restantes têm FAQ.

---

## 📚 FONTES DISPONÍVEIS (priorização Article Zero)

### Prioridade 1 — Questionnaire (FAQ)
**Arquivo:** `data/faqs/Questionário de Informações - Hotéis Circuito Elegante.md` (3781 linhas)

**Seções e linhas:**
| Seção | Linha início | Hotéis cobertos |
|-------|-------------|-----------------|
| Alma Charme, Atins Atins Charme e Rancharia | 5 | atins-charme ✅, alma-charme-atins, rancharia-charme-beach |
| Bahia Bonita | 226 | bahia-bonita-hotel-boutique-quadrado ✅ |
| Bupitanga Hotel | 365 | bupitanga-hotel ✅ |
| Casa Turquesa | 523 | casa-turquesa |
| Clara Ibiúna Resort | 664 | clara-ibiuna-resort |
| Clara Dourado Resort | 839 | clara-dourado-resort |
| Hotel Boutique & SPA Ponta de Inhambupe OK | 1037 | ponta-de-inhambupe-hotel-boutique-spa |
| Insólito Boutique Hotel & SPA | 1079 | (já GOLD, skip) |
| Le Canton | 1222 | hotel-fazenda-suica-le-canton |
| LK Design Hotel | 1380 | lk-design-hotel |
| Nanii Hotel | 1514 | (não na POOR) |
| Nomaa Hotel | 1744 | nomaa-hotel |
| Nór Hotel & Spa | 1816 | (já GOLD, skip) |
| Parador Lumiar Hotel & SPA | 1929 | parador-lumiar-hotel-spa |
| Ponta de Inhambupe Boutique | 2091 | ponta-de-inhambupe-hotel-boutique-spa (alt) |
| Pousada Capim do Mato | 2177 | capim-do-mato-pousada-spa ✅ |
| Pousada Mata N'ativa | 2248 | (não na POOR) |
| Rancho do Peixe | 2321 | rancho-do-peixe |
| Saint Andrews | 2452 | saint-andrews-hotel |
| TIRADENTES BOUTIQUE HOTEL | 2541 | tiradentes-boutique-hotel |
| UNIQUE GARDEN | 2681 | (não é unique-sp; conferir) |
| Valle D'Incanto Hotel | 2879 | valle-dincanto-hotel |
| Vila Cerrado | 2977 | vila-cerrado |
| Villa do Vale | 3039 | (não na POOR) |
| Vila Kalango | 3187 | vila-kalango |
| Villa dos Nativos Boutique Hotel | 3289 | (não na POOR) |
| Villa Kandui | 3388 | villa-kandui |
| Villa Rasa | 3509 | (não na POOR) |
| Zendaya resort Beach Sport & SPA | 3633 | (não na POOR) |

### Prioridade 2 — Hotel Website (WebFetch)
- URL canônica do JSON existente OU correção via redirect 301
- Extrair os 32 campos do template
- Marcar `NOT_FOUND` → `null` no JSON

### Prioridade 3 — Excel Authoritative
**Arquivo:** `data/faqs/lista-hoteis-circuito-elegante.xlsx`
- Para campos: município, UF, região, destino, ID
- Excel sobrescreve dados anteriores se houver conflito (Article Zero: source priority)

### NUNCA usar
- Inferência baseada em "hotéis similares"
- Conhecimento geral sobre cidades/destinos
- Generalização de redes (ex: Fasano X tem Y, logo Fasano Z tem Y)

---

## 📋 SCHEMA TARGET (template codes 1.1-10.2)

Ver `data/enrichment/TEMPLATE-DADOS-MINIMOS-OBRIGATORIOS.md` para definições completas.

```
1.1 name | 1.2 municipality | 1.3 uf | 1.4 region_stella | 1.5 destination_stella
2.1 website_url | 2.2 google_maps_url | 2.3 address | 2.4 phone
3.1 description | 3.2 hotel_type
4.1 total_rooms | 4.2 room_types | 4.3 room_amenities
5.1 parking | 5.2 pools | 5.3 pool_heated
6.1 restaurants | 6.2 meals_included | 6.3 gastronomic_experiences | 6.4 room_service
7.1 leisure_items | 7.2 wellness_services | 7.3 special_programming
8.1 check_in_out | 8.2 early_late_checkin | 8.3 cancellation_policy | 8.4 children_pets_policy
9.1 concierge | 9.2 transfers | 9.3 frequent_faqs
10.1 differentials | 10.2 restrictions
```

**Schema migrations comuns** (ao reescrever JSONs antigos):
- `1.7` (website_url) → `2.1`
- `2.1` (room_types antigo) → `4.2`
- `3.4` (leisure_items antigo) → `7.1`
- `10.0` (contact: phone+website+address) → `2.2`/`2.3`/`2.4`

---

## ✅ CHECKLIST POR HOTEL (Playbook resumido)

Ver `data/enrichment/SQUAD-PLAYBOOK.md` para detalhes.

1. `Read` `data/enrichment/merged-v2/{slug}-merged-v2.json` — capturar excel_data + slug
2. Verificar se hotel tem FAQ (consultar tabela acima)
3. Se FAQ: `Read` linhas correspondentes
4. Se sem FAQ: `WebFetch` site oficial (do JSON ou inferido); seguir redirect 301
5. Construir JSON novo com:
   - Schema template codes 1.1-10.2
   - Cada campo com `value`, `source_type`, `source_url`
   - `null` para campos sem dado real
   - `template_fields` true/false alinhado
   - `template_coverage` = (true count) / 32
   - `gap_fields` = lista de codes false
   - `enrichment_history` com timestamp + fields_added + coverage_before/after
   - Manter `excel_data` original
3. `Write` arquivo (cuidado: precisa `Read` antes do `Write`)
4. `git add data/enrichment/merged-v2/{slug}-merged-v2.json`
5. `git commit --no-verify -m "enrich({slug}): add N fields from {source} (X%→Y%)"`

---

## ⚠️ DESCOBERTAS IMPORTANTES (data quality issues)

### Inconsistências slug → cidade encontradas até agora
| Slug | JSON anterior | Excel autoritativo | Observação |
|------|---------------|--------------------|------------|
| baia-das-caraubas | Jericoacoara | Camocim | Excel correto |
| botanique-hotel-experience | Florianópolis (site Floripa) | Bairro dos Mellos/Campos do Jordão | Site era de outro hotel; corrigido para botanique.com.br |
| cabanas-do-vale | Pirenópolis/GO | Petrópolis/RJ (Itaipava) | Site offline; telefone DDD 62 (GO) também suspeito |
| caiman-pantanal | URL caimanpantanal.com.br | URL canônica caiman.com.br | ECONNREFUSED; usar caiman.com.br |
| carmel-charme | URL carmelcharme.com.br | redirect para carmelhoteis.com.br/carmelcharme/ | 301 |

**Padrão a seguir**: quando JSON antigo conflita com Excel, **Excel vence**.
URLs com typos (espaços, etc) são bugs do scrape antigo — verificar e corrigir.

### URLs de site com bugs frequentes
- Espaço dentro de URL: `cabanasdo vale.com.br` (typo)
- Subdomínio errado: `botaniquefloripa.com.br` vs `botanique.com.br`
- ECONNREFUSED em vários: tentar variantes (com/sem www, .com.br vs .com)

---

## 🚦 REGRAS DURAS (não-negociáveis)

1. **Article Zero — Zero Invenção**: campo sem fonte real = `null`. Sempre.
2. **1 commit por hotel**: prefixo `enrich({slug}):`
3. **`--no-verify`**: husky bloqueia por testes pre-existentes não-relacionados; YOLO autorizado pelo usuário em 2026-04-26.
4. **Branch**: nunca trocar de `feat/enrich-squad-iteration-1` durante o squad.
5. **Schema**: usar template codes (1.1-10.2). Migrar codes antigos (1.7, 2.1 errado, 3.4, 10.0).
6. **Source tags**: cada campo preenchido tem `source_type` + `source_url`.
7. **Husky**: não fixar tests; eles são pre-existentes (ver memória `transfer-to-human-schema-mismatch`).

---

## 💾 ARQUIVOS DESTE PROTOCOLO

- `data/enrichment/SQUAD-RESUME-PROTOCOL.md` (este arquivo)
- `data/enrichment/SQUAD-PLAYBOOK.md` (procedimento detalhado)
- `data/enrichment/SQUAD-PROGRESS.md` (log de progresso, atualizar a cada hotel)
- `data/enrichment/merged-v2/MERGE-v2-ANALYTICS.json` (lista POOR original)
- `data/enrichment/TEMPLATE-DADOS-MINIMOS-OBRIGATORIOS.md` (definição dos 32 campos)
- `data/enrichment/EXEMPLO-CONCRETO-SQUAD-ENRIQUECIMENTO.md` (exemplo de saída esperada)
- `data/faqs/Questionário de Informações - Hotéis Circuito Elegante.md` (FAQ master)
