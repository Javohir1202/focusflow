import { z } from "zod";
import { JobStatusEnum } from "@/lib/schemas";

export const CreateJobSchema = z.object({
  title: z.string().trim().min(1, "Title is required.").max(200),
  customerId: z.string().uuid("A customer is required."),
  status: JobStatusEnum.optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  deadline: z.string().optional().or(z.literal("")),
  assignedTo: z.string().trim().max(120).optional().or(z.literal("")),
  price: z.number().nonnegative().max(100_000_000).optional(),
  notes: z.string().trim().max(4000).optional().or(z.literal("")),
});

export type CreateJobInput = z.infer<typeof CreateJobSchema>;

export const UpdateJobSchema = z.object({
  id: z.string().uuid(),
  title: z.string().trim().min(1, "Title is required.").max(200).optional(),
  customerId: z.string().uuid().optional(),
  status: JobStatusEnum.optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  deadline: z.string().nullable().optional(),
  assignedTo: z.string().trim().max(120).nullable().optional(),
  price: z.number().nonnegative().max(100_000_000).nullable().optional(),
  notes: z.string().trim().max(4000).nullable().optional(),
});

export type UpdateJobInput = z.infer<typeof UpdateJobSchema>;
