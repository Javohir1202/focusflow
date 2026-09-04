import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/translations";
import { TasksClient } from "@/components/tasks/TasksClient";
import type { Customer, Job, Task } from "@/lib/database.types";

export const metadata: Metadata = {
  title: "Tasks",
};

export const dynamic = "force-dynamic";

export default async function TasksPage({
  searchParams,
}: {
  searchParams: { job?: string };
}) {
  const supabase = createServerSupabaseClient();
  const dict = getDictionary(getLocale());

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectedFrom=/tasks");
  }

  const [
    { data: tasks, error: tasksError },
    { data: jobs, error: jobsError },
    { data: customers, error: customersError },
  ] = await Promise.all([
    supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id)
      .order("status", { ascending: true })
      .order("deadline", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false })
      .returns<Task[]>(),
    supabase.from("jobs").select("*").eq("user_id", user.id).order("title", { ascending: true }).returns<Job[]>(),
    supabase
      .from("customers")
      .select("*")
      .eq("user_id", user.id)
      .order("name", { ascending: true })
      .returns<Customer[]>(),
  ]);

  if (tasksError || jobsError || customersError) {
    throw new Error(
      tasksError?.message ?? jobsError?.message ?? customersError?.message ?? "Failed to load tasks."
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{dict.tasks.title}</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">{dict.tasks.subtitle}</p>

      <TasksClient
        initialTasks={tasks ?? []}
        jobs={jobs ?? []}
        customers={customers ?? []}
        initialJobFilter={searchParams.job ?? "all"}
      />
    </div>
  );
}
