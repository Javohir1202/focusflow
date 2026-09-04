import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ProjectsClient } from "@/components/projects/ProjectsClient";
import type { Project, Task } from "@/lib/database.types";

export const metadata: Metadata = {
  title: "Projects — FocusFlow",
};

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const supabase = createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // middleware already guards this route, but a server component should
  // never assume — fail closed if there's somehow no session.
  if (!user) {
    redirect("/login?redirectedFrom=/projects");
  }

  const [{ data: projects, error: projectsError }, { data: allTasks, error: countsError }] =
    await Promise.all([
      supabase
        .from("projects")
        .select("*")
        .eq("user_id", user.id)
        .order("is_archived", { ascending: true })
        .order("created_at", { ascending: false })
        .returns<Project[]>(),
      // Selecting "*" here (rather than "project_id, status") deliberately —
      // narrow-column selects go through a different, more fragile
      // type-inference path in some supabase-js/postgrest-js version
      // combinations. We only use two fields from each row below.
      supabase.from("tasks").select("*").eq("user_id", user.id).returns<Task[]>(),
    ]);

  if (projectsError || countsError) {
    throw new Error(
      projectsError?.message ?? countsError?.message ?? "Failed to load projects."
    );
  }

  const counts = new Map<string, { total: number; open: number }>();
  for (const row of allTasks ?? []) {
    if (!row.project_id) continue;
    const entry = counts.get(row.project_id) ?? { total: 0, open: 0 };
    entry.total += 1;
    if (row.status !== "done") entry.open += 1;
    counts.set(row.project_id, entry);
  }

  const projectsWithCounts = (projects ?? []).map((project) => ({
    ...project,
    taskCount: counts.get(project.id)?.total ?? 0,
    openTaskCount: counts.get(project.id)?.open ?? 0,
  }));

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-2xl font-bold text-slate-900">Projects</h1>
      <p className="mt-2 text-slate-600">Organize your tasks into projects.</p>

      <ProjectsClient initialProjects={projectsWithCounts} />
    </div>
  );
}
