# US-P06: Pagamento

**Como** paciente,
**Quero** pagar via Cartão ou PIX,
**Para** confirmar o agendamento.

## Critérios de Aceite
- [ ] Integração transparente com Stripe (Embedded Checkout).
- [ ] Suporte a Cartão de Crédito e PIX (via Stripe ou provider local se necessário).
- [ ] Opção de "Salvar cartão para futuras sessões".
- [ ] Exibir resumo do pedido (Profissional, Data, Hora, Valor) antes de confirmar.
- [ ] Envio de e-mail de confirmação/recibo após sucesso.

## Cenários de Exceção
*   **Cartão Recusado:** Exibir mensagem clara do erro (ex: "Saldo insuficiente") e permitir tentar outro cartão.
*   **Timeout do Hold:** Se o pagamento demorar mais de 15min, o slot é liberado. O usuário deve ser avisado: "Seu tempo expirou, por favor selecione o horário novamente".
*   **Falha no Webhook:** Implementar mecanismo de reconciliação para garantir que pagamentos aprovados sempre confirmem o agendamento.

## Especificação Técnica

### Frontend
*   **Página:** `/checkout/[appointment_id]`
*   **Lib:** `@stripe/react-stripe-js` e `@stripe/stripe-js`.
*   **Componentes:**
    *   `CheckoutForm`: Renderiza o `PaymentElement` do Stripe.
    *   `OrderSummary`: Card com detalhes da sessão.
*   **Fluxo:**
    1.  Frontend chama `create-payment-intent` com `appointment_id`.
    2.  Backend retorna `clientSecret`.
    3.  Frontend confirma pagamento com `stripe.confirmPayment()`.

### Backend
*   **API:** `/api/checkout/create-intent`
*   **Stripe Metadata:** Anexar `appointment_id` e `patient_id` aos metadados do PaymentIntent para rastreio.
*   **Webhook Handler (`/api/webhooks/stripe`):**
    *   Evento: `payment_intent.succeeded`
    *   Ação:
        1.  Atualizar `appointments` SET `status = 'SCHEDULED'`.
        2.  Criar registro em `transactions`.
        3.  Disparar e-mail de confirmação.
