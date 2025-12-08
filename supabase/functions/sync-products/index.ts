/**
 * Supabase Edge Function: Manual Product Sync
 * 
 * This function manually syncs all products from Stripe to Supabase database.
 * Useful for initial sync or when webhooks haven't fired.
 * 
 * Usage:
 * POST /functions/v1/sync-products
 * Authorization: Bearer <service_role_key> (or use in server-side code)
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get Stripe secret key
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY is not set. Use: supabase secrets set STRIPE_SECRET_KEY=your_key');
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2024-11-20.acacia',
      httpClient: Stripe.createFetchHttpClient(),
    });

    // Initialize Supabase client with service role key
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    console.log('Starting product sync from Stripe...');

    // Fetch all products from Stripe
    const products = await stripe.products.list({ limit: 100, active: true });
    console.log(`Found ${products.data.length} products in Stripe`);

    let syncedCount = 0;
    let errorCount = 0;

    // Sync each product
    for (const stripeProduct of products.data) {
      try {
        // Get the default price
        let defaultPrice: Stripe.Price | null = null;
        let priceAmount: number = 0;
        
        if (stripeProduct.default_price) {
          if (typeof stripeProduct.default_price === 'string') {
            defaultPrice = await stripe.prices.retrieve(stripeProduct.default_price);
          } else {
            defaultPrice = stripeProduct.default_price;
          }
          
          if (defaultPrice && defaultPrice.unit_amount) {
            priceAmount = defaultPrice.unit_amount / 100;
          }
        }

        // Get first image URL
        const imageUrl = stripeProduct.images && stripeProduct.images.length > 0 
          ? stripeProduct.images[0] 
          : null;

        // Extract category from metadata
        const category = stripeProduct.metadata?.category || stripeProduct.metadata?.Category || '';

        // Upsert product in database
        const { error: productError } = await supabaseClient
          .from('products')
          .upsert({
            stripe_product_id: stripeProduct.id,
            stripe_price_id: defaultPrice?.id || null,
            name: stripeProduct.name,
            description: stripeProduct.description || null,
            price: priceAmount,
            currency: defaultPrice?.currency || 'eur',
            category: category,
            image_url: imageUrl,
            active: stripeProduct.active,
            metadata: stripeProduct.metadata || {},
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'stripe_product_id',
          });

        if (productError) {
          console.error(`Error syncing product ${stripeProduct.id}:`, productError);
          errorCount++;
        } else {
          console.log(`✅ Synced: ${stripeProduct.name} (${stripeProduct.id})`);
          syncedCount++;
        }
      } catch (err: any) {
        console.error(`Error processing product ${stripeProduct.id}:`, err);
        errorCount++;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Synced ${syncedCount} products. ${errorCount} errors.`,
        synced: syncedCount,
        errors: errorCount,
        total: products.data.length,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Sync error:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Failed to sync products',
        details: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

