import { Footer } from "@/components/layout/Footer"
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar"
import { MobileNav } from "@/components/dashboard/MobileNav"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-slate-50/50">
            <DashboardSidebar />

            <div className="lg:pl-64 flex flex-col min-h-screen">
                <MobileNav />

                <main className="flex-1 container py-8 space-y-6">
                    {children}
                </main>

                <Footer />
            </div>
        </div>
    )
}
