import { Footer } from '@/components/layout/Footer'
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar'
import { MobileNav } from '@/components/dashboard/MobileNav'
import { NotificationListener } from '@/components/dashboard/NotificationListener'
import { getCurrentUserProfile } from '@/lib/actions/profile'
import { cn } from '@/lib/utils'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentUserProfile()
  const themeClass =
    profile?.role === 'PSYCHOLOGIST'
      ? 'professional-theme'
      : profile?.role === 'ADMIN'
        ? 'admin-theme'
        : ''

  return (
    <div className={cn('min-h-screen bg-slate-50/50', themeClass)}>
      <a href="#main-content" className="skip-to-content">
        Ir para o conteúdo principal
      </a>

      {/* Realtime notification toasts for ALL users (Psychologist, Patient, Admin) */}
      {profile && <NotificationListener />}

      <DashboardSidebar initialProfile={profile} />

      <div className="lg:pl-64 flex flex-col min-h-screen">
        <MobileNav />

        <main id="main-content" className="flex-1 container py-8 space-y-6" role="main">
          {children}
        </main>

        <Footer />
      </div>
    </div>
  )
}
