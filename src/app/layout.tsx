import type { Metadata } from 'next'
import { Inter, Outfit } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/providers/auth-provider'
import { Toaster } from 'sonner'
import { headers } from 'next/headers'

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
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    default: 'MindCare - Terapia Online | Sua mente, nosso cuidado.',
    template: '%s | Terapia',
  },
  description:
    'A Terapia é uma plataforma que conecta você a psicólogos qualificados para sessões de terapia online com total segurança, sigilo e praticidade.',
  keywords: [
    'terapia online',
    'psicólogo online',
    'saúde mental',
    'ansiedade',
    'depressão',
    'bem-estar',
  ],
  authors: [{ name: 'MindCare Team' }],
  creator: 'Terapia Plataforma',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: '/',
    siteName: 'Terapia',
    title: 'MindCare - Terapia Online de Alta Qualidade',
    description: 'Encontre psicólogos qualificados e comece sua jornada de autocuidado hoje mesmo.',
    images: [
      {
        url: '/og-image.png', // Deverá ser criada na branch de UI/UX
        width: 1200,
        height: 630,
        alt: 'MindCare Terapia Online',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MindCare - Terapia Online',
    description: 'Sessões de terapia online com total segurança e praticidade.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

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
      </body>
    </html>
  )
}
