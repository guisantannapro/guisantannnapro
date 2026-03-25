DROP POLICY "Users can insert own submissions" ON public.form_submissions;
DROP POLICY "Anyone can insert submissions" ON public.form_submissions;

CREATE POLICY "Anyone can insert submissions"
ON public.form_submissions
FOR INSERT
TO anon, authenticated
WITH CHECK (
  user_id IS NULL OR user_id = auth.uid()
);