# 🚀 SQUAD ACTION PLAN: ENRIQUECIMENTO ITERATIVO

**Data:** 2026-04-26  
**Versão:** Phase 4 Squad Execution  
**Objetivo:** Enriquecer 100 hotéis POOR que faltam dados do TEMPLATE

---

## 📊 SITUAÇÃO ATUAL (Após Merge v2)

### Status de Cobertura de Template (31 campos obrigatórios)

```
🟢 GOLD (≥90%):      3 hotéis  ✅ PRONTO (não precisa squad)
🟡 GOOD (70-89%):    7 hotéis  ⚠️  QUASE PRONTO
🔴 POOR (<50%):    100 hotéis  🚀 SQUAD AQUI!
```

### Hotels GOLD (Prontos - Não mexer)

```
1. fasano-rj                    (94% template)
2. insolito-boutique-hotel      (92% template)
3. nor-hotel-e-spa              (91% template)
```

### Hotels GOOD (Quase prontos - Squad complementa 10-20%)

```
1. belmond-copacabana-palace     (85%)
2. canto-do-irere-boutique-hotel (82%)
3. pousada-do-ouro               (78%)
4. pousada-inacia                (76%)
5. projeto-ibiti-hospedagem      (74%)
6. txai-resort                   (72%)
7. villa-dozio                   (70%)
```

### Hotels POOR (Precisa Squad - Faltam 50%+ do template)

```
100 hotéis no total que precisam de enriquecimento.
Exemplos:
- atins-charme                   (35% template)
- bahia-bonita-hotel-boutique    (32% template)
- baia-das-caraubas              (28% template)
- fasano-sp                      (45% template) ← Mesmo grupo que Fasano RJ, dados devem ser similares
- hotel-emiliano-sp              (38% template)
... etc
```

---

## 🎯 PLANO DE EXECUÇÃO PARA SQUAD

### FASE 1: Validar Dados GOOD (2 horas)

**Objetivo:** Completar os 7 hotéis GOOD para GOLD status

**Para cada hotel:**
```
☐ Abrir: data/enrichment/merged-v2/{slug}-merged-v2.json
☐ Ver "gap_fields": [...campos faltando]
☐ Buscar esses campos APENAS (não duplicar)
☐ Atualizar campo no JSON
☐ Salvar com timestamp
```

**Exemplo - belmond-copacabana-palace:**
```json
// Arquivo: data/enrichment/merged-v2/belmond-copacabana-palace-merged-v2.json
{
  "gap_fields": [
    "6.3", "7.1", "7.2", "8.2", "9.3"  // 5 campos faltando
  ],
  "missing_details": {
    "6.3": "Experiências gastronômicas",
    "7.1": "Lazer (precisa 5+)",
    "7.2": "Bem-estar específico",
    "8.2": "Early check-in details",
    "9.3": "FAQs frequentes"
  }
}
```

**Squad busca:** Só esses 5 campos para Belmond

---

### FASE 2: Enriquecer Hotéis POOR (40 horas em paralelo)

**Abordagem:**
```
Sem duplicação:
- Se campo já existe → PULA (marca como ✓)
- Se campo vazio → BUSCA (marca como → em progresso)
- Se completou → SALVA (marca como ✅)

Prioridade de busca (por campo):
1. Campos críticos (nome, site, tipo hospedagem)
2. Restaurantes/Gastronomia (mais frequentemente encontrado)
3. Lazer/Atividades
4. Check-in/Políticas
5. FAQs/Concierge
```

---

## 📋 TEMPLATE DE BUSCA PARA SQUAD

### Instruções por Campo

#### Campo 1.1: Nome Comercial
```
Buscar em:
1. Site oficial do hotel
2. Google Maps
3. Booking.com
4. TripAdvisor

Se encontrado: Copiar exato (com acentos)
Exemplo: "Hotel Fasano Rio de Janeiro" (não "Fasano", não "Fasano Hotel")
```

#### Campo 2.1: Site Oficial
```
Buscar em:
1. Google Search "[hotel name] + site oficial"
2. Contato via WhatsApp/telefone (se tiver)
3. Booking.com → hotel website link

Validar: URL deve ser HTTPS e responder com HTML (não placeholder)
```

#### Campo 4.2: Tipos de Quarto (IMPORTANTE - detalhado)
```
Buscar em:
1. Site oficial → "Acomodações" ou "Quartos"
2. Booking.com → Room types
3. Tripadvisor → Room details

Deve incluir:
- Nome do tipo (ex: "Deluxe Suite", "Standard Room")
- Tamanho em m² (se disponível)
- Camas (ex: "1 king + 2 singles")
- Capacidade de pessoas

NUNCA genérico: Deve ser específico com números
❌ ERRADO: "Diversos tipos de quarto"
✅ CERTO: [{"name": "Deluxe", "size": "50m²", "beds": "1 king", "capacity": 2}]
```

#### Campo 6.1: Restaurantes (IMPORTANTE)
```
Buscar em:
1. Site oficial → Seção "Gastronomia" ou "Restaurantes"
2. TripAdvisor → Dining
3. Booking.com → Facilities
4. Google Search "[hotel] restaurante"

Deve incluir por restaurante:
- Nome EXATO (ex: "Gero Rio", não "Restaurante Gero")
- Tipo culinária (ex: "Italiana", "Internacional")
- Descrição breve
- Chef/responsável (se mencionar)

NUNCA genérico:
❌ ERRADO: "Restaurante com comida brasileira"
✅ CERTO: [{"name": "L'Alcofa", "cuisine": "Local + Internacional", "description": "Culinária local com ingredientes frescos"}]
```

#### Campo 7.1: Lazer/Atividades (IMPORTANTE - mínimo 5)
```
Buscar em:
1. Site oficial → "Atividades" ou "O que fazer"
2. Descrição hotel (pesquisa estruturada)
3. TripAdvisor → Things to do nearby
4. Google Maps → Nearby attractions

DEVE TER: Mínimo 5 atividades ESPECÍFICAS
❌ ERRADO: "Muitas atividades"
✅ CERTO: ["Passeio nas dunas", "Kitesurf", "Trekking", "Pesca", "Stand up paddle"]
```

#### Campo 8.1: Check-in/Check-out (IMPORTANTE - exato)
```
Buscar em:
1. Site oficial → Informações/Política
2. Booking.com → Check-in/out time
3. TripAdvisor → Property info
4. Contato direto (se não encontrado)

DEVE SER: Horários EXATOS
❌ ERRADO: "Padrão" ou "15:00"
✅ CERTO: {"check_in": "15:00", "check_out": "12:00"}
```

#### Campo 9.3: FAQs Frequentes (IMPORTANTE - 5+)
```
Buscar em:
1. Site oficial → FAQ ou "Perguntas frequentes"
2. Contato via WhatsApp/email
3. TripAdvisor → Reviews (identifica dúvidas)
4. Análise de comentários

DEVE CONTER: 5+ FAQs com Q&A estruturado
Exemplo:
[
  {"q": "Qual horário de check-in?", "a": "15:00"},
  {"q": "Tem WiFi?", "a": "Sim, gratuito"},
  {"q": "Aceita pets?", "a": "Não"},
  {"q": "Como chegar do aeroporto?", "a": "..."},
  {"q": "Qual a política de cancelamento?", "a": "..."}
]
```

---

## 🛠️ PROCESSO ITERATIVO DO SQUAD

### Iteração 1: Hotéis POOR (100 hotéis)

```
Entrada:
└─ 100 hotéis com <50% template coverage

Squad busca:
├─ Campo 1.1 (nome) → TODOS
├─ Campo 2.1 (site) → TODOS
├─ Campo 4.2 (tipos quarto) → Prioridade alta (15 hotéis/dia)
├─ Campo 6.1 (restaurantes) → Prioridade alta
├─ Campo 7.1 (lazer 5+) → Prioridade alta
├─ Campo 8.1 (check-in) → Prioridade alta
├─ Campo 9.3 (FAQs 5+) → Prioridade alta
└─ Outros campos → Conforme tempo

Resultado esperado:
└─ 100 hotéis com 60-75% template coverage (FAIR tier)
   (Sobe de 35-45% para 60-75%)
```

### Iteração 2: Hotéis GOOD + novo FAIR (107 hotéis)

```
Entrada:
├─ 7 hotéis GOOD (faltam 10-20%)
└─ ~50 hotéis novo FAIR (faltam 25-40%)

Squad busca:
├─ Completar 7 hotéis GOOD → GOLD
├─ Elevar FAIR → 80%+ (GOOD/GOLD)
└─ Preencher campos opcionais se tempo permitir

Resultado esperado:
├─ 10 hotéis GOLD (90%+) ✅
├─ 20 hotéis GOOD (70-89%) ✅
└─ 80 hotéis FAIR (50-69%) ⚠️
```

### Iteração 3: Limpeza Final (FAIR tier)

```
Entrada:
└─ 80 hotéis FAIR (50-69%)

Squad busca:
└─ Campos restantes, opcionais, validação

Resultado esperado:
├─ 10 hotéis GOLD ✅
├─ 40+ hotéis GOOD ✅
├─ 40+ hotéis FAIR ✅
└─ Cobertura média: 75%+ do template
```

---

## 📊 MATRIX DE PRIORIDADE

### Hotéis por Grupo (buscar dados similares)

**Grupo Fasano** (arquitetura similar, dados duplicáveis):
```
- fasano-rj          (94%) ← GOLD, use como referência
- fasano-sp          (45%) ← BUSCAR tipos quarto, restaurantes
- fasano-angra       (42%) ← BUSCAR tipos quarto, restaurantes
- fasano-bh          (40%) ← BUSCAR tipos quarto, restaurantes
- fasano-ssa         (38%) ← BUSCAR tipos quarto, restaurantes

Dica Squad: Fasano RJ tem TODOS os dados. Para os outros Fasano,
replicar estructura do RJ mas buscar dados específicos de cada cidade.
```

**Grupo Belmond** (luxury properties):
```
- belmond-copacabana  (85%) ← GOOD, quase completo
- hotel-belmond-cataratas (35%) ← BUSCAR

Squad pode reusar dados de Copacabana como template.
```

**Hotéis de Montanha (Serra)** - Padrão similar:
```
- parador-lumiar, tiradentes-boutique, valle-d'incanto
→ Mesmo padrão: trilhas, natureza, yoga, wifi limitado
→ Squad pode usar um como template para outros
```

---

## ✅ CHECKLIST DE EXECUÇÃO SQUAD

### Antes de Começar
- [ ] Clonar/sincronizar repositório
- [ ] Ler TEMPLATE-DADOS-MINIMOS-OBRIGATORIOS.md
- [ ] Ler este arquivo (SQUAD-ACTION-PLAN)
- [ ] Instalar dependências (Playwright + MCP)
- [ ] Testar acesso a um site (ex: fasano-rj.com.br)

### Durante Execução
- [ ] Trabalhar hotel por hotel (em paralelo)
- [ ] Para cada hotel, checar: `data/enrichment/merged-v2/{slug}-merged-v2.json`
- [ ] Ver "gap_fields": quais campos buscar
- [ ] Buscar APENAS campos que faltam (não duplicar)
- [ ] Salvar atualização com timestamp
- [ ] Comitar para Git com mensagem clara:
  ```
  git add data/enrichment/merged-v2/{slug}-merged-v2.json
  git commit -m "enrich({slug}): add [6.1] restaurantes, [7.1] lazer"
  ```

### Após Completar Hotel
- [ ] Validar JSON está bem formado
- [ ] Verificar campo "gap_fields" agora vazio ou reduzido
- [ ] Template coverage subiu?
- [ ] Tudo em Git (não em local apenas)

---

## 📈 MÉTRICAS DE SUCESSO

**Iteração 1 Meta:**
```
100 hotéis em estado POOR (35-45% template)
    ↓
100 hotéis em estado FAIR (60-75% template)

= Ganho de 25-30 pontos percentuais por hotel
```

**Iteração 2 Meta:**
```
107 hotéis (GOOD + FAIR)
    ↓
10 GOLD + 20 GOOD + 77 FAIR

= Média 75%+ template para todos
```

**Final Meta:**
```
✅ GOLD (≥90%):     10 hotéis
✅ GOOD (70-89%):   40 hotéis
✅ FAIR (50-69%):   43 hotéis
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Cobertura média: 76% do template
Todos com ≥50% (aceitável para Stella KB)
```

---

## 🎯 PRÓXIMO PASSO

1. ✅ **Você aprova este plano?** (Sim/Não)
2. ⏳ **Squad inicia Iteração 1** (Hotéis POOR)
3. 📊 **Daily standup:** Quantos hotéis completados
4. 🔄 **Iteração 2:** Elevar GOOD → GOLD
5. ✨ **Final:** Todos ≥50% template, pronto para Stella KB

---

**Status:** PRONTO PARA SQUAD COMEÇAR  
**Comando:** `git pull origin main && npm run enrich-squad-phase-4`  
(Script será criado)

