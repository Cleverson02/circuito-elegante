# audit-payment-code

Task para auditar código de integração Asaas existente.

```yaml
task:
  id: audit-payment-code
  task_name: "Audit Asaas Payment Integration Code"
  status: pending
  responsible_executor: "asaas-chief"
  execution_type: Agent
  estimated_time: "1-2h"

  input:
    - "Path do código de pagamento (Edge Functions, services, components)"
    - "Tipo de integração (checkout, webhook, split, ou todos)"

  output:
    - "Relatório de auditoria com 7 checks críticos"
    - "Lista de veto conditions violadas"
    - "Recomendações de fix priorizadas"
    - "Compliance score (0-100)"

  action_items:
    - section: "1. Authentication Audit"
      steps:
        - "1.1 Grep por 'Authorization.*Bearer' em código Asaas → VETO se encontrar"
        - "1.2 Verificar uso de 'access_token' header"
        - "1.3 Verificar que API key está em env var (não hardcoded)"

    - section: "2. Payload Validation Audit"
      steps:
        - "2.1 Verificar validação de externalReference <= 100 chars"
        - "2.2 Verificar formato dueDate YYYY-MM-DD (sem horário)"
        - "2.3 Verificar validação de value >= 5.00"
        - "2.4 Verificar billingType é enum válido"
        - "2.5 Verificar description <= 500 chars"

    - section: "3. Credit Card Audit"
      steps:
        - "3.1 Verificar creditCardHolderInfo.phone presente"
        - "3.2 Verificar remoteIp presente para cartão"
        - "3.3 Verificar que card data NÃO é armazenado"
        - "3.4 Verificar tokenização implementada (se aplicável)"

    - section: "4. Webhook Handler Audit"
      steps:
        - "4.1 Verificar que handler aceita PAYMENT_RECEIVED (PIX!)"
        - "4.2 Verificar idempotência implementada"
        - "4.3 Verificar que retorna 200 para eventos desconhecidos"
        - "4.4 Verificar validação de authToken"
        - "4.5 Verificar atualização end-to-end (transação + pedido)"
        - "4.6 Verificar que NÃO escuta SUBSCRIPTION_RENEWED"

    - section: "5. Customer Pattern Audit"
      steps:
        - "5.1 Verificar per-buyer customer pattern"
        - "5.2 Verificar que CPF NÃO é armazenado no DB"
        - "5.3 Verificar cache de asaas_customer_id"

    - section: "6. Edge Function Audit"
      steps:
        - "6.1 Verificar que Supabase SDK NÃO é importado"
        - "6.2 Verificar deploy com --no-verify-jwt"
        - "6.3 Verificar JWT verification via GoTrue API"
        - "6.4 Verificar rate limiting"

    - section: "7. Split Audit (se aplicável)"
      steps:
        - "7.1 Verificar walletId presente em cada split entry"
        - "7.2 Verificar que tem percentualValue OU fixedValue"
        - "7.3 Verificar lógica de refund com splitRefunds"

  acceptance_criteria:
    - "Relatório gerado com score de compliance"
    - "Cada check classificado como PASS/FAIL/N/A"
    - "Veto conditions violadas listadas com file:line"
    - "Recomendações de fix ordenadas por severidade"

  output_format: |
    ## Auditoria Asaas — {project_name}

    **Compliance Score:** {score}/100

    | # | Check | Status | Arquivo:Linha |
    |---|-------|--------|---------------|
    | 1 | access_token header | PASS/FAIL | file:line |
    | 2 | externalReference <= 100 | PASS/FAIL | file:line |
    | 3 | dueDate YYYY-MM-DD | PASS/FAIL | file:line |
    | 4 | Per-buyer customer | PASS/FAIL | file:line |
    | 5 | Webhook handles RECEIVED | PASS/FAIL | file:line |
    | 6 | CPF não armazenado | PASS/FAIL | file:line |
    | 7 | Sem SDK em Edge Function | PASS/FAIL | file:line |

    **Veto Conditions Violadas:** {count}
    **Recomendações:** {list}

  veto_conditions:
    - "VETO se score < 70 e não há plano de remediação"
    - "VETO se Authorization: Bearer encontrado para Asaas"
    - "VETO se CPF armazenado no banco"
```
