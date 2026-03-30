'use client'

import React, { Suspense } from 'react'
import { motion, Variants } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { MoodTracker } from '@/components/dashboard/MoodTracker'
import { PatientDashboardHeader } from './patient-dashboard-header'
import { FindPsychologistCTA } from './find-psychologist-cta'
import { NextSessionHero } from './next-session-hero'
import { RecentHistory } from './recent-history'
import { QuickActions } from './quick-actions'
import { UpcomingSessionsList } from './upcoming-sessions-list'
import { NotificationCenter } from '@/components/dashboard/NotificationCenter'
import { PaymentStatusToast } from './payment-status-toast'

interface PatientDashboardClientProps {
  userName: string
  patientData: any
}

export function PatientDashboardClient({ userName, patientData }: PatientDashboardClientProps) {
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  }

  return (
    <div className="relative min-h-screen bg-slate-50/50 pb-20">
      {/* Soft background mesh gradient - Sentirz Aesthetic */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-sentirz-teal/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-sentirz-green/5 rounded-full blur-[100px] pointer-events-none -z-10" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="container mx-auto px-4 max-w-7xl"
      >
        <Suspense>
          <PaymentStatusToast />
        </Suspense>

        {/* Dashboard Header Section */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pt-10 pb-12"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="h-1.5 w-1.5 bg-primary rounded-full animate-pulse" />
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                {greeting}
              </p>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 font-outfit">
              Olá, <span className="text-sentirz-gradient">{userName}</span>.
            </h1>
            <p className="text-base text-slate-600 font-medium max-w-prose">
              Seu espaço de cuidado está pronto para continuar sua jornada hoje.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/80 backdrop-blur-md p-2 rounded-[2rem] shadow-sm border border-slate-100 self-start sm:self-auto group transition-all hover:shadow-md">
            <NotificationCenter />
            <div className="h-8 w-px bg-slate-100 mx-1" />
            <Link href="/busca">
              <Button className="rounded-full px-6 font-bold bg-slate-900 text-white hover:bg-slate-800 text-sm h-11 transition-all active:scale-95 shadow-lg shadow-slate-200">
                Nova Sessão
              </Button>
            </Link>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Main Column */}
          <div className="lg:col-span-8 space-y-10 lg:space-y-14">
            <motion.div variants={itemVariants}>
              {patientData.nextSession ? (
                <NextSessionHero session={patientData.nextSession} />
              ) : (
                <FindPsychologistCTA />
              )}
            </motion.div>

            {patientData.upcomingSessions && patientData.upcomingSessions.length > 1 && (
              <motion.div variants={itemVariants}>
                <UpcomingSessionsList sessions={patientData.upcomingSessions} />
              </motion.div>
            )}

            <motion.div variants={itemVariants} className="pt-4">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Monitoramento diário
                </h2>
                <div className="h-px flex-1 bg-slate-100 ml-6" />
              </div>
              <MoodTracker monthlyProgress={patientData.monthlyProgress} />
            </motion.div>
          </div>

          {/* Sidebar Column */}
          <div className="lg:col-span-4 space-y-10 lg:space-y-12">
            <motion.div variants={itemVariants}>
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
                Acesso Rápido
              </h2>
              <div className="bg-white/40 backdrop-blur-sm rounded-3xl p-1 border border-slate-100">
                <QuickActions />
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
                Histórico Recente
              </h2>
              <div className="hover:translate-x-1 transition-transform">
                <RecentHistory history={patientData.recentSessions} />
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
