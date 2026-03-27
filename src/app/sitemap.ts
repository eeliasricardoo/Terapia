import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

/**
 * Dynamic Sitemap Generator
 * Helps Google find all our professional profiles automatically.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mindcares.com.br'

  // 1. Static Routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/busca`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/login/paciente`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/cadastro/psicologo`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]

  // 2. Dynamic Professional Profiles
  try {
    const activePsychologists = await prisma.psychologistProfile.findMany({
      where: {
        isVerified: true,
        stripeOnboardingComplete: true,
      },
      select: {
        userId: true,
        updatedAt: true,
      },
    })

    const profileRoutes: MetadataRoute.Sitemap = activePsychologists.map((psych) => ({
      url: `${baseUrl}/psicologo/${psych.userId}`,
      lastModified: psych.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.7,
    }))

    return [...staticRoutes, ...profileRoutes]
  } catch (error) {
    console.error('[SITEMAP] Failed to fetch dynamic routes:', error)
    return staticRoutes
  }
}
