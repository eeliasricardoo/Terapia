"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tag, Trash2 } from "lucide-react"
import type { Coupon } from "../_hooks/use-services-config"

interface CouponsConfigProps {
    coupons: Coupon[]
    onToggle: (id: string) => void
    onDelete: (id: string) => void
    onCreateNew: () => void
}

export function CouponsConfig({ coupons, onToggle, onDelete, onCreateNew }: CouponsConfigProps) {
    return (
        <Card className="border border-slate-200 shadow-sm bg-white">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-lg">Cupons Ativos</CardTitle>
                    <CardDescription>Gerencie códigos promocionais para atrair novos pacientes.</CardDescription>
                </div>
                <Button onClick={onCreateNew} className="bg-slate-900 text-white shadow-sm">
                    <Tag className="h-4 w-4 mr-2" />
                    Criar Cupom
                </Button>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Código</TableHead>
                            <TableHead>Desconto</TableHead>
                            <TableHead>Usos</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {coupons.map((coupon) => (
                            <TableRow key={coupon.id}>
                                <TableCell className="font-mono font-bold text-slate-900">
                                    {coupon.code}
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="bg-slate-50 border-slate-200 text-slate-700">
                                        {coupon.type === 'percentage' ? `${coupon.value}%` : `R$ ${coupon.value.toFixed(2)}`} OFF
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-slate-600">
                                    {coupon.used} {coupon.maxUses ? `/ ${coupon.maxUses}` : ''}
                                </TableCell>
                                <TableCell>
                                    <Switch
                                        checked={coupon.active}
                                        onCheckedChange={() => onToggle(coupon.id)}
                                        className="data-[state=checked]:bg-emerald-500"
                                    />
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600" onClick={() => onDelete(coupon.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
