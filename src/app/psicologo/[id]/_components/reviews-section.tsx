"use client"

import { Star } from "lucide-react"

export function ReviewsSection() {
    return (
        <section className="bg-white rounded-2xl p-6 md:p-8 border border-slate-100 shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-slate-900">Opiniões de pacientes</h2>
            <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <Star className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-500">Este profissional ainda não recebeu avaliações escritas.</p>
            </div>
        </section>
    )
}
