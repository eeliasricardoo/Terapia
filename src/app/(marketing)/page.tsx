import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

import { Hero } from "@/components/landing/Hero"
import { SearchHighlight } from "@/components/landing/SearchHighlight"
import { Features } from "@/components/landing/Features"
import { CTA } from "@/components/landing/CTA"

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect("/dashboard")
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <Hero />
      <SearchHighlight />
      <Features />
      <CTA />
    </main>
  )
}
