-- Create avatars bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'avatars', true, 5242880, '{"image/jpeg","image/png","image/webp"}')
ON CONFLICT (id) DO UPDATE SET 
    file_size_limit = 5242880, -- 5MB limit
    allowed_mime_types = '{"image/jpeg","image/png","image/webp"}',
    public = true;

-- Cleanup existing policies
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;

-- Allow public read access to the avatars bucket
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Deny all direct client-side INSERT/UPDATE/DELETE. 
-- Since our Next.js backend uses Service Role to securely upload verified and size-checked files,
-- we do NOT need to give users direct permission to modify objects via the Postgres connection.
-- This effectively closes the door to malicious files bypassing our Node.js rate limit and validations.
