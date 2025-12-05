/**
 * Stripe Client Utilities
 * 
 * Helper functions for interacting with Stripe via Supabase Edge Functions
 */

/**
 * Create a Stripe Checkout Session
 * 
 * @param productId - The ID of the product to purchase
 * @returns The checkout session URL or error
 */
export async function createCheckoutSession(productId: string): Promise<{
  url: string | null;
  error: string | null;
}> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) {
      return { url: null, error: 'Supabase URL not configured' };
    }

    // Get the current session
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      supabaseUrl,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return { url: null, error: 'You must be logged in to make a purchase' };
    }

    // Call the Edge Function
    const response = await fetch(`${supabaseUrl}/functions/v1/create-checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      },
      body: JSON.stringify({ productId }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { url: null, error: data.error || 'Failed to create checkout session' };
    }

    return { url: data.url, error: null };
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return { url: null, error: error.message || 'An unexpected error occurred' };
  }
}

/**
 * Create a Stripe Checkout Session for multiple products (cart checkout)
 * 
 * @param productIds - Array of product IDs to purchase
 * @returns The checkout session URL or error
 */
export async function createCartCheckoutSession(productIds: string[]): Promise<{
  url: string | null;
  error: string | null;
}> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) {
      return { url: null, error: 'Supabase URL not configured' };
    }

    // Get the current session
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      supabaseUrl,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return { url: null, error: 'You must be logged in to make a purchase' };
    }

    // Validate productIds
    if (!Array.isArray(productIds) || productIds.length === 0) {
      return { url: null, error: 'At least one product is required' };
    }

    // Call the Edge Function with multiple product IDs
    const requestBody = { productIds };
    console.log('Sending checkout request:', requestBody);
    
    const response = await fetch(`${supabaseUrl}/functions/v1/create-checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (!response.ok) {
      return { url: null, error: data.error || 'Failed to create checkout session' };
    }

    return { url: data.url, error: null };
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return { url: null, error: error.message || 'An unexpected error occurred' };
  }
}

/**
 * Retrieve a Stripe Checkout Session
 * 
 * @param sessionId - The Stripe checkout session ID
 * @returns The session data or error
 */
export async function getCheckoutSession(sessionId: string): Promise<{
  session: any | null;
  error: string | null;
}> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) {
      return { session: null, error: 'Supabase URL not configured' };
    }

    // Get the current session
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      supabaseUrl,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return { session: null, error: 'You must be logged in' };
    }

    // Call the Edge Function to retrieve session
    // Note: You may want to create a separate Edge Function for this
    // For now, we'll check the payment record in the database
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('stripe_checkout_session_id', sessionId)
      .single();

    if (paymentError || !payment) {
      return { session: null, error: 'Session not found' };
    }

    return { session: payment, error: null };
  } catch (error: any) {
    console.error('Error retrieving checkout session:', error);
    return { session: null, error: error.message || 'An unexpected error occurred' };
  }
}

