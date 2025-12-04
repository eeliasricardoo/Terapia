# US-ADM-04: Moderação de Avaliações

**Como** administrador,
**Quero** moderar as avaliações feitas pelos pacientes,
**Para** evitar conteúdo ofensivo ou impróprio.

## Critérios de Aceite
- [ ] **Filtro de Palavras:** Bloqueio automático de palavrões/ofensas no envio.
- [ ] **Denúncia:** Psicólogo pode denunciar uma avaliação recebida.
- [ ] **Painel de Moderação:** Admin vê denúncias e pode ocultar/remover o comentário.
- [ ] **Direito de Resposta:** Psicólogo pode responder à avaliação (resposta pública).

## Especificação Técnica
*   **Backend:**
    *   **Tabela `reviews`:** (id, content, rating, is_hidden, report_reason).
    *   **API:** `POST /api/reviews/[id]/report`.
    *   **Admin Action:** `PATCH /api/admin/reviews/[id]` (set is_hidden = true).
