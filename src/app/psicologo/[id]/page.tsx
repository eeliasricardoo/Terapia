import { notFound } from "next/navigation"
import { PsychologistProfileClient } from "./PsychologistProfileClient"
import { unstable_cache } from "next/cache"
import { createClient } from "@supabase/supabase-js"
import { PsychologistWithProfile } from "@/lib/supabase/types"

const getCachedPsychologistData = unstable_cache(
    async (userId: string) => {
        try {
            const supabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            )

            // 1. Fetch psychologist
            const { data: psych, error: psychError } = await supabase
                .from('psychologist_profiles')
                .select('*')
                .eq('userId', userId)
                .eq('is_verified', true)
                .single()

            if (psychError || !psych) return null

            const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', psych.userId)
                .single()

            const fullPsychologist = {
                ...psych,
                profile: profileData || null
            } as PsychologistWithProfile

            // 2. Fetch availability
            const recentPastDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

            const [overridesRes, apptsRes] = await Promise.all([
                supabase
                    .from('schedule_overrides')
                    .select('date, type, slots')
                    .eq('psychologist_id', psych.id)
                    .gte('date', recentPastDate),
                supabase
                    .from('appointments')
                    .select('scheduled_at, duration_minutes')
                    .eq('psychologist_id', psych.id)
                    .gte('scheduled_at', new Date().toISOString())
                    .neq('status', 'cancelled')
            ])

            const overridesMap: any = {}
            if (overridesRes.data) {
                overridesRes.data.forEach((o: any) => {
                    overridesMap[o.date] = {
                        type: o.type,
                        slots: o.slots || []
                    }
                })
            }

            const appointmentsMap = apptsRes.data ? apptsRes.data.map((a: any) => ({
                scheduled_at: a.scheduled_at,
                duration_minutes: a.duration_minutes
            })) : []

            const availability = {
                timezone: psych.timezone || 'America/Sao_Paulo',
                weeklySchedule: psych.weekly_schedule || null,
                overrides: overridesMap,
                appointments: appointmentsMap
            }

            // Return combined payload
            return {
                psychologist: fullPsychologist,
                availability
            }
        } catch (error) {
            console.error("Failed to load psychologist data from cache:", error)
            return null
        }
    },
    ['psychologist-profile-view'],
    { revalidate: 60, tags: ['psychologists', 'appointments', 'overrides'] }
)

interface PageProps {
    params: {
        id: string
    }
}

export default async function PsychologistProfilePage({ params }: PageProps) {
    // Both user profile & availability cached and aggregated in 1 trip
    const data = await getCachedPsychologistData(params.id)

    if (!data || !data.psychologist) {
        notFound()
    }

    return <PsychologistProfileClient psychologist={data.psychologist} availability={data.availability as any} />
}
