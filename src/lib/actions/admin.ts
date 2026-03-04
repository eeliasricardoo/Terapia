'use server'

import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/utils/logger'
import { revalidatePath } from 'next/cache'

export async function getPendingPsychologists() {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) throw new Error('Não autenticado')

        // Check ADMIN role
        const profile = await prisma.profile.findUnique({
            where: { user_id: user.id }
        })

        if (!profile || profile.role !== 'ADMIN') {
            throw new Error('Não autorizado')
        }

        const pending = await prisma.psychologistProfile.findMany({
            where: { isVerified: false },
            include: {
                user: {
                    include: {
                        profiles: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        return pending.map(p => ({
            id: p.id,
            userId: p.userId,
            fullName: p.user.profiles?.fullName || p.user.name || 'Psicólogo',
            email: p.user.email,
            crp: p.crp,
            specialties: p.specialties,
            createdAt: p.createdAt.toISOString(),
            avatarUrl: p.user.profiles?.avatarUrl
        }))
    } catch (error) {
        logger.error('Error fetching pending psychologists:', error)
        return []
    }
}

export async function verifyPsychologist(psychologistId: string) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) throw new Error('Não autenticado')

        const profile = await prisma.profile.findUnique({
            where: { user_id: user.id }
        })

        if (!profile || profile.role !== 'ADMIN') {
            throw new Error('Não autorizado')
        }

        await prisma.psychologistProfile.update({
            where: { id: psychologistId },
            data: { isVerified: true }
        })

        revalidatePath('/dashboard')
        return { success: true }
    } catch (error) {
        logger.error('Error verifying psychologist:', error)
        return { success: false, error: 'Falha ao verificar psicólogo' }
    }
}
