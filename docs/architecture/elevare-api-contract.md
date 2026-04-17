# Elevare Global Agent API — Contrato Canonico

> Fonte de verdade: `docs/api/elevare-global-agent.postman_collection.json`
> Ultima sincronizacao: 2026-04-16 (Story 3.11)

## Conexao

| Campo | Valor |
|---|---|
| **Base URL producao** | `https://api.elevare.com.br/api/v1` |
| **Base URL dev (Postman)** | `http://localhost:3003/api/v1` |
| **Prefixo de rota** | `/global-agent/*` em TODOS os endpoints |
| **Content-Type** | `application/json` (POST/PUT) |

## Autenticacao

Todas as requests exigem **DOIS headers**:

```
x-client-id: {ELEVARE_CLIENT_ID}
x-client-secret: {ELEVARE_CLIENT_SECRET}
```

Nao existe `X-Api-Key` — qualquer codigo que envie esse header falha.

## Endpoints implementados na Stella

### 1. Search & Availability

| Metodo | Path | Uso |
|---|---|---|
| GET | `/global-agent/search` | Busca por 1 hotel especifico |
| GET | `/global-agent/multi-search` | Busca por cidade/regiao |

**Query params do `/search` (convencao abreviada):**

| Param | Descricao |
|---|---|
| `q` | Hotel ID (ex: `136599`) |
| `CheckIn` | Data (DDMMYYYY ou YYYY-MM-DD) |
| `CheckOut` | Data (DDMMYYYY ou YYYY-MM-DD) |
| `ad` | Numero de adultos (string) |
| `ch` | Numero de criancas (opcional) |
| `ag` | Idades das criancas (comma-separated, opcional) |
| `lang` | Idioma (opcional, default `pt-BR`) |
| `code` | Codigo promocional (opcional) |

**Query params do `/multi-search` (convencao camelCase):**

| Param | Descricao |
|---|---|
| `city` ou `region` | Filtro geografico (pelo menos um obrigatorio) |
| `checkIn` | Data YYYY-MM-DD |
| `checkOut` | Data YYYY-MM-DD |
| `adults` | Numero de adultos (number) |
| `children` | Numero de criancas (opcional) |
| `maxResults` | Limite de resultados (opcional) |

**Response do search:** `{ requestId, results[] }` — `requestId` e token de cache (usar em quotation).

### 2. Customers

| Metodo | Path | Uso |
|---|---|---|
| POST | `/global-agent/customers` | Create/upsert (unique: primaryPhone) |

**Payload minimalista (Stella — Story 3.11):**

```json
{
  "primaryPhone": "+5511999887766",
  "firstName": "Joao",
  "lastName": "Silva",
  "email": "joao@example.com",
  "cpf": "12345678901",
  "birthDate": "1990-05-15"
}
```

**Payload completo (Postman docs):** inclui tambem `gender`, `rg`, `documentNumber`, `documentType`, `address{street, number, neighborhood, city, state, zipcode, country}`, `notes`, `reservationCheckIn/Out`, `preferredHotelId`, etc.

**Decisao arquitetural:** payload minimalista validado por teste real contra API. Se Elevare rejeitar, Story 3.12 expande com address estruturado.

**Response:** `{ customerId }`

### 3. Quotations

| Metodo | Path | Uso |
|---|---|---|
| POST | `/global-agent/quotations` | Cria cotacao + gera payment link |
| GET | `/global-agent/quotations/{id}` | Consulta status |
| PUT | `/global-agent/quotations/{id}/payment-link` | Regenera link expirado |
| PUT | `/global-agent/quotations/{id}/extend` | Estende validade |

**POST body:**

```json
{
  "customerId": "{customerId}",
  "requestId": "{requestId do search}",
  "offerId": 0,
  "validityDays": 1,
  "includePaymentLink": true,
  "customerMessage": "...",
  "internalNotes": "..."
}
```

`offerId` e **number** (inteiro >= 0). Elevare cruza `requestId+offerId` internamente.

**Response:** `{ quotationId, paymentLink, expiresAt, status }`

### 4. Reservations (pos-venda)

| Metodo | Path | Uso |
|---|---|---|
| GET | `/global-agent/reservations?...` | Busca reservas por email/confirmationNumber/guestName |

**Query params documentados:** `confirmationNumber`, `hotelId`, `guestName`, `checkInFrom`, `checkInTo`, `limit`, `email`. **`guestPhone` NAO aparece na Postman** (item na lista de ambiguidades).

## Endpoints Postman nao implementados (ficam pra futuras stories)

- `GET /global-agent/hotels` (List Available Hotels)
- `GET /global-agent/customers/phone/{phone}` (Get by phone)
- `GET /global-agent/customers/phone/{phone}/validate` (Validate completeness)
- `PUT /global-agent/customers` (Overwrite)
- `POST /global-agent/bookings` (Create booking — standard ou from cache)
- `POST /global-agent/follow-up/*` (Trigger, callback, stats)
- `GET /global-agent/debug-cache/{requestId}`

## Webhooks

**IMPORTANTE — ambiguidade:**

- Postman documenta **outbound** (gateway de pagamento → Elevare): `POST /global-agent/webhook/payment-status`
- Stella hoje processa **inbound** (Elevare → Stella) com event types `quote_expiring`, `reservation_confirmed`, `payment_failed`, `quote_created` em `POST /webhooks/elevare`
- O schema inbound **nao esta documentado na Postman** — a implementacao atual foi feita com base em documentacao nao rastreavel
- **Nao tocar nos arquivos `backend/src/webhooks/elevare-*.ts`** ate Elevare confirmar schema. Story 3.12 tratara.

## Change Log

| Data | Autor | Mudanca |
|---|---|---|
| 2026-04-16 | @dev (Dex) | Documento criado a partir da Postman oficial durante Story 3.11 |
