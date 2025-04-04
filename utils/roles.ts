import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/utils/supabase/server';

/**
 * Role types for the application
 */
export type UserRole = 'admin' | 'moderator' | 'user';

/**
 * Check if the current user has a specific role
 * @param role The role to check for
 * @returns A boolean indicating if the user has the specified role
 */
export async function checkRole(role: UserRole): Promise<boolean> {
  const { sessionClaims } = await auth();
  return sessionClaims?.metadata?.role === role;
}

/**
 * Get the current user's role
 * @returns The user's role or null if no role is set
 */
export async function getUserRole(): Promise<UserRole | null> {
  const { sessionClaims } = await auth();
  return (sessionClaims?.metadata?.role as UserRole) || null;
}

/**
 * Check if the current user is an admin
 * @returns A boolean indicating if the user is an admin
 */
export async function isAdmin(): Promise<boolean> {
  return checkRole('admin');
}

/**
 * Check if the current user is a moderator
 * @returns A boolean indicating if the user is a moderator
 */
export async function isModerator(): Promise<boolean> {
  return checkRole('moderator') || checkRole('admin');
}

/**
 * Set a user's role in the database
 * @param clerkId The Clerk ID of the user
 * @param role The role to set
 * @returns A boolean indicating success
 */
export async function setUserRole(clerkId: string, role: UserRole): Promise<boolean> {
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