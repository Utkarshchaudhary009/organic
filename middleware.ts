import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Define public routes that don't require authentication
const publicRoutes = createRouteMatcher([
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
]);

// Define admin routes
const adminRoutes = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  // If the user is not authenticated and trying to access a protected route
  if (!userId && !publicRoutes(req)) {
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("redirect_url", req.url);
    return NextResponse.redirect(signInUrl);
  }

  // Check if user is trying to access admin routes
  if (userId && adminRoutes(req)) {
    try {
      // Supabase client for client-side usage
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      // Get the role from Supabase database
      const supabase = await createClient(supabaseUrl, supabaseAnonKey);
      const { data, error } = await supabase
        .from("users")
        .select("role")
        .eq("clerk_id", userId)
        .single();

      if (error || !data) {
        console.error("Error checking admin role in database:", error);
        return NextResponse.redirect(new URL("/", req.url));
      }

      // If the user is not an admin, redirect to home page
      if (data.role !== "admin") {
        return NextResponse.redirect(new URL("/", req.url));
      }
    } catch (error) {
      console.error("Error checking admin role:", error);
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
