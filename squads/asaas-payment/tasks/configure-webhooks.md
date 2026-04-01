# configure-webhooks

Task para configurar webhook handler completo para eventos Asaas.

```yaml
task:
  id: configure-webhooks
  task_name: "Configure Asaas Webhook Handler"
  status: pending
  responsible_executor: "@dev (with webhook-guardian guidance)"
  execution_type: Hybrid
  estimated_time: "3-5h"

  input:
    - "Endpoint URL para receber webhooks"
    - "Lista de eventos a monitorar"
    - "Tabelas/entidades que serão atualizadas por cada evento"
    - "Asaas API key para criar webhook via API"

  output:
    - "Webhook endpoint implementado e deployado"
    - "Handler para cada evento configurado"
    - "Tabela de idempotência (webhook_events)"
    - "Webhook registrado na Asaas via API"
    - "authToken armazenado com segurança"

  action_items:
    - section: "1. Criar Endpoint de Webhook"
      steps:
        - "1.1 Criar Edge Function / endpoint POST para receber webhooks"
        - "1.2 Implementar validação de authToken"
        - "1.3 Implementar idempotência (verificar event ID antes de processar)"
        - "1.4 Retornar 200 OK para TODOS os eventos (mesmo desconhecidos)"

    - section: "2. Implementar Handlers por Evento"
      steps:
        - "2.1 PAYMENT_CONFIRMED → atualizar status do pedido (boleto, cartão)"
        - "2.2 PAYMENT_RECEIVED → atualizar status do pedido (PIX + todos)"
        - "2.3 PAYMENT_REFUNDED → marcar pedido como estornado"
        - "2.4 PAYMENT_PARTIALLY_REFUNDED → registrar estorno parcial"
        - "2.5 PAYMENT_OVERDUE → marcar pedido como vencido"
        - "2.6 PAYMENT_CHARGEBACK_REQUESTED → alertar admin"
        - "2.7 Subscription renewal: PAYMENT_RECEIVED + subscription != null"

    - section: "3. Verificação End-to-End"
      steps:
        - "3.1 Para CADA evento: verificar que TODAS as entidades são atualizadas"
        - "3.2 Não apenas criar transação — também atualizar status do pedido"
        - "3.3 Enviar notificação ao comprador quando aplicável"
        - "3.4 Log de auditoria para cada evento processado"

    - section: "4. Registrar Webhook na Asaas"
      steps:
        - "4.1 POST /v3/webhooks com url, events, authToken"
        - "4.2 Armazenar authToken retornado (só vem UMA VEZ)"
        - "4.3 Testar com evento de teste no sandbox"

  acceptance_criteria:
    - "Handler processa PAYMENT_CONFIRMED E PAYMENT_RECEIVED"
    - "PIX funciona (pula CONFIRMED, vai direto para RECEIVED)"
    - "Idempotência implementada (eventos duplicados ignorados)"
    - "Todos os eventos retornam 200 OK"
    - "authToken validado em cada request"
    - "End-to-end: transação + status do pedido + notificação"
    - "Renovação de assinatura detectada via PAYMENT_RECEIVED + subscription"

  veto_conditions:
    - "VETO se handler só processa PAYMENT_CONFIRMED (perde PIX)"
    - "VETO se handler sem idempotência"
    - "VETO se retorna erro para eventos desconhecidos"
    - "VETO se atualiza apenas transação sem atualizar status do pedido"
    - "VETO se escuta SUBSCRIPTION_RENEWED (não existe)"
    - "VETO se authToken não validado"

  quality_gate:
    agent: "webhook-guardian"
    checks:
      - "28 eventos documentados e tratados"
      - "Idempotência testada com evento duplicado"
      - "PIX flow verificado end-to-end"
```
