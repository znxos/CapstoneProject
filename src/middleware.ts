import { NextResponse } from "next/server"
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
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
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/onboarding/:path*",
    "/events/:path*",
    "/profile/:path*",
    "/chat/:path*",
    "/login",
    "/signup",
    "/forgot-password"
  ]
}
