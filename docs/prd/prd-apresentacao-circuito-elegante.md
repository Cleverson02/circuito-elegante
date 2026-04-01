# PRD: Apresentacao Tecnologica — Circuito Elegante

**Status:** Em Execucao
**Data:** 2026-04-01
**Autor:** Cleverson Silva / Orion (AIOX Master)
**Versao:** 1.0

---

## 1. Objetivo

Criar uma apresentacao HTML standalone, animada e com identidade visual integrada do Circuito Elegante, para demonstrar transparentemente:
- O que foi entregue (motor de reservas personalizado + IA Concierge)
- Os custos mensais de operacao
- Diagnostico de comportamento do usuario (abandono para OTAs)
- Desafios tecnicos (hoteis sem Omnibees)
- Caminhos propostos

## 2. Publico-Alvo

Diretoria e gestores do Circuito Elegante — apresentacao executiva com linguagem acessivel mas tom tecnologico.

## 3. Tom e Narrativa

- **NAO** e sobre culpa ou inercia
- **E** sobre transparencia, parceria e dados
- Posicionamento: somos parceiros tecnologicos investidos no sucesso
- Tom: profissional, tecnologico, confiante, transparente

## 4. Identidade Visual (Merge)

| Elemento | Valor |
|----------|-------|
| Cor Primaria | `#289548` (verde CE) |
| Cor Secundaria | `#B8A446` (dourado CE) |
| Cor Tech | `#1a1a2e` (dark background) |
| Fonte Display | Noto Serif JP (200, 400) |
| Fonte UI | Inter (400, 600, 700) |
| Estilo | Luxury tech — escuro com acentos verdes/dourados |
| Logo | Circuito Elegante vertical RGB |

## 5. Estrutura de Slides

### S1 — Cover
- Branding merge: Circuito Elegante + Elevare
- Titulo: "Relatorio Tecnologico & Estrategico"
- Data e contexto

### S2 — O Que Entregamos
- Motor de reservas personalizado (CE Reserve)
- Features diferenciadas: colecoes curadas, autocomplete, multi-quarto, afiliados, short links
- Checkout 100% brasileiro (CPF, CEP auto-fill, parcelamento)
- "Melhor Preco Garantido"
- IA Concierge Digital humanizada

### S3 — Diferenciais Tecnicos
- Stack moderno (Next.js, Tailwind, API RESTful)
- Integracao Omnibees
- Sistema de parceiros/afiliados
- Links compartilhaveis para marketing
- Concierge IA com KB dos hoteis

### S4 — Investimento Mensal
- Grafico visual de custos
- API Omnibees: R$2.650
- Taxa performance: R$1.100
- Integrador Moblix: R$1.800
- Digital Ocean: $180 USD
- AWS BD: $28 USD
- Backup: $12 USD
- IA Concierge: R$4.500
- Dev/Manutencao: a calcular
- **Total estimado: ~R$11.300+/mes**

### S5 — Diagnostico: Comportamento do Usuario
- Dados de monitoramento (scrapling + analytics)
- Fluxo: usuario navega CE → abre aba OTA → compra la → abandona CE
- 10% dos que abrem OTAs concluem compra nelas
- Visualizacao do funil de perda

### S6 — Por Que Isso Acontece
- Reconhecimento de marca das OTAs (Booking, Expedia)
- Comportamento de comparacao de precos
- Programas de fidelidade (Genius, etc.)
- Habito/familiaridade do usuario
- Fenomeno global — nao exclusivo do CE

### S7 — Desafios Atuais
- Hoteis sem integracao Omnibees (sem API disponivel)
- Custo elevado para APIs de outros channel managers
- Necessidade de cotacao manual para nao-integrados
- Scale vs. custo

### S8 — Caminhos Propostos
- Reforco do "Melhor Preco Garantido" com proof points
- Beneficios exclusivos para reserva direta
- Retargeting e remarketing
- Plano progressivo de integracao de APIs
- Otimizacao da Concierge IA para retencao

### S9 — Encerramento
- Compromisso com a parceria
- Visao de futuro
- Contato e proximos passos

## 6. Requisitos Tecnicos

- HTML single-file (standalone, abre em qualquer navegador)
- Reveal.js via CDN para framework de slides
- Chart.js via CDN para graficos
- Google Fonts (Noto Serif JP + Inter)
- CSS animations customizadas
- Responsivo (funciona em projetor, notebook, tablet)
- Sem dependencias locais — tudo via CDN

## 7. Dados Concretos para Slides

### Custos Mensais (BRL)
| Item | Valor | Moeda |
|------|-------|-------|
| API Omnibees | 2.650 | BRL |
| Taxa Performance | 1.100 | BRL |
| Integrador Moblix | 1.800 | BRL |
| IA Concierge | 4.500 | BRL |
| Digital Ocean | 180 | USD |
| AWS BD | 28 | USD |
| Backup | 12 | USD |

### Metricas de Comportamento
- Usuarios que abrem abas OTA durante navegacao: a confirmar %
- Dos que abrem OTA, 10% concluem compra la
- OTAs identificadas: Booking.com, Expedia, Hotels.com, Trivago

## 8. Entregavel

- `presentation/index.html` — Apresentacao completa standalone
- Abre com duplo-clique, sem servidor necessario
