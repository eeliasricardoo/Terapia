# US-P01: Cadastro de Paciente

**Como** novo paciente,
**Quero** criar uma conta utilizando meu e-mail ou conta Google,
**Para** que eu possa acessar a plataforma e buscar psicólogos.

## Critérios de Aceite
- [ ] O usuário deve poder se cadastrar com E-mail/Senha ou Google (Social Login).
- [ ] A senha deve ter no mínimo 8 caracteres, contendo pelo menos 1 número e 1 caractere especial.
- [ ] O e-mail deve ser validado (formato correto e único).
- [ ] Bloquear tentativas de cadastro com e-mail já existente (mensagem amigável: "E-mail já cadastrado").
- [ ] Após o cadastro, o usuário deve ser redirecionado automaticamente para o Quiz de Preferências.
- [ ] Enviar e-mail de confirmação de conta (Double Opt-in) se usar E-mail/Senha.

## Cenários de Exceção (Edge Cases)
*   **Falha de Rede:** Exibir Toast de erro "Verifique sua conexão".
*   **E-mail Duplicado:** Se o usuário tentar cadastrar com Google um e-mail que já existe via Senha, sugerir vincular contas.
*   **Senha Fraca:** Feedback em tempo real da força da senha.

## Especificação Técnica

### Frontend
*   **Página:** `/cadastro`
*   **Componentes:**
    *   `SignUpForm`: Formulário controlado via `react-hook-form`.
    *   `SocialLoginButton`: Botão com ícone do Google.
    *   `PasswordStrengthMeter`: Indicador visual.
*   **Validação (Zod Schema):**
    ```typescript
    z.object({
      email: z.string().email(),
      password: z.string().min(8).regex(/[0-9]/).regex(/[^a-zA-Z0-9]/),
      confirmPassword: z.string()
    }).refine((data) => data.password === data.confirmPassword)
    ```
*   **Estados de UI:**
    *   `idle`: Formulário limpo.
    *   `submitting`: Botão desabilitado com Spinner.
    *   `error`: Mensagens de erro em vermelho abaixo dos inputs.

### Backend (Supabase)
*   **Auth:** `supabase.auth.signUp({ email, password, options: { data: { role: 'PATIENT' } } })`.
*   **Trigger Database (`on_auth_user_created`):**
    ```sql
    BEGIN
      INSERT INTO public.profiles (id, email, role, created_at)
      VALUES (new.id, new.email, 'PATIENT', now());
      RETURN new;
    END
    ```
*   **Segurança:** Rate Limit de 5 tentativas/minuto por IP.
