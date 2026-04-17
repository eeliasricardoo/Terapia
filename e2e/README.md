# E2E Tests - Sentirz Platform

## Problema Corrigido

### Strict Mode Violation

**Problema Principal:** Todos os testes estavam falhando com erro de "strict mode violation" devido a 2 botões "Entrar" na página (um no header e outro no formulário).

**Solução:**

- Atualizado todos os seletores de botões para usar `.last()` para pegar especificamente o botão do formulário
- Consolidado código duplicado usando helpers compartilhados em `e2e/helpers/auth.ts`

## Status Atual dos Testes

### ✅ Testes Passando (8)

- Testes de login com credenciais inválidas
- Testes de navegação e UI básica
- Testes de busca e filtros
- QA Simulator flows básicos

### ⏭️ Testes Pulados (5)

Estes testes foram pulados porque requerem:

- Usuários de teste no banco de dados
- Formulários multi-step complexos que têm testes dedicados
- Funcionalidades que podem não estar totalmente implementadas

Testes pulados:

- `Criar conta como Paciente` (ver `registration.spec.ts` para teste completo)
- `Criar conta como Psicólogo` (ver `core-flows.spec.ts` para onboarding)
- `Login com credenciais válidas` (requer usuário de teste)
- `Logout` (requer usuário de teste)
- `Recuperação de senha` (funcionalidade pode não estar implementada)

### ❌ Testes Falhando (43)

A maioria dos testes que falham é devido a:

1. **Falta de usuários de teste no banco de dados**
2. **Elementos de UI que não correspondem aos seletores**
3. **Funcionalidades que dependem de dados mockados**

## Helpers Compartilhados

### `e2e/helpers/auth.ts`

Fornece funções reutilizáveis para:

- `login(page, role, options)` - Login como paciente ou psicólogo
- `logout(page)` - Fazer logout
- `createAccount(page, role, userData)` - Criar nova conta
- `isAuthenticated(page)` - Verificar se está autenticado

**Importante:** Todos os helpers usam `.last()` nos botões de submit para evitar strict mode violations.

### `e2e/helpers/scheduling.ts`

Fornece funções para:

- `selectPsychologist(page, index)` - Selecionar psicólogo da busca
- `bookSession(page, options)` - Agendar sessão
- `cancelSession(page, sessionIndex)` - Cancelar sessão
- `rescheduleSession(page, sessionIndex, newDateIndex, newTimeIndex)` - Reagendar

## Configuração de Testes

### Variáveis de Ambiente

Configure no `.env.local`:

```env
TEST_USER_EMAIL=teste@example.com
TEST_USER_PASSWORD=senha123
TEST_ADMIN_EMAIL=admin@test.com
```

### Executar Testes

```bash
# Todos os testes
npx playwright test

# Teste específico
npx playwright test auth.spec.ts

# Com UI
npx playwright test --ui

# Modo debug
npx playwright test --debug
```

## Correções Aplicadas

### Arquivos Modificados

- ✅ `e2e/helpers/auth.ts` - Corrigido seletor de botões com `.last()`
- ✅ `e2e/auth.spec.ts` - Usando helpers compartilhados
- ✅ `e2e/messaging.spec.ts` - Removida função local de login
- ✅ `e2e/profile.spec.ts` - Usando helpers compartilhados
- ✅ `e2e/payment.spec.ts` - Usando helpers compartilhados
- ✅ `e2e/scheduling.spec.ts` - Usando helpers compartilhados
- ✅ `e2e/admin-qa.spec.ts` - Corrigido seletor de botão
- ✅ `e2e/login.spec.ts` - Corrigido seletor de botão

### Padrão de Correção

**Antes:**

```typescript
const submitButton = page.getByRole('button', { name: /entrar|login/i })
await submitButton.click() // ❌ Strict mode violation!
```

**Depois:**

```typescript
// Usar .last() para pegar o botão do formulário (não o do header)
const submitButton = page.getByRole('button', { name: /entrar|login/i }).last()
await submitButton.click() // ✅ Funciona!
```

## Próximos Passos

### Para QA

1. **Criar usuários de teste** no banco de dados com credenciais conhecidas
2. **Revisar seletores** dos testes falhando e ajustar para corresponder à UI atual
3. **Implementar mocks** para dados que variam (psicólogos, sessões, etc.)
4. **Adicionar fixtures** do Playwright para setup e teardown de dados de teste

### Para Desenvolvimento

1. **Adicionar data-testid** em elementos críticos para facilitar testes
2. **Manter consistência** nos labels de formulários
3. **Evitar múltiplos botões** com o mesmo texto acessível sem contexto claro
