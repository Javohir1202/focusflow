// Central place for env-derived config. Never hardcode the app URL or
// the Claude model anywhere else in the codebase — import from here.

export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

export const CLAUDE_MODEL = process.env.CLAUDE_MODEL ?? "claude-sonnet-5";

export const SITE_NAME = "FocusFlow";

export const SITE_DESCRIPTION =
  "Plan your day, manage projects, track productivity and break large tasks into actionable steps with AI.";

export const PUBLIC_ROUTES = ["/", "/features", "/pricing", "/about", "/login", "/signup"] as const;

export const PRIVATE_ROUTES = [
  "/dashboard",
  "/tasks",
  "/projects",
  "/ai-planner",
  "/analytics",
  "/settings",
] as const;
