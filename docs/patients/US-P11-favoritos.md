# US-P11: Favoritos (Lista de Desejos)

**Como** paciente,
**Quero** salvar psicólogos que gostei,
**Para** facilitar a busca futura sem precisar agendar agora.

## Critérios de Aceite
- [ ] **Botão Coração:** Em cada card de psicólogo, permitir favoritar/desfavoritar.
- [ ] **Lista de Favoritos:** Página dedicada "Meus Favoritos".
- [ ] **Persistência:** Salvar no banco de dados (não apenas local).

## Especificação Técnica
*   **Frontend:**
    *   **Página:** `/app/patient/favoritos`
    *   **Componente:** `FavoriteButton` (Toggle).
*   **Backend:**
    *   **Tabela:** `favorite_psychologists` (user_id, psychologist_id).
    *   **API:** `POST /api/favorites/toggle`.
