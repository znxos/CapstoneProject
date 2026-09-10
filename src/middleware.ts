import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const isAuth = !!req.nextauth.token;
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
  },
  {
    callbacks: {
      // Let the middleware function above handle the routing logic
      authorized: () => true,
    }
  }
)

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
