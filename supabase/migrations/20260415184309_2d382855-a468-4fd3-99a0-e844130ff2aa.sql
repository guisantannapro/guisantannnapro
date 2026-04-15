
-- Tabela de exercícios estruturados do protocolo (logbook interativo)
CREATE TABLE public.protocol_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  protocolo_id UUID NOT NULL REFERENCES public.protocolos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  week_number INTEGER NOT NULL DEFAULT 1,
  day_label TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  table_type TEXT NOT NULL DEFAULT 'standard',
  exercise_name TEXT NOT NULL DEFAULT '',
  metodo TEXT DEFAULT '',
  admin_obs TEXT DEFAULT '',
  client_top_set TEXT DEFAULT '',
  client_back_off TEXT DEFAULT '',
  client_resultado TEXT DEFAULT '',
  client_obs TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_protocol_exercises_protocolo ON public.protocol_exercises(protocolo_id);
CREATE INDEX idx_protocol_exercises_user ON public.protocol_exercises(user_id);
CREATE INDEX idx_protocol_exercises_week ON public.protocol_exercises(protocolo_id, week_number, day_label, sort_order);

-- RLS
ALTER TABLE public.protocol_exercises ENABLE ROW LEVEL SECURITY;

-- Admin tem acesso total
CREATE POLICY "Admins can manage protocol exercises"
ON public.protocol_exercises
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Cliente pode ver seus exercícios
CREATE POLICY "Users can view own protocol exercises"
ON public.protocol_exercises
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Cliente pode atualizar APENAS os campos de resultado (client_*)
CREATE POLICY "Users can update own exercise results"
ON public.protocol_exercises
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
