# ETL Operations Squad

Squad operacional para execucao de pipelines ETL usando `infrastructure/services/etl/` (v2.6.0).

## Agents

| Agent | Role | Responsabilidade |
|-------|------|-----------------|
| `etl-chief` | Orchestrator | Analisa request, roteia para extractor/transformer, valida output |
| `etl-extractor` | Operator | Opera CLIs de extracao (YouTube, web, ebook, transcribe, PDF) |
| `etl-transformer` | Processor | Chunking, limpeza de transcricoes, formatacao de output |

## Infrastructure

Todos os agentes operam sobre:

```
infrastructure/services/etl/
  bin/               # 8 CLI tools
  collectors/        # 8 data source collectors
  service.js         # ETLService class (API unificada)
  youtube/           # YouTube pipeline modules
  chunking/          # SemanticChunker
  transformers/      # cleanTranscript, speakerFilter
  validators/        # verifyQuality, validateTranscript
```

## Task Model

Este squad usa as seguintes tasks publicas:

- `tasks/load-workspace-context.md` (preflight + roteamento de output)
- `tasks/process.md` (entrypoint principal)
- `tasks/compile.md`
- `tasks/enrich.md`
- `tasks/extract-keyframes.md`
- `tasks/extract-podcast.md`

A task define o fluxo. A decisao de ferramenta (CLI/API/collector), fallback e validacao fica nos agentes e em contratos declarativos:

- `data/process.schema.json` (input contract)
- `data/routing-profiles.yaml` (routing + fallback + veto)
- `data/checkpoints.yaml` (checkpoint + veto por fase)
- `data/output-contract.yaml` (output contract + metricas)

### Execution Modes

- `single`: processa uma unica fonte
- `batch`: processa multiplas fontes apos validar a primeira
- `rag`: extrai + transforma para chunks orientados a ingestao

## Workspace Contract (Workspace-First)

- Comandos do chief:
  - `*workspace-preflight {slug}`
  - `*workspace-context {slug}`
- Preflight:
  - `bash squads/etl-ops/scripts/bootstrap-etl-workspace.sh {slug}`
  - `bash squads/etl-ops/scripts/validate-etl-essentials.sh`
- Task de contexto:
  - `tasks/load-workspace-context.md`
- Roteamento de saída:
  - canonical: `workspace/businesses/{slug}/etl/`
  - custom: `docs/etl/{slug}/`
  - legacy fallback: `outputs/etl/{run_id}/` (quando não houver slug)
- Templates canônicos:
  - `workspace/_templates/etl/*.yaml` (sem dados)

## Quality Gate (Local, Not Global CI)

Este squad nao depende de bloqueio no CI global para garantir qualidade.
A trava acontece no proprio fluxo de agente/task/workflow:

- comando local obrigatorio antes de concluir: `npm run validate:etl-ops`
- comando de essenciais workspace-first: `bash squads/etl-ops/scripts/validate-etl-essentials.sh`
- chief aplica gate antes da entrega final
- task `process` exige gate aprovado para completion

## CLI Tools

```bash
# YouTube
node infrastructure/services/etl/bin/youtube-transcript.js <videoId>
node infrastructure/services/etl/bin/youtube-channel.js @Handle
node infrastructure/services/etl/bin/youtube-metadata.js <videoId>
node infrastructure/services/etl/bin/youtube-clean-transcript.js --file <path>
node infrastructure/services/etl/bin/youtube-pipeline.js @Handle --limit 10

# Web
node infrastructure/services/etl/bin/fetch-page.js <url>
node infrastructure/services/etl/bin/fetch-page.js <url> --format json

# Audio/Documents
node infrastructure/services/etl/bin/transcribe.js <audio-file>
node infrastructure/services/etl/bin/ebook-to-markdown.js <epub-file>
```

## Heuristic Foundation

**Operational:**
- Verify physically before theorizing
- Discovery before implementation
- Determinism first (Script > Query > Regex > LLM)
- ETL First (fetch-page.js > WebFetch)

**Quality:**
- Zero wrong paths
- Veto conditions at every checkpoint
- Unidirectional flow
- Checkpoint coverage
- Zero time gaps in handoffs
