/**
 * Checkout Cancel Page
 * 
 * Shown when user cancels Stripe checkout
 */

'use client';

import Link from 'next/link';
import { XCircle, ArrowLeft, ShoppingBag } from 'lucide-react';

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-screen bg-brand-white pt-32 pb-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12 text-center">
          {/* Cancel Icon */}
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="text-orange-600" size={48} />
          </div>

          {/* Cancel Message */}
          <h1 className="font-heading font-bold text-4xl text-brand-indigo mb-4">
            Checkout Cancelled
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Your checkout was cancelled. No charges were made to your account.
          </p>
          <p className="text-gray-500 mb-8">
            If you experienced any issues, please contact support or try again.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-brand-indigo text-white rounded-lg font-bold text-lg hover:bg-brand-blue transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
            >
              <ShoppingBag size={20} />
              Back to Shop
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gray-100 text-gray-700 rounded-lg font-bold text-lg hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft size={20} />
              Go Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

