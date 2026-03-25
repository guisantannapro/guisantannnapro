CREATE POLICY "Allow anonymous uploads to client-photos"
ON storage.objects FOR INSERT TO anon
WITH CHECK (bucket_id = 'client-photos');

CREATE POLICY "Allow anonymous reads from client-photos"
ON storage.objects FOR SELECT TO anon
USING (bucket_id = 'client-photos');

CREATE POLICY "Allow authenticated uploads to client-photos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'client-photos');

CREATE POLICY "Allow authenticated reads from client-photos"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'client-photos');