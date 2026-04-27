# 🔴 Lista de Hotéis Bloqueados — Sites Offline/Sem Dados Robustos

**Data:** 2026-04-26  
**Fonte:** Squad Iteration 1 — SQUAD-PROGRESS.md  
**Total:** 13 hotéis com coverage ≤25% (dados insuficientes)

---

## 📊 Sumário

| Status | Quantidade | Descrição |
|--------|-----------|-----------|
| **Site Offline** | 9 | Domínio inexistente ou não responde (ECONNREFUSED) |
| **Cert SSL Expirado** | 1 | HTTPS inválido (não consegue acessar) |
| **Site Em Breve** | 1 | Página placeholder, sem dados úteis |
| **Excel-only** | 3 | Dados APENAS da planilha Excel (mínimos) |
| **Total Bloqueados** | **13** | Não processáveis com web scraping padrão |

---

## 🔴 LISTA COMPLETA POR CATEGORIA

### 1️⃣ Sites Offline (9 hotéis)

| # | Hotel | Slug | Coverage | Observação |
|----|-------|------|----------|-----------|
| 1 | Floresta Amazônica Lodge | `floresta-amazonica-lodge` | 12% | Domínio offline |
| 2 | Franca Pousada | `franca-pousada` | 9% | URL não responde |
| 3 | Glória Pousada Hotel | `gloria-pousada-hotel` | 9% | Domínio inexistente |
| 4 | Goiabada Branca Pousada | `goiabada-branca-pousada` | 9% | ECONNREFUSED |
| 5 | Hotel Fazenda do Conde | `hotel-fazenda-do-conde` | 9% | Offline |
| 6 | Hotel Fazenda Garganta | `hotel-fazenda-garganta` | 9% | Offline |
| 7 | Hotel Geotérmico | `hotel-geotermico` | 9% | Offline |
| 8 | Hotel Gourmet | `hotel-gourmet` | 9% | Offline |
| 9 | Hotel Grande Bahia | `hotel-grande-bahia` | 9% | Offline |

### 2️⃣ Certificado SSL Expirado (1 hotel)

| # | Hotel | Slug | Coverage | Observação |
|----|-------|------|----------|-----------|
| 10 | Hotel Graciosa | `hotel-graciosa` | 9% | HTTPS inválido — cert expirado |

### 3️⃣ Site Em Breve (1 hotel)

| # | Hotel | Slug | Coverage | Observação |
|----|-------|------|----------|-----------|
| 11 | Manoa Eco Villa | `manoa-eco-villa` | 18% | Página placeholder apenas |

### 4️⃣ Excel-only (3 hotéis) — Dados Mínimos

| # | Hotel | Slug | Coverage | Observação |
|----|-------|------|----------|-----------|
| 12 | Casa do Arandis | `casa-do-arandis` | 15% | Nenhum site funcional |
| 13 | Casa Rosa | `casa-rosa` | 15% | Sem site associado |
| 14 | Segredo na Serra | `segredo-na-serra` | 15% | Excel-only |
| 15 | Tuju Boutique Hotel | `tuju-boutique-hotel` | 15% | Sem site |
| 16 | Madeiro Beach Hotel | `madeiro-beach-hotel` | 15% | Excel-only |

---

## 📋 Dados Disponíveis (Apenas Excel)

Para esses hotéis, **apenas** os seguintes campos têm dados:
- 1.1: Nome (do Excel)
- 1.2: Município (do Excel)
- 1.3: UF (do Excel)
- 1.4: Região (do Excel, calculada via IBGE)
- 1.5: Destino (do Excel)

**Faltam completamente:**
- Campos 2.1-2.4 (site, google maps, endereço, telefone)
- Campos 3.1-3.2 (descrição, tipo)
- Campos 4.1-4.3 (acomodações)
- Campos 5.1-5.3 (infraestrutura)
- **Campos 6.1-6.4 (gastronomia)**
- **Campos 7.1-7.3 (lazer)**
- Campos 8.1-8.4 (políticas)
- **Campos 9.1-9.3 (serviços)**
- Campos 10.1-10.2 (diferenciais)

---

## 🔧 Próximos Passos Recomendados

### Opção A: Recuperação via Fontes Alternativas
Para cada hotel bloqueado, tentar:
1. **Google Maps** → buscar estabelecimento
2. **Booking.com** → procurar pelo nome
3. **TripAdvisor** → city + hotel name
4. **Wayback Machine** → histórico de website
5. **Redes sociais** → Facebook, Instagram (se houver)

### Opção B: Contato com Cliente
Para cada hotel bloqueado, solicitar ao cliente:
1. URL/site correto
2. Resposta ao questionário FAQ
3. Confirmação de atividade (está operando?)

### Opção C: Decidir Exclusão
Se informação indisponível em qualquer fonte:
- Manter com dados Excel mínimos (campo null onde não houver)
- Respeitando Article IV (zero invenção)
- Documentar blocante para Stella KB

---

## 📌 Notas Importantes

- **Nenhum dado foi inventado** — todos esses hotéis têm valores null/Excel para campos sem fonte real
- **Stella KB v3** pode aceitar hotéis com cobertura 30-49%, mas esses <25% precisam validação editorial
- **Prioridade baixa** para Iteração 2 — focar nos 18 hotéis "cobertura modesta" (30-49%) primeiro, que têm data mais recuperável

---

**Arquivo salvo em:** `data/enrichment/HOTEIS-BLOQUEADOS-LISTA.md`
