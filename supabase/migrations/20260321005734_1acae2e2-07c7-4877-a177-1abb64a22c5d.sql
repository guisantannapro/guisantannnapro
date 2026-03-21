
-- Allow anonymous users to insert form submissions
CREATE POLICY "Anyone can insert submissions"
ON public.form_submissions
FOR INSERT
TO anon
WITH CHECK (true);

-- Allow anonymous users to upload to client-photos bucket
INSERT INTO storage.objects (bucket_id) SELECT 'dummy' WHERE false;
-- Actually we need to create a storage policy via storage schema
CREATE POLICY "Anyone can upload photos"
ON storage.objects
FOR INSERT
TO anon
WITH CHECK (bucket_id = 'client-photos');
