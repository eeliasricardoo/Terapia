# US-P12: Diário de Humor (Mood Tracker)

**Como** paciente,
**Quero** registrar como estou me sentindo diariamente,
**Para** acompanhar minha evolução e compartilhar com meu psicólogo.

## Critérios de Aceite
- [ ] **Check-in Diário:** Selecionar emoji de humor (Feliz, Neutro, Triste, Ansioso, Irritado).
- [ ] **Tags:** Selecionar motivos (Trabalho, Família, Saúde, Sono).
- [ ] **Diário:** Campo de texto opcional para desabafo.
- [ ] **Gráfico:** Visualizar histórico de humor nos últimos 7/30 dias.
- [ ] **Compartilhamento:** Opção de permitir que o psicólogo veja o gráfico no prontuário.

## Especificação Técnica
*   **Frontend:**
    *   **Componentes:** `MoodSelector` (Emojis animados), `MoodChart` (Recharts).
*   **Backend:**
    *   **Tabela:** `mood_entries` (user_id, date, mood_score, tags[], note).
    *   **Privacy:** RLS policy permitindo leitura pelo próprio paciente E pelo psicólogo vinculado (se permitido).
