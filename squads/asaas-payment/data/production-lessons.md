# Production Lessons — Asaas Integration

> Source: PlayScout production (2026-03-31) — bugs, fixes, and patterns from real deployment
> These are VETO CONDITIONS for any Asaas integration. Ignoring them WILL cause production bugs.

## LESSON 001: externalReference Max 100 Characters
- **Bug:** HTTP 400 from Asaas when externalReference exceeded 100 chars
- **Root Cause:** Concatenating multiple IDs created strings > 100 chars
- **Fix:** Truncate or validate before sending: `rawExtRef.length <= 100 ? rawExtRef : undefined`
- **VETO:** NEVER send externalReference without length validation
- **Commit:** `79802ad`

## LESSON 002: access_token Header (NOT Authorization: Bearer)
- **Bug:** All API calls returning 401
- **Root Cause:** Using standard `Authorization: Bearer {key}` — Asaas uses custom header
- **Fix:** Use `access_token: {key}` header
- **VETO:** NEVER use Authorization header for Asaas API
- **Pattern:**
```typescript
const headers = { 'access_token': apiKey, 'Content-Type': 'application/json' };
```

## LESSON 003: PIX Skips PAYMENT_CONFIRMED
- **Bug:** Webhook handler waiting for PAYMENT_CONFIRMED before updating order status
- **Root Cause:** PIX goes directly CREATED → RECEIVED (no CONFIRMED step)
- **Fix:** Webhook handler MUST accept both PAYMENT_CONFIRMED and PAYMENT_RECEIVED
- **VETO:** NEVER assume all billing types follow same status flow

## LESSON 004: SUBSCRIPTION_RENEWED Does NOT Exist
- **Bug:** Listening for SUBSCRIPTION_RENEWED event — never fires
- **Root Cause:** Event doesn't exist in Asaas
- **Fix:** Use PAYMENT_RECEIVED and check if `subscription` field is not null
- **VETO:** NEVER listen for SUBSCRIPTION_RENEWED

## LESSON 005: dueDate Format Must Be YYYY-MM-DD
- **Bug:** HTTP 400 when sending ISO datetime
- **Root Cause:** Asaas expects `2026-04-06` not `2026-04-06T15:30:00.000Z`
- **Fix:** `dueDate.split('T')[0]`
- **VETO:** ALWAYS strip time component from dueDate

## LESSON 006: Per-Buyer Asaas Customer Pattern
- **Bug:** All payments going to same customer, breaking refund/history
- **Root Cause:** Using single shared ASAAS_CUSTOMER_ID
- **Fix:** Create one Asaas customer per CPF/buyer, cache `asaas_customer_id` in users table
- **VETO:** NEVER share Asaas customer IDs between different buyers

## LESSON 007: NEVER Use createClient from esm.sh in Edge Functions
- **Bug:** Supabase SDK from esm.sh pollutes global `fetch`, breaking Asaas API calls
- **Root Cause:** esm.sh bundled Supabase client intercepts fetch
- **Fix:** Use raw `fetch()` calls to PostgREST API with service_role key
- **VETO:** NEVER import Supabase SDK in Edge Functions that call external APIs
- **Pattern:**
```typescript
// WRONG: import { createClient } from 'https://esm.sh/@supabase/supabase-js'
// CORRECT: Direct PostgREST fetch
const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, {
  headers: { 'apikey': serviceRoleKey, 'Authorization': `Bearer ${serviceRoleKey}` }
});
```

## LESSON 008: Deploy Edge Functions with --no-verify-jwt
- **Bug:** Edge Functions rejecting valid user JWTs
- **Root Cause:** Supabase gateway can't verify ES256 user JWTs
- **Fix:** Deploy with `--no-verify-jwt` + verify JWT server-side via GoTrue API
- **Pattern:**
```typescript
const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
  headers: { 'Authorization': `Bearer ${userToken}`, 'apikey': anonKey }
});
```

## LESSON 009: FORCE ROW LEVEL SECURITY + SECURITY DEFINER
- **Bug:** SECURITY DEFINER functions still blocked by RLS
- **Root Cause:** Supabase's `FORCE ROW LEVEL SECURITY` makes SECURITY DEFINER also subject to RLS
- **Fix:** Use service_role key in Edge Functions to bypass RLS
- **VETO:** NEVER assume SECURITY DEFINER bypasses RLS in Supabase

## LESSON 010: creditCardHolderInfo.phone is Required
- **Bug:** Card payment 400 error
- **Root Cause:** `phone` field missing in creditCardHolderInfo
- **Fix:** Always include `phone` in creditCardHolderInfo object
- **Commit:** `79ceb59`

## LESSON 011: PIX billingType Must Be Explicit
- **Bug:** Payment created as UNDEFINED instead of PIX, no QR code generated
- **Root Cause:** billingType not explicitly set to "PIX"
- **Fix:** Always send `billingType: "PIX"` when user selects PIX
- **Commit:** `79ceb59`

## LESSON 012: Admin Seller Detection
- **Bug:** Admin creating products treated as buyer instead of seller
- **Root Cause:** Role detection logic didn't account for admin-as-seller scenario
- **Fix:** Check if admin has mentor_profile and products
- **Commit:** `79ceb59`

## LESSON 013: SMTP Ports Blocked in Supabase Edge Functions
- **Bug:** Email sending failing from Edge Functions
- **Root Cause:** Ports 25/465/587 blocked by Deno Deploy
- **Fix:** Use external email service (Hostinger API) or send from client-side
- **VETO:** NEVER attempt SMTP from Supabase Edge Functions

## LESSON 014: Minimum Payment Value R$ 5,00
- **Bug:** HTTP 400 for small test payments
- **Root Cause:** Asaas minimum payment is R$ 5,00
- **Fix:** Validate amount >= 5 before API call
- **VETO:** ALWAYS validate minimum payment amount

## LESSON 015: Rate Limiting in Edge Functions
- **Pattern:** In-memory rate limiting per isolate (10 requests/minute/user)
- **Why:** Prevents abuse without external state
- **Implementation:** Map<userId, { count, resetAt }>

## LESSON 016: CPF Sent to Asaas, NEVER Stored in DB
- **Pattern:** LGPD data minimization
- **Why:** CPF is PII, only needed for Asaas customer creation
- **Fix:** Send to Asaas API only, cache customer_id (not CPF)
- **VETO:** NEVER store buyer CPF in your database (LGPD Art. 6 III)

## LESSON 017: Split Validation Before API Call
- **Pattern:** Validate split array structure before sending to Asaas
- **Required:** Each split entry must have walletId + (percentualValue OR fixedValue OR totalFixedValue)
- **VETO:** NEVER send unvalidated split config to Asaas

## LESSON 018: Webhook End-to-End Verification
- **Bug:** Webhook created transaction but did NOT update order status
- **Root Cause:** Handler only did INSERT (transaction) but missed UPDATE (order status)
- **Fix:** Verify COMPLETE flow: webhook → create transaction → update order status
- **VETO:** ALWAYS verify webhook handler updates ALL dependent entities
