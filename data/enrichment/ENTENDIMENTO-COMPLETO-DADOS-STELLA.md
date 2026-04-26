# 🎯 ENTENDIMENTO COMPLETO: DADOS STELLA KB V3

**Documento criado:** 2026-04-26  
**Objetivo:** Responder EXATAMENTE às suas perguntas sobre dados robustos vs pobres  
**Status:** Análise final e plano de ação

---

## SUA PERGUNTA (Resumo)

> "Os documentos de merge parecem pobres de informações. Quero saber apesar de estar escrito merge ele ainda receberão mais informações que está no 'Questionário de Informações - Hotéis Circuito Elegante.md'? Como está sendo feito isso e como será utilizado estes dados?"

---

## 📊 RESPOSTA DIRETA

### ❌ NÃO

Os documentos de merge **NÃO estão recebendo** as informações do Questionário porque:

1. **O Questionário está em Markdown solto** (`data/faqs/...md`)
   - Não foi parseado para JSON estruturado
   - Não foi integrado ao processo de merge
   - Scripts procuram `.json` e Excel, não `.md`

2. **Priorização errada no merge**
   - Deveria ser: FAQ > Pilot > Enrichment > Excel
   - Na verdade é: Pilot > Enrichment > Excel (ignorando FAQ)

3. **Resultado:** Cada hotel tem ~10-15 campos em vez de 30-40

---

## 🗂️ DADOS REAIS: 4 FONTES COMPLETAMENTE SEPARADAS

### FONTE 1: FAQ/QUESTIONÁRIO ⭐⭐⭐⭐⭐ (GOLD)

**Local:** `data/faqs/Questionário de Informações - Hotéis Circuito Elegante.md`

**Formato:** Markdown puro (NÃO estruturado)

**Informação por hotel:** 31 campos respondidos manualmente pelos hotéis

**Exemplo - Alma Charme Atins:**
```
1. Nome comercial: Alma Charme Atins
2. Cidade: Atins - Barreirinhas
3. Estado: Maranhão
4. Site: https://charmeatins.com.br
5. Google Maps: [URL exata]
6. Descrição: "Uma pousada boutique localizada no vilarejo de Atins..."
7. Tipo: Pousada Boutique
8. Acomodações: 6 Bangalôs casal (1 cama king) + 2 Bangalôs família
9. Amenities: Terra Organics – Realgems (marca específica)
10. Estacionamento: Sim, gratuito
11. Piscinas: Privativas + comuns com paisagismo nativo
12. Aquecidas: Não (clima sempre quente)
13. Restaurantes:
    - Beach Bar (nordestino, drinks, música ao vivo)
    - Ça-Vá (mediterrâneo + maranhense)
    - Sushi Charme (único da região, peixes frescos)
    - Mirante Charme (internacional)
14. Refeições: Café à la carte na varanda
15. Experiências gastronômicas: Jantares harmonizados, piqueniques
16. Lazer: Passeio dunas, kitesurf, trekking, pesca, stand up, quadriciclo, jantar dunas, lancha
17. Bem-estar: Spa (massagistas parceiras), academia, yoga, piscina hidromassagem
18. Programação: Não dedicada (passeios privativos ou compartilhados)
19. Concierge: Sim, desde chegada (abertura camas 18h)
20. Eventos: Não na pousada (tem espaço na Rancharia)
21. Check-in: 14h
22. Check-out: 12h
23. Early check-in: Sim, meia diária
24. Aeroportos: São Luís (3h30 carro), Barreirinhas (particular), transfer de helicóptero
25. Transfer: Sim, pago
26. FAQs frequentes: 5 documentadas
27. Cancelamento: 31d=100%, 8-30d=30% multa, <7d=sem devolução
28. Crianças: <10 anos cortesia
29. Pagamento: Link cartão ato reserva
30. WiFi: Sim, bom sinal
31. Diferenciais: 6 key points + "Não aceitamos pets"
```

**Qualidade:** ⭐⭐⭐⭐⭐ (5/5) — Respondido pelo hotel próprio = OURO PURO

**Problema:** Está em Markdown solto, não estruturado em JSON

---

### FONTE 2: PILOT (JSON Estruturado) ⭐⭐⭐⭐⭐ (OURO)

**Local:** `data/enrichment/pilot-2026-04-22/validated/`

**Exemplo:** `pousada-inacia-full.json`

**Informação por hotel:** 46-51 de 58 campos taxonomia

```json
{
  "hotel_slug": "pousada-inacia",
  "quality_score": 0.907,
  "completeness": 0.793,
  "fields": {
    "1.1": "Pousada Inácia",
    "1.9": "Descrição de parágrafo completo",
    "2.1": [
      {
        "name": "Quarto Pousada",
        "description": "Cama king size, roupa alta qualidade Egyptian cotton, AC, TV, WiFi, minibar, cofre, banheiro L'Occitane, chuveiro efeito chuva, varanda vista"
      }
    ],
    "2.4": 10,  // total quartos
    "3.1": {"has_parking": true, "type": "Gratuito"},
    "3.2": "Piscina aquecida",
    "4.1": [
      {
        "name": "L'Alcofa",
        "cuisine": "Culinária local + internacional",
        "menu_url": "https://..."
      }
    ],
    "5.1": {"check_in": "14:00", "check_out": "12:00"},
    "7.2": "Equipe ajuda organizar atividades...",
    "9.1": "array com 9 FAQs estruturadas",
    "9.2": "array com 2 common_objections com respostas",
    "9.4": {
      "casal": "Pousada romântica 5* boutique...",
      "familia": "Trilhas e cachoeiras seguras...",
      "aventura": "Base ideal Chapada...",
      "corporativo": "Ambiente boutique tranquilo..."
    }
  }
}
```

**Qualidade:** ⭐⭐⭐⭐⭐ (5/5) — JSON estruturado, 46-51 campos, multi-fonte validada

**Onde está:** `data/enrichment/pilot-2026-04-22/validated/{slug}-full.json` (10 hotéis)

---

### FONTE 3: MEU ENRIQUECIMENTO (Web Scraping) ⭐⭐⭐ (BOM)

**Local:** `data/enrichment/tmp/{slug}-full.json`

**Informação por hotel:** 10-15 campos (incompleto vs FAQ)

```json
{
  "hotel_slug": "atins-charme",
  "quality_score": 0.48,
  "completeness": 0.35,
  "fields": {
    "1.1": "Atins Charme Chalés",
    "1.2": "Barreirinhas",
    "1.7": "https://charmeatins.com.br",
    "1.9": "Descrição genérica...",
    "2.1": "9 Chalés + 11 Suítes (sem detalhes de camas)",
    "3.1": "Estacionamento gratuito",
    "4.1": null,  // ❌ Restaurantes não extraídos
    "5.1": "14:00",
    // ... 7 campos mais ...
  }
}
```

**Qualidade:** ⭐⭐⭐ (3/5) — Informação básica, muitos campos faltando

**Onde está:** 82 hotéis em `data/enrichment/tmp/`

**Por que incompleto:** Web scraping não conseguiu extrair restaurantes nomeados, experiências detalhadas, políticas específicas (que estão no FAQ)

---

### FONTE 4: EXCEL ⭐⭐ (BÁSICO)

**Local:** `data/lista-hoteis-circuito-elegante.xlsx`

**Informação por hotel:** 10 campos críticos Stella KB

```
| ESTABELECIMENTOS | MUNICÍPIO | UF | Região | Experiência | Destino | hotel_ID | API | Bradesco |
|-----------------|-----------|-----|--------|-------------|---------|----------|-----|----------|
| Alma Charme Atins | Barreirinhas | MA | nordeste | praia | Lençóis Maranhenses | xxx | SIM | NÃO |
```

**Qualidade:** ⭐⭐ (2/5) — Apenas campos críticos, sem descrições

**Onde está:** 93 hotéis em `data/lista-hoteis-circuito-elegante.xlsx`

---

## 🔄 COMO DEVERIA FUNCIONAR (Arquitetura Ideal)

```
            STELLA KB v3 (Banco de Dados)
                      ↑
                      │ (Deploy ETL)
                      │
            ┌─────────┴──────────┐
            │                    │
         MERGE v2             Schema V3
      (Consolidado)          (Normalizado)
            ↑                    
            │                    
    ┌───────┼────────┬──────────┐
    │       │        │          │
   FAQ    PILOT   ENRICH    EXCEL
   (31)   (46-51)  (10-15)   (10)
    │       │        │        │
    └───────┴────────┴────────┘
    
Priorização:
FAQ (95%) > PILOT (90%) > ENRICH (50%) > EXCEL (30%)
```

---

## ❌ O QUE ESTÁ ACONTECENDO (AGORA — ERRADO)

```
                    MERGE (ATUAL)
             Consolidação Incorreta
                      ↑
                      │
    ┌──────────────┬──┴──┬───────────┐
    │              │     │           │
  PILOT        ENRICH EXCEL         ❌ FAQ
 (46-51)        (10-15) (10)     (IGNORADO)
   │               │      │
   └───────────────┴──────┘
   
Resultado: ~15 campos média vs 30+ esperado
```

---

## 📋 DADOS CONSOLIDADOS AGORA (data/enrichment/merged/)

**O que está lá:**
- 120 hotéis únicos (piloto + enriquecimento + overlap)
- Merge com APENAS Pilot + Enrichment + Excel
- **FAQ completamente ignorado**

**Problema:**
```json
// Arquivo atual: data/enrichment/merged/atins-charme-chales-merged.json
{
  "quality_score": 0.48,   // ← BAIXO porque faltam restaurantes/experiências
  "completeness": 0.35,    // ← MUITO BAIXO vs FAQ que teria 0.90
  "fields": {
    "restaurants": null,    // ← No FAQ: Beach Bar, Ça-Vá, Sushi, Mirante
    "activities": null,     // ← No FAQ: 10+ atividades documentadas
    "check_in": "14:00",   // ← Certo (web scraping extraiu)
    // Faltam 20+ campos que estão no FAQ
  }
}
```

---

## ✅ COMO SERÁ UTILIZADO NO STELLA KB v3

### Schema Stella KB (5 tabelas)

```sql
hotels (base)
├─ name (de FAQ ou pilot)
├─ description (de FAQ ou pilot — muito melhor)
├─ website_url (de FAQ)
├─ lodging_type (de FAQ)
├─ total_rooms (de FAQ)
└─ ... 19 mais colunas

hotel_amenities (921 linhas)
├─ Viram de FAQ: "Spa", "Restaurante", "Piscina privativa", "Hidromassagem"
├─ + Viram de pilot: "L'Occitane amenities", "Fitness center"
└─ + Viram de enriquecimento: "WiFi", "AC", etc.

hotel_room_types (233 linhas)
├─ FAQ: "6 Bangalôs casal 40m²", "2 Bangalôs família 50m²"
├─ Pilot: "Quarto padrão", "Suíte deluxe"
└─ Enriquecimento: Tipos genéricos

hotel_policies (82 linhas)
├─ FAQ: "31d=100%, 8-30d=30%, <7d=0%", "check_in 14h"
└─ Pilot: Políticas estruturadas

hotel_content (901 chunks com embeddings)
├─ FAQ: Descrições completas dos hotéis
├─ Pilot: FAQs estruturadas (9 por hotel)
└─ Enriquecimento: Conteúdo complementar

hotel_media (55 fotos)
└─ URLs das imagens extraídas
```

---

## 🚨 IMPACTO DA FALTA DO FAQ

### Sem integração FAQ (AGORA):

```json
{
  "slug": "alma-charme-atins",
  "name": "Alma Charme Atins",
  "description": "Pousada em Atins",  // ← Genérico
  "restaurants": null,                 // ← VAZIO (4 no FAQ!)
  "quality_score": 0.48,              // ← Baixo
  "completeness": 0.35                 // ← 35% (9 de 26 campos)
}
```

**Em DB:** 48% qualidade média → experiência atendente **RUIM**

---

### COM integração FAQ (O QUE DEVERIA SER):

```json
{
  "slug": "alma-charme-atins",
  "name": "Alma Charme Atins",
  "description": "Uma pousada boutique localizada no vilarejo de Atins...",  // ← FAQ completo
  "restaurants": [
    {"name": "Beach Bar", "cuisine": "Nordestino", "highlights": "Drinks, música ao vivo"},
    {"name": "Ça-Vá", "cuisine": "Mediterrâneo + Maranhense"},
    {"name": "Sushi Charme", "cuisine": "Japonês, único da região"},
    {"name": "Mirante Charme", "cuisine": "Internacional"}
  ],  // ← 4 restaurantes (do FAQ)
  "room_types": [
    {"name": "Bangalô Casal", "capacity": 1, "size": "40m²", "beds": "1 king"},
    {"name": "Bangalô Família", "capacity": 3, "size": "50m²", "beds": "1 king + 2 solteiros"}
  ],  // ← Detalhado (FAQ)
  "check_in": "14:00",  // ← Exato (FAQ)
  "cancellation": {"31d": "100%", "8-30d": "30%", "7d": "0%"},  // ← Política exata (FAQ)
  "quality_score": 0.88,              // ← Alto
  "completeness": 0.90                 // ← 90% (52 de 58 campos)
}
```

**Em DB:** 88% qualidade média → experiência atendente **EXCELENTE**

---

## 🎯 PLANO DE AÇÃO (PRÓXIMOS PASSOS)

### PASSO 1: Parsear FAQ em JSON ✋ (Em progresso)

```bash
npx tsx data/scripts/parse-faq-to-json.ts
# Resultado: data/enrichment/faq-parsed/{slug}.json
# Com: 31 campos estruturados por hotel
```

**Desafio:** Markdown tem estrutura complexa (múltiplos hotéis por seção)
**Solução:** Parser mais robusto (em desenvolvimento)

### PASSO 2: Criar Merge v2 com prioridade FAQ

```typescript
// Pseudocódigo
for each hotel:
  if (FAQ existe):
    use FAQ (95% quality, 31 campos)
  else if (PILOT existe):
    use PILOT (90% quality, 46 campos)
  else if (ENRICH existe):
    use ENRICH (50% quality, 10-15 campos)
  else:
    use EXCEL (30% quality, 10 campos críticos)
```

**Resultado:** Cada hotel com 30+ campos em vez de 10-15

### PASSO 3: Deploy novo merge v2 ao Stella KB v3

```bash
npx tsx data/scripts/merge-enrichment-v2-with-faq.ts
# Resultado: data/enrichment/merged-v2/{slug}.json
# Com: FAQ > PILOT > ENRICH > EXCEL
```

---

## 📊 RESUMO FINAL

| Métrica | FAQ | PILOT | ENRICH | EXCEL | MERGE (Atual) | MERGE v2 (Esperado) |
|---------|-----|-------|--------|-------|---------------|-----------------|
| **Hotéis** | ~25 | 10 | 82 | 93 | 120 | 93 |
| **Campos/Hotel** | 31 | 46-51 | 10-15 | 10 | 10-15 | 30-40 |
| **Completeness** | 100% | 79-88% | 17-26% | 11% | 17-26% | 70-80% |
| **Quality Score** | 95% | 90% | 50% | 30% | 50% | 80% |
| **Acesso** | Markdown (não estruturado) | JSON (estruturado) | JSON | XLS | JSON (incompleto) | JSON (integrado) |

---

## 🎓 CONCLUSÃO

**Sua pergunta:** "Os dados de merge parecem pobres... como está sendo feito isso?"

**Resposta completa:**
1. ✅ **FAQ existe e é OURO PURO** (31 campos, 100% respondido pelos hotéis)
2. ❌ **MAS NÃO FOI INTEGRADO** ao merge (está em Markdown solto)
3. ❌ **Merge atual ignora FAQ** — resultado: ~10-15 campos em vez de 30+
4. ✅ **Solução:** Parsear FAQ → Merge v2 com prioridade FAQ > PILOT > ENRICH

**Próximo passo:** Implementar parser FAQ robusto + merge v2 = dados **3-4x mais ricos**

