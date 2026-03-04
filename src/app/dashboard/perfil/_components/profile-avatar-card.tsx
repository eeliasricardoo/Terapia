'use client'

import { useRef } from 'react'
import { Camera } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { uploadProfileImage } from '../actions'
import { UserProfile } from '../_hooks/use-profile-data'

interface ProfileAvatarCardProps {
  user: UserProfile | null
  setUser: (user: any) => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

export function ProfileAvatarCard({
  user,
  setUser,
  isLoading,
  setIsLoading,
}: ProfileAvatarCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    try {
      setIsLoading(true)

      const formData = new FormData()
      formData.append('file', file)

      const result = await uploadProfileImage(formData)

      if (result.error) {
        toast.error('Erro ao atualizar foto', { description: result.error })
        return
      }

      if (result.publicUrl) {
        setUser((prev: any) => (prev ? { ...prev, image: result.publicUrl } : null))
        toast.success('Foto atualizada!', {
          description: 'Sua foto de perfil foi alterada com sucesso.',
        })
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error('Erro ao atualizar foto')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const getInitials = (name: string) => {
    if (!name) return 'US'
    return name
      .split(' ')
      .filter((n) => n)
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sua Foto</CardTitle>
        <CardDescription>
          Clique na foto para alterar. Recomendamos uma imagem quadrada.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center gap-6">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
        <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
          <Avatar className="h-24 w-24 border-4 border-slate-50 shadow-sm group-hover:opacity-90 transition-opacity">
            <AvatarImage src={user?.image || undefined} />
            <AvatarFallback className="text-xl">
              {user?.name ? getInitials(user.name) : 'US'}
            </AvatarFallback>
          </Avatar>
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="h-8 w-8 text-white" />
          </div>
        </div>
        <div className="space-y-1">
          <h3 className="font-medium text-lg">{user?.name || 'Carregando...'}</h3>
          <p className="text-sm text-muted-foreground">{user?.role || ''}</p>
        </div>
      </CardContent>
    </Card>
  )
}
