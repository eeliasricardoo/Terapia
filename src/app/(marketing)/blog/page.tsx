import { BlogHero } from '@/components/blog/BlogHero'
import { BlogGrid } from '@/components/blog/BlogGrid'
import { CTA } from '@/components/landing/CTA'

export default function BlogPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between overflow-x-hidden">
      <BlogHero />
      <BlogGrid />
      <CTA />
    </main>
  )
}
