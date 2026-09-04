import { z } from "zod";
import { CustomerStatusEnum, LeadSourceEnum } from "@/lib/schemas";

export const CreateCustomerSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(200),
  company: z.string().trim().max(200).optional().or(z.literal("")),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  email: z.string().trim().email("Enter a valid email.").max(320).optional().or(z.literal("")),
  status: CustomerStatusEnum.optional(),
  source: LeadSourceEnum.optional(),
  tags: z.array(z.string().trim().min(1).max(40)).max(20).optional(),
  notes: z.string().trim().max(4000).optional().or(z.literal("")),
});

export type CreateCustomerInput = z.infer<typeof CreateCustomerSchema>;

export const UpdateCustomerSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1, "Name is required.").max(200).optional(),
  company: z.string().trim().max(200).nullable().optional(),
  phone: z.string().trim().max(40).nullable().optional(),
  email: z.string().trim().email("Enter a valid email.").max(320).nullable().optional().or(z.literal("")),
  status: CustomerStatusEnum.optional(),
  source: LeadSourceEnum.optional(),
  tags: z.array(z.string().trim().min(1).max(40)).max(20).optional(),
  notes: z.string().trim().max(4000).nullable().optional(),
});

export type UpdateCustomerInput = z.infer<typeof UpdateCustomerSchema>;
