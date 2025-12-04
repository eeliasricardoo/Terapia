# US-GEN-03: Blog e Conteúdo Educativo

**Como** visitante ou usuário,
**Quero** ler artigos sobre saúde mental,
**Para** me informar e tirar dúvidas.

## Critérios de Aceite
- [ ] **Home do Blog:** Lista de artigos recentes e categorias (Ansiedade, Carreira, Relacionamentos).
- [ ] **Artigo:** Texto rico, imagens, autor (pode ser um psicólogo da plataforma).
- [ ] **CTA:** No final do artigo, sugerir psicólogos especialistas no tema abordado.
- [ ] **SEO:** Otimização total para motores de busca (Schema.org).

## Especificação Técnica
*   **Frontend:**
    *   **Páginas:** `/blog`, `/blog/[slug]`.
    *   **CMS:** Usar um Headless CMS (Contentful, Sanity ou Supabase com tabela `posts`).
    *   **SSG/ISR:** Next.js Static Generation para performance máxima.
