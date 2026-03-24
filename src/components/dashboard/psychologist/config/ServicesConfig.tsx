'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useServicesConfig } from './_hooks/use-services-config'
import { GeneralConfig } from './_components/general-config'
import { PlansConfig } from './_components/plans-config'
import { PlanDialog } from './_components/plan-dialog'
import { CouponsConfig } from './_components/coupons-config'
import { CouponDialog } from './_components/coupon-dialog'
import { Loader2, DollarSign, Package, Tag } from 'lucide-react'

export function ServicesConfig() {
  const {
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
    dialogs,
    forms,
    handlers,
  } = useServicesConfig()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 text-slate-300 animate-spin" />
      </div>
    )
  }

  const activePlans = plans.filter((p) => p.active).length
  const activeCoupons = coupons.filter((c) => c.active).length

  return (
    <div className="max-w-5xl mx-auto pb-20 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Serviços &amp; Tarifas</h1>
        <p className="text-sm text-slate-500 mt-1">
          Defina seus preços, crie pacotes e gerencie cupons.
        </p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="h-auto p-1 bg-slate-100 rounded-xl w-full max-w-sm grid grid-cols-3 gap-1 mb-8">
          <TabsTrigger
            value="general"
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-1.5 text-xs font-medium py-2"
          >
            <DollarSign className="h-3.5 w-3.5" />
            Sessão
          </TabsTrigger>
          <TabsTrigger
            value="plans"
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-1.5 text-xs font-medium py-2"
          >
            <Package className="h-3.5 w-3.5" />
            Pacotes
            {activePlans > 0 && (
              <span className="ml-0.5 h-4 w-4 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold flex items-center justify-center">
                {activePlans}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="coupons"
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-1.5 text-xs font-medium py-2"
          >
            <Tag className="h-3.5 w-3.5" />
            Cupons
            {activeCoupons > 0 && (
              <span className="ml-0.5 h-4 w-4 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold flex items-center justify-center">
                {activeCoupons}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="general"
          className="animate-in fade-in slide-in-from-bottom-1 duration-200"
        >
          <GeneralConfig
            sessionPrice={sessionPrice}
            setSessionPrice={setSessionPrice}
            sessionDuration={sessionDuration}
            setSessionDuration={setSessionDuration}
            averagePlatformPrice={averagePlatformPrice}
            monthlyPlanEnabled={monthlyPlanEnabled}
            setMonthlyPlanEnabled={setMonthlyPlanEnabled}
            monthlyPlanSessions={monthlyPlanSessions}
            setMonthlyPlanSessions={setMonthlyPlanSessions}
            monthlyPlanDiscount={monthlyPlanDiscount}
            setMonthlyPlanDiscount={setMonthlyPlanDiscount}
            isSaving={isSaving}
            onSave={handlers.handleSaveGeneral}
          />
        </TabsContent>

        <TabsContent
          value="plans"
          className="animate-in fade-in slide-in-from-bottom-1 duration-200"
        >
          <PlansConfig
            plans={plans}
            onEdit={handlers.handleEditPlan}
            onToggle={handlers.handleTogglePlan}
            onDelete={handlers.handleDeletePlan}
            onCreateNew={dialogs.handleOpenNewPlanDialog}
          />
          <PlanDialog
            open={dialogs.isPlanDialogOpen}
            onOpenChange={dialogs.setIsPlanDialogOpen}
            editingPlanId={forms.editingPlanId}
            newPlan={forms.newPlan}
            setNewPlan={forms.setNewPlan}
            onSave={handlers.handleSavePlan}
            isSaving={isSavingPlan}
          />
        </TabsContent>

        <TabsContent
          value="coupons"
          className="animate-in fade-in slide-in-from-bottom-1 duration-200"
        >
          <CouponsConfig
            coupons={coupons}
            onToggle={handlers.handleToggleCoupon}
            onDelete={handlers.handleDeleteCoupon}
            onCreateNew={() => dialogs.setIsCouponDialogOpen(true)}
          />
          <CouponDialog
            open={dialogs.isCouponDialogOpen}
            onOpenChange={dialogs.setIsCouponDialogOpen}
            newCoupon={forms.newCoupon}
            setNewCoupon={forms.setNewCoupon}
            onSave={handlers.handleAddCoupon}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
