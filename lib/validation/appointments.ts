import { z } from "zod";
import { AppointmentStatusEnum } from "@/lib/schemas";

export const CreateAppointmentSchema = z.object({
  title: z.string().trim().min(1, "Title is required.").max(200),
  customerId: z.string().uuid("A customer is required."),
  jobId: z.string().uuid().optional().or(z.literal("")),
  scheduledAt: z.string().min(1, "Date and time are required."), // datetime-local string
  durationMinutes: z.number().int().positive().max(24 * 60).optional(),
  status: AppointmentStatusEnum.optional(),
  notes: z.string().trim().max(4000).optional().or(z.literal("")),
});

export type CreateAppointmentInput = z.infer<typeof CreateAppointmentSchema>;

export const UpdateAppointmentSchema = z.object({
  id: z.string().uuid(),
  title: z.string().trim().min(1, "Title is required.").max(200).optional(),
  customerId: z.string().uuid().optional(),
  jobId: z.string().uuid().nullable().optional(),
  scheduledAt: z.string().min(1).optional(),
  durationMinutes: z.number().int().positive().max(24 * 60).optional(),
  status: AppointmentStatusEnum.optional(),
  notes: z.string().trim().max(4000).nullable().optional(),
});

export type UpdateAppointmentInput = z.infer<typeof UpdateAppointmentSchema>;
