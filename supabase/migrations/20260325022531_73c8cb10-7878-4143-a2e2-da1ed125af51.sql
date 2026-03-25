ALTER TABLE public.form_submissions
ALTER COLUMN user_id DROP NOT NULL;

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
    AND (
      (_old_user_id IS NOT NULL AND user_id = _old_user_id)
      OR (_old_user_id IS NULL AND user_id IS NULL)
    );

  UPDATE public.protocolos
  SET user_id = auth.uid()
  WHERE _old_user_id IS NOT NULL
    AND user_id = _old_user_id;

  UPDATE public.client_protocols
  SET user_id = auth.uid()
  WHERE _old_user_id IS NOT NULL
    AND user_id = _old_user_id;
END;
$function$;