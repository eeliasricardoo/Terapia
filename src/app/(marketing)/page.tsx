import { Hero } from "@/components/landing/Hero"
import { SearchHighlight } from "@/components/landing/SearchHighlight"
import { Features } from "@/components/landing/Features"
import { CTA } from "@/components/landing/CTA"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <Hero />
      <SearchHighlight />
      <Features />
      <CTA />
    </main>
  )
}
