import { z } from "zod";

// ---- Task Breakdown ----

export const BreakdownRequestSchema = z.object({
  task: z.string().min(3).max(500),
});
export type BreakdownRequest = z.infer<typeof BreakdownRequestSchema>;

export const BreakdownTaskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(1000),
  estimated_minutes: z.number().int().positive().max(24 * 60),
  priority: z.enum(["low", "medium", "high"]),
});

export const BreakdownResponseSchema = z.object({
  tasks: z.array(BreakdownTaskSchema).min(1).max(30),
});
export type BreakdownResponse = z.infer<typeof BreakdownResponseSchema>;

// ---- Daily Planner ----

export const DailyPlanRequestSchema = z.object({
  date: z.string(), // ISO date, e.g. "2026-09-04"
  currentTime: z.string(), // e.g. "09:15"
  tasks: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      priority: z.enum(["low", "medium", "high"]),
      deadline: z.string().nullable().optional(),
      estimatedMinutes: z.number().int().positive(),
      project: z.string().nullable().optional(),
    })
  ),
});
export type DailyPlanRequest = z.infer<typeof DailyPlanRequestSchema>;

export const DailyPlanSlotSchema = z.object({
  start: z.string(), // "HH:MM"
  end: z.string(),
  task: z.string(),
  reason: z.string(),
});

export const DailyPlanResponseSchema = z.object({
  plan: z.array(DailyPlanSlotSchema).min(1).max(50),
});
export type DailyPlanResponse = z.infer<typeof DailyPlanResponseSchema>;

// ---- Suggestions ----

export const SuggestionsRequestSchema = z.object({
  recentActivity: z.string().min(1).max(2000),
});
export type SuggestionsRequest = z.infer<typeof SuggestionsRequestSchema>;

export const SuggestionsResponseSchema = z.object({
  suggestions: z
    .array(
      z.object({
        title: z.string(),
        detail: z.string(),
      })
    )
    .min(1)
    .max(10),
});
export type SuggestionsResponse = z.infer<typeof SuggestionsResponseSchema>;
