'use client';

import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShoppingBag, Trash2, ArrowRight, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { createCartCheckoutSession } from '@/lib/stripe';
import { Loader2 } from 'lucide-react';

export default function CartPage() {
  const { items, removeFromCart, totalPrice, totalItems, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const handleCheckout = async () => {
    if (!user) {
      router.push('/auth/login?redirect=/cart');
      return;
    }

    if (items.length === 0) {
      return;
    }

    setLoading(true);
    setCheckoutError(null);

    try {
      // Get all product IDs from cart
      const productIds = items.map((item) => item.product.id);
      
      if (productIds.length === 0) {
        setCheckoutError('Your cart is empty');
        setLoading(false);
        return;
      }

      console.log('Initiating checkout for products:', productIds);
      
      const { url, error: checkoutError } = await createCartCheckoutSession(productIds);

      if (checkoutError) {
        setCheckoutError(checkoutError);
        setLoading(false);
        return;
      }

      if (url) {
        // Clear cart after successful checkout initiation
        clearCart();
        window.location.href = url;
      } else {
        setCheckoutError('Failed to create checkout session. Please try again.');
        setLoading(false);
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      setCheckoutError(err.message || 'An error occurred. Please try again.');
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-brand-white pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-6">
              <ShoppingBag size={48} className="text-gray-400" />
            </div>
            <h1 className="font-heading font-bold text-3xl text-brand-indigo mb-4">
              Your cart is empty
            </h1>
            <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
              Looks like you haven't added anything to your cart yet. Start exploring our store to find the perfect AI tools for you!
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-8 py-4 bg-brand-indigo text-white rounded-lg text-lg font-bold hover:bg-brand-blue hover:-translate-y-0.5 transition-all shadow-lg shadow-brand-indigo/10"
            >
              <Sparkles size={20} />
              Explore the Store
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-white pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-heading font-bold text-3xl text-brand-indigo mb-8">
          Shopping Cart
        </h1>

        {/* Cart Items */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 mb-6">
          {items.map((item) => (
            <div
              key={item.product.id}
              className="p-6 border-b border-gray-100 last:border-b-0 flex flex-col sm:flex-row gap-4"
            >
              <div className="flex-shrink-0">
                <img
                  src={item.product.imageUrl}
                  alt={item.product.title}
                  className="w-24 h-24 object-cover rounded-lg"
                />
              </div>
              
              <div className="flex-grow flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-grow">
                  <h3 className="font-heading font-bold text-lg text-brand-indigo mb-1">
                    {item.product.title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-2">{item.product.category}</p>
                  <p className="text-sm text-gray-600 line-clamp-2">{item.product.description}</p>
                </div>
                
                <div className="flex items-center justify-between sm:justify-end gap-4">
                  <div className="text-right">
                    <p className="font-bold text-xl text-brand-gray">€{item.product.price.toFixed(2)}</p>
                  </div>
                  
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    aria-label="Remove from cart"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 mb-6">
          <h2 className="font-heading font-bold text-xl text-brand-indigo mb-4">
            Order Summary
          </h2>
          
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal ({totalItems} {totalItems === 1 ? 'item' : 'items'})</span>
              <span>€{totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Tax</span>
              <span>Included</span>
            </div>
            <div className="border-t border-gray-200 pt-3 flex justify-between">
              <span className="font-bold text-lg text-brand-indigo">Total</span>
              <span className="font-bold text-lg text-brand-indigo">€{totalPrice.toFixed(2)}</span>
            </div>
          </div>

          {checkoutError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {checkoutError}
            </div>
          )}

          <button
            onClick={handleCheckout}
            disabled={loading || items.length === 0}
            className="w-full py-4 bg-brand-indigo text-white rounded-lg text-lg font-bold hover:bg-brand-blue hover:-translate-y-0.5 transition-all shadow-lg shadow-brand-indigo/10 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Processing...
              </>
            ) : (
              <>
                Proceed to Checkout
                <ArrowRight size={20} />
              </>
            )}
          </button>

          <p className="text-xs text-gray-500 text-center mt-4">
            Secure checkout powered by Stripe
          </p>
        </div>

        {/* Continue Shopping */}
        <div className="text-center">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-brand-indigo hover:text-brand-blue font-medium transition-colors"
          >
            <ArrowRight size={16} className="rotate-180" />
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

