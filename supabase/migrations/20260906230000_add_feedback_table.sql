CREATE TABLE public.feedback (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  type text NOT NULL,
  name text,
  description text NOT NULL
);

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can insert feedback"
  ON public.feedback FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Public can view feedback"
  ON public.feedback FOR SELECT TO public USING (true);
