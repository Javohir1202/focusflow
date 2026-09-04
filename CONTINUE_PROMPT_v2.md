# FocusFlow — Continuation Prompt

Paste this into a new chat to continue where we left off.

## Project

Building **FocusFlow** — a Next.js 14 (App Router) productivity app: tasks,
projects, and an AI daily planner. Stack: Supabase (Postgres + Auth) via
`@supabase/ssr`, Anthropic Claude API (`@anthropic-ai/sdk`) for the AI
features, Tailwind, Zod for validation.

**Local working folder (Windows):**
`C:\Users\javoh\Downloads\focusflow3\focusflow`
This is the one canonical folder — keep working here, don't re-extract to a
new folder each time.

## Workflow preference (important)

Don't resend the whole project as a zip each time. Send only the specific
file(s) that changed, so the local `node_modules`, `.env.local`, and git
history stay intact. The person works in PowerShell and needs to run
`Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` in any new
PowerShell window before `npm`/`npx` will run (Windows blocks scripts by
default) — or they can set it once permanently with
`Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`.

## What's built so far

- **Schema**: `supabase/migrations/20260904000000_init_projects_tasks.sql` —
  `projects` and `tasks` tables, RLS enabled (owner-only via `auth.uid()`),
  ownership-check trigger, `completed_at` sync trigger.
- **Tasks & Projects**: full CRUD wired to Supabase via Next.js Server
  Actions in `lib/actions/tasks.ts` and `lib/actions/projects.ts`. UI in
  `app/(private)/tasks/` and `app/(private)/projects/` (server components
  for reads) + `components/tasks/TasksClient.tsx` /
  `components/projects/ProjectsClient.tsx` (client components for
  create/edit/delete/filters). Loading/error states via Next's
  `loading.tsx`/`error.tsx` convention.
- **AI Planner**: `app/(private)/ai-planner/page.tsx` has two sections —
  task breakdown (`components/ai/BreakdownForm.tsx`, calls
  `/api/ai/breakdown`) and a real daily planner
  (`components/ai/DailyPlanner.tsx`) that pulls the user's actual
  incomplete tasks (priority, deadline, estimated minutes) from Supabase
  and calls `/api/ai/daily-plan`. Both API routes use `@anthropic-ai/sdk`
  server-side only, validate responses with Zod.
- **Supabase clients split**: `lib/supabase/client.ts` (browser) and
  `lib/supabase/server.ts` (server, uses `next/headers`) — must stay
  separate or client components importing the server one break the build.
- **`lib/database.types.ts`**: hand-written types matching the schema. Has
  to include `Relationships`, `Views`, `Functions`, `CompositeTypes`, and a
  top-level `__InternalSupabase: { PostgrestVersion: "12" }` marker — recent
  `@supabase/supabase-js`/`postgrest-js` versions silently resolve
  `.insert()`/`.update()`/partial-column `.select()` to `never` without
  these, even though `.select("*")` works fine without them.
- **`package.json`**: bumped `@supabase/ssr` from `^0.4.0` to `^0.6.1` —
  the old version was badly out of sync with the installed
  `@supabase/supabase-js` (resolved to `2.115.0`) and caused persistent,
  hard-to-diagnose type errors.

## Build status

`npx tsc --noEmit` passes clean. `npm run build` compiles and lints clean
(`✓ Compiled successfully`, `✓ Linting and checking validity of types`) —
the only remaining build failure is `/login` and `/signup` failing to
prerender because `.env.local` doesn't have real Supabase credentials yet.

## Git status

Repo re-initialized from scratch (had accidentally committed `node_modules`
before `.gitignore` existed, including a 129MB file that broke GitHub's
push). Now clean — `.gitignore` in place, `node_modules`/`.next`/`.env.local`
never tracked. Was in the middle of publishing via **GitHub Desktop**
(person prefers it over the CLI) — check whether the publish succeeded.

## Not yet done / next steps

1. Confirm the GitHub Desktop publish went through.
2. Create `.env.local` (from `.env.example`) with real values:
   - `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — needs a
     Supabase project created (check if this happened yet)
   - Apply `supabase/migrations/20260904000000_init_projects_tasks.sql` to
     that project
   - `ANTHROPIC_API_KEY` for the AI routes
3. Person also has an existing separate Supabase project for an unrelated
   finance PWA — confirmed a second project is fine on the free tier (2
   projects included), no conflict.
4. Still stubbed: Analytics page, Settings page, rate limiting on
   `/api/ai/*`, Supabase auth email templates, Vercel deployment.
5. `npm install` surfaced 4 vulnerabilities (2 low, 1 high, 1 critical) —
   not yet investigated; don't blind `npm audit fix --force` without
   checking what they are first.

## Other context

- Person is building this as one of several projects — see other memory
  files for background (Uzbekistan-based, works as a broker, exploring AI
  automation / backend dev / freelance as income paths).
- Communicates in transliterated Russian/Uzbek — respond in Russian for
  non-technical/process discussion; code and technical explanations can
  stay in English as before.
