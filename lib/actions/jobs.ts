"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { JobStatusEnum } from "@/lib/schemas";
import { CreateJobSchema, UpdateJobSchema, type CreateJobInput } from "@/lib/validation/jobs";
import type { Job, JobInsert, JobUpdate, TaskPriority } from "@/lib/database.types";

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

export async function createJob(input: CreateJobInput): Promise<ActionResult<Job>> {
  const parsed = CreateJobSchema.safeParse(input);
  if (!parsed.success) {
    return { data: null, error: parsed.error.errors[0]?.message ?? "Invalid job." };
  }

  try {
    const { supabase, user } = await requireUser();

    const payload: JobInsert = {
      user_id: user.id,
      customer_id: parsed.data.customerId,
      title: parsed.data.title,
      status: parsed.data.status ?? "new",
      priority: (parsed.data.priority ?? "medium") as TaskPriority,
      deadline: parsed.data.deadline ? new Date(parsed.data.deadline).toISOString() : null,
      assigned_to: parsed.data.assignedTo || null,
      price: parsed.data.price ?? null,
      notes: parsed.data.notes || null,
    };

    const { data, error } = await (supabase.from("jobs") as any).insert(payload).select().single();
    if (error) throw error;

    revalidatePath("/jobs");
    revalidatePath("/dashboard");
    revalidatePath(`/customers/${parsed.data.customerId}`);
    return { data: data as Job, error: null };
  } catch (err) {
    return { data: null, error: toErrorMessage(err) };
  }
}

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------

export async function updateJob(input: z.infer<typeof UpdateJobSchema>): Promise<ActionResult<Job>> {
  const parsed = UpdateJobSchema.safeParse(input);
  if (!parsed.success) {
    return { data: null, error: parsed.error.errors[0]?.message ?? "Invalid update." };
  }

  const { id, title, customerId, status, priority, deadline, assignedTo, price, notes } = parsed.data;

  try {
    const { supabase, user } = await requireUser();

    const patch: JobUpdate = {};
    if (title !== undefined) patch.title = title;
    if (customerId !== undefined) patch.customer_id = customerId;
    if (status !== undefined) patch.status = status;
    if (priority !== undefined) patch.priority = priority as TaskPriority;
    if (assignedTo !== undefined) patch.assigned_to = assignedTo;
    if (price !== undefined) patch.price = price;
    if (notes !== undefined) patch.notes = notes;
    if (deadline !== undefined) {
      patch.deadline = deadline ? new Date(deadline).toISOString() : null;
    }

    const { data, error } = await (supabase.from("jobs") as any)
      .update(patch)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/jobs");
    revalidatePath("/dashboard");
    if (data?.customer_id) revalidatePath(`/customers/${data.customer_id}`);
    return { data: data as Job, error: null };
  } catch (err) {
    return { data: null, error: toErrorMessage(err) };
  }
}

export async function setJobStatus(
  id: string,
  status: z.infer<typeof JobStatusEnum>
): Promise<ActionResult<Job>> {
  return updateJob({ id, status });
}

// ---------------------------------------------------------------------------
// Delete
// ---------------------------------------------------------------------------

export async function deleteJob(id: string): Promise<ActionResult<true>> {
  if (!z.string().uuid().safeParse(id).success) {
    return { data: null, error: "Invalid job id." };
  }

  try {
    const { supabase, user } = await requireUser();

    const { error } = await supabase.from("jobs").delete().eq("id", id).eq("user_id", user.id);
    if (error) throw error;

    revalidatePath("/jobs");
    revalidatePath("/dashboard");
    return { data: true, error: null };
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
