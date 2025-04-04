import { authMiddleware, clerkClient } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export default authMiddleware({
  // Public routes that don't require authentication
  publicRoutes: [
    "/",
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/api/webhooks(.*)",
    "/products",
    "/products/(.*)",
    "/collections",
    "/collections/(.*)",
    "/categories",
    "/categories/(.*)",
  ],
  ignoredRoutes: [
    "/api/webhooks/clerk",
  ],
  async afterAuth(auth, req) {
    // If the user is not authenticated and trying to access a protected route
    if (!auth.userId && !auth.isPublicRoute) {
      const signInUrl = new URL('/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', req.url);
      return NextResponse.redirect(signInUrl);
    }

    // Check if user is trying to access admin routes
    if (auth.userId && req.nextUrl.pathname.startsWith('/admin')) {
      try {
        const user = await clerkClient.users.getUser(auth.userId);
        const role = user?.publicMetadata?.role as string;
        
        // If the user is not an admin, redirect to home page
        if (role !== 'admin') {
          return NextResponse.redirect(new URL('/', req.url));
        }
      } catch (error) {
        console.error('Error checking admin role:', error);
        return NextResponse.redirect(new URL('/', req.url));
      }
    }

    return NextResponse.next();
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};