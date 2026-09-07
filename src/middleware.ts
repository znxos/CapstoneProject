export { default } from "next-auth/middleware"

export const config = {
  matcher: [
   "/onboarding/:path*",
    "/events/:path*",
    "/profile/:path*",
    "/chat/:path*"
  ]
}
