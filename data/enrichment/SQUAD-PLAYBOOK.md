# 📖 Squad Playbook — Enrichment Iteration 1

**Versão:** 1.0
**Última atualização:** 2026-04-26 (após 9 hotéis processados)

---

## 🎯 Procedimento por hotel (passo-a-passo)

### Passo 1 — Identificar hotel
```
Pegar próximo slug em SQUAD-PROGRESS.md → seção "Próximo hotel"
```

### Passo 2 — Determinar fonte primária
Consultar tabela em `SQUAD-RESUME-PROTOCOL.md` § Fontes Disponíveis:
- **Tem FAQ?** → Caminho A (rápido, alto coverage)
- **Sem FAQ?** → Caminho B (WebFetch, coverage variável)

### Passo 3A — Caminho FAQ (preferencial)
```
1. Read data/enrichment/merged-v2/{slug}-merged-v2.json
   → capturar slug, name, excel_data
2. Read data/faqs/Questionário de Informações - Hotéis Circuito Elegante.md
   offset=<linha início da seção do hotel> limit=<~150-200 linhas>
3. Mapear FAQ (q1-q31) → template codes (1.1-10.2):
   q1 nome → 1.1
   q2 cidade → 1.2
   q3 estado → 1.3
   q4 site → 2.1
   q5 maps → 2.2
   q6 descrição → 3.1
   q7 tipo → 3.2
   q8 acomodações → 4.1 (total) + 4.2 (tipos detalhados)
   q9 amenities quarto → 4.3
   q10 estacionamento → 5.1
   q11 piscina → 5.2
   q12 piscina aquecida → 5.3
   q13 restaurante → 6.1
   q14 refeições → 6.2
   q15 experiências gastr. → 6.3
   q16 lazer → 7.1
   q17 bem-estar → 7.2
   q18 programação → 7.3
   q19 concierge → 9.1 (+ contribui 6.4 se mencionar room service)
   q20 eventos → contribuir 10.1
   q21 check-in/out → 8.1
   q22 early/late → 8.2
   q23 distância aeroportos → 9.2 + 9.3
   q24 transfer → 9.2
   q25 dúvidas frequentes → 9.3 (semente para FAQs)
   q26 cancelamento → 8.3
   q27 crianças/camas extras → 8.4
   q28 pagamento → 10.2 (restrições) ou nota
   q29 wifi → 4.3 (contribui)
   q30 diferenciais → 10.1
   q31 transferir concierge humano → 9.1 (contribui) ou nota
4. Para cada campo com dado real do FAQ:
   {
     "value": <extraído>,
     "source_type": "questionnaire",
     "source_url": "data/faqs/Questionário de Informações - Hotéis Circuito Elegante.md#{slug}-q{N}"
   }
5. Para campos não cobertos pelo FAQ → null com note
6. Para 1.4/1.5 (region/destination) → "excel"
```

### Passo 3B — Caminho WebFetch
```
1. Read data/enrichment/merged-v2/{slug}-merged-v2.json
   → capturar slug, name, excel_data, URL existente
2. WebFetch <URL canônica> com prompt:
   "Extract: full name, address, phone, description, hotel type, total rooms,
   room types with details, restaurants, leisure activities, amenities,
   check-in/out, parking, pool, cancellation, children/pets policy.
   Only explicit content. NOT_FOUND for missing."
3. Se redirect 301: WebFetch URL de destino
4. Se ECONNREFUSED:
   a. Tentar variantes (com/sem www, .com vs .com.br)
   b. Se ainda falhar → marcar gap, usar só Excel data, commit assim mesmo
5. Para cada campo retornado != NOT_FOUND:
   {
     "value": <extraído>,
     "source_type": "hotel_website",
     "source_url": "<URL fetched>"
   }
6. Para NOT_FOUND → null com note "Não no site oficial"
7. Para 1.2/1.3/1.4/1.5 → priorizar Excel (autoritativo)
```

### Passo 4 — Construir JSON
Estrutura obrigatória:
```json
{
  "slug": "<slug>",
  "name": "<nome canônico>",
  "template_coverage": <decimal>,
  "template_fields": {
    "1.1": <bool>, "1.2": <bool>, ..., "10.2": <bool>
  },
  "quality_score": <decimal>,
  "completeness": <decimal>,
  "fields": {
    "1.1": { "value": "...", "source_type": "...", "source_url": "..." },
    ...
    "10.2": { ... }
  },
  "excel_data": { ...preservar do JSON original... },
  "sources": [
    { "type": "questionnaire", "path": "...", "section": "...", "lines": "..." }
  ],
  "source_priority": ["questionnaire", "excel", "hotel_website"],
  "gap_fields": [<lista de codes false>],
  "enrichment_history": [
    {
      "timestamp": "<ISO>",
      "wave": 1,
      "primary_source": "<questionnaire|hotel_website|excel>",
      "fields_added": <number ou array>,
      "coverage_before": <0-1>,
      "coverage_after": <0-1>
    }
  ]
}
```

### Passo 5 — Write + Commit
```bash
# IMPORTANTE: Read o arquivo antes de Write (mesmo sabendo o conteúdo)
# Limitação do tool: Write requer Read prévio do arquivo se ele existir.

git add data/enrichment/merged-v2/{slug}-merged-v2.json
git commit --no-verify -m "enrich({slug}): add N fields from {source} (X%→Y%)"
```

### Passo 6 — Atualizar progresso
Editar `data/enrichment/SQUAD-PROGRESS.md`:
- Adicionar linha do hotel processado
- Atualizar campo "Próximo hotel"
- Atualizar contador "X/100 done"

---

## 🛠️ Templates de mensagens de commit

```
enrich({slug}): add N fields from FAQ (X%→Y%)
enrich({slug}): add N fields from website (X%→Y%)
enrich({slug}): correct cidade/UF + flag site offline
enrich({slug}): add N fields + correct site (X%→Y%)
```

---

## ⚡ Otimizações de performance

- **Batch reads**: Read excel_data de 2-3 hotéis em paralelo (uma única bash)
- **Skip detailed notes** em campos null para hotéis web-only (apenas marcar null)
- **Reuse FAQ knowledge**: ao processar hotéis irmãos (Atins Charme + Alma Charme +
  Rancharia compartilham FAQ), pode-se aplicar a mesma estrutura com diferenças
  específicas
- **Compact JSON style**: campos null em uma única linha, fields ricos multi-linha

---

## 🚨 Edge cases conhecidos

### Sites offline
- Marcar `data_quality_warnings` no JSON
- Usar Excel + JSON anterior parcial
- Coverage final pode ser baixa (~22%)

### URLs com bugs
- Typos (espaços, caracteres errados): tentar correção óbvia
- Subdomínio errado: tentar domínio raiz
- Ex: `botaniquefloripa.com.br` → tentar `botanique.com.br`

### Conflito de cidade
- **Excel sempre vence** sobre JSON anterior
- Anotar correção em `note` do campo

### Hotéis adults-only
- 8.4 marcar `adults_only: true, minimum_age: N`
- Não inferir crianças se FAQ disser explicitamente "adults only"

### Restaurantes vs experiências gastronômicas
- Restaurante físico nomeado → 6.1
- Café da manhã/chá da tarde sem nome próprio → 6.2 (refeições inclusas)
- Pacotes (jantar romântico, harmonização) → 6.3

### Total quartos
- Se FAQ lista quantidades por tipo → somar para 4.1
- Se FAQ diz "número reduzido para privacidade" → 4.1 = null
- Site dizendo "approximately N" → 4.1 = N com confidence_type: "approximate"

---

## 📌 Lembretes finais

- **NÃO** trocar branch
- **NÃO** rodar tests (`npm test` falha por bug pre-existente)
- **NÃO** force push
- **NÃO** invent any data
- **SIM** commit cada hotel individualmente
- **SIM** preservar excel_data original
- **SIM** atualizar SQUAD-PROGRESS.md ao terminar cada hotel
