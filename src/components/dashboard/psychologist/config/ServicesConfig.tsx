"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import {
    Badge
} from "@/components/ui/badge"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from "@/components/ui/tabs"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Plus,
    Trash2,
    Tag,
    Package,
    Clock,
    DollarSign,
    Percent,
    Edit2,
    CalendarCheck,
    Check
} from "lucide-react"
import { toast } from "sonner"

// --- Types ---

type Plan = {
    id: string
    name: string
    sessions: number
    price: number
    discount: number // calculated discount percentage compared to single session
    active: boolean
}

type Coupon = {
    id: string
    code: string
    type: 'percentage' | 'fixed'
    value: number
    maxUses?: number
    used: number
    expiresAt?: string
    active: boolean
}

// --- Mock Data ---

const INITIAL_PLANS: Plan[] = [
    { id: "1", name: "Pacote Mensal", sessions: 4, price: 500.00, discount: 10, active: true },
    { id: "2", name: "Pacote Trimestral", sessions: 12, price: 1400.00, discount: 15, active: true },
]

const INITIAL_COUPONS: Coupon[] = [
    { id: "1", code: "PRIMEIRA10", type: 'percentage', value: 10, maxUses: 100, used: 45, active: true },
    { id: "2", code: "VOLTA50", type: 'fixed', value: 50, expiresAt: '2026-12-31', used: 2, active: true },
]

export function ServicesConfig() {
    // --- State ---
    const [sessionPrice, setSessionPrice] = useState("150.00")
    const [sessionDuration, setSessionDuration] = useState("50")
    const [plans, setPlans] = useState<Plan[]>(INITIAL_PLANS)
    const [coupons, setCoupons] = useState<Coupon[]>(INITIAL_COUPONS)

    // Dialog States
    const [isPlanDialogOpen, setIsPlanDialogOpen] = useState(false)
    const [isCouponDialogOpen, setIsCouponDialogOpen] = useState(false)

    // Form States (Simple controlled inputs for demo)
    const [newPlan, setNewPlan] = useState({ name: "", sessions: "4", price: "" })
    const [editingPlanId, setEditingPlanId] = useState<string | null>(null)
    const [newCoupon, setNewCoupon] = useState({ code: "", type: "percentage", value: "", limit: "" })

    // --- Handlers ---

    const handleSaveGeneral = () => {
        toast.success("Configurações atualizadas!", { description: "Valor e duração da sessão salvos com sucesso." })
    }

    const handleSavePlan = () => {
        const price = parseFloat(newPlan.price)
        const sessions = parseInt(newPlan.sessions)
        const singlePrice = parseFloat(sessionPrice)

        // Calculate theoretical full price
        const fullPrice = singlePrice * sessions
        // Calculate discount percentage
        const discount = Math.round(((fullPrice - price) / fullPrice) * 100)

        if (editingPlanId) {
            // Update existing plan
            setPlans(plans.map(p => p.id === editingPlanId ? {
                ...p,
                name: newPlan.name,
                sessions,
                price,
                discount: discount > 0 ? discount : 0
            } : p))
            toast.success("Pacote atualizado com sucesso!")
        } else {
            // Create new plan
            const plan: Plan = {
                id: Math.random().toString(),
                name: newPlan.name,
                sessions,
                price,
                discount: discount > 0 ? discount : 0,
                active: true
            }
            setPlans([...plans, plan])
            toast.success("Novo pacote criado!")
        }

        setIsPlanDialogOpen(false)
        setNewPlan({ name: "", sessions: "4", price: "" })
        setEditingPlanId(null)
    }

    const handleEditPlan = (plan: Plan) => {
        setEditingPlanId(plan.id)
        setNewPlan({
            name: plan.name,
            sessions: plan.sessions.toString(),
            price: plan.price.toString()
        })
        setIsPlanDialogOpen(true)
    }

    const handleOpenNewPlanDialog = () => {
        setEditingPlanId(null)
        setNewPlan({ name: "", sessions: "4", price: "" })
        setIsPlanDialogOpen(true)
    }

    const handleTogglePlan = (id: string) => {
        setPlans(plans.map(p => p.id === id ? { ...p, active: !p.active } : p))
    }

    const handleDeletePlan = (id: string) => {
        setPlans(plans.filter(p => p.id !== id))
        toast.success("Pacote removido.")
    }

    const handleAddCoupon = () => {
        const coupon: Coupon = {
            id: Math.random().toString(),
            code: newCoupon.code.toUpperCase(),
            type: newCoupon.type as 'percentage' | 'fixed',
            value: parseFloat(newCoupon.value),
            maxUses: newCoupon.limit ? parseInt(newCoupon.limit) : undefined,
            used: 0,
            active: true
        }

        setCoupons([...coupons, coupon])
        setIsCouponDialogOpen(false)
        setNewCoupon({ code: "", type: "percentage", value: "", limit: "" })
        toast.success("Cupom criado com sucesso!")
    }

    const handleToggleCoupon = (id: string) => {
        setCoupons(coupons.map(c => c.id === id ? { ...c, active: !c.active } : c))
    }

    const handleDeleteCoupon = (id: string) => {
        setCoupons(coupons.filter(c => c.id !== id))
        toast.success("Cupom removido.")
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-20">
            <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">Serviços & Tarifas</h2>
                <p className="text-slate-500">Defina seus preços, crie pacotes promocionais e gerencie cupons de desconto.</p>
            </div>

            <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full max-w-md grid-cols-3 mb-8">
                    <TabsTrigger value="general">Sessão Avulsa</TabsTrigger>
                    <TabsTrigger value="plans">Pacotes</TabsTrigger>
                    <TabsTrigger value="coupons">Cupons</TabsTrigger>
                </TabsList>

                {/* --- TAB 1: SESSÃO AVULSA --- */}
                <TabsContent value="general" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <Card className="border border-slate-200 shadow-sm bg-white">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <DollarSign className="h-5 w-5 text-blue-600" />
                                Configuração Base
                            </CardTitle>
                            <CardDescription>
                                Este é o valor padrão que será exibido no seu perfil para agendamentos avulsos.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 max-w-2xl">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="price" className="text-slate-600">Valor da Sessão (R$)</Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">R$</span>
                                        <Input
                                            id="price"
                                            value={sessionPrice}
                                            onChange={(e) => setSessionPrice(e.target.value)}
                                            className="pl-10 text-lg font-semibold border-slate-200 bg-slate-50 focus:bg-white"
                                        />
                                    </div>
                                    <p className="text-xs text-slate-400">O valor médio na plataforma é R$ 180,00</p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="duration" className="text-slate-600">Duração (Minutos)</Label>
                                    <Select value={sessionDuration} onValueChange={setSessionDuration}>
                                        <SelectTrigger id="duration" className="bg-slate-50 border-slate-200">
                                            <SelectValue placeholder="Selecione" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="30">30 minutos</SelectItem>
                                            <SelectItem value="45">45 minutos</SelectItem>
                                            <SelectItem value="50">50 minutos (Padrão)</SelectItem>
                                            <SelectItem value="60">60 minutos</SelectItem>
                                            <SelectItem value="90">90 minutos</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="bg-slate-50/50 border-t border-slate-100 p-6 flex justify-end">
                            <Button onClick={handleSaveGeneral} className="bg-slate-900 text-white shadow-sm hover:bg-slate-800">
                                <Check className="h-4 w-4 mr-2" />
                                Salvar Alterações
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                {/* --- TAB 2: PACOTES --- */}
                <TabsContent value="plans" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex flex-col gap-6">
                        <div className="flex justify-between items-center bg-blue-50 p-6 rounded-xl border border-blue-100">
                            <div>
                                <h3 className="font-semibold text-blue-900">Ofereça Pacotes Mensais</h3>
                                <p className="text-sm text-blue-700 mt-1 max-w-xl">
                                    Pacotes aumentam a retenção de pacientes. Crie opções com 4 ou mais sessões com um leve desconto.
                                </p>
                            </div>
                            <Dialog open={isPlanDialogOpen} onOpenChange={setIsPlanDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button
                                        onClick={handleOpenNewPlanDialog}
                                        className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-200"
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Criar Novo Pacote
                                    </Button>
                                </DialogTrigger>
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
                                        <Button onClick={handleSavePlan} className="bg-slate-900 text-white">
                                            {editingPlanId ? 'Salvar Alterações' : 'Criar Pacote'}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
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
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600" onClick={() => handleEditPlan(plan)}>
                                                    <Edit2 className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-blue-600" onClick={() => handleTogglePlan(plan.id)}>
                                                    <Switch checked={plan.active} className="pointer-events-none scale-75" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600" onClick={() => handleDeletePlan(plan.id)}>
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
                </TabsContent>

                {/* --- TAB 3: CUPONS --- */}
                <TabsContent value="coupons" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <Card className="border border-slate-200 shadow-sm bg-white">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-lg">Cupons Ativos</CardTitle>
                                <CardDescription>Gerencie códigos promocionais para atrair novos pacientes.</CardDescription>
                            </div>
                            <Dialog open={isCouponDialogOpen} onOpenChange={setIsCouponDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button className="bg-slate-900 text-white shadow-sm">
                                        <Tag className="h-4 w-4 mr-2" />
                                        Criar Cupom
                                    </Button>
                                </DialogTrigger>
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
                                        <Button onClick={handleAddCoupon} className="bg-slate-900 text-white">Criar Cupom</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
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
                                                    onCheckedChange={() => handleToggleCoupon(coupon.id)}
                                                    className="data-[state=checked]:bg-emerald-500"
                                                />
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600" onClick={() => handleDeleteCoupon(coupon.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
