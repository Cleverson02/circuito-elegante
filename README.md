# Stella — Concierge Digital do Circuito Elegante

AI-powered hotel concierge agent for the Circuito Elegante luxury hotel network.

## Overview

Stella is a multi-LLM conversational agent operating as a digital concierge for 92 luxury hotels. Built with a **4-agent pipeline** (Intent, Orchestrator, Persona, Safety) orchestrated by OpenAI Agents SDK, served by Fastify, with Evolution API (WhatsApp) and Chatwoot (human handover).

## Tech Stack

- **Runtime:** Node.js 22 + TypeScript 5.8
- **API:** Fastify 5.x
- **Database:** Supabase (PostgreSQL + pgvector)
- **Cache:** Redis 7 Alpine
- **ORM:** Drizzle ORM
- **AI:** OpenAI Agents SDK (GPT-5)
- **WhatsApp:** Evolution API
- **Support:** Chatwoot
- **Deploy:** Docker Compose → Digital Ocean

## Quick Start

### Prerequisites

- Node.js 22+
- pnpm 10+
- Docker & Docker Compose

### Setup

```bash
# Clone & install
git clone <repo-url>
cd circuito-elegante-stella
pnpm install

# Environment
cp .env.example .env
# Edit .env with your credentials

# Start services (Redis)
docker compose -f infra/docker-compose.yml up -d redis

# Run dev server
pnpm dev
```

### Verify

```bash
# Health check
curl http://localhost:3000/health

# Expected: { "status": "ok", "timestamp": "..." }
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server (hot reload) |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm typecheck` | TypeScript type checking |
| `pnpm test` | Run all tests |
| `pnpm test:unit` | Run unit tests only |
| `pnpm test:integration` | Run integration tests |
| `pnpm test:e2e` | Run end-to-end tests |
| `pnpm db:generate` | Generate Drizzle migrations |
| `pnpm db:migrate` | Apply migrations |

## Project Structure

```
├── backend/src/
│   ├── api/           # Fastify routes
│   ├── agents/        # Multi-agent pipeline (Epic 2)
│   ├── database/      # Drizzle schema + queries
│   ├── vectordb/      # FAQ ingestion + embeddings
│   ├── state/         # Redis session management
│   ├── middleware/     # Logging, rate-limit, auth
│   ├── integrations/  # Evolution API, Chatwoot, Elevare
│   └── types/         # Shared TypeScript types
├── config/            # Environment validation (Zod)
├── data/
│   ├── scripts/       # Ingestion scripts
│   └── migrations/    # Drizzle migrations
├── infra/             # Docker Compose + Dockerfile
└── tests/             # Integration & E2E tests
```

## Development Workflow

This project uses **Story-Driven Development** via AIOX Framework:

1. Stories in `docs/stories/` define all work
2. Each story maps to a feature branch (`feat/X.Y-name`)
3. Development follows wave plan (see `docs/stories/epics/`)

## Team

- **Project Lead:** Cleverson Silva
- **Framework:** Synkra AIOX

---

*Built with Synkra AIOX Framework — Story-Driven Development System*
