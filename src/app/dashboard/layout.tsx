import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen flex flex-col bg-slate-50/50">
            <Navbar isLoggedIn={true} userRole="client" />

            <div className="flex-1 container py-8 flex flex-col lg:flex-row gap-8">
                <DashboardSidebar />
                <main className="flex-1 space-y-6">
                    {children}
                </main>
            </div>
            <Footer />
        </div>
    )
}
