# 🚀 LEIA ISTO PRIMEIRO: Comece Aqui

**Você é do Squad?** Comece por aqui ↓

---

## 📖 ROTEIRO DE LEITURA (10 minutos)

### 1. Entender o Objetivo (2 min)

Leia **RESUMO-FINAL-SQUAD-PRONTO.md** seção "MISSÃO DO SQUAD"

```
Resumo: Temos 100 hotéis com 35-45% de dados.
Squad precisa elevar para 60-75% buscando 19-20 campos faltando.
```

### 2. Entender o Template (3 min)

Leia **TEMPLATE-DADOS-MINIMOS-OBRIGATORIOS.md** seção "31 CAMPOS TEMPLATE"

```
Resume: Esses 31 campos são o PADRÃO MÍNIMO.
Hotéis que responderam FAQ já têm. Seu job é completar os outros.
```

### 3. Entender Como Fazer (3 min)

Leia **EXEMPLO-CONCRETO-SQUAD-ENRIQUECIMENTO.md**

```
Resumo: Veja um hotel (Atins Charme) e como preencher os campos faltando.
Este é seu TEMPLATE de trabalho para os outros 99 hotéis.
```

### 4. Pegar Instruções Detalhadas (2 min)

Leia **SQUAD-ACTION-PLAN-ENRIQUECIMENTO-ITERATIVO.md** seção "TEMPLATE DE BUSCA"

```
Resumo: Campo a campo como buscar, aonde procurar, o quê esperar.
Use isto como referência enquanto trabalha.
```

---

## 🎯 VOCÊ ESTÁ PRONTO PARA COMEÇAR!

### Próximo Passo: Escolher Seu Primeiro Hotel

```bash
# Ver lista de hotéis que faltam dados (POOR tier)
cat data/enrichment/merged-v2/MERGE-v2-ANALYTICS.json

# Copiar um slug (ex: "atins-charme", "bahia-bonita-hotel")
# Abrir arquivo dele:
cat data/enrichment/merged-v2/{seu-slug}-merged-v2.json

# Ver o "gap_fields": [...] (campos que faltam)
```

### Como Trabalhar

```bash
# 1. Procure por um campo no EXEMPLO
# 2. Siga instruções de aonde buscar
# 3. Encontre dados reais (site oficial, booking, tripadvisor)
# 4. Atualize o JSON
# 5. Commit ao Git
# 6. Próximo hotel!
```

---

## 📁 Arquivos que Você Usará

| Arquivo | Usar Para | Quando |
|---------|-----------|--------|
| `TEMPLATE-DADOS-MINIMOS-OBRIGATORIOS.md` | Entender o quê buscar | Primeira vez |
| `EXEMPLO-CONCRETO-SQUAD-ENRIQUECIMENTO.md` | Ver como fazer | Sempre que precisar |
| `SQUAD-ACTION-PLAN-ENRIQUECIMENTO-ITERATIVO.md` | Instruções por campo | Enquanto trabalha |
| `merged-v2/{slug}-merged-v2.json` | Dados do hotel | Seu arquivo de trabalho |

---

## ✅ Checklist Antes de Começar

- [ ] Ler 4 documentos acima (10 min total)
- [ ] Entender os 31 campos template
- [ ] Saber diferença entre GOLD/GOOD/POOR
- [ ] Ter arquivo JSON de exemplo aberto
- [ ] Saber como fazer git commit
- [ ] Pronto para começar!

---

## 💡 Dica Final

**Não invente dados.** Se não encontrou, deixa `null`.

Você está implementando Constitutional Article IV (No Invention).

