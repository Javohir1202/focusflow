"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { LeadStatusEnum } from "@/lib/schemas";
import { CreateLeadSchema, UpdateLeadSchema, type CreateLeadInput } from "@/lib/validation/leads";
import type { Customer, CustomerInsert, Lead, LeadInsert, LeadUpdate } from "@/lib/database.types";

type ActionResult<T = undefined> = { data: T; error: null } | { data: null; error: string };

async function requireUser() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("NOT_AUTHENTICATED");
  }

  return { supabase, user };
}

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

export async function createLead(input: CreateLeadInput): Promise<ActionResult<Lead>> {
  const parsed = CreateLeadSchema.safeParse(input);
  if (!parsed.success) {
    return { data: null, error: parsed.error.errors[0]?.message ?? "Invalid lead." };
  }

  try {
    const { supabase, user } = await requireUser();

    const payload: LeadInsert = {
      user_id: user.id,
      customer_id: parsed.data.customerId || null,
      contact_name: parsed.data.contactName,
      company: parsed.data.company || null,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      source: parsed.data.source ?? "other",
      status: parsed.data.status ?? "new",
      value: parsed.data.value ?? null,
      assigned_to: parsed.data.assignedTo || null,
      notes: parsed.data.notes || null,
      next_follow_up_at: parsed.data.nextFollowUpAt
        ? new Date(parsed.data.nextFollowUpAt).toISOString()
        : null,
    };

    const { data, error } = await (supabase.from("leads") as any).insert(payload).select().single();
    if (error) throw error;

    revalidatePath("/leads");
    revalidatePath("/dashboard");
    return { data: data as Lead, error: null };
  } catch (err) {
    return { data: null, error: toErrorMessage(err) };
  }
}

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------

export async function updateLead(
  input: z.infer<typeof UpdateLeadSchema>
): Promise<ActionResult<Lead>> {
  const parsed = UpdateLeadSchema.safeParse(input);
  if (!parsed.success) {
    return { data: null, error: parsed.error.errors[0]?.message ?? "Invalid update." };
  }

  const {
    id,
    contactName,
    company,
    email,
    phone,
    source,
    status,
    value,
    assignedTo,
    notes,
    nextFollowUpAt,
    customerId,
  } = parsed.data;

  try {
    const { supabase, user } = await requireUser();

    const patch: LeadUpdate = {};
    if (contactName !== undefined) patch.contact_name = contactName;
    if (company !== undefined) patch.company = company;
    if (email !== undefined) patch.email = email;
    if (phone !== undefined) patch.phone = phone;
    if (source !== undefined) patch.source = source;
    if (status !== undefined) patch.status = status;
    if (value !== undefined) patch.value = value;
    if (assignedTo !== undefined) patch.assigned_to = assignedTo;
    if (notes !== undefined) patch.notes = notes;
    if (customerId !== undefined) patch.customer_id = customerId;
    if (nextFollowUpAt !== undefined) {
      patch.next_follow_up_at = nextFollowUpAt ? new Date(nextFollowUpAt).toISOString() : null;
    }

    const { data, error } = await (supabase.from("leads") as any)
      .update(patch)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/leads");
    revalidatePath("/dashboard");
    return { data: data as Lead, error: null };
  } catch (err) {
    return { data: null, error: toErrorMessage(err) };
  }
}

export async function setLeadStatus(
  id: string,
  status: z.infer<typeof LeadStatusEnum>
): Promise<ActionResult<Lead>> {
  return updateLead({ id, status });
}

// ---------------------------------------------------------------------------
// Delete
// ---------------------------------------------------------------------------

export async function deleteLead(id: string): Promise<ActionResult<true>> {
  if (!z.string().uuid().safeParse(id).success) {
    return { data: null, error: "Invalid lead id." };
  }

  try {
    const { supabase, user } = await requireUser();

    const { error } = await supabase.from("leads").delete().eq("id", id).eq("user_id", user.id);
    if (error) throw error;

    revalidatePath("/leads");
    revalidatePath("/dashboard");
    return { data: true, error: null };
  } catch (err) {
    return { data: null, error: toErrorMessage(err) };
  }
}

// ---------------------------------------------------------------------------
// Convert a won lead into a customer (or link an existing one)
// ---------------------------------------------------------------------------

export async function convertLeadToCustomer(leadId: string): Promise<ActionResult<Customer>> {
  if (!z.string().uuid().safeParse(leadId).success) {
    return { data: null, error: "Invalid lead id." };
  }

  try {
    const { supabase, user } = await requireUser();

    const { data: lead, error: leadError } = await supabase
      .from("leads")
      .select("*")
      .eq("id", leadId)
      .eq("user_id", user.id)
      .single<Lead>();

    if (leadError) throw leadError;
    if (!lead) return { data: null, error: "Lead not found." };

    if (lead.customer_id) {
      const { data: existing, error: existingError } = await supabase
        .from("customers")
        .select("*")
        .eq("id", lead.customer_id)
        .single<Customer>();
      if (existingError) throw existingError;
      return { data: existing, error: null };
    }

    const payload: CustomerInsert = {
      user_id: user.id,
      name: lead.contact_name,
      company: lead.company,
      phone: lead.phone,
      email: lead.email,
      status: "active",
      source: lead.source,
      notes: lead.notes,
    };

    const { data: customer, error: customerError } = await (supabase.from("customers") as any)
      .insert(payload)
      .select()
      .single();
    if (customerError) throw customerError;

    const { error: linkError } = await (supabase.from("leads") as any)
      .update({ customer_id: customer.id, status: "won" })
      .eq("id", leadId)
      .eq("user_id", user.id);
    if (linkError) throw linkError;

    revalidatePath("/leads");
    revalidatePath("/customers");
    revalidatePath("/dashboard");
    return { data: customer as Customer, error: null };
  } catch (err) {
    return { data: null, error: toErrorMessage(err) };
  }
}

function toErrorMessage(err: unknown): string {
  if (err instanceof Error && err.message === "NOT_AUTHENTICATED") {
    return "Your session expired. Please log in again.";
  }
  if (err instanceof Error) return err.message;
  return "Something went wrong. Please try again.";
}
