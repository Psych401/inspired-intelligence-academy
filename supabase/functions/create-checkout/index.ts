/**
 * Supabase Edge Function: Create Stripe Checkout Session
 * 
 * This function creates a Stripe Checkout session for a product purchase.
 * 
 * Usage:
 * POST /functions/v1/create-checkout
 * Body: { productId: string, userId: string }
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get Stripe secret key from Supabase Vault
    // Note: Secrets must be added to Supabase Vault and functions must be redeployed
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    
    if (!stripeSecretKey) {
      // Debug: Check if SUPABASE_URL is available (to verify env vars work)
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      console.error('Environment check:');
      console.error('- SUPABASE_URL:', supabaseUrl ? 'Set' : 'Not set');
      console.error('- STRIPE_SECRET_KEY:', 'Not set');
      console.error('');
      console.error('IMPORTANT: Edge Functions require secrets to be set via Supabase CLI!');
      console.error('');
      console.error('To fix this, run in your terminal:');
      console.error('  supabase secrets set STRIPE_SECRET_KEY=sk_test_...');
      console.error('');
      console.error('Then verify it was set:');
      console.error('  supabase secrets list');
      console.error('');
      console.error('Note: Dashboard Vault is for database secrets, not Edge Functions!');
      throw new Error('STRIPE_SECRET_KEY is not set. Use: supabase secrets set STRIPE_SECRET_KEY=your_key');
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2024-11-20.acacia',
      httpClient: Stripe.createFetchHttpClient(),
    });

    // Initialize Supabase client
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

    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    // Verify user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser(authHeader.replace('Bearer ', ''));

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Parse request body - support both single productId and array of productIds
    let body: any;
    try {
      body = await req.json();
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      throw new Error('Invalid request body format');
    }

    console.log('Received request body:', JSON.stringify(body));

    const { productId, productIds } = body;

    // Determine which products to checkout
    // Handle both single productId (string) and productIds (array)
    let requestedProductIds: string[] = [];
    
    if (productIds !== undefined && productIds !== null) {
      if (Array.isArray(productIds) && productIds.length > 0) {
        // Multiple products from cart
        requestedProductIds = productIds.filter((id: any) => typeof id === 'string' && id.length > 0);
      } else {
        console.error('productIds is not a valid array:', productIds);
        throw new Error('productIds must be a non-empty array of product IDs');
      }
    } else if (productId !== undefined && productId !== null) {
      if (typeof productId === 'string' && productId.length > 0) {
        // Single product (backward compatibility)
        requestedProductIds = [productId];
      } else {
        console.error('productId is not a valid string:', productId);
        throw new Error('productId must be a non-empty string');
      }
    }

    if (requestedProductIds.length === 0) {
      console.error('No valid product IDs found in request body:', JSON.stringify(body));
      throw new Error('productId (string) or productIds (array) is required');
    }

    console.log(`Processing checkout for ${requestedProductIds.length} product(s):`, requestedProductIds);

    // Fetch products from database
    // Note: productId can be either our internal ID or Stripe product ID
    // We'll try to match by stripe_product_id first, then by id
    const { data: dbProducts, error: productsError } = await supabaseClient
      .from('products')
      .select('*')
      .eq('active', true)
      .in('stripe_product_id', requestedProductIds);

    // If not found by stripe_product_id, try by id (for backward compatibility)
    let selectedProducts: any[] = [];
    
    if (dbProducts && dbProducts.length > 0) {
      // Map database products to Product interface
      selectedProducts = dbProducts.map((dbProduct) => ({
        id: dbProduct.stripe_product_id,
        title: dbProduct.name,
        description: dbProduct.description || '',
        price: Number(dbProduct.price),
        category: dbProduct.category || '',
        imageUrl: dbProduct.image_url || '',
      }));
    }

    // If we didn't find all products, try matching by id field (backward compatibility)
    if (selectedProducts.length < requestedProductIds.length) {
      const missingIds = requestedProductIds.filter(
        (id: string) => !selectedProducts.some((p) => p.id === id)
      );
      
      if (missingIds.length > 0) {
        const { data: dbProductsById, error: productsByIdError } = await supabaseClient
          .from('products')
          .select('*')
          .eq('active', true)
          .in('id', missingIds);

        if (dbProductsById && dbProductsById.length > 0) {
          const additionalProducts = dbProductsById.map((dbProduct) => ({
            id: dbProduct.stripe_product_id,
            title: dbProduct.name,
            description: dbProduct.description || '',
            price: Number(dbProduct.price),
            category: dbProduct.category || '',
            imageUrl: dbProduct.image_url || '',
          }));
          selectedProducts = [...selectedProducts, ...additionalProducts];
        }
      }
    }

    if (selectedProducts.length === 0) {
      console.error('No products found in database for IDs:', requestedProductIds);
      throw new Error('No valid products found. Please ensure products are synced from Stripe.');
    }

    if (selectedProducts.length !== requestedProductIds.length) {
      const foundIds = selectedProducts.map((p) => p.id);
      const missingIds = requestedProductIds.filter((id) => !foundIds.includes(id));
      console.error('Some products were not found:', missingIds);
      throw new Error(`Some products were not found: ${missingIds.join(', ')}`);
    }

    console.log(`Found ${selectedProducts.length} product(s) in database`);

    // Get or create Stripe customer
    let customerId: string;

    // Check if user already has a Stripe customer ID in their profile
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (profile?.stripe_customer_id) {
      customerId = profile.stripe_customer_id;
    } else {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id,
        },
      });
      customerId = customer.id;

      // Store customer ID in profile
      await supabaseClient
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id);
    }

    // Get the base URL from environment or use a default
    const baseUrl = Deno.env.get('SITE_URL') || 'http://localhost:3000';

    // Create line items for all selected products
    const lineItems = selectedProducts.map((product) => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: product.title,
          description: product.description,
          images: product.imageUrl ? [product.imageUrl] : [],
        },
        unit_amount: Math.round(product.price * 100), // Convert to cents
      },
      quantity: 1,
    }));

    // Calculate total amount
    const totalAmount = selectedProducts.reduce((sum, p) => sum + p.price, 0);

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/checkout/cancel`,
      metadata: {
        user_id: user.id,
        product_ids: requestedProductIds.join(','),
        product_titles: selectedProducts.map((p) => p.title).join(', '),
      },
      allow_promotion_codes: true,
    });

    // Create pending payment records for each product
    // For cart checkout, we'll create one payment record with the total
    // You may want to create separate payment records per product
    await supabaseClient.from('payments').insert({
      user_id: user.id,
      stripe_checkout_session_id: session.id,
      stripe_customer_id: customerId,
      amount: totalAmount,
      currency: 'eur',
      status: 'pending',
      product_id: requestedProductIds.join(','), // Comma-separated for multiple products
      product_title: selectedProducts.length === 1 
        ? selectedProducts[0].title 
        : `${selectedProducts.length} items`,
      metadata: {
        product_ids: requestedProductIds,
        product_count: selectedProducts.length,
        product_descriptions: selectedProducts.map((p) => p.description).join(' | '),
        product_categories: selectedProducts.map((p) => p.category).join(', '),
        product_image_urls: selectedProducts.map((p) => p.imageUrl).join(', '),
      },
    });

    return new Response(
      JSON.stringify({
        sessionId: session.id,
        url: session.url,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    console.error('Error stack:', error.stack);
    return new Response(
      JSON.stringify({
        error: error.message || 'An error occurred while creating checkout session',
        details: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

