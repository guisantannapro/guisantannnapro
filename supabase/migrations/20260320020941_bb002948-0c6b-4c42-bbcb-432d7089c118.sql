
-- Allow admins to read all files in client-photos bucket
CREATE POLICY "Admins can view client photos"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'client-photos'
  AND public.has_role(auth.uid(), 'admin')
);
