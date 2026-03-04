import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import RegistrationPage from '../app/(marketing)/cadastro/paciente/page'
import '@testing-library/jest-dom'

import { useRouter } from 'next/navigation';

// Enable manual mock
jest.mock('next/navigation');

// Mock auth
jest.mock('@/lib/supabase/auth', () => ({
    auth: {
        signUp: jest.fn().mockResolvedValue({ error: null })
    }
}));

describe('Registration Page', () => {
    const mockPush = jest.fn();

    beforeEach(() => {
        mockPush.mockClear();
        (useRouter as jest.Mock).mockReturnValue({
            push: mockPush,
        });
    });

    it('renders Step 1 (Identificação) initially', () => {
        render(<RegistrationPage />)

        expect(screen.getByText(/Identificação/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/CPF/i)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /Continuar/i })).toBeInTheDocument()

        // Should NOT show Step 2 fields yet
        expect(screen.queryByLabelText(/Nome Completo/i)).not.toBeInTheDocument()
    })

    it('navigates to Step 2 after valid document', async () => {
        render(<RegistrationPage />)

        // Fill valid document (dummy valid CPF)
        const cpfInput = screen.getByLabelText(/CPF/i)
        fireEvent.change(cpfInput, { target: { value: '529.982.247-25' } })

        const continueButton = screen.getByRole('button', { name: /Continuar/i });
        fireEvent.click(continueButton)

        await waitFor(() => {
            expect(screen.getByText(/Dados Pessoais/i)).toBeInTheDocument()
        })

        expect(screen.getByLabelText(/Nome Completo/i)).toBeInTheDocument()
    })
})
