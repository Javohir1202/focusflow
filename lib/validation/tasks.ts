import { z } from "zod";

export const CreateTaskSchema = z.object({
  title: z.string().trim().min(1, "Title is required.").max(200),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  priority: z.enum(["low", "medium", "high"]),
  jobId: z.string().uuid().optional().or(z.literal("")),
  customerId: z.string().uuid().optional().or(z.literal("")),
  assignee: z.string().trim().max(120).optional().or(z.literal("")),
  deadline: z.string().optional().or(z.literal("")), // datetime-local string
  estimatedMinutes: z.number().int().positive().max(24 * 60).optional(),
});

export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;

export const UpdateTaskSchema = z.object({
  id: z.string().uuid(),
  title: z.string().trim().min(1, "Title is required.").max(200).optional(),
  description: z.string().trim().max(2000).nullable().optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  status: z.enum(["todo", "in_progress", "done"]).optional(),
  jobId: z.string().uuid().nullable().optional(),
  customerId: z.string().uuid().nullable().optional(),
  assignee: z.string().trim().max(120).nullable().optional(),
  deadline: z.string().nullable().optional(),
  estimatedMinutes: z.number().int().positive().max(24 * 60).nullable().optional(),
});

export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>;
