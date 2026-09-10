# Team AA Studios video tracker

This Next.js application tracks video work and prepares monthly payroll wrap-ups. Data is stored in Supabase.

## Getting started

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Configuration

Copy `.env.example` to `.env.local` and set:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

The application intentionally fails fast when either variable is missing so deployments cannot silently run against an invalid Supabase client.

Access is invite-only through Supabase Auth. Public sign-up is disabled; create team accounts from the Supabase dashboard or an approved administrative process.

### Optional: Feedback email notifications

To receive email notifications when team members submit feedback, set:

- `RESEND_API_KEY` — your [Resend](https://resend.com) API key
- `FEEDBACK_NOTIFY_EMAIL` — the email address to notify

If either variable is absent, feedback is still saved to the database but no email is sent.

## Database

Apply the migrations in `supabase/migrations` to the target project before deploying. The migrations are ordered by filename timestamp and must be applied in order.

Key migrations:
- `20260906180000_add_duration.sql` — adds `duration` column to `video_tasks`
- `20260906183000_secure_video_tasks.sql` — enables RLS and payroll lock trigger
- `20260906230000_add_feedback_table.sql` — creates feedback table
- `20260907_add_task_audit_log.sql` — creates audit log table and trigger
- `20260909000000_add_predefined_clients.sql` — creates predefined clients table
- `20260910000000_fix_predefined_clients_type.sql` — **required**: fixes the type constraint to include 'editor'
- `20260910000001_restrict_feedback_select.sql` — **required**: restricts feedback reads to authenticated users

When a local Supabase database is running, refresh the committed database types with:

```bash
npx supabase gen types typescript --local --schema public > src/types/database.ts
```

The local type generation command requires Docker or Podman. The committed file currently reflects the checked-in migrations so builds and type checking do not depend on a running local database.
