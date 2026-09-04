DROP TABLE IF EXISTS video_tasks;

CREATE TABLE video_tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    client TEXT NOT NULL,
    video_title TEXT NOT NULL,
    editor TEXT NOT NULL,
    due_date DATE,
    status TEXT DEFAULT 'Not started' NOT NULL CHECK (status IN ('Not started', 'In progress', 'In review', 'Revision', 'Delivered')),
    link TEXT,
    delivered_at TIMESTAMPTZ,
    payroll_locked BOOLEAN DEFAULT FALSE NOT NULL
);
