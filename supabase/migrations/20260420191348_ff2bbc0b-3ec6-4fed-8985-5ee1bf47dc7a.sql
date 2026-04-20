-- =========================================================
-- 1. STORAGE: client-photos — restringir paths de upload
-- =========================================================
DROP POLICY IF EXISTS "Allow anonymous uploads to client-photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads to client-photos" ON storage.objects;

-- Anônimo: apenas em pastas que começam com 'anon-' (formulário público)
CREATE POLICY "Anonymous can upload to anon folder only"
ON storage.objects
FOR INSERT
TO anon
WITH CHECK (
  bucket_id = 'client-photos'
  AND (storage.foldername(name))[1] LIKE 'anon-%'
);

-- Autenticado: já existe "Users can upload own photos" (folder = auth.uid()), mantemos.
-- Nada mais a adicionar aqui.

-- =========================================================
-- 2. PROFILES: bloquear cliente de alterar campos de plano
-- =========================================================
CREATE OR REPLACE FUNCTION public.prevent_plan_self_modification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Permitir se for admin ou service_role (Edge Functions)
  IF public.has_role(auth.uid(), 'admin'::app_role) THEN
    RETURN NEW;
  END IF;

  -- Bloquear mudança em campos sensíveis
  IF NEW.plan IS DISTINCT FROM OLD.plan
     OR NEW.plan_activated_at IS DISTINCT FROM OLD.plan_activated_at
     OR NEW.plan_expires_at IS DISTINCT FROM OLD.plan_expires_at
     OR NEW.plan_duration IS DISTINCT FROM OLD.plan_duration
     OR NEW.renewal_starts_at IS DISTINCT FROM OLD.renewal_starts_at
  THEN
    RAISE EXCEPTION 'Você não tem permissão para alterar campos do plano';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_plan_self_modification_trigger ON public.profiles;
CREATE TRIGGER prevent_plan_self_modification_trigger
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_plan_self_modification();

-- Nota: service_role bypass de RLS, mas triggers rodam mesmo assim.
-- A função has_role retorna false para service_role (auth.uid() é NULL),
-- então precisamos de exceção para service_role também:
CREATE OR REPLACE FUNCTION public.prevent_plan_self_modification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- service_role (Edge Functions com SUPABASE_SERVICE_ROLE_KEY) → liberado
  IF current_setting('request.jwt.claim.role', true) = 'service_role' THEN
    RETURN NEW;
  END IF;

  -- admin → liberado
  IF auth.uid() IS NOT NULL AND public.has_role(auth.uid(), 'admin'::app_role) THEN
    RETURN NEW;
  END IF;

  -- Cliente comum: bloquear campos de plano
  IF NEW.plan IS DISTINCT FROM OLD.plan
     OR NEW.plan_activated_at IS DISTINCT FROM OLD.plan_activated_at
     OR NEW.plan_expires_at IS DISTINCT FROM OLD.plan_expires_at
     OR NEW.plan_duration IS DISTINCT FROM OLD.plan_duration
     OR NEW.renewal_starts_at IS DISTINCT FROM OLD.renewal_starts_at
  THEN
    RAISE EXCEPTION 'Você não tem permissão para alterar campos do plano';
  END IF;

  RETURN NEW;
END;
$$;

-- =========================================================
-- 3. PROTOCOLOS: remover policy redundante para role public
-- =========================================================
DROP POLICY IF EXISTS "Users can view their own protocols" ON public.protocolos;
-- Mantém "Users can view own protocols" (authenticated) e "Admins can manage protocols".

-- =========================================================
-- 4. USER_ROLES: remover policy duplicada para role public
-- =========================================================
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
-- Mantém "Users can read own roles" (authenticated) e "Admins can manage roles".