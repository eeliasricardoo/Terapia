"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

interface PlanDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    editingPlanId: string | null
    newPlan: { name: string; sessions: string; price: string }
    setNewPlan: (plan: { name: string; sessions: string; price: string }) => void
    onSave: () => void
}

export function PlanDialog({ open, onOpenChange, editingPlanId, newPlan, setNewPlan, onSave }: PlanDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{editingPlanId ? 'Editar Pacote' : 'Novo Pacote de Sessões'}</DialogTitle>
                    <DialogDescription>{editingPlanId ? 'Atualize as informações do pacote.' : 'Crie um pacote para vender múltiplas sessões de uma vez.'}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Nome do Pacote</Label>
                        <Input placeholder="Ex: Pacote Mensal" value={newPlan.name} onChange={e => setNewPlan({ ...newPlan, name: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Nº Sessões</Label>
                            <Input type="number" placeholder="4" value={newPlan.sessions} onChange={e => setNewPlan({ ...newPlan, sessions: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Preço Total (R$)</Label>
                            <Input type="number" placeholder="550.00" value={newPlan.price} onChange={e => setNewPlan({ ...newPlan, price: e.target.value })} />
                        </div>
                    </div>
                    <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100">
                        Valor por sessão neste pacote: <span className="font-bold">R$ {newPlan.price && newPlan.sessions ? (parseFloat(newPlan.price) / parseInt(newPlan.sessions)).toFixed(2) : "0.00"}</span>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={onSave} className="bg-slate-900 text-white">
                        {editingPlanId ? 'Salvar Alterações' : 'Criar Pacote'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
