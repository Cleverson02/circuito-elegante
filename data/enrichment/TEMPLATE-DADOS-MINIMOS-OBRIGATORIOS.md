# 📋 TEMPLATE: DADOS MÍNIMOS OBRIGATÓRIOS POR HOTEL

**Baseado em:** Questionários respondidos pelos hotéis  
**Função:** Define o padrão mínimo que TODO hotel deve ter  
**Data:** 2026-04-26

---

## 🎯 31 CAMPOS TEMPLATE (De FAQ respondidos)

Estes 31 campos foram respondidos MANUALMENTE pelos hotéis que preencheram o Questionário. Definem o PADRÃO MÍNIMO que todo hotel deve ter:

### SEÇÃO 1: IDENTIFICAÇÃO (5 campos)

```
1.1  | Nome comercial              | Ex: "Hotel Fasano Rio de Janeiro"
1.2  | Município                   | Ex: "Rio de Janeiro"
1.3  | Estado (UF)                 | Ex: "RJ"
1.4  | Região Stella KB            | Ex: "Sudeste" (de Excel)
1.5  | Destino Stella KB           | Ex: "Ipanema" (de Excel)
```

### SEÇÃO 2: LOCALIZAÇÃO & CONTATO (4 campos)

```
2.1  | Site oficial                | Ex: "https://www.fasano.com.br/..."
2.2  | Google Maps URL             | Ex: "https://maps.app.goo.gl/..."
2.3  | Endereço completo           | Ex: "Av. Vieira Souto 80, Ipanema"
2.4  | Telefone(s)                 | Ex: "+55 21 2131-8008" (pode ser array)
```

### SEÇÃO 3: DESCRIÇÃO & TIPO (2 campos)

```
3.1  | Descrição hotel             | Parágrafo (2-3 linhas mínimo)
     |                             | Ex: "O primeiro projeto de Philippe Starck..."
3.2  | Tipo hospedagem             | Ex: "Hotel Boutique 5 estrelas"
```

### SEÇÃO 4: ACOMODAÇÕES (3 campos)

```
4.1  | Total de quartos            | Ex: 89
4.2  | Tipos de quarto (detalhado) | Ex: [{name: "Suíte Deluxe", size: "130m²", capacity: 2}]
4.3  | Amenidades de quarto        | Ex: ["Cama king", "AC", "Frigobar", "WiFi"]
```

### SEÇÃO 5: INFRAESTRUTURA (3 campos)

```
5.1  | Estacionamento              | Ex: {"has": true, "type": "Privado", "paid": false}
5.2  | Piscina(s)                  | Ex: "Piscina rooftop 8º andar + piscina comum"
5.3  | Piscina aquecida?           | Ex: true/false
```

### SEÇÃO 6: GASTRONOMIA (4 campos)

```
6.1  | Restaurantes/Bares          | Array com {name, cuisine, description}
     |                             | Ex: [{name: "Gero Rio", cuisine: "Italiana", chef: "Luigi Moressa"}]
6.2  | Refeições inclusas          | Ex: "Café da manhã à la carte"
6.3  | Experiências gastronômicas  | Ex: ["Jantares harmonizados", "Piqueniques"]
6.4  | Room service               | Ex: true/false, horários
```

### SEÇÃO 7: LAZER & BEM-ESTAR (3 campos)

```
7.1  | Itens de lazer              | Array com 5+ atividades
     |                             | Ex: ["Passeio nas dunas", "Kitesurf", "Trilhas", "Pesca", "Stand up"]
7.2  | Serviços bem-estar          | Ex: "Spa com massagens, yoga, saunas"
7.3  | Programação especial        | Ex: "Aulas de surfe, yoga rooftop, tours"
```

### SEÇÃO 8: POLÍTICAS (4 campos)

```
8.1  | Check-in / Check-out        | Ex: {"check_in": "15:00", "check_out": "12:00"}
8.2  | Early check-in / Late       | Ex: {"available": true, "cost": "meia diária"}
8.3  | Cancelamento               | Ex: {"31d": "100%", "8-30d": "30%", "<7d": "0%"}
8.4  | Políticas crianças/pets     | Ex: "Crianças <10 anos cortesia; pets: 1 animal com taxa"
```

### SEÇÃO 9: SERVIÇOS (3 campos)

```
9.1  | Concierge                   | Ex: "Sim, 24h. Ajuda com passeios e experiências"
9.2  | Transferências              | Ex: {"available": true, "paid": true}
9.3  | FAQs frequentes             | Array com 5+ FAQs respondidas
     |                             | Ex: [{q: "Como chegar?", a: "..."}]
```

### SEÇÃO 10: DIFERENCIAIS (2 campos)

```
10.1 | Diferenciais/Destaques      | Ex: "Piscina rooftop, BMW Wallbox, acessibilidade PCD"
10.2 | Restrições importantes      | Ex: "Não aceitamos pets" ou "Sem camas extras"
```

---

## 📊 RESUMO DO TEMPLATE

| Seção | Campos | Exemplos |
|-------|--------|----------|
| Identificação | 5 | Nome, município, UF, região, destino |
| Localização | 4 | Site, Maps, endereço, telefone |
| Descrição | 2 | Descrição, tipo hospedagem |
| Acomodações | 3 | Total quartos, tipos (detalhado), amenidades |
| Infraestrutura | 3 | Estacionamento, piscinas, aquecidas |
| Gastronomia | 4 | Restaurantes (nomeados), refeições, experiências, room service |
| Lazer | 3 | Atividades (5+), bem-estar, programação |
| Políticas | 4 | Check-in/out, early, cancelamento, crianças/pets |
| Serviços | 3 | Concierge, transfer, FAQs |
| Diferenciais | 2 | Destaques, restrições |
| **TOTAL** | **31 campos** | **Padrão mínimo obrigatório** |

---

## 🎯 COMO USAR ESTE TEMPLATE

### 1. Validação de Completeness

```typescript
// Cada hotel deve ter ≥ 31 campos assim preenchidos
for each hotel:
  if (hotel.fields.count >= 31 && all_template_fields_filled):
    quality = "ACCEPTABLE" ✅
  else:
    quality = "INCOMPLETE" ❌ (falta dados)
```

### 2. GAP Analysis para Squad

```
Hotel: Alma Charme Atins
Status: FAQ respondido ✅

Template Coverage:
- ✅ 1.1 Nome: "Alma Charme Atins"
- ✅ 1.2 Município: "Barreirinhas"
- ✅ 1.3 UF: "MA"
- ✅ 2.1 Site: "https://charmeatins.com.br"
- ✅ 3.1 Descrição: "Uma pousada boutique..."
- ✅ 4.2 Tipos quarto: [6 Bangalôs casal + 2 Família]
- ✅ 6.1 Restaurantes: [Beach Bar, Ça-Vá, Sushi Charme, Mirante]
- ✅ 7.1 Lazer: [Dunas, kitesurf, trekking, pesca, stand up]
- ... ✅ Todos 31 campos preenchidos
```

### 3. Busca para Hotels Incompletos

```
Hotel: Parador Cambará do Sul
Status: SEM FAQ ❌ (falta de dados)

Template Gap:
- ❌ 6.1 Restaurantes: VAZIO (não encontrado)
- ❌ 7.1 Lazer: PARCIAL (apenas "trilhas", falta mais)
- ❌ 7.2 Bem-estar: VAZIO (não menciona spa/massagem)
- ❌ 9.3 FAQs: VAZIO (não tem perguntas frequentes)
- ✅ 4.2 Tipos quarto: OK (encontrado)
- ✅ 8.1 Check-in: OK (encontrado)

Squad deve buscar:
→ Restaurantes específicos
→ 5+ atividades/lazer
→ Serviços bem-estar
→ FAQs (via chatbot do hotel ou análise de Reviews)
→ Confirmar tipos quarto e check-in
```

---

## 📝 CAMPOS OBRIGATÓRIOS vs OPCIONAIS

### Sempre Obrigatórios (31 Template)

```
✅ OBRIGATÓRIO para todos os hotéis:
- Nome, município, UF, região, destino (Excel)
- Site e contato (telefone, Google Maps)
- Descrição e tipo hospedagem
- Total quartos + tipos (COM detalhes: m², camas)
- Estacionamento, piscina, aquecida?
- Restaurantes (NOMEADOS, não genéricos)
- Refeições inclusas + experiências
- Lazer (mínimo 5 atividades específicas)
- Bem-estar (spa, massagem, yoga, etc)
- Check-in/out exatos
- Cancelamento (política com datas/%)
- Concierge e transfers
- FAQs (mínimo 5 perguntas frequentes)
- Diferenciais e restrições
```

### Opcionais (Se encontrado, inclua; se não, deixe null)

```
⚪ OPCIONAL (buscar se possível):
- Email específico (pode ter só telefone)
- Redes sociais (Instagram, Facebook)
- Rating/Certificações
- Eventos (se hotel tem espaço)
- Acessibilidade PCD (se não mencionado, deixa null)
- Preço médio (se não publicado, deixa null)
- Photos URLs (se conseguir extrair)
```

---

## 🔄 FLUXO: TEMPLATE → MERGE v2 → SQUAD

```
1. HOTÉIS COM FAQ RESPONDIDO (10-25 hotéis)
   │
   └─→ Template COMPLETO (31 campos) ✅
       └─→ Serve de GOLD STANDARD
           └─→ Entrada para Merge v2
               └─→ Resultado: 30+ campos/hotel

2. HOTÉIS SEM FAQ (68-83 hotéis)
   │
   └─→ Tem ENRIQUECIMENTO meu (web scraping) (10-15 campos)
       └─→ Merge v2: complement com PILOT + ENRICH + EXCEL
           └─→ Resultado: 20-25 campos/hotel (INCOMPLETO)
               └─→ GAP ANALYSIS identifica o que falta
                   └─→ Squad busca SÓ os 6-11 campos faltando
                       └─→ Re-enriquecimento iterativo
                           └─→ Próxima iteração: 25-30 campos

3. HOTÉIS VAZIOS (0 dados meus)
   │
   └─→ Apenas Excel (10 campos críticos)
       └─→ Squad busca TODO template (31 campos)
           └─→ Resultado esperado: 28-31 campos
```

---

## ✅ VALIDAÇÃO: É ACEITÁVEL?

| Completeness | Status | Ação |
|--------------|--------|------|
| 28-31 campos | ✅ GOLD | Pronto para deploy Stella KB |
| 25-27 campos | ✅ GOOD | Aceitável, melhoras futuras |
| 20-24 campos | ⚠️ FAIR | Precisa complementação |
| 15-19 campos | ❌ POOR | Faltam dados críticos |
| < 15 campos | ❌ CRITICAL | Busca imediata |

**Meta:** Todos os 93 hotéis com ≥ 25 campos (80% do template)

---

## 📁 REFERÊNCIA RÁPIDA

Para cada hotel novo, sempre validar:

```checklist
☐ Nome, cidade, UF preenchidos?
☐ Site oficial + telefone encontrados?
☐ Descrição completa (2-3 linhas mínimo)?
☐ Total quartos + tipos detalhados (com camas)?
☐ Restaurantes NOMEADOS (não "restaurante" genérico)?
☐ Mínimo 5 atividades de lazer?
☐ Check-in/out EXATOS (não "padrão")?
☐ Política cancelamento com datas/percentuais?
☐ Mínimo 5 FAQs respondidas?
☐ Telefone + Google Maps + endereço completo?

✅ Se TODOS checkados → Pronto para Stella KB
❌ Se alguns missing → Squad busca apenas esses
```

