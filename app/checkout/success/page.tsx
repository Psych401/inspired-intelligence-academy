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
  const sessionId = searchParams.get('session_id');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState<any>(null);

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
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-semibold text-green-600 capitalize">
                    {paymentData.status}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard"
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

