# US-TECH-02: Arquitetura & Segurança

**Objetivo:** Definir como os sistemas se conectam e como protegemos os dados dos pacientes (HIPAA/LGPD compliance).

## Stack Tecnológico

### Frontend (Client & Server)
*   **Framework:** Next.js 14 (App Router).
*   **Hosting:** Vercel (Edge Network).
*   **State Management:** React Query (Server State) + Zustand (Client State).
*   **Styling:** Tailwind CSS + Shadcn/UI.

### Backend (BaaS)
*   **Supabase:**
    *   **Database:** PostgreSQL.
    *   **Auth:** JWT Management, OAuth (Google/Apple).
    *   **Storage:** Buckets privados para documentos, públicos para avatares.
    *   **Realtime:** WebSockets para Chat e Notificações.

### Vídeo & Comunicação
*   **Daily.co:** API de vídeo chamadas (WebRTC). Salas efêmeras criadas on-demand.
*   **Transacional:** Resend (E-mails).

## Fluxo de Dados

1.  **Request:** Cliente faz request para Next.js API Route ou diretamente ao Supabase (via Client SDK).
2.  **Auth:** Middleware do Next.js valida sessão. RLS do Supabase valida permissões de dados no banco.
3.  **Response:** Dados retornados em JSON.

## Segurança

### 1. Autenticação & Sessão
*   Uso de **HttpOnly Cookies** para armazenar tokens de sessão.
*   Middleware no Next.js (`middleware.ts`) protege rotas `/dashboard/*` e `/admin/*`.

### 2. Proteção de Dados (RLS)
*   NENHUMA query é feita sem RLS ativo.
*   O backend "confia" no token JWT do usuário para filtrar dados automaticamente no nível do banco.

### 3. Vídeo Seguro
*   Salas do Daily.co são criadas com tokens de acesso temporários (`nbf`, `exp`).
*   Apenas participantes com token válido (gerado pelo backend) podem entrar na sala.

### 4. Compliance
*   Logs de acesso a prontuários (Audit Trail).
*   Criptografia em repouso (Supabase default) e em trânsito (TLS 1.3).
