import { render, screen } from '@testing-library/react'
import Home from '../app/(marketing)/page'
import '@testing-library/jest-dom'

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
    },
  })),
}))

jest.mock('@/lib/prisma', () => ({
  prisma: {
    psychologistProfile: {
      count: jest.fn().mockResolvedValue(10),
    },
  },
}))

describe('Landing Page', () => {
  it('renders the main value proposition', async () => {
    const ResolvedHome = await Home()
    render(ResolvedHome)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Encontre seu equilíbrio/i)
  })

  it('renders the "Começar agora" CTA', async () => {
    const ResolvedHome = await Home()
    render(ResolvedHome)
    const link = screen.getByRole('link', { name: /Começar agora/i })
    expect(link).toBeInTheDocument()
  })

  it('renders the "Sou Psicólogo(a)" button', async () => {
    const ResolvedHome = await Home()
    render(ResolvedHome)
    const buttons = screen.getAllByRole('button', { name: /Sou Psicólogo\(a\)/i })
    expect(buttons.length).toBeGreaterThan(0)
  })
})
