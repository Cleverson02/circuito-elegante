# Asaas API Reference — Complete Knowledge Base

> Source: docs.asaas.com + PlayScout production experience (2026-03-31)
> This file is the SINGLE SOURCE OF TRUTH for Asaas API knowledge within this squad.

## Authentication

```
Header: access_token: {your_api_key}
Content-Type: application/json
```

**CRITICAL:** Use `access_token` header — NOT `Authorization: Bearer`. This is Asaas-specific.

**URLs:**
- Sandbox: `https://api-sandbox.asaas.com/v3`
- Production: `https://api.asaas.com/v3`

---

## 1. CUSTOMERS API

### POST /v3/customers — Create Customer

**Required:**
| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Nome do cliente |
| `cpfCnpj` | string | CPF (11 digits) ou CNPJ (14 digits) |

**Optional:**
| Field | Type | Description |
|-------|------|-------------|
| `email` | string | Email do cliente |
| `phone` | string | Fone fixo |
| `mobilePhone` | string | Fone celular |
| `address` | string | Logradouro |
| `addressNumber` | string | Número |
| `complement` | string | Complemento (max 255 chars) |
| `province` | string | Bairro |
| `postalCode` | string | CEP |
| `externalReference` | string | ID no seu sistema |
| `notificationDisabled` | boolean | Desabilitar notificações |
| `additionalEmails` | string | Emails extras separados por "," |
| `groupName` | string | Grupo do cliente |
| `company` | string | Empresa |
| `foreignCustomer` | boolean | Cliente internacional |

**Response:** Customer object with `id` (format: `cus_XXXXX`), `personType` (FISICA/JURIDICA)

**Pattern (per-buyer):** Create one Asaas customer per CPF. Cache `asaas_customer_id` in your users table. On next purchase, reuse cached ID.

---

## 2. PAYMENTS API

### POST /v3/payments — Create Payment

**Required:**
| Field | Type | Description |
|-------|------|-------------|
| `customer` | string | Asaas customer ID |
| `billingType` | string | BOLETO, CREDIT_CARD, PIX, UNDEFINED |
| `value` | number | Valor (min R$ 5,00) |
| `dueDate` | string | Data vencimento YYYY-MM-DD |

**Optional:**
| Field | Type | Description |
|-------|------|-------------|
| `description` | string | Descrição (max 500 chars) |
| `externalReference` | string | Campo livre (max 100 chars!) |
| `installmentCount` | integer | Parcelas |
| `totalValue` | number | Valor total parcelamento |
| `postalService` | boolean | Envio via Correios |

**CRITICAL CONSTRAINTS:**
- `externalReference` MAX 100 characters — exceeding causes HTTP 400
- `dueDate` must be YYYY-MM-DD format (not ISO datetime)
- `value` minimum R$ 5,00
- `description` max 500 characters

### Credit Card Fields (billingType = CREDIT_CARD)

**creditCard object (required):**
```json
{
  "holderName": "string",
  "number": "string (no spaces)",
  "expiryMonth": "string (2 digits)",
  "expiryYear": "string (4 digits)",
  "ccv": "string"
}
```

**creditCardHolderInfo object (required for anti-fraud):**
```json
{
  "name": "string",
  "email": "string",
  "cpfCnpj": "string",
  "postalCode": "string",
  "addressNumber": "string",
  "phone": "string (required!)",
  "mobilePhone": "string (optional)",
  "addressComplement": "string (optional)"
}
```

**Additional:** `remoteIp` (client IP) — required for credit card
**Tokenization:** Use `creditCardToken` instead of raw card data after first payment

### Installments
- Visa/Mastercard: up to 21 installments
- Other brands: up to 12 installments
- Use `installmentCount` + `totalValue` (removes `value`)

### Split Configuration (array)
```json
{
  "walletId": "string (required)",
  "fixedValue": "number (optional)",
  "percentualValue": "number (optional — applied to net value)",
  "totalFixedValue": "number (optional — installments only)"
}
```

### Discount/Interest/Fine
```json
{
  "discount": { "value": 10, "dueDateLimitDays": 5, "type": "PERCENTAGE" },
  "interest": { "value": 2 },
  "fine": { "value": 1, "type": "PERCENTAGE" }
}
```

### Payment Statuses
| Status | Description |
|--------|-------------|
| PENDING | Aguardando pagamento |
| RECEIVED | Pagamento recebido |
| CONFIRMED | Confirmado (saldo ainda não disponível) |
| OVERDUE | Vencido |
| REFUNDED | Estornado |
| RECEIVED_IN_CASH | Recebido em dinheiro |
| REFUND_REQUESTED | Estorno solicitado |
| REFUND_IN_PROGRESS | Estorno em processamento |
| CHARGEBACK_REQUESTED | Chargeback recebido |
| CHARGEBACK_DISPUTE | Em disputa de chargeback |
| AWAITING_CHARGEBACK_REVERSAL | Disputa ganha, aguardando adquirente |
| DUNNING_REQUESTED | Negativação solicitada |
| DUNNING_RECEIVED | Negativação recebida |
| AWAITING_RISK_ANALYSIS | Aguardando análise de risco |

### GET /v3/payments/{id} — Get Payment
Returns full payment object with all fields.

### GET /v3/payments — List Payments
Supports pagination (`offset`, `limit`) and filtering.

---

## 3. PIX QR CODE

### GET /v3/payments/{id}/pixQrCode — Get PIX QR Code

**Response:**
```json
{
  "encodedImage": "base64_string (QR code image)",
  "payload": "string (PIX copy-paste / copia e cola)",
  "expirationDate": "YYYY-MM-DD HH:mm:ss"
}
```

**Frontend rendering:**
```html
<img src="data:image/png;base64,{encodedImage}" />
```

**Rules:**
- QR Code is DYNAMIC with expiration
- Expires 12 months after due date
- Can only be paid once
- Call this endpoint AFTER payment creation (status PENDING)
- Each payment update requires obtaining a new QR code

---

## 4. CREDIT CARD TOKENIZATION

### POST /v3/creditCard/tokenize

**Purpose:** Store card securely for future payments without resending full card data.

**Response:** `creditCardToken`, `creditCardNumber` (last 4), `creditCardBrand`

**Rules:**
- Token is per-customer — cannot be used for other customers
- Pre-enabled in Sandbox; request activation for Production
- Subsequent payments use `creditCardToken` field instead of `creditCard` object

---

## 5. REFUNDS

### POST /v3/payments/{id}/refund — Refund Payment

**Permission:** `PAYMENT_REFUND:WRITE`

**Request Body (optional):**
```json
{
  "value": 50.00,
  "description": "Motivo do estorno",
  "splitRefunds": [
    { "id": "split_id", "value": 10.00 }
  ]
}
```

**Refund Logic:**
- No `value` → full refund
- With `value` → partial refund
- `splitRefunds` → refund specific split amounts
- If `value` not provided but `splitRefunds` has items → sum of splitRefunds

**Per billing type:**
- **PIX:** Full or multiple partial refunds (sum cannot exceed total)
- **Credit Card:** Refund confirmed or received payments
- **Boleto:** Refund received payments

**Refund Statuses:** PENDING, CANCELLED, DONE

---

## 6. WEBHOOKS

### POST /v3/webhooks — Create Webhook

**Fields:**
| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Nome identificador |
| `url` | string | URL do endpoint |
| `email` | string | Email contato |
| `enabled` | boolean | Ativo/inativo |
| `interrupted` | boolean | Fila interrompida |
| `authToken` | string | Token segurança (32-255 chars, no spaces) |
| `sendType` | string | SEQUENTIALLY |
| `events` | array | Eventos para escutar |

**CRITICAL:** `authToken` is only returned ONCE in creation response. Store it immediately.
**Limit:** Up to 10 webhooks per account.

### All 28 Payment Webhook Events

| Event | Description | Billing Types |
|-------|-------------|---------------|
| PAYMENT_CREATED | Nova cobrança gerada | All |
| PAYMENT_AWAITING_RISK_ANALYSIS | Aguardando análise de risco | Card |
| PAYMENT_APPROVED_BY_RISK_ANALYSIS | Aprovado por análise de risco | Card |
| PAYMENT_REPROVED_BY_RISK_ANALYSIS | Reprovado por análise de risco | Card |
| PAYMENT_AUTHORIZED | Autorizado, precisa capturar | Card |
| PAYMENT_UPDATED | Alteração de vencimento/valor | All |
| PAYMENT_CONFIRMED | Confirmado (saldo indisponível) | Boleto, Card |
| PAYMENT_RECEIVED | Pagamento recebido | All |
| PAYMENT_CREDIT_CARD_CAPTURE_REFUSED | Falha na captura do cartão | Card |
| PAYMENT_ANTICIPATED | Cobrança antecipada | All |
| PAYMENT_OVERDUE | Cobrança vencida | All |
| PAYMENT_DELETED | Cobrança removida | All |
| PAYMENT_RESTORED | Cobrança restaurada | All |
| PAYMENT_REFUNDED | Cobrança estornada | All |
| PAYMENT_PARTIALLY_REFUNDED | Estorno parcial | PIX, Card |
| PAYMENT_REFUND_IN_PROGRESS | Estorno em processamento | All |
| PAYMENT_REFUND_DENIED | Estorno negado | Boleto |
| PAYMENT_RECEIVED_IN_CASH_UNDONE | Recebimento em dinheiro desfeito | All |
| PAYMENT_CHARGEBACK_REQUESTED | Chargeback recebido | Card |
| PAYMENT_CHARGEBACK_DISPUTE | Em disputa de chargeback | Card |
| PAYMENT_AWAITING_CHARGEBACK_REVERSAL | Aguardando reversão | Card |
| PAYMENT_DUNNING_RECEIVED | Negativação recebida | Boleto |
| PAYMENT_DUNNING_REQUESTED | Negativação solicitada | Boleto |
| PAYMENT_BANK_SLIP_CANCELLED | Boleto cancelado | Boleto |
| PAYMENT_BANK_SLIP_VIEWED | Boleto visualizado | Boleto |
| PAYMENT_CHECKOUT_VIEWED | Fatura visualizada | All |
| PAYMENT_SPLIT_DIVERGENCE_BLOCK | Bloqueio por divergência de split | All |
| PAYMENT_SPLIT_DIVERGENCE_BLOCK_FINISHED | Bloqueio resolvido | All |

### Payment Flows by Billing Type

**PIX (on time):** CREATED → RECEIVED
**PIX (late):** CREATED → OVERDUE → RECEIVED
**CRITICAL PIX:** Skips PAYMENT_CONFIRMED → goes directly to PAYMENT_RECEIVED

**Boleto (on time):** CREATED → CONFIRMED → RECEIVED
**Boleto (late):** CREATED → OVERDUE → CONFIRMED → RECEIVED
**Boleto (refund):** CREATED → RECEIVED → REFUNDED

**Credit Card (on time):** CREATED → CONFIRMED → RECEIVED (30 days after CONFIRMED)
**Credit Card (late):** CREATED → OVERDUE → CONFIRMED → RECEIVED
**Credit Card (refund during confirm):** CREATED → CONFIRMED → REFUNDED
**Credit Card (refund after receipt):** CREATED → CONFIRMED → RECEIVED → REFUNDED

**Chargeback (merchant wins):** CONFIRMED/RECEIVED → CHARGEBACK_REQUESTED → CHARGEBACK_DISPUTE → AWAITING_CHARGEBACK_REVERSAL → CONFIRMED/RECEIVED
**Chargeback (customer wins):** CONFIRMED/RECEIVED → CHARGEBACK_REQUESTED → CHARGEBACK_DISPUTE → REFUNDED

### Webhook Payload Format
```json
{
  "id": "evt_xxxxx",
  "event": "PAYMENT_RECEIVED",
  "payment": {
    "object": "payment",
    "id": "pay_xxxxx",
    "customer": "cus_xxxxx",
    "value": 100.00,
    "status": "RECEIVED",
    "billingType": "PIX",
    ...
  }
}
```

---

## 7. SUBSCRIPTIONS

### POST /v3/subscriptions — Create Subscription

**Required:**
| Field | Type | Description |
|-------|------|-------------|
| `customer` | string | Asaas customer ID |
| `billingType` | string | BOLETO, CREDIT_CARD, PIX, UNDEFINED |
| `value` | number | Valor da assinatura |
| `nextDueDate` | string | Próximo vencimento YYYY-MM-DD |
| `cycle` | string | WEEKLY, BIWEEKLY, MONTHLY, BIMONTHLY, QUARTERLY, SEMIANNUALLY, YEARLY |

**CRITICAL:** SUBSCRIPTION_RENEWED event does NOT exist. Use PAYMENT_RECEIVED where subscription != null.

---

## 8. SUBACCOUNTS

### POST /v3/accounts — Create Subaccount

**Required:** name, email, cpfCnpj, mobilePhone, incomeValue, address, addressNumber, province, postalCode

**Response includes:**
- `apiKey` — Subaccount API key (ONLY returned once — store immediately!)
- `walletId` — For splits and transfers

**Sandbox limit:** 20 subaccounts per day
**Fees:** Per-account creation fees apply

---

## 9. TRANSFERS

### POST /v3/transfers — Transfer Between Asaas Accounts
```json
{ "value": 1000.00, "walletId": "uuid" }
```
- Transfers are immediate
- Cannot exceed origin account balance
- Requires account link between origin and destination

### POST /v3/transfers — Transfer to External (PIX/TED)
Separate endpoint for external bank transfers via PIX key or bank details.

---

## 10. SANDBOX TESTING

**Test Credit Card (approved):** `4444 4444 4444 4444`, any future expiry, CVV `123`
**Test Cards (declined):** Mastercard `5184019740373151`, Visa `4916561358240741`
**Test CPF:** Any valid CPF format (e.g., `24971563792`)

**Sandbox differences:**
- Accounts approved automatically
- Payments can be confirmed with one click
- Credit card payments confirmed with fictitious valid cards
- Tokenization pre-enabled (Production requires activation request)
- Emails/SMS work normally — do NOT use real emails for test customers
- Max 20 subaccounts per day

---

## 11. ERROR HANDLING

**Error Response Format:**
```json
{
  "errors": [
    { "code": "error_code", "description": "Error description" }
  ]
}
```

**Common Errors:**
| Code | Description |
|------|-------------|
| `invalid_customer` | Customer inválido ou não informado |
| `invalid_access_token` | API key inválida |
| `invalid_value` | Valor inválido |
| `invalid_billingType` | Tipo de cobrança inválido |
| `invalid_dueDate` | Data de vencimento inválida |

**HTTP Status Codes:**
- 200: Success
- 400: Bad Request (validation errors)
- 401: Unauthorized (invalid API key)
- 404: Not Found
- 429: Rate Limit
- 500: Internal Server Error
