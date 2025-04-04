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
      const supabaseAnonKey =
        process.env.SUPABASE_SERVICE_ROLE_KEY!;
      // Get the role from Supabase database
      const supabase = await createClient(supabaseUrl, supabaseAnonKey);
      // Add logging to debug
      console.log("Searching for clerk_id:", userId);

      // First, check if any users exist at all
      const { data: allUsers, error: allUsersError } = await supabase
        .from("users")
        .select("id, clerk_id, role")
        .limit(10);
      console.log("Sample users in database:", allUsers);
      if (allUsersError) {
        console.error("Error fetching all users:", allUsersError);
      } else if (!allUsers || allUsers.length === 0) {
        console.error("No users found in the database at all!");
      } else {
        console.log(
          "Users exist in database. First user clerk_id:",
          allUsers[0].clerk_id
        );
      }

      // Now try the specific user query
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .ilike("clerk_id", userId)
        .limit(5);

      console.log("Query results for", userId, ":", data);

      // Try matching without case sensitivity
      if (!data || data.length === 0) {
        console.log("Trying alternative query approaches...");

        // Try exact match
        const { data: exactMatchData } = await supabase
          .from("users")
          .select("id, clerk_id, role")
          .eq("clerk_id", userId);
        console.log("Exact match query results:", exactMatchData);

        // Try without user_ prefix if it exists
        if (userId.startsWith("user_")) {
          const strippedId = userId.replace("user_", "");
          const { data: strippedData } = await supabase
            .from("users")
            .select("id, clerk_id, role")
            .ilike("clerk_id", strippedId);
          console.log("Stripped prefix query results:", strippedData);
        }
      }

      if (error) {
        console.error("Error checking admin role in database:", error);
        return NextResponse.redirect(new URL("/", req.url));
      }

      // If no user found or the user is not an admin, redirect to home page
      if (!data || data.length === 0) {
        console.error("User not found in database for clerk_id:", userId);
        return NextResponse.redirect(new URL("/", req.url));
      }

      // If the user is not an admin, redirect to home page
      if (data[0].role !== "admin") {
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
