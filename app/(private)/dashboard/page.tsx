import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/translations";
import type { ActivityLogEntry, Customer, Job, Lead, Task } from "@/lib/database.types";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = createServerSupabaseClient();
  const dict = getDictionary(getLocale());
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectedFrom=/dashboard");
  }

  const [
    { data: leads },
    { data: jobs },
    { data: tasks },
    { data: customers },
    { data: appointments },
    { data: activity },
  ] = await Promise.all([
    supabase.from("leads").select("*").eq("user_id", user.id).returns<Lead[]>(),
    supabase.from("jobs").select("*").eq("user_id", user.id).returns<Job[]>(),
    supabase.from("tasks").select("*").eq("user_id", user.id).returns<Task[]>(),
    supabase.from("customers").select("*").eq("user_id", user.id).returns<Customer[]>(),
    supabase
      .from("appointments")
      .select("*")
      .eq("user_id", user.id)
      .gte("scheduled_at", new Date(new Date().setHours(0, 0, 0, 0)).toISOString())
      .lt("scheduled_at", new Date(new Date().setHours(23, 59, 59, 999)).toISOString()),
    supabase
      .from("activity_log")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(8)
      .returns<ActivityLogEntry[]>(),
  ]);

  const leadsList = leads ?? [];
  const jobsList = jobs ?? [];
  const tasksList = tasks ?? [];
  const now = new Date();

  const newLeads = leadsList.filter((l) => l.status === "new").length;
  const activeJobs = jobsList.filter((j) => !["completed", "cancelled"].includes(j.status)).length;
  const completedJobs = jobsList.filter((j) => j.status === "completed").length;
  const overdueTasks = tasksList.filter(
    (t) => t.status !== "done" && t.deadline && new Date(t.deadline) < now
  ).length;
  const revenue = jobsList
    .filter((j) => j.status === "completed")
    .reduce((sum, j) => sum + (j.price ?? 0), 0);
  const todaysAppointments = (appointments ?? []).length;

  const pipelineOrder: Lead["status"][] = ["new", "contacted", "qualified", "quoted", "won"];
  const pipelineCounts = pipelineOrder.map((status) => ({
    status,
    count: leadsList.filter((l) => l.status === status).length,
  }));

  const overdueTaskRows = tasksList
    .filter((t) => t.status !== "done" && t.deadline && new Date(t.deadline) < now)
    .slice(0, 5);

  const kpis = [
    { label: dict.dashboard.kpiNewLeads, value: newLeads, href: "/leads" },
    { label: dict.dashboard.kpiActiveJobs, value: activeJobs, href: "/jobs" },
    { label: dict.dashboard.kpiTodaysAppointments, value: todaysAppointments, href: "/appointments" },
    { label: dict.dashboard.kpiCompletedJobs, value: completedJobs, href: "/jobs" },
    { label: dict.dashboard.kpiOverdueTasks, value: overdueTasks, href: "/tasks" },
    { label: dict.dashboard.kpiRevenue, value: `$${revenue.toLocaleString()}`, href: "/jobs" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="break-words text-2xl font-bold text-slate-900 dark:text-slate-100">
        {dict.dashboard.welcomeBack}
        {user.email ? `, ${user.email}` : ""}
      </h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">
        {dict.dashboard.happeningAcross} {customers?.length ?? 0} {dict.dashboard.customers}
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {kpis.map((kpi) => (
          <Link
            key={kpi.label}
            href={kpi.href}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 hover:border-brand-400 dark:hover:border-brand-500"
          >
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{kpi.value}</p>
            <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">{kpi.label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {dict.dashboard.leadPipeline}
            </h2>
            <Link href="/leads" className="text-sm font-medium text-brand-700 dark:text-brand-300 hover:underline">
              {dict.dashboard.viewBoard}
            </Link>
          </div>
          <div className="mt-3 space-y-2">
            {pipelineCounts.map((p) => (
              <div key={p.status} className="flex items-center gap-3">
                <span className="w-24 shrink-0 text-sm text-slate-600 dark:text-slate-400">
                  {dict.leadStatus[p.status]}
                </span>
                <div className="h-2 flex-1 rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-2 rounded-full bg-brand-500"
                    style={{
                      width: `${leadsList.length ? Math.max((p.count / leadsList.length) * 100, p.count > 0 ? 6 : 0) : 0}%`,
                    }}
                  />
                </div>
                <span className="w-6 text-right text-sm text-slate-500 dark:text-slate-400">{p.count}</span>
              </div>
            ))}
            {leadsList.length === 0 && (
              <p className="text-sm text-slate-500 dark:text-slate-400">{dict.dashboard.noLeadsYet}</p>
            )}
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {dict.dashboard.overdueTasks}
          </h2>
          {overdueTaskRows.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{dict.dashboard.nothingOverdue}</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {overdueTaskRows.map((t) => (
                <li key={t.id} className="rounded-lg border border-red-100 dark:border-red-500/30 bg-red-50 dark:bg-red-500/15 px-4 py-2 text-sm">
                  <span className="font-medium text-red-800 dark:text-red-300">{t.title}</span>{" "}
                  <span className="text-red-600 dark:text-red-400">
                    — {dict.dashboard.due} {t.deadline ? new Date(t.deadline).toLocaleDateString() : ""}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="lg:col-span-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {dict.dashboard.recentActivity}
          </h2>
          {(activity ?? []).length === 0 ? (
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{dict.dashboard.noActivityYet}</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {(activity ?? []).map((entry) => (
                <li key={entry.id} className="text-sm text-slate-600 dark:text-slate-400">
                  <span className="text-slate-800 dark:text-slate-200">{entry.description}</span>
                  <span className="ml-2 text-xs text-slate-400 dark:text-slate-500">{new Date(entry.created_at).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
