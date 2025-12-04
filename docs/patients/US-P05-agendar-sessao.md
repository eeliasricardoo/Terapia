# US-P05: Agendar Sessão

**Como** paciente,
**Quero** ver os horários livres e reservar uma sessão,
**Para** garantir meu atendimento.

## Critérios de Aceite
- [ ] Visualizar calendário mensal com dias disponíveis destacados.
- [ ] Ao clicar no dia, exibir lista de slots de horário (ex: 08:00, 09:00).
- [ ] Os horários devem ser exibidos no fuso horário local do paciente (detectado via browser).
- [ ] Bloquear horários já agendados, passados ou indisponíveis.
- [ ] Reserva temporária (hold) de 15 min ao selecionar um slot para evitar *double-booking* durante o pagamento.

## Cenários de Exceção
*   **Concorrência:** Dois pacientes clicam no mesmo horário ao mesmo tempo. O segundo deve receber erro: "Horário acabou de ser reservado".
*   **Fuso Horário:** Paciente no Brasil, Psicólogo em Portugal. O sistema deve converter corretamente (ex: 14h BRT = 18h WET).

## Especificação Técnica

### Frontend
*   **Página:** `/psicologo/[id]` (Perfil) e `/consultas/nova`
*   **Componentes:**
    *   `CalendarView`: Baseado em `react-day-picker`.
    *   `TimeSlotGrid`: Grid de botões.
    *   `TimezoneAlert`: "Horários exibidos em: América/São_Paulo".
*   **Lógica de Hold:**
    *   Ao clicar, chama `POST /api/appointments/hold`.
    *   Se sucesso, redireciona para Checkout com timer de 15min.

### Backend
*   **Tabela `appointments`:**
    *   `status`: ENUM('PENDING_PAYMENT', 'SCHEDULED', 'COMPLETED', 'CANCELED')
    *   `expires_at`: Timestamp (usado para limpar holds expirados).
*   **Constraint de Exclusão (Postgres):**
    ```sql
    ALTER TABLE appointments
    ADD CONSTRAINT no_overlap
    EXCLUDE USING gist (
      psychologist_id WITH =,
      tstzrange(start_time, end_time) WITH &&
    ) WHERE (status != 'CANCELED');
    ```
*   **Job de Limpeza:** Cron job a cada 5 min deleta `appointments` onde `status = 'PENDING_PAYMENT'` e `expires_at < now()`.
