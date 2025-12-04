# US-B2B-04: Faturamento

**Como** gestor de RH,
**Quero** gerenciar pagamentos e faturas,
**Para** manter o contrato ativo.

## Critérios de Aceite
- [ ] **Métodos de Pagamento:** Cartão Corporativo ou Boleto Bancário.
- [ ] **Histórico:** Lista de faturas (Invoices) com status (Pago, Pendente, Vencido) e link para PDF.
- [ ] **Dados de Faturamento:** Editar endereço e e-mail para envio de NF.

## Cenários de Exceção
*   **Pagamento Falhou:** Notificar Admin e dar prazo de carência (ex: 5 dias) antes de bloquear o serviço.
*   **Nota Fiscal:** Integração com sistema de emissão de NF (ex: eNotas) via Webhook do Stripe.

## Especificação Técnica

### Frontend
*   **Página:** `/app/business/financeiro`
*   **Componentes:** `BillingPortalLink`, `InvoicesTable`.

### Backend
*   **Stripe Customer Portal:**
    *   Gerar link de sessão: `stripe.billingPortal.sessions.create({ customer: company.stripe_customer_id })`.
    *   Permite ao cliente atualizar cartão e baixar invoices diretamente no Stripe.
*   **Webhooks:**
    *   `invoice.payment_succeeded`: Manter serviço ativo.
    *   `invoice.payment_failed`: Marcar como `DELINQUENT` e disparar alerta.
