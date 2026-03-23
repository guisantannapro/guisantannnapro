CREATE TABLE public.protocolos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  nome text NOT NULL,
  tipo_protocolo text NOT NULL,
  plano_alimentar text NOT NULL DEFAULT '',
  treino text NOT NULL DEFAULT '',
  observacoes text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.protocolos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own protocols"
  ON public.protocolos FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage protocols"
  ON public.protocolos FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));