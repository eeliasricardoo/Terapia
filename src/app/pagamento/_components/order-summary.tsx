"use client"

import { Card, CardContent } from "@/components/ui/card"

interface OrderSummaryProps {
    doctorName: string
    date: string | null
    time: string | null
    price: string
    psychTimezone: string
}

export function OrderSummary({ doctorName, date, time, price, psychTimezone }: OrderSummaryProps) {
    return (
        <div>
            <h2 className="text-xl font-semibold mb-6 text-slate-900">Resumo da sua compra</h2>
            <Card className="overflow-hidden border-none shadow-lg">
                <div className="h-48 bg-gradient-to-br from-blue-500 to-blue-700 relative">
                    <div className="absolute inset-0 bg-black/10" />
                </div>
                <CardContent className="p-6">
                    <h3 className="font-bold text-xl mb-6 text-slate-900">Sessão de Terapia Individual</h3>

                    <div className="space-y-4 text-sm">
                        <div className="flex justify-between py-2 border-b border-slate-100">
                            <span className="text-slate-500">Profissional:</span>
                            <span className="font-medium text-slate-900">{doctorName}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-slate-100">
                            <span className="text-slate-500">Data e Hora:</span>
                            <span className="font-medium text-slate-900">{date || "15 de Outubro, 2024"} às {time || "09:00"}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-slate-100">
                            <span className="text-slate-500">Fuso Horário:</span>
                            <span className="font-medium text-slate-900">{psychTimezone.split('/')[1]?.replace('_', ' ')}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-slate-100">
                            <span className="text-slate-500">Duração:</span>
                            <span className="font-medium text-slate-900">50 minutos</span>
                        </div>
                    </div>

                    <div className="flex justify-between items-center mt-8 pt-4 border-t border-slate-100">
                        <span className="font-bold text-lg text-slate-900">Total a pagar:</span>
                        <span className="font-extrabold text-2xl text-blue-600">{price}</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
