import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { Database } from '@/types/supabase'

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient<Database>({ req: request, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Rotas que requerem autenticação
  const authRoutes = ['/profile', '/bookings', '/messages']

  // Rotas que requerem permissões de admin
  const adminRoutes = ['/admin']

  const path = request.nextUrl.pathname

  // Redirecionar para login se não estiver autenticado em rotas protegidas
  if (authRoutes.some((route) => path.startsWith(route)) && !session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Verificar permissões de admin para rotas administrativas
  if (adminRoutes.some((route) => path.startsWith(route))) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
} 