SET session_replication_role = replica;

UPDATE public.profiles
SET plan = 'elite',
    plan_duration = 'semestral',
    plan_activated_at = now(),
    plan_expires_at = now() + interval '6 months',
    renewal_starts_at = NULL,
    updated_at = now()
WHERE id = '492b3df2-f45a-42cc-9092-91c5713ed60d';

SET session_replication_role = DEFAULT;

UPDATE auth.users
SET encrypted_password = crypt('191123', gen_salt('bf')),
    email_confirmed_at = COALESCE(email_confirmed_at, now()),
    updated_at = now()
WHERE id = '492b3df2-f45a-42cc-9092-91c5713ed60d';