# QA Documentation — Terapia Platform

\*\*

# Auth:

Paciente:
paciente.carlos@test.com
Senha:
Password123!

Psicólogo:
psicologo@test.com
Senha:
123456789

> **Versão:** 1.0
> **Data:** 2026-03-26
> **Autor:** QA Senior
> **Stack:** Next.js 14 · Supabase Auth · Prisma ORM · Stripe · Daily.co

---

## Índice

1. [Visão Geral da Estratégia de Testes](#1-visão-geral-da-estratégia-de-testes)
2. [Pirâmide de Testes](#2-pirâmide-de-testes)
3. [Infraestrutura de Testes](#3-infraestrutura-de-testes)
4. [Testes Unitários — Cenários Cobertos](#4-testes-unitários--cenários-cobertos)
5. [Testes de Integração](#5-testes-de-integração)
6. [Testes E2E — Cenários Cobertos](#6-testes-e2e--cenários-cobertos)
7. [Mapeamento de Cenários por Módulo](#7-mapeamento-de-cenários-por-módulo)
8. [Análise de Cobertura e Gaps](#8-análise-de-cobertura-e-gaps)
9. [Plano de Testes Prioritários a Implementar](#9-plano-de-testes-prioritários-a-implementar)
10. [Como Executar os Testes](#10-como-executar-os-testes)
11. [Dados de Teste](#11-dados-de-teste)
12. [Critérios de Aceite por Feature](#12-critérios-de-aceite-por-feature)

---

## 1. Visão Geral da Estratégia de Testes

### Objetivo

Garantir a confiabilidade, segurança e usabilidade da plataforma Terapia em todos os fluxos críticos: autenticação, agendamento, pagamento, sessões de vídeo, prontuário clínico e gestão administrativa.

### Perfis de Usuário Testados

| Perfil         | Responsabilidade                                 | Risco                                       |
| -------------- | ------------------------------------------------ | ------------------------------------------- |
| **Paciente**   | Busca, agendamento e pagamento de sessões        | Alto (envolve dados pessoais e financeiros) |
| **Psicólogo**  | Gestão de agenda, pacientes e financeiro         | Alto (dados clínicos sensíveis)             |
| **Empresa/RH** | Gestão de benefícios de colaboradores            | Médio                                       |
| **Admin**      | Aprovação de profissionais, gestão da plataforma | Alto (controle total do sistema)            |

### Princípios

- **Fail Fast:** Testes unitários rápidos cobrem regras de negócio críticas (conflito de agenda, validação de pagamento)
- **Isolamento:** Mocks completos de Supabase, Prisma, Stripe nas camadas unitárias
- **Realismo:** E2E tests rodam contra ambiente real com usuários de teste persistidos
- **Segurança:** Testes específicos para XSS, SQL injection, UUID spoofing e rate limiting

---

## 2. Pirâmide de Testes

```
         /\
        /  \
       / E2E \          18 spec files (Playwright)
      /--------\        Fluxos completos de usuário
     / Integração \     Webhook Stripe · Video Token API
    /--------------\    Supabase connection
   / Unitários      \   17 test files (Jest)
  /------------------\  Actions · Utils · Security
```

**Distribuição atual:**

| Tipo      | Arquivos    | Foco                                  |
| --------- | ----------- | ------------------------------------- |
| Unitários | 17          | Actions, utils, validações, segurança |
| E2E       | 18          | Jornadas completas de usuário         |
| Storybook | Configurado | Componentes visuais                   |

---

## 3. Infraestrutura de Testes

### Framework Unitário — Jest

- **Config:** `jest.config.ts`
- **Transform:** ts-jest (TypeScript nativo)
- **Setup:** `src/__tests__/setup.ts`
- **Aliases:** `@/` mapeado para `src/`
- **Coverage:** `npm run test:coverage`

**Mocks globais configurados:**

- `@/lib/utils/logger` — evita output de log nos testes
- `@/lib/prisma` — banco isolado por teste
- `@/lib/supabase/server` — auth mockada
- `@upstash/ratelimit` e `@upstash/redis` — rate limit desativado
- `next/cache` — revalidatePath/revalidateTag sem efeito

### Framework E2E — Playwright

- **Config:** `playwright.config.ts`
- **Browser:** Chromium (Desktop Chrome)
- **Workers:** 2 local / 1 CI
- **Retries:** 0 local / 2 CI
- **Base URL:** `http://localhost:3000`
- **Trace:** on-first-retry
- **Global Setup:** `e2e/global-setup.ts`

**Storage State (gerado pelo global-setup):**

- `e2e/fixtures/patient-auth.json` — sessão persistida do paciente
- `e2e/fixtures/psychologist-auth.json` — sessão persistida do psicólogo

**Fixtures de auth:**

- `patientTest` — `e2e/fixtures/auth.ts`
- `psychologistTest` — `e2e/fixtures/auth.ts`

---

## 4. Testes Unitários — Cenários Cobertos

### 4.1 `appointments-utils.test.ts` — Detecção de Conflitos de Agenda

**Regra de negócio:** Psicólogo e paciente não podem ter duas sessões simultâneas.

| ID       | Cenário                                                       | Resultado Esperado         | Status     |
| -------- | ------------------------------------------------------------- | -------------------------- | ---------- |
| U-APP-01 | Sem agendamentos existentes                                   | Sem conflito               | ✅ Coberto |
| U-APP-02 | Sessões adjacentes (fim = início da próxima)                  | Sem conflito               | ✅ Coberto |
| U-APP-03 | Nova sessão termina exatamente quando existente começa        | Sem conflito               | ✅ Coberto |
| U-APP-04 | Nova sessão inicia no mesmo horário (psicólogo)               | Conflito type=psychologist | ✅ Coberto |
| U-APP-05 | Nova sessão inicia durante sessão existente (psicólogo)       | Conflito type=psychologist | ✅ Coberto |
| U-APP-06 | Nova sessão termina durante sessão existente (psicólogo)      | Conflito type=psychologist | ✅ Coberto |
| U-APP-07 | Nova sessão engloba completamente a existente (psicólogo)     | Conflito type=psychologist | ✅ Coberto |
| U-APP-08 | Paciente já tem sessão no mesmo horário com outro psicólogo   | Conflito type=patient      | ✅ Coberto |
| U-APP-09 | Sessão do paciente com sobreposição parcial                   | Conflito type=patient      | ✅ Coberto |
| U-APP-10 | Status CANCELED não bloqueia novo agendamento                 | Sem conflito               | ✅ Coberto |
| U-APP-11 | excludeAppointmentId ignora a própria sessão no reagendamento | Sem conflito               | ✅ Coberto |
| U-APP-12 | excludeAppointmentId detecta conflito com OUTROS agendamentos | Conflito retornado         | ✅ Coberto |
| U-APP-13 | Sem patientId — verifica apenas psicólogo                     | OR com 1 condição          | ✅ Coberto |
| U-APP-14 | Status PENDING_PAYMENT bloqueia novo agendamento              | Conflito detectado         | ✅ Coberto |
| U-APP-15 | Erro de banco relançado para caller                           | throws Error               | ✅ Coberto |
| U-APP-16 | Janela de query ±6h ao redor do slot                          | Datas corretas no Prisma   | ✅ Coberto |

### 4.2 `stripe.test.ts` — Criação de Checkout

| ID       | Cenário                                                | Resultado Esperado                      | Status     |
| -------- | ------------------------------------------------------ | --------------------------------------- | ---------- |
| U-STR-01 | Usuário não autenticado                                | `{ error: 'Não autenticado' }`          | ✅ Coberto |
| U-STR-02 | Psicólogo não encontrado no banco                      | `{ error: 'Psicólogo não encontrado' }` | ✅ Coberto |
| U-STR-03 | Preço zero (100% desconto) — cria consulta diretamente | `{ url: '/dashboard?payment=success' }` | ✅ Coberto |
| U-STR-04 | Preço correto em centavos (R$150 = 15000)              | Stripe chamado com amount correto       | ✅ Coberto |
| U-STR-05 | URLs de sucesso e cancelamento corretas                | success_url e cancel_url validados      | ✅ Coberto |
| U-STR-06 | Stripe API fora do ar — erro tratado graciosamente     | `{ error: 'Stripe API down' }`          | ✅ Coberto |

### 4.3 `security.test.ts` — Utilitários de Segurança

| ID       | Cenário                                                    | Resultado Esperado             | Status     |
| -------- | ---------------------------------------------------------- | ------------------------------ | ---------- |
| U-SEC-01 | sanitizeText remove todas as tags HTML                     | Texto limpo sem tags           | ✅ Coberto |
| U-SEC-02 | sanitizeHtml preserva tags seguras, remove `<script>`      | Tags básicas mantidas          | ✅ Coberto |
| U-SEC-03 | sanitizeText com null/undefined retorna string vazia       | `''`                           | ✅ Coberto |
| U-SEC-04 | Encrypt → Decrypt retorna texto original                   | Round-trip correto             | ✅ Coberto |
| U-SEC-05 | Dados não criptografados em decryptData são retornados     | Texto original                 | ✅ Coberto |
| U-SEC-06 | Dados inválidos em decryptData retornam mensagem de erro   | `🔒 [Dados Criptografados...]` | ✅ Coberto |
| U-SEC-07 | encryptData/decryptData com string vazia                   | `''`                           | ✅ Coberto |
| U-SEC-08 | isValidUUID aceita UUIDs v1, v4, uppercase                 | `true`                         | ✅ Coberto |
| U-SEC-09 | isValidUUID rejeita string vazia, 'not-a-uuid', sem dashes | `false`                        | ✅ Coberto |
| U-SEC-10 | isValidUUID rejeita SQL injection                          | `false`                        | ✅ Coberto |
| U-SEC-11 | isValidUUID rejeita XSS payload                            | `false`                        | ✅ Coberto |
| U-SEC-12 | assertValidUUID retorna o UUID se válido                   | UUID                           | ✅ Coberto |
| U-SEC-13 | assertValidUUID lança exceção para UUID inválido           | throws 'ID inválido'           | ✅ Coberto |

### 4.4 `availability.test.ts` — Disponibilidade de Horários

| ID      | Cenário                                                  | Resultado Esperado                                     | Status     |
| ------- | -------------------------------------------------------- | ------------------------------------------------------ | ---------- |
| U-AV-01 | Salvar grade semanal corretamente (seg 09:00, sex 14:00) | weekly_schedule formatado                              | ✅ Coberto |
| U-AV-02 | Salvar disponibilidade sem autenticação                  | `{ success: false, error: 'Usuário não autenticado' }` | ✅ Coberto |
| U-AV-03 | Buscar disponibilidade com perfil não encontrado         | `null`                                                 | ✅ Coberto |
| U-AV-04 | Buscar disponibilidade retorna timezone e overrides      | Dados completos                                        | ✅ Coberto |

### 4.5 Outros Arquivos com Cobertura Parcial

| Arquivo                       | Escopo Estimado                                  |
| ----------------------------- | ------------------------------------------------ |
| `admin.test.ts`               | Ações de aprovação/rejeição de psicólogos        |
| `appointments-utils.test.ts`  | Conflito de agenda (completo, 16 casos)          |
| `dashboard.test.ts`           | Carregamento de dados do dashboard               |
| `date-utils.test.ts`          | Utilitários de data/hora com timezone            |
| `diary.test.ts`               | Criação e leitura de entradas do diário de humor |
| `evolutions.test.ts`          | Notas de evolução clínica                        |
| `financial.test.ts`           | Cálculos financeiros e relatórios                |
| `messages.test.ts`            | Sistema de mensagens                             |
| `onboarding.test.ts`          | Fluxo de cadastro multi-step                     |
| `patients.test.ts`            | Dados e listagem de pacientes                    |
| `profile-actions.test.ts`     | Atualização de perfil                            |
| `profile.test.ts`             | Componente de perfil                             |
| `sessions.test.ts`            | Gerenciamento de sessões                         |
| `supabase-connection.test.ts` | Conexão com banco de dados                       |

---

## 5. Testes de Integração

### 5.1 API: `/api/video/token` (POST)

**Módulo:** `src/app/api/video/token/route.ts`

| ID       | Cenário                                  | Resultado Esperado                                                 |
| -------- | ---------------------------------------- | ------------------------------------------------------------------ |
| I-VID-01 | Token gerado com appointmentId válido    | `{ token, roomUrl, scheduledAt, durationMinutes, isPsychologist }` |
| I-VID-02 | appointmentId inválido (não-UUID)        | 400 Bad Request                                                    |
| I-VID-03 | Usuário não autenticado                  | 401 Unauthorized                                                   |
| I-VID-04 | Usuário não é participante da sessão     | 403 Forbidden                                                      |
| I-VID-05 | Acesso fora da janela de tempo da sessão | 403 com mensagem específica                                        |
| I-VID-06 | Rate limit excedido                      | 429 Too Many Requests                                              |
| I-VID-07 | Daily.co API indisponível                | 500 com erro tratado                                               |

### 5.2 API: `/api/webhooks/stripe` (POST)

**Módulo:** `src/app/api/webhooks/stripe/route.ts`

| ID      | Cenário                                                         | Resultado Esperado                        |
| ------- | --------------------------------------------------------------- | ----------------------------------------- |
| I-WH-01 | `checkout.session.completed` — cria consulta com dados corretos | Appointment criado, notificações enviadas |
| I-WH-02 | `checkout.session.completed` — conflito de horário detectado    | 409, appointment não criado               |
| I-WH-03 | `checkout.session.completed` — idempotência (evento duplicado)  | 200, appointment não duplicado            |
| I-WH-04 | `account.updated` — atualiza status onboarding do psicólogo     | `is_stripe_onboarded = true`              |
| I-WH-05 | Assinatura inválida do webhook                                  | 400 Bad Request                           |
| I-WH-06 | Evento desconhecido                                             | 200 ignorado                              |

### 5.3 API: `/api/internal/send-email` (POST)

| ID         | Cenário                                  | Resultado Esperado |
| ---------- | ---------------------------------------- | ------------------ |
| I-EMAIL-01 | Email de confirmação de consulta enviado | 200, email na fila |
| I-EMAIL-02 | Email de reminder (24h antes) enviado    | 200, email na fila |
| I-EMAIL-03 | Email de reset de senha enviado          | 200, email na fila |
| I-EMAIL-04 | Request sem autorização                  | 401 Unauthorized   |

---

## 6. Testes E2E — Cenários Cobertos

### 6.1 `auth.spec.ts` — Autenticação

| ID        | Cenário                                               | Status     |
| --------- | ----------------------------------------------------- | ---------- |
| E-AUTH-01 | Página de login do paciente carrega todos os campos   | ✅ Coberto |
| E-AUTH-02 | Validação de campos obrigatórios no login             | ✅ Coberto |
| E-AUTH-03 | Login com credenciais inválidas — permanece na página | ✅ Coberto |
| E-AUTH-04 | Página de login do profissional carrega               | ✅ Coberto |
| E-AUTH-05 | Cadastro paciente Passo 1 — campos visíveis           | ✅ Coberto |
| E-AUTH-06 | Validação de email inválido no cadastro               | ✅ Coberto |
| E-AUTH-07 | Navegação do cadastro Passo 1 → Passo 2 (CPF)         | ✅ Coberto |
| E-AUTH-08 | Página de recuperação de senha carrega                | ✅ Coberto |
| E-AUTH-09 | Submissão de recuperação de senha                     | ✅ Coberto |
| E-AUTH-10 | Navegação da home para login                          | ✅ Coberto |
| E-AUTH-11 | Link entre login e cadastro                           | ✅ Coberto |

### 6.2 `payment.spec.ts` — Pagamento

| ID       | Cenário                                               | Status     |
| -------- | ----------------------------------------------------- | ---------- |
| E-PAY-01 | Visualizar resumo de pagamento na página do psicólogo | ✅ Coberto |
| E-PAY-02 | Fluxo de sessão avulsa até checkout                   | ✅ Coberto |
| E-PAY-03 | Fluxo de pacote mensal até checkout                   | ✅ Coberto |
| E-PAY-04 | Preencher dados de cartão Stripe (modo teste)         | ✅ Coberto |
| E-PAY-05 | Validação de campos obrigatórios de pagamento         | ✅ Coberto |
| E-PAY-06 | Cancelar processo de pagamento                        | ✅ Coberto |
| E-PAY-07 | Visualizar histórico de pagamentos                    | ✅ Coberto |
| E-PAY-08 | Baixar recibo de pagamento                            | ✅ Coberto |
| E-PAY-09 | Aplicar cupom de desconto                             | ✅ Coberto |
| E-PAY-10 | Método de pagamento Pix (se disponível)               | ✅ Coberto |

### 6.3 `scheduling.spec.ts` — Agendamento

| ID       | Cenário                                                                   | Status     |
| -------- | ------------------------------------------------------------------------- | ---------- |
| E-SCH-01 | Agendar nova sessão — fluxo completo (login → busca → calendar → confirm) | ✅ Coberto |
| E-SCH-02 | Verificar disponibilidade de horários                                     | ✅ Coberto |
| E-SCH-03 | Visualizar agendamentos futuros no dashboard                              | ✅ Coberto |
| E-SCH-04 | Reagendar sessão existente                                                | ✅ Coberto |
| E-SCH-05 | Cancelar sessão                                                           | ✅ Coberto |
| E-SCH-06 | Validar aviso de política de cancelamento                                 | ✅ Coberto |
| E-SCH-07 | Selecionar tipo de sessão (Avulsa vs Pacote)                              | ✅ Coberto |

### 6.4 `patient-journey.spec.ts` — Jornada Completa do Paciente

| ID      | Cenário                                                        | Status     |
| ------- | -------------------------------------------------------------- | ---------- |
| E-PJ-01 | Home → Busca → Filtro por especialidade → Ver perfil psicólogo | ✅ Coberto |
| E-PJ-02 | Abertura do modal de login a partir do perfil do psicólogo     | ✅ Coberto |

### 6.5 `home.spec.ts` — Landing Page

| ID        | Cenário                                  | Status     |
| --------- | ---------------------------------------- | ---------- |
| E-HOME-01 | Hero section visível com heading correto | ✅ Coberto |
| E-HOME-02 | CTA principal navega para busca/cadastro | ✅ Coberto |
| E-HOME-03 | Seções de features carregam              | ✅ Coberto |
| E-HOME-04 | FAQ funciona (accordion)                 | ✅ Coberto |
| E-HOME-05 | Footer com links de privacidade e termos | ✅ Coberto |

### 6.6 `busca.spec.ts` — Busca de Psicólogos

| ID       | Cenário                                             | Status     |
| -------- | --------------------------------------------------- | ---------- |
| E-BUS-01 | Página de busca carrega com heading                 | ✅ Coberto |
| E-BUS-02 | Filtros (especialidade, preço, plano) funcionam     | ✅ Coberto |
| E-BUS-03 | Cards de psicólogos exibidos                        | ✅ Coberto |
| E-BUS-04 | Clique no card navega para perfil `/psicologo/[id]` | ✅ Coberto |

### 6.7 `dashboard.spec.ts` — Dashboard

| ID        | Cenário                                       | Status     |
| --------- | --------------------------------------------- | ---------- |
| E-DASH-01 | Sidebar carrega com links corretos (paciente) | ✅ Coberto |
| E-DASH-02 | Navegação entre seções do dashboard           | ✅ Coberto |
| E-DASH-03 | Dashboard do psicólogo carrega                | ✅ Coberto |

### 6.8 `messaging.spec.ts` — Mensagens

| ID       | Cenário                                      | Status     |
| -------- | -------------------------------------------- | ---------- |
| E-MSG-01 | Tela de mensagens carrega                    | ✅ Coberto |
| E-MSG-02 | Lista de conversas exibida (ou estado vazio) | ✅ Coberto |
| E-MSG-03 | Envio de mensagem para psicólogo             | ✅ Coberto |

### 6.9 `profile.spec.ts` — Perfil

| ID        | Cenário                                       | Status     |
| --------- | --------------------------------------------- | ---------- |
| E-PROF-01 | Página de perfil carrega com dados do usuário | ✅ Coberto |
| E-PROF-02 | Editar nome e salvar                          | ✅ Coberto |
| E-PROF-03 | Upload de avatar                              | ✅ Coberto |

### 6.10 `perfil-planos.spec.ts` — Perfil e Planos (Psicólogo)

| ID      | Cenário                                      | Status     |
| ------- | -------------------------------------------- | ---------- |
| E-PP-01 | Aba de planos visível no perfil do psicólogo | ✅ Coberto |
| E-PP-02 | Criar novo plano mensal                      | ✅ Coberto |
| E-PP-03 | Editar plano existente                       | ✅ Coberto |
| E-PP-04 | Desativar plano                              | ✅ Coberto |

### 6.11 `pricing-plans-coupons.spec.ts` — Cupons e Preços

| ID       | Cenário                                    | Status     |
| -------- | ------------------------------------------ | ---------- |
| E-CUP-01 | Criar cupom de desconto percentual         | ✅ Coberto |
| E-CUP-02 | Criar cupom de valor fixo                  | ✅ Coberto |
| E-CUP-03 | Desativar cupom                            | ✅ Coberto |
| E-CUP-04 | Plano mensal com switch ativado/desativado | ✅ Coberto |

### 6.12 `sessoes.spec.ts` — Sessões

| ID       | Cenário                                               | Status     |
| -------- | ----------------------------------------------------- | ---------- |
| E-SES-01 | Lista de sessões carrega no dashboard                 | ✅ Coberto |
| E-SES-02 | Detalhes da sessão exibidos                           | ✅ Coberto |
| E-SES-03 | Botão de entrar na sala habilitado no momento correto | ✅ Coberto |

### 6.13 `admin-qa.spec.ts` — Admin

| ID       | Cenário                         | Status     |
| -------- | ------------------------------- | ---------- |
| E-ADM-01 | Painel de aprovações carrega    | ✅ Coberto |
| E-ADM-02 | Aprovar psicólogo pendente      | ✅ Coberto |
| E-ADM-03 | Rejeitar psicólogo com motivo   | ✅ Coberto |
| E-ADM-04 | Lista de psicólogos cadastrados | ✅ Coberto |

### 6.14 `registration.spec.ts` — Cadastro

| ID       | Cenário                                            | Status     |
| -------- | -------------------------------------------------- | ---------- |
| E-REG-01 | Cadastro de paciente — todos os passos             | ✅ Coberto |
| E-REG-02 | Cadastro de psicólogo — dados profissionais        | ✅ Coberto |
| E-REG-03 | Cadastro de psicólogo — disponibilidade            | ✅ Coberto |
| E-REG-04 | Cadastro de psicólogo — pagamento (Stripe Connect) | ✅ Coberto |
| E-REG-05 | Validação de CRP inválido                          | ✅ Coberto |
| E-REG-06 | Validação de CPF inválido                          | ✅ Coberto |

### 6.15 `core-flows.spec.ts` — Fluxos Críticos

| ID      | Cenário                                    | Status     |
| ------- | ------------------------------------------ | ---------- |
| E-CF-01 | Paciente faz login e acessa dashboard      | ✅ Coberto |
| E-CF-02 | Psicólogo faz login e acessa agenda        | ✅ Coberto |
| E-CF-03 | Redirecionamento após email não confirmado | ✅ Coberto |

---

## 7. Mapeamento de Cenários por Módulo

### Módulo: Autenticação e Sessão

```
FLUXO: Cadastro → Confirmação de Email → Login → Dashboard

Paciente:
  [COBERTO] Cadastro multi-step (nome, email, CPF, senha, CEP)
  [COBERTO] Validação de CPF (utilitário cpf.ts)
  [COBERTO] Email de confirmação (redirecionamento)
  [COBERTO] Login com credenciais válidas
  [COBERTO] Login com credenciais inválidas
  [COBERTO] Recuperação de senha
  [LACUNA]  Login social (Google/Apple, se habilitado)
  [LACUNA]  Sessão expirada → redirect para login
  [LACUNA]  Tentativa de acesso a /dashboard sem autenticação

Psicólogo:
  [COBERTO] Cadastro multi-step (dados, CRP, disponibilidade, pagamento)
  [COBERTO] Validação de CRP (utilitário crp.ts)
  [COBERTO] Stripe Connect onboarding
  [LACUNA]  Pendente de aprovação → não pode acessar dashboard completo
  [LACUNA]  Psicólogo suspenso → acesso bloqueado
```

### Módulo: Busca e Descoberta

```
FLUXO: /busca → Filtros → Card do Psicólogo → /psicologo/[id]

  [COBERTO] Listagem de psicólogos verificados
  [COBERTO] Filtro por especialidade
  [COBERTO] Visualização de preço e bio
  [COBERTO] Navegação para perfil do psicólogo
  [LACUNA]  Filtro por plano de saúde
  [LACUNA]  Filtro por faixa de preço
  [LACUNA]  Busca com 0 resultados (estado vazio)
  [LACUNA]  Paginação de resultados
  [LACUNA]  Psicólogos não verificados não aparecem na busca
```

### Módulo: Agendamento

```
FLUXO: Perfil Psicólogo → Selecionar Data/Hora → Tipo (Avulsa/Pacote) → Checkout

  [COBERTO] Calendário de disponibilidade exibido
  [COBERTO] Selecionar data e horário disponíveis
  [COBERTO] Seleção de sessão avulsa vs pacote mensal
  [COBERTO] Detecção de conflito (psicólogo) — UNITÁRIO
  [COBERTO] Detecção de conflito (paciente) — UNITÁRIO
  [COBERTO] PENDING_PAYMENT bloqueia slot — UNITÁRIO
  [COBERTO] Reagendamento sem conflitar consigo mesmo — UNITÁRIO
  [COBERTO] Cancelamento de sessão no dashboard
  [COBERTO] Reagendamento de sessão
  [LACUNA]  Horário bloqueado por override do psicólogo
  [LACUNA]  Slot reservado durante checkout não disponível para outros
  [LACUNA]  Agendamento em fuso horário diferente do paciente
  [LACUNA]  Notificação de confirmação recebida por email
  [LACUNA]  Notificação 24h antes da sessão
```

### Módulo: Pagamento (Stripe)

```
FLUXO: Checkout → Stripe → Webhook → Consulta Criada → Notificações

  [COBERTO] Checkout session criada com valor correto (R$ → centavos)
  [COBERTO] Preço zero cria consulta sem checkout
  [COBERTO] URLs de sucesso e cancelamento corretas
  [COBERTO] Erro da API Stripe tratado
  [COBERTO] Psicólogo não encontrado
  [COBERTO] Usuário não autenticado
  [COBERTO] Webhook checkout.session.completed — criação de consulta
  [COBERTO] Webhook idempotência
  [COBERTO] Webhook account.updated — onboarding status
  [COBERTO] Aplicar cupom de desconto (E2E)
  [LACUNA]  Coupon expirado rejeitado
  [LACUNA]  Coupon esgotado (max_uses atingido) rejeitado
  [LACUNA]  Pagamento com cartão recusado (cartão 4000000000000002)
  [LACUNA]  Pagamento com autenticação 3DS (cartão 4000002500003155)
  [LACUNA]  Reembolso de consulta cancelada
  [LACUNA]  Repasse ao psicólogo via Stripe Connect
  [LACUNA]  Relatório financeiro após múltiplos pagamentos
```

### Módulo: Sessão de Vídeo (Daily.co)

```
FLUXO: Horário da Sessão → Sala de Vídeo → Token → Daily.co Room

  [COBERTO] API /api/video/token valida appointmentId (E2E/integração)
  [LACUNA]  Token com permissões corretas (isPsychologist=true/false)
  [LACUNA]  Acesso 15 min antes do horário (janela válida)
  [LACUNA]  Acesso fora da janela temporal rejeitado
  [LACUNA]  Sala criada no Daily.co antes do acesso
  [LACUNA]  Botão "Entrar na Sala" aparece apenas no horário
  [LACUNA]  Dois participantes conseguem se conectar simultaneamente
  [LACUNA]  Rate limit no endpoint de token
```

### Módulo: Prontuário Clínico (Psicólogo)

```
FLUXO: Lista de Pacientes → Prontuário → Anamnese → Evoluções

  [COBERTO] Ações de evolução (unitário)
  [COBERTO] Acesso a dados de pacientes (unitário)
  [LACUNA]  Psicólogo vê apenas seus próprios pacientes (isolamento)
  [LACUNA]  Criar anamnese inicial
  [LACUNA]  Editar evolução existente
  [LACUNA]  Paciente não tem acesso às notas privadas do psicólogo
  [LACUNA]  Paciente tem acesso ao resumo público das evoluções
  [LACUNA]  Dados criptografados no banco (encryptData integrado)
```

### Módulo: Diário de Humor (Paciente)

```
FLUXO: Dashboard → Diário → Registrar Humor → Histórico

  [COBERTO] Criação de entrada de diário (unitário)
  [COBERTO] Leitura de entradas de diário (unitário)
  [LACUNA]  Registro de múltiplas emoções em uma entrada
  [LACUNA]  Histórico de humor visualizado em gráfico/calendário
  [LACUNA]  Limite de uma entrada por dia
```

### Módulo: Mensagens

```
FLUXO: Dashboard → Mensagens → Selecionar Conversa → Enviar Mensagem

  [COBERTO] Sistema de mensagens (unitário)
  [COBERTO] Tela de mensagens carrega (E2E)
  [COBERTO] Envio de mensagem (E2E)
  [LACUNA]  Notificação de nova mensagem em tempo real
  [LACUNA]  Mensagem de usuário diferente não acessível
  [LACUNA]  Histórico de conversa paginado
```

### Módulo: Admin

```
FLUXO: /dashboard/admin/aprovacoes → Revisar → Aprovar/Rejeitar

  [COBERTO] Ações de admin (unitário)
  [COBERTO] Painel de aprovações (E2E)
  [COBERTO] Aprovar psicólogo pendente (E2E)
  [COBERTO] Rejeitar psicólogo (E2E)
  [LACUNA]  Suspender psicólogo aprovado
  [LACUNA]  Admin não pode se auto-suspender
  [LACUNA]  Logs de auditoria das aprovações
  [LACUNA]  Gestão de planos de saúde aceitos
```

---

## 8. Análise de Cobertura e Gaps

### Mapa de Cobertura por Criticidade

| Módulo              | Cobertura Unitária      | Cobertura E2E | Risco | Prioridade de Gap |
| ------------------- | ----------------------- | ------------- | ----- | ----------------- |
| Conflito de Agenda  | 🟢 Excelente (16 casos) | 🟡 Parcial    | Alto  | P1                |
| Pagamento Stripe    | 🟢 Bom (6 casos)        | 🟡 Parcial    | Alto  | P1                |
| Segurança/XSS/UUID  | 🟢 Excelente            | 🔴 Ausente    | Alto  | P1                |
| Autenticação        | 🟡 Parcial              | 🟢 Bom        | Alto  | P2                |
| Agendamento E2E     | 🟢 Conflito coberto     | 🟡 Parcial    | Alto  | P1                |
| Sessão de Vídeo     | 🔴 Mínimo               | 🔴 Mínimo     | Alto  | P1                |
| Prontuário Clínico  | 🟡 Parcial              | 🔴 Mínimo     | Alto  | P1                |
| Diário de Humor     | 🟡 Unitário básico      | 🔴 Ausente    | Médio | P2                |
| Mensagens           | 🟡 Unitário básico      | 🟡 Parcial    | Médio | P2                |
| Busca de Psicólogos | 🔴 Ausente              | 🟡 Parcial    | Médio | P2                |
| Admin               | 🟡 Unitário básico      | 🟡 Parcial    | Alto  | P1                |
| Empresa/RH          | 🔴 Ausente              | 🔴 Mínimo     | Baixo | P3                |

### Gaps Críticos (P1 — Implementar Imediatamente)

1. **Sessão de Vídeo:** Nenhum teste automatizado cobrindo a geração de token com permissões corretas, validação de janela temporal e acesso por role.

2. **Isolamento de Dados Clínicos:** Não há testes garantindo que psicólogos só acessem dados dos seus próprios pacientes. Risco de exposição de dados sensíveis.

3. **Pagamento — Casos de Falha:** Cartão recusado, 3DS, e reembolso não são testados automaticamente.

4. **Webhook Stripe — Conflito:** O caso de conflito detectado pelo webhook (slot já ocupado quando pagamento confirmou) precisa de teste de integração.

5. **Isolamento de Auth no E2E:** Testes E2E que dependem de dados de banco sem seed podem ter comportamento não-determinístico.

---

## 9. Plano de Testes Prioritários a Implementar

### Sprint 1 — Segurança e Isolamento de Dados (P1)

```typescript
// Arquivo sugerido: src/__tests__/authorization.test.ts

describe('Data Isolation', () => {
  it('Psychologist can only see their own patients')
  it('Patient cannot access another patient diary entries')
  it('Evolution private notes not accessible to patients')
  it('Admin actions require ADMIN role')
})
```

```typescript
// Arquivo sugerido: src/__tests__/video-token.test.ts

describe('Video Token API', () => {
  it('Returns token for valid appointment within time window')
  it('Rejects token request outside time window (before 15min)')
  it('Rejects token for non-participant user')
  it('isPsychologist=true for psychologist user')
  it('isPsychologist=false for patient user')
  it('Rate limit blocks >10 requests/minute')
  it('Invalid UUID appointmentId returns 400')
})
```

### Sprint 2 — Pagamento Completo (P1)

```typescript
// Arquivo sugerido: src/__tests__/stripe-webhook.test.ts

describe('Stripe Webhook Handler', () => {
  it('checkout.session.completed creates appointment with correct data')
  it('Detects conflict on webhook and does not create duplicate')
  it('Idempotency: same session.id does not create second appointment')
  it('Sends notifications to both patient and psychologist after booking')
  it('account.updated sets is_stripe_onboarded=true')
  it('Invalid webhook signature returns 400')
})
```

```typescript
// Arquivo sugerido: src/__tests__/coupons.test.ts

describe('Coupon Validation', () => {
  it('Valid coupon applies discount correctly')
  it('Expired coupon rejected')
  it('Max uses exceeded rejected')
  it('Inactive coupon rejected')
  it('Coupon usage count incremented after successful payment')
  it('100% coupon creates free appointment directly')
})
```

### Sprint 3 — E2E Críticos (P1)

```typescript
// Arquivo sugerido: e2e/video-session.spec.ts

test.describe('Video Session Flow', () => {
  test('Join button visible 15 min before session')
  test('Patient and psychologist can join room simultaneously')
  test('Cannot join room for cancelled appointment')
  test('Room link invalid after session ends')
})
```

```typescript
// Arquivo sugerido: e2e/prontuario.spec.ts (psychologistTest fixture)

test.describe('Clinical Records', () => {
  test('Psychologist creates anamnesis for patient')
  test('Psychologist writes evolution note')
  test('Patient sees public summary but not private notes')
  test('Psychologist cannot see another psychologist patients')
})
```

### Sprint 4 — Fluxos de Regressão (P2)

```typescript
// e2e/full-booking-flow.spec.ts (patientTest fixture)

test.describe('Complete Booking Flow - Patient', () => {
  test('Search → Select Psychologist → Choose Slot → Pay → Confirmation email')
  test('Book with 100% coupon → No Stripe → Appointment created directly')
  test('Try to book conflicting slot → Error shown to patient')
  test('Reschedule appointment → Old slot freed → New slot booked')
  test('Cancel within 24h → Refund initiated (se aplicável)')
})
```

---

## 10. Como Executar os Testes

### Pré-requisitos

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp env.template .env.local
# Preencher: TEST_PATIENT_EMAIL, TEST_PATIENT_PASSWORD,
#            TEST_PSYCHOLOGIST_EMAIL, TEST_PSYCHOLOGIST_PASSWORD

# 3. Banco de dados disponível (Supabase + Prisma)
npm run db:generate
```

### Testes Unitários (Jest)

```bash
# Rodar todos os testes
npm test

# Com watch mode (desenvolvimento)
npm run test:watch

# Com relatório de cobertura
npm run test:coverage

# Rodar apenas um arquivo
npx jest src/__tests__/stripe.test.ts

# Rodar apenas um describe/it
npx jest --testNamePattern="should detect conflict"
```

### Testes E2E (Playwright)

```bash
# Subir servidor de desenvolvimento (em outro terminal)
npm run dev

# Rodar todos os E2E
npm run test:e2e

# Rodar com UI interativa
npx playwright test --ui

# Rodar spec específico
npx playwright test e2e/payment.spec.ts

# Rodar com trace (debug)
npx playwright test --trace on

# Ver relatório HTML
npx playwright show-report
```

### CI/CD

```bash
# Variáveis necessárias no CI:
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
DATABASE_URL
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
DAILY_API_KEY
TEST_PATIENT_EMAIL
TEST_PATIENT_PASSWORD
TEST_PSYCHOLOGIST_EMAIL
TEST_PSYCHOLOGIST_PASSWORD
```

---

## 11. Dados de Teste

### Usuários de Teste (auto-criados pelo global-setup)

| Usuário   | Email                     | Senha                        | Role         |
| --------- | ------------------------- | ---------------------------- | ------------ |
| Paciente  | `TEST_PATIENT_EMAIL`      | `TEST_PATIENT_PASSWORD`      | PATIENT      |
| Psicólogo | `TEST_PSYCHOLOGIST_EMAIL` | `TEST_PSYCHOLOGIST_PASSWORD` | PSYCHOLOGIST |

> **Atenção:** Credenciais definidas em `.env.local`, nunca commitadas.

### Cartões de Teste Stripe

| Número                | Cenário                           |
| --------------------- | --------------------------------- |
| `4242 4242 4242 4242` | Pagamento aprovado                |
| `4000 0000 0000 0002` | Cartão recusado (charge_declined) |
| `4000 0025 0000 3155` | Requer autenticação 3DS           |
| `4000 0000 0000 9995` | Saldo insuficiente                |

> Expiração: qualquer data futura. CVC: qualquer 3 dígitos.

### Fixtures E2E

```
e2e/fixtures/
├── auth.ts                  # patientTest, psychologistTest
├── patient-auth.json        # storage state (gitignored)
└── psychologist-auth.json   # storage state (gitignored)
```

### Seeds para Desenvolvimento

```bash
# Seed básico com psicólogos e disponibilidade
npm run db:seed  # (se script existir)

# Ou via Prisma Studio
npm run db:studio
```

---

## 12. Critérios de Aceite por Feature

### Autenticação

- [ ] Usuário com email não confirmado é redirecionado para `/cadastro/confirmar-email`
- [ ] Usuário autenticado não consegue acessar `/login/*` (redirect para dashboard)
- [ ] Senha mínimo 8 caracteres com erro visual
- [ ] Email inválido com erro visual imediato
- [ ] Rate limit de tentativas de login (Upstash Redis)
- [ ] Logout limpa a sessão e redireciona para home

### Agendamento

- [ ] Apenas horários futuros exibidos no calendário
- [ ] Horários já ocupados aparecem desabilitados
- [ ] Conflito detectado antes de criar o checkout (não desperdiça sessão Stripe)
- [ ] Cancelamento com menos de 24h exibe aviso de política
- [ ] Reagendamento valida novo slot antes de liberar o antigo
- [ ] Notificação enviada para psicólogo após confirmação de agendamento

### Pagamento

- [ ] Valor exibido coincide com o valor cobrado no Stripe (sem arredondamento errado)
- [ ] Cupom de 100% não cria sessão Stripe
- [ ] Cupom expirado/esgotado rejeitado com mensagem clara
- [ ] Após pagamento bem-sucedido, consulta aparece no dashboard imediatamente
- [ ] Webhook salva `stripe_session_id` para idempotência

### Sessão de Vídeo

- [ ] Token contém permissão correta (moderator para psicólogo, participante para paciente)
- [ ] Sala não acessível fora da janela de tempo (±15 min)
- [ ] Sala não acessível para consulta cancelada
- [ ] Rate limit: máximo 10 tokens/min por usuário

### Dados Clínicos

- [ ] Notas privadas do psicólogo não são retornadas para paciente
- [ ] Psicólogo só acessa prontuário de seus próprios pacientes
- [ ] Dados sensíveis criptografados no banco (encryptData)
- [ ] Logs de acesso a prontuário registrados (auditoria)

### Performance

- [ ] Página de busca carrega em < 3 segundos (TTFB)
- [ ] Dashboard carrega dados sem N+1 queries (verificado em `dashboard.ts`)
- [ ] Listas de sessões paginadas (não carrega todas de uma vez)

---

## Glossário

| Termo               | Definição                                                              |
| ------------------- | ---------------------------------------------------------------------- |
| **Slot**            | Horário disponível para agendamento de sessão                          |
| **Override**        | Exceção na agenda do psicólogo (bloqueio, férias)                      |
| **PENDING_PAYMENT** | Status temporário enquanto checkout Stripe está em aberto              |
| **Storage State**   | Arquivo JSON com sessão autenticada persistida para E2E                |
| **CRP**             | Conselho Regional de Psicologia — número de registro profissional      |
| **CPF**             | Cadastro de Pessoa Física — documento brasileiro                       |
| **Stripe Connect**  | Plataforma de pagamentos que permite repasses a terceiros (psicólogos) |
| **Webhook**         | Endpoint que recebe eventos assíncronos do Stripe                      |
| **Daily.co**        | Plataforma de vídeo usada para as sessões online                       |

---

_Documentação gerada em 2026-03-26. Revisar a cada release major ou quando novos módulos forem adicionados._
