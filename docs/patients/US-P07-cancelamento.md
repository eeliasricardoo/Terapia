# US-P07: Cancelamento e Reagendamento

**Como** paciente,
**Quero** cancelar ou reagendar uma sessão,
**Para** lidar com imprevistos.

## Critérios de Aceite
- [ ] **Regra de 24h:**
    *   > 24h antes: Reembolso integral (100%).
    *   < 24h antes: Multa de 50% (Reembolso de 50%).
- [ ] **Reagendamento:** Permitir trocar horário com o mesmo profissional (sujeito a disponibilidade) sem custo se > 24h.
- [ ] **Justificativa:** Campo opcional para explicar motivo ao psicólogo.
- [ ] **Feedback:** Confirmação visual e por e-mail do cancelamento/estorno.

## Cenários de Exceção
*   **Cancelamento Recorrente:** Se o paciente cancelar 3x seguidas, alertar suporte ou bloquear novos agendamentos temporariamente.
*   **Falha no Estorno:** Se o Stripe falhar, gerar ticket para financeiro manual.

## Especificação Técnica

### Frontend
*   **Modal:** `CancelAppointmentModal`
    *   Calcula e mostra o valor do reembolso estimado antes de confirmar.
*   **Ação:** `cancelAppointment(id, reason)`.

### Backend
*   **API:** `POST /api/appointments/[id]/cancel`
*   **Lógica:**
    1.  Buscar `appointment` e verificar `start_time`.
    2.  Calcular `refund_amount`.
    3.  Chamar Stripe Refund API:
        ```javascript
        stripe.refunds.create({
          payment_intent: appointment.payment_intent_id,
          amount: refund_amount
        });
        ```
    4.  Atualizar status para `CANCELED`.
    5.  Notificar partes (Email/Push).
