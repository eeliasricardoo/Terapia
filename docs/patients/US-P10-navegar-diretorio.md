# US-P10: Navegar pelo Diretório

**Como** paciente,
**Quero** navegar por uma lista de psicólogos disponíveis,
**Para** conhecer as opções antes de filtrar ou buscar.

## Critérios de Aceite
- [ ] **Listagem Geral:** Exibir profissionais em formato de grid ou lista.
- [ ] **Card do Profissional (Resumo):**
    *   Foto, Nome, CRP.
    *   Preço (A partir de R$...).
    *   Próximo horário disponível (ex: "Hoje 14:00").
    *   Tags de Especialidade (máx 3).
    *   Nota média (Estrelas).
- [ ] **Paginação:** Carregar 20 por vez (Infinite Scroll).
- [ ] **Destaques:** Seção de "Recomendados" ou "Novos na plataforma" no topo.

## Especificação Técnica
*   **Frontend:**
    *   **Página:** `/busca` (Estado inicial sem filtros).
    *   **Componentes:** `PsychologistList`, `PsychologistCardMinimal`.
*   **Backend:**
    *   **Query:** `SELECT * FROM psychologist_profiles WHERE status = 'VERIFIED' ORDER BY random() LIMIT 20`. (Randomizar para dar chance igual a todos no início).
