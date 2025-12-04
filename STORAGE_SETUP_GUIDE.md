# Storage Setup Guide

## Which Storage Setup Should You Use?

You have two options for setting up Supabase Storage policies for avatar uploads. **You only need to use ONE of them, not both.**

### Option 1: `storage-setup.sql` (More Secure - Recommended)

**Use this if:** You want more granular security where users can only manage their own avatar files.

**How it works:**
- Checks if the user's ID is in the filename or folder path
- More secure as it restricts users to their own files
- Works with the folder-based upload structure (`{user-id}/{filename}`)

**When to use:**
- Production environments
- When you want stricter access control
- When you're using the folder-based upload structure

### Option 2: `storage-setup-simple.sql` (Simpler - Easier to Set Up)

**Use this if:** You're having issues with the folder-based policies or want a simpler setup.

**How it works:**
- Allows any authenticated user to upload/update/delete files in the avatars bucket
- Simpler policies that are easier to debug
- Less granular but more reliable

**When to use:**
- Development/testing environments
- When you're having RLS policy issues
- When you want the quickest setup that works

## Recommendation

**For most users, I recommend starting with `storage-setup-simple.sql`** because:
1. It's simpler and less likely to have issues
2. It's easier to debug if something goes wrong
3. For profile pictures, the security difference is minimal (users can only upload to the avatars bucket anyway)
4. You can always switch to the more secure version later if needed

## How to Set Up

1. **Create the bucket first:**
   - Go to Supabase Dashboard → Storage
   - Click "Create Bucket"
   - Name: `avatars`
   - Public: Toggle ON (recommended for profile pictures)

2. **Run ONE of the SQL files:**
   - Go to SQL Editor
   - Copy and paste the contents of **either** `storage-setup.sql` OR `storage-setup-simple.sql`
   - Click "Run"

3. **Test it:**
   - Try uploading a profile picture
   - If it works, you're done!
   - If you get RLS errors, try the other file

## Can I Use Both?

**No, you should only use ONE.** They create policies with different names, so if you run both, you'll have duplicate policies. If you want to switch:

1. Drop the existing policies first
2. Then run the new SQL file

## Troubleshooting

**If you get "new row violates row-level security policy":**
- Try `storage-setup-simple.sql` instead
- Make sure the bucket exists and is named `avatars`
- Check that RLS is enabled on `storage.objects`

**If uploads work but you can't view images:**
- Make sure the bucket is set to "Public"
- Check the "Anyone can view avatars" policy exists

