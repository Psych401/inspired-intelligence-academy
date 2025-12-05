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

          // If payment succeeded, create purchase records
          if (paymentIntent?.status === 'succeeded' && session.metadata?.user_id) {
            const userId = session.metadata.user_id;
            
            // Handle both single product and multiple products (cart checkout)
            // Check for product_ids (new format, always set) first, then fall back to product_id (old format for backward compatibility)
            let productIdsStr = session.metadata.product_ids;
            
            // Backward compatibility: if product_ids not found, try product_id (singular)
            if (!productIdsStr && session.metadata.product_id) {
              productIdsStr = session.metadata.product_id;
            }
            
            const productIds: string[] = productIdsStr 
              ? (productIdsStr.includes(',') ? productIdsStr.split(',').map(id => id.trim()) : [productIdsStr.trim()])
              : [];

            if (productIds.length === 0) {
              console.error('No product IDs found in session metadata');
              break;
            }

            console.log(`Creating purchase records for ${productIds.length} product(s):`, productIds);

            // Get product details from payment metadata or use product list
            const productIdsFromMetadata = payment.metadata?.product_ids || [];
            const productDescriptions = payment.metadata?.product_descriptions 
              ? payment.metadata.product_descriptions.split(' | ')
              : [];
            const productCategories = payment.metadata?.product_categories
              ? payment.metadata.product_categories.split(', ')
              : [];
            const productImageUrls = payment.metadata?.product_image_urls
              ? payment.metadata.product_image_urls.split(', ')
              : [];

            // Product list for fallback (should match create-checkout function)
            const products: any[] = [
              { id: '1', title: 'AI for Absolute Beginners', description: 'The ultimate starting point. Learn the basics of ChatGPT and Gemini without the jargon.', price: 49.99, category: 'Full Course', imageUrl: 'https://picsum.photos/id/1/600/400' },
              { id: '2', title: 'Everyday Productivity Cheat Sheet', description: 'A handy PDF guide with 50 practical prompts to save you time at home and work.', price: 12.99, category: 'PDF Guide', imageUrl: 'https://picsum.photos/id/20/600/400' },
              { id: '3', title: 'The "Friendly Tutor" GPT', description: 'A custom GPT configuration designed to explain complex topics like you are 5 years old.', price: 19.99, category: 'Custom GPT', imageUrl: 'https://picsum.photos/id/60/600/400' },
              { id: '4', title: 'Weekend AI Workshop', description: 'A mini-course designed to get you up and running with image generation in just 2 days.', price: 29.99, category: 'Mini-Course', imageUrl: 'https://picsum.photos/id/96/600/400' },
              { id: '5', title: 'The Complete Starter Bundle', description: 'Get the beginner course, the cheat sheet, and the workshop in one discounted package.', price: 79.99, category: 'Bundle', imageUrl: 'https://picsum.photos/id/201/600/400' },
            ];

            // Create purchase records for each product
            const purchaseRecords = [];
            
            for (let i = 0; i < productIds.length; i++) {
              const productId = productIds[i].trim();
              
              // Find product details
              const productFromList = products.find(p => p.id === productId);
              
              // Use metadata if available, otherwise use product list
              const productTitle = productFromList?.title || session.metadata.product_titles?.split(', ')[i] || 'Product';
              const productDescription = productDescriptions[i] || productFromList?.description || '';
              const productCategory = productCategories[i] || productFromList?.category || '';
              const productImageUrl = productImageUrls[i] || productFromList?.imageUrl || '';
              
              // Use product price from list (more accurate than dividing total)
              // For single product purchases, payment.amount is the product price
              const productPrice = productFromList?.price || (productIds.length === 1 ? Number(payment.amount) : 0);
              
              if (!productFromList && productPrice === 0) {
                console.error(`Product ${productId} not found in product list and cannot determine price`);
                continue;
              }

              // Check if purchase already exists for this product and session
              const { data: existingPurchase } = await supabaseClient
                .from('purchases')
                .select('id')
                .eq('user_id', userId)
                .eq('product_id', productId)
                .eq('stripe_checkout_session_id', session.id)
                .maybeSingle();

              if (existingPurchase) {
                console.log(`Purchase already exists for product ${productId}, skipping`);
                continue;
              }

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
                console.error(`Error creating purchase for product ${productId}:`, purchaseError);
                
                // If the error is about missing column, try without stripe_checkout_session_id
                if (purchaseError.message?.includes('stripe_checkout_session_id') || 
                    purchaseError.code === 'PGRST204') {
                  console.warn('stripe_checkout_session_id column not found, retrying without it');
                  
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
                    console.error(`Error creating purchase (retry) for product ${productId}:`, retryError);
                  } else if (purchaseRetry) {
                    purchaseRecords.push(purchaseRetry);
                    console.log(`✅ Created purchase record for product: ${productTitle}`);
                  }
                }
              } else if (purchase) {
                purchaseRecords.push(purchase);
                console.log(`✅ Created purchase record for product: ${productTitle}`);
              }
            }

            // Link first purchase to payment (for backward compatibility)
            if (purchaseRecords.length > 0) {
              await supabaseClient
                .from('payments')
                .update({ purchase_id: purchaseRecords[0].id })
                .eq('id', payment.id);
              
              console.log(`✅ Created ${purchaseRecords.length} purchase record(s) for checkout session ${session.id}`);
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

