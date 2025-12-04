# Sitemap & Fluxos: Pacientes

## Sitemap do Portal do Paciente (`/app/patient`)

*   `/dashboard` **Visão Geral** (Próxima sessão, atalhos)
*   `/consultas` **Minhas Consultas**
    *   `/consultas/[id]` Detalhes, Link da Sala, Reagendar
*   `/consultas/nova` **Novo Agendamento** (Fluxo: Seleção -> Agenda -> Pagamento)
*   `/carteira` **Gestão Financeira** (Cartões salvos, Histórico de pagamentos)
*   `/perfil` **Configurações Pessoais**
*   `/sala/[id]` **Sala de Telemedicina** (Vídeo + Chat)
*   `/sala-espera/[id]` **Pré-atendimento** (Timer, Status do Psicólogo)
*   `/avaliacao/[id]` **Pós-sessão** (Rating ⭐ + Review)
*   `/reagendar/[id]` **Gestão de Conflitos**

## Fluxos de Usuário (Jornadas)

### 1. Jornada de Agendamento
```mermaid
graph TD
    A[Início] --> B{Já sabe o profissional?}
    B -- Não --> C[Responder Quiz de Preferências]
    C --> D[Algoritmo sugere 3 Psicólogos]
    B -- Sim --> E[Busca Direta / Perfil]
    D --> F[Visualizar Perfil Completo]
    E --> F
    F --> G[Selecionar Data e Hora]
    G --> H{Logado?}
    H -- Não --> I[Login / Cadastro Rápido]
    I --> J[Checkout / Pagamento]
    H -- Sim --> J
    J --> K[Confirmação]
    K --> L[Email/WhatsApp Enviado]
    K --> M[Bloqueio na Agenda do Médico]
```

### 2. Fluxo de Atendimento (Telemedicina)
```mermaid
graph TD
    A[15min Antes] --> B[Link da Sala Ativo]
    B --> C[Paciente Entra na Sala de Espera]
    C --> E{Ambos Conectados?}
    E -- Sim --> F[Sessão Iniciada]
    F --> G[Vídeo + Áudio Criptografado]
    F --> H[Chat de Texto Lateral]
    F --> I[Timer Regressivo]
    I --> J[Fim do Tempo]
    J --> K[Encerramento Suave]
    K --> L[Paciente: Avaliação]
```

### 3. Fluxo de Cancelamento
```mermaid
graph TD
    A[Paciente Clica Cancelar] --> B{Tempo restante?}
    B -- >24h --> C[Cancelar Grátis + Slot Liberado]
    B -- <24h --> D[Multa 50% + Confirmação]
    D --> E[Reagendar?]
    E -- Sim --> F[Próximo slot livre]
    E -- Não --> G[Reembolso parcial Stripe]
```
