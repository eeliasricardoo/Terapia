# US-PRO-06: Chat Assíncrono (Mensagens)

**Como** psicólogo,
**Quero** trocar mensagens de texto com meus pacientes fora do horário da sessão,
**Para** tirar dúvidas rápidas ou combinar reagendamentos.

## Critérios de Aceite
- [ ] **Lista de Conversas:** Ordenada por mensagem mais recente.
- [ ] **Status de Leitura:** Check duplo (Enviado, Lido).
- [ ] **Anexos:** Permitir envio de imagens/PDFs (ex: atividades de casa).
- [ ] **Segurança:** Mensagens criptografadas no banco.
- [ ] **Bloqueio:** Apenas pacientes com vínculo ativo (sessão realizada ou futura) podem iniciar conversa.

## Cenários de Exceção
*   **Paciente Inativo:** Se o paciente não tem sessões há 30 dias, arquivar conversa.
*   **Spam:** Limitar número de mensagens consecutivas sem resposta.

## Especificação Técnica

### Frontend
*   **Página:** `/app/pro/mensagens`
*   **Componentes:** `ChatLayout`, `MessageBubble`, `AttachmentPreview`.
*   **State:** `useChatStore` (SWR/TanStack Query) com updates via WebSocket.

### Backend
*   **Tabelas:**
    *   `conversations` (id, participants_ids[], last_message_at).
    *   `messages` (id, conversation_id, sender_id, content_encrypted, read_at).
*   **Realtime:** Supabase Realtime (`postgres_changes`) para push de novas mensagens.
*   **Storage:** Bucket `chat-attachments` (Privado, acesso apenas aos participantes).
