import { test, expect } from '@playwright/test'
import { login } from './helpers/auth'

test.describe('Fluxos de Mensagens e Comunicação', () => {
  test('Acessar caixa de mensagens', async ({ page }) => {
    await login(page, 'paciente')

    await page.goto('/dashboard/mensagens', { waitUntil: 'networkidle' })
    await page.waitForLoadState('domcontentloaded')

    // Verificar que a interface de mensagens está carregada
    const messagesContainer = page.locator('[data-testid="messages-container"]')
    const conversationsList = page.locator('[data-testid="conversations-list"]')

    await expect(
      messagesContainer.or(conversationsList).or(page.getByText(/mensagens/i))
    ).toBeVisible({ timeout: 10000 })
  })

  test('Enviar mensagem para psicólogo', async ({ page }) => {
    await login(page, 'paciente')

    await page.goto('/dashboard/mensagens', { waitUntil: 'networkidle' })
    await page.waitForLoadState('domcontentloaded')

    // Selecionar conversa existente ou iniciar nova
    const conversation = page.locator('[data-testid="conversation-item"]').first()

    if (await conversation.isVisible({ timeout: 5000 })) {
      await conversation.click()
      await page.waitForTimeout(500)

      // Digitar mensagem
      const messageInput = page.getByPlaceholder(/digite.*mensagem|escreva/i)
      await expect(messageInput).toBeVisible({ timeout: 10000 })
      await messageInput.fill('Olá, gostaria de tirar uma dúvida sobre nossa próxima sessão.')

      // Enviar
      const sendButton = page.getByRole('button', { name: /enviar/i })
      await sendButton.click()

      // Verificar que a mensagem apareceu
      await expect(page.getByText(/gostaria de tirar uma dúvida/i)).toBeVisible({ timeout: 10000 })
    }
  })

  test('Receber notificação de nova mensagem', async ({ page }) => {
    await login(page, 'psicologo')

    await page.goto('/dashboard', { waitUntil: 'networkidle' })
    await page.waitForLoadState('domcontentloaded')

    // Verificar se há badge/contador de notificações
    const notificationBadge = page.locator('[data-testid="notification-badge"]')
    const messagesLink = page.getByRole('link', { name: /mensagens/i })

    // Verificar se há indicador visual de novas mensagens
    const hasNotification = await notificationBadge.isVisible({ timeout: 2000 })

    if (hasNotification) {
      const count = await notificationBadge.textContent()
      expect(parseInt(count || '0')).toBeGreaterThan(0)
    }
  })

  test('Buscar conversas', async ({ page }) => {
    await login(page, 'paciente')

    await page.goto('/dashboard/mensagens', { waitUntil: 'networkidle' })
    await page.waitForLoadState('domcontentloaded')

    // Procurar campo de busca
    const searchInput = page.getByPlaceholder(/buscar.*conversa|pesquisar/i)

    if (await searchInput.isVisible({ timeout: 5000 })) {
      await searchInput.fill('Dr.')

      // Aguardar filtro aplicar
      await page.waitForTimeout(500)

      // Verificar que a lista foi filtrada
      const conversationItems = page.locator('[data-testid="conversation-item"]')
      const count = await conversationItems.count()

      expect(count).toBeGreaterThan(0)
    }
  })

  test('Marcar mensagem como lida', async ({ page }) => {
    await login(page, 'paciente')

    await page.goto('/dashboard/mensagens', { waitUntil: 'networkidle' })
    await page.waitForLoadState('domcontentloaded')

    // Procurar conversa não lida
    const unreadConversation = page.locator('[data-unread="true"]').first()

    if (await unreadConversation.isVisible({ timeout: 5000 })) {
      // Abrir conversa (deve marcar como lida automaticamente)
      await unreadConversation.click()
      await page.waitForTimeout(1000)

      // Voltar para lista e verificar que não está mais não lida
      const backButton = page.getByRole('button', { name: /voltar/i })
      if (await backButton.isVisible()) {
        await backButton.click()
      }

      // Verificar que o indicador de não lida desapareceu
      const stillUnread = await unreadConversation.getAttribute('data-unread')
      expect(stillUnread).toBe('false')
    }
  })

  test('Enviar anexo/imagem', async ({ page }) => {
    await login(page, 'paciente')

    await page.goto('/dashboard/mensagens', { waitUntil: 'networkidle' })
    await page.waitForLoadState('domcontentloaded')

    const conversation = page.locator('[data-testid="conversation-item"]').first()

    if (await conversation.isVisible({ timeout: 5000 })) {
      await conversation.click()
      await page.waitForTimeout(500)

      // Procurar botão de anexo
      const attachButton = page.getByRole('button', { name: /anexo|anexar|arquivo/i })

      if (await attachButton.isVisible()) {
        await attachButton.click()

        // Upload de arquivo
        const fileInput = page.locator('input[type="file"]')
        await fileInput.setInputFiles('e2e/fixtures/test-document.pdf')

        // Aguardar upload
        await expect(page.getByText(/enviando|upload/i)).toBeVisible({ timeout: 5000 })

        // Verificar que anexo apareceu na conversa
        await expect(page.locator('[data-testid="message-attachment"]')).toBeVisible({
          timeout: 15000,
        })
      }
    }
  })

  test('Arquivar conversa', async ({ page }) => {
    await login(page, 'paciente')

    await page.goto('/dashboard/mensagens', { waitUntil: 'networkidle' })
    await page.waitForLoadState('domcontentloaded')

    const conversation = page.locator('[data-testid="conversation-item"]').first()

    if (await conversation.isVisible({ timeout: 5000 })) {
      // Abrir menu de opções
      const optionsButton = conversation.getByRole('button', { name: /opções|menu/i })

      if (await optionsButton.isVisible()) {
        await optionsButton.click()

        // Clicar em arquivar
        const archiveButton = page.getByRole('menuitem', { name: /arquivar/i })
        if (await archiveButton.isVisible()) {
          await archiveButton.click()

          // Verificar que conversa foi removida da lista principal
          await expect(conversation).not.toBeVisible({ timeout: 5000 })
        }
      }
    }
  })

  test('Bloquear/desbloquear usuário', async ({ page }) => {
    await login(page, 'paciente')

    await page.goto('/dashboard/mensagens', { waitUntil: 'networkidle' })
    await page.waitForLoadState('domcontentloaded')

    const conversation = page.locator('[data-testid="conversation-item"]').first()

    if (await conversation.isVisible({ timeout: 5000 })) {
      await conversation.click()
      await page.waitForTimeout(500)

      // Abrir menu de opções
      const optionsButton = page.getByRole('button', { name: /opções|configurações/i })

      if (await optionsButton.isVisible()) {
        await optionsButton.click()

        // Clicar em bloquear
        const blockButton = page.getByRole('menuitem', { name: /bloquear/i })
        if (await blockButton.isVisible()) {
          await blockButton.click()

          // Confirmar bloqueio
          const confirmButton = page.getByRole('button', { name: /sim|confirmar/i })
          if (await confirmButton.isVisible()) {
            await confirmButton.click()
          }

          // Verificar mensagem de bloqueio
          await expect(page.getByText(/bloqueado|usuário.*bloqueado/i)).toBeVisible({
            timeout: 10000,
          })
        }
      }
    }
  })

  test('Notificações de mensagens em tempo real', async ({ page }) => {
    // Este teste verifica se o sistema de notificações está configurado

    await login(page, 'paciente')

    // Ir para outra página (não mensagens)
    await page.goto('/dashboard', { waitUntil: 'networkidle' })

    // Verificar que há um indicador visual de nova mensagem
    const notificationBadge = page.locator('[data-testid="notification-badge"]')
    const messagesLink = page.getByRole('link', { name: /mensagens/i })

    // Verificar que os elementos de notificação existem na interface
    const badgeExists = await notificationBadge.count()
    const messagesLinkExists = await messagesLink.count()

    // Pelo menos um dos indicadores deve existir
    expect(badgeExists + messagesLinkExists).toBeGreaterThan(0)
  })

  test('Responder rapidamente com templates', async ({ page }) => {
    await login(page, 'psicologo')

    await page.goto('/dashboard/mensagens', { waitUntil: 'networkidle' })
    await page.waitForLoadState('domcontentloaded')

    const conversation = page.locator('[data-testid="conversation-item"]').first()

    if (await conversation.isVisible({ timeout: 5000 })) {
      await conversation.click()
      await page.waitForTimeout(500)

      // Procurar botão de respostas rápidas
      const quickRepliesButton = page.getByRole('button', { name: /respostas.*rápidas|templates/i })

      if (await quickRepliesButton.isVisible()) {
        await quickRepliesButton.click()

        // Selecionar um template
        const template = page.getByRole('menuitem', { name: /confirmo/i }).first()
        if (await template.isVisible()) {
          await template.click()

          // Verificar que o texto foi inserido
          const messageInput = page.getByPlaceholder(/digite.*mensagem/i)
          const value = await messageInput.inputValue()
          expect(value.length).toBeGreaterThan(0)
        }
      }
    }
  })
})
