# US-PRO-07: Editar Perfil Profissional

**Como** psicólogo,
**Quero** atualizar minha bio, especialidades e preço,
**Para** atrair mais pacientes.

## Critérios de Aceite
- [ ] **Bio e Abordagem:** Editor de texto simples.
- [ ] **Especialidades:** Adicionar/Remover tags.
- [ ] **Preço:** Atualizar valor da sessão (afeta apenas novos agendamentos).
- [ ] **Mídia:** Atualizar vídeo de apresentação.
- [ ] **Dados Bancários:** Link para Stripe Express Dashboard.

## Cenários de Exceção
*   **Preço Abusivo:** Validar valor máximo/mínimo da plataforma.
*   **Alteração Crítica:** Se alterar CRP ou Nome, voltar status para `PENDING_VERIFICATION` (regra de segurança opcional, por enquanto apenas alertar admin).

## Especificação Técnica
*   **Frontend:**
    *   **Página:** `/app/pro/perfil`
    *   **Componentes:** `ProfessionalProfileForm`.
*   **Backend:**
    *   **Update:** `UPDATE psychologist_profiles SET ... WHERE user_id = auth.uid()`.
