import type { MetadataRoute } from "next";
import { APP_URL, PUBLIC_ROUTES } from "@/lib/config";

// Only public, indexable routes belong here. Private routes
// (/dashboard, /tasks, /projects, /ai-planner, /analytics, /settings)
// must never appear in the sitemap.
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return PUBLIC_ROUTES.filter((route) => route !== "/login" && route !== "/signup").map(
    (route) => ({
      url: `${APP_URL}${route === "/" ? "" : route}`,
      lastModified: now,
      changeFrequency: route === "/" ? "weekly" : "monthly",
      priority: route === "/" ? 1 : 0.7,
    })
  );
}
