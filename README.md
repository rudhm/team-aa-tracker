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

## Database

Apply the migrations in `supabase/migrations` to the target project before deploying. The active `video_tasks` schema includes `duration`, which is added by `20260906180000_add_duration.sql`.

When a local Supabase database is running, refresh the committed database types with:

```bash
npx supabase gen types typescript --local --schema public > src/types/database.ts
```

The local type generation command requires Docker or Podman. The committed file currently reflects the checked-in migrations so builds and type checking do not depend on a running local database.
