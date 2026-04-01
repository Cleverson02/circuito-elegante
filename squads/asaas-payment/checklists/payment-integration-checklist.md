# Payment Integration Checklist

> Use this checklist before deploying ANY Asaas payment integration.
> Every item is derived from a production bug or documented constraint.

## Authentication
- [ ] Using `access_token` header (NOT `Authorization: Bearer`)
- [ ] API key stored in environment variable (not hardcoded)
- [ ] Correct API URL (sandbox vs production)

## Payment Creation
- [ ] `customer` field has valid Asaas customer ID (cus_XXXXX)
- [ ] `billingType` is PIX, BOLETO, CREDIT_CARD, or UNDEFINED
- [ ] `value` >= 5.00 (Asaas minimum)
- [ ] `dueDate` format is YYYY-MM-DD (no time component)
- [ ] `externalReference` is undefined OR length <= 100 characters
- [ ] `description` length <= 500 characters

## Credit Card Specific
- [ ] `creditCard` object has all 5 fields (holderName, number, expiryMonth, expiryYear, ccv)
- [ ] `creditCardHolderInfo` includes `phone` (required!)
- [ ] `creditCardHolderInfo` includes name, email, cpfCnpj, postalCode, addressNumber
- [ ] `remoteIp` is present (client IP address)
- [ ] Card number has no spaces

## PIX Specific
- [ ] `billingType` explicitly set to "PIX" (not UNDEFINED)
- [ ] After creation, calling GET /v3/payments/{id}/pixQrCode
- [ ] Rendering QR code: `<img src="data:image/png;base64,{encodedImage}" />`
- [ ] Providing copy-paste code (payload) to user

## Webhook Handler
- [ ] Handles BOTH PAYMENT_CONFIRMED and PAYMENT_RECEIVED
- [ ] Idempotency check (event ID stored and checked)
- [ ] Returns 200 OK for ALL events (even unrecognized)
- [ ] Validates authToken on incoming webhooks
- [ ] Updates ALL dependent entities (transaction + order status)
- [ ] NOT listening for SUBSCRIPTION_RENEWED (doesn't exist)
- [ ] Subscription renewal detected via PAYMENT_RECEIVED + subscription != null

## Split Configuration
- [ ] Every split entry has valid walletId
- [ ] Every split entry has percentualValue OR fixedValue OR totalFixedValue
- [ ] percentualValue is applied to NET value (after Asaas fees)

## Security & LGPD
- [ ] CPF/CNPJ sent to Asaas only — NOT stored in database
- [ ] No raw credit card data stored anywhere
- [ ] Edge Functions deployed with --no-verify-jwt + server-side JWT verification
- [ ] No Supabase SDK imported in Edge Functions (use raw fetch)
- [ ] Rate limiting implemented

## Refund
- [ ] Refund endpoint: POST /v3/payments/{id}/refund
- [ ] Partial refund: sending `value` field
- [ ] Split refund: using `splitRefunds` array

## Sandbox → Production Migration
- [ ] API URL changed from api-sandbox to api.asaas.com
- [ ] Production API key configured
- [ ] Test credit card numbers removed
- [ ] Tokenization activation requested (if used)
- [ ] Webhook URLs updated to production endpoints
- [ ] Real customer emails won't receive test notifications
