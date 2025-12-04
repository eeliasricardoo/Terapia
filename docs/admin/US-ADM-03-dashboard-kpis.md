# US-ADM-03: Dashboard & KPIs

**Como** administrador,
**Quero** ver métricas principais da plataforma,
**Para** acompanhar o crescimento e saúde do negócio.

## Critérios de Aceite
- [ ] **KPIs em Tempo Real (ou quase):**
    *   Novos Usuários (Hoje/Semana).
    *   Sessões Agendadas vs Realizadas.
    *   Volume Financeiro (GMV).
- [ ] **Gráficos:**
    *   Crescimento de Base (Linha).
    *   Distribuição de Especialidades (Pizza).
- [ ] **Alertas:** Exibir se houver pico de erros 500 ou falhas de pagamento.

## Cenários de Exceção
*   **Performance:** Se o cálculo dos KPIs demorar > 2s, usar dados cacheados ou Materialized Views.

## Especificação Técnica

### Frontend
*   **Página:** `/admin/dashboard`
*   **Lib:** `Recharts`.
*   **Componentes:** `StatCard`, `RevenueChart`, `RecentActivityFeed`.

### Backend
*   **Materialized View `admin_dashboard_stats`:**
    ```sql
    CREATE MATERIALIZED VIEW admin_dashboard_stats AS
    SELECT
      (SELECT count(*) FROM profiles WHERE role='PATIENT') as total_patients,
      (SELECT count(*) FROM psychologist_profiles WHERE status='VERIFIED') as total_psychologists,
      (SELECT sum(amount_gross) FROM transactions WHERE created_at > now() - interval '30 days') as monthly_revenue
    ```
*   **Refresh:** Cron job ou Trigger para dar `REFRESH MATERIALIZED VIEW CONCURRENTLY` a cada hora.
