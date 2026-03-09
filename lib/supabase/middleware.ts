import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options as Record<string, unknown>)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;

  // Not logged in, trying to access protected routes
  if (!user && (pathname.startsWith('/dashboard') || pathname.startsWith('/vote/ideas'))) {
    const loginPath = pathname.startsWith('/vote') ? '/vote/login' : '/login';
    const url = request.nextUrl.clone();
    url.pathname = loginPath;
    return NextResponse.redirect(url);
  }

  // Logged in, check role-based access
  if (user) {
    const role = (user.user_metadata?.role as string) || 'founder';

    // Guests cannot access /dashboard
    if (role === 'guest' && pathname.startsWith('/dashboard')) {
      const url = request.nextUrl.clone();
      url.pathname = '/vote/ideas';
      return NextResponse.redirect(url);
    }

    // Founders on /login redirect to /dashboard
    if (role === 'founder' && pathname === '/login') {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard/ideas';
      return NextResponse.redirect(url);
    }

    // Guests on /vote/login redirect to /vote/ideas
    if (role === 'guest' && pathname === '/vote/login') {
      const url = request.nextUrl.clone();
      url.pathname = '/vote/ideas';
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
