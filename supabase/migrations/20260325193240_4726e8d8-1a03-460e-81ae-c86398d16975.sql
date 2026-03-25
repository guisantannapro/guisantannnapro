
-- Create the evolution-photos storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('evolution-photos', 'evolution-photos', false);

-- Storage RLS: users can view own evolution photos
CREATE POLICY "Users can view own evolution photos"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'evolution-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Storage RLS: admins can manage evolution photos
CREATE POLICY "Admins can manage evolution photos"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'evolution-photos' AND public.has_role(auth.uid(), 'admin'))
WITH CHECK (bucket_id = 'evolution-photos' AND public.has_role(auth.uid(), 'admin'));

-- Create the client_evolutions table
CREATE TABLE public.client_evolutions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  photo_before text,
  photo_after text,
  title text NOT NULL DEFAULT '',
  description text,
  weight_before numeric,
  weight_after numeric,
  body_fat_before numeric,
  body_fat_after numeric,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.client_evolutions ENABLE ROW LEVEL SECURITY;

-- RLS: users can view own evolutions
CREATE POLICY "Users can view own evolutions"
ON public.client_evolutions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- RLS: admins can manage evolutions
CREATE POLICY "Admins can manage evolutions"
ON public.client_evolutions FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));
