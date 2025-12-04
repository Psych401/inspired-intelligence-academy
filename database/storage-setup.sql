/**
 * Supabase Storage Setup
 * 
 * Run this SQL in your Supabase SQL Editor to create the avatars storage bucket
 * and set up storage policies for profile picture uploads.
 * 
 * IMPORTANT: Before running this, make sure you've created the 'avatars' bucket
 * in the Supabase Dashboard under Storage > Create Bucket
 * - Bucket name: avatars
 * - Public: true (recommended for profile pictures)
 */

-- First, drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;

-- Enable RLS on storage.objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Users can upload their own avatars
-- This allows users to upload files where their user ID appears in the filename
CREATE POLICY "Users can upload own avatar"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (
    -- Allow if user ID is in the filename (e.g., "avatars/user-id-random.ext")
    (storage.foldername(name))[1] = auth.uid()::text OR
    -- Allow if filename starts with user ID (e.g., "avatars/user-id-random.ext")
    (name LIKE auth.uid()::text || '%')
  )
);

-- Policy: Users can update their own avatars
CREATE POLICY "Users can update own avatar"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (
    (storage.foldername(name))[1] = auth.uid()::text OR
    (name LIKE auth.uid()::text || '%')
  )
)
WITH CHECK (
  bucket_id = 'avatars' AND
  (
    (storage.foldername(name))[1] = auth.uid()::text OR
    (name LIKE auth.uid()::text || '%')
  )
);

-- Policy: Users can delete their own avatars
CREATE POLICY "Users can delete own avatar"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (
    (storage.foldername(name))[1] = auth.uid()::text OR
    (name LIKE auth.uid()::text || '%')
  )
);

-- Policy: Anyone can view avatars (if bucket is public)
CREATE POLICY "Anyone can view avatars"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'avatars');

