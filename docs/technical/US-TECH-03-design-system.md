# US-TECH-03: Specs do Design System

**Objetivo:** Garantir consistência visual e "Vibe" premium em toda a aplicação.

## Referência Viva
O **Storybook** é a fonte da verdade para componentes.
*   Comando: `npm run storybook`
*   URL Local: `http://localhost:6006`

## Tokens de Design

### Cores (Tailwind Config)
Baseado em variáveis CSS (`globals.css`) para suportar Dark Mode nativo.

*   **Primary:** Tons de Roxo/Azul Profundo (Confiança, Calma).
*   **Secondary:** Tons Pastéis/Areia (Acolhimento).
*   **Destructive:** Vermelho Suave (Erro, Perigo).
*   **Muted:** Cinzas neutros para fundos e textos secundários.
*   **Accent:** Cor de destaque para CTAs (ex: Verde Menta ou Laranja Suave).

### Tipografia
*   **Font Family:** `Inter` (UI) e `Outfit` (Headings/Brand).
*   **Scale:**
    *   H1: `text-4xl` a `text-6xl` (Hero).
    *   H2: `text-3xl` (Seções).
    *   Body: `text-base` (16px) com `leading-relaxed`.

### Espaçamento & Layout
*   **Radius:** `0.5rem` (8px) ou `1rem` (16px) para cards mais amigáveis.
*   **Container:** Centralizado com padding responsivo (`px-4 md:px-8`).

## Componentes Core (Shadcn/UI Customizados)

### 1. Button
*   **Variants:** `default` (Solid), `outline` (Borda), `ghost` (Hover apenas).
*   **Micro-interactions:** Scale down on click (`active:scale-95`), transition colors.

### 2. Card
*   Uso extensivo para perfis, agendamentos e conteúdos.
*   Sombra suave (`shadow-sm`) que aumenta no hover (`shadow-md`).

### 3. Input / Form
*   Estilo minimalista.
*   Validação inline com mensagens de erro claras (Zod + React Hook Form).

### 4. Dialog / Modal
*   Para confirmações e edições rápidas sem sair do contexto.
*   Backdrop com blur (`backdrop-blur-sm`).

## Ícones
*   Biblioteca: **Lucide React**.
*   Estilo: Traço fino (`stroke-width={1.5}` ou `2`), consistente com a tipografia.
