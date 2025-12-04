# US-PRO-02: Gestão de Disponibilidade

**Como** psicólogo,
**Quero** definir minha grade de horários,
**Para** que os pacientes saibam quando posso atender.

## Critérios de Aceite
- [ ] **Grade Recorrente:** Configurar horários padrão (ex: Toda Segunda das 09:00 às 12:00 e 14:00 às 18:00).
- [ ] **Exceções (Bloqueios):** Bloquear dias específicos (ex: Feriado, Médico) sem alterar a regra recorrente.
- [ ] **Exceções (Adições):** Abrir horário extra em um dia específico.
- [ ] Visualização de calendário intuitiva (drag & drop opcional).
- [ ] Definição de duração da sessão (padrão 50min) e intervalo entre sessões (padrão 10min).

## Cenários de Exceção
*   **Conflito com Agendamento:** Se o psicólogo tentar remover um horário que já tem paciente agendado, o sistema deve impedir e avisar: "Você possui agendamentos neste horário. Cancele-os primeiro."
*   **Horários Sobrepostos:** Impedir criação de regras que se sobrepõem (ex: 08-10h e 09-11h).

## Especificação Técnica

### Frontend
*   **Página:** `/app/pro/agenda`
*   **Componentes:**
    *   `WeeklyScheduler`: Interface para definir padrão semanal.
    *   `DateBlocker`: Interface para selecionar datas no calendário e marcar como "Indisponível".
*   **Libs:** `react-big-calendar` ou `FullCalendar`.

### Backend
*   **Tabela `availability_rules`:**
    *   `psychologist_id`: uuid
    *   `day_of_week`: int (0-6)
    *   `start_time`: time
    *   `end_time`: time
*   **Tabela `availability_exceptions`:**
    *   `date`: date
    *   `type`: ENUM('BLOCK', 'ADD')
    *   `start_time`: time
    *   `end_time`: time
*   **Lógica de Geração de Slots:**
    *   Function `generate_slots(start_date, end_date)`:
        1.  Pega regras recorrentes.
        2.  Aplica exceções (remove ou adiciona).
        3.  Remove horários ocupados na tabela `appointments`.
        4.  Retorna array de slots disponíveis.
