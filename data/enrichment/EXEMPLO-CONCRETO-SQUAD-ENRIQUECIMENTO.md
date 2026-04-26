# 📝 EXEMPLO CONCRETO: COMO O SQUAD TRABALHA

**Hotel Exemplo:** Atins Charme Chalés  
**Status Atual:** POOR (35% template coverage)  
**Objetivo:** Elevar para FAIR (60%+)

---

## 🏨 HOTEL: ATINS CHARME CHALÉS

### Status Atual (POOR - 35%)

**Arquivo:** `data/enrichment/merged-v2/atins-charme-merged-v2.json`

```json
{
  "slug": "atins-charme",
  "name": "Atins Charme Chalés",
  "template_coverage": 0.35,
  "template_fields": {
    "1.1": true,   // Nome ✅
    "1.2": true,   // Município ✅
    "1.3": true,   // UF ✅
    "1.4": false,  // Região (do Excel) ❌
    "1.5": false,  // Destino (do Excel) ❌
    "2.1": true,   // Site ✅
    "2.2": false,  // Google Maps ❌
    "2.3": true,   // Endereço ✅
    "2.4": true,   // Telefone ✅
    "3.1": false,  // Descrição detalhada ❌
    "3.2": true,   // Tipo ✅
    "4.1": true,   // Total quartos ✅
    "4.2": false,  // Tipos quarto (faltam detalhes) ❌
    "4.3": false,  // Amenidades quarto ❌
    "5.1": true,   // Estacionamento ✅
    "5.2": false,  // Piscina descrição ❌
    "5.3": false,  // Aquecida ❌
    "6.1": false,  // Restaurantes (VAZIO!) ❌❌❌
    "6.2": false,  // Refeições inclusas ❌
    "6.3": false,  // Experiências ❌
    "6.4": false,  // Room service ❌
    "7.1": false,  // Lazer (VAZIO!) ❌❌❌
    "7.2": false,  // Bem-estar ❌
    "7.3": false,  // Programação ❌
    "8.1": true,   // Check-in/out ✅
    "8.2": false,  // Early check-in ❌
    "8.3": false,  // Cancelamento ❌
    "8.4": false,  // Crianças/pets ❌
    "9.1": false,  // Concierge ❌
    "9.2": false,  // Transfer ❌
    "9.3": false,  // FAQs (VAZIO!) ❌❌❌
    "10.1": false, // Diferenciais ❌
    "10.2": false  // Restrições ❌
  },
  "gap_fields": [
    "1.4", "1.5", "2.2",                         // 3 campos identificação
    "3.1",                                        // 1 campo descrição
    "4.2", "4.3",                                 // 2 campos acomodações
    "5.2", "5.3",                                 // 2 campos infraestrutura
    "6.1", "6.2", "6.3", "6.4",                  // 4 campos gastronomia ⚠️
    "7.1", "7.2", "7.3",                         // 3 campos lazer ⚠️
    "8.2", "8.3", "8.4",                         // 3 campos políticas
    "9.1", "9.2", "9.3",                         // 3 campos serviços ⚠️
    "10.1", "10.2"                               // 2 campos diferenciais
  ],
  "fields": {
    "1.1": {"value": "Atins Charme Chalés"},
    "1.2": {"value": "Barreirinhas"},
    "1.3": {"value": "MA"},
    "2.1": {"value": "https://charmeatins.com.br"},
    "2.3": {"value": "Vilarejo de Atins, Barreirinhas, MA"},
    "2.4": {"value": "+55 98 98765-4321"},
    // ... outros campos preenchidos
    // FALTANDO (null):
    "3.1": null,    // Descrição
    "4.2": null,    // Tipos quarto (sem detalhes)
    "6.1": null,    // Restaurantes
    "7.1": null,    // Lazer
    "9.3": null     // FAQs
  }
}
```

---

## 📋 TAREFAS SQUAD PARA ESTE HOTEL

### Total: 19 campos para buscar

#### PRIORIDADE 1 (Críticos - buscar já!)

**1. Campo 6.1 - RESTAURANTES** ⚠️⚠️⚠️

```
Status: NULL (vazio)
Por que importa: Hóspede SEMPRE pergunta sobre comida
Onde buscar:
  1. https://charmeatins.com.br → Seção "Gastronomia"
  2. Google Search "Atins Charme restaurante"
  3. TripAdvisor → Dining section
  4. Contato via WhatsApp

O QUE BUSCAR (exato do FAQ):
┌─────────────────────────────────────────────────┐
│ O grupo Charme Atins oferece:                   │
│ • Beach Bar - nordestino, drinks, música ao vivo│
│ • Ça-Vá - mediterrâneo + maranhense            │
│ • Sushi Charme - único da região, peixes frescos│
│ • Mirante Charme - culinária internacional      │
└─────────────────────────────────────────────────┘

Salvar como:
{
  "6.1": {
    "value": [
      {
        "name": "Beach Bar",
        "cuisine": "Nordestino",
        "features": "Drinks autorais, música ao vivo"
      },
      {
        "name": "Ça-Vá",
        "cuisine": "Mediterrâneo + Maranhense"
      },
      {
        "name": "Sushi Charme Atins",
        "cuisine": "Japonês",
        "features": "Único da região, peixes frescos e toque nordestino"
      },
      {
        "name": "Mirante Charme Atins",
        "cuisine": "Internacional"
      }
    ],
    "source_type": "questionnaire_referenced",
    "source_url": "data/faqs/...",
    "timestamp": "2026-04-26T..."
  }
}
```

**2. Campo 7.1 - LAZER/ATIVIDADES** ⚠️⚠️⚠️

```
Status: NULL (vazio)
Por que importa: Hóspede quer saber O QUE FAZER
Onde buscar:
  1. https://charmeatins.com.br → "O que fazer em Atins"
  2. FAQ questionnaire: [já tem resposta!]
  3. TripAdvisor → Things to do nearby

O QUE BUSCAR (exato do FAQ):
┌─────────────────────────────────────────────────┐
│ • Passeio nas dunas                             │
│ • Kitesurf                                      │
│ • Dia de praia                                  │
│ • Caiaque                                       │
│ • Trekking                                      │
│ • Pesca                                         │
│ • Stand up                                      │
│ • Passeio de quadriciclo                        │
│ • Jantar nas dunas                              │
│ • Passeio de lancha                             │
└─────────────────────────────────────────────────┘

Salvar como:
{
  "7.1": {
    "value": [
      "Passeio nas dunas",
      "Kitesurf",
      "Dia de praia",
      "Caiaque",
      "Trekking",
      "Pesca",
      "Stand up paddle",
      "Passeio de quadriciclo",
      "Jantar nas dunas",
      "Passeio de lancha"
    ],
    "source_type": "questionnaire + local_knowledge",
    "source_url": "...",
    "timestamp": "2026-04-26T..."
  }
}
```

**3. Campo 9.3 - FAQs FREQUENTES** ⚠️⚠️⚠️

```
Status: NULL (vazio)
Por que importa: Concierge usará para responder comum
Onde buscar:
  1. FAQ questionnaire (questão 25)
  2. Contato via WhatsApp
  3. Análise de reviews (procura por dúvidas)

O QUE BUSCAR (exato do FAQ):
┌─────────────────────────────────────────────────┐
│ Q1: "Qual a logística para chegar em Atins?"   │
│ A1: "4-5h entre carro e barco"                 │
│                                                 │
│ Q2: "Quais passeios são disponíveis?"          │
│ A2: "Oferecidos por agências parceiras"        │
│                                                 │
│ Q3: "Quantos dias recomendam ficar?"           │
│ A3: "Recomendamos 5 noites"                    │
│                                                 │
│ Q4: "Como é o acesso de WiFi?"                 │
│ A4: "WiFi no hotel + sinal Vivo no povoado"    │
│                                                 │
│ Q5: "O hotel aceita pets?"                     │
│ A5: "Não aceitamos pets"                       │
└─────────────────────────────────────────────────┘

Salvar como:
{
  "9.3": {
    "value": [
      {
        "q": "Como chego em Atins?",
        "a": "Logística de 4-5h: carro até Barreirinhas (3h30) + barco Rio Preguiças (1h)"
      },
      {
        "q": "Quantos dias recomendam?",
        "a": "Recomendamos 5 noites para aproveitar a região"
      },
      {
        "q": "O hotel tem WiFi?",
        "a": "Sim, WiFi no hotel. No povoado, sinal da Vivo com boa cobertura"
      },
      {
        "q": "Vocês aceitam pets?",
        "a": "Não aceitamos pets"
      },
      {
        "q": "Quais passeios estão disponíveis?",
        "a": "Oferecemos intermediação com agências parceiras para dunas, kitesurf, trekking, pesca, stand up, quadriciclo e lancha"
      }
    ],
    "source_type": "questionnaire",
    "timestamp": "2026-04-26T..."
  }
}
```

#### PRIORIDADE 2 (Importantes - buscar se tempo)

**4. Campo 4.2 - TIPOS QUARTO (com detalhes)**

```
Atual: "9 Chalés Deluxe + 11 Suítes Classic" (genérico)
Objetivo: Detalhado com camas, m², descrição

Buscar no site:
{
  "4.2": {
    "value": [
      {
        "name": "Chalé Deluxe",
        "description": "1 cama casal queen + 2 camas solteiro",
        "capacity": 3,
        "features": "Integrado à paisagem nativa, oferece conforto sofisticado"
      },
      {
        "name": "Suite Classic",
        "description": "1 cama casal queen",
        "capacity": 2,
        "features": "Ambiente acolhedor, integrado ao conceito rústico-chique"
      }
    ]
  }
}
```

**5. Campo 3.1 - DESCRIÇÃO DETALHADA**

```
Atual: null
Objetivo: Parágrafo 2-3 linhas

Buscar do FAQ:
"A Atins Charme Chalés é uma pousada boutique localizada no vilarejo 
de Atins, nos Lençóis Maranhenses. Com conceito exclusivo e estilo 
rústico-chique, oferece 9 chalés e 11 suítes, cercados por paisagismo 
nativo. Um refúgio intimista e sofisticado, ideal para quem busca 
conforto, natureza e privacidade em um dos cenários mais incríveis do Brasil."

Salvar:
{
  "3.1": {
    "value": "A Atins Charme Chalés é uma pousada boutique..."
  }
}
```

#### PRIORIDADE 3 (Complementares - se tempo sobrar)

```
☐ 1.4 Região: "nordeste" (pode replicar do FAQ)
☐ 1.5 Destino: "Lençóis Maranhenses" (do FAQ)
☐ 2.2 Google Maps: [buscar "Atins Charme Chalés maps"]
☐ 6.2 Refeições: "Café à la carte na varanda" (do FAQ)
☐ 6.3 Experiências: "Jantares harmonizados, piqueniques" (do FAQ)
☐ 6.4 Room service: [buscar no site ou contato]
☐ 5.2 Piscina: "Piscinas comuns e privativas" (do FAQ)
☐ 5.3 Aquecida: "Não (clima sempre quente)" (do FAQ)
☐ 7.2 Bem-estar: "Spa, academia, yoga, piscina hidromassagem" (do FAQ)
☐ 7.3 Programação: "Passeios privativos ou compartilhados" (do FAQ)
☐ 8.2 Early check-in: "Sim, meia diária" (do FAQ)
☐ 8.3 Cancelamento: "31d=100%, 8-30d=30%, <7d=0%" (do FAQ)
☐ 8.4 Crianças: "<10 anos cortesia, sem camas extras" (do FAQ)
☐ 9.1 Concierge: "Sim, desde chegada, abertura camas 18h" (do FAQ)
☐ 9.2 Transfer: "Sim, pago. Intermediamos helicóptero também" (do FAQ)
☐ 10.1 Diferenciais: "Piscinas privativas, paisagismo nativo, acomodações equipadas" (do FAQ)
☐ 10.2 Restrições: "Não aceitamos pets" (do FAQ)
```

---

## 🎯 RESUMO TAREFA SQUAD

**Hotel:** Atins Charme Chalés  
**Status Entrada:** 35% (11/31 campos)  
**Status Saída Meta:** 80%+ (25/31 campos)

**Campos críticos para buscar:**
1. ✅ 6.1 Restaurantes (4 nomeados)
2. ✅ 7.1 Lazer (10 atividades)
3. ✅ 9.3 FAQs (5+ perguntas)
4. ✅ 4.2 Tipos quarto (com camas)
5. ✅ 3.1 Descrição

**Tempo estimado:** 2-3 horas para completar bem

**Resultado esperado:**
```json
{
  "slug": "atins-charme",
  "template_coverage_antes": 0.35,   // 35%
  "template_coverage_depois": 0.85,  // 85% ← Sobe para GOOD!
  "gap_fields_antes": 20,
  "gap_fields_depois": 5,  // Ainda faltatm alguns opcionais
  "timestamp_completo": "2026-04-26T14:30:00Z"
}
```

---

## ✨ DICA FINAL PARA SQUAD

Quando estiver com dúvida de um campo, procure no template:

```
data/enrichment/TEMPLATE-DADOS-MINIMOS-OBRIGATORIOS.md

Procura por: "Campo X.Y"
Vê exatamente o que é esperado
Busca dados nesse padrão
```

**Este exemplo (Atins) é seu template de trabalho para os outros 99 hotéis!**

