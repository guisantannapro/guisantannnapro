CREATE OR REPLACE FUNCTION public.claim_form_submission(_submission_id uuid, _old_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Only update the specific submission
  UPDATE public.form_submissions
  SET user_id = auth.uid()
  WHERE id = _submission_id
    AND (
      (_old_user_id IS NOT NULL AND user_id = _old_user_id)
      OR (_old_user_id IS NULL AND user_id IS NULL)
    );

  -- Only reassign protocolos/client_protocols if old_user_id is NOT an admin
  -- This prevents moving protocols belonging to other clients
  IF _old_user_id IS NOT NULL AND NOT public.has_role(_old_user_id, 'admin') THEN
    UPDATE public.protocolos
    SET user_id = auth.uid()
    WHERE user_id = _old_user_id;

    UPDATE public.client_protocols
    SET user_id = auth.uid()
    WHERE user_id = _old_user_id;
  END IF;
END;
$function$;