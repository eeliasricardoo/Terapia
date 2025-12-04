# US-PRO-08: Integração com Google Agenda

**Como** psicólogo,
**Quero** sincronizar minha agenda da plataforma com meu Google Calendar,
**Para** evitar conflitos com meus compromissos pessoais.

## Critérios de Aceite
- [ ] **Sincronização Bidirecional (2-way sync):**
    *   Plataforma -> Google: Sessões agendadas aparecem no GCal.
    *   Google -> Plataforma: Eventos do GCal bloqueiam horários na plataforma (aparecem como "Ocupado").
- [ ] **Privacidade:** O conteúdo dos eventos pessoais do GCal não deve ser visível na plataforma, apenas o bloqueio de horário.

## Especificação Técnica
*   **Backend:**
    *   **Integração:** Google Calendar API (OAuth2).
    *   **Webhooks:** Google Push Notifications para detectar mudanças no GCal em tempo real.
    *   **Tabela:** `calendar_integrations` (psychologist_id, access_token, refresh_token, sync_token).
