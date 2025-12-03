# Histórias de Usuário & Regras Técnicas - Terapia

Este documento detalha as histórias de usuário (User Stories), critérios de aceitação e regras técnicas para guiar o desenvolvimento da plataforma.

---

## 1. Épico: Autenticação & Onboarding (Auth)

### US-01: Cadastro de Paciente
**Como** novo paciente,
**Quero** criar uma conta utilizando meu e-mail ou conta Google,
**Para** que eu possa acessar a plataforma e buscar psicólogos.

#### Critérios de Aceite (Business Rules)
- [ ] O usuário deve poder se cadastrar com E-mail/Senha ou Google (Social Login).
- [ ] A senha deve ter no mínimo 8 caracteres.
- [ ] O e-mail deve ser validado (formato correto e único).
- [ ] Após o cadastro, o usuário deve ser redirecionado para o Quiz de Preferências (Onboarding).

#### Regras Técnicas (Technical Rules)
- **Auth Provider:** Supabase Auth.
- **Database:** Ao criar o usuário no `auth.users`, uma *Trigger* do PostgreSQL deve criar automaticamente uma entrada na tabela `public.profiles` com `role = 'PATIENT'`.
- **Segurança:** Não expor dados sensíveis no token JWT além do necessário (ID, Role).

### US-02: Cadastro de Psicólogo (Profissional)
**Como** psicólogo,
**Quero** me cadastrar e enviar meus documentos (CRP, Diploma),
**Para** que eu possa ser verificado e começar a atender.

#### Critérios de Aceite
- [ ] O formulário deve exigir: Nome Completo, CRP (Conselho Regional de Psicologia) e Upload de Diploma/Carteira CRP.
- [ ] O status inicial da conta deve ser `PENDING_VERIFICATION`.
- [ ] Usuários com status `PENDING` não podem aparecer na busca nem receber agendamentos.

#### Regras Técnicas
- **Storage:** Documentos devem ser salvos em um Bucket privado do Supabase (`secure-docs`) com acesso restrito apenas a Admins.
- **Role:** Definir `role = 'PSYCHOLOGIST'` no perfil.

---

## 2. Épico: Busca & Matching (Marketplace)

### US-03: Quiz de Preferências (Matching)
**Como** paciente,
**Quero** responder a perguntas sobre minhas necessidades (ex: ansiedade, depressão, preferência de gênero do terapeuta),
**Para** receber recomendações de psicólogos mais adequados para mim.

#### Critérios de Aceite
- [ ] Questionário de 3-5 passos (Wizard).
- [ ] Ao final, apresentar lista de 3-5 psicólogos recomendados ("Best Match").
- [ ] Permitir pular o quiz e ir para a busca geral.

#### Regras Técnicas
- **Algoritmo:** Filtragem baseada em tags no banco de dados (ex: `specialties` do psicólogo vs `needs` do paciente).
- **Frontend:** Persistir estado do quiz localmente (Zustand/Context) até o envio.

### US-04: Busca e Filtros
**Como** paciente,
**Quero** filtrar psicólogos por preço, especialidade e horários disponíveis,
**Para** encontrar alguém que caiba no meu orçamento e agenda.

#### Critérios de Aceite
- [ ] Filtros: Faixa de Preço, Especialidades (TCC, Psicanálise, etc.), Gênero, Disponibilidade (Hoje, Amanhã).
- [ ] Ordenação: Recomendados, Menor Preço, Maior Preço.
- [ ] Paginação ou Infinite Scroll para resultados.

#### Regras Técnicas
- **Performance:** Utilizar índices no PostgreSQL para colunas de filtro frequente (`price`, `specialties`).
- **Query:** Utilizar Full Text Search do Postgres para busca por nome.

---

## 3. Épico: Agendamento & Pagamento (Booking)

### US-05: Visualizar Agenda e Agendar
**Como** paciente,
**Quero** ver os horários livres de um psicólogo e reservar uma sessão,
**Para** garantir meu atendimento.

#### Critérios de Aceite
- [ ] Visualização de calendário semanal/mensal.
- [ ] Bloquear horários já agendados ou passados.
- [ ] Bloquear horários que o psicólogo marcou como indisponível.
- [ ] Reserva temporária (hold) de 15 min durante o checkout para evitar *double-booking*.

#### Regras Técnicas
- **Concorrência:** Utilizar transações no banco de dados ou *optimistic locking* para garantir que dois usuários não agendem o mesmo slot simultaneamente.
- **Tabela:** `appointments` com status (`PENDING_PAYMENT`, `SCHEDULED`).

### US-06: Pagamento da Sessão
**Como** paciente,
**Quero** pagar pela consulta via cartão de crédito ou PIX,
**Para** confirmar o agendamento.

#### Critérios de Aceite
- [ ] Integração transparente com gateway de pagamento.
- [ ] Confirmação imediata após sucesso do pagamento.
- [ ] Envio de comprovante por e-mail.

#### Regras Técnicas
- **Gateway:** Stripe (Cartão) / Integração PIX.
- **Webhooks:** Escutar webhooks do gateway para atualizar o status do agendamento para `SCHEDULED` de forma segura.

---

## 4. Épico: Telemedicina (Video)

### US-07: Realizar Videochamada
**Como** usuário (paciente ou psicólogo),
**Quero** entrar em uma sala de vídeo segura e estável,
**Para** realizar a terapia.

#### Critérios de Aceite
- [ ] Link da sala disponível 15 min antes da sessão.
- [ ] Sala de espera com verificação de câmera/microfone.
- [ ] Vídeo e áudio de alta qualidade.
- [ ] Chat de texto disponível durante a chamada.

#### Regras Técnicas
- **Provider:** Daily.co ou LiveKit.
- **Segurança:** Tokens de sala temporários e únicos por sessão.
- **Logs:** Registrar horário de entrada e saída para auditoria (sem gravar o vídeo).

---

## 5. Épico: Gestão do Profissional (Pro Dashboard)

### US-08: Gestão de Disponibilidade
**Como** psicólogo,
**Quero** definir meus horários de atendimento recorrentes e exceções,
**Para** que os pacientes saibam quando posso atender.

#### Critérios de Aceite
- [ ] Configurar grade semanal (ex: Seg e Qua, 08:00 às 18:00).
- [ ] Adicionar bloqueios específicos (ex: Férias, Feriados).

#### Regras Técnicas
- **Lógica:** Gerar slots disponíveis dinamicamente baseados na regra de recorrência menos os agendamentos existentes.

### US-09: Prontuário Eletrônico
**Como** psicólogo,
**Quero** registrar anotações sobre a sessão,
**Para** manter o histórico clínico do paciente.

#### Critérios de Aceite
- [ ] Editor de texto rico para anotações.
- [ ] Histórico de anotações anteriores visível apenas para o psicólogo.
- [ ] Dados devem ser extremamente seguros.

#### Regras Técnicas
- **Criptografia:** As anotações devem ser criptografadas no banco de dados (Encryption at Rest) e descriptografadas apenas no cliente do psicólogo autorizado.
