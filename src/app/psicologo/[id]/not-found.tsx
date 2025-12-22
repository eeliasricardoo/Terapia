import { Metadata } from 'next'

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-slate-900 mb-4">404</h1>
                <h2 className="text-2xl font-semibold text-slate-700 mb-2">Psicólogo não encontrado</h2>
                <p className="text-slate-600 mb-8">
                    O perfil que você está procurando não existe ou foi removido.
                </p>
                <a
                    href="/busca"
                    className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Voltar para busca
                </a>
            </div>
        </div>
    )
}

export const metadata: Metadata = {
    title: 'Psicólogo não encontrado',
}
