# Stripe Payment Implementation Guide

This document provides a complete overview of the Stripe payment integration for Inspired Intelligence Academy.

## 📁 File Structure

```
inspired-intelligence-academy/
├── supabase/
│   └── functions/
│       ├── create-checkout/
│       │   └── index.ts          # Creates Stripe checkout sessions
│       └── stripe-webhook/
│           └── index.ts           # Handles Stripe webhook events
├── database/
│   ├── payments-schema.sql        # Payments table schema
│   └── purchases-schema.sql       # Updated with Stripe fields
├── lib/
│   └── stripe.ts                  # Frontend Stripe utilities
├── components/
│   └── CheckoutButton.tsx         # Checkout button component
├── app/
│   └── checkout/
│       ├── success/
│       │   └── page.tsx           # Success page after payment
│       └── cancel/
│           └── page.tsx           # Cancel page
└── STRIPE_SETUP.md                # Setup instructions
```

## 🔧 Setup Instructions

### Step 1: Stripe Account Setup

Follow the instructions in `STRIPE_SETUP.md` to:
1. Create a Stripe account
2. Get your API keys
3. Store them securely in Supabase Vault

### Step 2: Database Setup

1. Run the payments schema:
   ```sql
   -- In Supabase SQL Editor
   -- Run: database/payments-schema.sql
   ```

2. Update the purchases table:
   ```sql
   -- In Supabase SQL Editor
   -- Run: database/purchases-schema.sql (updated version)
   ```

3. Update the profiles table:
   ```sql
   -- Add stripe_customer_id column if not exists
   ALTER TABLE public.profiles 
   ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
   ```

### Step 3: Set Secrets for Edge Functions

**⚠️ CRITICAL**: Edge Functions require CLI secrets, NOT Dashboard Vault!

1. **Install Supabase CLI** (if not already installed):
   ```bash
   npm install -g supabase
   ```

2. **Login and link your project**:
   ```bash
   supabase login
   supabase link --project-ref your-project-ref
   ```
   (Find your project ref in your Supabase Dashboard URL)

3. **Set Stripe secret key**:
   ```bash
   supabase secrets set STRIPE_SECRET_KEY=sk_test_...
   ```
   (Replace `sk_test_...` with your actual Stripe secret key)

4. **Set webhook secret** (after configuring webhook in Step 6):
   ```bash
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
   ```
   (For local testing, use the secret from `stripe listen`. For production, use the secret from Stripe Dashboard)

5. **Verify secrets are set**:
   ```bash
   supabase secrets list
   ```

**Note**: CLI secrets are available immediately - no redeployment needed!

### Step 4: Environment Variables

Update your `.env.local`:
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Step 5: Deploy Edge Functions

#### Option A: Using Supabase CLI (Recommended)

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Login to Supabase:
   ```bash
   supabase login
   ```

3. Link your project:
   ```bash
   supabase link --project-ref your-project-ref
   ```

4. Deploy functions:
   ```bash
   supabase functions deploy create-checkout
   supabase functions deploy stripe-webhook
   ```
   
   **Note**: Secrets set via CLI are available immediately - no redeployment needed when updating secrets!

#### Option B: Using Supabase Dashboard

1. Go to Supabase Dashboard → Edge Functions
2. Create new function: `create-checkout`
3. Paste the code from `supabase/functions/create-checkout/index.ts`
4. Create new function: `stripe-webhook`
5. Paste the code from `supabase/functions/stripe-webhook/index.ts`

### Step 6: Configure Stripe Webhook

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. Enter your Edge Function URL:
   ```
   https://[your-project-ref].supabase.co/functions/v1/stripe-webhook
   ```
4. Select events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy the webhook signing secret
6. Add it to Supabase Vault as `STRIPE_WEBHOOK_SECRET`

## 🔄 Payment Flow

1. **User clicks "Buy Now"** on a product
2. **Frontend calls** `createCheckoutSession()` from `lib/stripe.ts`
3. **Edge Function** (`create-checkout`) creates Stripe checkout session
4. **User redirected** to Stripe Checkout page
5. **User completes payment** on Stripe
6. **Stripe sends webhook** to `stripe-webhook` Edge Function
7. **Webhook handler**:
   - Updates payment record
   - Creates purchase record
   - Links payment to purchase
8. **User redirected** to success page
9. **Product appears** in user's dashboard

## 🧪 Testing

### Test Cards

Use these test cards in Stripe test mode:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`

Use any future expiry date and any 3-digit CVC.

### Testing Webhooks Locally

1. Install Stripe CLI
2. Forward webhooks:
   ```bash
   stripe listen --forward-to http://localhost:54321/functions/v1/stripe-webhook
   ```
3. Use the webhook secret from the CLI output

## 🔒 Security Features

✅ **Implemented:**
- Webhook signature verification
- User authentication checks
- RLS policies on payments table
- Secure key storage in Supabase Vault
- HTTPS-only in production

## 📊 Database Tables

### `payments`
Stores all payment records from Stripe:
- Payment status tracking
- Stripe IDs (payment intent, checkout session, customer)
- Product information
- User association

### `purchases`
Stores completed purchases:
- Product details
- Purchase date
- User association
- Linked to payment record

## 🐛 Troubleshooting

### "Edge Function not found"
- Verify functions are deployed
- Check function names match exactly
- Ensure Supabase project URL is correct

### "Webhook signature verification failed"
- Verify webhook secret in Vault matches Stripe
- Check you're using the correct environment (test vs live)

### "Payment created but purchase not showing"
- Check webhook is configured correctly
- Verify webhook events are being received
- Check Edge Function logs in Supabase Dashboard

### "User not authenticated"
- Ensure user is logged in before checkout
- Check authentication token is being sent

## 📝 Next Steps

Consider adding:
- Subscription support (recurring payments)
- Coupon/promotion code support (partially implemented)
- Refund handling
- Payment history page
- Email receipts
- Invoice generation

