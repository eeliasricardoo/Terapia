'use client'

import { useState, useEffect } from 'react'
import { Bell, Check, ExternalLink, Inbox, Loader2 } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllAsRead,
} from '@/lib/actions/notifications'
import { formatDistanceToNow } from 'date-fns'
import { ptBR, es } from 'date-fns/locale'
import Link from 'next/link'
import { toast } from 'sonner'
import { useTranslations, useLocale } from 'next-intl'

export function NotificationCenter() {
  const t = useTranslations('DashboardLayout.notifications')
  const locale = useLocale()
  const dateLocale = locale === 'es' ? es : ptBR

  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)

  const unreadCount = notifications.filter((n) => !n.read).length

  async function loadNotifications() {
    setLoading(true)
    const result = await getUserNotifications()
    if (result.success) {
      setNotifications(result.data)
    }
    setLoading(false)
  }

  useEffect(() => {
    if (isOpen) {
      loadNotifications()
    }
  }, [isOpen])

  // Poll for new notifications every 1 minute if the popover is closed
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isOpen) {
        getUserNotifications().then((res) => {
          if (res.success) setNotifications(res.data)
        })
      }
    }, 60000)
    return () => clearInterval(interval)
  }, [isOpen])

  const handleMarkAsRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
    await markNotificationAsRead({ notificationId: id })
  }

  const handleMarkAllAsRead = async () => {
    const original = [...notifications]
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    const res = await markAllAsRead()
    if (!res.success) {
      setNotifications(original)
      toast.error(t('errorMarkAll'))
    } else {
      toast.success(t('successMarkAll'))
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full relative opacity-70 hover:opacity-100 transition-opacity"
          aria-label={t('title')}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span
              className="absolute top-2.5 right-2.5 h-2 w-2 bg-rose-500 rounded-full border-2 border-white animate-pulse"
              aria-hidden="true"
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-80 p-0 overflow-hidden bg-white border-slate-200 shadow-2xl rounded-2xl"
        align="end"
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-50 bg-slate-50/50">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <Inbox className="h-4 w-4 text-slate-400" />
            {t('title')}
          </h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="text-[10px] uppercase tracking-wider font-bold h-7 px-2 hover:bg-slate-100"
            >
              {t('markAllRead')}
            </Button>
          )}
        </div>

        <ScrollArea className="h-[350px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 text-slate-400 gap-3">
              <Loader2 className="h-6 w-6 animate-spin" />
              <p className="text-xs font-medium">{t('loading')}</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="h-12 w-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                <Bell className="h-6 w-6 text-slate-300" />
              </div>
              <p className="text-sm font-medium text-slate-900">{t('emptyTitle')}</p>
              <p className="text-xs text-slate-500 mt-1">{t('emptyDesc')}</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    'p-4 transition-colors relative group hover:bg-slate-50/80',
                    !notification.read && 'bg-blue-50/30'
                  )}
                >
                  {!notification.read && (
                    <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-full" />
                  )}
                  <div className="flex justify-between gap-3">
                    <div className="space-y-1 flex-1">
                      <p
                        className={cn(
                          'text-sm font-bold leading-none',
                          notification.read ? 'text-slate-700' : 'text-slate-900'
                        )}
                      >
                        {notification.title}
                      </p>
                      <p className="text-xs text-slate-500 leading-relaxed font-medium">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-[10px] text-slate-400 font-medium">
                          {formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: true,
                            locale: dateLocale,
                          })}
                        </span>
                        {notification.link && (
                          <Link
                            href={notification.link}
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="text-[10px] font-bold text-blue-600 flex items-center gap-1 hover:underline"
                          >
                            {t('viewDetails')}
                            <ExternalLink className="h-2.5 w-2.5" />
                          </Link>
                        )}
                      </div>
                    </div>
                    {!notification.read && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="h-6 w-6 rounded-full flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 shadow-sm transition-all"
                      >
                        <Check className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
