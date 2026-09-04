ALTER TABLE video_tasks DROP CONSTRAINT video_tasks_status_check;
ALTER TABLE video_tasks ADD CONSTRAINT video_tasks_status_check CHECK (status IN ('Not started', 'In progress', 'In review', 'Revision', 'Delivered', 'Complete'));
