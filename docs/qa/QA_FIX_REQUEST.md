# QA Fix Request — Story 2.7

| Campo | Valor |
|-------|-------|
| **Story** | 2.7 — Session State & Context Persistence |
| **Reviewer** | @qa (Quinn) |
| **Verdict** | CONCERNS |
| **Para** | @dev (Dex) |
| **Data** | 2026-04-06 |
| **Prioridade** | P0 — bloqueia aprovacao da story |

---

## Instrucoes para @dev

**NAO aplique patches rapidos.** Antes de escrever uma linha de codigo, faca uma analise arquitetural completa de cada finding. Avalie as opcoes, documente trade-offs, e escolha a solucao que maximiza qualidade de longo prazo do projeto. O objetivo e produzir a melhor implementacao possivel, nao a mais rapida.

Para cada finding:
1. Analise o problema em profundidade
2. Liste pelo menos 3 abordagens possiveis
3. Avalie trade-offs (performance, manutenibilidade, testabilidade, acoplamento)
4. Implemente a melhor solucao
5. Adicione testes que comprovem o fix no fluxo REAL (nao apenas em isolamento)

---

## F1 (HIGH) — extractHotelFocus structuralmente ineficaz no pipeline real

### Problema

`extractHotelFocus` espera `Record<string, { hotels: [...] }>` mas o pipeline produz `Record<string, string>`. A funcao SEMPRE retorna `null` no fluxo real porque strings falham no check `typeof value === 'object'`.

**AC2 nao esta funcionalmente ativo end-to-end.**

### Arquivos envolvidos

- `backend/src/agents/pipeline.ts` — extractHotelFocus (linhas 57-76) + processMessage (linha 311)
- `backend/src/agents/orchestrator.ts` — runOrchestrator retorna string
- `backend/src/tools/search-hotels.ts` — retorna dados estruturados internamente
- `backend/src/tools/query-knowledge-base.ts` — retorna dados estruturados internamente
- `tests/unit/session-context.test.ts` — testes de extractHotelFocus (testam com dados mockados, nao com output real do pipeline)

### Causa raiz

O OpenAI Agents SDK `run()` no orchestrator consome os tool results internamente e retorna `finalOutput` como string. Os dados estruturados das tools (`searchHotels`, `queryKnowledgeBase`) nunca chegam ao pipeline.

### Abordagens a avaliar (minimo)

**Opcao A — Instrumentar as tools para gravar hotelFocus direto no session context**
- As tools `searchHotels` e `queryKnowledgeBase` chamariam `updateSessionContext` diretamente ao encontrar hotel
- Pros: simples, dados estruturados disponiveis na tool layer
- Contras: acopla tools ao session manager, viola separacao de concerns

**Opcao B — Capturar tool_calls do Agents SDK run result**
- `run()` retorna um RunResult que contem historico de tool calls com inputs/outputs
- Extrair hotel focus do output estruturado das tool calls
- Pros: sem acoplamento, dados reais
- Contras: depende da API interna do SDK, mais complexo

**Opcao C — Retornar metadata estruturada do orchestrator**
- Modificar `runOrchestrator` para retornar `{ output: string, metadata: { hotels?: [...] } }`
- Pipeline usa metadata para extrair hotel focus
- Pros: interface limpa, extensivel
- Contras: muda interface do orchestrator (pode afetar outros consumers)

**Opcao D — Hook/callback no instrumentedSearchHotels**
- Adicionar callback no wrapper `instrumentedSearchHotels` que emite hotel results para um event bus ou side-channel
- Pipeline escuta o evento e atualiza context
- Pros: desacoplado
- Contras: complexidade extra, event ordering

**O @dev deve avaliar estas E qualquer outra opcao que considerar, documentando a decisao no Debug Log da story.**

### Criterios de aceitacao do fix

- [ ] hotelFocus e atualizado automaticamente quando searchHotels retorna resultados (single intent E multi-intent)
- [ ] hotelFocus e atualizado quando queryKnowledgeBase e filtrado por hotel
- [ ] Teste end-to-end (pipeline processMessage) comprova que hotelFocus e persistido apos uma busca
- [ ] Teste comprova que follow-up sem hotel usa o hotelFocus salvo
- [ ] Zero regressao nos 694 testes existentes

---

## F2 (MEDIUM) — Redis GET redundante no pipeline

### Problema

`pipeline.ts:329` faz `getSessionContext(input.sessionId)` imediatamente apos `updateSessionContext` e `addConversationMessage` que acabaram de manipular o mesmo context. O resultado ja esta disponivel sem a read extra.

```typescript
// Linha 322: updateSessionContext ja retorna o context atualizado
await updateSessionContext(input.sessionId, contextUpdates);

// Linha 326: addConversationMessage tambem retorna o context atualizado
await addConversationMessage(input.sessionId, 'assistant', safety.response);

// Linha 329: GET redundante — o context ja foi retornado acima
const updatedCtx = await getSessionContext(input.sessionId);
```

### Fix esperado

Reutilizar o retorno de `addConversationMessage` (que e o ultimo a modificar o context) em vez de fazer um GET extra.

### Criterios de aceitacao do fix

- [ ] Eliminar o `getSessionContext` redundante na linha 329
- [ ] Usar o retorno de `addConversationMessage` para o snapshot
- [ ] Zero regressao

---

## Checklist de entrega

- [ ] F1 resolvido com analise arquitetural documentada no Debug Log
- [ ] F2 resolvido
- [ ] Testes adicionados/atualizados comprovam os fixes no fluxo real
- [ ] `npm run lint` — 0 erros
- [ ] `npx tsc --noEmit` — 0 erros
- [ ] `npx jest --no-coverage` — todos passando, 0 regressoes
- [ ] Story file atualizado (checkboxes, File List, Change Log)

---

*Gerado por @qa (Quinn) — 2026-04-06*
