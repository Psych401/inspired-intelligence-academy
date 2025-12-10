/**
 * Checkout Success Page
 * 
 * Shown after successful Stripe checkout
 */

'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Package, ArrowRight, Loader2 } from 'lucide-react';
import { getCheckoutSession } from '@/lib/stripe';
import ProtectedRoute from '@/components/ProtectedRoute';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export default function CheckoutSuccessPage() {
  return (
    <ProtectedRoute>
      <CheckoutSuccessContent />
    </ProtectedRoute>
  );
}

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const sessionId = searchParams.get('session_id');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [checkingPurchases, setCheckingPurchases] = useState(true);

  // Check for purchases created by webhook
  useEffect(() => {
    if (!sessionId || !user) return;

    let pollInterval: NodeJS.Timeout | null = null;

    const checkPurchases = async () => {
      try {
        // First, try to find purchases by session ID
        let { data, error: purchasesError } = await supabase
          .from('purchases')
          .select('*')
          .eq('stripe_checkout_session_id', sessionId)
          .eq('user_id', user.id)
          .order('purchased_at', { ascending: false });

        // If not found by session ID, try finding recent purchases for this user
        // (in case session_id wasn't saved correctly)
        if ((!data || data.length === 0) && !purchasesError) {
          const { data: recentPurchases } = await supabase
            .from('purchases')
            .select('*')
            .eq('user_id', user.id)
            .order('purchased_at', { ascending: false })
            .limit(5);
          
          // Check if any recent purchase matches the payment amount or product
          if (recentPurchases && recentPurchases.length > 0 && paymentData) {
            // Try to match by checking if purchase was created in last 5 minutes
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
            const recentMatch = recentPurchases.find(p => 
              new Date(p.purchased_at) > new Date(fiveMinutesAgo)
            );
            if (recentMatch) {
              data = [recentMatch];
            }
          }
        }

        if (!purchasesError && data && data.length > 0) {
          setPurchases(data);
          setCheckingPurchases(false);
          
          // Update payment status if purchases exist
          if (paymentData && paymentData.status === 'pending') {
            // Refresh payment data to get updated status
            const { session: updatedSession } = await getCheckoutSession(sessionId);
            if (updatedSession) {
              setPaymentData(updatedSession);
            }
          }
        } else {
          // If no purchases found yet, poll for them (webhook might be processing)
          let attempts = 0;
          const maxAttempts = 15; // Poll for up to 15 seconds
          
          pollInterval = setInterval(async () => {
            attempts++;
            
            // Try both session ID and recent purchases
            let { data: pollData, error: pollError } = await supabase
              .from('purchases')
              .select('*')
              .eq('stripe_checkout_session_id', sessionId)
              .eq('user_id', user.id);

            // If not found, check recent purchases
            if ((!pollData || pollData.length === 0) && !pollError) {
              const { data: recentPoll } = await supabase
                .from('purchases')
                .select('*')
                .eq('user_id', user.id)
                .order('purchased_at', { ascending: false })
                .limit(5);
              
              const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
              const recentMatch = recentPoll?.find(p => 
                new Date(p.purchased_at) > new Date(fiveMinutesAgo)
              );
              if (recentMatch) {
                pollData = [recentMatch];
              }
            }

            if (!pollError && pollData && pollData.length > 0) {
              setPurchases(pollData);
              setCheckingPurchases(false);
              if (pollInterval) clearInterval(pollInterval);
              
              // Update payment status
              if (paymentData && paymentData.status === 'pending') {
                const { session: updatedSession } = await getCheckoutSession(sessionId);
                if (updatedSession) {
                  setPaymentData(updatedSession);
                }
              }
            } else if (attempts >= maxAttempts) {
              // Stop polling after max attempts
              setCheckingPurchases(false);
              if (pollInterval) clearInterval(pollInterval);
            }
          }, 1000); // Poll every second
        }
      } catch (err: any) {
        console.error('Error checking purchases:', err);
        setCheckingPurchases(false);
      }
    };

    // Wait a bit for paymentData to load first
    if (paymentData || !loading) {
      checkPurchases();
    }

    // Cleanup function
    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [sessionId, user, paymentData, loading]);

  useEffect(() => {
    if (!sessionId) {
      setError('No session ID provided');
      setLoading(false);
      return;
    }

    const fetchSession = async () => {
      try {
        const { session, error: sessionError } = await getCheckoutSession(sessionId);
        
        if (sessionError) {
          setError(sessionError);
        } else {
          setPaymentData(session);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to verify payment');
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-white pt-32 pb-20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-brand-indigo mx-auto mb-4" />
          <p className="text-gray-600">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-brand-white pt-32 pb-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="text-red-600" size={32} />
            </div>
            <h1 className="font-heading font-bold text-3xl text-brand-indigo mb-4">
              Payment Verification Failed
            </h1>
            <p className="text-gray-600 mb-8">{error}</p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/dashboard"
                className="px-6 py-3 bg-brand-indigo text-white rounded-lg font-semibold hover:bg-brand-blue transition-colors"
              >
                Go to Dashboard
              </Link>
              <Link
                href="/shop"
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              >
                Back to Shop
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-white pt-32 pb-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12 text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="text-green-600" size={48} />
          </div>

          {/* Success Message */}
          <h1 className="font-heading font-bold text-4xl text-brand-indigo mb-4">
            Payment Successful!
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Thank you for your purchase. Your product is now available in your dashboard.
          </p>

          {/* Payment Details */}
          {paymentData && (
            <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
              <h2 className="font-heading font-bold text-lg text-brand-indigo mb-4">
                Purchase Details
              </h2>
              <div className="space-y-3">
                {purchases.length > 0 ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Products Purchased:</span>
                      <span className="font-semibold text-gray-800">
                        {purchases.length} {purchases.length === 1 ? 'item' : 'items'}
                      </span>
                    </div>
                    {purchases.map((purchase, idx) => (
                      <div key={purchase.id} className="pl-4 border-l-2 border-brand-indigo/20">
                        <div className="font-semibold text-gray-800">{purchase.product_title}</div>
                        <div className="text-sm text-gray-600">€{Number(purchase.product_price).toFixed(2)}</div>
                      </div>
                    ))}
                  </>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Product:</span>
                      <span className="font-semibold text-gray-800">{paymentData.product_title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-semibold text-gray-800">
                        €{Number(paymentData.amount).toFixed(2)}
                      </span>
                    </div>
                  </>
                )}
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="text-gray-600">Status:</span>
                  <span className={`font-semibold capitalize ${
                    purchases.length > 0 || paymentData.status === 'succeeded' 
                      ? 'text-green-600' 
                      : 'text-yellow-600'
                  }`}>
                    {purchases.length > 0 ? 'Completed' : (paymentData.status || 'pending')}
                  </span>
                </div>
                {checkingPurchases && purchases.length === 0 && (
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing your purchase...</span>
                  </div>
                )}
                {!checkingPurchases && purchases.length === 0 && paymentData && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      Your purchase is being processed. If it doesn't appear in a few moments, please refresh the page or check your dashboard.
                    </p>
                    <button
                      onClick={async () => {
                        // Force refresh purchases
                        if (user?.id && sessionId) {
                          const { data } = await supabase
                            .from('purchases')
                            .select('*')
                            .eq('user_id', user.id)
                            .order('purchased_at', { ascending: false })
                            .limit(5);
                          
                          if (data && data.length > 0) {
                            setPurchases(data);
                            setCheckingPurchases(false);
                          }
                        }
                      }}
                      className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-semibold underline"
                    >
                      Refresh Now
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard"
              onClick={() => {
                // Clear purchases cache and trigger refresh
                if (user?.id && typeof window !== 'undefined') {
                  const { clearRequestCache } = require('@/lib/request-deduplication');
                  clearRequestCache(`purchases:${user.id}`);
                  
                  // Signal that purchases were updated
                  localStorage.setItem('purchases-updated', Date.now().toString());
                  
                  // Also trigger refresh if MyProducts is already loaded
                  setTimeout(() => {
                    if ((window as any).refreshMyProducts) {
                      (window as any).refreshMyProducts();
                    }
                    // Trigger storage event for same-tab refresh
                    window.dispatchEvent(new StorageEvent('storage', {
                      key: 'purchases-updated',
                      newValue: Date.now().toString()
                    }));
                  }, 100);
                }
              }}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-brand-indigo text-white rounded-lg font-bold text-lg hover:bg-brand-blue transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
            >
              <Package size={20} />
              View My Products
              <ArrowRight size={20} />
            </Link>
            <Link
              href="/shop"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gray-100 text-gray-700 rounded-lg font-bold text-lg hover:bg-gray-200 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

