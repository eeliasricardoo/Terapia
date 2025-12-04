# US-P02: Quiz de Preferências (Matching)

**Como** paciente,
**Quero** responder a perguntas sobre minhas necessidades,
**Para** receber recomendações de psicólogos adequados.

## Critérios de Aceite
- [ ] Wizard de 3 passos:
    1.  **Sintomas/Motivo:** Seleção múltipla (Ansiedade, Depressão, Estresse, etc.).
    2.  **Preferências do Terapeuta:** Gênero, Faixa Etária, Abordagem (TCC, Psicanálise).
    3.  **Logística:** Faixa de Preço, Horários preferenciais.
- [ ] Barra de progresso visível.
- [ ] Possibilidade de voltar ao passo anterior.
- [ ] Salvar respostas no perfil do usuário ao finalizar.
- [ ] Algoritmo de matching deve retornar Top 3 psicólogos com base em score de compatibilidade.

## Cenários de Exceção
*   **Abandono:** Se o usuário sair no meio, salvar o estado localmente (localStorage) para retomar depois.
*   **Sem Resultados:** Se nenhum psicólogo der match exato, mostrar "Profissionais que podem te ajudar" (match parcial) ordenados por relevância.

## Especificação Técnica

### Frontend
*   **Página:** `/quiz`
*   **Componentes:**
    *   `QuizWizard`: Container principal com máquina de estados (XState ou simples useState).
    *   `StepIndicator`: Breadcrumbs visuais.
    *   `SelectionCard`: Card selecionável com ícone e texto.
*   **State Management:** `useQuizStore` (Zustand) com persistência em `localStorage`.

### Backend
*   **Tabela `patient_preferences`:**
    *   `user_id`: FK -> profiles.id
    *   `symptoms`: text[]
    *   `budget_min`: integer
    *   `budget_max`: integer
    *   `gender_preference`: text (MALE, FEMALE, NO_PREFERENCE)
*   **Algoritmo de Matching (Postgres Function):**
    ```sql
    CREATE FUNCTION match_psychologists(p_user_id uuid)
    RETURNS TABLE (psychologist_id uuid, score int) AS $$
    -- Lógica de pontuação:
    -- +10 pontos por especialidade compatível
    -- +5 pontos por preço dentro da faixa
    -- +5 pontos por gênero preferido
    -- Ordenar por score DESC
    $$ LANGUAGE sql;
    ```
