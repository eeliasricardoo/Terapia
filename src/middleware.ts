import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

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

  const {
    data: { user },
  } = await supabase.auth.getUser()
  const session = !!user
  const { pathname } = request.nextUrl

  // Protect dashboard and admin routes
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
    if (!session) {
      const url = request.nextUrl.clone()
      url.pathname = '/login/paciente'
      return NextResponse.redirect(url)
    }

    // Direct unconfirmed users to verification if they somehow have a session
    if (user && !user.email_confirmed_at && !pathname.includes('confirmar-email')) {
      const url = request.nextUrl.clone()
      url.pathname = '/cadastro/confirmar-email'
      url.searchParams.set('email', user.email || '')
      return NextResponse.redirect(url)
    }
  }

  // Redirect authenticated users away from home, login, and register pages
  // BUT allow them to access onboarding/profile completion and verification
  if (
    (pathname === '/' || pathname.startsWith('/login') || pathname.startsWith('/cadastro')) &&
    session &&
    !pathname.includes('completar-perfil') &&
    !pathname.includes('onboarding') &&
    !pathname.includes('confirmar-email') &&
    !pathname.includes('reset-password')
  ) {
    // Only redirect if email is confirmed
    if (user.email_confirmed_at) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
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
