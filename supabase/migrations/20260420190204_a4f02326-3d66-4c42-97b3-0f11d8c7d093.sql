-- ============================================================
-- 1. STORAGE: client-photos — remover leituras públicas perigosas
-- ============================================================
DROP POLICY IF EXISTS "Allow anonymous reads from client-photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated reads from client-photos" ON storage.objects;
-- Política duplicada de upload (mantemos a "Allow anonymous uploads to client-photos")
DROP POLICY IF EXISTS "Anyone can upload photos" ON storage.objects;

-- Garante que existe política correta para clientes lerem só suas próprias fotos
-- (já existe "Users can view own photos" e "Admins can view client photos" — apenas confirmamos)

-- ============================================================
-- 2. form_submissions — remover INSERT permissivo (WITH CHECK true)
-- ============================================================
DROP POLICY IF EXISTS "Allow insert submissions" ON public.form_submissions;
DROP POLICY IF EXISTS "Authenticated users can submit forms" ON public.form_submissions;

-- Anônimo: só pode inserir SEM user_id (NULL)
CREATE POLICY "Anonymous can submit forms without user_id"
ON public.form_submissions
FOR INSERT
TO anon
WITH CHECK (user_id IS NULL);

-- Autenticado: só pode inserir com o próprio user_id (ou NULL)
CREATE POLICY "Authenticated can submit own forms"
ON public.form_submissions
FOR INSERT
TO authenticated
WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

-- ============================================================
-- 3. user_roles — remover política recursiva
-- ============================================================
DROP POLICY IF EXISTS "Only admins can manage roles" ON public.user_roles;
-- A política "Admins can manage roles" já usa has_role() corretamente, mantemos ela.

-- ============================================================
-- 5. is_admin — adicionar search_path
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  );
$$;