# implement-checkout

Task para implementar checkout transparente Asaas em qualquer projeto.

```yaml
task:
  id: implement-checkout
  task_name: "Implement Transparent Checkout"
  status: pending
  responsible_executor: "@dev (with payment-architect guidance)"
  execution_type: Hybrid
  estimated_time: "4-8h"

  input:
    - "Projeto com frontend React/Vue/Angular/etc."
    - "Asaas API key (sandbox para desenvolvimento)"
    - "Billing types desejados (PIX, CREDIT_CARD, BOLETO, ou todos)"
    - "Definição do fluxo de compra (carrinho, produto único, assinatura)"

  output:
    - "Edge Function / API endpoint para criação de pagamento"
    - "Componente de checkout transparente no frontend"
    - "Componente PIX QR Code com copy-paste"
    - "Componente de cartão de crédito com tokenização"
    - "Componente de boleto com link para download"
    - "Per-buyer customer resolution implementado"

  action_items:
    - section: "1. Backend — Edge Function / API"
      steps:
        - "1.1 Criar endpoint que recebe dados do checkout"
        - "1.2 Implementar resolução de customer Asaas (per-buyer pattern)"
        - "1.3 Implementar criação de pagamento via Asaas API"
        - "1.4 Implementar obtenção de PIX QR code"
        - "1.5 Implementar tokenização de cartão"
        - "1.6 Implementar validação de payloads (AP-PA-001)"
        - "1.7 Implementar rate limiting"

    - section: "2. Frontend — Componentes de Checkout"
      steps:
        - "2.1 Criar formulário de dados do comprador (nome, email, CPF)"
        - "2.2 Criar seletor de método de pagamento (PIX/Cartão/Boleto)"
        - "2.3 Criar componente PIX: QR code base64 + botão copiar código"
        - "2.4 Criar formulário cartão: número, validade, CVV, dados do titular"
        - "2.5 Criar componente boleto: link para bankSlipUrl"
        - "2.6 Criar tela de confirmação de pagamento"
        - "2.7 Implementar polling de status do pagamento"

    - section: "3. Validações Obrigatórias"
      steps:
        - "3.1 externalReference <= 100 caracteres"
        - "3.2 dueDate formato YYYY-MM-DD"
        - "3.3 value >= 5.00"
        - "3.4 creditCardHolderInfo.phone presente para cartão"
        - "3.5 remoteIp presente para cartão"
        - "3.6 CPF NÃO armazenado no banco (LGPD)"

  acceptance_criteria:
    - "Checkout transparente (ZERO redirect para Asaas)"
    - "PIX: QR code renderizado na tela + copy-paste funcional"
    - "Cartão: pagamento processado com todos os campos obrigatórios"
    - "Boleto: link para download do boleto exibido"
    - "Customer Asaas criado por comprador (per-buyer)"
    - "Todas as validações de payload passando"
    - "Sem erros 400/401 da API Asaas"
    - "CPF não armazenado no banco de dados"

  veto_conditions:
    - "VETO se checkout redireciona para invoiceUrl"
    - "VETO se access_token enviado como Authorization: Bearer"
    - "VETO se externalReference > 100 chars sem validação"
    - "VETO se dueDate inclui componente de horário"
    - "VETO se CPF armazenado na base de dados"
    - "VETO se Supabase SDK importado em Edge Function"

  quality_gate:
    agent: "asaas-chief"
    checklist: "checklists/payment-integration-checklist.md"
```
