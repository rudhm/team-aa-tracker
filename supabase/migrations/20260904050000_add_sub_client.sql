ALTER TABLE video_tasks
  ADD COLUMN IF NOT EXISTS sub_client TEXT;
