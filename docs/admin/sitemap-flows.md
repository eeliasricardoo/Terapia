# Sitemap & Fluxos: Admin

## Sitemap do Painel Administrativo (`/admin`)

*   `/admin/dashboard` **Visão Geral** (KPIs da plataforma)
*   `/admin/verificacao` **Fila de Aprovação** (Psicólogos pendentes)
*   `/admin/usuarios` **Gestão de Usuários** (Bloquear/Desbloquear)

## Fluxos de Usuário

### 1. Fluxo de Aprovação
```mermaid
graph TD
    A[Admin acessa Fila] --> B[Seleciona Psicólogo Pendente]
    B --> C[Visualiza Documentos]
    C --> D{Documentos Válidos?}
    D -- Sim --> E[Aprovar]
    E --> F[Status: VERIFIED]
    E --> G[Email: Boas-vindas]
    D -- Não --> H[Rejeitar]
    H --> I[Status: REJECTED]
    H --> J[Email: Motivo da rejeição]
```
