import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AuthTestPage() {
    const supabase = await createClient()

    const { data: { user }, error } = await supabase.auth.getUser()

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
                <h1 className="text-3xl font-bold mb-6">Status de Autenticação</h1>

                <div className="space-y-4">
                    <div>
                        <h2 className="text-xl font-semibold mb-2">Usuário Autenticado:</h2>
                        <pre className="bg-slate-100 p-4 rounded overflow-auto">
                            {user ? JSON.stringify(user, null, 2) : 'Nenhum usuário autenticado'}
                        </pre>
                    </div>

                    {error && (
                        <div>
                            <h2 className="text-xl font-semibold mb-2 text-red-600">Erro:</h2>
                            <pre className="bg-red-50 p-4 rounded overflow-auto text-red-800">
                                {JSON.stringify(error, null, 2)}
                            </pre>
                        </div>
                    )}

                    <div className="flex gap-4 mt-6">
                        {!user && (
                            <>
                                <a
                                    href="/login/paciente"
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    Fazer Login
                                </a>
                                <a
                                    href="/cadastro/paciente"
                                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                                >
                                    Criar Conta
                                </a>
                            </>
                        )}
                        {user && (
                            <a
                                href="/dashboard/perfil"
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                Ir para Perfil
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
