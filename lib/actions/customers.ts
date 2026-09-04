"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { CustomerStatusEnum } from "@/lib/schemas";
import {
  CreateCustomerSchema,
  UpdateCustomerSchema,
  type CreateCustomerInput,
} from "@/lib/validation/customers";
import type { Customer, CustomerInsert, CustomerUpdate } from "@/lib/database.types";

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

export async function createCustomer(input: CreateCustomerInput): Promise<ActionResult<Customer>> {
  const parsed = CreateCustomerSchema.safeParse(input);
  if (!parsed.success) {
    return { data: null, error: parsed.error.errors[0]?.message ?? "Invalid customer." };
  }

  try {
    const { supabase, user } = await requireUser();

    const payload: CustomerInsert = {
      user_id: user.id,
      name: parsed.data.name,
      company: parsed.data.company || null,
      phone: parsed.data.phone || null,
      email: parsed.data.email || null,
      status: parsed.data.status ?? "prospect",
      source: parsed.data.source ?? "other",
      tags: parsed.data.tags ?? [],
      notes: parsed.data.notes || null,
    };

    const { data, error } = await (supabase.from("customers") as any)
      .insert(payload)
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/customers");
    revalidatePath("/dashboard");
    return { data: data as Customer, error: null };
  } catch (err) {
    return { data: null, error: toErrorMessage(err) };
  }
}

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------

export async function updateCustomer(
  input: z.infer<typeof UpdateCustomerSchema>
): Promise<ActionResult<Customer>> {
  const parsed = UpdateCustomerSchema.safeParse(input);
  if (!parsed.success) {
    return { data: null, error: parsed.error.errors[0]?.message ?? "Invalid update." };
  }

  const { id, name, company, phone, email, status, source, tags, notes } = parsed.data;

  try {
    const { supabase, user } = await requireUser();

    const patch: CustomerUpdate = {};
    if (name !== undefined) patch.name = name;
    if (company !== undefined) patch.company = company;
    if (phone !== undefined) patch.phone = phone;
    if (email !== undefined) patch.email = email || null;
    if (status !== undefined) patch.status = status;
    if (source !== undefined) patch.source = source;
    if (tags !== undefined) patch.tags = tags;
    if (notes !== undefined) patch.notes = notes;

    const { data, error } = await (supabase.from("customers") as any)
      .update(patch)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/customers");
    revalidatePath(`/customers/${id}`);
    revalidatePath("/dashboard");
    return { data: data as Customer, error: null };
  } catch (err) {
    return { data: null, error: toErrorMessage(err) };
  }
}

export async function setCustomerStatus(
  id: string,
  status: z.infer<typeof CustomerStatusEnum>
): Promise<ActionResult<Customer>> {
  return updateCustomer({ id, status });
}

// ---------------------------------------------------------------------------
// Delete
// ---------------------------------------------------------------------------

export async function deleteCustomer(id: string): Promise<ActionResult<true>> {
  if (!z.string().uuid().safeParse(id).success) {
    return { data: null, error: "Invalid customer id." };
  }

  try {
    const { supabase, user } = await requireUser();

    const { error } = await supabase.from("customers").delete().eq("id", id).eq("user_id", user.id);
    if (error) throw error;

    revalidatePath("/customers");
    revalidatePath("/dashboard");
    return { data: true, error: null };
  } catch (err) {
    return { data: null, error: toErrorMessage(err) };
  }
}

// ---------------------------------------------------------------------------
// Read helpers
// ---------------------------------------------------------------------------

export async function searchCustomers(query: string): Promise<ActionResult<Customer[]>> {
  try {
    const { supabase, user } = await requireUser();

    let builder = supabase.from("customers").select("*").eq("user_id", user.id);
    const trimmed = query.trim();
    if (trimmed) {
      builder = builder.or(
        `name.ilike.%${trimmed}%,company.ilike.%${trimmed}%,email.ilike.%${trimmed}%`
      );
    }

    const { data, error } = await builder.order("created_at", { ascending: false });
    if (error) throw error;
    return { data: (data ?? []) as Customer[], error: null };
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
