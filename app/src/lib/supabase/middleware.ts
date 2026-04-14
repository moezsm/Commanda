import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const url = request.nextUrl.clone()
  const isAuthRoute =
    url.pathname.startsWith('/sign-in') || url.pathname.startsWith('/sign-up')
  const isProtectedRoute =
    url.pathname.startsWith('/home') ||
    url.pathname.startsWith('/orders') ||
    url.pathname.startsWith('/customers') ||
    url.pathname.startsWith('/settings') ||
    url.pathname.startsWith('/onboarding') ||
    url.pathname.startsWith('/upgrade')

  if (!user && isProtectedRoute) {
    url.pathname = '/sign-in'
    return NextResponse.redirect(url)
  }

  if (user && isAuthRoute) {
    url.pathname = '/home'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
