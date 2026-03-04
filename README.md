# Terapia 🌿

Uma plataforma moderna e completa para gestão de clínicas e atendimentos psicológicos, focada na experiência do profissional e no acolhimento do paciente.

## ✨ Funcionalidades Principais

### Para Psicólogos
- **Gestão Financeira:** Dashboard com controle de receita, ticket médio e evolução mensal.
- **Prontuário Digital:** Histórico de evoluções, anamneses e controle de pacientes.
- **Agenda Inteligente:** Gestão de horários, bloqueios e agendamentos automatizados.
- **Telemedicina:** Salas de vídeo integradas de alta performance.
- **Mensageria:** Sistema de chat interno para comunicação segura com pacientes.

### Para Pacientes
- **Busca de Profissionais:** Filtros por especialidade e valor de sessão.
- **Diário Emocional:** Registro de humor e sentimentos com acompanhamento.
- **Agendamento Simples:** Interface intuitiva para marcação e pagamento de sessões.
- **Pagamentos Integrados:** Checkout seguro via Pix e cartão de crédito.

---

## 🚀 Tecnologias

O projeto utiliza o que há de mais moderno no ecossistema JavaScript/TypeScript:

| Camada | Tecnologia |
| :--- | :--- |
| **Framework** | [Next.js 14 (App Router)](https://nextjs.org/) |
| **Linguagem** | [TypeScript](https://www.typescriptlang.org/) |
| **Estilização** | [Tailwind CSS](https://tailwindcss.com/) + [Radix UI](https://www.radix-ui.com/) |
| **Banco de Dados** | [PostgreSQL](https://www.postgresql.org/) com [Prisma ORM](https://www.prisma.io/) |
| **Backend/Auth** | [Supabase](https://supabase.com/) |
| **Pagamentos** | [Stripe](https://stripe.com/) |
| **Vídeo** | [Daily.co](https://www.daily.co/) |
| **Validação** | [Zod](https://zod.dev/) + [React Hook Form](https://react-hook-form.com/) |

---

## 🛠️ Instalação e Configuração

### Pré-requisitos
- Node.js 18+
- Docker (opcional, para banco de dados local)
- Conta no Supabase, Stripe e Daily.co

### Passo a Passo

1. **Clonar o repositório**
   ```bash
   git clone [url-do-repositorio]
   cd Terapia
   ```

2. **Instalar dependências**
   ```bash
   npm install
   ```

3. **Configurar variáveis de ambiente**
   Crie um arquivo `.env.local` baseado no `env.template`:
   ```bash
   cp env.template .env.local
   ```

4. **Preparar o Banco de Dados**
   ```bash
   npm run db:generate
   npm run db:push
   ```

5. **Iniciar em modo desenvolvimento**
   ```bash
   npm run dev
   ```

---

## 🧪 Qualidade e Testes

O projeto mantém altos padrões de qualidade com cobertura de testes em múltiplos níveis:

- **Unitários & Componentes:** `npm test` (Jest + Testing Library)
- **E2E (End-to-End):** `npm run test:e2e` (Playwright)
- **Documentação de UI:** `npm run storybook`
- **Linting:** `npm run lint`

---

## 📁 Estrutura do Projeto

- `src/app`: Rotas, layouts e páginas (Next.js App Router).
- `src/components`: Componentes de interface reutilizáveis.
- `src/lib`: Lógica de negócio, clientes de API (Supabase, Stripe) e Server Actions.
- `src/hooks`: Hooks personalizados para lógica de estado.
- `src/__tests__`: Suíte de testes unitários.
- `prisma`: Esquema de dados e migrações.

---

## 📄 Licença

Este projeto é privado e de uso exclusivo. Todos os direitos reservados.

