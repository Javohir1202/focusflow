import { z } from "zod";

// Shared enums, reused across server actions and forms so the UI and the
// database stay in lock-step. Keep in sync with
// supabase/migrations/20260904010000_pivot_to_serviceflow.sql.

export const LeadStatusEnum = z.enum([
  "new",
  "contacted",
  "qualified",
  "quoted",
  "won",
  "lost",
]);
export type LeadStatus = z.infer<typeof LeadStatusEnum>;

export const LeadSourceEnum = z.enum([
  "website",
  "referral",
  "cold_call",
  "social_media",
  "event",
  "other",
]);
export type LeadSource = z.infer<typeof LeadSourceEnum>;

export const CustomerStatusEnum = z.enum(["prospect", "active", "inactive"]);
export type CustomerStatus = z.infer<typeof CustomerStatusEnum>;

export const JobStatusEnum = z.enum([
  "new",
  "scheduled",
  "in_progress",
  "on_hold",
  "completed",
  "cancelled",
]);
export type JobStatus = z.infer<typeof JobStatusEnum>;

export const AppointmentStatusEnum = z.enum([
  "scheduled",
  "confirmed",
  "completed",
  "cancelled",
]);
export type AppointmentStatus = z.infer<typeof AppointmentStatusEnum>;
