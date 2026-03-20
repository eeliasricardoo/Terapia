import { test, expect } from '@playwright/test'
import { login } from './helpers/auth'

test.describe('Fluxos de Perfil e Configurações', () => {
  test('Editar perfil do paciente', async ({ page }) => {
    await login(page, 'paciente')

    await page.goto('/dashboard/perfil', { waitUntil: 'networkidle' })
    await page.waitForLoadState('domcontentloaded')

    // Clicar em editar
    const editButton = page.getByRole('button', { name: /editar.*perfil/i })
    if (await editButton.isVisible()) {
      await editButton.click()
    }

    // Editar nome
    const nameInput = page.getByLabel(/nome/i)
    await expect(nameInput).toBeVisible({ timeout: 10000 })
    await nameInput.clear()
    await nameInput.fill('João Silva Atualizado')

    // Editar telefone
    const phoneInput = page.getByLabel(/telefone|celular/i)
    if (await phoneInput.isVisible()) {
      await phoneInput.clear()
      await phoneInput.fill('(11) 98765-4321')
    }

    // Salvar
    const saveButton = page.getByRole('button', { name: /salvar/i })
    await saveButton.click()

    // Verificar mensagem de sucesso
    await expect(page.getByText(/atualizado.*sucesso|perfil.*salvo/i)).toBeVisible({
      timeout: 10000,
    })
  })

  test('Upload de foto de perfil', async ({ page }) => {
    await login(page, 'paciente')

    await page.goto('/dashboard/perfil', { waitUntil: 'networkidle' })
    await page.waitForLoadState('domcontentloaded')

    // Procurar botão de upload de foto
    const uploadButton = page.getByRole('button', { name: /alterar.*foto|upload.*imagem/i })

    if (await uploadButton.isVisible({ timeout: 5000 })) {
      // Criar arquivo de teste (pode usar um arquivo real em fixtures)
      const fileInput = page.locator('input[type="file"]')

      // Simular upload (ajustar path conforme fixtures)
      await fileInput.setInputFiles('e2e/fixtures/test-avatar.jpg')

      // Aguardar upload e preview
      await expect(page.getByText(/upload.*sucesso|imagem.*atualizada/i)).toBeVisible({
        timeout: 15000,
      })
    }
  })

  test('Editar perfil do psicólogo - Informações profissionais', async ({ page }) => {
    await login(page, 'psicologo')

    await page.goto('/dashboard/psicologo/perfil', { waitUntil: 'networkidle' })
    await page.waitForLoadState('domcontentloaded')

    const editButton = page.getByRole('button', { name: /editar/i })
    if (await editButton.isVisible()) {
      await editButton.click()
    }

    // Editar bio/sobre
    const bioTextarea = page.getByLabel(/sobre|biografia|descrição/i)
    if (await bioTextarea.isVisible()) {
      await bioTextarea.clear()
      await bioTextarea.fill(
        'Psicólogo especializado em terapia cognitivo-comportamental com mais de 10 anos de experiência.'
      )
    }

    // Editar preço
    const priceInput = page.getByLabel(/preço|valor.*sessão/i)
    if (await priceInput.isVisible()) {
      await priceInput.clear()
      await priceInput.fill('180')
    }

    // Salvar
    const saveButton = page.getByRole('button', { name: /salvar/i })
    await saveButton.click()

    await expect(page.getByText(/atualizado.*sucesso/i)).toBeVisible({ timeout: 10000 })
  })

  test('Editar especialidades do psicólogo', async ({ page }) => {
    await login(page, 'psicologo')

    await page.goto('/dashboard/psicologo/perfil', { waitUntil: 'networkidle' })
    await page.waitForLoadState('domcontentloaded')

    // Procurar seção de especialidades
    const specialtiesSection = page.getByText(/especialidades/i)
    await expect(specialtiesSection).toBeVisible({ timeout: 10000 })

    // Adicionar nova especialidade
    const addSpecialtyButton = page.getByRole('button', { name: /adicionar.*especialidade/i })
    if (await addSpecialtyButton.isVisible()) {
      await addSpecialtyButton.click()

      // Selecionar da lista
      const ansiedadeOption = page.getByRole('option', { name: /ansiedade/i })
      if (await ansiedadeOption.isVisible()) {
        await ansiedadeOption.click()
      }
    }

    // Salvar
    const saveButton = page.getByRole('button', { name: /salvar/i })
    await saveButton.click()

    await expect(page.getByText(/especialidade.*adicionada|atualizado/i)).toBeVisible({
      timeout: 10000,
    })
  })

  test('Configurar disponibilidade de horários (Psicólogo)', async ({ page }) => {
    await login(page, 'psicologo')

    await page.goto('/dashboard/psicologo/disponibilidade', { waitUntil: 'networkidle' })
    await page.waitForLoadState('domcontentloaded')

    // Selecionar dia da semana
    const mondayCheckbox = page.getByRole('checkbox', { name: /segunda/i })
    if (await mondayCheckbox.isVisible()) {
      await mondayCheckbox.check()

      // Adicionar horário
      const addTimeButton = page.getByRole('button', { name: /adicionar.*horário/i })
      if (await addTimeButton.isVisible()) {
        await addTimeButton.click()

        // Preencher início e fim
        const startTime = page.getByLabel(/início|início.*horário/i)
        if (await startTime.isVisible()) {
          await startTime.fill('09:00')
        }

        const endTime = page.getByLabel(/fim|término/i)
        if (await endTime.isVisible()) {
          await endTime.fill('17:00')
        }
      }

      // Salvar
      const saveButton = page.getByRole('button', { name: /salvar/i })
      await saveButton.click()

      await expect(page.getByText(/disponibilidade.*atualizada/i)).toBeVisible({ timeout: 10000 })
    }
  })

  test('Alterar senha', async ({ page }) => {
    await login(page, 'paciente')

    await page.goto('/dashboard/configuracoes', { waitUntil: 'networkidle' })
    await page.waitForLoadState('domcontentloaded')

    // Procurar seção de segurança/senha
    const changePasswordButton = page.getByRole('button', { name: /alterar.*senha/i })
    if (await changePasswordButton.isVisible()) {
      await changePasswordButton.click()

      // Preencher formulário
      const currentPassword = page.getByLabel(/senha.*atual/i)
      await expect(currentPassword).toBeVisible({ timeout: 10000 })
      await currentPassword.fill('senha123')

      const newPassword = page.getByLabel(/nova.*senha/i)
      await newPassword.fill('NovaSenha123!')

      const confirmPassword = page.getByLabel(/confirmar.*senha/i)
      await confirmPassword.fill('NovaSenha123!')

      // Submeter
      const submitButton = page.getByRole('button', { name: /salvar|alterar/i })
      await submitButton.click()

      await expect(page.getByText(/senha.*alterada|atualizada.*sucesso/i)).toBeVisible({
        timeout: 10000,
      })
    }
  })

  test('Configurar notificações', async ({ page }) => {
    await login(page, 'paciente')

    await page.goto('/dashboard/configuracoes', { waitUntil: 'networkidle' })
    await page.waitForLoadState('domcontentloaded')

    // Procurar switches de notificação
    const emailNotifications = page.getByRole('switch', { name: /e-mail/i })
    if (await emailNotifications.isVisible()) {
      const isChecked = await emailNotifications.isChecked()

      // Toggle
      await emailNotifications.click()

      // Verificar que mudou
      const newState = await emailNotifications.isChecked()
      expect(newState).toBe(!isChecked)

      // Salvar se necessário
      const saveButton = page.getByRole('button', { name: /salvar/i })
      if (await saveButton.isVisible()) {
        await saveButton.click()
      }
    }
  })

  test('Adicionar formação acadêmica (Psicólogo)', async ({ page }) => {
    await login(page, 'psicologo')

    await page.goto('/dashboard/psicologo/perfil', { waitUntil: 'networkidle' })
    await page.waitForLoadState('domcontentloaded')

    // Procurar seção de formação
    const addEducationButton = page.getByRole('button', { name: /adicionar.*formação/i })

    if (await addEducationButton.isVisible({ timeout: 5000 })) {
      await addEducationButton.click()

      // Preencher formulário
      const degreeInput = page.getByLabel(/grau|título/i)
      if (await degreeInput.isVisible()) {
        await degreeInput.fill('Mestrado em Psicologia Clínica')
      }

      const institutionInput = page.getByLabel(/instituição/i)
      if (await institutionInput.isVisible()) {
        await institutionInput.fill('Universidade de São Paulo')
      }

      const yearInput = page.getByLabel(/ano/i)
      if (await yearInput.isVisible()) {
        await yearInput.fill('2020')
      }

      // Salvar
      const saveButton = page.getByRole('button', { name: /salvar|adicionar/i })
      await saveButton.click()

      await expect(page.getByText(/formação.*adicionada/i)).toBeVisible({ timeout: 10000 })
    }
  })

  test('Excluir conta (com confirmação)', async ({ page }) => {
    await login(page, 'paciente')

    await page.goto('/dashboard/configuracoes', { waitUntil: 'networkidle' })
    await page.waitForLoadState('domcontentloaded')

    // Procurar opção de excluir conta
    const deleteAccountButton = page.getByRole('button', { name: /excluir.*conta|deletar.*conta/i })

    if (await deleteAccountButton.isVisible({ timeout: 5000 })) {
      await deleteAccountButton.click()

      // Verificar modal de confirmação
      const confirmDialog = page.getByText(/tem certeza|confirmar.*exclusão/i)
      await expect(confirmDialog).toBeVisible({ timeout: 5000 })

      // NÃO confirmar para não deletar conta de teste
      const cancelButton = page.getByRole('button', { name: /cancelar/i })
      if (await cancelButton.isVisible()) {
        await cancelButton.click()
      }
    }
  })

  test('Visualizar avaliações recebidas (Psicólogo)', async ({ page }) => {
    await login(page, 'psicologo')

    await page.goto('/dashboard/psicologo/avaliacoes', { waitUntil: 'networkidle' })
    await page.waitForLoadState('domcontentloaded')

    // Verificar lista de avaliações ou mensagem vazia
    const reviewsList = page.locator('[data-testid="reviews-list"]')
    const emptyMessage = page.getByText(/nenhuma avaliação|sem avaliações/i)

    await expect(reviewsList.or(emptyMessage)).toBeVisible({ timeout: 10000 })
  })
})
