# Plano de Implementação "Vibing" - Terapia 🚀

Este plano foi desenhado para garantir que o desenvolvimento flua perfeitamente ("vibing"), priorizando a estética e a experiência do usuário desde o primeiro dia, seguido por uma lógica robusta.

## 🛠️ Tech Stack Principal
*   **Framework:** Next.js 14+ (App Router)
*   **Linguagem:** TypeScript
*   **Estilização:** Tailwind CSS + **Shadcn/UI**
*   **Backend:** Supabase
*   **Vídeo:** Daily.co

## 🌊 Fase 1: A Fundação Estética (Design System & "Vibe")
**Objetivo:** Definir a alma visual do projeto. Antes de qualquer lógica complexa, o app precisa *parecer* incrível.

1.  **Setup do Projeto (Já iniciado)**
    *   [ ] Validar instalação do Next.js 14 (App Router).
    *   [ ] Limpeza inicial (remover boilerplate do Next.js).
    *   [ ] Configuração de Fontes (Inter/Outfit ou similar premium).

2.  **Design System (Tailwind + Shadcn/UI)**
    *   [ ] **Paleta de Cores:** Definir no `tailwind.config.ts` as cores primárias, secundárias, e *accents* (foco em tons de saúde mental: calmos, mas modernos).
    *   [ ] **Tipografia:** Configurar tamanhos e pesos para H1-H6 e corpo de texto.
    *   [ ] **Instalar Shadcn/UI:** Configurar a base de componentes.
    *   [ ] **Componentes Atômicos (UI Kit):**
        *   Botões (Primary, Secondary, Ghost) com micro-interações (hover/active).
        *   Inputs e Forms (com estados de erro/foco bonitos).
        *   Cards (para perfis de psicólogos e planos).
        *   Badges/Tags (para especialidades).

3.  **Layouts Base**
    *   [ ] **Navbar Responsiva:** Transparente na home, sólida nas internas. Menu hambúrguer animado no mobile.
    *   [ ] **Footer:** Com links úteis e newsletter.
    *   [ ] **Grid System:** Garantir que o conteúdo respire (espaçamentos consistentes).

---

## 🎨 Fase 2: Frontend "Wow" (Páginas Públicas)
**Objetivo:** Criar as páginas que vendem o produto. Foco total em conversão e beleza.

1.  **Landing Page (Home)**
    *   [ ] **Hero Section:** Título impactante, subtítulo persuasivo, CTA claro e imagem/ilustração de alta qualidade.
    *   [ ] **Social Proof:** Logos de empresas ou "X mil vidas atendidas".
    *   [ ] **Como Funciona:** Seção visual explicar o fluxo (Passo 1, 2, 3).
    *   [ ] **Destaque de Psicólogos:** Carrossel ou grid com cards de exemplo.

2.  **Páginas de Apoio**
    *   [ ] **Para Psicólogos:** Landing page focada em atrair profissionais (benefícios, calculadora de ganhos).
    *   [ ] **Para Empresas:** Landing page B2B.
    *   [ ] **Login/Cadastro:** Telas limpas, focadas, com opção de Social Login visualmente clara.

---

## 🧠 Fase 3: O Cérebro (Backend & Dados - Supabase)
**Objetivo:** Dar vida à interface com dados reais e segurança.

1.  **Supabase Setup**
    *   [ ] Criar projeto no Supabase.
    *   [ ] Configurar tabelas (Schema SQL): `profiles`, `appointments`, `reviews`.
    *   [ ] Configurar **RLS (Row Level Security):** Garantir que paciente só vê seus dados e psicólogo só vê seus pacientes.

2.  **Autenticação**
    *   [ ] Integrar Supabase Auth no Next.js (Middleware para proteção de rotas).
    *   [ ] Fluxo de Onboarding: Após cadastro, redirecionar para preencher perfil (Paciente vs Psicólogo).

---

## ⚙️ Fase 4: O Core do Produto (App Privado)
**Objetivo:** Onde o valor é entregue. A experiência de uso diário.

1.  **Busca & Matching**
    *   [ ] Página de Busca com filtros (Preço, Especialidade).
    *   [ ] Página de Perfil do Psicólogo (Detalhes, Bio, Avaliações).

2.  **Agendamento**
    *   [ ] Componente de Calendário (seleção de slots).
    *   [ ] Checkout (Integração Stripe ou Mock inicial).

3.  **Dashboard do Paciente**
    *   [ ] "Próxima Sessão" (Card de destaque).
    *   [ ] Histórico de consultas.

4.  **Dashboard do Psicólogo**
    *   [ ] Gestão de Agenda (Definir horários livres).
    *   [ ] Lista de Pacientes.

---

## 📹 Fase 5: Telemedicina & Realtime
**Objetivo:** A consulta em si.

1.  **Vídeo Chamada**
    *   [ ] Integração Daily.co (ou similar).
    *   [ ] Sala de Espera (UI com timer e dicas de saúde).
    *   [ ] Sala de Vídeo (Controles de mudo, câmera, chat).

2.  **Chat & Notificações**
    *   [ ] Chat simples entre paciente/psicólogo (se aplicável).
    *   [ ] Notificações de sistema (Agendamento confirmado).

---

## ✨ Fase 6: Polimento & Launch
**Objetivo:** Garantir que tudo está perfeito.

1.  **QA Visual:** Verificar pixel-perfect em Mobile e Desktop.
2.  **Performance:** Otimizar imagens, fontes e scripts.
3.  **SEO:** Meta tags, OpenGraph (cards de compartilhamento).
4.  **Deploy:** Vercel (Frontend) + Supabase (Backend).

---

## 🚀 Próximos Passos Imediatos
1.  Verificar se a instalação do Next.js terminou.
2.  Instalar `shadcn-ui` e configurar o tema (cores/fontes).
3.  Criar a estrutura de pastas do projeto.
