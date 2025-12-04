# US-ADM-01: Aprovação de Profissionais

**Como** administrador da plataforma,
**Quero** revisar os documentos enviados pelos psicólogos,
**Para** aprovar ou rejeitar seu cadastro na plataforma.

## Critérios de Aceite
- [ ] **Fila de Verificação:** Lista ordenada por data de cadastro (FIFO).
- [ ] **Visualizador de Documentos:** Abrir PDF/Imagem em modal seguro (Signed URL temporária).
- [ ] **Checklist de Validação:** Admin deve marcar checkboxes (CRP Válido? Foto nítida?) antes de aprovar.
- [ ] **Rejeição com Motivo:** Se rejeitar, obrigatório selecionar motivo (ex: "Documento ilegível") e campo de obs.
- [ ] **Aprovação:** Dispara e-mail de boas-vindas e libera acesso à agenda.

## Cenários de Exceção
*   **Documento Corrompido:** Permitir solicitar reenvio sem rejeitar totalmente a conta.
*   **Fraude:** Botão de "Banir CPF/CRP" para impedir novas tentativas.

## Especificação Técnica

### Frontend
*   **Página:** `/admin/verificacao`
*   **Componentes:**
    *   `VerificationQueue`: Lista com status badges.
    *   `DocumentViewer`: Iframe ou Image tag com src seguro.
    *   `ApprovalActions`: Botões Aprovar/Rejeitar com confirmação.

### Backend
*   **Middleware:** Verificar `user.role === 'ADMIN'` em todas as rotas `/api/admin/*`.
*   **Storage Access:**
    *   Gerar Signed URL com validade de 15min para visualização: `supabase.storage.from('secure-docs').createSignedUrl(path, 900)`.
*   **Ação de Aprovação:**
    ```sql
    UPDATE psychologist_profiles
    SET status = 'VERIFIED', verified_at = now()
    WHERE user_id = :id;
    ```
*   **E-mail:** Disparar template `psychologist_approved` ou `psychologist_rejected`.
