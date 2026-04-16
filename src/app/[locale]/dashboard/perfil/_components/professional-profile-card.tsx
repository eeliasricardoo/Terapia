'use client'

import { useTranslations } from 'next-intl'
import { Save, Share2, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { UserProfile } from '../_hooks/use-profile-data'
import { BRAND_NAME } from '@/lib/constants/branding'

interface ProfessionalProfileCardProps {
  user: UserProfile
  isSaving: boolean
  setIsSaving: (saving: boolean) => void
  bio: string
  setBio: (val: string) => void
  crp: string
  setCrp: (val: string) => void
  price: number | ''
  setPrice: (val: number | '') => void
  specialties: string
  setSpecialties: (val: string) => void
  videoUrl: string
  setVideoUrl: (val: string) => void
}

export function ProfessionalProfileCard({
  user,
  isSaving,
  setIsSaving,
  bio,
  setBio,
  crp,
  setCrp,
  price,
  setPrice,
  specialties,
  setSpecialties,
  videoUrl,
  setVideoUrl,
}: ProfessionalProfileCardProps) {
  const supabase = createClient()
  const t = useTranslations('ProfilePage')

  const handleCopyProfileLink = () => {
    const baseUrl = window.location.origin
    const profileUrl = `${baseUrl}/psicologo/${user.id}`

    navigator.clipboard.writeText(profileUrl)
    toast.success(t('professional.linkCopied'), {
      description: t('professional.linkCopiedDesc'),
    })
  }

  const handleSaveProfessionalProfile = async () => {
    try {
      setIsSaving(true)

      const specialtiesArray = specialties
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s !== '')

      const { error } = await supabase
        .from('psychologist_profiles')
        .update({
          bio,
          crp,
          price_per_session: price === '' ? null : Number(price),
          specialties: specialtiesArray.length > 0 ? specialtiesArray : null,
          video_presentation_url: videoUrl || null,
        })
        .eq('userId', user.id)

      if (error) throw error

      toast.success(t('professional.success'), {
        description: t('professional.successDesc'),
      })
    } catch (error) {
      console.error('Error saving professional profile:', error)
      toast.error(t('professional.errorUpdate'))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <CardTitle>{t('professional.title')}</CardTitle>
          <CardDescription>{t('professional.subtitle')}</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-9 rounded-xl font-bold bg-slate-50 border-slate-200 hover:bg-slate-100"
            onClick={() => window.open(`/psicologo/${user.id}`, '_blank')}
          >
            <ExternalLink className="mr-2 h-4 w-4 text-slate-400" />
            {t('professional.viewPublic')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-9 rounded-xl font-bold bg-slate-50 border-slate-200 hover:bg-slate-100"
            onClick={handleCopyProfileLink}
          >
            <Share2 className="mr-2 h-4 w-4 text-slate-400" />
            {t('professional.copyLink')}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="crp">{t('professional.crp')}</Label>
            <Input
              id="crp"
              value={crp}
              onChange={(e) => setCrp(e.target.value)}
              placeholder={t('professional.crpPlaceholder')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">{t('professional.price')}</Label>
            <Input
              id="price"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder={t('professional.pricePlaceholder')}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="specialties">{t('professional.specialties')}</Label>
          <Input
            id="specialties"
            value={specialties}
            onChange={(e) => setSpecialties(e.target.value)}
            placeholder={t('professional.specialtiesPlaceholder')}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="videoUrl">{t('professional.videoUrl')}</Label>
          <Input
            id="videoUrl"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder={t('professional.videoUrlPlaceholder')}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bio">{t('professional.bio')}</Label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder={t('professional.bioPlaceholder')}
          />
          <p className="text-xs text-muted-foreground">
            {t('professional.chars', { count: bio.length })}
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end border-t p-6">
        <Button disabled={isSaving} onClick={handleSaveProfessionalProfile}>
          {isSaving ? (
            t('professional.saving')
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {t('professional.save')}
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
