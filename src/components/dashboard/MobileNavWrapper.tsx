import { getCurrentUserProfile } from "@/lib/actions/profile"
import { MobileNav } from "./MobileNav"

export async function MobileNavWrapper() {
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

    return <MobileNav userData={userData} />
}
