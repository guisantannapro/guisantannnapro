UPDATE profiles 
SET renewal_starts_at = plan_expires_at - interval '30 days'
WHERE id = 'fee3d907-ed57-450d-b154-ca969aab9e96';