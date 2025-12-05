# Stripe Payment Integration - Quick Start Guide

## 🚀 Quick Setup (5 Steps)

### 1. Get Stripe Keys
- Go to [Stripe Dashboard](https://dashboard.stripe.com) (Test Mode)
- Copy your **Publishable Key** (`pk_test_...`)
- Copy your **Secret Key** (`sk_test_...`)

### 2. Add to Environment
- Add to `.env.local`:
  ```env
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
  ```

### 3. Set Secrets for Edge Functions

**CRITICAL**: Edge Functions use CLI secrets, NOT Dashboard Vault!

Secrets must be set using the Supabase CLI (not the Dashboard Vault):

```bash
# Make sure you're logged in and linked
supabase login
supabase link --project-ref your-project-ref

# Set Stripe secret key
supabase secrets set STRIPE_SECRET_KEY=sk_test_...

# Set webhook secret (after step 6)
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
```

**Verify secrets are set:**
```bash
supabase secrets list
```

**Note**: Dashboard Vault is for database-level secrets. Edge Functions require CLI secrets!

### 4. Run Database Scripts
In Supabase SQL Editor, run:
1. `database/payments-schema.sql`
2. Update profiles table:
   ```sql
   ALTER TABLE public.profiles 
   ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
   ```

### 5. Deploy Edge Functions

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref your-project-ref

# Deploy functions
supabase functions deploy create-checkout
supabase functions deploy stripe-webhook
```

**Note**: Secrets set via `supabase secrets set` are available immediately - no redeployment needed!

### 6. Configure Webhook

**For Production:**
- Stripe Dashboard → Webhooks → Add endpoint
- URL: `https://[your-project-ref].supabase.co/functions/v1/stripe-webhook`
- Events: `checkout.session.completed`, `payment_intent.succeeded`, `payment_intent.payment_failed`
- Copy webhook secret → Set via CLI: `supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...`

**For Local Testing:**
- Run: `stripe listen --forward-to http://localhost:54321/functions/v1/stripe-webhook`
- Copy the webhook signing secret from the CLI output
- Set it: `supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...` (use the CLI secret, not Dashboard)

## ✅ Test It

1. Go to `/shop`
2. Click "Buy Now" on any product
3. Use test card: `4242 4242 4242 4242`
4. Complete checkout
5. Check your dashboard - product should appear!

## 📚 Full Documentation

- **Setup Guide**: `STRIPE_SETUP.md`
- **Implementation Details**: `STRIPE_IMPLEMENTATION.md`

