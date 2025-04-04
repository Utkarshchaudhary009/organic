
import { useAuth } from "@clerk/nextjs";

import { UserRole } from "@/utils/roles";
import { supabase } from "@/lib/tanstack/supabase";
export async function getUserRole(): Promise<UserRole | null> {
  try {
    const user = await useAuth();

    if (!user) {
      return null;
    }

    // Get user role from Supabase database
    const { data, error } = await supabase
      .from("users")
      .select("role")
      .eq("clerk_id", user.userId);
    
      console.log(data)
      console.log(user)
      console.log(await supabase
        .from("users")
        .select("*"))

    if (error || !data) {
      console.error("Error fetching role from database:", error);
      return null;
    }

    return (data[0].role as UserRole) || null;
  } catch (error) {
    console.error("Error getting user role:", error);
    return null;
  }
}