'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useServicesConfig } from './_hooks/use-services-config'
import { GeneralConfig } from './_components/general-config'
import { PlansConfig } from './_components/plans-config'
import { PlanDialog } from './_components/plan-dialog'
import { CouponsConfig } from './_components/coupons-config'
import { CouponDialog } from './_components/coupon-dialog'

export function ServicesConfig() {
  const {
    sessionPrice,
    setSessionPrice,
    sessionDuration,
    setSessionDuration,
    plans,
    coupons,
    dialogs,
    forms,
    handlers,
  } = useServicesConfig()

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Serviços & Tarifas</h2>
        <p className="text-slate-500">
          Defina seus preços, crie pacotes promocionais e gerencie cupons de desconto.
        </p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3 mb-8">
          <TabsTrigger value="general">Sessão Avulsa</TabsTrigger>
          <TabsTrigger value="plans">Pacotes</TabsTrigger>
          <TabsTrigger value="coupons">Cupons</TabsTrigger>
        </TabsList>

        {/* --- TAB 1: SESSÃO AVULSA --- */}
        <TabsContent
          value="general"
          className="animate-in fade-in slide-in-from-bottom-2 duration-300"
        >
          <GeneralConfig
            sessionPrice={sessionPrice}
            setSessionPrice={setSessionPrice}
            sessionDuration={sessionDuration}
            setSessionDuration={setSessionDuration}
            onSave={handlers.handleSaveGeneral}
          />
        </TabsContent>

        {/* --- TAB 2: PACOTES --- */}
        <TabsContent
          value="plans"
          className="animate-in fade-in slide-in-from-bottom-2 duration-300"
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
          />
        </TabsContent>

        {/* --- TAB 3: CUPONS --- */}
        <TabsContent
          value="coupons"
          className="animate-in fade-in slide-in-from-bottom-2 duration-300"
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
