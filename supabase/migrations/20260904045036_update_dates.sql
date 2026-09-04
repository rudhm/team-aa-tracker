ALTER TABLE video_tasks DROP COLUMN due_date;
ALTER TABLE video_tasks ADD COLUMN start_date DATE;
ALTER TABLE video_tasks ADD COLUMN complete_date DATE;
