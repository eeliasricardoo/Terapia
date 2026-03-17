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
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Plans and coupons stay client-side for now (future: persist to DB)
  const [plans, setPlans] = useState<Plan[]>([])
  const [coupons, setCoupons] = useState<Coupon[]>([])

  const [isPlanDialogOpen, setIsPlanDialogOpen] = useState(false)
  const [isCouponDialogOpen, setIsCouponDialogOpen] = useState(false)
  const [isFetchingCoupons, setIsFetchingCoupons] = useState(false)

  const [newPlan, setNewPlan] = useState({ name: '', sessions: '4', price: '' })
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null)
  const [newCoupon, setNewCoupon] = useState({ code: '', type: 'percentage', value: '', limit: '' })

  // ─── Load config from DB ──────────────────────────────────────
  const loadConfig = useCallback(async () => {
    setIsLoading(true)
    const result = await getServicesConfig()
    if (result.success) {
      setSessionPrice(result.data.sessionPrice)
      setSessionDuration(result.data.sessionDuration)
      setAveragePlatformPrice(result.data.averagePlatformPrice)
    }
    setIsLoading(false)
  }, [])

  const loadCoupons = useCallback(async () => {
    setIsFetchingCoupons(true)
    const { getCoupons } = await import('@/lib/actions/coupons')
    const result = await getCoupons()
    if (result.success) {
      setCoupons(result.data)
    }
    setIsFetchingCoupons(false)
  }, [])

  useEffect(() => {
    loadConfig()
    loadCoupons()
  }, [loadConfig, loadCoupons])

  // ─── Save General Config ──────────────────────────────────────
  const handleSaveGeneral = async () => {
    setIsSaving(true)
    const result = await saveGeneralConfig(sessionPrice, sessionDuration)
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

  // ─── Plans Handlers (client-side for now) ─────────────────────
  const handleSavePlan = () => {
    const price = parseFloat(newPlan.price)
    const sessions = parseInt(newPlan.sessions)
    const singlePrice = parseFloat(sessionPrice)
    const fullPrice = singlePrice * sessions
    const discount = Math.round(((fullPrice - price) / fullPrice) * 100)

    if (editingPlanId) {
      setPlans(
        plans.map((p) =>
          p.id === editingPlanId
            ? {
                ...p,
                name: newPlan.name,
                sessions,
                price,
                discount: discount > 0 ? discount : 0,
              }
            : p
        )
      )
      toast.success('Pacote atualizado com sucesso!')
    } else {
      const plan: Plan = {
        id: Math.random().toString(),
        name: newPlan.name,
        sessions,
        price,
        discount: discount > 0 ? discount : 0,
        active: true,
      }
      setPlans([...plans, plan])
      toast.success('Novo pacote criado!')
    }
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

  const handleTogglePlan = (id: string) => {
    setPlans(plans.map((p) => (p.id === id ? { ...p, active: !p.active } : p)))
  }

  const handleDeletePlan = (id: string) => {
    setPlans(plans.filter((p) => p.id !== id))
    toast.success('Pacote removido.')
  }

  // ─── Coupons Handlers ───────────────────────────────────────
  const handleAddCoupon = async () => {
    const { createCoupon } = await import('@/lib/actions/coupons')
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
      setNewCoupon({ code: '', type: 'percentage', value: '', limit: '' })
    } else {
      toast.error('Erro ao criar cupom', { description: result.error })
    }
  }

  const handleToggleCoupon = async (id: string) => {
    const coupon = coupons.find((c) => c.id === id)
    if (!coupon) return

    const { toggleCoupon } = await import('@/lib/actions/coupons')
    const result = await toggleCoupon(id, !coupon.active)

    if (result.success) {
      setCoupons(coupons.map((c) => (c.id === id ? { ...c, active: !c.active } : c)))
    } else {
      toast.error('Erro ao atualizar cupom', { description: result.error })
    }
  }

  const handleDeleteCoupon = async (id: string) => {
    const { deleteCoupon } = await import('@/lib/actions/coupons')
    const result = await deleteCoupon(id)

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
    isLoading,
    isSaving,
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
