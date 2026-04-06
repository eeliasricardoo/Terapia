'use client'

import { useTranslations } from 'next-intl'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useProfileData } from './_hooks/use-profile-data'
import { ProfileAvatarCard } from './_components/profile-avatar-card'
import { ProfessionalProfileCard } from './_components/professional-profile-card'
import { PersonalInfoCard } from './_components/personal-info-card'
import { AddressInfoCard } from './_components/address-info-card'
import { SubscriptionPlansCard } from './_components/subscription-plans-card'
import { SecuritySettingsCard } from './_components/security-settings-card'
import { CompanyBenefitCard } from './_components/company-benefit-card'

export default function ProfilePage() {
  const { user, setUser, isLoading, setIsLoading, isSaving, setIsSaving, professionalInfo } =
    useProfileData()
  const t = useTranslations('ProfilePage')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          {t('title')}
        </h1>
        <p className="text-muted-foreground">{t('description')}</p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="flex flex-wrap md:flex-nowrap items-center w-full md:w-fit h-auto mb-8 gap-2 bg-slate-100/50 p-1.5 rounded-[1.25rem] border border-slate-200/60 shadow-sm overflow-hidden">
          <TabsTrigger
            value="general"
            className="flex-1 md:flex-initial rounded-xl px-3 sm:px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-md font-semibold text-xs uppercase tracking-tight transition-all"
          >
            {t('tabs.general')}
          </TabsTrigger>
          {user?.rawRole !== 'ADMIN' && (
            <TabsTrigger
              value="plans"
              className="flex-1 md:flex-initial rounded-xl px-3 sm:px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-md font-semibold text-xs uppercase tracking-tight transition-all"
            >
              {t('tabs.plans')}
            </TabsTrigger>
          )}
          {user?.rawRole === 'PATIENT' && (
            <TabsTrigger
              value="benefits"
              className="flex-1 md:flex-initial rounded-xl px-3 sm:px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-md font-semibold text-xs uppercase tracking-tight transition-all"
            >
              {t('tabs.benefits')}
            </TabsTrigger>
          )}
          <TabsTrigger
            value="security"
            className="flex-1 md:flex-initial rounded-xl px-3 sm:px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-md font-semibold text-xs uppercase tracking-tight transition-all"
          >
            {t('tabs.security')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          {/* User Avatar Card */}
          <ProfileAvatarCard
            user={user}
            setUser={setUser}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />

          {/* Professional Profile Card (Only for Psychologist) */}
          {user?.rawRole === 'PSYCHOLOGIST' && (
            <ProfessionalProfileCard
              user={user}
              isSaving={isSaving}
              setIsSaving={setIsSaving}
              {...professionalInfo}
            />
          )}

          {/* Personal Info Form */}
          <PersonalInfoCard
            user={user}
            setUser={setUser}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />

          {/* Address Info Form */}
          <AddressInfoCard
            user={user}
            setUser={setUser}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        </TabsContent>

        {user?.rawRole !== 'ADMIN' && (
          <TabsContent value="plans" className="space-y-6">
            <SubscriptionPlansCard />
          </TabsContent>
        )}

        <TabsContent value="security" className="space-y-6">
          <SecuritySettingsCard />
        </TabsContent>

        {user?.rawRole === 'PATIENT' && (
          <TabsContent value="benefits" className="space-y-6">
            <CompanyBenefitCard />
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
