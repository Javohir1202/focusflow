"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { AppointmentStatusEnum } from "@/lib/schemas";
import {
  CreateAppointmentSchema,
  UpdateAppointmentSchema,
  type CreateAppointmentInput,
} from "@/lib/validation/appointments";
import type { Appointment, AppointmentInsert, AppointmentUpdate } from "@/lib/database.types";

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

export async function createAppointment(
  input: CreateAppointmentInput
): Promise<ActionResult<Appointment>> {
  const parsed = CreateAppointmentSchema.safeParse(input);
  if (!parsed.success) {
    return { data: null, error: parsed.error.errors[0]?.message ?? "Invalid appointment." };
  }

  try {
    const { supabase, user } = await requireUser();

    const payload: AppointmentInsert = {
      user_id: user.id,
      customer_id: parsed.data.customerId,
      job_id: parsed.data.jobId ? parsed.data.jobId : null,
      title: parsed.data.title,
      scheduled_at: new Date(parsed.data.scheduledAt).toISOString(),
      duration_minutes: parsed.data.durationMinutes ?? 60,
      status: parsed.data.status ?? "scheduled",
      notes: parsed.data.notes || null,
    };

    const { data, error } = await (supabase.from("appointments") as any)
      .insert(payload)
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/appointments");
    revalidatePath("/dashboard");
    revalidatePath(`/customers/${parsed.data.customerId}`);
    return { data: data as Appointment, error: null };
  } catch (err) {
    return { data: null, error: toErrorMessage(err) };
  }
}

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------

export async function updateAppointment(
  input: z.infer<typeof UpdateAppointmentSchema>
): Promise<ActionResult<Appointment>> {
  const parsed = UpdateAppointmentSchema.safeParse(input);
  if (!parsed.success) {
    return { data: null, error: parsed.error.errors[0]?.message ?? "Invalid update." };
  }

  const { id, title, customerId, jobId, scheduledAt, durationMinutes, status, notes } = parsed.data;

  try {
    const { supabase, user } = await requireUser();

    const patch: AppointmentUpdate = {};
    if (title !== undefined) patch.title = title;
    if (customerId !== undefined) patch.customer_id = customerId;
    if (jobId !== undefined) patch.job_id = jobId;
    if (durationMinutes !== undefined) patch.duration_minutes = durationMinutes;
    if (status !== undefined) patch.status = status;
    if (notes !== undefined) patch.notes = notes;
    if (scheduledAt !== undefined) patch.scheduled_at = new Date(scheduledAt).toISOString();

    const { data, error } = await (supabase.from("appointments") as any)
      .update(patch)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/appointments");
    revalidatePath("/dashboard");
    if (data?.customer_id) revalidatePath(`/customers/${data.customer_id}`);
    return { data: data as Appointment, error: null };
  } catch (err) {
    return { data: null, error: toErrorMessage(err) };
  }
}

export async function setAppointmentStatus(
  id: string,
  status: z.infer<typeof AppointmentStatusEnum>
): Promise<ActionResult<Appointment>> {
  return updateAppointment({ id, status });
}

// ---------------------------------------------------------------------------
// Delete
// ---------------------------------------------------------------------------

export async function deleteAppointment(id: string): Promise<ActionResult<true>> {
  if (!z.string().uuid().safeParse(id).success) {
    return { data: null, error: "Invalid appointment id." };
  }

  try {
    const { supabase, user } = await requireUser();

    const { error } = await supabase.from("appointments").delete().eq("id", id).eq("user_id", user.id);
    if (error) throw error;

    revalidatePath("/appointments");
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
