-- Create storage bucket for client photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('client-photos', 'client-photos', false);

-- RLS policies for client-photos bucket
-- Authenticated users can upload their own photos
CREATE POLICY "Users can upload own photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'client-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Users can view their own photos
CREATE POLICY "Users can view own photos"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'client-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Service role can access all (for admin)
CREATE POLICY "Service role full access to photos"
  ON storage.objects FOR ALL
  TO service_role
  USING (bucket_id = 'client-photos')
  WITH CHECK (bucket_id = 'client-photos');

-- Create form submissions table
CREATE TABLE public.form_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  form_data JSONB NOT NULL,
  photo_front TEXT,
  photo_side TEXT,
  photo_back TEXT,
  photo_assessment TEXT,
  selected_equipment TEXT[],
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own submissions"
  ON public.form_submissions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own submissions"
  ON public.form_submissions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role full access submissions"
  ON public.form_submissions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);