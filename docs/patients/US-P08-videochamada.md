# US-P08: Realizar Videochamada

**Como** paciente,
**Quero** entrar na sala de vídeo segura,
**Para** realizar a terapia.

## Critérios de Aceite
- [ ] Link da sala disponível ("Entrar na Sessão") 15 min antes do horário agendado.
- [ ] Sala de espera (Pre-call check): Testar Câmera, Microfone e Alto-falantes antes de entrar.
- [ ] Vídeo e áudio de alta qualidade (HD) com baixa latência.
- [ ] Chat de texto disponível durante a chamada.
- [ ] Funcionalidade de "Mudo" e "Desligar Câmera".
- [ ] Timer visível mostrando o tempo restante da sessão.
- [ ] Aviso de "5 minutos restantes".

## Cenários de Exceção
*   **Permissão Negada:** Se o usuário negar acesso à câmera, exibir instruções de como habilitar no navegador.
*   **Queda de Conexão:** Tentar reconectar automaticamente por 30s. Se falhar, mostrar botão "Tentar novamente".
*   **Browser Incompatível:** Detectar e avisar (ex: Internet Explorer).

## Especificação Técnica

### Frontend
*   **Página:** `/sala/[id]`
*   **Lib:** `@daily-co/daily-js` (Client SDK).
*   **Componentes:**
    *   `DeviceChecker`: Modal de setup inicial.
    *   `VideoGrid`: Layout responsivo (Mobile: Stacked, Desktop: Side-by-side).
    *   `ControlBar`: Botões flutuantes.
*   **Permissões:** Usar `navigator.mediaDevices.getUserMedia` para check inicial.

### Backend
*   **API:** `/api/video/token`
*   **Validação:**
    1.  Verificar se `user_id` pertence ao `appointment` (Paciente ou Psicólogo).
    2.  Verificar horário: `start_time - 15min <= now() <= end_time`.
*   **Daily.co API:**
    *   Criar sala (se não existir): `POST https://api.daily.co/v1/rooms` (nome aleatório seguro).
    *   Gerar Token: `POST https://api.daily.co/v1/meeting-tokens` (com `exp` configurado para fim da sessão).
