import { render, screen } from '@testing-library/react'
import Home from '../app/(marketing)/page'
import '@testing-library/jest-dom'

describe('Landing Page', () => {
  it('renders the main value proposition', async () => {
    const ResolvedHome = await Home()
    render(ResolvedHome)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Encontre seu equilíbrio/i)
  })

  it('renders the "Quero fazer terapia" CTA', async () => {
    const ResolvedHome = await Home()
    render(ResolvedHome)
    const link = screen.getByRole('link', { name: /Quero fazer terapia/i })
    expect(link).toBeInTheDocument()
  })

  it('renders the "Sou Psicólogo(a)" button', async () => {
    const ResolvedHome = await Home()
    render(ResolvedHome)
    const buttons = screen.getAllByRole('button', { name: /Sou Psicólogo\(a\)/i })
    expect(buttons.length).toBeGreaterThan(0)
  })
})
