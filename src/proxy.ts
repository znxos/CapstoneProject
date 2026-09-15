import { NextResponse } from "next/server"
import type { NextRequest } from 'next/server'

export function proxy(req: NextRequest) {
  const token = req.cookies.get('access_token');
  const isAuth = !!token;
  const pathname = req.nextUrl.pathname;
  
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup') || pathname.startsWith('/forgot-password');
  const isProtectedRoute = pathname.startsWith('/events') || pathname.startsWith('/profile') || pathname.startsWith('/chat') || pathname.startsWith('/onboarding');
  
  // Redirect authenticated users away from auth pages
  if (isAuthPage && isAuth) {
    return NextResponse.redirect(new URL('/events', req.url));
  }

  // Redirect unauthenticated users away from protected pages
  if (isProtectedRoute && !isAuth) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  
  // Inject Server-to-Server API Key for backend requests
  if (pathname.startsWith('/api/')) {
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('X-API-Key', process.env.API_SECRET_KEY || '');
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      }
    });
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/:path*",
    "/onboarding/:path*",
    "/events/:path*",
    "/profile/:path*",
    "/chat/:path*",
    "/login",
    "/signup",
    "/forgot-password"
  ]
}
