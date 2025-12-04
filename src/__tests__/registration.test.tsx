import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import RegistrationPage from '../app/cadastro/paciente/page'
import '@testing-library/jest-dom'

// Mock useRouter
jest.mock('next/navigation', () => ({
    useRouter() {
        return {
            push: jest.fn(),
        };
    },
}));

describe('Registration Page', () => {
    it('renders all registration form fields for Colombia', () => {
        render(<RegistrationPage />)

        expect(screen.getByLabelText(/Nome Completo/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/Cédula de Ciudadanía/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/Celular/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/Data de Nascimento/i)).toBeInTheDocument()
        expect(screen.getByPlaceholderText(/Sua senha forte/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/Confirmar Senha/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/Aceito os Termos/i)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /Criar Conta/i })).toBeInTheDocument()
    })

    it('shows validation error for invalid Cédula', async () => {
        render(<RegistrationPage />)

        fireEvent.change(screen.getByLabelText(/Cédula de Ciudadanía/i), { target: { value: '123' } }) // Too short
        fireEvent.click(screen.getByRole('button', { name: /Criar Conta/i }))

        await waitFor(() => {
            expect(screen.getByText(/Cédula deve ter no mínimo 6 dígitos/i)).toBeInTheDocument()
        })
    })

    it('shows validation error for weak password', async () => {
        render(<RegistrationPage />)

        fireEvent.change(screen.getByLabelText(/^Senha/i), { target: { value: 'weakpass' } })
        fireEvent.click(screen.getByRole('button', { name: /Criar Conta/i }))

        await waitFor(() => {
            expect(screen.getByText(/Senha deve conter pelo menos uma letra maiúscula/i)).toBeInTheDocument()
        })
    })
})
