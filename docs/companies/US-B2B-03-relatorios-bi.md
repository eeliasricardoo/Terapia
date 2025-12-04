# US-B2B-03: Relatórios e BI

**Como** gestor de RH,
**Quero** visualizar dados de utilização do benefício de forma anonimizada,
**Para** medir o ROI e a saúde da equipe.

## Critérios de Aceite
- [ ] **KPIs Principais:** Taxa de Adesão (%), Total de Sessões Realizadas, Nota Média de Satisfação.
- [ ] **Gráficos:** Evolução mensal de sessões.
- [ ] **Privacidade (LGPD):**
    *   NUNCA mostrar nomes de pacientes.
    *   NUNCA mostrar diagnósticos individuais.
    *   Se um grupo (ex: departamento) tiver < 5 pessoas, não mostrar dados detalhados para evitar re-identificação.

## Cenários de Exceção
*   **Dados Insuficientes:** Mostrar "Ainda não há dados suficientes para gerar relatórios" no início do contrato.

## Especificação Técnica

### Frontend
*   **Página:** `/app/business/relatorios`
*   **Lib:** `Recharts` ou `Tremor`.
*   **Componentes:** `AdoptionChart`, `SatisfactionGauge`.

### Backend
*   **View `company_analytics_view`:**
    ```sql
    SELECT
      c.id as company_id,
      count(distinct a.patient_id) as active_users,
      count(a.id) as total_sessions,
      avg(r.rating) as avg_rating
    FROM companies c
    JOIN employee_benefits eb ON c.id = eb.company_id
    JOIN appointments a ON eb.user_id = a.patient_id
    LEFT JOIN reviews r ON a.id = r.appointment_id
    GROUP BY c.id
    ```
*   **API:** `/api/business/stats` (Cacheada por 24h).
