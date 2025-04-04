import { createClient } from '@supabase/supabase-js';
import { auth, currentUser } from '@clerk/nextjs';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Get the user details from Supabase by clerk_id
 */
export async function getUserByClerkId(clerkId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('clerk_id', clerkId)
    .single();

  if (error) {
    console.error('Error getting user from Supabase:', error);
    return null;
  }

  return data;
}

/**
 * Get the current authenticated user from Supabase
 */
export async function getCurrentUser() {
  const { userId } = auth();
  
  if (!userId) {
    return null;
  }

  return getUserByClerkId(userId);
}

/**
 * Sync Clerk user with Supabase
 * Use this when you need to ensure user exists in Supabase
 */
export async function syncUserWithSupabase() {
  const clerkUser = await currentUser();
  
  if (!clerkUser) {
    return null;
  }

  const supabaseUser = await getUserByClerkId(clerkUser.id);
  
  // If user exists in Supabase, return it
  if (supabaseUser) {
    return supabaseUser;
  }

  // Otherwise, create a new user in Supabase
  const primaryEmailAddress = clerkUser.emailAddresses.find(
    email => email.id === clerkUser.primaryEmailAddressId
  );

  const newUser = {
    clerk_id: clerkUser.id,
    email: primaryEmailAddress?.emailAddress,
    first_name: clerkUser.firstName,
    last_name: clerkUser.lastName,
    name: clerkUser.firstName && clerkUser.lastName 
      ? `${clerkUser.firstName} ${clerkUser.lastName}` 
      : clerkUser.firstName || null,
    image_url: clerkUser.imageUrl,
    role:clerkUser.publicMetadata.role || "user",
    primary_email_address_id: clerkUser.primaryEmailAddressId,
    email_verified_at: primaryEmailAddress?.emailAddress ? new Date().toISOString() : null,
  };

  const { data, error } = await supabase
    .from('users')
    .insert([newUser])
    .select()
    .single();

  if (error) {
    console.error('Error creating user in Supabase:', error);
    return null;
  }

  return data;
} 