'use client'

import { Star } from 'lucide-react'

export function ReviewsSection() {
  return (
    <section className="bg-white rounded-2xl p-6 md:p-8 border border-border shadow-sm space-y-6">
      <h2 className="text-xl font-bold text-foreground">Opiniões de pacientes</h2>
      <div className="text-center py-10 bg-muted/30 rounded-xl border border-dashed border-border">
        <Star className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
        <p className="text-muted-foreground text-sm">
          Este profissional ainda não recebeu avaliações escritas.
        </p>
      </div>
    </section>
  )
}
