"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Plus, Edit2, Trash2, Check } from "lucide-react"
import type { Plan } from "../_hooks/use-services-config"

interface PlansConfigProps {
    plans: Plan[]
    onEdit: (plan: Plan) => void
    onToggle: (id: string) => void
    onDelete: (id: string) => void
    onCreateNew: () => void
}

export function PlansConfig({ plans, onEdit, onToggle, onDelete, onCreateNew }: PlansConfigProps) {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center bg-blue-50 p-6 rounded-xl border border-blue-100">
                <div>
                    <h3 className="font-semibold text-blue-900">Ofereça Pacotes Mensais</h3>
                    <p className="text-sm text-blue-700 mt-1 max-w-xl">
                        Pacotes aumentam a retenção de pacientes. Crie opções com 4 ou mais sessões com um leve desconto.
                    </p>
                </div>
                <Button
                    onClick={onCreateNew}
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-200"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Novo Pacote
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map((plan) => (
                    <Card key={plan.id} className={`border-2 transition-all duration-200 ${plan.active ? 'border-slate-200 shadow-sm hover:border-blue-200 hover:shadow-md' : 'border-slate-100 bg-slate-50 opacity-70'}`}>
                        <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                                <Badge variant={plan.active ? "default" : "secondary"} className="mb-2">
                                    {plan.sessions} Sessões
                                </Badge>
                                <div className="flex gap-1">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600" onClick={() => onEdit(plan)}>
                                        <Edit2 className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-blue-600" onClick={() => onToggle(plan.id)}>
                                        <Switch checked={plan.active} className="pointer-events-none scale-75" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600" onClick={() => onDelete(plan.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            <CardTitle className="text-xl">{plan.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-baseline gap-2 mb-4">
                                <span className="text-3xl font-bold tracking-tight text-slate-900">R$ {plan.price.toFixed(0)}</span>
                                {plan.discount > 0 && (
                                    <Badge variant="outline" className="text-emerald-600 bg-emerald-50 border-emerald-200">
                                        -{plan.discount}% OFF
                                    </Badge>
                                )}
                            </div>
                            <p className="text-sm text-slate-500 flex items-center gap-2">
                                <Check className="h-4 w-4 text-emerald-500" />
                                R$ {(plan.price / plan.sessions).toFixed(2)} por sessão
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
