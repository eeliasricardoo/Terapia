import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import createIntlMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

const handleI18nRouting = createIntlMiddleware(routing)

export async function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
  const isDevelopment = process.env.NODE_ENV === 'development'
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' https://js.stripe.com https://*.daily.co https://*.pluot.blue blob: data: 'wasm-unsafe-eval' https://vercel.live${isDevelopment ? " 'unsafe-inline' 'unsafe-eval'" : ''};
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://vercel.live https://*.daily.co data:;
    font-src 'self' https://fonts.gstatic.com data: https://*.daily.co;
    img-src 'self' data: blob: https://*.supabase.co https://*.stripe.com https://i.pravatar.cc https://images.unsplash.com https://*.daily.co;
    connect-src 'self'${isDevelopment ? ' http://localhost:*' : ''} https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://*.daily.co wss://*.daily.co https://*.pluot.blue wss://*.pluot.blue https://*.upstash.io https://vercel.live wss://*.pusher.com blob: data:;
    frame-src 'self' https://js.stripe.com https://*.daily.co https://vercel.live;
    child-src 'self' blob: https://js.stripe.com https://*.daily.co https://vercel.live;
    media-src 'self' blob: https://*.daily.co;
    worker-src 'self' blob: https://*.daily.co https://*.pluot.blue;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    ${isDevelopment ? '' : 'upgrade-insecure-requests;'}
  `
    .replace(/\s{2,}/g, ' ')
    .trim()

  // Attach headers to request before Intl handles it
  request.headers.set('x-nonce', nonce)
  request.headers.set('Content-Security-Policy', cspHeader)

  // 1. Run i18n middleware
  let response = handleI18nRouting(request)

  // 2. Set security headers on the response
  response.headers.set('Content-Security-Policy', cspHeader)

  // 3. Supabase Auth
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Prefer getClaims() — validates JWT locally (no network round-trip) when the
  // project uses asymmetric keys. Falls back to getUser() otherwise.
  const { data: claimsData } = await supabase.auth.getClaims()

  let user: {
    id: string
    email?: string
    email_confirmed_at?: string | null
    user_metadata?: Record<string, unknown>
    app_metadata?: Record<string, unknown>
  } | null = null

  if (claimsData?.claims) {
    const c = claimsData.claims as Record<string, unknown>
    user = {
      id: c.sub as string,
      email: c.email as string | undefined,
      email_confirmed_at: (c.email_confirmed_at ?? c.email_verified) as string | null | undefined,
      user_metadata: (c.user_metadata as Record<string, unknown>) ?? {},
      app_metadata: (c.app_metadata as Record<string, unknown>) ?? {},
    }
  } else {
    const { data } = await supabase.auth.getUser()
    user = data.user as typeof user
  }

  const session = !!user

  // Extract custom route logic skipping locale
  const { pathname } = request.nextUrl
  const segments = pathname.split('/')
  const hasLocale = ['pt', 'es'].includes(segments[1])
  const localePrefix = hasLocale ? `/${segments[1]}` : ''
  const pathnameWithoutLocale = hasLocale ? `/${segments.slice(2).join('/')}` : pathname

  // ── Helper: redirect while preserving Supabase session cookies ───
  // Every redirect MUST use this helper; otherwise the refreshed JWT
  // cookies that Supabase set on `response` are silently dropped and
  // the destination page won't see a valid session.
  function redirectWithCookies(url: URL) {
    const redirectResponse = NextResponse.redirect(url)
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value)
    })
    return redirectResponse
  }

  // Protect dashboard and admin routes
  if (
    pathnameWithoutLocale.startsWith('/dashboard') ||
    pathnameWithoutLocale.startsWith('/admin')
  ) {
    if (!session) {
      const url = request.nextUrl.clone()
      url.pathname = `${localePrefix}/login/paciente`
      return redirectWithCookies(url)
    }

    /* 
    // Direct unconfirmed users to verification if they somehow have a session
    if (user && !user.email_confirmed_at && !pathnameWithoutLocale.includes('confirmar-email')) {
      const url = request.nextUrl.clone()
      url.pathname = `${localePrefix}/cadastro/confirmar-email`
      url.searchParams.set('email', user.email || '')
      return redirectWithCookies(url)
    }
    */

    // ── RBAC: Role-Based Access Control ──────────────────────────────
    // Read role from JWT metadata (set at signup, no extra DB call needed)
    const userRole =
      (user?.user_metadata?.role as string) || (user?.app_metadata?.role as string) || 'PATIENT'

    // Admin routes: only ADMIN role
    if (pathnameWithoutLocale.startsWith('/dashboard/admin')) {
      if (userRole !== 'ADMIN') {
        const url = request.nextUrl.clone()
        url.pathname = `${localePrefix}/dashboard`
        url.searchParams.set('error', 'forbidden')
        return redirectWithCookies(url)
      }
    }

    // Psychologist-only routes
    const psychologistOnlyRoutes = [
      '/dashboard/pacientes',
      '/dashboard/prontuario',
      '/dashboard/agenda',
    ]
    if (psychologistOnlyRoutes.some((route) => pathnameWithoutLocale.startsWith(route))) {
      if (userRole !== 'PSYCHOLOGIST' && userRole !== 'ADMIN') {
        const url = request.nextUrl.clone()
        url.pathname = `${localePrefix}/dashboard`
        url.searchParams.set('error', 'forbidden')
        return redirectWithCookies(url)
      }
    }

    // Company-only routes
    if (pathnameWithoutLocale.startsWith('/dashboard/empresa')) {
      if (userRole !== 'COMPANY' && userRole !== 'ADMIN') {
        const url = request.nextUrl.clone()
        url.pathname = `${localePrefix}/dashboard`
        url.searchParams.set('error', 'forbidden')
        return redirectWithCookies(url)
      }
    }
  }

  // Redirect authenticated users away from landing, login and register pages
  if (
    (pathnameWithoutLocale === '/' ||
      pathnameWithoutLocale === '' ||
      pathnameWithoutLocale.startsWith('/login') ||
      pathnameWithoutLocale.startsWith('/cadastro')) &&
    session &&
    !pathnameWithoutLocale.includes('completar-perfil') &&
    !pathnameWithoutLocale.includes('onboarding') &&
    !pathnameWithoutLocale.includes('confirmar-email') &&
    !pathnameWithoutLocale.includes('reset-password')
  ) {
    const url = request.nextUrl.clone()
    url.pathname = `${localePrefix}/dashboard`
    return redirectWithCookies(url)
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
