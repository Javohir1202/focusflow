// Central place for env-derived config. Never hardcode the app URL
// anywhere else in the codebase — import from here.

export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

export const SITE_NAME = "ServiceFlow";

export const SITE_DESCRIPTION =
  "Run your service business from one place: leads, customers, jobs, appointments and follow-ups without spreadsheets and scattered conversations.";

export const PUBLIC_ROUTES = ["/", "/features", "/pricing", "/about", "/login", "/signup"] as const;

export const PRIVATE_ROUTES = [
  "/dashboard",
  "/customers",
  "/leads",
  "/jobs",
  "/tasks",
  "/appointments",
  "/analytics",
  "/settings",
] as const;
