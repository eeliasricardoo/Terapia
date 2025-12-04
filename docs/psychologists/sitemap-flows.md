# Sitemap & Fluxos: Psicólogos

## Sitemap do Portal do Psicólogo (`/app/pro`)

*   `/dashboard` **Visão Geral** (Resumo do dia, Ganhos do mês)
*   `/agenda` **Gestão de Disponibilidade** (Configurar horários recorrentes/bloqueios)
*   `/pacientes` **CRM de Pacientes** (Lista, Histórico)
    *   `/pacientes/[id]` Prontuário, Anotações Privadas, Histórico de Sessões
*   `/mensagens` **Chat Seguro** (Comunicação assíncrona com pacientes)
*   `/financeiro` **Carteira Digital** (Saldo, Extrato, Solicitar Saque)
*   `/perfil` **Perfil Público** (Bio, Especialidades, Foto, Preço)
*   `/verificacao` **Status de Aprovação** (Envio de documentos CRP/Diploma)

## Fluxos de Usuário (Jornadas)

### 1. Jornada de Verificação
```mermaid
graph TD
    A[Cadastro Inicial] --> B[Upload de Documentos]
    B --> C[Diploma + CRP + Identidade]
    C --> D[Status: Em Análise]
    D --> E{Admin Aprova?}
    E -- Não --> F[Email de Correção]
    F --> B
    E -- Sim --> G[Conta Ativada]
    G --> H[Configurar Disponibilidade]
    H --> I[Perfil Visível na Busca]
```

### 2. Fluxo de Atendimento (Visão do Profissional)
```mermaid
graph TD
    A[15min Antes] --> B[Link da Sala Ativo]
    B --> C[Psicólogo Entra na Sala]
    C --> D{Paciente na espera?}
    D -- Sim --> E[Sessão Iniciada]
    D -- Não --> F[Aguardar Paciente]
    E --> G[Vídeo + Áudio]
    E --> H[Chat]
    E --> I[Timer]
    I --> J[Fim do Tempo]
    J --> K[Encerramento]
    K --> L[Evolução do Prontuário]
```
