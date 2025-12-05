/**
 * Purchases/Orders Database Schema
 * 
 * Run this SQL in your Supabase SQL Editor to create the purchases table
 * and set up Row Level Security (RLS) policies.
 */

-- Create purchases table
CREATE TABLE IF NOT EXISTS public.purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id TEXT NOT NULL,
  product_title TEXT NOT NULL,
  product_description TEXT,
  product_price DECIMAL(10, 2) NOT NULL,
  product_category TEXT NOT NULL,
  product_image_url TEXT,
  stripe_checkout_session_id TEXT,
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON public.purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_purchased_at ON public.purchases(purchased_at DESC);

-- Enable Row Level Security
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can view their own purchases
CREATE POLICY "Users can view own purchases"
  ON public.purchases
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy: Users can insert their own purchases
CREATE POLICY "Users can insert own purchases"
  ON public.purchases
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Note: We don't allow updates or deletes of purchases to maintain purchase history integrity

