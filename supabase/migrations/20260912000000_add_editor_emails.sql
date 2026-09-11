ALTER TABLE predefined_clients ADD COLUMN email TEXT;
ALTER TABLE video_tasks ADD COLUMN notified_editor TEXT;
ALTER TABLE video_tasks ADD COLUMN notified_urgent BOOLEAN DEFAULT FALSE;
