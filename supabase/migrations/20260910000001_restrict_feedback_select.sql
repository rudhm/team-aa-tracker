-- The original feedback policy allowed the public role (anonymous users) to
-- both INSERT and SELECT feedback.  Public inserts are intentional (team
-- members submit feedback from the frontend), but SELECT should be restricted
-- to authenticated users only so that an unauthenticated user who bypasses the
-- proxy cannot read the full feedback list.

DROP POLICY IF EXISTS "Public can view feedback" ON public.feedback;

CREATE POLICY "Authenticated users can view feedback"
  ON public.feedback
  FOR SELECT
  TO authenticated
  USING (true);
