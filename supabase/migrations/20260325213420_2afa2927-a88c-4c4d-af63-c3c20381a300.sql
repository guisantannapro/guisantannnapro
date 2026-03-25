-- Reset Leo: restore original plan expiry and clear test data
UPDATE profiles 
SET 
  plan_activated_at = '2026-03-21 20:57:43.219171+00',
  plan_expires_at = '2026-04-21 20:57:43.219171+00',
  renewal_starts_at = NULL,
  updated_at = now()
WHERE id = 'fee3d907-ed57-450d-b154-ca969aab9e96';

-- Reset Miguel: restore original plan expiry
UPDATE profiles 
SET 
  plan_activated_at = '2026-03-01 20:57:43.219171+00',
  plan_expires_at = '2026-04-01 20:57:43.219171+00',
  renewal_starts_at = NULL,
  updated_at = now()
WHERE id = '57c93b9d-ab25-48cf-8c83-1fa893122455';