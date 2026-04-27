# 🔍 Análise: Discrepância 92 hotéis (Circuito Elegante) vs 110 (merged-v2)

**Data:** 2026-04-27  
**Problema:** merged-v2 tem 110 hotéis, mas Circuito Elegante deveria ter 92  
**Diferença:** +18 hotéis

---

## 📊 Contagem Verificada

| Fonte | Total | Notas |
|-------|-------|-------|
| **XLSX original** | 92 | Lista oficial do Circuito Elegante |
| **merged-v2** | 110 | Resultado do merge de 4 fontes |
| **Diferença** | **+18** | A ser explicada |

---

## 🔴 CAUSA IDENTIFICADA: Duplicatas de Slug

Existem **3-4 pares de arquivos** que representam o **mesmo hotel** com nomes de arquivo DIFERENTES:

### 1️⃣ PARADOR LUMIAR (DUPLICADO)

| Slug A | Slug B | Hotel Real | Status |
|--------|--------|-----------|--------|
| `parador-lumiar-hotel-spa` | `parador-lumiar` | Parador Lumiar Hotel & SPA | ✅ DUPLICADO |

**Análise:**
- Ambos têm `"name": "Parador Lumiar Hotel & SPA"`
- Mesmo conjunto de acomodações (Chalé Luxo, Lago, Ofurô)
- **Conclusão:** SÃO O MESMO HOTEL — um é duplicata do outro

---

### 2️⃣ TIRADENTES BOUTIQUE (DUPLICADO)

| Slug A | Slug B | Hotel Real | Status |
|--------|--------|-----------|--------|
| `tiradentes-boutique-hotel` | `tiradentes-boutique` | Tiradentes Boutique Hotel | ✅ DUPLICADO |

**Análise:**
- Ambos têm `"name": "Tiradentes Boutique Hotel"`
- Mesmo tipo de acomodação (Apartamento Único, 10 unidades)
- Dados quase idênticos (apenas formatação diferente)
- **Conclusão:** SÃO O MESMO HOTEL — variação de slug

---

### 3️⃣ VALLE D'INCANTO (DUPLICADO)

| Slug A | Slug B | Hotel Real | Status |
|--------|--------|-----------|--------|
| `valle-dincanto-hotel` | `valle-d-incanto-hotel` | Valle D'Incanto Hotel | ✅ DUPLICADO |

**Análise:**
- Ambos têm `"name": "Valle D'Incanto Hotel"`
- Mesmo restaurante (Osteria di Lucca)
- Mesmas suítes (Deluxe, Romântica, Panorâmica, Super Luxo)
- **Conclusão:** SÃO O MESMO HOTEL — typo de slug (dincanto vs d-incanto)

---

### 4️⃣ LE CANTON (POSSÍVEL MÚLTIPLO OU DUPLICADO)

| Slug | Nome | Observação |
|------|------|-----------|
| `hotel-fazenda-suica-le-canton` | Hotel Fazenda Suíça Le Canton | Pode ser hotel diferente |
| `le-canton-hotel` | Hotel Magique (complexo Le Canton) | Pode ser outro hotel do complexo |
| `hotel-village-le-canton` | ? | VERIFICAR |

**Status:** ⚠️ INCERTO — Le Canton pode ter 3 hotéis diferentes no complexo, ou podem ser duplicatas

---

### 5️⃣ CHARME ATINS (HOTÉIS DIFERENTES)

| Slug | Nome | Observação |
|------|------|-----------|
| `atins-charme` | Atins Charme Chalés | Hotel 1 |
| `pousada-alma-charme-atins` | Alma Charme Atins | Hotel 2 (diferente) |

**Status:** ✅ DIFERENTES — São 2 hotéis distintos em Atins

---

## 📈 Contagem de Duplicatas Confirmadas

**Duplicatas Certas:**
1. parador-lumiar
2. tiradentes-boutique
3. valle-dincanto-hotel

**Total Duplicatas Certas:** 3 pares = **3 hotéis extras** ❌

**Duplicatas Prováveis (Le Canton):**
- Se `le-canton-hotel` é duplicata: +1
- Se `hotel-village-le-canton` é duplicata: +1

**Total com Le Canton:** até +5 duplicatas ❌

---

## 🎯 O Que Explica os +18?

Isso explica apenas **3-5 duplicatas**.

Há **13-15 hotéis faltando explicação**.

Possibilidades:

1. **Hotéis adicionais do FAQ questionnaire** que não estão no XLSX
   - O FAQ pode ter hotéis que não são "Circuito Elegante" oficial
   
2. **Hotéis de outras fontes** (PILOT, ENRICHMENT, EXCEL) que foram incluídos

3. **Mais duplicatas ainda não identificadas** com variações de slug

---

## 🔧 Recomendações para Corrigir

### Opção A: Remover Duplicatas (Manter 92)

```bash
rm data/enrichment/merged-v2/parador-lumiar-merged-v2.json
rm data/enrichment/merged-v2/tiradentes-boutique-merged-v2.json
rm data/enrichment/merged-v2/valle-d-incanto-hotel-merged-v2.json
# Se Le Canton duplicados, remover também
```

**Resultado:** 110 - 3 = 107 (ainda faltam 15)

### Opção B: Investigar Origem dos 18+

1. Ler merge-enrichment-v2-template-driven.ts
2. Verificar qual fonte adicionou esses hotéis
3. Decidir se devem fazer parte do "Circuito Elegante" ou não

### Opção C: Validar com XLSX

Comparar a lista completa do XLSX com merged-v2 para identificar:
- Quais 92 do XLSX estão em merged-v2
- Quais 18 estão em merged-v2 mas NÃO estão no XLSX
- Decidir se incluir ou excluir

---

## 🎓 Conclusão

**Status:** Problema confirmado e parcialmente explicado

**Próximo Passo:** Opção B ou C — investigar origem dos 18+ hotéis extras antes de rodar normalização para Stella
