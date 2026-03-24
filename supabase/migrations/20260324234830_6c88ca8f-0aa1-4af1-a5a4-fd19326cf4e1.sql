CREATE OR REPLACE FUNCTION public.claim_form_submission(_submission_id uuid, _old_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.form_submissions
  SET user_id = auth.uid()
  WHERE id = _submission_id
    AND user_id = _old_user_id;

  UPDATE public.protocolos
  SET user_id = auth.uid()
  WHERE user_id = _old_user_id;

  UPDATE public.client_protocols
  SET user_id = auth.uid()
  WHERE user_id = _old_user_id;
END;
$function$;