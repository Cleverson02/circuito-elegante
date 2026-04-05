# Taxonomia de Dados Hoteleiros — Concierge Stella

> **Versão:** 1.0
> **Data:** 2026-04-03
> **Status:** Validada
> **Total de campos:** 58
> **Origem:** Merge do formulário CE (30 campos) + taxonomia concierge (28 campos novos)
> **Formulário fonte:** https://docs.google.com/document/d/1Z_FSLe8lusHBlHYn5GuYGxS8lgtO13AZi929i5DJHRw/edit

---

## Armazenamento

- Campos 1.1–1.6, 3.3, 5.6 (boolean), 10.1–10.3: **colunas do schema `hotels`** (já existem)
- Todos os demais: **JSONB campo `data`** na tabela `hotels` (extensível, sem migração)

---

## 1. IDENTIDADE & LOCALIZAÇÃO (10 campos)

| # | Campo | Fonte | Tipo de Dado |
|---|-------|-------|--------------|
| 1.1 | Nome comercial | Formulário Q1 | `já no schema: name` |
| 1.2 | Cidade | Formulário Q2 | `já no schema: municipality` |
| 1.3 | Estado | Formulário Q3 | `já no schema: uf` |
| 1.4 | Região | Schema existente | `já no schema: region` |
| 1.5 | Destino | Schema existente | `já no schema: destination` |
| 1.6 | Tipo de experiência | Schema existente | `já no schema: experience` |
| 1.7 | Site oficial | Formulário Q4 | `string (URL)` |
| 1.8 | Link Google Maps | Formulário Q5 | `string (URL)` |
| 1.9 | Descrição / conceito / o que torna especial | Formulário Q6 | `text (longo)` |
| 1.10 | Tipo de hospedagem (boutique, resort, pousada de charme, etc.) | Formulário Q7 | `string ou enum` |

## 2. ACOMODAÇÕES (4 campos)

| # | Campo | Fonte | Tipo de Dado |
|---|-------|-------|--------------|
| 2.1 | Tipos de acomodação disponíveis | Formulário Q8 | `array de objetos` |
| 2.2 | Capacidade máxima por tipo de acomodação | Formulário Q8 | `número por tipo` |
| 2.3 | Amenities dos quartos (marcas, diferenciais) | Formulário Q9 | `text ou array` |
| 2.4 | Número total de quartos/suítes | Taxonomia concierge | `number` |

## 3. INFRAESTRUTURA & LAZER (9 campos)

| # | Campo | Fonte | Tipo de Dado |
|---|-------|-------|--------------|
| 3.1 | Estacionamento (tem? capacidade? gratuito/pago?) | Formulário Q10 | `objeto` |
| 3.2 | Piscina (quantidade, tipo, localização) | Formulário Q11 | `texto descritivo` |
| 3.3 | Piscina aquecida? | Formulário Q12 | `já no schema: pool_heated` |
| 3.4 | Itens de lazer (spa, trilhas, esportes, praia) | Formulário Q16 | `array` |
| 3.5 | Bem-estar (spa, massagens, terapias) | Formulário Q17 | `texto ou array` |
| 3.6 | Espaço para eventos (casamentos, corporativos) | Formulário Q20 | `boolean + texto` |
| 3.7 | Wi-Fi (incluso? qualidade do sinal?) | Formulário Q29 | `objeto` |
| 3.8 | Acessibilidade (PCD) | Taxonomia concierge | `boolean + texto` |
| 3.9 | Academia / fitness | Taxonomia concierge | `boolean + texto` |

## 4. GASTRONOMIA (5 campos)

| # | Campo | Fonte | Tipo de Dado |
|---|-------|-------|--------------|
| 4.1 | Restaurantes e tipo de culinária | Formulário Q13 | `array de objetos` |
| 4.2 | Refeições inclusas na diária (café, meia pensão, all-inclusive) | Formulário Q14 | `texto ou enum` |
| 4.3 | Experiências gastronômicas especiais (harmonização, piquenique) | Formulário Q15 | `texto ou array` |
| 4.4 | Room service disponível? | Taxonomia concierge | `boolean + horário` |
| 4.5 | Opções para restrições alimentares (vegano, celíaco, kosher) | Taxonomia concierge | `array` |

## 5. POLÍTICAS & REGRAS (7 campos)

| # | Campo | Fonte | Tipo de Dado |
|---|-------|-------|--------------|
| 5.1 | Horário de check-in e check-out | Formulário Q21 | `objeto {in, out}` |
| 5.2 | Early check-in / late checkout (possibilidade, cobrança) | Formulário Q22 | `texto` |
| 5.3 | Política de cancelamento e alteração | Formulário Q26 | `texto` |
| 5.4 | Regras para crianças e camas extras | Formulário Q27 | `texto` |
| 5.5 | Pet-friendly (aceita? taxa? restrições de porte? amenidades pet?) | Merge schema + taxonomia | `já no schema: pet_friendly` + `objeto detalhado no JSONB` |
| 5.6 | Política de fumante | Taxonomia concierge | `texto` |
| 5.7 | Idade mínima para hospedagem solo | Taxonomia concierge | `number ou texto` |

> **Nota:** Política de pagamento é regra universal do CE (cartão de crédito como garantia no ato da reserva), não varia por hotel. Não coletada individualmente. Ver seção "Regras de Negócio CE" abaixo.

## 6. ACESSO & TRANSPORTE (4 campos)

| # | Campo | Fonte | Tipo de Dado |
|---|-------|-------|--------------|
| 6.1 | Distância dos principais aeroportos e acesso recomendado | Formulário Q23 | `texto` |
| 6.2 | Transfer (oferece? gratuito/pago?) | Formulário Q24 | `objeto` |
| 6.3 | Atrações próximas e o que fazer na região | Taxonomia concierge | `array ou texto` |
| 6.4 | Como chegar (instruções de acesso) | Taxonomia concierge | `texto` |

## 7. EXPERIÊNCIAS & PROGRAMAÇÃO (5 campos)

| # | Campo | Fonte | Tipo de Dado |
|---|-------|-------|--------------|
| 7.1 | Programação especial adultos / crianças | Formulário Q18 | `texto` |
| 7.2 | Serviço de concierge do hotel (experiências agendáveis) | Formulário Q19 | `texto` |
| 7.3 | Atividades e passeios oferecidos | Merge Formulário Q16 + taxonomia | `array` |
| 7.4 | Day use disponível? | Taxonomia concierge | `boolean + condições` |
| 7.5 | Pacotes especiais (lua de mel, aniversário, réveillon) | Taxonomia concierge | `array ou texto` |

## 8. DIFERENCIAIS & REPUTAÇÃO (5 campos)

| # | Campo | Fonte | Tipo de Dado |
|---|-------|-------|--------------|
| 8.1 | Diferenciais para destaque no atendimento | Formulário Q30 | `texto` |
| 8.2 | Prêmios e selos (Condé Nast, TripAdvisor, etc.) | Taxonomia concierge | `array` |
| 8.3 | Sustentabilidade (práticas, certificações) | Taxonomia concierge | `texto` |
| 8.4 | Classificação / estrelas | Taxonomia concierge | `number` |
| 8.5 | Faixa de preço (posicionamento: $$, $$$, $$$$) | Taxonomia concierge | `enum` |

## 9. CONHECIMENTO DO CONCIERGE (4 campos)

| # | Campo | Fonte | Tipo de Dado |
|---|-------|-------|--------------|
| 9.1 | Dúvidas mais frequentes dos hóspedes (FAQ real) | Formulário Q25 | `array de Q&A` |
| 9.2 | Objeções comuns por categoria e respostas preparadas | Taxonomia concierge | `array de objetos` |
| 9.3 | Pontos de atenção (o que NÃO prometer) | Taxonomia concierge | `array` |
| 9.4 | Argumentos de venda por perfil de hóspede (casal, família, corporativo) | Taxonomia concierge | `objeto por perfil` |

## 10. INTEGRAÇÃO CIRCUITO ELEGANTE (5 campos)

| # | Campo | Fonte | Tipo de Dado |
|---|-------|-------|--------------|
| 10.1 | Has API (Elevare) | Schema existente | `já no schema: has_api` |
| 10.2 | Elevare Hotel ID | Schema existente | `já no schema: elevare_hotel_id` |
| 10.3 | Bradesco coupon | Schema existente | `já no schema: bradesco_coupon` |
| 10.4 | URL da página no site CE | Taxonomia concierge | `string (URL)` |
| 10.5 | Fotos do hotel (URLs) | Taxonomia concierge | `array de URLs` |

---

## Resumo Quantitativo

| Categoria | Formulário | Novos | Total |
|-----------|:---:|:---:|:---:|
| 1. Identidade & Localização | 8 | 2 | 10 |
| 2. Acomodações | 3 | 1 | 4 |
| 3. Infraestrutura & Lazer | 6 | 3 | 9 |
| 4. Gastronomia | 3 | 2 | 5 |
| 5. Políticas & Regras | 5 | 2 | 7 |
| 6. Acesso & Transporte | 2 | 2 | 4 |
| 7. Experiências & Programação | 3 | 2 | 5 |
| 8. Diferenciais & Reputação | 1 | 4 | 5 |
| 9. Conhecimento do Concierge | 1 | 3 | 4 |
| 10. Integração CE | 3 | 2 | 5 |
| **TOTAL** | **35** | **23** | **58** |

**Já no schema (colunas):** 11 campos
**Para coletar e armazenar no JSONB `data`:** ~47 campos novos

---

## Fontes de Coleta

| Fonte | Hotéis | Prioridade |
|-------|--------|------------|
| Google Drive (formulários respondidos) | ~30 | P0 — dados ricos, direto do hotel |
| Site Circuito Elegante (scraping) | 92 | P1 — dados já publicados |
| Sites oficiais dos hotéis (scraping) | ~62 restantes | P2 — preencher gaps |

---

## Regras de Negócio CE (universais, não por hotel)

Estas regras são da Stella, não variam por hotel e NÃO são coletadas individualmente:

### Pagamento
- Cartão de crédito obrigatório como garantia no ato da reserva (modelo Booking)
- Hotel cobra no cartão no check-in, ou hóspede paga via Pix/outro método presencialmente
- Parcelamento no cartão é efetivado pelo hotel na sequência, débito começa no dia da compra

### Handover por recusa de cartão
- Se hóspede recusar passar cartão de crédito e pedir alternativa (Pix antecipado, boleto, etc.): **handover obrigatório para atendente humano**
- Stella NÃO deve tentar resolver ou oferecer alternativas — transferir imediatamente

### Handover humano
- Regras de quando transferir são universais da Stella, não variam por hotel
- Definidas no fluxo do concierge, não na base de dados hoteleira

---

## Changelog

| Data | Autor | Mudança |
|------|-------|---------|
| 2026-04-03 | Orion + Cleverson | v1.0 — Taxonomia criada, validada. 58 campos em 10 categorias. Merge formulário CE (30q) + taxonomia concierge. Removidos: Instagram, caução, política pagamento individual, handover humano. |
