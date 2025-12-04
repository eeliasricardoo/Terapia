# US-P04: Visualizar Perfil do Psicólogo

**Como** paciente,
**Quero** ver o perfil completo do profissional (Bio, Especialidades, Avaliações),
**Para** decidir se ele é o ideal para mim.

## Critérios de Aceite
- [ ] **Cabeçalho:** Foto de alta qualidade, Nome, CRP, Preço por sessão.
- [ ] **Sobre:** Biografia detalhada e Abordagem Terapêutica.
- [ ] **Especialidades:** Tags clicáveis (ex: Ansiedade, TDAH).
- [ ] **Avaliações:** Nota média (estrelas) e lista de comentários anonimizados.
- [ ] **Mídia:** Vídeo de apresentação de 1-2 minutos (opcional).
- [ ] **SEO:** Página indexável por motores de busca (SSR).

## Cenários de Exceção
*   **Perfil Incompleto:** Se o psicólogo não preencheu a bio, ocultar a seção ou mostrar placeholder.
*   **Sem Avaliações:** Mostrar "Novo na plataforma" ao invés de "0 estrelas".

## Especificação Técnica

### Frontend
*   **Página:** `/psicologo/[id]` (Server Component).
*   **Componentes:**
    *   `ProfileHeader`: Avatar + Info básica.
    *   `BioSection`: Texto expansível ("Ler mais").
    *   `ReviewsList`: Carrossel ou lista paginada.
    *   `VideoPlayer`: Player nativo ou embed YouTube/Vimeo.
*   **SEO:** Metadata dinâmica (`generateMetadata`) com OpenGraph tags.

### Backend
*   **Query:**
    ```sql
    SELECT
      p.*,
      avg(r.rating) as average_rating,
      count(r.id) as review_count
    FROM psychologist_profiles p
    LEFT JOIN reviews r ON p.user_id = r.psychologist_id
    WHERE p.user_id = :id
    GROUP BY p.user_id
    ```
*   **Cache:** Cachear a resposta por 1 hora (ISR ou Cache-Control) para reduzir load no banco.
