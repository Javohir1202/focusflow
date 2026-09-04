# FocusFlow

AI-powered productivity dashboard. Public marketing site (SEO-indexed) +
private authenticated dashboard, built with Next.js App Router, Supabase,
and the Anthropic Claude API.

## Stack

- **Next.js 14** (App Router, server components by default)
- **Supabase** — auth + Postgres data
- **Anthropic Claude** (`@anthropic-ai/sdk`) — AI task breakdown, daily
  planning, and suggestions, called only from server-side API routes
- **Tailwind CSS**
- **Zod** — validates every AI response before it's trusted or saved

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in Supabase + Anthropic values
npm run dev
```

## Environment variables

See `.env.example`. Never commit `.env` or `.env.local`.

- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase project
- `ANTHROPIC_API_KEY` — server-side only, never exposed to the browser
- `CLAUDE_MODEL` — e.g. `claude-sonnet-5`; change this to swap models without
  touching application code (see `lib/config.ts`)
- `NEXT_PUBLIC_APP_URL` — canonical site URL, used for metadata, sitemap,
  robots.txt, and JSON-LD (e.g. `https://focusflow.app`)

## Route structure

**Public (indexable):** `/`, `/features`, `/pricing`, `/about`, `/login`, `/signup`

**Private (noindex, auth-required via `middleware.ts`):**
`/dashboard`, `/tasks`, `/projects`, `/ai-planner`, `/analytics`, `/settings`
— all live under the `app/(private)/` route group, which sets
`robots: { index: false, follow: false }` for everything inside it.

## AI architecture

```
Browser → Next.js API route (/api/ai/*) → Anthropic Claude API → validated with Zod → Browser
```

The Claude client (`lib/anthropic.ts`) is marked `server-only` so it cannot
be imported into a client component by accident. Every AI endpoint validates
Claude's JSON output with a Zod schema (`lib/schemas.ts`) before returning
it; invalid responses are rejected with a controlled error instead of being
saved or trusted.

## Database schema

`supabase/migrations/20260904000000_init_projects_tasks.sql` defines the
initial schema:

- **`projects`** — `id, user_id, name, description, color, is_archived,
  created_at, updated_at`
- **`tasks`** — `id, user_id, project_id, title, description, priority
  (low/medium/high), status (todo/in_progress/done), estimated_minutes,
  deadline, completed_at, source (manual/ai_breakdown/ai_daily_plan),
  created_at, updated_at`

Both tables are keyed to `auth.users` via `user_id` and have **RLS enabled
with owner-only policies** (`auth.uid() = user_id`) for select/insert/
update/delete — a user can never read or write another user's rows. A
trigger blocks assigning a task to a project you don't own, and another
trigger keeps `completed_at` in sync with `status` server-side (so the
client can't fake completion timestamps). `updated_at` is maintained by
trigger on every table.

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
the `Project`/`Task` convenience aliases at the bottom of that file.

## Data layer

`lib/actions/tasks.ts` and `lib/actions/projects.ts` are Next.js Server
Actions (`"use server"`) — the only place that talks to the `tasks` and
`projects` tables for reads/writes triggered from the UI. Every exported
function re-verifies `supabase.auth.getUser()` and filters/writes with
`.eq("user_id", user.id)` on top of RLS, then calls `revalidatePath` so the
server components in `app/(private)/tasks` and `app/(private)/projects`
refetch. `app/(private)/tasks/page.tsx` and `app/(private)/projects/page.tsx`
do their own initial `select` directly against Supabase (server components,
also user-scoped) rather than going through the actions file, since that's a
plain read with no validation/mutation to encapsulate.

## SEO

- `app/sitemap.ts` and `app/robots.ts` generate `/sitemap.xml` and
  `/robots.txt` dynamically, listing only public routes
- Per-page `metadata` exports (title, description, canonical, Open Graph,
  Twitter card) on every public route
- JSON-LD via `components/JsonLd.tsx` (Organization, WebSite,
  SoftwareApplication, FAQPage)
- Semantic HTML (`header`, `nav`, `main`, `section`, `article`, `footer`)
  and a single `h1` per page

## What's stubbed / left to finish

- `public/*.png` — dashboard/feature preview images are referenced but not
  generated; drop real screenshots or illustrations in `public/`
- `og-image.png` — Open Graph share image
- Tasks and Projects are wired to Supabase (full CRUD via `lib/actions/`);
  Analytics and Settings are still UI shells
- AI Daily Planner is built: `app/(private)/ai-planner` now has both the
  task-breakdown UI and a "Today's plan" section (`components/ai/DailyPlanner.tsx`)
  that pulls the user's real incomplete tasks (priority, deadline, estimated
  minutes) from Supabase and calls `/api/ai/daily-plan`
- Supabase auth email templates / password reset flow
- Rate limiting on `/api/ai/*` routes
- Deployment: connect the repo to Vercel, set the env vars in the Vercel
  dashboard (not in git), point the custom domain, set
  `NEXT_PUBLIC_APP_URL` to the production domain
