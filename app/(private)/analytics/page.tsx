import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/translations";
import type { Job, Lead, LeadSource, Task } from "@/lib/database.types";

export const metadata: Metadata = {
  title: "Analytics",
};

export const dynamic = "force-dynamic";

function monthKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key: string): string {
  const [year, month] = key.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString(undefined, { month: "short" });
}

function lastNMonthKeys(n: number): string[] {
  const keys: string[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  return keys;
}

export default async function AnalyticsPage() {
  const supabase = createServerSupabaseClient();
  const dict = getDictionary(getLocale());

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectedFrom=/analytics");
  }

  const [{ data: leads }, { data: jobs }, { data: tasks }] = await Promise.all([
    supabase.from("leads").select("*").eq("user_id", user.id).returns<Lead[]>(),
    supabase.from("jobs").select("*").eq("user_id", user.id).returns<Job[]>(),
    supabase.from("tasks").select("*").eq("user_id", user.id).returns<Task[]>(),
  ]);

  const leadsList = leads ?? [];
  const jobsList = jobs ?? [];
  const tasksList = tasks ?? [];

  // Revenue by month, last 6 months, from completed jobs.
  const monthKeys = lastNMonthKeys(6);
  const revenueByMonth = new Map(monthKeys.map((k) => [k, 0]));
  for (const job of jobsList) {
    if (job.status !== "completed" || job.price == null) continue;
    const key = monthKey(job.completed_at ?? job.updated_at);
    if (revenueByMonth.has(key)) {
      revenueByMonth.set(key, (revenueByMonth.get(key) ?? 0) + job.price);
    }
  }
  const maxRevenue = Math.max(1, ...Array.from(revenueByMonth.values()));

  // Lead sources.
  const sources = Object.keys(dict.leadSource) as LeadSource[];
  const leadsBySource = sources
    .map((source) => ({
      source,
      count: leadsList.filter((l) => l.source === source).length,
    }))
    .filter((s) => s.count > 0)
    .sort((a, b) => b.count - a.count);
  const maxSourceCount = Math.max(1, ...leadsBySource.map((s) => s.count));

  // Job status breakdown.
  const jobStatuses = Object.keys(dict.jobStatus) as Job["status"][];
  const jobsByStatus = jobStatuses.map((status) => ({
    status,
    count: jobsList.filter((j) => j.status === status).length,
  }));
  const maxJobStatusCount = Math.max(1, ...jobsByStatus.map((s) => s.count));

  // Headline stats.
  const wonLeads = leadsList.filter((l) => l.status === "won").length;
  const closedLeads = leadsList.filter((l) => l.status === "won" || l.status === "lost").length;
  const conversionRate = closedLeads > 0 ? Math.round((wonLeads / closedLeads) * 100) : null;
  const doneTasks = tasksList.filter((t) => t.status === "done").length;
  const taskCompletionRate = tasksList.length > 0 ? Math.round((doneTasks / tasksList.length) * 100) : null;
  const totalRevenue = jobsList
    .filter((j) => j.status === "completed")
    .reduce((sum, j) => sum + (j.price ?? 0), 0);

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{dict.analytics.title}</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">{dict.analytics.subtitle}</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {conversionRate === null ? dict.common.dash : `${conversionRate}%`}
          </p>
          <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">{dict.analytics.conversionRate}</p>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {taskCompletionRate === null ? dict.common.dash : `${taskCompletionRate}%`}
          </p>
          <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">{dict.analytics.tasksCompleted}</p>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">${totalRevenue.toLocaleString()}</p>
          <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">{dict.analytics.totalRevenue}</p>
        </div>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {dict.analytics.revenueByMonth}
          </h2>
          <div className="mt-4 flex h-40 items-end gap-3">
            {monthKeys.map((key) => {
              const value = revenueByMonth.get(key) ?? 0;
              const height = Math.max((value / maxRevenue) * 100, value > 0 ? 4 : 2);
              return (
                <div key={key} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex h-32 w-full items-end">
                    <div
                      className="w-full rounded-t-md bg-brand-500"
                      style={{ height: `${height}%` }}
                      title={`$${value.toLocaleString()}`}
                    />
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{monthLabel(key)}</span>
                </div>
              );
            })}
          </div>
          {totalRevenue === 0 && (
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{dict.analytics.noCompletedJobs}</p>
          )}
        </section>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {dict.analytics.leadsBySource}
          </h2>
          {leadsBySource.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{dict.analytics.noLeadsYet}</p>
          ) : (
            <div className="mt-4 space-y-2">
              {leadsBySource.map((s) => (
                <div key={s.source} className="flex items-center gap-3">
                  <span className="w-28 shrink-0 text-sm text-slate-600 dark:text-slate-400">{dict.leadSource[s.source]}</span>
                  <div className="h-2 flex-1 rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-2 rounded-full bg-brand-500"
                      style={{ width: `${(s.count / maxSourceCount) * 100}%` }}
                    />
                  </div>
                  <span className="w-6 text-right text-sm text-slate-500 dark:text-slate-400">{s.count}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="lg:col-span-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {dict.analytics.jobsByStatus}
          </h2>
          {jobsList.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{dict.analytics.noJobsYet}</p>
          ) : (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {jobsByStatus.map((s) => (
                <div key={s.status} className="flex items-center gap-3">
                  <span className="w-28 shrink-0 text-sm text-slate-600 dark:text-slate-400">
                    {dict.jobStatus[s.status]}
                  </span>
                  <div className="h-2 flex-1 rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-2 rounded-full bg-brand-500"
                      style={{ width: `${(s.count / maxJobStatusCount) * 100}%` }}
                    />
                  </div>
                  <span className="w-6 text-right text-sm text-slate-500 dark:text-slate-400">{s.count}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
