/**
 * Authentication Context
 * 
 * Provides global authentication state and methods throughout the application.
 * Handles user session, profile data, and authentication operations.
 */

'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';
import { Profile } from '@/types/database';
import { deduplicateRequest, clearRequestCache } from '@/lib/request-deduplication';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, username: string, fullName: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: AuthError | null }>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const isInitializing = useRef(false);
  const previousUserIdRef = useRef<string | null>(null);

  // Fetch user profile from database with deduplication
  const fetchProfile = async (userId: string) => {
    const cacheKey = `profile:${userId}`;
    
    try {
      const data = await deduplicateRequest(cacheKey, async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) throw error;
        return data;
      });

      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile(null);
    }
  };

  // Initialize auth state
  useEffect(() => {
    if (isInitializing.current) return;
    isInitializing.current = true;

    let hasInitialSession = false;

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        hasInitialSession = true;
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // Skip profile fetch if this is the initial session event (already handled by getSession)
      // Only fetch on actual auth state changes (SIGNED_IN, SIGNED_OUT, etc.)
      if (event === 'INITIAL_SESSION' && hasInitialSession) {
        return;
      }
      
      if (session?.user) {
        await fetchProfile(session.user.id);
        previousUserIdRef.current = session.user.id;
      } else {
        setProfile(null);
        // Clear profile cache when user signs out
        const previousUserId = previousUserIdRef.current;
        if (previousUserId) {
          clearRequestCache(`profile:${previousUserId}`);
          previousUserIdRef.current = null;
        }
      }
      
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
      isInitializing.current = false;
    };
  }, []);

  // Sign up with email and password
  const signUp = async (
    email: string,
    password: string,
    username: string,
    fullName: string
  ): Promise<{ error: AuthError | null }> => {
    try {
      // Sign up the user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            full_name: fullName,
          },
        },
      });

      if (error) return { error };

      // User was created successfully - now try to create/update profile
      // Note: The database trigger creates a profile automatically,
      // so we use upsert to handle both cases (new profile or update existing)
      if (data.user) {
        // Wait a brief moment for the trigger to complete
        await new Promise(resolve => setTimeout(resolve, 500));
        
        try {
          // First, check if username is already taken by another user
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('id, username')
            .eq('username', username)
            .maybeSingle();

          if (existingProfile && existingProfile.id !== data.user.id) {
            return {
              error: {
                name: 'UsernameTaken',
                message: 'This username is already taken. Please choose another.',
              } as AuthError
            };
          }

          // Upsert the profile (insert or update)
          // Use upsert with ignoreDuplicates to handle race conditions
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
              id: data.user.id,
              username,
              full_name: fullName,
              updated_at: new Date().toISOString(),
            }, {
              onConflict: 'id',
            });

          if (profileError) {
            console.warn('Profile creation/update had an issue (non-blocking):', {
              message: profileError.message,
              code: profileError.code,
              details: profileError.details,
              hint: profileError.hint,
            });
            
            // Only return error if it's a username conflict
            // Other errors (like RLS issues) won't block signup
            if (profileError.code === '23505' || 
                profileError.message?.includes('unique') || 
                profileError.message?.includes('duplicate') ||
                profileError.message?.includes('username')) {
              return { 
                error: {
                  name: 'ProfileError',
                  message: 'This username is already taken. Please choose another.',
                } as AuthError
              };
            }
            
            // For other errors, log but don't block - profile can be fixed later
            // The trigger might have already created it, or we can fix it in profile setup
          }
        } catch (profileErr) {
          // Non-critical error - don't block signup
          console.warn('Profile creation encountered an error (non-blocking):', profileErr);
        }
      }

      // Signup succeeded - return success even if profile had minor issues
      // Profile can be completed in profile setup page
      return { error: null };
    } catch (error) {
      return { error: error as AuthError };
    }
  };

  // Sign in with email and password
  const signIn = async (
    email: string,
    password: string,
    rememberMe: boolean = false
  ): Promise<{ error: AuthError | null }> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error };
    }

    // After successful login, ensure profile exists
    // This handles cases where profile creation failed during signup
    // Use deduplication to prevent duplicate calls with onAuthStateChange
    if (data.user) {
      try {
        const cacheKey = `profile-check:${data.user.id}`;
        await deduplicateRequest(cacheKey, async () => {
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', data.user.id)
            .maybeSingle();

          // If profile doesn't exist, create a basic one
          if (!existingProfile) {
            const username = data.user.user_metadata?.username || `user_${data.user.id.substring(0, 8)}`;
            const fullName = data.user.user_metadata?.full_name || '';
            
            await supabase
              .from('profiles')
              .upsert({
                id: data.user.id,
                username,
                full_name: fullName,
              }, {
                onConflict: 'id',
              });
          }
          return existingProfile;
        });
      } catch (profileErr) {
        // Non-critical - profile can be created later
        console.warn('Profile check/creation during login had an issue:', profileErr);
      }
    }

    return { error: null };
  };

  // Sign out
  const signOut = async (): Promise<void> => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  // Reset password (send reset email)
  const resetPassword = async (email: string): Promise<{ error: AuthError | null }> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    return { error };
  };

  // Update password
  const updatePassword = async (newPassword: string): Promise<{ error: AuthError | null }> => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    return { error };
  };

  // Update profile
  const updateProfile = async (updates: Partial<Profile>): Promise<{ error: Error | null }> => {
    if (!user) return { error: new Error('User not authenticated') };

    const { error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (error) return { error };

    // Refresh profile
    await fetchProfile(user.id);
    return { error: null };
  };

  // Refresh profile data
  const refreshProfile = async (): Promise<void> => {
    if (user) {
      // Clear cache before refreshing to force a new fetch
      clearRequestCache(`profile:${user.id}`);
      await fetchProfile(user.id);
    }
  };

  const value: AuthContextType = {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

