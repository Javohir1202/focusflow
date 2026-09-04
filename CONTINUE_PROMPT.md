# FocusFlow — Continuation Prompt

Paste everything below this line into a new Claude conversation (on another
account), together with the attached `focusflow/` project folder, to resume
work exactly where it left off.

---

I'm building **FocusFlow**, an AI-powered productivity dashboard: a public,
SEO-indexed marketing site plus a private authenticated app (tasks,
projects, AI daily planner, analytics). Stack: **Next.js 14 App Router +
Supabase (auth/DB) + Anthropic Claude API (`@anthropic-ai/sdk`) + Tailwind +
Zod**.

I already have a working scaffold (attached as `focusflow/`). Please treat
it as the current state of the project and continue building from here —
don't restart from scratch. Read `README.md` in the project root first for
the full architecture summary, route map, and env var list.

## Hard constraints (do not violate)

- **No OpenAI, anywhere.** All AI features use Claude only, via
  `@anthropic-ai/sdk`.
- `ANTHROPIC_API_KEY` must **never** be used or referenced in client
  components — server-side only (`lib/anthropic.ts` is marked
  `server-only` on purpose, keep it that way).
- The Claude model string must stay configurable via the `CLAUDE_MODEL` env
  var (`lib/config.ts`) — never hardcode a model name in a route or
  component.
- Every Claude JSON response must be validated with a Zod schema
  (`lib/schemas.ts`) before it's trusted or saved. Invalid responses return
  a controlled error, never get saved, and the user can retry.
- Private routes (`/dashboard`, `/tasks`, `/projects`, `/ai-planner`,
  `/analytics`, `/settings`) live under `app/(private)/` and must stay
  `noindex, nofollow` and behind the Supabase-auth check in
  `middleware.ts`. Public routes (`/`, `/features`, `/pricing`, `/about`,
  `/login`, `/signup`) must stay indexable with full metadata.
- Use `NEXT_PUBLIC_APP_URL` (from `lib/config.ts`) for all canonical URLs,
  sitemap entries, Open Graph URLs, and JSON-LD — never hardcode
  `localhost` or a domain string elsewhere.
- Don't fabricate testimonials, reviews, or company data in JSON-LD or the
  Testimonials section — it's intentionally a placeholder until real
  content exists.

## What's already built

- Public marketing site: `/`, `/features`, `/pricing`, `/about` — all with
  per-page metadata (title/description/canonical/OG/Twitter), semantic
  HTML, one `h1` per page
- Landing page (`app/page.tsx`) with all 12 spec'd sections (hero, features,
  AI breakdown, AI planner, analytics, projects, sync, how-it-works,
  testimonials placeholder, FAQ, final CTA, footer)
- `app/sitemap.ts` / `app/robots.ts` — dynamic, public-routes-only
- JSON-LD (`components/JsonLd.tsx`): Organization, WebSite,
  SoftwareApplication, FAQPage
- Supabase email/password auth: `/login`, `/signup` (client forms) +
  `middleware.ts` protecting private routes and redirecting unauthenticated
  users
- `app/(private)/dashboard` — server component, reads the Supabase user
- `app/(private)/{tasks,projects,analytics,settings}` — UI shells, not yet
  wired to Supabase tables
- `app/(private)/ai-planner` — working client UI calling
  `/api/ai/breakdown`
- Three AI API routes, each with a system prompt, Zod-validated request +
  response, and controlled error handling:
  - `POST /api/ai/breakdown`
  - `POST /api/ai/daily-plan`
  - `POST /api/ai/suggestions`

## What's next (pick up here)

1. **Supabase schema**: no tables defined yet. Design `tasks`, `projects`,
   and a join/ownership model keyed to `auth.users`, with RLS policies so
   users can only read/write their own rows.
2. **Wire up `/tasks` and `/projects`**: replace the UI-shell pages with
   real Supabase queries (server components for the initial load, client
   mutations for create/update/delete).
3. **Daily Planner UI**: `/api/ai/daily-plan` exists but has no page yet.
   Build `app/(private)/ai-planner` out further (or a dedicated
   sub-route) to collect the user's incomplete tasks from Supabase, POST
   them to `/api/ai/daily-plan`, and render the returned schedule — follow
   the same pattern as the existing breakdown UI in that file.
4. **Analytics**: `/analytics` is a shell. Decide what to chart
   (completion rate, time by project, etc.), query Supabase, render with a
   charting library.
5. **Suggestions endpoint**: `/api/ai/suggestions` exists but nothing calls
   it yet — decide where in the UI it surfaces (e.g. a dashboard widget).
6. **Assets**: `public/` has no images yet. The landing page and OG tags
   reference `dashboard-preview.png`, several feature screenshots, and
   `og-image.png` — these need to be generated or replaced.
7. **Rate limiting** on the `/api/ai/*` routes (none yet).
8. **Deployment**: connect to Vercel, set env vars there (never commit
   `.env`/`.env.local`), configure the custom domain, set
   `NEXT_PUBLIC_APP_URL` to the production URL.

Let's continue with whichever of these you think is the best next step, or
tell me which one you want to tackle first.
