# Guia de Testes Manuais — Terapia Platform

> **Pré-requisito:** Execute o seed antes de começar:
>
> ```bash
> npx tsx scripts/seed-qa-complete.ts
> npm run dev   # em outro terminal
> ```
>
> Base URL: **http://localhost:3000**

---

## Credenciais de Teste

| Usuário                | Email                          | Senha       | Role                          |
| ---------------------- | ------------------------------ | ----------- | ----------------------------- |
| Psicóloga              | `ana.silva@teste-qa.com`       | `Senha123!` | PSYCHOLOGIST                  |
| Psicólogo              | `joao.santos@teste-qa.com`     | `Senha123!` | PSYCHOLOGIST                  |
| Psicólogo pendente     | `psico.pendente@teste-qa.com`  | `Senha123!` | PSYCHOLOGIST (não verificado) |
| Paciente com sessões   | `carlos.oliveira@teste-qa.com` | `Senha123!` | PATIENT                       |
| Paciente sessão futura | `maria.souza@teste-qa.com`     | `Senha123!` | PATIENT                       |
| Paciente sem sessões   | `pedro.ferreira@teste-qa.com`  | `Senha123!` | PATIENT                       |
| Admin                  | `admin@teste-qa.com`           | `Senha123!` | ADMIN                         |
| Empresa                | `empresa@teste-qa.com`         | `Senha123!` | COMPANY                       |

### Cupons da Ana Silva

| Código       | Tipo | Valor | Situação                    | Comportamento esperado             |
| ------------ | ---- | ----- | --------------------------- | ---------------------------------- |
| `QA10`       | %    | 10%   | ✅ Válido                   | Desconto aplicado                  |
| `QA20`       | %    | 20%   | ✅ Válido (expira em 30d)   | Desconto aplicado                  |
| `QAFIXO50`   | fixo | R$50  | ✅ Válido                   | Desconto R$50                      |
| `QAGRATIS`   | %    | 100%  | ✅ Válido                   | Sessão GRÁTIS, sem checkout Stripe |
| `QAEXPIRADO` | %    | 15%   | ❌ Expirado                 | Erro: "Cupom expirado"             |
| `QAESGOTADO` | %    | 20%   | ❌ Esgotado (used=1, max=1) | Erro: "limite de usos"             |
| `QAINATIVO`  | %    | 15%   | ❌ Inativo                  | Erro: "inválido ou expirado"       |

### Cartões Stripe (modo teste)

| Número                | Resultado       |
| --------------------- | --------------- |
| `4242 4242 4242 4242` | ✅ Aprovado     |
| `4000 0000 0000 0002` | ❌ Recusado     |
| `4000 0025 0000 3155` | 🔐 Requer 3DS   |
| CVC / Validade        | Qualquer válido |

---

## MÓDULO 1 — Autenticação

### TC-AUTH-01 — Login com credenciais válidas (Paciente)

1. Acesse `/login/paciente`
2. Preencha email: `carlos.oliveira@teste-qa.com`
3. Preencha senha: `Senha123!`
4. Clique em **Entrar**
5. **✅ Resultado esperado:** Redirecionado para `/dashboard`

---

### TC-AUTH-02 — Login com credenciais inválidas

1. Acesse `/login/paciente`
2. Preencha email: `naoexiste@email.com`
3. Preencha senha: `senhaerrada`
4. Clique em **Entrar**
5. **✅ Resultado esperado:** Permanece na página, exibe mensagem de erro

---

### TC-AUTH-03 — Validação de campos obrigatórios

1. Acesse `/login/paciente`
2. Clique em **Entrar** sem preencher nada
3. **✅ Resultado esperado:** Campos marcados como obrigatórios com erro visual

---

### TC-AUTH-04 — Login como Psicólogo

1. Acesse `/login/profissional`
2. Preencha email: `ana.silva@teste-qa.com` / senha: `Senha123!`
3. Clique em **Entrar**
4. **✅ Resultado esperado:** Redirecionado para `/dashboard` com visão de psicólogo

---

### TC-AUTH-05 — Login como Admin

1. Acesse `/login/profissional`
2. Preencha email: `admin@teste-qa.com` / senha: `Senha123!`
3. Clique em **Entrar**
4. **✅ Resultado esperado:** Dashboard admin com acesso a aprovações

---

### TC-AUTH-06 — Recuperação de senha

1. Acesse `/login/esqueci-senha`
2. Preencha email: `carlos.oliveira@teste-qa.com`
3. Clique em **Enviar**
4. **✅ Resultado esperado:** Mensagem de confirmação exibida ("verifique seu email")

---

### TC-AUTH-07 — Cadastro de paciente (fluxo completo)

1. Acesse `/cadastro/paciente`
2. **Passo 1:** Preencha nome: `Novo Paciente Teste` e email único (ex: `novo.paciente.{timestamp}@email.com`)
3. Clique em **Continuar**
4. **Passo 2:** Preencha CPF: `123.456.789-09`, data de nascimento, celular
5. Clique em **Continuar**
6. **Passo 3:** Preencha senha e confirmação (mín. 8 caracteres)
7. Clique em **Criar Conta**
8. **✅ Resultado esperado:** Redirecionado para página de confirmação de email

---

### TC-AUTH-08 — Cadastro com email já existente

1. Acesse `/cadastro/paciente`
2. Preencha nome e email: `carlos.oliveira@teste-qa.com` (já existe)
3. Continue o fluxo
4. **✅ Resultado esperado:** Erro informando que o email já está em uso

---

### TC-AUTH-09 — Logout

1. Faça login como Carlos
2. No dashboard, clique no menu do usuário (avatar ou nome)
3. Clique em **Sair**
4. **✅ Resultado esperado:** Redirecionado para home `/`, sessão encerrada
5. Tente acessar `/dashboard` diretamente
6. **✅ Resultado esperado:** Redirecionado para login

---

### TC-AUTH-10 — Acesso a dashboard sem autenticação

1. Sem estar logado, acesse `/dashboard` diretamente na URL
2. **✅ Resultado esperado:** Redirecionado para `/login/paciente` (ou tela de login)

---

## MÓDULO 2 — Cadastro de Psicólogo

### TC-CAD-PSI-01 — Cadastro profissional (fluxo completo)

1. Acesse `/cadastro/profissional`
2. Preencha dados: nome, email único, senha
3. **Passo Dados Profissionais:**
   - CRP: `06/99999`
   - Especialidades: selecione pelo menos 1
   - Preço por sessão: `200`
   - Bio: texto de pelo menos 100 caracteres
4. **Passo Disponibilidade:**
   - Ative segunda a sexta, horário 09:00–18:00
5. **Passo Pagamento:**
   - Clique em **Configurar conta Stripe**
   - Use dados de teste do Stripe Connect
6. **✅ Resultado esperado:** Tela de sucesso `/cadastro/profissional/sucesso`

---

### TC-CAD-PSI-02 — CRP inválido

1. No passo de dados profissionais, preencha CRP: `999/999999` (formato inválido)
2. Clique em continuar
3. **✅ Resultado esperado:** Erro de validação no campo CRP

---

## MÓDULO 3 — Landing Page e Busca

### TC-HOME-01 — Home carrega corretamente

1. Acesse `/`
2. **✅ Resultado esperado:**
   - Hero com título visível (ex: "Encontre seu equilíbrio")
   - Botão CTA visível
   - Seções de features, FAQ e footer carregados

---

### TC-BUS-01 — Busca de psicólogos

1. Acesse `/busca`
2. **✅ Resultado esperado:**
   - Heading "Encontre seu psicólogo ideal" (ou similar)
   - Cards de Ana Silva e João Santos visíveis

---

### TC-BUS-02 — Filtro por especialidade

1. Acesse `/busca`
2. Clique no filtro de especialidades
3. Selecione **Ansiedade**
4. **✅ Resultado esperado:** Apenas psicólogos com especialidade em Ansiedade exibidos (Ana deve aparecer)

---

### TC-BUS-03 — Psicólogo pendente não aparece na busca

1. Acesse `/busca`
2. Procure por `Rodrigo Pendente`
3. **✅ Resultado esperado:** Rodrigo Pendente NÃO aparece (is_verified=false)

---

### TC-BUS-04 — Perfil do psicólogo

1. Na busca, clique no card de **Ana Silva**
2. **✅ Resultado esperado:**
   - Foto/avatar, nome, CRP, bio visíveis
   - Preço R$180 exibido
   - Especialidades listadas
   - Calendário de disponibilidade carregado
   - Horários disponíveis para seleção

---

## MÓDULO 4 — Agendamento

> Login como: `carlos.oliveira@teste-qa.com`

### TC-AGE-01 — Agendar sessão avulsa com psicólogo

1. Faça login como **Carlos**
2. Acesse `/busca` e clique em **Ana Silva**
3. Selecione uma data disponível no calendário (exceto a quarta bloqueada)
4. Selecione um horário disponível
5. Verifique que o tipo selecionado é **Sessão Avulsa**
6. Clique em **Agendar** / **Continuar para pagamento**
7. **✅ Resultado esperado:** Redirecionado para página de pagamento com valor R$180

---

### TC-AGE-02 — Data bloqueada não possui horários

1. Perfil de Ana Silva no calendário
2. Clique na próxima quarta-feira (override tipo "blocked")
3. **✅ Resultado esperado:** Nenhum horário disponível, data aparece marcada/indisponível

---

### TC-AGE-03 — Sábado com horário especial

1. Perfil de Ana Silva no calendário
2. Clique no próximo sábado (override tipo "custom", 10:00–14:00)
3. **✅ Resultado esperado:** Apenas horários entre 10:00 e 14:00 disponíveis

---

### TC-AGE-04 — Selecionar pacote mensal

1. No perfil de Ana Silva, clique na aba **Pacote Mensal** (ou botão similar)
2. **✅ Resultado esperado:**
   - Preço com desconto de 20% exibido
   - Total do pacote = R$576 (4 × R$180 × 0,80)

---

### TC-AGE-05 — Visualizar consultas agendadas

1. Login como Carlos
2. Acesse `/dashboard/sessoes` (ou "Minhas Sessões" na sidebar)
3. **✅ Resultado esperado:**
   - Sessão SCHEDULED com Ana (hoje +2h) visível
   - Sessão SCHEDULED com João (+15min) visível
   - Sessão COMPLETED (ontem) visível no histórico

---

### TC-AGE-06 — Reagendar sessão

1. Login como Carlos
2. No dashboard de sessões, localize a sessão futura com Ana
3. Clique em **Reagendar**
4. Selecione nova data e horário
5. Confirme o reagendamento
6. **✅ Resultado esperado:** Sessão aparece com novo horário, antigo slot liberado

---

### TC-AGE-07 — Cancelar sessão

1. Login como Carlos
2. No dashboard de sessões, localize a sessão futura com Ana
3. Clique em **Cancelar**
4. Confirme no modal de confirmação
5. **✅ Resultado esperado:** Sessão aparece como CANCELADA, status atualizado

---

### TC-AGE-08 — Estado vazio (Pedro sem sessões)

1. Login como **Pedro** (`pedro.ferreira@teste-qa.com`)
2. Acesse `/dashboard/sessoes`
3. **✅ Resultado esperado:** Mensagem "nenhuma sessão" ou estado vazio com CTA para buscar psicólogo

---

## MÓDULO 5 — Pagamento e Cupons

### TC-PAY-01 — Pagamento com cartão aprovado

1. Login como **Carlos**
2. Acesse o perfil de Ana Silva → Selecione data e horário
3. Clique em **Continuar para pagamento**
4. Na tela de checkout:
   - Número: `4242 4242 4242 4242`
   - Validade: `12/30`
   - CVC: `123`
5. Clique em **Pagar**
6. **✅ Resultado esperado:**
   - Redirecionado para `/dashboard?payment=success`
   - Sessão aparece no dashboard de Carlos
   - Notificação enviada para Ana

---

### TC-PAY-02 — Aplicar cupom QA10 (10% desconto)

1. Login como Carlos
2. No checkout da sessão com Ana (R$180):
   - Localize o campo de cupom
   - Digite: `QA10`
   - Clique em **Aplicar**
3. **✅ Resultado esperado:**
   - Desconto de R$18 (10%) aplicado
   - Novo total: R$162

---

### TC-PAY-03 — Aplicar cupom QAFIXO50 (R$50 fixo)

1. No checkout da sessão com Ana (R$180):
   - Digite: `QAFIXO50`
   - Clique em **Aplicar**
2. **✅ Resultado esperado:**
   - Desconto de R$50 aplicado
   - Novo total: R$130

---

### TC-PAY-04 — Cupom QAGRATIS (100% — sem Stripe)

1. No checkout da sessão com Ana (R$180):
   - Digite: `QAGRATIS`
   - Clique em **Aplicar**
2. Clique em **Confirmar**
3. **✅ Resultado esperado:**
   - Total R$0,00 exibido
   - SEM redirecionamento para Stripe
   - Sessão criada diretamente, redirecionada para `/dashboard?payment=success`

---

### TC-PAY-05 — Cupom QAEXPIRADO (deve rejeitar)

1. No checkout, digite: `QAEXPIRADO`
2. Clique em **Aplicar**
3. **✅ Resultado esperado:** Mensagem de erro "Cupom expirado"

---

### TC-PAY-06 — Cupom QAESGOTADO (deve rejeitar)

1. No checkout, digite: `QAESGOTADO`
2. Clique em **Aplicar**
3. **✅ Resultado esperado:** Mensagem de erro "limite de usos atingido" (ou similar)

---

### TC-PAY-07 — Cupom QAINATIVO (deve rejeitar)

1. No checkout, digite: `QAINATIVO`
2. Clique em **Aplicar**
3. **✅ Resultado esperado:** Mensagem de erro "inválido ou expirado"

---

### TC-PAY-08 — Cupom inexistente (deve rejeitar)

1. No checkout, digite: `QUALQUERCOISA`
2. Clique em **Aplicar**
3. **✅ Resultado esperado:** Mensagem de erro "cupom inválido"

---

### TC-PAY-09 — Cartão recusado

1. No checkout Stripe:
   - Número: `4000 0000 0000 0002`
   - Validade e CVC válidos
2. Clique em **Pagar**
3. **✅ Resultado esperado:** Mensagem de erro "cartão recusado", sessão NÃO criada

---

### TC-PAY-10 — Autenticação 3DS

1. No checkout Stripe:
   - Número: `4000 0025 0000 3155`
2. Clique em **Pagar**
3. Complete a autenticação 3DS no modal
4. **✅ Resultado esperado:** Após autenticar, redirecionado para sucesso com sessão criada

---

## MÓDULO 6 — Dashboard do Paciente

### TC-PAC-DASH-01 — Dashboard carrega

1. Login como **Carlos**
2. Acesse `/dashboard`
3. **✅ Resultado esperado:**
   - Sidebar com links: Sessões, Mensagens, Diário, Perfil
   - Próxima sessão exibida em destaque

---

### TC-PAC-DASH-02 — Diário de humor

1. Login como Carlos → Acesse `/dashboard/diario`
2. **✅ Resultado esperado:** 3 entradas anteriores visíveis (criadas pelo seed)
3. Clique em **Nova Entrada**
4. Selecione humor: 8/10, emoções: "Feliz", "Calmo"
5. Escreva um texto
6. Salve
7. **✅ Resultado esperado:** Nova entrada aparece no topo do histórico

---

### TC-PAC-DASH-03 — Mensagens

1. Login como Carlos → Acesse `/dashboard/mensagens`
2. **✅ Resultado esperado:** Conversa com Ana Silva visível com 4 mensagens
3. Escreva uma nova mensagem e envie
4. **✅ Resultado esperado:** Mensagem aparece no chat

---

### TC-PAC-DASH-04 — Perfil do paciente

1. Login como Carlos → Acesse `/dashboard/perfil`
2. **✅ Resultado esperado:** Dados do perfil exibidos (nome, email)
3. Altere o nome para "Carlos O. Editado"
4. Salve
5. **✅ Resultado esperado:** Nome atualizado, toast de sucesso

---

## MÓDULO 7 — Dashboard do Psicólogo

> Login como: `ana.silva@teste-qa.com`

### TC-PSI-DASH-01 — Dashboard da psicóloga carrega

1. Login como **Ana**
2. **✅ Resultado esperado:**
   - Sidebar com: Agenda, Pacientes, Prontuário, Financeiro, Configurações
   - Próximas consultas exibidas

---

### TC-PSI-AGE-01 — Visualizar agenda

1. Login como Ana → Acesse `/dashboard/agenda`
2. **✅ Resultado esperado:**
   - Consulta de amanhã com Maria aparece
   - Consulta de hoje+2h com Carlos aparece
   - Quarta bloqueada marcada diferente (vermelho ou indisponível)
   - Sábado com horário especial marcado

---

### TC-PSI-PAC-01 — Lista de pacientes

1. Login como Ana → Acesse `/dashboard/pacientes`
2. **✅ Resultado esperado:** Carlos e Maria na lista (têm vínculo ativo)

---

### TC-PSI-PAC-02 — Prontuário do paciente

1. Login como Ana → Acesse `/dashboard/pacientes`
2. Clique em **Carlos Oliveira**
3. **✅ Resultado esperado:** Perfil de Carlos com histórico de sessões

---

### TC-PSI-PAC-03 — Escrever nota de evolução

1. No prontuário de Carlos:
2. Clique em **Nova Evolução** (ou "Adicionar Nota")
3. Preencha:
   - Humor: Ansioso
   - Resumo público: "Sessão focada em técnicas de respiração"
   - Notas privadas: "Paciente relatou episódio de pânico. Prescrito exercício diário."
4. Salve
5. **✅ Resultado esperado:** Evolução criada e listada no prontuário

---

### TC-PSI-PAC-04 — Paciente não vê notas privadas

1. Login como **Carlos**
2. Acesse `/dashboard` → localize a sessão concluída com Ana
3. Verifique se há resumo visível para o paciente
4. **✅ Resultado esperado:** Apenas o "resumo público" visível, notas privadas NÃO expostas

---

### TC-PSI-FIN-01 — Dashboard financeiro

1. Login como Ana → Acesse `/dashboard/financeiro`
2. **✅ Resultado esperado:**
   - Receita da sessão completada (R$180) contabilizada
   - Gráfico ou lista de transações visível

---

### TC-PSI-SERV-01 — Configurar serviços e cupons

1. Login como Ana → Acesse `/dashboard/configuracoes` (ou "Serviços & Tarifas")
2. **✅ Resultado esperado:** Aba de cupons visível com lista: QA10, QA20, QAFIXO50, QAGRATIS, QAEXPIRADO, QAESGOTADO, QAINATIVO

---

### TC-PSI-SERV-02 — Criar novo cupom

1. Na tela de cupons, clique em **Novo Cupom**
2. Preencha:
   - Código: `NOVOCUPOM`
   - Tipo: Percentual
   - Valor: `5`
   - Limite de usos: `10`
3. Salve
4. **✅ Resultado esperado:** `NOVOCUPOM` aparece na lista, ativo

---

### TC-PSI-SERV-03 — Desativar cupom

1. Na lista de cupons, localize `QA10`
2. Clique no toggle para desativar
3. **✅ Resultado esperado:** `QA10` marcado como inativo
4. Tente usar `QA10` no checkout como Carlos
5. **✅ Resultado esperado:** Cupom rejeitado

---

### TC-PSI-SERV-04 — Plano mensal ativo

1. Na aba de serviços, localize **Plano Mensal**
2. **✅ Resultado esperado:**
   - Toggle de "Plano Mensal" aparece como ativado
   - Desconto de 20% e 4 sessões configurados

---

### TC-PSI-SERV-05 — Ativar/desativar plano mensal

1. No painel de serviços, localize o switch de **Plano Mensal**
2. Desative-o
3. **✅ Resultado esperado:** Plano desativado, não aparece mais para pacientes na página do psicólogo
4. Reative o plano
5. **✅ Resultado esperado:** Plano visível novamente para pacientes

---

### TC-PSI-CONFIG-01 — Configurar disponibilidade semanal

1. Login como Ana → Acesse configurações de agenda
2. Desative sexta-feira
3. Salve
4. **✅ Resultado esperado:** Sextas não aparecem como disponíveis no calendário
5. Reative sexta-feira e salve

---

## MÓDULO 8 — Sessão de Vídeo

> A sessão `qa-appt-iminent-carlos-joao` foi criada com horário de **agora +15 minutos**

### TC-VID-01 — Botão "Entrar na Sala" aparece no momento correto

1. Login como **Carlos**
2. Acesse `/dashboard/sessoes`
3. Localize a sessão com João (horário +15min)
4. **✅ Resultado esperado:** Botão "Entrar na Sala" visível (dentro da janela de 15 min)

---

### TC-VID-02 — Entrar na sala como paciente

1. Clique em **Entrar na Sala** na sessão com João
2. **✅ Resultado esperado:** Redirecionado para `/sala/{id}` com interface de vídeo carregada

---

### TC-VID-03 — Entrar na sala como psicólogo

1. Login como **João** (`joao.santos@teste-qa.com`)
2. Acesse `/dashboard/agenda` ou sessões
3. Localize a sessão com Carlos
4. Clique em **Entrar na Sala**
5. **✅ Resultado esperado:** Sala aberta com controles de moderador (mudo all, gravação)

---

### TC-VID-04 — Sala não acessível antes do horário (sessão de amanhã)

1. Login como Carlos
2. Tente acessar diretamente: `/sala/qa-appt-scheduled-maria-ana`
   > (Essa é a sessão de Maria, Carlos não é participante)
3. **✅ Resultado esperado:** Acesso negado (403 ou redirecionamento)

---

### TC-VID-05 — Sala não acessível para sessão cancelada

1. Login como Carlos
2. Tente acessar: `/sala/qa-appt-canceled-carlos-ana`
3. **✅ Resultado esperado:** Acesso negado, sessão foi cancelada

---

## MÓDULO 9 — Admin

> Login como: `admin@teste-qa.com`

### TC-ADM-01 — Painel de aprovações

1. Login como **Admin**
2. Acesse `/dashboard/admin/aprovacoes`
3. **✅ Resultado esperado:** `Rodrigo Pendente` aparece na lista de aprovações pendentes

---

### TC-ADM-02 — Aprovar psicólogo

1. Na lista de aprovações, localize **Rodrigo Pendente**
2. Clique em **Aprovar**
3. **✅ Resultado esperado:**
   - Rodrigo some da lista de pendentes
   - `is_verified = true` no banco
4. Acesse `/busca` e procure por Rodrigo
5. **✅ Resultado esperado:** Rodrigo agora aparece na busca

---

### TC-ADM-03 — Rejeitar psicólogo

> Crie um novo psicólogo pendente para este teste, ou use o Rodrigo após o TC-ADM-02 ser testado separadamente.

1. Na lista de aprovações, clique em **Rejeitar**
2. Preencha o motivo da rejeição
3. Confirme
4. **✅ Resultado esperado:** Psicólogo removido da lista, motivo registrado

---

### TC-ADM-04 — Lista de psicólogos cadastrados

1. Acesse `/dashboard/admin/psicologos`
2. **✅ Resultado esperado:** Ana, João e Rodrigo listados com seus status

---

## MÓDULO 10 — Empresa / RH

> Login como: `empresa@teste-qa.com`

### TC-EMP-01 — Dashboard da empresa

1. Login como **Empresa**
2. **✅ Resultado esperado:** Dashboard com seções de colaboradores e financeiro

---

### TC-EMP-02 — Adicionar colaborador

1. Acesse `/dashboard/empresa/colaboradores`
2. Clique em **Adicionar colaborador**
3. Preencha email de um paciente existente (ex: `carlos.oliveira@teste-qa.com`)
4. **✅ Resultado esperado:** Carlos adicionado como colaborador da empresa

---

## MÓDULO 11 — Isolamento e Segurança

### TC-SEC-01 — Psicólogo não vê pacientes de outro psicólogo

1. Login como **João**
2. Acesse `/dashboard/pacientes`
3. **✅ Resultado esperado:** Apenas Carlos aparece (tem vínculo com João)
4. Maria NÃO aparece (vínculo apenas com Ana)

---

### TC-SEC-02 — Paciente não acessa dashboard de outro paciente

1. Login como **Carlos**
2. Descubra o ID de Maria (via URL ou banco) e tente acessar `/dashboard/pacientes/{id-da-maria}`
3. **✅ Resultado esperado:** Acesso negado ou redirecionamento

---

### TC-SEC-03 — Endpoint de token de vídeo com ID inválido

1. Com qualquer usuário logado, acesse:
   `POST /api/video/token` com body `{ "appointmentId": "nao-e-um-uuid" }`
2. **✅ Resultado esperado:** HTTP 400 Bad Request

---

### TC-SEC-04 — Endpoint de vídeo sem autenticação

1. Sem estar logado, faça:
   `POST /api/video/token` com body `{ "appointmentId": "qualquer-id" }`
2. **✅ Resultado esperado:** HTTP 401 Unauthorized

---

## MÓDULO 12 — Fluxos de Regressão Críticos

### TC-REG-01 — Fluxo completo: Busca → Pagamento → Sessão no dashboard

1. Login como **Carlos**
2. `/busca` → selecione **Ana Silva**
3. Selecione data e horário disponíveis
4. Aplique cupom `QA10` (10% desconto)
5. Complete pagamento com cartão `4242 4242 4242 4242`
6. **✅ Resultado esperado:** Redirecionado para dashboard com a nova sessão listada

---

### TC-REG-02 — Fluxo grátis: Busca → Cupom 100% → Sessão sem Stripe

1. Login como Carlos
2. `/busca` → selecione **Ana Silva**
3. Selecione data e horário
4. Aplique cupom `QAGRATIS` (100%)
5. **✅ Resultado esperado:**
   - Total R$0,00
   - Sem redirecionamento para Stripe
   - Sessão criada diretamente
   - Aparece no dashboard como SCHEDULED

---

### TC-REG-03 — Impedir agendamento duplo (conflito)

1. Login como Carlos
2. Note o horário da sessão existente (qa-appt-soon-carlos-ana, hoje+2h com Ana)
3. Tente agendar OUTRO horário igual (mesmo dia, mesma hora) com Ana ou João
4. **✅ Resultado esperado:** Erro informando conflito de horário

---

### TC-REG-04 — Notificação após agendamento

1. Após completar um novo agendamento (TC-REG-01)
2. Login como **Ana**
3. Acesse o sino de notificações
4. **✅ Resultado esperado:** Notificação "Nova sessão agendada com Carlos" visível

---

## Checklist de Execução

Marque cada módulo conforme a execução:

| Módulo                                | Status | Executor | Data | Observações |
| ------------------------------------- | ------ | -------- | ---- | ----------- |
| 1 - Autenticação (TC-AUTH-01 a 10)    | ⬜     |          |      |             |
| 2 - Cadastro Psicólogo (TC-CAD-PSI)   | ⬜     |          |      |             |
| 3 - Landing e Busca (TC-HOME, TC-BUS) | ⬜     |          |      |             |
| 4 - Agendamento (TC-AGE)              | ⬜     |          |      |             |
| 5 - Pagamento e Cupons (TC-PAY)       | ⬜     |          |      |             |
| 6 - Dashboard Paciente (TC-PAC)       | ⬜     |          |      |             |
| 7 - Dashboard Psicólogo (TC-PSI)      | ⬜     |          |      |             |
| 8 - Sessão de Vídeo (TC-VID)          | ⬜     |          |      |             |
| 9 - Admin (TC-ADM)                    | ⬜     |          |      |             |
| 10 - Empresa (TC-EMP)                 | ⬜     |          |      |             |
| 11 - Segurança (TC-SEC)               | ⬜     |          |      |             |
| 12 - Regressão Crítica (TC-REG)       | ⬜     |          |      |             |

---

## Como Reportar um Bug

Ao encontrar um comportamento diferente do esperado, documente:

```
ID: TC-XXX-YY
Módulo: [nome do módulo]
Severidade: Crítico / Alto / Médio / Baixo
Pré-condição: [estado necessário]
Passos: [lista numerada exata]
Resultado obtido: [o que aconteceu]
Resultado esperado: [o que deveria acontecer]
Ambiente: localhost:3000 / branch main
Screenshot/Log: [anexar se possível]
```

### Severidade

| Nível       | Critério                                                                   |
| ----------- | -------------------------------------------------------------------------- |
| **Crítico** | Dados perdidos, segurança comprometida, pagamento errado, crash total      |
| **Alto**    | Funcionalidade principal quebrada (não dá para agendar, não dá para pagar) |
| **Médio**   | Funcionalidade secundária quebrada ou comportamento inesperado             |
| **Baixo**   | Texto errado, layout desalinhado, problema visual menor                    |
