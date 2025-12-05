/**
 * Migration: Add stripe_checkout_session_id to purchases table
 * 
 * Run this in Supabase SQL Editor if you get an error about
 * missing 'stripe_checkout_session_id' column
 */

-- Add stripe_checkout_session_id column if it doesn't exist
ALTER TABLE public.purchases 
ADD COLUMN IF NOT EXISTS stripe_checkout_session_id TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_purchases_stripe_checkout_session_id 
ON public.purchases(stripe_checkout_session_id);

-- Add comment for documentation
COMMENT ON COLUMN public.purchases.stripe_checkout_session_id IS 'Stripe checkout session ID for tracking the payment session';

