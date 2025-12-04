# US-ADM-02: Gestão de Usuários

**Como** administrador,
**Quero** visualizar e gerenciar todos os usuários da plataforma,
**Para** prestar suporte ou bloquear contas suspeitas.

## Critérios de Aceite
- [ ] **Listagem Geral:** Tabela com todos os usuários (Pacientes, Psicólogos, Empresas).
- [ ] **Filtros:** Por Role, Status (Ativo/Banido), E-mail.
- [ ] **Ações Críticas:**
    *   **Bloquear (Ban):** Impede login imediato.
    *   **Desbloquear:** Restaura acesso.
    *   **Resetar Senha:** Envia e-mail de recuperação.
- [ ] **Logs:** Registrar quem realizou a ação de bloqueio e o motivo.

## Cenários de Exceção
*   **Auto-Ban:** Impedir que um Admin bloqueie a si mesmo.
*   **Erro de API:** Se falhar no Supabase Auth, não atualizar o status no banco local.

## Especificação Técnica

### Frontend
*   **Página:** `/admin/usuarios`
*   **Componentes:** `UserManagementTable`, `BanUserModal`.
*   **API:** Chamadas para Next.js Server Actions que usam `supabase-admin`.

### Backend
*   **Supabase Admin Client:** Necessário usar `createClient(url, service_role_key)` para ter permissão de gerenciar usuários.
*   **Functions:**
    *   `banUser(userId)`: `auth.admin.updateUserById(id, { ban_duration: '100 years' })`.
    *   `unbanUser(userId)`: `auth.admin.updateUserById(id, { ban_duration: 'none' })`.
*   **Audit Log:** Inserir em tabela `audit_logs` (admin_id, action, target_id, timestamp).
