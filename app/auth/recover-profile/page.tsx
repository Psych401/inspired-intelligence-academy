/**
 * Profile Recovery Page
 * 
 * Helps users who signed up but their profile wasn't created properly
 * This page allows them to complete their profile setup
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { User, Mail, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

export default function RecoverProfilePage() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const [recovering, setRecovering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // If user is not logged in, redirect to login
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  const handleRecover = async () => {
    if (!user) return;

    setError(null);
    setRecovering(true);

    try {
      const { supabase } = await import('@/lib/supabase/client');
      
      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (existingProfile) {
        // Profile exists, just refresh
        router.push('/profile');
        return;
      }

      // Create profile from user metadata
      const username = user.user_metadata?.username || `user_${user.id.substring(0, 8)}`;
      const fullName = user.user_metadata?.full_name || '';

      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          username,
          full_name: fullName,
        });

      if (profileError) {
        setError(profileError.message || 'Failed to create profile. Please contact support.');
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push('/profile');
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setRecovering(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-brand-white pt-24 pb-20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-indigo" />
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-brand-white pt-24 pb-20 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="text-center mb-8">
            <h1 className="font-heading font-bold text-3xl text-brand-indigo mb-2">
              Complete Your Profile
            </h1>
            <p className="text-gray-600">
              It looks like your profile wasn't set up completely. Let's fix that.
            </p>
          </div>

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
              <CheckCircle2 className="text-green-600 flex-shrink-0" size={20} />
              <p className="text-green-800 font-semibold">Profile created successfully! Redirecting...</p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {profile ? (
            <div className="text-center">
              <p className="text-gray-600 mb-6">Your profile already exists. Redirecting...</p>
              <button
                onClick={() => router.push('/profile')}
                className="px-6 py-3 bg-brand-indigo text-white rounded-lg font-semibold hover:bg-brand-blue transition-colors"
              >
                Go to Profile
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <Mail className="text-brand-blue" size={20} />
                  <span className="font-semibold text-gray-800">Email</span>
                </div>
                <p className="text-gray-600">{user.email}</p>
              </div>

              <button
                onClick={handleRecover}
                disabled={recovering || success}
                className="w-full bg-brand-indigo text-white font-bold py-3 rounded-lg hover:bg-brand-blue transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {recovering ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Creating Profile...
                  </>
                ) : (
                  <>
                    <User size={20} />
                    Create My Profile
                  </>
                )}
              </button>

              <div className="text-center">
                <button
                  onClick={() => router.push('/auth/login')}
                  className="text-sm text-gray-600 hover:text-brand-indigo"
                >
                  Back to Login
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

