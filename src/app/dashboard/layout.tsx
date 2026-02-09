import { Footer } from "@/components/layout/Footer"
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar"
import { MobileNav } from "@/components/dashboard/MobileNav"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen flex flex-col bg-slate-50/50">
            <MobileNav />

            <div className="flex-1 container py-8 flex flex-col lg:flex-row gap-8">
                <DashboardSidebar className="hidden lg:flex" />
                <main className="flex-1 space-y-6">
                    {children}
                </main>
            </div>
            <Footer />
        </div>
    )
}
