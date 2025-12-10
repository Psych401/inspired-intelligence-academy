/**
 * Shared Products Hook
 * 
 * Provides centralized product fetching with request deduplication
 * to prevent duplicate API calls across components.
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Product, ProductCategory } from '@/types';
import { deduplicateRequest, clearRequestCache } from '@/lib/request-deduplication';

interface UseProductsOptions {
  limit?: number;
  category?: ProductCategory | 'All';
  enabled?: boolean;
}

export function useProducts(options: UseProductsOptions = {}) {
  const { limit, category = 'All', enabled = true } = options;
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Create cache key based on options
      const cacheKey = `products:${category}:${limit || 'all'}`;

      const data = await deduplicateRequest(cacheKey, async () => {
        let query = supabase
          .from('products')
          .select('*')
          .eq('active', true);

        if (category !== 'All') {
          query = query.eq('category', category);
        }

        query = query.order('created_at', { ascending: false });

        if (limit) {
          query = query.limit(limit);
        }

        const { data, error: fetchError } = await query;

        if (fetchError) throw fetchError;

        // Transform database products to Product interface
        return (data || []).map((dbProduct) => ({
          id: dbProduct.stripe_product_id,
          title: dbProduct.name,
          description: dbProduct.description || '',
          price: Number(dbProduct.price),
          category: (dbProduct.category as ProductCategory) || ProductCategory.COURSE,
          imageUrl: dbProduct.image_url || '',
          popular: dbProduct.metadata?.popular === true || false,
        }));
      });

      setProducts(data);
    } catch (err: any) {
      console.error('Error fetching products:', err);
      setError(err.message || 'Failed to load products.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [category, limit, enabled]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const refetch = useCallback(() => {
    // Clear cache and refetch
    const cacheKey = `products:${category}:${limit || 'all'}`;
    clearRequestCache(cacheKey);
    fetchProducts();
  }, [fetchProducts, category, limit]);

  return { products, loading, error, refetch };
}

