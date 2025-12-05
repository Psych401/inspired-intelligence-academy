# Supabase Setup Instructions

This guide will walk you through setting up Supabase for the Inspired Intelligence Academy application.

## Prerequisites

- A Supabase account (sign up at [supabase.com](https://supabase.com))
- Node.js and npm installed

## Step 1: Create a Supabase Project

1. Go to [app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Fill in your project details:
   - **Name**: Inspired Intelligence Academy (or your preferred name)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose the region closest to your users
4. Click "Create new project"
5. Wait for the project to be created (this may take a few minutes)

## Step 2: Get Your API Keys

1. In your Supabase project dashboard, go to **Settings** → **API**
2. You'll need two values:
   - **Project URL** (under "Project URL")
   - **anon/public key** (under "Project API keys" → "anon public")

3. Copy these values - you'll need them for your `.env.local` file

## Step 3: Set Up Environment Variables

1. Create a `.env.local` file in the root of your project (if it doesn't exist)
2. Add the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

Replace `your_project_url_here` and `your_anon_key_here` with the values from Step 2.

**Important**: Never commit `.env.local` to version control. It's already in `.gitignore`.

## Step 4: Set Up the Database

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy and paste the contents of `database/schema.sql`
4. Click "Run" (or press Ctrl+Enter)
5. You should see "Success. No rows returned"

6. Now create the purchases table for tracking user purchases:
   - In the SQL Editor, create a new query
   - Copy and paste the contents of `database/purchases-schema.sql`
   - Click "Run"
   - You should see "Success. No rows returned"

7. Create the payments table for Stripe payment tracking:
   - In the SQL Editor, create a new query
   - Copy and paste the contents of `database/payments-schema.sql`
   - Click "Run"
   - You should see "Success. No rows returned"

8. Update the profiles table to include Stripe customer ID:
   - In the SQL Editor, run:
     ```sql
     ALTER TABLE public.profiles 
     ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
     ```

## Step 5: Set Up Storage for Profile Pictures

1. In your Supabase dashboard, go to **Storage**
2. Click "Create Bucket"
3. Configure the bucket:
   - **Name**: `avatars`
   - **Public bucket**: Toggle ON (so profile pictures are publicly accessible)
4. Click "Create bucket"
5. Go back to **SQL Editor**
6. Copy and paste the contents of `database/storage-setup.sql`
7. Click "Run"

## Step 6: Configure Authentication Settings

1. In your Supabase dashboard, go to **Authentication** → **URL Configuration**
2. Add your site URL:
   - **Site URL**: `http://localhost:3000` (for development)
   - **Redirect URLs**: Add the following:
     - `http://localhost:3000/auth/reset-password`
     - `http://localhost:3000/auth/callback`
     - `https://yourdomain.com/auth/reset-password` (for production)
     - `https://yourdomain.com/auth/callback` (for production)

3. Go to **Authentication** → **Email Templates** (optional)
   - Customize the email templates if desired
   - The default templates work fine

## Step 7: Install Dependencies

Run the following command in your project directory:

```bash
npm install
```

This will install the Supabase client library and other dependencies.

## Step 8: Test the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000/auth/signup`
3. Try creating a new account
4. Check your Supabase dashboard:
   - **Authentication** → **Users** - You should see the new user
   - **Table Editor** → **profiles** - You should see a new profile entry

## Troubleshooting

### Error: "Missing Supabase environment variables"
- Make sure your `.env.local` file exists and contains both `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Restart your development server after adding environment variables

### Error: "relation 'profiles' does not exist"
- Make sure you ran the SQL from `database/schema.sql` in the Supabase SQL Editor

### Error: "new row violates row-level security policy"
- Check that you've enabled RLS and created the policies as shown in `database/schema.sql`

### Profile picture upload fails
- Make sure you created the `avatars` storage bucket
- Verify the storage policies were created from `database/storage-setup.sql`
- Check that the bucket is set to "Public" if you want public access

### Email confirmation not working
- Check your Supabase project's email settings
- For development, you can disable email confirmation in **Authentication** → **Settings** → **Enable email confirmations** (toggle OFF)
- For production, set up SMTP settings in **Authentication** → **SMTP Settings**

## Production Deployment

When deploying to production:

1. Update your environment variables in your hosting platform (Vercel, Netlify, etc.)
2. Update the redirect URLs in Supabase to include your production domain
3. Consider setting up custom SMTP for email delivery
4. Review and adjust RLS policies as needed for your use case

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js with Supabase Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Supabase Auth Helpers for Next.js](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)

