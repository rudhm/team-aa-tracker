ALTER TABLE public.video_tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view video tasks" ON public.video_tasks;
DROP POLICY IF EXISTS "Authenticated users can create video tasks" ON public.video_tasks;
DROP POLICY IF EXISTS "Authenticated users can update unlocked video tasks" ON public.video_tasks;
DROP POLICY IF EXISTS "Authenticated users can delete unlocked video tasks" ON public.video_tasks;

CREATE POLICY "Authenticated users can view video tasks"
  ON public.video_tasks
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create video tasks"
  ON public.video_tasks
  FOR INSERT
  TO authenticated
  WITH CHECK (payroll_locked = false);

CREATE POLICY "Authenticated users can update unlocked video tasks"
  ON public.video_tasks
  FOR UPDATE
  TO authenticated
  USING (payroll_locked = false)
  WITH CHECK (payroll_locked = true OR payroll_locked = false);

CREATE POLICY "Authenticated users can delete unlocked video tasks"
  ON public.video_tasks
  FOR DELETE
  TO authenticated
  USING (payroll_locked = false);

CREATE OR REPLACE FUNCTION public.prevent_locked_video_task_changes()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.payroll_locked AND NEW IS DISTINCT FROM OLD THEN
    RAISE EXCEPTION 'Payroll-locked video tasks are immutable';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_locked_video_task_changes ON public.video_tasks;

CREATE TRIGGER prevent_locked_video_task_changes
  BEFORE UPDATE ON public.video_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_locked_video_task_changes();
