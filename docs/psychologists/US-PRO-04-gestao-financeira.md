# US-PRO-04: Gestão Financeira

**Como** psicólogo,
**Quero** acompanhar meus ganhos e solicitar saques,
**Para** receber pelo meu trabalho.

## Critérios de Aceite
- [ ] **Dashboard Financeiro:**
    *   Saldo Disponível (já liberado).
    *   Saldo Pendente (agendamentos futuros ou prazo do cartão).
    *   Total Recebido (histórico).
- [ ] **Extrato Detalhado:** Lista de sessões com data, paciente, valor bruto, taxa da plataforma e valor líquido.
- [ ] **Saque:** Botão para transferir saldo disponível para conta bancária cadastrada.
- [ ] **Configuração de Conta:** Cadastro de conta bancária via Stripe Connect Onboarding.

## Cenários de Exceção
*   **Chargeback:** Se um paciente contestar a compra, o valor deve ser bloqueado/deduzido do saldo do psicólogo (conforme termos de uso).
*   **Falha no Saque:** Notificar o psicólogo e estornar o valor para o saldo da plataforma.

## Especificação Técnica

### Frontend
*   **Página:** `/app/pro/financeiro`
*   **Componentes:**
    *   `BalanceCard`: Mostra os saldos.
    *   `TransactionTable`: Tabela com filtros de data.
    *   `PayoutButton`: Aciona o saque.
*   **Integração:** Link para "Configurar Recebimentos" que abre o Stripe Express Dashboard.

### Backend
*   **Stripe Connect:**
    *   Tipo de conta: `Express` ou `Standard`.
    *   **Split de Pagamento:** No momento da cobrança (`payment_intent`), definir `application_fee_amount` (taxa da plataforma) e `transfer_data.destination` (conta do psicólogo).
*   **Webhooks:**
    *   `payout.paid`: Atualizar status do saque no banco local.
    *   `charge.refunded`: Registrar estorno.
*   **Tabela `transactions` (Espelho):**
    *   `amount_gross`, `amount_net`, `platform_fee`.
    *   `stripe_transfer_id`.
