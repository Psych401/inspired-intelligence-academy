/**
 * Supabase Edge Function: Stripe Webhook Handler
 * 
 * This function handles Stripe webhook events, particularly:
 * - checkout.session.completed: When a payment is successful
 * - payment_intent.succeeded: When payment is confirmed
 * - payment_intent.payment_failed: When payment fails
 * 
 * Security:
 * - JWT verification is DISABLED for this function (configured in supabase/config.toml)
 * - Stripe signature verification is REQUIRED and performed using the Stripe-Signature header
 * - The webhook secret is stored securely in Supabase CLI secrets
 * - All webhook requests are verified before processing to prevent tampering
 * 
 * Usage:
 * POST /functions/v1/stripe-webhook
 * (Called by Stripe when events occur)
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed. Only POST requests are accepted.' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 405,
      }
    );
  }

  try {
    // Get Stripe secret key and webhook secret from Supabase Vault
    // Note: Secrets must be added to Supabase Vault and functions must be redeployed
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

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
      console.error('Note: Dashboard Vault is for database secrets, not Edge Functions!');
      throw new Error('STRIPE_SECRET_KEY is not set. Use: supabase secrets set STRIPE_SECRET_KEY=your_key');
    }

    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET is missing.');
      console.error('');
      console.error('To fix this, run in your terminal:');
      console.error('  supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...');
      console.error('');
      console.error('For local testing with Stripe CLI, use the secret from: stripe listen');
      console.error('For production, use the secret from Stripe Dashboard → Webhooks');
      throw new Error('STRIPE_WEBHOOK_SECRET is not set. Use: supabase secrets set STRIPE_WEBHOOK_SECRET=your_secret');
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

    // Get the Stripe signature from headers (check both case variations)
    const signature = req.headers.get('stripe-signature') || req.headers.get('Stripe-Signature');
    if (!signature) {
      console.error('Missing Stripe-Signature header');
      console.error('Available headers:', Array.from(req.headers.entries()).map(([k]) => k));
      return new Response(
        JSON.stringify({ 
          error: 'Missing Stripe-Signature header. Webhook must include signature for verification.' 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // CRITICAL: Get the raw body BEFORE any JSON parsing
    // Stripe signature verification requires the EXACT raw body as received
    // Even a single extra space or different newline will break verification
    // 
    // IMPORTANT: We use arrayBuffer() to get raw bytes, then decode to string
    // This ensures we get the exact payload Stripe sent, without any parsing
    // DO NOT call req.json() or req.text() before this - it will modify the body!
    const rawBody = await req.arrayBuffer();
    const body = new TextDecoder().decode(rawBody);

    if (!body) {
      console.error('Empty request body received');
      return new Response(
        JSON.stringify({ error: 'Empty request body' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // Verify webhook signature using Stripe's async verification method
    // This ensures the webhook is authentic and hasn't been tampered with
    // CRITICAL: Must use constructEventAsync() in Deno/Edge Functions environment
    let event: Stripe.Event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
      console.log(`✅ Webhook signature verified. Event ID: ${event.id}, Type: ${event.type}`);
    } catch (err: any) {
      console.error('❌ Webhook signature verification failed');
      console.error('Error details:', err.message);
      console.error('Signature header:', signature.substring(0, 20) + '...');
      console.error('Body length:', body.length);
      console.error('Webhook secret configured:', webhookSecret ? 'Yes' : 'No');
      
      return new Response(
        JSON.stringify({ 
          error: 'Webhook signature verification failed',
          details: 'The webhook signature could not be verified. This may indicate the request did not come from Stripe or the webhook secret is incorrect.'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401, // 401 Unauthorized - signature verification failed
        }
      );
    }

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        // Get payment intent if available
        const paymentIntentId = session.payment_intent as string;
        let paymentIntent: Stripe.PaymentIntent | null = null;

        if (paymentIntentId) {
          paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        }

        // Update payment record
        const { data: payment } = await supabaseClient
          .from('payments')
          .select('*')
          .eq('stripe_checkout_session_id', session.id)
          .single();

        if (payment) {
          // Update payment status
          await supabaseClient
            .from('payments')
            .update({
              stripe_payment_intent_id: paymentIntentId,
              status: paymentIntent?.status === 'succeeded' ? 'succeeded' : 'pending',
              updated_at: new Date().toISOString(),
            })
            .eq('id', payment.id);

          // If payment succeeded, create purchase record
          if (paymentIntent?.status === 'succeeded' && session.metadata?.user_id) {
            const userId = session.metadata.user_id;
            const productId = session.metadata.product_id;
            const productTitle = session.metadata.product_title;

            // Check if purchase already exists
            // Note: We check by user_id and product_id to avoid duplicates
            // The stripe_checkout_session_id may not exist in the schema yet
            const { data: existingPurchase } = await supabaseClient
              .from('purchases')
              .select('id')
              .eq('user_id', userId)
              .eq('product_id', productId)
              .maybeSingle();

            if (!existingPurchase) {
              // Get product details from payment metadata
              const productDescription = payment.metadata?.product_description || '';
              const productCategory = payment.metadata?.product_category || '';
              const productImageUrl = payment.metadata?.product_image_url || '';
              const productPrice = Number(payment.amount);

              // Create purchase record
              const purchaseData: any = {
                user_id: userId,
                product_id: productId,
                product_title: productTitle,
                product_description: productDescription,
                product_price: productPrice,
                product_category: productCategory,
                product_image_url: productImageUrl,
                stripe_checkout_session_id: session.id,
              };

              const { data: purchase, error: purchaseError } = await supabaseClient
                .from('purchases')
                .insert(purchaseData)
                .select()
                .single();

              if (purchaseError) {
                console.error('Error creating purchase:', purchaseError);
                
                // If the error is about missing column, try without stripe_checkout_session_id
                if (purchaseError.message?.includes('stripe_checkout_session_id') || 
                    purchaseError.code === 'PGRST204') {
                  console.warn('stripe_checkout_session_id column not found, retrying without it');
                  console.warn('Please run the migration: database/migrations/add-stripe-checkout-session-to-purchases.sql');
                  
                  // Retry without stripe_checkout_session_id
                  const { data: purchaseRetry, error: retryError } = await supabaseClient
                    .from('purchases')
                    .insert({
                      user_id: userId,
                      product_id: productId,
                      product_title: productTitle,
                      product_description: productDescription,
                      product_price: productPrice,
                      product_category: productCategory,
                      product_image_url: productImageUrl,
                    })
                    .select()
                    .single();
                  
                  if (retryError) {
                    console.error('Error creating purchase (retry):', retryError);
                  } else if (purchaseRetry) {
                    // Link purchase to payment
                    await supabaseClient
                      .from('payments')
                      .update({ purchase_id: purchaseRetry.id })
                      .eq('id', payment.id);
                  }
                }
              } else if (purchase) {
                // Link purchase to payment
                await supabaseClient
                  .from('payments')
                  .update({ purchase_id: purchase.id })
                  .eq('id', payment.id);
              }
            }
          }
        }

        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        // Update payment record
        await supabaseClient
          .from('payments')
          .update({
            stripe_payment_intent_id: paymentIntent.id,
            status: 'succeeded',
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_payment_intent_id', paymentIntent.id);

        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        // Update payment record
        await supabaseClient
          .from('payments')
          .update({
            stripe_payment_intent_id: paymentIntent.id,
            status: 'failed',
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_payment_intent_id', paymentIntent.id);

        break;
      }

      default:
        console.log(`⚠️ Unhandled event type: ${event.type} (Event ID: ${event.id})`);
    }

    // Return success response to Stripe
    // Stripe will retry if we return a non-2xx status code
    console.log(`✅ Successfully processed webhook event: ${event.id}`);
    return new Response(
      JSON.stringify({ 
        received: true,
        event_id: event.id,
        event_type: event.type 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Webhook handler failed',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

