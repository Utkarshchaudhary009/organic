import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/utils/supabase/server';

/**
 * Role types for the application
 */
export type Role = 'user' | 'admin';

/**
 * Check if the current user has a specific role
 * @param role The role to check for
 * @returns A boolean indicating if the user has the specified role
 */
export async function checkRole(role: Role): Promise<boolean> {
  try {
    // Get the Clerk auth session
    const { userId } = auth();
    
    // If no user is logged in, return false
    if (!userId) {
      return false;
    }
    
    // Get the user from Supabase using the Clerk ID
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('clerk_id', userId)
      .single();
    
    if (error || !data) {
      console.error('Error fetching user role:', error);
      return false;
    }
    
    // Check if the user's role matches the requested role
    return data.role === role;
  } catch (error) {
    console.error('Error in checkRole:', error);
    return false;
  }
}

/**
 * Check if the current user is an admin
 * @returns A boolean indicating if the user is an admin
 */
export async function isAdmin(): Promise<boolean> {
  return checkRole('admin');
}

/**
 * Set a user's role in the database
 * @param clerkId The Clerk ID of the user
 * @param role The role to set
 * @returns A boolean indicating success
 */
export async function setUserRole(clerkId: string, role: Role): Promise<boolean> {
  try {
    // Only allow admins to set roles
    if (!(await isAdmin())) {
      console.error('Permission denied: Only admins can set roles');
      return false;
    }
    
    const supabase = await createClient();
    const { error } = await supabase
      .from('users')
      .update({ role })
      .eq('clerk_id', clerkId);
    
    if (error) {
      console.error('Error setting user role:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in setUserRole:', error);
    return false;
  }
} 