
DO $$
BEGIN
  SET LOCAL session_replication_role = 'replica';

  UPDATE auth.users
  SET encrypted_password = crypt('Sh8Mhd8ML3', gen_salt('bf')),
      email_confirmed_at = COALESCE(email_confirmed_at, now()),
      updated_at = now()
  WHERE id = '4bf025d7-248f-42f5-8173-b77840d52b16';

  UPDATE public.form_submissions
  SET user_id = '4bf025d7-248f-42f5-8173-b77840d52b16'
  WHERE id = 'b5a74af6-de45-4e94-a621-1baa13128c90';
END $$;
