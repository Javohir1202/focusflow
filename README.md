# ServiceFlow

A lightweight CRM for service businesses. Public marketing site (SEO-indexed) +
private authenticated app for tracking leads, customers, jobs, appointments,
and tasks — built with Next.js App Router, Supabase, and Tailwind CSS.

## Stack

- **Next.js 14** (App Router, server components by default)
- **Supabase** — auth + Postgres data, Row Level Security on every table
- **Tailwind CSS**
- **Zod** — validates every server action's input before it touches the database

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in your Supabase project values
npm run dev
```

Then apply the database schema (see [Database schema](#database-schema) below)
before signing up — every private page queries tables that migration creates.

## Environment variables

See `.env.example`. Never commit `.env` or `.env.local`.

- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase project
- `NEXT_PUBLIC_APP_URL` — canonical site URL, used for metadata, sitemap,
  robots.txt, and JSON-LD (e.g. `https://serviceflow.app`)

## Route structure

**Public (indexable):** `/`, `/features`, `/pricing`, `/about`, `/login`, `/signup`

**Private (noindex, auth-required via `middleware.ts`):**
`/dashboard`, `/customers`, `/customers/[id]`, `/leads`, `/jobs`, `/tasks`,
`/appointments`, `/analytics`, `/settings` — all live under the
`app/(private)/` route group, which sets `robots: { index: false, follow: false }`
for everything inside it.

## Core flow

```
Lead (pipeline) → won → Customer → Job → Task
                                 ↳ Appointment
```

A lead moves through a six-stage pipeline (new → contacted → qualified →
quoted → won/lost) on a drag-and-drop board. Converting a won lead creates a
real `customers` row and links back to the lead — no re-typing. From there,
jobs, tasks, and appointments all attach to the customer (jobs and
appointments also optionally attach to a task or job respectively). Every
create/status-change on every entity is logged to `activity_log` by a
database trigger, not application code, so the activity feed on the
dashboard and on each customer's detail page can't drift out of sync with
reality.

## Database schema

`supabase/migrations/20260904010000_pivot_to_serviceflow.sql` defines the
full schema:

- **`customers`** — `id, user_id, name, company, phone, email, status
  (prospect/active/inactive), source, tags, notes, created_at, updated_at`
- **`leads`** — `id, user_id, customer_id, contact_name, company, email,
  phone, source, status (new/contacted/qualified/quoted/won/lost), value,
  assigned_to, notes, next_follow_up_at, created_at, updated_at`
- **`jobs`** — `id, user_id, customer_id, title, status (new/scheduled/
  in_progress/on_hold/completed/cancelled), priority, deadline, assigned_to,
  price, notes, created_at, updated_at`
- **`tasks`** — `id, user_id, job_id, customer_id, title, description,
  priority, status (todo/in_progress/done), assignee, estimated_minutes,
  deadline, completed_at, created_at, updated_at`
- **`appointments`** — `id, user_id, customer_id, job_id, title,
  scheduled_at, duration_minutes, status (scheduled/confirmed/completed/
  cancelled), notes, created_at, updated_at`
- **`activity_log`** — append-only, populated by triggers on every table
  above: `id, user_id, entity_type, entity_id, action, description, created_at`

All tables are keyed to `auth.users` via `user_id` and have **RLS enabled
with owner-only policies** (`auth.uid() = user_id`) for select/insert/
update/delete — a user can never read or write another user's rows.
Ownership-check triggers block, e.g., attaching a job to a customer you
don't own. `updated_at` is maintained by trigger on every table, and a
trigger keeps `tasks.completed_at` in sync with `status` server-side.

Apply it with the Supabase CLI:

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

...or paste the file into the Supabase SQL editor. `lib/database.types.ts`
hand-mirrors this schema and types both Supabase clients in
`lib/supabase/client.ts` (browser) and `lib/supabase/server.ts` (server —
kept in a separate file because it imports `next/headers`, which breaks the
build if it ends up in a client component's bundle)
— if you ever regenerate types with `supabase gen types typescript`, keep
the convenience type aliases at the bottom of that file.

## Data layer

`lib/actions/*.ts` are Next.js Server Actions (`"use server"`) — the only
place that writes to `customers`, `leads`, `jobs`, `tasks`, and
`appointments`. Every exported function re-verifies `supabase.auth.getUser()`
and filters/writes with `.eq("user_id", user.id)` on top of RLS, validates
input with a Zod schema, then calls `revalidatePath` so the relevant server
components refetch. List pages (`app/(private)/*/page.tsx`) do their own
initial `select` directly against Supabase (server components, also
user-scoped) rather than going through the actions file, since that's a
plain read with no validation/mutation to encapsulate.

## SEO

- `app/sitemap.ts` and `app/robots.ts` generate `/sitemap.xml` and
  `/robots.txt` dynamically, listing only public routes
- Per-page `metadata` exports (title, description, canonical, Open Graph)
  on every public route
- JSON-LD via `components/JsonLd.tsx` (Organization, WebSite,
  SoftwareApplication, FAQPage)
- Semantic HTML (`header`, `nav`, `main`, `section`, `article`, `footer`)
  and a single `h1` per page
- The homepage's feature visuals are static images in
  `public/illustrations/`, rendered via `next/image`

## What's stubbed / left to finish

- Analytics and Settings pages are still UI shells (not linked from the
  private nav; reachable only by direct URL, and behind auth)
- No automated test suite yet
- No seed/demo data script — a fresh account starts completely empty
- Deployment: connect the repo to Vercel, set the env vars in the Vercel
  dashboard (not in git), point the custom domain, set
  `NEXT_PUBLIC_APP_URL` to the production domain
