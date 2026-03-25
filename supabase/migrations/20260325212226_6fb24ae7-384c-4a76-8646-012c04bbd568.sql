UPDATE profiles 
SET 
  plan_activated_at = now(),
  plan_expires_at = plan_expires_at + interval '30 days',
  updated_at = now()
WHERE id = 'fee3d907-ed57-450d-b154-ca969aab9e96';