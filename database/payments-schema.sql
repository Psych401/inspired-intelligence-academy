/**
 * Payments Database Schema
 * 
 * Run this SQL in your Supabase SQL Editor to create the payments table
 * and set up Row Level Security (RLS) policies.
 * 
 * This table stores payment records from Stripe for tracking and reconciliation.
 */

-- Create payments table
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  purchase_id UUID REFERENCES public.purchases(id) ON DELETE SET NULL,
  
  -- Stripe information
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_checkout_session_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  
  -- Payment details
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'eur' NOT NULL,
  status TEXT NOT NULL, -- 'pending', 'succeeded', 'failed', 'canceled', 'refunded'
  
  -- Product information (denormalized for quick access)
  product_id TEXT NOT NULL,
  product_title TEXT NOT NULL,
  
  -- Metadata
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_payment_intent_id ON public.payments(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_checkout_session_id ON public.payments(stripe_checkout_session_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON public.payments(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can view their own payments
CREATE POLICY "Users can view own payments"
  ON public.payments
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy: Service role can insert payments (for webhooks)
-- Note: This allows the Edge Function (using service role) to insert payments
CREATE POLICY "Service role can insert payments"
  ON public.payments
  FOR INSERT
  WITH CHECK (true);

-- Create policy: Service role can update payments (for webhooks)
CREATE POLICY "Service role can update payments"
  ON public.payments
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_payments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER set_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_payments_updated_at();

