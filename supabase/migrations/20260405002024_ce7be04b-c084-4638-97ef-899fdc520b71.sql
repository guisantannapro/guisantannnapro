
-- Delete all test data except admin user (14088b6c-6b48-483d-943c-6e5c3aca3737)

DELETE FROM public.client_checkins WHERE user_id != '14088b6c-6b48-483d-943c-6e5c3aca3737';
DELETE FROM public.client_evolutions WHERE user_id != '14088b6c-6b48-483d-943c-6e5c3aca3737';
DELETE FROM public.client_feedbacks WHERE user_id != '14088b6c-6b48-483d-943c-6e5c3aca3737';
DELETE FROM public.client_protocols WHERE user_id != '14088b6c-6b48-483d-943c-6e5c3aca3737';
DELETE FROM public.form_submissions WHERE user_id != '14088b6c-6b48-483d-943c-6e5c3aca3737';
DELETE FROM public.protocolos WHERE user_id != '14088b6c-6b48-483d-943c-6e5c3aca3737';
DELETE FROM public.user_roles WHERE user_id != '14088b6c-6b48-483d-943c-6e5c3aca3737';
DELETE FROM public.profiles WHERE id != '14088b6c-6b48-483d-943c-6e5c3aca3737';
