import { RoleSelection } from "@/components/auth/RoleSelection"

export default function RegistrationPage() {
    return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center p-4 space-y-8">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold">Como você quer criar a sua conta?</h1>
                <p className="text-muted-foreground">Selecione a opção que deseja criar a sua conta:</p>
            </div>
            <RoleSelection />
        </div>
    )
}
