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
  purchased_at: string;
  created_at: string;
}

