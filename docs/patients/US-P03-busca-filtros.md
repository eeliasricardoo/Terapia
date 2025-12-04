# US-P03: Busca e Filtros

**Como** paciente,
**Quero** filtrar psicólogos por preço, especialidade e horários,
**Para** encontrar alguém que caiba no meu orçamento e agenda.

## Critérios de Aceite
- [ ] **Filtros:**
    *   Preço (Slider: Min - Max).
    *   Especialidades (Checkbox: TCC, Psicanálise, etc.).
    *   Gênero (Radio: Homem, Mulher, Sem preferência).
    *   Disponibilidade (Checkbox: Hoje, Amanhã, Esta semana).
- [ ] **Ordenação:** Relevância (Default), Menor Preço, Maior Preço.
- [ ] **Paginação:** Infinite Scroll ou botão "Carregar mais".
- [ ] **Empty State:** Se nenhum resultado for encontrado, mostrar sugestões ou botão "Limpar filtros".

## Cenários de Exceção
*   **Busca Lenta:** Exibir Skeletons enquanto carrega.
*   **Erro na API:** Toast "Não foi possível carregar os profissionais".

## Especificação Técnica

### Frontend
*   **Página:** `/busca`
*   **Componentes:**
    *   `FilterSidebar`: Accordion para filtros móveis.
    *   `PsychologistGrid`: Grid responsivo de cards.
    *   `PsychologistCard`: Mostra foto, nome, preço, próxima data livre.
*   **State:** URL Search Params (`?price_min=100&specialties=tcc`) para permitir compartilhamento de link.

### Backend
*   **Query Otimizada:**
    ```sql
    SELECT * FROM psychologist_profiles
    WHERE
      price BETWEEN :min AND :max
      AND specialties @> :selected_specialties
      AND (:gender IS NULL OR gender = :gender)
    ORDER BY
      CASE WHEN :sort = 'price_asc' THEN price END ASC,
      CASE WHEN :sort = 'price_desc' THEN price END DESC
    LIMIT 20 OFFSET :offset
    ```
*   **Índices:**
    *   `CREATE INDEX idx_psychologists_specialties ON psychologist_profiles USING GIN (specialties);`
    *   `CREATE INDEX idx_psychologists_price ON psychologist_profiles (price);`
