import type { Metadata } from 'next'
import { Inter, Outfit } from 'next/font/google'
import '../globals.css'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server'
import { routing } from '@/i18n/routing'
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

import { BRAND_NAME } from '@/lib/constants/branding'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Metadata' })

  return {
    metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
    title: {
      default: `${BRAND_NAME} | ${t('title')}`,
      template: `%s | ${BRAND_NAME}`,
    },
    description: t('description'),
    keywords: t('keywords')
      .split(',')
      .map((k) => k.trim()),
    authors: [{ name: 'Sentirz Team' }],
    creator: 'Sentirz Plataforma',
    icons: {
      icon: '/favicon.png',
      shortcut: '/favicon.png',
      apple: '/favicon.png',
    },
    openGraph: {
      type: 'website',
      locale: locale,
      url: '/',
      siteName: BRAND_NAME,
      title: t('ogTitle'),
      description: t('ogDescription'),
      images: [
        {
          url: '/logo.png',
          width: 1200,
          height: 630,
          alt: `${BRAND_NAME} Sentirz Online`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('ogTitle'),
      description: t('ogDescription'),
      images: ['/logo.png'],
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ locale: string }>
}>) {
  const { locale } = await params

  // Enable static rendering
  setRequestLocale(locale)

  const messages = await getMessages({ locale })
  const nonce = (await headers()).get('x-nonce') ?? undefined

  return (
    <html lang={locale} nonce={nonce} suppressHydrationWarning>
      <body className={`${inter.variable} ${outfit.variable} antialiased font-sans`}>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <AuthProvider>
            <Toaster position="top-center" richColors />
            <main className="flex-1">{children}</main>
          </AuthProvider>
          <Analytics />
          <SpeedInsights />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
