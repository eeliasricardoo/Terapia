import { getPsychologists } from '@/lib/actions/psychologists'
import SearchClient from './SearchClient'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { SearchHero } from '@/components/search/SearchHero'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { unstable_cache } from 'next/cache'
import { PsychologistWithProfile } from '@/lib/supabase/types'

import { createClient } from '@supabase/supabase-js'

// Use a pure client for caching to bypass cookies() dynamically blowing up unstable_cache
const getCachedPsychologists = unstable_cache(
  async () => {
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      const { data: psychologists, error } = await supabase
        .from('psychologist_profiles')
        .select('*')
        .eq('is_verified', true)
        .order('created_at', { ascending: false })

      if (error || !psychologists || psychologists.length === 0) return []

      const userIds = psychologists.map((p: any) => p.userId)
      const { data: profiles } = await supabase.from('profiles').select('*').in('user_id', userIds)

      return psychologists.map((psych: any) => ({
        ...psych,
        profile: profiles?.find((profile: any) => profile.user_id === psych.userId) || null,
      })) as PsychologistWithProfile[]
    } catch (error) {
      console.error('Failed to load psychologists Server-Side:', error)
      return []
    }
  },
  ['psychologists-search-list-v4'],
  { revalidate: 60, tags: ['psychologists'] }
)

export default async function SearchPage() {
  const psychologists = await getCachedPsychologists()

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <SearchHero />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-7xl">
        <div className="mb-10">
          <div className="flex items-center text-sm text-slate-500 gap-2 px-1">
            <Link href="/" className="hover:text-orange-600 transition-colors">
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-slate-700 font-medium font-outfit">Explorar Profissionais</span>
          </div>
        </div>

        <SearchClient initialPsychologists={psychologists} />
      </main>

      <Footer />
    </div>
  )
}
