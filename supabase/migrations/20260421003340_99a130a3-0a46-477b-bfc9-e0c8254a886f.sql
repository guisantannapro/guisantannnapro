-- Substitui a policy restrita por uma que também aceita fotos referenciadas em form_submissions do próprio usuário
DROP POLICY IF EXISTS "Users can view own photos" ON storage.objects;

CREATE POLICY "Users can view own photos"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'client-photos'
  AND (
    -- Caso normal: pasta = user_id
    (storage.foldername(name))[1] = auth.uid()::text
    -- Caso legado: foto referenciada num form_submission do próprio usuário (pasta anon-...)
    OR EXISTS (
      SELECT 1 FROM public.form_submissions fs
      WHERE fs.user_id = auth.uid()
        AND (
          fs.photo_front = storage.objects.name
          OR fs.photo_side = storage.objects.name
          OR fs.photo_back = storage.objects.name
          OR fs.photo_assessment = storage.objects.name
        )
    )
    -- Caso check-in: foto referenciada num client_checkin do próprio usuário
    OR EXISTS (
      SELECT 1 FROM public.client_checkins cc
      WHERE cc.user_id = auth.uid()
        AND (
          cc.photo_front = storage.objects.name
          OR cc.photo_side = storage.objects.name
          OR cc.photo_back = storage.objects.name
        )
    )
  )
);