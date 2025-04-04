import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { WebhookEvent } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with admin key for webhook operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Insert or update a user in Supabase
async function upsertUser(user: any) {
  const userData = {
    clerk_id: user.id,
    email: user.email_addresses?.[0]?.email_address,
    first_name: user.first_name,
    last_name: user.last_name,
    name: user.first_name && user.last_name 
      ? `${user.first_name} ${user.last_name}` 
      : user.first_name || null,
    image_url: user.image_url,
    primary_email_address_id: user.primary_email_address_id,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('users')
    .upsert(userData, { onConflict: 'clerk_id' })
    .select()
    .single();

  if (error) {
    console.error('Error upserting user:', error);
    return null;
  }

  return data;
}

// Delete a user from Supabase
async function deleteUser(clerkId: string) {
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('clerk_id', clerkId);

  if (error) {
    console.error('Error deleting user:', error);
    return false;
  }

  return true;
}

export async function POST(req: Request) {
  // Get the Clerk webhook secret from environment variables
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  
  if (!WEBHOOK_SECRET) {
    console.error('CLERK_WEBHOOK_SECRET is missing!');
    return new NextResponse('Webhook secret not provided', { status: 500 });
  }

  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new NextResponse('Missing svix headers', { status: 400 });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new SVIX instance with your webhook secret
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the webhook payload
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new NextResponse('Error verifying webhook', { status: 400 });
  }

  // Handle the webhook event
  const eventType = evt.type;
  
  console.log(`Webhook received: ${eventType}`);
  
  switch (eventType) {
    case 'user.created':
      await upsertUser(evt.data);
      break;
    case 'user.updated':
      await upsertUser(evt.data);
      break;
    case 'user.deleted':
      await deleteUser(evt.data.id);
      break;
  }
  
  return NextResponse.json({ success: true, eventType });
} 