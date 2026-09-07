CREATE TABLE task_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    task_id UUID NOT NULL REFERENCES video_tasks(id) ON DELETE CASCADE,
    operation TEXT NOT NULL,
    old_data JSONB,
    new_data JSONB,
    changed_by_user_id UUID,
    changed_by_email TEXT
);

ALTER TABLE task_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view audit logs"
  ON task_audit_logs
  FOR SELECT
  TO authenticated
  USING (true);

-- Function to handle the audit log
CREATE OR REPLACE FUNCTION process_task_audit_log()
RETURNS TRIGGER AS $$
DECLARE
    v_user_id UUID;
    v_email TEXT;
BEGIN
    -- Get current user id
    v_user_id := auth.uid();
    
    -- Get user email if available
    IF v_user_id IS NOT NULL THEN
        SELECT email INTO v_email FROM auth.users WHERE id = v_user_id;
    END IF;

    IF (TG_OP = 'DELETE') THEN
        INSERT INTO task_audit_logs (task_id, operation, old_data, changed_by_user_id, changed_by_email)
        VALUES (OLD.id, TG_OP, row_to_json(OLD)::jsonb, v_user_id, v_email);
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO task_audit_logs (task_id, operation, old_data, new_data, changed_by_user_id, changed_by_email)
        VALUES (NEW.id, TG_OP, row_to_json(OLD)::jsonb, row_to_json(NEW)::jsonb, v_user_id, v_email);
        RETURN NEW;
    ELSIF (TG_OP = 'INSERT') THEN
        INSERT INTO task_audit_logs (task_id, operation, new_data, changed_by_user_id, changed_by_email)
        VALUES (NEW.id, TG_OP, row_to_json(NEW)::jsonb, v_user_id, v_email);
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for audit log
CREATE TRIGGER video_tasks_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON video_tasks
FOR EACH ROW EXECUTE FUNCTION process_task_audit_log();
