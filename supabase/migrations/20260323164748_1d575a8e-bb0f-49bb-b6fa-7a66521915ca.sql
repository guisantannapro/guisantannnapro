
-- Table for storing protocol files metadata
CREATE TABLE public.client_protocols (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  file_name text NOT NULL,
  file_path text NOT NULL,
  uploaded_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.client_protocols ENABLE ROW LEVEL SECURITY;

-- Clients can view their own protocols
CREATE POLICY "Users can view own protocols"
ON public.client_protocols FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can manage all protocols
CREATE POLICY "Admins can manage protocols"
ON public.client_protocols FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Storage bucket for protocol files
INSERT INTO storage.buckets (id, name, public)
VALUES ('client-protocols', 'client-protocols', false);

-- Storage policies: clients can download their own files
CREATE POLICY "Users can download own protocols"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'client-protocols' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Admins can upload/manage all protocol files
CREATE POLICY "Admins can manage protocol files"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'client-protocols' AND public.has_role(auth.uid(), 'admin'))
WITH CHECK (bucket_id = 'client-protocols' AND public.has_role(auth.uid(), 'admin'));

-- Add plan_duration and plan_expires_at to profiles for tracking plan expiration
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS plan_duration text,
ADD COLUMN IF NOT EXISTS plan_expires_at timestamp with time zone;
