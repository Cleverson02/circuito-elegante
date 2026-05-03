# 🚀 Stella - Setup para Desenvolvimento

## ⚡ Quick Start (2 min)

### Opção A: Usar Supabase Existente (RECOMENDADO PARA COMEÇAR)
```bash
npm install
npm run dev
# Pronto! Conecta direto no seu Supabase (credenciais em .env)
```

### Opção B: Criar BD Separada (Para desenvolvimento isolado)
```bash
# 1. Criar novo projeto Supabase (https://supabase.com)
# 2. Copiar novas credenciais para .env
# 3. Rodar migrations:
npm install
npm run db:migrate
npm run dev
```

## 📦 O que está incluído?

✅ **Código completo** - Backend Fastify + OpenAI Agents
✅ **.env com credenciais** - Seu Supabase original
✅ **96 hotéis enriquecidos** - Toda a KB em JSON
✅ **11 Migrations SQL** - Schema PostgreSQL completo
✅ **FAQs** - Base de perguntas
✅ **Documentação** - Arquitetura, stories, PRD

## 📂 Estrutura

```
circuito-elegante-stella/
├── backend/              # Código principal (Fastify)
├── data/
│   ├── enrichment/       # 96 hotéis (KB)
│   ├── migrations/       # 11 SQLs do schema
│   ├── faqs/             # Base de perguntas
│   └── scripts/          # ETL e utilitários
├── docs/                 # Arquitetura, stories, PRD
├── .env                  # Credenciais (SEU Supabase)
└── infra/                # Docker Compose
```

## 🎯 Próximos Passos

1. **Entender o projeto**
   ```bash
   npm run dev  # http://localhost:3000
   # Veja as stories em docs/stories/
   ```

2. **Checar BD**
   ```bash
   npm run db:studio  # Interface visual do Supabase
   ```

3. **Rodar testes**
   ```bash
   npm test
   ```

4. **Explorar KB**
   - Dados em `data/enrichment/merged-v2/` (96 arquivos JSON)
   - Cada hotel tem seções: FAQ, amenities, policies, etc.

## ⚠️ Importante

- `.env` contém credenciais REAIS (cuidado!)
- Se quiser BD isolada, crie novo projeto Supabase e atualize `.env`
- FAQs serão ingestados via: `npm run ingest:faq`

## 🆘 Troubleshooting

**Erro de conexão Supabase?**
→ Verificar `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` em `.env`

**Porta 3000 ocupada?**
→ `PORT=3001 npm run dev`

**Precisa de mais detalhes?**
→ Ver `docs/stories/` para entender o que foi desenvolvido
