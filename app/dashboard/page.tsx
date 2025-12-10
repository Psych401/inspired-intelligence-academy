/**
 * Dashboard Page
 * 
 * Protected route that displays user dashboard after login
 */

'use client';

import { useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import MyProducts from '@/components/MyProducts';
import { User, Mail, Calendar } from 'lucide-react';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const { user, profile } = useAuth();
  
  // Refresh purchases when dashboard loads (in case user navigated from checkout)
  useEffect(() => {
    if (user?.id && typeof window !== 'undefined') {
      // Small delay to ensure MyProducts component is mounted
      const timer = setTimeout(() => {
        if ((window as any).refreshMyProducts) {
          (window as any).refreshMyProducts();
        }
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [user?.id]);

  return (
    <div className="min-h-screen bg-brand-white pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="font-heading font-bold text-4xl text-brand-indigo mb-2">
            Welcome back{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}!
          </h1>
          <p className="text-gray-600">Here's your dashboard</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Profile Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-heading font-bold text-xl text-brand-indigo mb-4">Your Profile</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="text-brand-blue" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Username</p>
                  <p className="font-semibold text-gray-800">{profile?.username || 'Not set'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="text-brand-blue" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-semibold text-gray-800">{user?.email}</p>
                </div>
              </div>
              {profile?.full_name && (
                <div className="flex items-center gap-3">
                  <User className="text-brand-blue" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="font-semibold text-gray-800">{profile.full_name}</p>
                  </div>
                </div>
              )}
            </div>
            <a
              href="/profile"
              className="mt-6 inline-block text-brand-indigo font-semibold hover:text-brand-blue text-sm"
            >
              Edit Profile →
            </a>
          </div>

          {/* Account Info Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-heading font-bold text-xl text-brand-indigo mb-4">Account Information</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="text-brand-blue" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Member Since</p>
                  <p className="font-semibold text-gray-800">
                    {profile?.created_at
                      ? new Date(profile.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : 'Recently'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="text-brand-blue" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Email Status</p>
                  <p className="font-semibold text-gray-800">
                    {user?.email_confirmed_at ? 'Verified' : 'Unverified'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* My Products Section */}
        <div className="mt-12">
          <MyProducts userId={user?.id || ''} />
        </div>
      </div>
    </div>
  );
}

