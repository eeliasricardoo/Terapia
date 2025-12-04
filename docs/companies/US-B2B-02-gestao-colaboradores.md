# US-B2B-02: Gestão de Colaboradores

**Como** gestor de RH,
**Quero** adicionar e remover funcionários do benefício,
**Para** controlar o acesso.

## Critérios de Aceite
- [ ] **Adicionar Individual:** Formulário simples (Nome, E-mail).
- [ ] **Upload em Massa (CSV):** Importar lista de funcionários. Validação de formato antes do envio.
- [ ] **Gestão de Status:**
    *   `Convite Enviado`: E-mail disparado, usuário ainda não cadastrou.
    *   `Ativo`: Usuário já criou conta e vinculou.
    *   `Desativado`: Acesso revogado pelo RH.
- [ ] **Remoção:** Ao remover, o subsídio é cortado imediatamente para novas sessões.

## Cenários de Exceção
*   **CSV Inválido:** Mostrar linhas com erro (ex: e-mail mal formatado) e permitir corrigir ou ignorar.
*   **Usuário Já Existente:** Se o e-mail já tem conta na plataforma, apenas vincular o benefício e notificar o usuário ("Sua empresa te deu um benefício!").

## Especificação Técnica

### Frontend
*   **Página:** `/app/business/colaboradores`
*   **Componentes:**
    *   `EmployeeTable`: TanStack Table com filtros e ações.
    *   `CsvUploader`: Dropzone que faz parse local (PapaParse) e valida antes de enviar para API.
*   **Ação:** `inviteEmployees(list)` -> Batch insert.

### Backend
*   **Tabela `employee_benefits`:**
    *   `company_id`: uuid
    *   `email`: text (Unique per company)
    *   `status`: ENUM('INVITED', 'ACTIVE', 'REVOKED')
    *   `subsidy_percentage`: int (Default 100%)
*   **Fluxo de Convite:**
    1.  Insere na tabela.
    2.  Gera Magic Link (`/cadastro?token=xyz&company=123`).
    3.  Envia e-mail via Resend/SendGrid.
*   **Trigger:** Ao criar usuário (`auth.users`), verificar se e-mail existe em `employee_benefits` e atualizar status para `ACTIVE`.
