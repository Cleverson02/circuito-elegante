# 📦 Guia de Transferência - Stella para Dev

## ✅ Arquivo Preparado

**Nome:** `stella-dev-completo-2026-05-02.tar.gz`  
**Tamanho:** 77 MB  
**Data:** 2026-05-02  

---

## 📋 O que está incluído

```
✅ Código completo (backend, infra, tools)
✅ .env com credenciais reais (seu Supabase)
✅ 96 hotéis enriquecidos (KB completa)
✅ 11 migrations SQL (schema PostgreSQL)
✅ FAQs e documentação
✅ Scripts de setup
✅ 4710 arquivos no total
```

---

## 🚀 Como Enviar (WhatsApp)

1. **Arquivo:** `stella-dev-completo-2026-05-02.tar.gz` (77 MB)
   - Comprimido com tar.gz
   - Criptografia nativa de WhatsApp ✅
   - Seguro para transmissão

2. **Credenciais incluídas:**
   - `.env` está DENTRO do ZIP
   - Contém: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY, etc
   - Não precisa enviar separado

---

## 🎯 O que o Dev Precisa Fazer

### Opção A: Usar seu Supabase (RECOMENDADO PARA COMEÇAR)

```bash
# 1. Descomprimir
tar -xzf stella-dev-completo-2026-05-02.tar.gz
cd circuito-elegante-stella

# 2. Instalar dependências
npm install

# 3. Rodar dev (já conecta no seu Supabase via .env)
npm run dev

# 4. Acessar http://localhost:3000 ✅
```

**Vantagens:**
- ✅ Dados sincronizados em tempo real
- ✅ Dev vê exatamente o que você vê
- ✅ Zero setup adicional
- ✅ KB completa (96 hotéis) pronta

**Desvantagem:**
- ⚠️ Se dev quebrar algo, afeta seu Supabase

### Opção B: Criar BD Isolada (Para desenvolvimento seguro)

```bash
# 1. Descomprimir (como acima)
tar -xzf stella-dev-completo-2026-05-02.tar.gz

# 2. Criar novo projeto Supabase
# → https://supabase.com → Create project

# 3. Copiar novas credenciais para .env
SUPABASE_URL=https://seu-novo-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=nova-chave

# 4. Instalar e rodar migrations
npm install
npm run db:migrate    # Cria schema
npm run ingest:faq    # Carrega FAQs (opcional)

# 5. Rodar dev
npm run dev ✅
```

**Vantagens:**
- ✅ BD isolada (não quebra nada)
- ✅ Dev pode testar livremente
- ✅ Desenvolvimento independente

**Desvantagem:**
- ⚠️ Novo Supabase = +$25/mês

---

## 📂 Estrutura do Projeto

```
circuito-elegante-stella/
├── backend/              # Código principal (Fastify + OpenAI Agents)
│   ├── src/agents/       # Agentes de IA
│   ├── src/api/          # Rotas HTTP
│   ├── src/integrations/ # Integrações (Elevare, etc)
│   └── src/tools/        # Ferramentas do agente
├── data/
│   ├── enrichment/merged-v2/  # 96 hotéis JSON (KB)
│   ├── migrations/            # 11 SQLs schema
│   ├── faqs/                  # Base de perguntas
│   └── scripts/               # ETL e utilitários
├── docs/
│   ├── stories/     # Development tasks
│   ├── prd/         # Product Requirements
│   └── architecture/ # System design
├── infra/
│   ├── docker-compose.yml  # Redis + App
│   └── Dockerfile
├── .env             # CREDENCIAIS (DENTRO DO ZIP)
└── SETUP_DEV.md     # Instruções de setup
```

---

## 🔑 Credenciais Incluídas no .env

```env
# LLM
OPENAI_API_KEY=sk-proj-...

# Supabase (seu projeto atual)
SUPABASE_URL=https://rgdyleduvddgzxgpqcyk.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJ...
DATABASE_URL=postgresql://postgres.rgdyleduvddgzxgpqcyk:...@aws-1-sa-east-1...

# APIs
ELEVARE_API_URL=https://api.elevare.com.br/api/v1
ELEVARE_CLIENT_ID=cli_467e472d...
ELEVARE_CLIENT_SECRET=@Juntoseabencoados10

# Redis (opcional, para cache em produção)
REDIS_URL=rediss://default:...@related-colt-89897.upstash.io:6379
```

---

## 💡 Próximos Passos Para o Dev

1. **Entender o projeto**
   ```bash
   npm run dev  # Rodar http://localhost:3000
   cat docs/stories/*/index.md  # Ver o que foi desenvolvido
   ```

2. **Explorar KB**
   - `data/enrichment/merged-v2/` tem 96 arquivos JSON
   - Cada hotel tem: FAQ, amenities, policies, photos, etc
   - Tudo pronto para ser usado pelo agente

3. **Verificar BD**
   ```bash
   npm run db:studio  # Interface visual do Supabase
   ```

4. **Rodar testes**
   ```bash
   npm test
   npm run lint
   npm run typecheck
   ```

5. **Próximas features**
   - Ver `docs/stories/` para saber o que está pendente
   - Usar AIOX framework (`docs/prd/`, `docs/architecture/`)

---

## ⚠️ IMPORTANTE

1. **O .env contém credenciais REAIS**
   - Cuidado ao compartilhar depois
   - Se vazar, rotacione as chaves no Supabase

2. **WhatsApp tem criptografia end-to-end**
   - Seguro para transmitir este arquivo
   - Mensagem criptografada automaticamente

3. **Mudança de credenciais depois**
   - Se quiser trocar por new Supabase, só mudar `.env`
   - Migrations já existem (reutilizáveis)
   - Dados JSON também (reutilizáveis)

---

## 🆘 Troubleshooting

**"Erro de conexão Supabase"**
→ Verificar `.env`: SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY

**"Porta 3000 ocupada"**
→ `PORT=3001 npm run dev`

**"Module not found"**
→ `npm install` pode ter falhado, tentar novamente

**"EACCES permission denied"**
→ Nível de arquivo, check permissões do arquivo ou pasta

---

## 📞 Suporte

Se dev tiver dúvidas:
- Verificar `SETUP_DEV.md` no diretório raiz
- Verificar `docs/stories/` para entender contexto
- Verificar `.env.example` para entender variáveis

---

**Feito em:** 2026-05-02  
**Por:** Stella Setup Script v1.0  
**Status:** ✅ Pronto para Transferência
