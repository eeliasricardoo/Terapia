"use client"

import { useState } from "react"
import { toast } from "sonner"

export type Plan = {
    id: string
    name: string
    sessions: number
    price: number
    discount: number
    active: boolean
}

export type Coupon = {
    id: string
    code: string
    type: 'percentage' | 'fixed'
    value: number
    maxUses?: number
    used: number
    expiresAt?: string
    active: boolean
}

const INITIAL_PLANS: Plan[] = [
    { id: "1", name: "Pacote Mensal", sessions: 4, price: 500.00, discount: 10, active: true },
    { id: "2", name: "Pacote Trimestral", sessions: 12, price: 1400.00, discount: 15, active: true },
]

const INITIAL_COUPONS: Coupon[] = [
    { id: "1", code: "PRIMEIRA10", type: 'percentage', value: 10, maxUses: 100, used: 45, active: true },
    { id: "2", code: "VOLTA50", type: 'fixed', value: 50, expiresAt: '2026-12-31', used: 2, active: true },
]

export function useServicesConfig() {
    const [sessionPrice, setSessionPrice] = useState("150.00")
    const [sessionDuration, setSessionDuration] = useState("50")
    const [plans, setPlans] = useState<Plan[]>(INITIAL_PLANS)
    const [coupons, setCoupons] = useState<Coupon[]>(INITIAL_COUPONS)

    const [isPlanDialogOpen, setIsPlanDialogOpen] = useState(false)
    const [isCouponDialogOpen, setIsCouponDialogOpen] = useState(false)

    const [newPlan, setNewPlan] = useState({ name: "", sessions: "4", price: "" })
    const [editingPlanId, setEditingPlanId] = useState<string | null>(null)
    const [newCoupon, setNewCoupon] = useState({ code: "", type: "percentage", value: "", limit: "" })

    const handleSaveGeneral = () => {
        toast.success("Configurações atualizadas!", { description: "Valor e duração da sessão salvos com sucesso." })
    }

    const handleSavePlan = () => {
        const price = parseFloat(newPlan.price)
        const sessions = parseInt(newPlan.sessions)
        const singlePrice = parseFloat(sessionPrice)
        const fullPrice = singlePrice * sessions
        const discount = Math.round(((fullPrice - price) / fullPrice) * 100)

        if (editingPlanId) {
            setPlans(plans.map(p => p.id === editingPlanId ? {
                ...p, name: newPlan.name, sessions, price, discount: discount > 0 ? discount : 0
            } : p))
            toast.success("Pacote atualizado com sucesso!")
        } else {
            const plan: Plan = {
                id: Math.random().toString(), name: newPlan.name, sessions, price, discount: discount > 0 ? discount : 0, active: true
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
        setNewPlan({ name: plan.name, sessions: plan.sessions.toString(), price: plan.price.toString() })
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
            used: 0, active: true
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

    return {
        sessionPrice, setSessionPrice,
        sessionDuration, setSessionDuration,
        plans, coupons,
        dialogs: {
            isPlanDialogOpen, setIsPlanDialogOpen,
            isCouponDialogOpen, setIsCouponDialogOpen,
            handleOpenNewPlanDialog
        },
        forms: {
            newPlan, setNewPlan, editingPlanId,
            newCoupon, setNewCoupon
        },
        handlers: {
            handleSaveGeneral, handleSavePlan, handleEditPlan,
            handleTogglePlan, handleDeletePlan, handleAddCoupon,
            handleToggleCoupon, handleDeleteCoupon
        }
    }
}
