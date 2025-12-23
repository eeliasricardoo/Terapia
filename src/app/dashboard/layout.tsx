import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { DashboardSidebarWrapper } from "@/components/dashboard/DashboardSidebarWrapper"
import { MobileNavWrapper } from "@/components/dashboard/MobileNavWrapper"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen flex flex-col bg-slate-50/50">
            <MobileNavWrapper />

            <div className="flex-1 container py-8 flex flex-col lg:flex-row gap-8">
                <DashboardSidebarWrapper className="hidden lg:flex" />
                <main className="flex-1 space-y-6">
                    {children}
                </main>
            </div>
            <Footer />
        </div>
    )
}
