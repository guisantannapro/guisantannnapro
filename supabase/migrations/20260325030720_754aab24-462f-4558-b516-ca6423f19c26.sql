
DROP POLICY IF EXISTS "Anyone can insert submissions" ON public.form_submissions;

CREATE POLICY "Allow insert submissions"
ON public.form_submissions
FOR INSERT
TO anon, authenticated
WITH CHECK (true);
