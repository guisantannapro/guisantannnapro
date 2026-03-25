-- Force test data: Leo expires in 7 days, Miguel expired yesterday
UPDATE profiles 
SET plan = 'base', plan_expires_at = now() + interval '7 days', plan_duration = 'mensal'
WHERE id = 'fee3d907-ed57-450d-b154-ca969aab9e96';

UPDATE profiles 
SET plan_expires_at = now() - interval '1 day'
WHERE id = '57c93b9d-ab25-48cf-8c83-1fa893122455';
