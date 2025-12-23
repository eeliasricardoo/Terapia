import { getCurrentUserProfile } from "@/lib/actions/profile"
import { ProfileForm } from "./profile-form"

export default async function ProfilePage() {
    // Fetch real user data from Supabase
    const result = await getCurrentUserProfile()

    console.log('=== PROFILE PAGE DEBUG ===')
    console.log('Result:', result)

    if (!result) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Meu Perfil</h1>
                    <p className="text-muted-foreground">Não foi possível carregar seu perfil. Por favor, faça login novamente.</p>
                    <p className="text-sm text-red-600 mt-4">Debug: Verifique o console do navegador para mais detalhes.</p>
                </div>
            </div>
        )
    }

    const { profile, email } = result

    const roleMap: Record<string, string> = {
        'PATIENT': 'Paciente',
        'PSYCHOLOGIST': 'Psicólogo',
        'COMPANY': 'Empresa',
        'ADMIN': 'Administrador'
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Meu Perfil</h1>
                <p className="text-muted-foreground">Gerencie suas informações pessoais e segurança.</p>
            </div>

            <ProfileForm
                initialProfile={profile}
                userEmail={email}
                roleDisplay={roleMap[profile.role] || profile.role}
            />
        </div>
    )
}
