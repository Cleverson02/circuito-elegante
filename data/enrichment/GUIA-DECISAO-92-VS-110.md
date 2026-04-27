# 🎯 GUIA DE DECISÃO: 92 vs 110 Hotéis

**Data:** 2026-04-27  
**Status:** ⏸️ AGUARDANDO SUA DECISÃO  
**Impacto:** Afeta se Stella vai usar 92 ou 110 hotéis

---

## 🔴 Problema

```
Circuito Elegante (XLSX) = 92 hotéis
merged-v2 (merged-v2/) = 110 hotéis
Diferença = +18 hotéis "mistério"
```

Identificado:
- ✅ 3 pares de duplicatas (parador, tiradentes, valle)
- ❓ 15+ hotéis faltam explicação

---

## 3 OPÇÕES DE DECISÃO

### 🟢 OPÇÃO 1: Usar apenas os 92 do XLSX (Conservador)

**O que fazer:**
1. Remover 3 duplicatas:
   ```bash
   rm data/enrichment/merged-v2/parador-lumiar-merged-v2.json
   rm data/enrichment/merged-v2/tiradentes-boutique-merged-v2.json
   rm data/enrichment/merged-v2/valle-d-incanto-hotel-merged-v2.json
   ```

2. Investigar e remover os 15+ extras que não estão no XLSX

3. Resultado final: exatamente 92 hotéis

**Vantagens:**
- Alinhado com contrato/lista oficial
- Simples e previsível
- Sem "hotéis mistério"

**Desvantagens:**
- Perder dados de 15+ hotéis já enriquecidos
- Possível que alguns bons hotéis sejam removidos

**Implementação:** ~1-2 horas

---

### 🔵 OPÇÃO 2: Usar todos os 110 (Expansivo)

**O que fazer:**
1. Remover apenas as 3 duplicatas (iguais)
2. Investigar os 15+ extras — mantê-los se tiverem dados bons
3. Renomear merged-v2 para "Circuito Elegante Expandido" ou apenas documentar

**Vantagens:**
- Mais dados para Stella
- Aproveita enriquecimento já feito
- Potencialmente mais hotéis para oferecer

**Desvantagens:**
- Pode ter hotéis "fora de escopo" (não autorizado?)
- Pode causar confusão com lista oficial
- Precisa validação adicional

**Implementação:** ~2-3 horas

---

### 🟡 OPÇÃO 3: Investigar Primeiro, Depois Decidir (Recomendado)

**O que fazer:**
1. Ler o código de `merge-enrichment-v2-template-driven.ts`
2. Ver qual fonte adicionou os 18+ hotéis (FAQ? PILOT? ENRICHMENT?)
3. Decidir com base na origem:
   - Se foi FAQ → pode ser importante (clientes responderam)
   - Se foi ENRICHMENT → pode ser scrape antigo (duvidoso)
   - Se foi PILOT → pode ser validado

4. Depois escolher Opção 1 ou 2

**Vantagens:**
- Fundado em dados e lógica
- Evita decisão precipitada
- Permite justificar para stakeholders

**Desvantagens:**
- Leva mais tempo (~3-4 horas)
- Requer leitura de código

**Implementação:** ~4-5 horas total

---

## 📋 Sua Decisão Afeta

- ✅ Quantos hotéis Stella vai indexar
- ✅ Coverage final (será 58% ou diferente?)
- ✅ Se há "hotéis extras" no sistema
- ✅ Quando Stella pode ir para produção
- ✅ Possível necessidade de "revisão editorial"

---

## 🎬 PRÓXIMO PASSO

**Você decide:**

```
[ ] OPÇÃO 1 — Manter apenas 92 (limpar agora)
[ ] OPÇÃO 2 — Manter 110 (documentar depois)
[ ] OPÇÃO 3 — Investigar origem dos 18+ (depois decidir)
[ ] OUTRA — Outra abordagem que você tenha em mente
```

Qual você escolhe?
