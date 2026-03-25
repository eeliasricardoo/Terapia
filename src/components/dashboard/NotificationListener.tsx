'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

/**
 * Listens for realtime notifications for the current user and shows toasts.
 * Used in the patient dashboard (psychologists have their own listener in PsychologistDashboard).
 */
export function NotificationListener() {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    let channel: ReturnType<typeof supabase.channel> | undefined

    const setup = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      channel = supabase
        .channel(`patient-notifications-${user.id}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'notifications' },
          (payload) => {
            const notif = payload.new as {
              user_id: string
              title: string
              message: string
              type: string
              link?: string
            }

            if (notif.user_id !== user.id) return

            const isCancellation = notif.type === 'cancellation'

            if (isCancellation) {
              toast.error(notif.title, {
                description: notif.message,
                duration: 8000,
                dismissible: true,
                action: notif.link
                  ? { label: 'Ver detalhes', onClick: () => router.push(notif.link!) }
                  : undefined,
              })
            } else {
              toast.success(notif.title, {
                description: notif.message,
                duration: 8000,
                dismissible: true,
                action: notif.link
                  ? { label: 'Ver detalhes', onClick: () => router.push(notif.link!) }
                  : undefined,
              })
            }
          }
        )
        .subscribe()
    }

    setup()

    return () => {
      if (channel) {
        const supabaseClient = createClient()
        supabaseClient.removeChannel(channel)
      }
    }
  }, [router])

  return null
}
