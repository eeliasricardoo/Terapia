'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { getServicesConfig, saveGeneralConfig } from '@/lib/actions/services-config'

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

export function useServicesConfig() {
  const [sessionPrice, setSessionPrice] = useState('')
  const [sessionDuration, setSessionDuration] = useState('50')
  const [averagePlatformPrice, setAveragePlatformPrice] = useState<string | null>(null)
  const [monthlyPlanEnabled, setMonthlyPlanEnabled] = useState(false)
  const [monthlyPlanSessions, setMonthlyPlanSessions] = useState(4)
  const [monthlyPlanDiscount, setMonthlyPlanDiscount] = useState(20)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const [plans, setPlans] = useState<Plan[]>([])
  const [coupons, setCoupons] = useState<Coupon[]>([])

  const [isPlanDialogOpen, setIsPlanDialogOpen] = useState(false)
  const [isCouponDialogOpen, setIsCouponDialogOpen] = useState(false)
  const [isFetchingCoupons, setIsFetchingCoupons] = useState(false)
  const [isSavingPlan, setIsSavingPlan] = useState(false)

  const [newPlan, setNewPlan] = useState({ name: '', sessions: '4', price: '' })
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null)
  const [newCoupon, setNewCoupon] = useState<{
    code: string
    type: 'percentage' | 'fixed'
    value: string
    limit: string
  }>({ code: '', type: 'percentage', value: '', limit: '' })

  // ─── Load config from DB ──────────────────────────────────────
  const loadConfig = useCallback(async () => {
    setIsLoading(true)
    const result = await getServicesConfig()
    if (result.success) {
      setSessionPrice(result.data.sessionPrice)
      setSessionDuration(result.data.sessionDuration)
      setAveragePlatformPrice(result.data.averagePlatformPrice)
      setMonthlyPlanEnabled(result.data.monthlyPlanEnabled)
      setMonthlyPlanSessions(result.data.monthlyPlanSessions)
      setMonthlyPlanDiscount(result.data.monthlyPlanDiscount)
    }
    setIsLoading(false)
  }, [])

  const loadPlans = useCallback(async () => {
    const { getPlansAction } = await import('@/lib/actions/plans')
    const result = await getPlansAction()
    if (result.success) {
      setPlans(result.data)
    }
  }, [])

  const loadCoupons = useCallback(async () => {
    setIsFetchingCoupons(true)
    const { getCouponsAction } = await import('@/lib/actions/coupons')
    const result = await getCouponsAction()
    if (result.success) {
      setCoupons(result.data)
    }
    setIsFetchingCoupons(false)
  }, [])

  useEffect(() => {
    loadConfig()
    loadPlans()
    loadCoupons()
  }, [loadConfig, loadPlans, loadCoupons])

  // ─── Save General Config ──────────────────────────────────────
  const handleSaveGeneral = async () => {
    setIsSaving(true)
    const result = await saveGeneralConfig({
      sessionPrice,
      sessionDuration,
      monthlyPlan: {
        enabled: monthlyPlanEnabled,
        sessions: monthlyPlanSessions,
        discount: monthlyPlanDiscount,
      },
    })
    setIsSaving(false)

    if (result.success) {
      toast.success('Configurações atualizadas!', {
        description: 'Valor e duração da sessão salvos com sucesso.',
      })
    } else {
      toast.error('Erro ao salvar', {
        description: result.error,
      })
    }
  }

  // ─── Plans Handlers ───────────────────────────────────────────
  const handleSavePlan = async () => {
    const price = parseFloat(newPlan.price)
    const sessions = parseInt(newPlan.sessions)

    if (!newPlan.name.trim()) {
      toast.error('Nome do pacote é obrigatório')
      return
    }
    if (!sessions || sessions <= 0) {
      toast.error('Número de sessões deve ser maior que zero')
      return
    }
    if (!price || price <= 0) {
      toast.error('Preço deve ser maior que zero')
      return
    }

    const singlePrice = parseFloat(sessionPrice)
    const fullPrice = singlePrice * sessions
    const discount = fullPrice > 0 ? Math.round(((fullPrice - price) / fullPrice) * 100) : 0
    const discountValue = discount > 0 ? discount : 0

    setIsSavingPlan(true)

    if (editingPlanId) {
      const { updatePlanAction } = await import('@/lib/actions/plans')
      const result = await updatePlanAction({
        id: editingPlanId,
        data: { name: newPlan.name, sessions, price, discount: discountValue },
      })

      if (result.success) {
        setPlans(
          plans.map((p) =>
            p.id === editingPlanId
              ? { ...p, name: newPlan.name, sessions, price, discount: discountValue }
              : p
          )
        )
        toast.success('Pacote atualizado com sucesso!')
      } else {
        toast.error('Erro ao atualizar pacote', { description: result.error })
      }
    } else {
      const { createPlanAction } = await import('@/lib/actions/plans')
      const result = await createPlanAction({
        name: newPlan.name,
        sessions,
        price,
        discount: discountValue,
      })

      if (result.success) {
        setPlans([...plans, result.data])
        toast.success('Novo pacote criado!')
      } else {
        toast.error('Erro ao criar pacote', { description: result.error })
      }
    }

    setIsSavingPlan(false)
    setIsPlanDialogOpen(false)
    setNewPlan({ name: '', sessions: '4', price: '' })
    setEditingPlanId(null)
  }

  const handleEditPlan = (plan: Plan) => {
    setEditingPlanId(plan.id)
    setNewPlan({
      name: plan.name,
      sessions: plan.sessions.toString(),
      price: plan.price.toString(),
    })
    setIsPlanDialogOpen(true)
  }

  const handleOpenNewPlanDialog = () => {
    setEditingPlanId(null)
    setNewPlan({ name: '', sessions: '4', price: '' })
    setIsPlanDialogOpen(true)
  }

  const handleTogglePlan = async (id: string) => {
    const plan = plans.find((p) => p.id === id)
    if (!plan) return

    const { togglePlanAction } = await import('@/lib/actions/plans')
    const result = await togglePlanAction({ id, active: !plan.active })

    if (result.success) {
      setPlans(plans.map((p) => (p.id === id ? { ...p, active: !p.active } : p)))
    } else {
      toast.error('Erro ao atualizar pacote', { description: result.error })
    }
  }

  const handleDeletePlan = async (id: string) => {
    const { deletePlanAction } = await import('@/lib/actions/plans')
    const result = await deletePlanAction(id)

    if (result.success) {
      setPlans(plans.filter((p) => p.id !== id))
      toast.success('Pacote removido.')
    } else {
      toast.error('Erro ao excluir pacote', { description: result.error })
    }
  }

  // ─── Coupons Handlers ───────────────────────────────────────
  const handleAddCoupon = async () => {
    const { createCouponAction: createCoupon } = await import('@/lib/actions/coupons')
    const result = await createCoupon({
      code: newCoupon.code,
      type: newCoupon.type,
      value: parseFloat(newCoupon.value),
      maxUses: newCoupon.limit ? parseInt(newCoupon.limit) : undefined,
    })

    if (result.success) {
      toast.success('Cupom criado com sucesso!')
      loadCoupons()
      setIsCouponDialogOpen(false)
      setNewCoupon({ code: '', type: 'percentage' as const, value: '', limit: '' })
    } else {
      toast.error('Erro ao criar cupom', { description: result.error })
    }
  }

  const handleToggleCoupon = async (id: string) => {
    const coupon = coupons.find((c) => c.id === id)
    if (!coupon) return

    const { toggleCouponAction } = await import('@/lib/actions/coupons')
    const result = await toggleCouponAction({ id, active: !coupon.active })

    if (result.success) {
      setCoupons(coupons.map((c) => (c.id === id ? { ...c, active: !c.active } : c)))
    } else {
      toast.error('Erro ao atualizar cupom', { description: result.error })
    }
  }

  const handleDeleteCoupon = async (id: string) => {
    const { deleteCouponAction } = await import('@/lib/actions/coupons')
    const result = await deleteCouponAction(id)

    if (result.success) {
      setCoupons(coupons.filter((c) => c.id !== id))
      toast.success('Cupom removido.')
    } else {
      toast.error('Erro ao excluir cupom', { description: result.error })
    }
  }

  return {
    sessionPrice,
    setSessionPrice,
    sessionDuration,
    setSessionDuration,
    averagePlatformPrice,
    monthlyPlanEnabled,
    setMonthlyPlanEnabled,
    monthlyPlanSessions,
    setMonthlyPlanSessions,
    monthlyPlanDiscount,
    setMonthlyPlanDiscount,
    isLoading,
    isSaving,
    isSavingPlan,
    plans,
    coupons,
    dialogs: {
      isPlanDialogOpen,
      setIsPlanDialogOpen,
      isCouponDialogOpen,
      setIsCouponDialogOpen,
      handleOpenNewPlanDialog,
    },
    forms: {
      newPlan,
      setNewPlan,
      editingPlanId,
      newCoupon,
      setNewCoupon,
    },
    handlers: {
      handleSaveGeneral,
      handleSavePlan,
      handleEditPlan,
      handleTogglePlan,
      handleDeletePlan,
      handleAddCoupon,
      handleToggleCoupon,
      handleDeleteCoupon,
    },
  }
}
