# US-SYS-01: Sistema de Notificações

**Como** usuário da plataforma,
**Quero** receber lembretes das minhas sessões e avisos importantes,
**Para** não esquecer meus compromissos.

## Critérios de Aceite
- [ ] **Canais:** E-mail (Obrigatório para transacional), WhatsApp (Opcional), Push (Web/PWA).
- [ ] **Gatilhos:**
    *   Confirmação de Agendamento (Imediato).
    *   Lembrete de Sessão (24h antes e 1h antes).
    *   Aviso "Sessão começando" (10min antes).
    *   Novas mensagens no chat.
- [ ] **Preferências:** Usuário pode ativar/desativar canais não-críticos no perfil.

## Especificação Técnica
*   **Backend:**
    *   **Provider:** OneSignal (Push), Resend/SendGrid (Email), Twilio/Meta API (WhatsApp).
    *   **Queue:** Utilizar filas (Redis/BullMQ ou Supabase Edge Functions com cron) para processar envios assíncronos.
    *   **Tabela `notification_preferences`:** (user_id, email_enabled, push_enabled, whatsapp_enabled).
