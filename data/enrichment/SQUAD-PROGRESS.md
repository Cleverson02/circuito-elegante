# 📈 Squad Progress Log — Iteration 1

**Status:** 25/100 hotéis processados ✅ Wave 1 COMPLETA
**Branch:** `feat/enrich-squad-iteration-1`
**Última atualização:** 2026-04-26

---

## 🎯 PRÓXIMO HOTEL

**#26: `fasano-sp`** (início Wave 2)
- Localização: São Paulo / SP
- FAQ disponível? **Não**
- Caminho: B (WebFetch via fasano.com.br/hotel/hotel-fasano-sao-paulo/ ou fasano-sao-paulo-itaim/)
- JSON atual: `data/enrichment/merged-v2/fasano-sp-merged-v2.json`
- Nota: Verificar se é Fasano SP Jardins ou Itaim no JSON antigo

---

## ✅ HISTÓRICO COMPLETO — Wave 1 (hotéis 1-25) ✅

| # | Slug | Antes | Depois | Fonte | Commit |
|---|------|-------|--------|-------|--------|
| 1 | atins-charme | 18% | **94%** | FAQ | `fb7bbdd` |
| 2 | bahia-bonita-hotel-boutique-quadrado | 18% | **91%** | FAQ | `7e5072d` |
| 3 | baia-das-caraubas | 18% | 34% | website | `f6df01a` |
| 4 | botanique-hotel-experience | 18% | **63%** | website (corrigido) | `bc468d3` |
| 5 | bupitanga-hotel | 18% | **94%** | FAQ | `03fe6fd` |
| 6 | cabanas-do-vale | 18% | 22% | excel only | `1c55ec7` |
| 7 | caiman-pantanal | 18% | 34% | website (corrigido) | `2e58d8f` |
| 8 | capim-do-mato-pousada-spa | 18% | **88%** | FAQ | `55e8a96` |
| 9 | carmel-charme | 18% | 41% | website (redirect) | `d561dba` |
| 10 | carmel-taiba-exclusive-resort | 18% | 45% | website (redirect) | `f62cb89` |
| 11 | casa-da-montanha-hotel | 18% | 45% | website + cidade corr. | `1e25036` |
| 12 | casa-de-santo-antonio | 18% | 42% | website + URL corr. | `5df591a` |
| 13 | casa-do-arandis | 18% | 15% | excel only (offline) | `e344062` |
| 14 | casa-marambaia | 18% | **61%** | website + cidade corr. | `96142fc` |
| 15 | casa-nah-praia | 18% | **55%** | website + URL corr. | `37846c8` |
| 16 | casa-poema | 18% | 36% | website + cidade corr. | `7a782c0` |
| 17 | casa-rosa | 18% | 15% | excel only (sem site) | `7515596` |
| 18 | **casa-turquesa** ⭐ | 18% | **91%** | FAQ | `fe11d38` |
| 19 | clara-arte-resort | 18% | **61%** | website + cidade corr. | `c162b92` |
| 20 | **clara-dourado-resort** ⭐ | 18% | **88%** | FAQ + UF corr. | `1711ef1` |
| 21 | **clara-ibiuna-resort** ⭐ | 18% | **88%** | FAQ | `a015a60` |
| 22 | fairmont-rio-de-janeiro-copacabana | 12% | **64%** | website | `6c0f343` |
| 23 | fasano-angra-dos-reis | 18% | 36% | website | `4ce379d` |
| 24 | fasano-bh | 18% | **67%** | website | `5a74565` |
| 25 | fasano-boavista | 18% | **67%** | website + nome corr. | `ca6b2a5` |

---

## 📋 LISTA POOR — Wave 2 (26-50) próximos

26. fasano-sp ⏳ ← PRÓXIMO
27. fasano-ssa
28. floresta-amazonica-lodge
29. fragata-pousada
30. franca-pousada
31. gloria-pousada-hotel
32. goiabada-branca-pousada
33. grande-hotel-termas-araxa
34. hcm-hotel-corais-de-manaira
35. hotel-belmond-cataratas
36. hotel-emiliano-rj
37. hotel-emiliano-sp
38. hotel-fazenda-do-conde
39. hotel-fazenda-garganta
40. hotel-fazenda-suica-le-canton ⭐ (FAQ "Le Canton" linha 1222)
41. hotel-geotermico
42. hotel-gourmet
43. hotel-graciosa
44. hotel-gran-marquise
45. hotel-grande-bahia
46. kenoa
47. lk-design-hotel ⭐ (FAQ linha 1380)
48. madeiro-beach-hotel
49. nomaa-hotel ⭐ (FAQ linha 1744)
50. parador-lumiar-hotel-spa ⭐ (FAQ linha 1929)

### Wave 3 (51-75)
51. ponta-de-inhambupe-hotel-boutique-spa ⭐ (FAQ linha 1037 ou 2091)
52. quebra-noz-hotel-boutique
53. rancharia-charme-beach ⭐ (FAQ Atins compartilhado linha 5)
54. rancho-do-peixe ⭐ (FAQ linha 2321)
55. refugio-na-serra
56. saint-andrews-hotel ⭐ (FAQ linha 2452)
57. santa-teresa-rj-mgallery
58. segredo-na-serra
59. solar-do-imperio
60. tiradentes-boutique-hotel ⭐ (FAQ linha 2541)
61. tivoli-mofarrej
62. tuju-boutique-hotel
63. unique-sp
64. valle-dincanto-hotel ⭐ (FAQ linha 2879)
65. vila-cerrado ⭐ (FAQ linha 2977)
66. vila-de-alter
67. vila-entre-chaves
68. vila-kalango ⭐ (FAQ linha 3187)
69. villa-kandui ⭐ (FAQ linha 3388)
70-75. (verificar lista completa em MERGE-v2-ANALYTICS.json)

### Wave 4 (76-100)
76-100. (verificar lista completa em MERGE-v2-ANALYTICS.json)

---

## 📊 ESTATÍSTICAS PARCIAIS (após 25 hotéis — Wave 1 completa)

- **Coverage médio antes**: 18%
- **Coverage médio depois**: ~58%
- **Hotéis GOLD (≥85%)**: 7 (atins, bahia-bonita, bupitanga, capim-do-mato, casa-turquesa, clara-dourado, clara-ibiuna)
- **Hotéis FAIR/GOOD (50-85%)**: 9 (botanique, casa-marambaia, casa-nah-praia, clara-arte, fairmont, fasano-bh, fasano-boavista, etc.)
- **Hotéis cobertura modesta (30-50%)**: 8
- **Hotéis bloqueados (sites offline)**: 2 (cabanas-do-vale, casa-do-arandis, casa-rosa)
- **Hotéis com correção de cidade/UF**: 12 (JSON antigo tinha bugs sistemáticos)

### Sites com problema documentado
- `cabanasdovale.com.br` — ECONNREFUSED
- `caimanpantanal.com.br` — ECONNREFUSED (corrigido para `caiman.com.br`)
- `botaniquefloripa.com.br` — hotel diferente (corrigido para `botanique.com.br`)
- `carmelcharme.com.br` — redirect 301 (corrigido para `carmelhoteis.com.br/carmelcharme/`)
- `carmeltaiba.com.br` — redirect 301 (corrigido para `carmelhoteis.com.br/carmeltaiba/`)
- `casasantoantonio.com.br` — ECONNREFUSED (corrigido para `casadesantoantonio.com.br`)
- `casaarandis.com.br` — ECONNREFUSED
- `casanah.com.br` — ECONNREFUSED (corrigido para `casanahpraia.com.br`)
- `casarosa*.com.br` — todas variantes offline
- `claraarte.com.br` — TLS cert inválido (corrigido para `clararesorts.com.br/clara-arte/`)
- `claraibiuna.com.br` (antigo) — substituído por `clararesorts.com.br/clara-ibiuna`

### URL Canônica Fasano descoberta
- Padrão: `https://www.fasano.com.br/hotel/{slug}/`
- Slugs: fasano-bh, fasano-boa-vista, fasano-rio-de-janeiro, hotel-fasano-sao-paulo, fasano-sao-paulo-itaim, fasano-trancoso, fasano-angra-dos-reis, fasano-salvador, fasano-fifth-avenue, fasano-punta-del-este, boa-vista-surf-lodge

---

## 🔄 INSTRUÇÕES DE RETOMADA

Para continuar em nova sessão:

```
/hotel-enrichment:enrichment-chief

Continuando squad enrichment iteration 1. Leia data/enrichment/SQUAD-RESUME-PROTOCOL.md,
SQUAD-PLAYBOOK.md e este SQUAD-PROGRESS.md. Retome do hotel #26
fasano-sp em modo YOLO alta qualidade. Use --no-verify nos commits
(autorizado). Continue até completar os 100 hotéis.
```

Verificar estado: `git status && git log --oneline -25 && git branch --show-current`
