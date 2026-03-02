"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"

interface CouponDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    newCoupon: { code: string; type: string; value: string; limit: string }
    setNewCoupon: (coupon: { code: string; type: string; value: string; limit: string }) => void
    onSave: () => void
}

export function CouponDialog({ open, onOpenChange, newCoupon, setNewCoupon, onSave }: CouponDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Novo Cupom de Desconto</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Código do Cupom</Label>
                        <Input placeholder="Ex: PRIMEIRA10" className="uppercase" value={newCoupon.code} onChange={e => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Tipo de Desconto</Label>
                            <Select value={newCoupon.type} onValueChange={v => setNewCoupon({ ...newCoupon, type: v })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="percentage">Porcentagem (%)</SelectItem>
                                    <SelectItem value="fixed">Valor Fixo (R$)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Valor do Desconto</Label>
                            <Input type="number" placeholder={newCoupon.type === 'percentage' ? "10" : "50.00"} value={newCoupon.value} onChange={e => setNewCoupon({ ...newCoupon, value: e.target.value })} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Limite de Usos (Opcional)</Label>
                        <Input type="number" placeholder="Ex: 50" value={newCoupon.limit} onChange={e => setNewCoupon({ ...newCoupon, limit: e.target.value })} />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={onSave} className="bg-slate-900 text-white">Criar Cupom</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
