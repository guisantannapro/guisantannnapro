
-- Create training_logs table
CREATE TABLE public.training_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  protocolo_id UUID REFERENCES public.protocolos(id) ON DELETE CASCADE NOT NULL,
  exercise_name TEXT NOT NULL,
  set_number INTEGER NOT NULL DEFAULT 1,
  weight_kg NUMERIC,
  reps INTEGER,
  difficulty INTEGER CHECK (difficulty >= 1 AND difficulty <= 5),
  notes TEXT,
  training_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.training_logs ENABLE ROW LEVEL SECURITY;

-- Users can view own logs
CREATE POLICY "Users can view own training logs"
ON public.training_logs
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can insert own logs
CREATE POLICY "Users can insert own training logs"
ON public.training_logs
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update own logs
CREATE POLICY "Users can update own training logs"
ON public.training_logs
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Users can delete own logs
CREATE POLICY "Users can delete own training logs"
ON public.training_logs
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Admins can manage all logs
CREATE POLICY "Admins can manage training logs"
ON public.training_logs
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Index for fast lookups
CREATE INDEX idx_training_logs_user_protocol ON public.training_logs(user_id, protocolo_id, training_date);
