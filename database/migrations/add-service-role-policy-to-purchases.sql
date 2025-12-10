/**
 * Migration: Add Service Role Policy to Purchases Table
 * 
 * This allows the Stripe webhook (using service role) to create purchase records.
 * Run this in your Supabase SQL Editor.
 */

-- Create policy: Service role can insert purchases (for webhooks)
CREATE POLICY "Service role can insert purchases"
  ON public.purchases
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- Create policy: Service role can select purchases (for webhooks to verify)
CREATE POLICY "Service role can select purchases"
  ON public.purchases
  FOR SELECT
  USING (auth.role() = 'service_role');

