# Supabase Authentication Implementation Guide

This document provides a complete overview of the Supabase authentication system implemented in the Inspired Intelligence Academy application.

## 📁 File Structure

```
inspired-intelligence-academy/
├── app/
│   ├── auth/
│   │   ├── login/
│   │   │   └── page.tsx              # Login page
│   │   ├── signup/
│   │   │   └── page.tsx              # Sign up page
│   │   ├── forgot-password/
│   │   │   └── page.tsx              # Forgot password page
│   │   └── reset-password/
│   │       └── page.tsx              # Reset password page
│   ├── dashboard/
│   │   └── page.tsx                  # Protected dashboard page
│   ├── profile/
│   │   ├── page.tsx                  # Profile edit page
│   │   └── setup/
│   │       └── page.tsx              # Profile setup after signup
│   ├── layout.tsx                    # Root layout with AuthProvider
│   └── globals.css                   # Global styles
├── components/
│   ├── Navbar.tsx                    # Updated with auth state
│   ├── Footer.tsx                    # Footer component
│   ├── ProductCard.tsx               # Product card component
│   └── ProtectedRoute.tsx             # Route protection wrapper
├── contexts/
│   └── AuthContext.tsx               # Authentication context provider
├── lib/
│   └── supabase/
│       ├── client.ts                  # Client-side Supabase client
│       ├── server.ts                  # Server-side Supabase client
│       └── middleware.ts              # Middleware helper
├── types/
│   └── database.ts                   # TypeScript type definitions
├── database/
│   ├── schema.sql                    # Database schema and RLS policies
│   └── storage-setup.sql             # Storage bucket setup
├── middleware.ts                     # Next.js middleware
├── SUPABASE_SETUP.md                 # Setup instructions
└── .env.local                        # Environment variables (create this)
```

## 🔑 Key Components

### 1. Authentication Context (`contexts/AuthContext.tsx`)

The central authentication state management system that provides:
- User session management
- Profile data management
- Authentication methods (signUp, signIn, signOut, etc.)
- Profile update functionality
- Global loading states

**Usage:**
```tsx
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, profile, signOut, loading } = useAuth();
  // Use auth state and methods
}
```

### 2. Protected Routes (`components/ProtectedRoute.tsx`)

A wrapper component that protects routes requiring authentication:
- Automatically redirects unauthenticated users to login
- Shows loading state during authentication check
- Can be customized with different redirect paths

**Usage:**
```tsx
import ProtectedRoute from '@/components/ProtectedRoute';

export default function MyProtectedPage() {
  return (
    <ProtectedRoute>
      <YourPageContent />
    </ProtectedRoute>
  );
}
```

### 3. Authentication Pages

#### Sign Up (`app/auth/signup/page.tsx`)
- Email and password registration
- Username and full name collection
- Password confirmation validation
- Error handling for existing users
- Redirects to profile setup after signup

#### Login (`app/auth/login/page.tsx`)
- Email and password authentication
- "Remember me" functionality
- Forgot password link
- Redirects to dashboard after login

#### Forgot Password (`app/auth/forgot-password/page.tsx`)
- Email-based password reset request
- Sends reset link to user's email

#### Reset Password (`app/auth/reset-password/page.tsx`)
- New password entry after clicking reset link
- Password confirmation validation
- Redirects to login after successful reset

### 4. Profile Management

#### Profile Page (`app/profile/page.tsx`)
- View and edit profile information
- Upload profile pictures to Supabase Storage
- Update username and full name
- Real-time validation and error handling

#### Profile Setup (`app/profile/setup/page.tsx`)
- Shown after initial signup
- Guides users to complete their profile

#### Dashboard (`app/dashboard/page.tsx`)
- Protected route showing user information
- Displays profile data and account status

## 🗄️ Database Schema

### Profiles Table

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
);
```

### Row Level Security (RLS) Policies

- Users can view their own profile
- Users can view other profiles (public)
- Users can insert their own profile
- Users can update their own profile
- Automatic profile creation on user signup

## 🔐 Security Features

1. **Row Level Security (RLS)**: All database operations are protected by RLS policies
2. **Session Management**: Automatic session refresh via middleware
3. **Password Validation**: Client-side validation before submission
4. **Protected Routes**: Unauthenticated users cannot access protected pages
5. **Storage Policies**: Users can only upload/delete their own avatars

## 🚀 Features Implemented

✅ **Authentication**
- [x] Email/password sign up
- [x] Email/password login
- [x] Logout functionality
- [x] Remember me option
- [x] Forgot password flow
- [x] Reset password functionality
- [x] Email confirmation support

✅ **User Profile**
- [x] Automatic profile creation on signup
- [x] Profile edit page
- [x] Profile picture upload to Supabase Storage
- [x] Username and full name management

✅ **Session Management**
- [x] Global auth context/provider
- [x] Protected route wrapper
- [x] Session refresh handling
- [x] Loading states during auth checks

✅ **UI/UX**
- [x] Clean, responsive design with Tailwind CSS
- [x] User-friendly error messages
- [x] Form validation
- [x] Loading indicators
- [x] Success notifications

## 📝 Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🔧 Setup Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Up Supabase**
   - Follow the instructions in `SUPABASE_SETUP.md`
   - Create your Supabase project
   - Run the SQL scripts from `database/` folder
   - Set up the storage bucket

3. **Configure Environment Variables**
   - Create `.env.local` with your Supabase credentials

4. **Run the Application**
   ```bash
   npm run dev
   ```

## 🎨 UI Components

All authentication pages use:
- **Tailwind CSS** for styling
- **Lucide React** icons
- **Brand colors** from your design system
- **Responsive design** for mobile and desktop
- **Accessible forms** with proper labels and error messages

## 🔄 User Flow

1. **Sign Up Flow**
   - User visits `/auth/signup`
   - Fills in email, password, username, full name
   - Account created → Profile auto-created
   - Redirected to `/profile/setup`
   - Email confirmation sent (if enabled)

2. **Login Flow**
   - User visits `/auth/login`
   - Enters email and password
   - Optionally checks "Remember me"
   - Redirected to `/dashboard` on success

3. **Password Reset Flow**
   - User clicks "Forgot password" on login page
   - Enters email on `/auth/forgot-password`
   - Receives reset email
   - Clicks link → `/auth/reset-password`
   - Sets new password → Redirected to login

4. **Profile Management**
   - User visits `/profile` (protected)
   - Can update username, full name
   - Can upload/remove profile picture
   - Changes saved to database

## 🐛 Troubleshooting

### Common Issues

1. **"Missing Supabase environment variables"**
   - Ensure `.env.local` exists with correct variables
   - Restart dev server after adding variables

2. **Profile not created on signup**
   - Check that the trigger function was created in database
   - Verify RLS policies are set correctly

3. **Avatar upload fails**
   - Ensure storage bucket `avatars` exists
   - Check storage policies are created
   - Verify bucket is set to public (if needed)

4. **Session not persisting**
   - Check middleware is properly configured
   - Verify cookies are being set correctly

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Authentication](https://nextjs.org/docs/authentication)
- [Supabase Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)

## ✨ Next Steps

Consider adding:
- Social authentication (Google, GitHub, etc.)
- Two-factor authentication
- Email change functionality
- Account deletion
- User preferences/settings
- Activity logging

