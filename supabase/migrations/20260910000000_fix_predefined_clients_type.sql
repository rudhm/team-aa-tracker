-- The predefined_clients table was created with a CHECK constraint that
-- only allows 'client' and 'sub_client', but the application also stores
-- 'editor' entries.  Remove the overly-strict constraint and replace it
-- with one that covers all three valid values.

ALTER TABLE predefined_clients
  DROP CONSTRAINT IF EXISTS predefined_clients_type_check;

ALTER TABLE predefined_clients
  ADD CONSTRAINT predefined_clients_type_check
  CHECK (type IN ('client', 'sub_client', 'editor'));
