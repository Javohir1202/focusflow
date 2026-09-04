import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { BreakdownForm } from "@/components/ai/BreakdownForm";
import { DailyPlanner } from "@/components/ai/DailyPlanner";

export const metadata: Metadata = {
  title: "AI Planner — FocusFlow",
};

export const dynamic = "force-dynamic";

export default async function AiPlannerPage() {
  const supabase = createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectedFrom=/ai-planner");
  }

  const [{ data: tasks, error: tasksError }, { data: projects, error: projectsError }] =
    await Promise.all([
      supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user.id)
        .neq("status", "done")
        .order("deadline", { ascending: true, nullsFirst: false }),
      supabase.from("projects").select("*").eq("user_id", user.id),
    ]);

  if (tasksError || projectsError) {
    throw new Error(tasksError?.message ?? projectsError?.message ?? "Failed to load your tasks.");
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-2xl font-bold text-slate-900">AI Planner</h1>
      <p className="mt-2 text-slate-600">
        Break a big task into steps, or let Claude schedule today from your real task list.
      </p>

      <div className="mt-10">
        <h2 className="text-lg font-semibold text-slate-900">Task breakdown</h2>
        <p className="mt-1 text-sm text-slate-600">
          Describe a big task and Claude will break it into clear, actionable steps.
        </p>
        <div className="mt-4">
          <BreakdownForm />
        </div>
      </div>

      <div className="mt-12 border-t border-slate-200 pt-10">
        <h2 className="text-lg font-semibold text-slate-900">Today&apos;s plan</h2>
        <p className="mt-1 text-sm text-slate-600">
          Pick which incomplete tasks to schedule and Claude will lay out the rest of your day.
        </p>
        <div className="mt-4">
          <DailyPlanner initialTasks={tasks ?? []} projects={projects ?? []} />
        </div>
      </div>
    </div>
  );
}
