import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { TasksClient } from "@/components/tasks/TasksClient";

export const metadata: Metadata = {
  title: "Tasks — FocusFlow",
};

export const dynamic = "force-dynamic";

export default async function TasksPage({
  searchParams,
}: {
  searchParams: { project?: string };
}) {
  const supabase = createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectedFrom=/tasks");
  }

  const [{ data: tasks, error: tasksError }, { data: projects, error: projectsError }] =
    await Promise.all([
      supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user.id)
        .order("status", { ascending: true })
        .order("deadline", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: false }),
      supabase
        .from("projects")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_archived", false)
        .order("name", { ascending: true }),
    ]);

  if (tasksError || projectsError) {
    throw new Error(tasksError?.message ?? projectsError?.message ?? "Failed to load tasks.");
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-2xl font-bold text-slate-900">Tasks</h1>
      <p className="mt-2 text-slate-600">Everything on your plate, in one place.</p>

      <TasksClient
        initialTasks={tasks ?? []}
        projects={projects ?? []}
        initialProjectFilter={searchParams.project ?? "all"}
      />
    </div>
  );
}
