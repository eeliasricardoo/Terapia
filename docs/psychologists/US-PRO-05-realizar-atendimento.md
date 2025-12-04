# US-PRO-05: Realizar Atendimento

**Como** psicólogo,
**Quero** realizar a videochamada com qualidade e ver o prontuário ao mesmo tempo,
**Para** atender o paciente com eficiência.

## Critérios de Aceite
- [ ] **Layout Split View:** Vídeo do paciente em destaque, Prontuário na lateral (editável).
- [ ] **Controles de Sessão:** Timer regressivo visível, Botão "Encerrar Sessão".
- [ ] **Indicadores:** Status de conexão do paciente (Online/Offline).
- [ ] **Anotações Rápidas:** Campo de texto para rascunho durante a sessão (salvo localmente).

## Cenários de Exceção
*   **Paciente Atrasado:** Notificar psicólogo "Paciente ainda não entrou".
*   **Sessão Estendida:** Permitir ultrapassar o tempo limite (soft limit), mas avisar "Sessão excedeu o tempo".

## Especificação Técnica

### Frontend
*   **Página:** `/sala/[id]` (Modo Psicólogo).
*   **Componentes:**
    *   `VideoRoom`: Instância do Daily.co.
    *   `PatientHistorySidebar`: Accordion com sessões passadas.
    *   `SessionNotes`: Editor TipTap.
*   **Hooks:** `useParticipantCounts()` (Daily) para saber se paciente está na sala.

### Backend
*   **Realtime:** Escutar eventos de presença na sala via Webhook do Daily.co (`participant-joined`) e atualizar status no banco se necessário.
