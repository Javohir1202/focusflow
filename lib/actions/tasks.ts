"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Task, TaskInsert, TaskPriority, TaskStatus, TaskUpdate } from "@/lib/database.types";

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

const CreateTaskSchema = z.object({
  title: z.string().trim().min(1, "Title is required.").max(200),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  priority: z.enum(["low", "medium", "high"]),
  projectId: z.string().uuid().optional().or(z.literal("")),
  deadline: z.string().optional().or(z.literal("")), // datetime-local string
  estimatedMinutes: z.number().int().positive().max(24 * 60).optional(),
});

export async function createTask(input: {
  title: string;
  description?: string;
  priority: TaskPriority;
  projectId?: string;
  deadline?: string;
  estimatedMinutes?: number;
}): Promise<ActionResult<Task>> {
  const parsed = CreateTaskSchema.safeParse(input);
  if (!parsed.success) {
    return { data: null, error: parsed.error.errors[0]?.message ?? "Invalid task." };
  }

  try {
    const { supabase, user } = await requireUser();

    const payload: TaskInsert = {
      user_id: user.id, // explicit, on top of the RLS "with check" policy
      title: parsed.data.title,
      description: parsed.data.description ? parsed.data.description : null,
      priority: parsed.data.priority,
      project_id: parsed.data.projectId ? parsed.data.projectId : null,
      deadline: parsed.data.deadline ? new Date(parsed.data.deadline).toISOString() : null,
      estimated_minutes: parsed.data.estimatedMinutes ?? null,
      source: "manual",
    };

    // Cast the query-builder step (not the payload) to sidestep a
    // supabase-js/postgrest-js version mismatch where .insert()'s parameter
    // type resolves incorrectly regardless of the Database generic — see
    // the note at the top of lib/database.types.ts. `payload` itself stays
    // fully typed as TaskInsert above, and the result is cast back to Task
    // below, so this doesn't weaken typing anywhere else.
    const { data, error } = await (supabase.from("tasks") as any)
      .insert(payload)
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/tasks");
    revalidatePath("/dashboard");
    return { data: data as Task, error: null };
  } catch (err) {
    return { data: null, error: toErrorMessage(err) };
  }
}

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------

const UpdateTaskSchema = z.object({
  id: z.string().uuid(),
  title: z.string().trim().min(1, "Title is required.").max(200).optional(),
  description: z.string().trim().max(2000).nullable().optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  status: z.enum(["todo", "in_progress", "done"]).optional(),
  projectId: z.string().uuid().nullable().optional(),
  deadline: z.string().nullable().optional(),
  estimatedMinutes: z.number().int().positive().max(24 * 60).nullable().optional(),
});

export async function updateTask(
  input: z.infer<typeof UpdateTaskSchema>
): Promise<ActionResult<Task>> {
  const parsed = UpdateTaskSchema.safeParse(input);
  if (!parsed.success) {
    return { data: null, error: parsed.error.errors[0]?.message ?? "Invalid update." };
  }

  const { id, deadline, projectId, estimatedMinutes, title, description, priority, status } =
    parsed.data;

  try {
    const { supabase, user } = await requireUser();

    // Map camelCase input fields to their snake_case DB columns explicitly —
    // spreading the parsed object would send "projectId"/"estimatedMinutes"
    // as literal (nonexistent) column names.
    const patch: TaskUpdate = {};
    if (title !== undefined) patch.title = title;
    if (description !== undefined) patch.description = description;
    if (priority !== undefined) patch.priority = priority;
    if (status !== undefined) patch.status = status;
    if (projectId !== undefined) patch.project_id = projectId;
    if (estimatedMinutes !== undefined) patch.estimated_minutes = estimatedMinutes;
    if (deadline !== undefined) {
      patch.deadline = deadline ? new Date(deadline).toISOString() : null;
    }

    // See the note in createTask above — casting the builder step, not the
    // payload, to sidestep the same version-mismatch issue for .update().
    const { data, error } = await (supabase.from("tasks") as any)
      .update(patch)
      .eq("id", id)
      .eq("user_id", user.id) // belt-and-suspenders alongside RLS
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/tasks");
    revalidatePath("/dashboard");
    return { data: data as Task, error: null };
  } catch (err) {
    return { data: null, error: toErrorMessage(err) };
  }
}

export async function setTaskStatus(id: string, status: TaskStatus): Promise<ActionResult<Task>> {
  return updateTask({ id, status });
}

// ---------------------------------------------------------------------------
// Delete
// ---------------------------------------------------------------------------

export async function deleteTask(id: string): Promise<ActionResult<true>> {
  if (!z.string().uuid().safeParse(id).success) {
    return { data: null, error: "Invalid task id." };
  }

  try {
    const { supabase, user } = await requireUser();

    const { error } = await supabase.from("tasks").delete().eq("id", id).eq("user_id", user.id);
    if (error) throw error;

    revalidatePath("/tasks");
    revalidatePath("/dashboard");
    return { data: true, error: null };
  } catch (err) {
    return { data: null, error: toErrorMessage(err) };
  }
}

// ---------------------------------------------------------------------------
// Read (used by the AI planner / dashboard later — kept here alongside the
// rest of the task data-access layer)
// ---------------------------------------------------------------------------

export async function listIncompleteTasks(): Promise<ActionResult<Task[]>> {
  try {
    const { supabase, user } = await requireUser();

    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id)
      .neq("status", "done")
      .order("deadline", { ascending: true, nullsFirst: false });

    if (error) throw error;
    return { data: data ?? [], error: null };
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
