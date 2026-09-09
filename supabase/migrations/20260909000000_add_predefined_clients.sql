CREATE TABLE predefined_clients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('client', 'sub_client')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(name, type)
);

ALTER TABLE predefined_clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage predefined clients"
  ON predefined_clients FOR ALL TO authenticated USING (true) WITH CHECK (true);
