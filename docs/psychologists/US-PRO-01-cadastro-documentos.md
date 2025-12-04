# US-PRO-01: Cadastro e Envio de Documentos

**Como** psicólogo,
**Quero** me cadastrar e enviar meus documentos (CRP, Diploma),
**Para** que eu possa ser verificado e começar a atender.

## Critérios de Aceite
- [ ] Formulário Multi-etapa:
    1.  Dados Pessoais (Nome, CPF, Data Nasc).
    2.  Dados Profissionais (CRP, Região, Abordagem).
    3.  Upload de Documentos (PDF/JPG, máx 5MB).
- [ ] Status inicial da conta: `PENDING_VERIFICATION`.
- [ ] Bloquear acesso a funcionalidades de agenda/atendimento enquanto pendente.
- [ ] Exibir banner no dashboard: "Seus documentos estão em análise (Prazo: 48h)".

## Cenários de Exceção
*   **Arquivo Inválido:** Rejeitar arquivos não-imagem/PDF ou > 5MB no frontend e backend.
*   **CRP Inválido:** Validar formato do CRP (XX/XXXXX).
*   **Erro no Upload:** Retry automático em caso de falha de rede.

## Especificação Técnica

### Frontend
*   **Página:** `/cadastro/profissional`
*   **Componentes:**
    *   `StepWizard`: Gerencia os passos.
    *   `FileUploadZone`: Drag & drop com preview e barra de progresso.
*   **Validação:** Zod schema para validar formato do CRP e tamanho do arquivo.

### Backend
*   **Tabela `psychologist_profiles`:**
    *   `status`: ENUM('PENDING_VERIFICATION', 'VERIFIED', 'REJECTED', 'SUSPENDED').
    *   `documents_url`: JSONB (array de paths).
*   **Storage (Supabase):**
    *   Bucket: `secure-docs` (Privado).
    *   **RLS Policy (Insert):** `auth.uid() = owner`.
    *   **RLS Policy (Select):** `auth.uid() = owner OR auth.jwt() ->> 'role' = 'admin'`.
*   **Notificação:** Ao completar cadastro, disparar e-mail para time de Admin (`admin_notification_email`).
