/**
 * Profile Setup Page
 * 
 * Shown after signup to complete profile setup
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import ProfilePage from '../page';

export default function ProfileSetupPage() {
  const router = useRouter();
  const { profile, loading } = useAuth();

  useEffect(() => {
    // If profile is already set up, redirect to dashboard
    if (!loading && profile?.username && profile?.full_name) {
      router.push('/dashboard');
    }
  }, [profile, loading, router]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-brand-white pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <h1 className="font-heading font-bold text-4xl text-brand-indigo mb-2">
              Complete Your Profile
            </h1>
            <p className="text-gray-600">
              Let's set up your profile to get started
            </p>
          </div>
          <ProfilePage />
        </div>
      </div>
    </ProtectedRoute>
  );
}

