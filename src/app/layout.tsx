import type { Metadata } from 'next'
import { Inter, Outfit } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/providers/auth-provider'
import { Toaster } from 'sonner'
import { headers } from 'next/headers'
import { env } from '@/lib/env'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
})

import { BRAND_NAME, BRAND_SLOGAN, BRAND_DESCRIPTION } from '@/lib/constants/branding'

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: {
    default: `${BRAND_NAME} - Terapia Online | ${BRAND_SLOGAN}`,
    template: `%s | ${BRAND_NAME}`,
  },
  description: BRAND_DESCRIPTION,
  keywords: [
    'terapia online',
    'psicólogo online',
    'saúde mental',
    'ansiedade',
    'depressão',
    'bem-estar',
    'sentirz',
  ],
  authors: [{ name: 'Sentirz Team' }],
  creator: 'Sentirz Plataforma',
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: '/',
    siteName: BRAND_NAME,
    title: `${BRAND_NAME} - Terapia Online de Alta Qualidade`,
    description: 'Encontre psicólogos qualificados e comece sua jornada de autocuidado hoje mesmo.',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: `${BRAND_NAME} Terapia Online`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${BRAND_NAME} - Terapia Online`,
    description: 'Sessões de terapia online com total segurança e praticidade.',
    images: ['/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const nonce = (await headers()).get('x-nonce') ?? undefined

  return (
    <html lang="pt-BR" nonce={nonce} suppressHydrationWarning>
      <body className={`${inter.variable} ${outfit.variable} antialiased font-sans`}>
        <AuthProvider>
          <Toaster position="top-center" richColors />
          <main className="flex-1">{children}</main>
        </AuthProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
