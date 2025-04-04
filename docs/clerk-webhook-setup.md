# Setting Up Clerk Webhooks

This document explains how to set up and configure Clerk webhooks to synchronize user data with your Supabase database.

## Prerequisites

- A Clerk account with your application set up
- A Supabase project with the necessary tables
- Your application deployed to a publicly accessible URL (for webhooks)

## Setup Steps

### 1. Configure Environment Variables

Make sure you have the following environment variables set up in your `.env.local` file:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
CLERK_SECRET_KEY=your-clerk-secret-key
CLERK_WEBHOOK_SECRET=your-clerk-webhook-secret
```

### 2. Create a Webhook in Clerk Dashboard

1. Go to the [Clerk Dashboard](https://dashboard.clerk.dev/)
2. Select your application
3. Navigate to **Webhooks** in the sidebar
4. Click **Add Endpoint**
5. Enter your webhook URL: `https://your-domain.com/api/webhooks/clerk`
6. Select the following events:
   - `user.created`
   - `user.updated`
   - `user.deleted`
7. Click **Create**
8. Copy the **Signing Secret** and add it to your environment variables as `CLERK_WEBHOOK_SECRET`

### 3. Test the Webhook

To test if your webhook is working correctly:

1. Create a new user in your application
2. Check your server logs for webhook events
3. Verify that the user data is correctly stored in your Supabase database

## Handling Webhook Events

The webhook handles the following events:

- `user.created` - Creates a new user in Supabase
- `user.updated` - Updates the user data in Supabase
- `user.deleted` - Deletes the user from Supabase

## Troubleshooting

If you're experiencing issues with the webhook:

1. Check that your webhook URL is publicly accessible
2. Verify that your `CLERK_WEBHOOK_SECRET` is correctly set
3. Look at your server logs for any errors
4. Make sure your Supabase service role key has the necessary permissions
5. Check the Clerk Dashboard webhook logs for delivery status 