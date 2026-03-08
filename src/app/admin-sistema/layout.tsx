import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const profile = await prisma.profile.findUnique({
    where: { user_id: user.id },
  })

  // Security layer: If the user is not an ADMIN, return a completely empty page or redirect away quietly.
  if (!profile || profile.role !== 'ADMIN') {
    redirect('/dashboard') // Redirecionar para dashboard silencia que a rota existe
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <header className="bg-neutral-900 text-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold tracking-tight">Terapia | Admin Interno</h1>
          <nav className="flex space-x-4">
            <a
              href="/dashboard"
              className="text-sm text-neutral-300 hover:text-white transition-colors"
            >
              Voltar ao App
            </a>
          </nav>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto border-x border-neutral-200 bg-white">
        {children}
      </main>
    </div>
  )
}
