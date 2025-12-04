# US-B2B-01: Cadastro de Empresa

**Como** gestor de RH,
**Quero** cadastrar minha empresa e configurar o faturamento,
**Para** oferecer terapia aos colaboradores.

## Critérios de Aceite
- [ ] **Dados Corporativos:** Razão Social, CNPJ, Endereço, Responsável Financeiro.
- [ ] **Validação CNPJ:** Checar formato e existência (API Receita Federal opcional).
- [ ] **Admin Inicial:** Criar usuário Admin vinculado à empresa.
- [ ] **Termos B2B:** Aceite de contrato de prestação de serviços digital.

## Cenários de Exceção
*   **CNPJ Já Cadastrado:** Impedir duplicidade.
*   **E-mail Corporativo:** Exigir domínio corporativo (não aceitar @gmail, @hotmail) se possível.

## Especificação Técnica

### Frontend
*   **Página:** `/para-empresas/cadastro`
*   **Componentes:** `CompanyForm`, `CnpjInput` (com máscara).
*   **Validação:** Zod schema para CNPJ (algoritmo de dígito verificador).

### Backend
*   **Tabela `companies`:**
    *   `id`: uuid
    *   `cnpj`: text (Unique)
    *   `plan_tier`: ENUM('STARTER', 'ENTERPRISE')
*   **Fluxo de Criação:**
    1.  Criar User (Admin).
    2.  Criar Company.
    3.  Vincular User à Company (`company_admins` table).
