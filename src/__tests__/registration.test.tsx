import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import RegistrationPage from '../app/[locale]/(marketing)/cadastro/paciente/page'
import '@testing-library/jest-dom'

import { useRouter, useSearchParams } from 'next/navigation'

// Enable manual mock
jest.mock('next/navigation')

jest.mock('@upstash/ratelimit', () => ({ Ratelimit: jest.fn() }))
jest.mock('@upstash/redis', () => ({ Redis: jest.fn() }))

// Mock auth
jest.mock('@/lib/supabase/auth', () => ({
  auth: {
    signUp: jest.fn().mockResolvedValue({ error: null }),
  },
}))

jest.mock('@marsidev/react-turnstile', () => ({
  Turnstile: ({ onSuccess }: any) => {
    // Automatically trigger success for tests if needed, or just render nothing
    return <div data-testid="turnstile-mock" />
  },
}))

describe('Registration Page', () => {
  const mockPush = jest.fn()

  beforeEach(() => {
    mockPush.mockClear()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    })
    ;(useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn().mockReturnValue(null),
    })
  })

  it('renders Step 1 initially', () => {
    render(<RegistrationPage />)

    expect(screen.getByText(/Crie sua conta/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Nome Completo/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Continuar/i })).toBeInTheDocument()

    // Should NOT show Step 2 fields yet
    expect(screen.queryByLabelText(/CPF/i)).not.toBeInTheDocument()
  })

  it('navigates to Step 2 after valid name and email', async () => {
    render(<RegistrationPage />)

    // Fill valid step 1 data
    const nameInput = screen.getByLabelText(/Nome Completo/i)
    fireEvent.change(nameInput, { target: { value: 'João Silva' } })

    const emailInput = screen.getByLabelText(/Email/i)
    fireEvent.change(emailInput, { target: { value: 'joao@example.com' } })

    const continueButton = screen.getByRole('button', { name: /Continuar/i })
    fireEvent.click(continueButton)

    await waitFor(() => {
      expect(screen.getByText(/Dados Necessários/i)).toBeInTheDocument()
    })

    expect(screen.getByLabelText(/CPF/i)).toBeInTheDocument()
  })
})
