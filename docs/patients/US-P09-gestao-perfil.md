# US-P09: Gestão de Perfil (Paciente)

**Como** paciente,
**Quero** editar meus dados pessoais e configurações,
**Para** manter minhas informações atualizadas.

## Critérios de Aceite
- [ ] **Dados Pessoais:** Editar Nome, Telefone, Data de Nascimento.
- [ ] **Segurança:** Alterar Senha (exige senha atual).
- [ ] **Preferências:** Refazer o Quiz de Preferências (para recalibrar o matching).
- [ ] **Foto:** Upload de avatar.

## Especificação Técnica
*   **Frontend:**
    *   **Página:** `/app/patient/perfil`
    *   **Componentes:** `ProfileForm`, `ChangePasswordForm`, `AvatarUpload`.
*   **Backend:**
    *   **Update:** `UPDATE profiles SET ... WHERE id = auth.uid()`.
    *   **Storage:** Bucket `avatars` (Public).
