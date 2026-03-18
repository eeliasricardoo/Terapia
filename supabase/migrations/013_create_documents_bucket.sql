-- Create documents bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('documents', 'documents', false, 5242880, '{"application/pdf","image/jpeg","image/png"}')
ON CONFLICT (id) DO UPDATE SET 
    file_size_limit = 5242880,
    allowed_mime_types = '{"application/pdf","image/jpeg","image/png"}',
    public = false;

-- Allow authenticated users to upload to documents
CREATE POLICY "Users can upload their own documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documents');

-- Allow admins to read documents
CREATE POLICY "Admins can read documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' AND 
  (auth.uid() = owner OR EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'ADMIN'
  ))
);
