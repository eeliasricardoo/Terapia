import { getCurrentUserProfile } from "@/lib/actions/profile"
import { DashboardSidebar } from "./DashboardSidebar"

export async function DashboardSidebarWrapper({ className }: { className?: string }) {
    const result = await getCurrentUserProfile()

    const userData = result ? {
        name: result.profile.full_name || 'Usuário',
        email: result.email,
        role: result.profile.role,
        avatar: result.profile.avatar_url
    } : {
        name: 'Usuário',
        email: '',
        role: 'PATIENT' as const,
        avatar: null
    }

    return <DashboardSidebar className={className} userData={userData} />
}
