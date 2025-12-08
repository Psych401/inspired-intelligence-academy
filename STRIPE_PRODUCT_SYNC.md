# Stripe Product Sync Setup Guide

This guide explains how to set up automatic product synchronization from Stripe to your Supabase database.

## Overview

Products created, updated, or deleted in Stripe will automatically sync to your Supabase `products` table through webhook events. This allows you to manage products entirely from Stripe Dashboard.

## Setup Steps

### 1. Create Products Table

Run the products schema in your Supabase SQL Editor:

```sql
-- Run: database/products-schema.sql
```

This creates the `products` table with:
- Stripe product ID mapping
- Product details (name, description, price, category, images)
- Active status tracking
- Automatic timestamp updates

### 2. Configure Stripe Webhook Events

In your Stripe Dashboard → Webhooks → Your webhook endpoint:

Add these events:
- `product.created` - When a new product is created
- `product.updated` - When a product is updated
- `product.deleted` - When a product is deleted
- `price.created` - When a price is created
- `price.updated` - When a price is updated

**Note**: These events are in addition to your existing payment events:
- `checkout.session.completed`
- `payment_intent.succeeded`
- `payment_intent.payment_failed`

### 3. Create Products in Stripe

1. Go to Stripe Dashboard → Products
2. Click "Add product"
3. Fill in product details:
   - **Name**: Product title
   - **Description**: Product description
   - **Price**: Set the price
   - **Images**: Add product images
   - **Metadata**: Add `category` key with value (e.g., "Full Course", "PDF Guide", etc.)

4. The product will automatically sync to your database via webhook

### 4. Using Products in Your App

#### In Edge Functions

The `create-checkout` function now automatically fetches products from the database:

```typescript
// Products are fetched from database by stripe_product_id
const { data: products } = await supabaseClient
  .from('products')
  .select('*')
  .eq('active', true)
  .in('stripe_product_id', productIds);
```

#### Product ID Format

- **Stripe Product ID**: Use the Stripe product ID (e.g., `prod_xxxxx`) when calling checkout
- **Internal ID**: The database uses `stripe_product_id` as the primary identifier

### 5. Product Metadata

When creating products in Stripe, use metadata to set:
- `category`: Product category (e.g., "Full Course", "PDF Guide", "Custom GPT", "Mini-Course", "Bundle")

Example metadata in Stripe:
```
category: Full Course
```

## How It Works

### Product Sync Flow

1. **Create Product in Stripe** → `product.created` webhook → Product synced to database
2. **Update Product in Stripe** → `product.updated` webhook → Product updated in database
3. **Delete Product in Stripe** → `product.deleted` webhook → Product marked as inactive (not deleted)

### Price Sync Flow

1. **Create/Update Price in Stripe** → `price.created/updated` webhook → Product price updated in database

### Checkout Flow

1. **User adds to cart** → Uses Stripe product IDs
2. **Checkout initiated** → `create-checkout` fetches products from database
3. **Payment completed** → Webhook creates purchase records using database product data

## Database Schema

The `products` table structure:

```sql
- id: UUID (primary key)
- stripe_product_id: TEXT (unique, from Stripe)
- stripe_price_id: TEXT (from Stripe)
- name: TEXT (product name)
- description: TEXT (product description)
- price: DECIMAL(10, 2) (price in EUR)
- currency: TEXT (default: 'eur')
- category: TEXT (from metadata)
- image_url: TEXT (first image from Stripe)
- active: BOOLEAN (true/false)
- metadata: JSONB (all Stripe metadata)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

## Troubleshooting

### Products Not Syncing / Shop Shows "No Products"

**Most Common Issue**: Products created in Stripe haven't been synced to the database yet.

**Quick Fix - Manual Sync**:

1. **Deploy the sync-products function** (if not already deployed):
   ```bash
   supabase functions deploy sync-products
   ```

2. **Run manual sync**:
   ```bash
   # Get your project URL and service role key from Supabase Dashboard
   curl -X POST https://[your-project-ref].supabase.co/functions/v1/sync-products \
     -H "Authorization: Bearer [your-service-role-key]" \
     -H "apikey: [your-service-role-key]"
   ```

   Or use the Supabase Dashboard → Edge Functions → sync-products → Invoke

3. **Check webhook events**: Ensure these events are enabled in Stripe Dashboard → Webhooks:
   - `product.created`
   - `product.updated`
   - `product.deleted`
   - `price.created`
   - `price.updated`

4. **Verify RLS policies**: Run this in Supabase SQL Editor:
   ```sql
   -- Check if products table exists and has data
   SELECT COUNT(*) FROM public.products WHERE active = true;
   
   -- Check RLS policies
   SELECT * FROM pg_policies WHERE tablename = 'products';
   ```

5. **Check browser console**: Open browser DevTools → Console to see error messages

6. **Check Edge Function logs**: 
   - Supabase Dashboard → Edge Functions → stripe-webhook → Logs
   - Look for product sync errors

### Products Not Found During Checkout

1. **Verify product is active**: Check `active = true` in database
2. **Check product ID format**: Use Stripe product ID (starts with `prod_`)
3. **Verify sync**: Check if product exists in database after creating in Stripe

### Manual Product Sync

**Option 1: Use the sync-products Edge Function** (Recommended)

Deploy and run the `sync-products` function to manually sync all products:

```bash
supabase functions deploy sync-products
```

Then invoke it via Supabase Dashboard or API.

**Option 2: Use Stripe CLI to trigger webhooks**:

```bash
stripe trigger product.created
```

**Option 3: Check database directly**:

```sql
-- View all products
SELECT stripe_product_id, name, price, active, created_at 
FROM public.products 
ORDER BY created_at DESC;
```

## Best Practices

1. **Always set category in metadata** when creating products in Stripe
2. **Use descriptive product names** that match your app's display
3. **Add product images** in Stripe for better display
4. **Test webhook events** using Stripe CLI before going live
5. **Monitor webhook logs** for any sync failures

## Migration from Hardcoded Products

If you have existing hardcoded products:

1. Create corresponding products in Stripe Dashboard
2. Products will automatically sync via webhooks
3. Update your frontend to use Stripe product IDs instead of internal IDs
4. The system supports both formats during transition

