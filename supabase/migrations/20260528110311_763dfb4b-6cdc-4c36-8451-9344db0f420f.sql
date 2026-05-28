-- 1) Improve the plan-protection trigger to also recognise service_role via the modern claims JSON
CREATE OR REPLACE FUNCTION public.prevent_plan_self_modification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _claims_role text;
BEGIN
  -- legacy singular claim
  IF current_setting('request.jwt.claim.role', true) = 'service_role' THEN
    RETURN NEW;
  END IF;

  -- modern claims JSON
  BEGIN
    _claims_role := (current_setting('request.jwt.claims', true)::jsonb ->> 'role');
  EXCEPTION WHEN OTHERS THEN
    _claims_role := NULL;
  END;
  IF _claims_role = 'service_role' THEN
    RETURN NEW;
  END IF;

  IF auth.uid() IS NOT NULL AND public.has_role(auth.uid(), 'admin'::app_role) THEN
    RETURN NEW;
  END IF;

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
$function$;

-- 2) Provision the client (one-off admin operation)
DO $$
DECLARE
  _uid uuid;
  _now timestamptz := now();
  _expires timestamptz := now() + interval '3 months';
BEGIN
  SELECT id INTO _uid FROM auth.users WHERE email = 'alessandrasoareslop18@gmail.com';
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Usuário não encontrado';
  END IF;

  SET LOCAL "request.jwt.claims" TO '{"role":"service_role"}';

  UPDATE public.profiles
  SET full_name = 'Alessandra Soares Lopes',
      plan = 'transformacao'::user_plan,
      plan_duration = 'trimestral',
      plan_activated_at = _now,
      plan_expires_at = _expires,
      updated_at = _now
  WHERE id = _uid;

  INSERT INTO public.form_submissions (user_id, plan, form_data)
  VALUES (
    _uid,
    'transformacao',
    jsonb_build_object(
      'nome_completo', 'Alessandra Soares Lopes',
      'idade', '25',
      'altura', '1,64',
      'peso', '61',
      'email', 'alessandrasoareslop18@gmail.com',
      'instagram', '',
      'whatsapp', '48 996149682',
      'objetivo', 'ganho de massa',
      'doencas', 'não possuo',
      'medicacao', 'não',
      'hormonios', 'não',
      'suplementacao', 'sim',
      'suplementacao_quais', 'creatina e pré treino',
      'horario_refeicoes', 'não',
      'tabagismo', 'não',
      'alcool', 'sim - 1x por semana',
      'drogas', 'não',
      'modalidade', 'musculação',
      'modalidade_frequencia', '6x por semana, 1:30h por dia',
      'horario_disponivel', 'A partir das 18hrs',
      'cadastrado_por_admin', true
    )
  );
END$$;