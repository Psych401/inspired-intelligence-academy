/**
 * Checkout Button Component
 * 
 * Handles initiating Stripe checkout for a product
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { createCheckoutSession } from '@/lib/stripe';
import { Product } from '@/types';
import { Loader2, ShoppingBag, AlertCircle } from 'lucide-react';

interface CheckoutButtonProps {
  product: Product;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
}

export default function CheckoutButton({
  product,
  className = '',
  variant = 'default',
}: CheckoutButtonProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    if (!user) {
      router.push('/auth/login?redirect=/shop');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { url, error: checkoutError } = await createCheckoutSession(product.id);

      if (checkoutError) {
        setError(checkoutError);
        setLoading(false);
        return;
      }

      if (url) {
        // Redirect to Stripe Checkout
        window.location.href = url;
      } else {
        setError('Failed to create checkout session. Please try again.');
        setLoading(false);
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      setError(err.message || 'An error occurred. Please try again.');
      setLoading(false);
    }
  };

  const baseClasses = 'flex items-center gap-2 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    default: 'bg-brand-indigo text-white px-4 py-2 rounded-lg hover:bg-brand-blue',
    outline: 'border border-brand-indigo text-brand-indigo px-4 py-2 rounded-lg hover:bg-brand-indigo/10',
    ghost: 'text-brand-indigo px-4 py-2 rounded-lg hover:bg-gray-100',
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleCheckout}
        disabled={loading}
        className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" size={16} />
            Processing...
          </>
        ) : (
          <>
            <ShoppingBag size={16} />
            Buy Now
          </>
        )}
      </button>
      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

