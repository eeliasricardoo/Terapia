'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useProfileData } from './_hooks/use-profile-data'
import { ProfileAvatarCard } from './_components/profile-avatar-card'
import { ProfessionalProfileCard } from './_components/professional-profile-card'
import { PersonalInfoCard } from './_components/personal-info-card'
import { AddressInfoCard } from './_components/address-info-card'
import { SubscriptionPlansCard } from './_components/subscription-plans-card'
import { SecuritySettingsCard } from './_components/security-settings-card'

export default function ProfilePage() {
  const { user, setUser, isLoading, setIsLoading, isSaving, setIsSaving, professionalInfo } =
    useProfileData()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Meu Perfil</h1>
        <p className="text-muted-foreground">Gerencie suas informações pessoais e segurança.</p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full md:w-[600px] grid-cols-1 md:grid-cols-3 h-auto mb-8">
          <TabsTrigger value="general">Informações Gerais</TabsTrigger>
          <TabsTrigger value="plans">Meus Planos</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
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

        <TabsContent value="plans" className="space-y-6">
          <SubscriptionPlansCard />
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <SecuritySettingsCard />
        </TabsContent>
      </Tabs>
    </div>
  )
}
