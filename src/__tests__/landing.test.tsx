import { render, screen } from '@testing-library/react'
import Home from '../app/(marketing)/page'
import '@testing-library/jest-dom'

describe('Landing Page', () => {
    it('renders the main value proposition', async () => {
        const ResolvedHome = await Home()
        render(ResolvedHome)
        // Adjust these strings to match the final copy in the Masterplan
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Saúde Mental/i)
    })

    it('renders the "Find a Psychologist" CTA', async () => {
        const ResolvedHome = await Home()
        render(ResolvedHome)
        const button = screen.getByRole('link', { name: /Encontrar Psicólogo/i })
        expect(button).toBeInTheDocument()
    })

    it('renders the "Criar Conta" buttons', async () => {
        const ResolvedHome = await Home()
        render(ResolvedHome)
        const buttons = screen.getAllByRole('button', { name: /Criar Conta/i })
        expect(buttons.length).toBeGreaterThan(0)
    })
})
