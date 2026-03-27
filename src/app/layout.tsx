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

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: {
    default: 'Mind Cares - Terapia Online | Sua mente, nosso cuidado.',
    template: '%s | Mind Cares',
  },
  description:
    'A Mind Cares é uma plataforma que conecta você a psicólogos qualificados para sessões de terapia online com total segurança, sigilo e praticidade.',
  keywords: [
    'terapia online',
    'psicólogo online',
    'saúde mental',
    'ansiedade',
    'depressão',
    'bem-estar',
    'mind cares',
  ],
  authors: [{ name: 'Mind Cares Team' }],
  creator: 'Mind Cares Plataforma',
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: '/',
    siteName: 'Mind Cares',
    title: 'Mind Cares - Terapia Online de Alta Qualidade',
    description: 'Encontre psicólogos qualificados e comece sua jornada de autocuidado hoje mesmo.',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'Mind Cares Terapia Online',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mind Cares - Terapia Online',
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const nonce = headers().get('x-nonce') ?? undefined

  return (
    <html lang="pt-BR" nonce={nonce}>
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
