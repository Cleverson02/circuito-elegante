# Deep Scraping Phase Initiative — Corrigir Shallow Scraping

**Status:** 🚀 INICIADA - Batch 1 em Background com @higgins  
**Data:** 2026-04-07

---

## 📊 Problema Identificado

### Shallow Scraping (Phase 3)
- Agentes web-scraper extraíram apenas homepage
- **Exemplo:** Kurotel website tem 70%+ de dados, mas squad extraiu apenas 22%
- **Impacto:** Phase 3 contribuiu apenas +2 hotéis para meta EPIC-7

### Validação Realizada
- 12 hotéis com websites mas dados insuficientes (< 25%)
- 6 inconsistências: status externo (P3_WITH_WEBSITE) ≠ interno (P1_ONLY)
- Conclusão: Scraping foi superficial, não deep

---

## 🎯 Solução: Deep OSINT Scraping

### Agente: @higgins (Bellingcat OSINT Investigator)
- **Especialidade:** OSINT investigação profunda, triangulação de múltiplas fontes
- **Metodologia:** Bellingcat framework (discovery → verification → triangulation)
- **Técnica:** 
  - Navegar TODAS as páginas do website (não apenas homepage)
  - Extrair dados estruturados de cada página
  - Triangular contra Google Maps, TripAdvisor, Booking.com
  - Documentar cada fonte com URL e timestamp

---

## 📋 Batches de Deep Scraping

### Batch 1 — LANÇADO ✅
```
Agente: @higgins (Deep Research squad)
Status: EM BACKGROUND
Hotéis (3):
  1. kurotel-spa (22% → target 70%+)
  2. madeiro-beach-hotel (22% → target 60%+)
  3. pousada-cantelli (28% → target 50%+)

Tempo estimado: 30 min
```

### Batch 2 — PLANEJADO
```
Hotéis (10):
  1. canto-do-irere-boutique-hotel (17%)
  2. carmel-charme (17%)
  3. carmel-taiba-exclusive-resort (17%)
  4. casa-da-montanha-hotel (17%)
  5. casa-de-santo-antonio (17%)
  6. casa-do-arandis (17%)
  7. casa-marambaia (17%)
  8. casa-nah-praia (17%)
  9. casa-poema (17%)
  10. casa-rosa (21%)

Tempo estimado: 45 min
Condição: Após conclusão Batch 1
```

### Batch 3 — BONUS (baixa prioridade)
```
Hotéis (3):
  1. fasano-angra-dos-reis (67%)
  2. fasano-boavista (64%)
  3. fasano-bh (57%)

Tempo estimado: 20 min
Objetivo: Consolidação + levar para 70%+
```

---

## 📈 Métricas Esperadas

### Impacto Estimado
```
Baseline (Phase 3 shallow):  33 hotéis >= 70%
Depois Batch 1 (3 hotéis):   36 hotéis >= 70%
Depois Batch 2 (10 hotéis):  41-43 hotéis >= 70% (5-7 podem atingir 70%)
Depois Batch 3 (3 Fasano):   43-46 hotéis >= 70%

Meta EPIC-7: 85+ hotéis >= 70%
Gap remanescente: 39-42 hotéis → Phase 4 (Chatbot)
```

### Timeline Total
```
Batch 1: 30 min
Consolidação: 10 min
Batch 2: 45 min
Consolidação: 10 min
Batch 3: 20 min
Consolidação: 10 min
---
TOTAL: ~125 min (2h 5min)
```

---

## 🔄 Workflow

```
Batch 1 (Higgins OSINT Deep Scrape)
  ↓ [30 min]
[Consolidação dados]
  ↓ [10 min]
  
Batch 2 (Higgins OSINT Deep Scrape)
  ↓ [45 min]
[Consolidação dados]
  ↓ [10 min]
  
Batch 3 (Higgins OSINT Deep Scrape)
  ↓ [20 min]
[Consolidação dados]
  ↓ [10 min]
  
ANÁLISE FINAL
  ├─ Se >= 85 hotéis >= 70%: ✅ META ATINGIDA
  └─ Se < 85: PHASE 4 (Chatbot para gaps) ~2h

TOTAL TEMPO: 2.5-4h até meta EPIC-7
```

---

## ✅ Checklist

- [x] Identificar problema (shallow scraping)
- [x] Validar inconsistências
- [x] Localizar agente especializado (@higgins)
- [x] Lançar Batch 1
- [ ] Consolidar dados Batch 1
- [ ] Lançar Batch 2
- [ ] Consolidar dados Batch 2
- [ ] Lançar Batch 3 (opcional)
- [ ] Consolidar dados Batch 3
- [ ] Análise final de completeness
- [ ] Decidir: Phase 4 (Chatbot) necessária?

---

## 🚨 Diferença: Shallow vs Deep Scraping

### Shallow (Phase 3)
```
Website → Homepage → Extract summary text → Save

Resultado: 6-15 campos
Exemplo: "Spa médico 5⭐, 5 prêmios" = 22% completeness
```

### Deep (Higgins OSINT)
```
Website → Homepage
        ├→ /hospedagem → Room types, capacities, amenities
        ├→ /programas → Spa programs, activities, descriptions
        ├→ /gastronomia → Restaurants, menus, options
        ├→ /contato → Phone, email, WhatsApp, address
        ├→ /politicas → Check-in/out, pet policy, cancellation
        └→ /faq → Additional policies, accessibility

Triangulate against: Google Maps, TripAdvisor, Booking.com

Resultado: 35-50 campos
Esperado: 60-80% completeness
```

---

## 📞 Status & Próximos Passos

**Aguardando:** Conclusão de Batch 1 (Higgins OSINT Deep Scraping)  
**Tempo estimado:** ~30 min

**Depois:** Consolidar + Lançar Batch 2

---

*Deep Scraping Phase Initiative — 2026-04-07*
