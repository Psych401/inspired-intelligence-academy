/**
 * Purchase Utilities
 * 
 * Helper functions for managing user purchases
 */

import { supabase } from '@/lib/supabase/client';
import { Product } from '@/types';

/**
 * Record a purchase in the database
 * Call this function after a successful payment/checkout
 */
export async function recordPurchase(
  userId: string,
  product: Product
): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase
      .from('purchases')
      .insert({
        user_id: userId,
        product_id: product.id,
        product_title: product.title,
        product_description: product.description,
        product_price: product.price,
        product_category: product.category,
        product_image_url: product.imageUrl,
      });

    if (error) {
      console.error('Error recording purchase:', error);
      return { error: new Error(error.message) };
    }

    return { error: null };
  } catch (err: any) {
    console.error('Error recording purchase:', err);
    return { error: err };
  }
}

/**
 * Get all purchases for a user
 */
export async function getUserPurchases(userId: string) {
  try {
    const { data, error } = await supabase
      .from('purchases')
      .select('*')
      .eq('user_id', userId)
      .order('purchased_at', { ascending: false });

    if (error) throw error;

    return { data, error: null };
  } catch (err: any) {
    console.error('Error fetching purchases:', err);
    return { data: null, error: err };
  }
}

