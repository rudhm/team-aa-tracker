-- Restrict feedback inserts to authenticated users only
DROP POLICY IF EXISTS "Public can insert feedback" ON public.feedback;

CREATE POLICY "Authenticated users can insert feedback"
  ON public.feedback
  FOR INSERT
  TO authenticated
  WITH CHECK (true);
