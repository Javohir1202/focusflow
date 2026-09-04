"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Project, ProjectInsert, ProjectUpdate } from "@/lib/database.types";

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

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

const CreateProjectSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(120),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  color: z.string().regex(HEX_COLOR, "Color must be a hex value like #6366f1.").optional(),
});

export async function createProject(input: {
  name: string;
  description?: string;
  color?: string;
}): Promise<ActionResult<Project>> {
  const parsed = CreateProjectSchema.safeParse(input);
  if (!parsed.success) {
    return { data: null, error: parsed.error.errors[0]?.message ?? "Invalid project." };
  }

  try {
    const { supabase, user } = await requireUser();

    const payload: ProjectInsert = {
      user_id: user.id,
      name: parsed.data.name,
      description: parsed.data.description ? parsed.data.description : null,
      color: parsed.data.color ?? "#6366f1",
    };

    // See the note in lib/actions/tasks.ts createTask — casting the
    // builder step (not the payload) to sidestep a supabase-js/postgrest-js
    // version mismatch affecting .insert()'s parameter type.
    const { data, error } = await (supabase.from("projects") as any)
      .insert(payload)
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/projects");
    revalidatePath("/tasks");
    return { data: data as Project, error: null };
  } catch (err) {
    return { data: null, error: toErrorMessage(err) };
  }
}

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------

const UpdateProjectSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1, "Name is required.").max(120).optional(),
  description: z.string().trim().max(2000).nullable().optional(),
  color: z.string().regex(HEX_COLOR, "Color must be a hex value like #6366f1.").optional(),
  isArchived: z.boolean().optional(),
});

export async function updateProject(
  input: z.infer<typeof UpdateProjectSchema>
): Promise<ActionResult<Project>> {
  const parsed = UpdateProjectSchema.safeParse(input);
  if (!parsed.success) {
    return { data: null, error: parsed.error.errors[0]?.message ?? "Invalid update." };
  }

  const { id, isArchived, ...rest } = parsed.data;

  try {
    const { supabase, user } = await requireUser();

    const patch: ProjectUpdate = { ...rest };
    if (rest.description !== undefined) {
      patch.description = rest.description ? rest.description : null;
    }
    if (isArchived !== undefined) patch.is_archived = isArchived;

    // See the note in lib/actions/tasks.ts createTask — same cast, same reason.
    const { data, error } = await (supabase.from("projects") as any)
      .update(patch)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/projects");
    revalidatePath("/tasks");
    return { data: data as Project, error: null };
  } catch (err) {
    return { data: null, error: toErrorMessage(err) };
  }
}

export async function setProjectArchived(id: string, isArchived: boolean) {
  return updateProject({ id, isArchived });
}

// ---------------------------------------------------------------------------
// Delete
// ---------------------------------------------------------------------------

export async function deleteProject(id: string): Promise<ActionResult<true>> {
  if (!z.string().uuid().safeParse(id).success) {
    return { data: null, error: "Invalid project id." };
  }

  try {
    const { supabase, user } = await requireUser();

    // Tasks in this project keep their history; the FK is ON DELETE SET NULL,
    // so they just become unassigned rather than being deleted.
    const { error } = await supabase.from("projects").delete().eq("id", id).eq("user_id", user.id);
    if (error) throw error;

    revalidatePath("/projects");
    revalidatePath("/tasks");
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
