'use client'

import { Save } from 'lucide-react'
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

      toast.success('Perfil profissional salvo!', {
        description: 'Suas informações foram atualizadas na plataforma.',
      })
    } catch (error) {
      console.error('Error saving professional profile:', error)
      toast.error('Erro ao salvar perfil profissional')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Perfil Profissional</CardTitle>
        <CardDescription>Configure como você aparecerá para os pacientes na busca.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="crp">CRP</Label>
            <Input
              id="crp"
              value={crp}
              onChange={(e) => setCrp(e.target.value)}
              placeholder="Ex: 00/00000"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Valor da Sessão (R$)</Label>
            <Input
              id="price"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="Ex: 150"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="specialties">Especialidades (separadas por vírgula)</Label>
          <Input
            id="specialties"
            value={specialties}
            onChange={(e) => setSpecialties(e.target.value)}
            placeholder="Ex: Psicologia Clínica, TCC, ansiedade"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="videoUrl">URL do Vídeo de Apresentação</Label>
          <Input
            id="videoUrl"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="Link do YouTube ou Vimeo"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bio">Biografia</Label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Conte um pouco sobre sua abordagem, experiência e como você pode ajudar o paciente..."
          />
          <p className="text-xs text-muted-foreground">{bio.length} caracteres</p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end border-t p-6">
        <Button disabled={isSaving} onClick={handleSaveProfessionalProfile}>
          {isSaving ? (
            'Salvando...'
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Salvar Perfil Profissional
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
