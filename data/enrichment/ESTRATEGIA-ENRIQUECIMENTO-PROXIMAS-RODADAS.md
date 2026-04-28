# 🎯 Estratégia de Enriquecimento — Próximas Rodadas

**Data:** 2026-04-28  
**Status:** ✅ PADRÃO MÍNIMO ESTABELECIDO  
**Documento:** Define priorização de hotéis para rodadas futuras

---

## 📊 CLASSIFICAÇÃO ATUAL (92 hotéis)

| Tier | Classificação | Hotéis | Cobertura | Ação |
|------|---------------|--------|-----------|------|
| 🥇 | GOLD | 9 | ≥90% | ✅ NÃO ENRIQUECER |
| 🥈 | GOOD | 25 | 80-89% | ⚠️ Manutenção eventual |
| 🥉 | FAIR | 34 | 50-79% | 🔴 PRIORITÁRIO |
| ❌ | POOR | 24 | <50% | 🔴 CRÍTICO |

---

## 🎯 PADRÃO MÍNIMO ESTABELECIDO

Com base na validação dos hotéis que responderam FAQ (29 hotéis convidados):

### Campos OBRIGATÓRIOS (must-have):
- **1.1** Nome do hotel
- **2.1** Site oficial
- **2.3** Endereço completo ⚠️ *Maior gap*
- **2.4** Telefone de contato ⚠️ *Maior gap*
- **3.1** Descrição/resumo
- **4.2** Tipos de quarto disponíveis

### Campos RECOMENDADOS (should-have):
- **6.1** Restaurantes/opções gastronômicas ⚠️
- **7.1** Lazer e atividades ⚠️
- **8.1** Horários check-in/check-out
- **9.3** FAQs e dúvidas frequentes ⚠️

### Coverage Esperada:
- **GOLD (≥90%):** Todos os campos + dados complementares
- **GOOD (80-89%):** Todos os obrigatórios + maioria dos recomendados
- **FAIR (50-79%):** Obrigatórios parciais + muitos gaps
- **POOR (<50%):** Dados mínimos insuficientes

---

## 📋 HOTÉIS RESPONDENTES FAQ (15/29 encontrados)

### ✅ ACIMA DO PADRÃO (GOLD+GOOD - 14 hotéis):
Estes hotéis podem servir como REFERÊNCIA para os demais.

1. **Bupitanga Hotel** (93.8% - GOLD) — Responde FAQ, praticamente completo
2. **Casa Turquesa** (90.9% - GOLD) — FAQ, apenas falta telefone
3. **LK Design Hotel** (90.9% - GOLD) — FAQ respondente
4. **Clara Dourado Resort** (87.9% - GOOD) — FAQ, bem estruturado
5. **Clara Ibiúna Resort** (87.9% - GOOD) — FAQ respondente
6. **Nomaa Hotel** (87.9% - GOOD) — FAQ respondente
7. **Parador Lumiar Hotel & SPA** (87.9% - GOOD) — FAQ, merge de duplicatas
8. **Pousada Capim do Mato** (84.8% - GOOD) — FAQ respondente
9. **Pousada Mata N'ativa** (84.8% - GOOD) — FAQ respondente
10. **Rancho do Peixe** (87.9% - GOOD) — FAQ respondente
11. **Unique Garden** (84.8% - GOOD) — FAQ respondente
12. **Valle D'Incanto Hotel** (87.9% - GOOD) — FAQ, merge de duplicatas
13. **Vila Kalango** (84.8% - GOOD) — FAQ respondente
14. **Villa Kandui** (84.8% - GOOD) — FAQ respondente

### ⚠️ ABAIXO DO PADRÃO (FAIR - 1 hotel):
Precisa complementação urgente.

15. **Villa Rasa** (51.5% - FAIR) — FAQ respondente, mas faltam 16 campos

### ❌ NÃO ENCONTRADOS EM MERGED-V2 (14 hotéis):
Slug mismatch — provavelmente foram renomeados após merge de duplicatas.
```
- alma-charme-atins-atins-charme-e-rancharia (→ "Atins Charme Chalés"?)
- bahia-bonita (→ "Hotel Boutique Bahia Bonita"?)
- hotel-boutique-spa-ponta-de-inhambupe-ok
- insolito-boutique-hotel-spa (→ "Insólito Boutique Hotel & Spa"?)
- le-canton
- nanii-hotel (→ "Nanii Hotel"?)
- nor-hotel-spa (→ "NÓR Hotel & Spa"?)
- parador-lumiar-hotel-spa (→ "Parador Lumiar Hotel & SPA")
- ponta-de-inhambupe-boutique (→ "Hotel Boutique & SPA Ponta de Inhambupe by Slaviero Hotéis"?)
- saint-andrews (→ "Castelo Saint Andrews"?)
- tiradentes-boutique-hotel (→ "Tiradentes Boutique Hotel"?)
- villa-do-vale (→ "Villa do Vale Boutique Hotel"?)
- villa-dos-nativos-boutique-hotel (→ "Villa dos Nativos Boutique Hotel"?)
- zendaya-resort-beach-sport-spa (→ "Zendaya Resort | Beach | Sport | Spa"?)
```

---

## 🔴 HOTÉIS CRÍTICOS (POOR <50% - 24 hotéis)

Estes hotéis têm cobertura inferior a 50% e faltam até 28 campos.

**Casos extremos (15% cobertura):**
- Casa do Arandis — Apenas 5 campos preenchidos (sítio site quebrado)
- Casa Rosa — Apenas 5 campos preenchidos (site quebrado)
- Fazenda Moréias — Apenas 5 campos preenchidos (dados indisponíveis)
- Madeiro Beach Hotel — Apenas 5 campos preenchidos
- Segredo na Serra — Apenas 5 campos preenchidos
- Tuju Boutique Hotel — Apenas 5 campos preenchidos

**Recomendação:** Para estes 6 hotéis, considerar contato direto ou uso de dados do XLSX apenas (não há fonte web robusta).

---

## 🚀 ESTRATÉGIA PARA PRÓXIMAS RODADAS

### **Rodada 1 (Atual - 2026-04-28):**
✅ **Completada**
- Validação dos 15 hotéis FAQ encontrados
- Estabelecimento do padrão mínimo
- Classificação de todos os 92 hotéis

### **Rodada 2 (Próxima):**
🎯 **58 hotéis FAIR+POOR** (gap >21%)

**Ordem de execução:**
1. **POOR (24 hotéis)** — Prioridade máxima
   - Exceto 6 com sites quebrados (contato direto)
   - Foco: preencher os 6 campos obrigatórios no mínimo
   
2. **FAIR (34 hotéis)** — Prioridade alta
   - Objetivo: levar de 50-79% para ≥80%
   - Foco: preencher recomendados (6.1, 7.1, 8.1, 9.3)

**Ferramentas:**
- Contato direto com hotéis POOR (formulário/telefone)
- Scraping websites (manter hotels.json como fallback)
- Extração FAQ de plataformas (TripAdvisor, Booking)

### **Rodada 3 (Futura):**
🔄 **GOOD (25 hotéis)** — Manutenção

**Objetivos:**
- Levar de 80-89% para ≥90% (entrar em GOLD)
- Complementar campos faltantes (6.1, 7.1, 8.1, 9.3)

---

## 📋 PRÓXIMOS PASSOS

1. **Ambiguidade em slug matching:**
   - Investigar 14 hotéis FAQ que não foram encontrados em merged-v2
   - Confirmar se foram renomeados durante merge de duplicatas
   - Atualizar FAQ-VALIDATION-REPORT.json com mapeamento correto

2. **Contato com hotéis POOR:**
   - Enviar formulário para 18 hotéis POOR (excluindo 6 com sites quebrados)
   - Objetivo: preencher campos obrigatórios + recomendados

3. **Complementação de campos recomendados:**
   - Para FAIR (34 hotéis): buscar 6.1, 7.1, 8.1, 9.3 em plataformas
   - Para GOOD (25 hotéis): eventualmente complementar

4. **Validação de qualidade:**
   - Após cada rodada, executar `validate-concierge-fields.ts`
   - Garantir que campos críticos têm dados reais (nunca fabricados)

---

## ✅ GARANTIAS

- ✅ Nenhum dado foi inventado (Article IV: Zero Invenção)
- ✅ Padrão mínimo documentado e validado
- ✅ Classificação de todos os 92 hotéis pronta
- ✅ Fila de enriquecimento (58 hotéis) ordenada por prioridade
- ✅ Hotéis com problemas de sites identificados

---

**Status:** 🟢 PRONTO PARA PRÓXIMAS RODADAS DE ENRIQUECIMENTO

**Arquivo de priorização:** `data/enrichment/merged-v2/HOTEL-ENRICHMENT-PRIORITY.json`

