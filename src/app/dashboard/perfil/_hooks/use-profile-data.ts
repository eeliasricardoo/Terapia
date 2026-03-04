'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export type UserProfile = {
  id: string
  name: string
  email: string
  phone: string
  role: string
  image: string | undefined
  rawRole: string
  // New fields
  birth_date?: string | null
  document?: string | null
  gender?: string | null
  profession?: string | null
  address_line?: string | null
  city?: string | null
  state?: string | null
  zip_code?: string | null
}

export function useProfileData() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [user, setUser] = useState<UserProfile | null>(null)
  const supabase = createClient()

  // Professional Profile State
  const [bio, setBio] = useState('')
  const [crp, setCrp] = useState('')
  const [price, setPrice] = useState<number | ''>('')
  const [specialties, setSpecialties] = useState('')
  const [videoUrl, setVideoUrl] = useState('')

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser()

        if (!authUser) return

        // Fetch Profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', authUser.id)
          .single()

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Error fetching profile:', profileError)
        }

        const isPsychologist =
          profile?.role === 'PSYCHOLOGIST' || authUser.user_metadata?.role === 'PSYCHOLOGIST'

        setUser({
          id: authUser.id,
          name: profile?.full_name || authUser.user_metadata?.full_name || '',
          email: authUser.email || '',
          phone: profile?.phone || '',
          role: isPsychologist ? 'Psicólogo' : 'Paciente',
          rawRole: isPsychologist ? 'PSYCHOLOGIST' : 'PATIENT',
          image: profile?.avatar_url || '/avatars/01.png',
          birth_date: profile?.birth_date,
          document: profile?.document,
          gender: profile?.gender,
          profession: profile?.profession,
          address_line: profile?.address_line,
          city: profile?.city,
          state: profile?.state,
          zip_code: profile?.zip_code,
        })

        // If Psychologist, fetch professional profile
        if (isPsychologist) {
          const { data: psychProfile } = await supabase
            .from('psychologist_profiles')
            .select('bio, crp, price_per_session, specialties, video_presentation_url')
            .eq('userId', authUser.id)
            .single()

          if (psychProfile) {
            setBio(psychProfile.bio || '')
            setCrp(psychProfile.crp || '')
            setPrice(psychProfile.price_per_session || '')
            setSpecialties(psychProfile.specialties?.join(', ') || '')
            setVideoUrl(psychProfile.video_presentation_url || '')
          }
        }
      } catch (error) {
        console.error('Error fetching user:', error)
        toast.error('Erro ao carregar perfil')
      }
    }

    fetchUser()
  }, [supabase])

  return {
    user,
    setUser,
    isLoading,
    setIsLoading,
    isSaving,
    setIsSaving,
    professionalInfo: {
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
    },
  }
}
