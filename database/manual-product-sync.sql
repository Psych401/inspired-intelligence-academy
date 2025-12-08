/**
 * Manual Product Sync Script
 * 
 * If products aren't syncing automatically via webhook,
 * you can manually sync existing Stripe products using this script.
 * 
 * NOTE: This requires running from a server/Edge Function with Stripe API access.
 * For manual sync, use the Stripe CLI or create a one-time sync script.
 */

-- Check if products exist in database
SELECT 
  stripe_product_id,
  name,
  price,
  active,
  created_at
FROM public.products
ORDER BY created_at DESC;

-- To manually insert a product (replace values):
-- INSERT INTO public.products (
--   stripe_product_id,
--   name,
--   description,
--   price,
--   currency,
--   category,
--   image_url,
--   active
-- ) VALUES (
--   'prod_xxxxx',  -- Your Stripe product ID
--   'Product Name',
--   'Product description',
--   29.99,
--   'eur',
--   'Full Course',  -- Category from metadata
--   'https://example.com/image.jpg',
--   true
-- )
-- ON CONFLICT (stripe_product_id) DO UPDATE SET
--   name = EXCLUDED.name,
--   description = EXCLUDED.description,
--   price = EXCLUDED.price,
--   updated_at = NOW();

