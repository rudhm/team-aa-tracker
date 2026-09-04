-- Migration: create_video_tasks_table

CREATE TABLE IF NOT EXISTS video_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  client TEXT NOT NULL,
  sub_client TEXT,
  video_title TEXT NOT NULL,
  raw_video_link TEXT,
  directions TEXT,
  changes TEXT,
  editor_name TEXT,
  start_date DATE,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'In Progress',
  final_video_link TEXT,
  no_of_revisions INTEGER,
  complexity TEXT,
  price NUMERIC
);

-- Enable RLS (Row Level Security) and add policies if needed
-- ALTER TABLE video_tasks ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Enable read access for all users" ON video_tasks FOR SELECT USING (true);
