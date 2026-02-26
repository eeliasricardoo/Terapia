# 📋 Especificação de Feature: Sistema de Vagas Sociais (V2)

## 1. Resumo da Ferramenta
Um sistema que permite aos psicólogos reservarem parte de sua agenda para "Vagas Sociais" (sessões com um valor fixo muito reduzido, ex: R$ 30,00 ou R$ 50,00). Ao atender pacientes por esse valor, o psicólogo acumula "Pontos Sociais" que melhoram drasticamente o seu posicionamento no algoritmo de busca da plataforma, atraindo mais pacientes particulares. O valor simbólico existe para cobrir os custos operacionais (gateway de pagamento, conectividade de vídeo) e garantir o comprometimento do paciente (evitar *no-show*).

## 2. Regras de Negócio
- **Valor da Vaga Social:** Fixo pela plataforma (ex: R$ 40,00). Nem o paciente nem o psicólogo podem alterar esse valor para esta modalidade.
- **Elegibilidade do Paciente:** O paciente deve se auto-declarar "Baixa Renda" no momento do cadastro ou antes do agendamento (pode ser um checkbox simples ou um questionário curto).
- **Limite por Psicólogo:** Para evitar que aglomerem apenas vagas baratas e quebrem a economia da plataforma, o psicólogo pode ofertar até um máximo de *X%* de sua agenda (ou um número fixo, ex: 10 vagas sociais) por semana.
- **Acúmulo de Pontos:** Os pontos só são computados **após a sessão ser realizada com sucesso** (status finalizado).
- **Decaimento de Pontos (Sazonalidade):** Os pontos expiram após 6 meses (ou perdem força com o tempo) para obrigar os psicólogos que estão no topo a continuarem oferecendo vagas sociais periodicamente, dando chance para os profissionais novos subirem.

## 3. Fluxo do Psicólogo
1. **Configuração de Agenda:** Ao liberar horários na agenda, o psicólogo vê uma opção *(toggle)*: `"Marcar este horário como Vaga Social"`.
2. **Dashboard de Impacto:** No painel dele, haverá uma seção gamificada mostrando:
   - Quantos atendimentos sociais já realizou.
   - Posição atual dele no Ranking de Busca (ex: *"Você está entre os 5% mais vistos da plataforma"*).
   - Selo *"Profissional de Impacto"* (Badge) no seu perfil.
3. **Recebimento:** Recebe o valor simbólico (descontada a taxa normal do gateway de pagamento).

## 4. Fluxo do Paciente
1. **Filtro de Busca:** Na página de busca de terapeutas, existe um filtro `"Mostrar Vagas Sociais (R$ 40,00)"`.
2. **Visualização do Perfil:** Os horários marcados como sociais aparecem destacados (ex: com um ícone de coração ou cor diferente) na agenda do profissional.
3. **Checkout:** Na tela de pagamento, é exibido um termo informando que aquela é uma vaga social e pede o compromisso de não faltar, pois ele está ocupando a vaga de alguém que poderia necessitar.
4. **Reserva e Pagamento:** Paga o valor simbólico por PIX ou Cartão.

## 5. O Algoritmo de Ranking (Busca)
O novo algoritmo quando o usuário busca no site (sem filtros específicos) deve ordenar os perfis baseando-se em um "Score de Relevância":

`Score Total = (Média de Avaliações * Peso 1) + (Número de Sessões Sociais Realizadas nos Últimos 30 dias * Peso 2) + (Data de Cadastro)`

Assim, Psicólogos Novos + Vagas Sociais podem ficar imediatamente visíveis na primeira página se ofertarem muita ajuda social no início, acelerando a fase de *"cold start"* para novos profissionais, com um claro benefício de visibilidade pela ajuda social prestada.

## 6. Arquitetura de Implementação Técnica

### A. Banco de Dados (Supabase)
Precisaremos adicionar as seguintes estruturas/colunas:
* **Tabela `profiles` (Psicólogo):**
  * `social_points: integer` (default: 0)
  * `is_impact_professional: boolean` (ganha selo após 10 atendimentos)
* **Tabela `availability` (Horários):**
  * `is_social_slot: boolean` (default: false)
* **Tabela `appointments` (Sessões/Agendamentos):**
  * `is_social_session: boolean`
  * `points_awarded: boolean` (Se os pontos já foram dados para não haver duplicidade)

### B. Backend (Server Actions / Edge Functions)
* **Finalização de Sessão (Webhook ou Cron Job):** Quando a sessão via *Daily.co* encerra e o *status* do agendamento vai para `completed`:
  1. Verifica se `is_social_session` é `true`.
  2. Verifica se `points_awarded` é `false`.
  3. Soma +10 pontos (ou quantidade definida) na tabela de perfil do psicólogo.
  4. Marca `points_awarded` como `true`.

### C. Frontend (UI/UX)
* **Selo de Perfil:** Um ícone especial na ficha do profissional (ex: "💛 Apoia a Saúde Emocional Acessível").
* **Toggle Social:** Componente Switch no gerenciador de horários do psicólogo.
* **Modal de Confirmação:** Aviso de "Não Faltar" para o paciente social no check-out.

## 7. Proteção contra Abusos
* **Auto-agendamento falso:** O psicólogo não pode agendar para si mesmo usando e-mails falsos pagando R$ 30,00 só para ganhar visibilidade de ranking. 
   - *Contramedida:* Restringir a quantidade máxima de pontos sociais que podem ser ganhos *por paciente distinto*. (Ex: Atender o mesmo paciente 10 vezes só gera pontos até um certo limite, forçando ter clientes distintos sociais).
* **Ausências Contínuas:** Se um Paciente Social faltar mais de 2 vezes sem cancelar, sua conta perde temporariamente o direito a buscar vagas com o selo social (ex: bloqueio do recurso por 3 meses).
