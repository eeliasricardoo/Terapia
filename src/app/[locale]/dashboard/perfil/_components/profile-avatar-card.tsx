'use client'

import { useTranslations } from 'next-intl'
import { useRef } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { Camera } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { uploadProfileImage } from '../actions'
import { UserProfile } from '../_hooks/use-profile-data'

interface ProfileAvatarCardProps {
  user: UserProfile | null
  setUser: Dispatch<SetStateAction<UserProfile | null>>
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
  const t = useTranslations('ProfilePage')

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    try {
      setIsLoading(true)

      const formData = new FormData()
      formData.append('file', file)

      const result = await uploadProfileImage(formData)

      if (result.error) {
        toast.error(t('avatar.errorUpdate'), { description: result.error })
        return
      }

      if (result.publicUrl) {
        setUser((prev) => (prev ? { ...prev, image: result.publicUrl } : null))
        toast.success(t('avatar.success'), {
          description: t('avatar.successDesc'),
        })
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error(t('avatar.errorUpdate'))
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
    <div className="bg-white rounded-[2.5rem] border border-slate-200/60 p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden animate-in fade-in duration-700">
      {/* Subtle background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -mr-32 -mt-32 opacity-50 blur-3xl pointer-events-none" />

      <div className="relative flex flex-col md:flex-row items-center gap-10">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />

        <div className="relative group cursor-pointer shrink-0" onClick={handleAvatarClick}>
          <div className="absolute -inset-1.5 bg-gradient-to-tr from-slate-200 to-slate-100 rounded-full blur opacity-20 group-hover:opacity-40 transition-opacity" />
          <Avatar className="h-32 w-32 border-4 border-white shadow-2xl relative transition-transform duration-500 group-hover:scale-105">
            <AvatarImage src={user?.image || undefined} className="object-cover" />
            <AvatarFallback className="bg-slate-900 text-white font-bold text-2xl uppercase">
              {user?.name ? getInitials(user.name) : 'US'}
            </AvatarFallback>
          </Avatar>
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-[2px]">
            <Camera className="h-8 w-8 text-white scale-75 group-hover:scale-100 transition-transform duration-300" />
          </div>
          <div className="absolute -bottom-1 -right-1 h-10 w-10 bg-white rounded-2xl shadow-lg border border-slate-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <Camera className="h-5 w-5 text-slate-900" />
          </div>
        </div>

        <div className="flex-1 text-center md:text-left space-y-3">
          <div className="space-y-1">
            <h3 className="text-3xl font-bold tracking-tight text-slate-900">
              {user?.name || t('avatar.loading')}
            </h3>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <span className="px-3 py-1 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-full shadow-sm">
                {user?.role === 'ADMIN'
                  ? t('avatar.roles.admin')
                  : user?.role === 'PSYCHOLOGIST'
                    ? t('avatar.roles.psychologist')
                    : user?.role === 'COMPANY'
                      ? t('avatar.roles.company')
                      : t('avatar.roles.patient')}
              </span>
            </div>
          </div>
          <p className="text-sm text-slate-500 max-w-md leading-relaxed">
            {t('avatar.recommendation')}
          </p>
        </div>
      </div>
    </div>
  )
}
