import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/translations";
import { CustomerDetailHeader } from "@/components/customers/CustomerDetailHeader";
import type { ActivityLogEntry, Appointment, Customer, Job, Task } from "@/lib/database.types";

export const metadata: Metadata = {
  title: "Customer",
};

export const dynamic = "force-dynamic";

const JOB_STATUS_BADGE: Record<string, string> = {
  new: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400",
  scheduled: "bg-sky-50 dark:bg-sky-500/15 text-sky-700 dark:text-sky-400",
  in_progress: "bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400",
  on_hold: "bg-orange-50 dark:bg-orange-500/15 text-orange-700 dark:text-orange-400",
  completed: "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  cancelled: "bg-red-50 dark:bg-red-500/15 text-red-700 dark:text-red-400",
};

const TASK_STATUS_BADGE: Record<string, string> = {
  todo: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400",
  in_progress: "bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400",
  done: "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
};

export default async function CustomerDetailPage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient();
  const dict = getDictionary(getLocale());

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirectedFrom=/customers/${params.id}`);
  }

  const { data: customer, error: customerError } = await supabase
    .from("customers")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .maybeSingle<Customer>();

  if (customerError) throw new Error(customerError.message);
  if (!customer) notFound();

  const [{ data: jobs, error: jobsError }, { data: tasks, error: tasksError }, { data: appointments }] =
    await Promise.all([
      supabase
        .from("jobs")
        .select("*")
        .eq("user_id", user.id)
        .eq("customer_id", customer.id)
        .order("created_at", { ascending: false })
        .returns<Job[]>(),
      supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user.id)
        .eq("customer_id", customer.id)
        .order("created_at", { ascending: false })
        .returns<Task[]>(),
      supabase
        .from("appointments")
        .select("*")
        .eq("user_id", user.id)
        .eq("customer_id", customer.id)
        .order("scheduled_at", { ascending: true })
        .returns<Appointment[]>(),
    ]);

  if (jobsError || tasksError) {
    throw new Error(jobsError?.message ?? tasksError?.message ?? "Failed to load customer detail.");
  }

  const jobIds = (jobs ?? []).map((j) => j.id);
  const relatedEntityIds = [customer.id, ...jobIds, ...(tasks ?? []).map((t) => t.id)];

  const { data: activity } = await supabase
    .from("activity_log")
    .select("*")
    .eq("user_id", user.id)
    .in("entity_id", relatedEntityIds)
    .order("created_at", { ascending: false })
    .limit(20)
    .returns<ActivityLogEntry[]>();

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <Link href="/customers" className="text-sm font-medium text-brand-700 dark:text-brand-300 hover:underline">
        {dict.customerDetail.allCustomers}
      </Link>

      <div className="mt-4">
        <CustomerDetailHeader customer={customer} />
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {dict.customerDetail.jobs}
            </h2>
            <Link href="/jobs" className="text-sm font-medium text-brand-700 dark:text-brand-300 hover:underline">
              {dict.customerDetail.newJob}
            </Link>
          </div>
          {(jobs ?? []).length === 0 ? (
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{dict.customerDetail.noJobsYet}</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {(jobs ?? []).map((job) => (
                <li
                  key={job.id}
                  className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3"
                >
                  <span className="font-medium text-slate-800 dark:text-slate-200">{job.title}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${JOB_STATUS_BADGE[job.status]}`}
                  >
                    {dict.jobStatus[job.status]}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {dict.customerDetail.tasks}
            </h2>
            <Link href="/tasks" className="text-sm font-medium text-brand-700 dark:text-brand-300 hover:underline">
              {dict.customerDetail.newTask}
            </Link>
          </div>
          {(tasks ?? []).length === 0 ? (
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{dict.customerDetail.noTasksYet}</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {(tasks ?? []).map((task) => (
                <li
                  key={task.id}
                  className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3"
                >
                  <span className="font-medium text-slate-800 dark:text-slate-200">{task.title}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${TASK_STATUS_BADGE[task.status]}`}
                  >
                    {dict.taskStatus[task.status]}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {dict.customerDetail.appointments}
            </h2>
            <Link href="/appointments" className="text-sm font-medium text-brand-700 dark:text-brand-300 hover:underline">
              {dict.customerDetail.newAppointment}
            </Link>
          </div>
          {(appointments ?? []).length === 0 ? (
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{dict.customerDetail.noAppointmentsScheduled}</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {(appointments ?? []).map((appt) => (
                <li key={appt.id} className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3">
                  <p className="font-medium text-slate-800 dark:text-slate-200">{appt.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {new Date(appt.scheduled_at).toLocaleString()} · {dict.appointmentStatus[appt.status]}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {dict.customerDetail.activity}
          </h2>
          {(activity ?? []).length === 0 ? (
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{dict.customerDetail.noActivityYet}</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {(activity ?? []).map((entry) => (
                <li key={entry.id} className="text-sm text-slate-600 dark:text-slate-400">
                  <span className="text-slate-800 dark:text-slate-200">{entry.description}</span>
                  <span className="ml-2 text-xs text-slate-400 dark:text-slate-500">
                    {new Date(entry.created_at).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
