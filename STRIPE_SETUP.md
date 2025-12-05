# Stripe Payment Integration Setup Guide

This guide will walk you through setting up Stripe payments for your Inspired Intelligence Academy application.

## Step 1: Create a Stripe Account

1. Go to [https://stripe.com](https://stripe.com)
2. Click "Start now" or "Sign in" if you already have an account
3. Fill in your business details:
   - Business name
   - Country/region
   - Business type
   - Email address
4. Complete the account setup process
5. Verify your email address

## Step 2: Get Your Stripe API Keys

### For Development (Test Mode)

1. Log into your Stripe Dashboard: [https://dashboard.stripe.com](https://dashboard.stripe.com)
2. Make sure you're in **Test mode** (toggle in the top right)
3. Go to **Developers** → **API keys**
4. You'll see two keys:
   - **Publishable key** (starts with `pk_test_...`)
   - **Secret key** (starts with `sk_test_...`) - Click "Reveal test key" to see it

### For Production

1. Switch to **Live mode** in the Stripe Dashboard
2. Go to **Developers** → **API keys**
3. Get your live keys:
   - **Publishable key** (starts with `pk_live_...`)
   - **Secret key** (starts with `sk_live_...`)

⚠️ **Important**: Never commit your secret keys to version control!

## Step 3: Store Keys Securely

### Option 1: Supabase CLI Secrets (Required for Edge Functions)

**⚠️ CRITICAL**: Edge Functions require secrets set via CLI, NOT Dashboard Vault!

The Dashboard Vault is for database-level secrets. Edge Functions need CLI secrets.

1. **Install and login to Supabase CLI** (if not already done):
   ```bash
   npm install -g supabase
   supabase login
   ```

2. **Link your project**:
   ```bash
   supabase link --project-ref your-project-ref
   ```
   (Find your project ref in the Supabase Dashboard URL)

3. **Set the Stripe secret key**:
   ```bash
   supabase secrets set STRIPE_SECRET_KEY=sk_test_...
   ```
   (Replace `sk_test_...` with your actual Stripe secret key)

4. **Verify the secret was set**:
   ```bash
   supabase secrets list
   ```
   You should see `STRIPE_SECRET_KEY` in the list.

**Note**: Secrets set via CLI are available immediately - no redeployment needed!

5. Add the publishable key as an environment variable (see Option 2)

### Option 2: Environment Variables (For Frontend)

1. In your project root, create/update `.env.local`:
   ```env
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

2. For Supabase Edge Functions, use the Vault (Option 1) for the secret key

## Step 4: Install Stripe CLI (For Testing Webhooks Locally)

1. Download from: [https://stripe.com/docs/stripe-cli](https://stripe.com/docs/stripe-cli)
2. Install and authenticate:
   ```bash
   stripe login
   ```
3. Forward webhooks to your local Edge Function:
   ```bash
   stripe listen --forward-to http://localhost:54321/functions/v1/stripe-webhook
   ```

## Step 5: Configure Stripe Webhooks

1. Go to Stripe Dashboard → **Developers** → **Webhooks**
2. Click "Add endpoint"
3. For production, use your Supabase Edge Function URL:
   ```
   https://[your-project-ref].supabase.co/functions/v1/stripe-webhook
   ```
4. Select events to listen for:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy the **Webhook signing secret** (starts with `whsec_...`)
6. Set it via Supabase CLI:
   ```bash
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
   ```

**For Local Testing with Stripe CLI:**
- When you run `stripe listen --forward-to http://localhost:54321/functions/v1/stripe-webhook`
- The CLI will output a webhook signing secret (different from Dashboard)
- Use that CLI secret: `supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...`
- This secret is only valid while the CLI is running

## Step 6: Deploy Edge Functions

See the deployment instructions in the Edge Function files.

## Step 7: Test Your Integration

1. Use Stripe test cards: [https://stripe.com/docs/testing](https://stripe.com/docs/testing)
2. Test successful payment: `4242 4242 4242 4242`
3. Test declined card: `4000 0000 0000 0002`
4. Use any future expiry date and any 3-digit CVC

## Security Best Practices

✅ **DO:**
- Store secret keys in Supabase Vault or secure environment variables
- Use test keys for development
- Verify webhook signatures
- Use HTTPS in production
- Log payment events for debugging

❌ **DON'T:**
- Commit secret keys to git
- Expose secret keys in frontend code
- Skip webhook signature verification
- Use production keys in development

## Troubleshooting

### "STRIPE_SECRET_KEY is not set" (Most Common Issue)

**The Problem**: You likely added the secret to Dashboard Vault, but Edge Functions need CLI secrets!

**The Solution**:

1. **Set the secret using Supabase CLI** (NOT Dashboard Vault):
   ```bash
   # Make sure you're logged in and linked
   supabase login
   supabase link --project-ref your-project-ref
   
   # Set the secret
   supabase secrets set STRIPE_SECRET_KEY=sk_test_...
   
   # Verify it was set
   supabase secrets list
   ```

2. **Important Notes**:
   - Dashboard Vault is for **database** secrets, not Edge Functions
   - CLI secrets are available immediately (no redeployment needed)
   - The secret name must be exactly `STRIPE_SECRET_KEY` (case-sensitive)

3. **If still not working**:
   - Check function logs: Supabase Dashboard → Edge Functions → Your function → Logs
   - Verify you're using the correct project ref when linking
   - Make sure there are no extra spaces in the secret value

### "Invalid API Key"
- Check you're using the correct key (test vs live)
- Verify the key is correctly stored in Vault
- Make sure there are no extra spaces or quotes

### "Webhook signature verification failed"
- Verify the webhook secret in Supabase Vault matches Stripe
- Check that you're using the correct signing secret for your environment

### "Edge Function not found"
- Make sure you've deployed the Edge Functions
- Check the function names match exactly
- Verify your Supabase project URL is correct

