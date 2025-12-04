# US-GEN-01: Protocolo de Crise e Emergência

**Como** usuário em sofrimento agudo,
**Quero** acessar ajuda imediata,
**Para** garantir minha segurança em momentos de crise.

## Critérios de Aceite
- [ ] **Botão de Emergência:** Visível em todas as páginas (Header ou Footer), destacado em vermelho.
- [ ] **Conteúdo:** Ao clicar, exibir telefones úteis (CVV 188, SAMU 192) e hospitais próximos (opcional via geolocalização).
- [ ] **Durante a Sessão:** Se o psicólogo identificar risco, ter botão para acionar protocolo (exibir contatos de emergência do paciente cadastrados previamente).

## Especificação Técnica
*   **Frontend:**
    *   **Componente:** `CrisisButton` (Floating Action Button ou item de menu destacado).
    *   **Modal:** `EmergencyContactsModal`.
*   **Dados:** Campo `emergency_contact` (Nome, Telefone) no perfil do paciente.
