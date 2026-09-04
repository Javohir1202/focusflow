import { z } from "zod";
import { LeadSourceEnum, LeadStatusEnum } from "@/lib/schemas";

export const CreateLeadSchema = z.object({
  contactName: z.string().trim().min(1, "Contact name is required.").max(200),
  company: z.string().trim().max(200).optional().or(z.literal("")),
  email: z.string().trim().email("Enter a valid email.").max(320).optional().or(z.literal("")),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  source: LeadSourceEnum.optional(),
  status: LeadStatusEnum.optional(),
  value: z.number().nonnegative().max(100_000_000).optional(),
  assignedTo: z.string().trim().max(120).optional().or(z.literal("")),
  notes: z.string().trim().max(4000).optional().or(z.literal("")),
  nextFollowUpAt: z.string().optional().or(z.literal("")), // datetime-local string
  customerId: z.string().uuid().optional().or(z.literal("")),
});

export type CreateLeadInput = z.infer<typeof CreateLeadSchema>;

export const UpdateLeadSchema = z.object({
  id: z.string().uuid(),
  contactName: z.string().trim().min(1, "Contact name is required.").max(200).optional(),
  company: z.string().trim().max(200).nullable().optional(),
  email: z.string().trim().max(320).nullable().optional(),
  phone: z.string().trim().max(40).nullable().optional(),
  source: LeadSourceEnum.optional(),
  status: LeadStatusEnum.optional(),
  value: z.number().nonnegative().max(100_000_000).nullable().optional(),
  assignedTo: z.string().trim().max(120).nullable().optional(),
  notes: z.string().trim().max(4000).nullable().optional(),
  nextFollowUpAt: z.string().nullable().optional(),
  customerId: z.string().uuid().nullable().optional(),
});

export type UpdateLeadInput = z.infer<typeof UpdateLeadSchema>;
