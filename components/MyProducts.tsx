/**
 * My Products Component
 * 
 * Displays user's purchased products with empty state
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { Purchase } from '@/types/database';
import { ShoppingBag, ArrowRight, Package, Calendar } from 'lucide-react';
import Image from 'next/image';
import { deduplicateRequest, clearRequestCache } from '@/lib/request-deduplication';

interface MyProductsProps {
  userId: string;
}

export default function MyProducts({ userId }: MyProductsProps) {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const previousUserIdRef = useRef<string | null>(null);

  // Memoize fetchPurchases to prevent unnecessary re-renders
  const fetchPurchases = useCallback(async (forceRefresh = false) => {
    if (!userId) {
      setPurchases([]);
      setLoading(false);
      return;
    }

    // Clear cache if userId changed or if force refresh
    if (previousUserIdRef.current && previousUserIdRef.current !== userId) {
      clearRequestCache(`purchases:${previousUserIdRef.current}`);
    }
    if (forceRefresh) {
      clearRequestCache(`purchases:${userId}`);
    }
    previousUserIdRef.current = userId;

    try {
      setLoading(true);
      setError(null);

      const cacheKey = `purchases:${userId}`;
      
      // If force refresh, bypass cache
      let data;
      if (forceRefresh) {
        const { data: freshData, error: fetchError } = await supabase
          .from('purchases')
          .select('*')
          .eq('user_id', userId)
          .order('purchased_at', { ascending: false });
        
        if (fetchError) throw fetchError;
        data = freshData || [];
      } else {
        data = await deduplicateRequest(cacheKey, async () => {
          const { data, error: fetchError } = await supabase
            .from('purchases')
            .select('*')
            .eq('user_id', userId)
            .order('purchased_at', { ascending: false });

          if (fetchError) throw fetchError;
          return data || [];
        });
      }

      setPurchases(data);
    } catch (err: any) {
      console.error('Error fetching purchases:', err);
      setError('Failed to load your purchases. Please try again.');
      setPurchases([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases]);

  // Expose refresh function via window for external calls (e.g., from checkout success)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).refreshMyProducts = () => {
        if (userId) {
          fetchPurchases(true); // Force refresh, bypass cache
        }
      };
    }
    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).refreshMyProducts;
      }
    };
  }, [userId, fetchPurchases]);
  
  // Listen for storage events to refresh when purchases are updated from another tab/page
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'purchases-updated' && userId) {
        fetchPurchases(true);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [userId, fetchPurchases]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-brand-indigo border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your products...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => fetchPurchases(true)}
            className="px-4 py-2 bg-brand-indigo text-white rounded-lg font-semibold hover:bg-brand-blue transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Empty state - no purchases
  if (purchases.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-brand-indigo/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="text-brand-indigo" size={40} />
          </div>
          <h3 className="font-heading font-bold text-2xl text-brand-indigo mb-3">
            No Products Yet
          </h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Start your learning journey today! Browse our collection of AI courses, guides, and resources designed to help you master AI.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-8 py-4 bg-brand-indigo text-white rounded-lg font-bold text-lg hover:bg-brand-blue transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
          >
            <ShoppingBag size={20} />
            Browse Shop
            <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    );
  }

  // Display purchases
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-heading font-bold text-2xl text-brand-indigo mb-1">
            My Products
          </h2>
          <p className="text-gray-600 text-sm">
            {purchases.length} {purchases.length === 1 ? 'product' : 'products'} purchased
          </p>
        </div>
        <Package className="text-brand-blue" size={24} />
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {purchases.map((purchase) => (
          <div
            key={purchase.id}
            className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
          >
            {purchase.product_image_url && (
              <div className="relative w-full h-40">
                <Image
                  src={purchase.product_image_url}
                  alt={purchase.product_title}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="p-5">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="text-xs font-semibold text-brand-blue uppercase tracking-wider mb-1">
                    {purchase.product_category}
                  </div>
                  <h3 className="font-heading font-bold text-lg text-brand-indigo mb-2 line-clamp-2">
                    {purchase.product_title}
                  </h3>
                </div>
              </div>
              
              {purchase.product_description && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {purchase.product_description}
                </p>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Calendar size={14} />
                  <span>
                    {new Date(purchase.purchased_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500 mb-1">Paid</div>
                  <div className="font-bold text-brand-indigo">
                    €{Number(purchase.product_price).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

