/**
 * Database Type Definitions
 * 
 * TypeScript types for Supabase database tables
 */

export interface Profile {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  email_confirmed_at: string | null;
  created_at: string;
}

export interface Purchase {
  id: string;
  user_id: string;
  product_id: string;
  product_title: string;
  product_description: string | null;
  product_price: number;
  product_category: string;
  product_image_url: string | null;
  stripe_checkout_session_id: string | null;
  purchased_at: string;
  created_at: string;
}

export interface Payment {
  id: string;
  user_id: string;
  purchase_id: string | null;
  stripe_payment_intent_id: string | null;
  stripe_checkout_session_id: string | null;
  stripe_customer_id: string | null;
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed' | 'canceled' | 'refunded';
  product_id: string;
  product_title: string;
  metadata: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

