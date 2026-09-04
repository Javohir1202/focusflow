"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { createJob, deleteJob, setJobStatus, updateJob } from "@/lib/actions/jobs";
import type { Customer, Job, JobStatus } from "@/lib/database.types";
import { useTranslation } from "@/components/i18n/LanguageProvider";
import { JobForm, type JobFormValues } from "./JobForm";

const STATUS_OPTIONS: JobStatus[] = ["new", "scheduled", "in_progress", "on_hold", "completed", "cancelled"];

const STATUS_BADGE: Record<JobStatus, string> = {
  new: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400",
  scheduled: "bg-sky-50 dark:bg-sky-500/15 text-sky-700 dark:text-sky-400",
  in_progress: "bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400",
  on_hold: "bg-orange-50 dark:bg-orange-500/15 text-orange-700 dark:text-orange-400",
  completed: "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  cancelled: "bg-red-50 dark:bg-red-500/15 text-red-700 dark:text-red-400",
};

const PRIORITY_BADGE: Record<string, string> = {
  low: "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400",
  medium: "bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400",
  high: "bg-red-50 dark:bg-red-500/15 text-red-700 dark:text-red-400",
};

const PRIORITY_KEY = {
  low: "priorityLow",
  medium: "priorityMedium",
  high: "priorityHigh",
} as const;

export function JobsClient({
  initialJobs,
  customers,
}: {
  initialJobs: (Job & { customerName: string })[];
  customers: Customer[];
}) {
  const { dict } = useTranslation();
  const [jobs, setJobs] = useState(initialJobs);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | JobStatus>("all");
  const [, startTransition] = useTransition();

  const filtered = useMemo(() => {
    return jobs.filter((j) => {
      if (statusFilter !== "all" && j.status !== statusFilter) return false;
      if (!query.trim()) return true;
      const q = query.trim().toLowerCase();
      return j.title.toLowerCase().includes(q) || j.customerName.toLowerCase().includes(q);
    });
  }, [jobs, query, statusFilter]);

  function customerName(id: string) {
    return customers.find((c) => c.id === id)?.name ?? "Unknown";
  }

  function handleCreate(values: JobFormValues) {
    setError(null);
    setCreating(true);
    startTransition(async () => {
      const result = await createJob(values);
      setCreating(false);
      if (result.error || !result.data) {
        setError(result.error ?? dict.jobs.failedCreate);
        return;
      }
      setJobs((prev) => [{ ...result.data!, customerName: customerName(result.data!.customer_id) }, ...prev]);
      setShowCreateForm(false);
    });
  }

  function handleUpdate(id: string, values: JobFormValues) {
    setError(null);
    setPendingId(id);
    startTransition(async () => {
      const result = await updateJob({ id, ...values });
      setPendingId(null);
      if (result.error || !result.data) {
        setError(result.error ?? dict.jobs.failedUpdate);
        return;
      }
      setJobs((prev) =>
        prev.map((j) => (j.id === id ? { ...result.data!, customerName: customerName(result.data!.customer_id) } : j))
      );
      setEditingId(null);
    });
  }

  function handleStatusChange(job: Job, status: JobStatus) {
    setError(null);
    setJobs((prev) => prev.map((j) => (j.id === job.id ? { ...j, status } : j)));
    startTransition(async () => {
      const result = await setJobStatus(job.id, status);
      if (result.error) {
        setError(result.error);
        setJobs((prev) => prev.map((j) => (j.id === job.id ? { ...j, status: job.status } : j)));
      }
    });
  }

  function handleDelete(job: Job) {
    if (!window.confirm(dict.jobs.deleteConfirm.replace("{name}", job.title))) return;
    setError(null);
    setPendingId(job.id);
    startTransition(async () => {
      const result = await deleteJob(job.id);
      setPendingId(null);
      if (result.error) {
        setError(result.error);
        return;
      }
      setJobs((prev) => prev.filter((j) => j.id !== job.id));
    });
  }

  return (
    <div>
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={dict.jobs.searchPlaceholder}
            className="w-56 rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 text-sm focus:border-brand-500 focus:outline-none"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 text-sm focus:border-brand-500 focus:outline-none"
          >
            <option value="all">{dict.common.allStatuses}</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {dict.jobStatus[s]}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={() => setShowCreateForm((v) => !v)}
          disabled={customers.length === 0}
          className="rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {showCreateForm ? dict.common.cancel : dict.jobs.newJob}
        </button>
      </div>

      {customers.length === 0 && (
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
          {dict.jobs.addCustomerFirst}{" "}
          <Link href="/customers" className="font-medium text-brand-700 dark:text-brand-300 hover:underline">
            {dict.jobs.addCustomerFirstLink}
          </Link>{" "}
          {dict.jobs.addCustomerFirstSuffix}
        </p>
      )}

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 dark:bg-red-500/15 p-3 text-sm text-red-700 dark:text-red-400" role="alert">
          {error}
        </div>
      )}

      {showCreateForm && (
        <div className="mt-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
          <JobForm customers={customers} onSubmit={handleCreate} submitLabel={dict.jobs.createJob} disabled={creating} />
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-slate-50 dark:bg-slate-950 p-10 text-center">
          <p className="font-medium text-slate-700 dark:text-slate-300">
            {jobs.length === 0 ? dict.jobs.emptyNoneTitle : dict.jobs.emptyFilteredTitle}
          </p>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-sm">
            <thead className="bg-slate-50 dark:bg-slate-950 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">{dict.jobs.colJob}</th>
                <th className="px-4 py-3">{dict.jobs.colCustomer}</th>
                <th className="px-4 py-3">{dict.jobs.colPriority}</th>
                <th className="px-4 py-3">{dict.jobs.colDeadline}</th>
                <th className="px-4 py-3">{dict.jobs.colPrice}</th>
                <th className="px-4 py-3">{dict.jobs.colStatus}</th>
                <th className="px-4 py-3 text-right">{dict.jobs.colActions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((job) =>
                editingId === job.id ? (
                  <tr key={job.id}>
                    <td colSpan={7} className="px-4 py-4">
                      <JobForm
                        initialValues={job}
                        customers={customers}
                        onSubmit={(values) => handleUpdate(job.id, values)}
                        onCancel={() => setEditingId(null)}
                        submitLabel={dict.common.save}
                        disabled={pendingId === job.id}
                      />
                    </td>
                  </tr>
                ) : (
                  <tr key={job.id} className={pendingId === job.id ? "pointer-events-none opacity-60" : ""}>
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{job.title}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600 dark:text-slate-400">
                      <Link href={`/customers/${job.customer_id}`} className="hover:underline">
                        {job.customerName}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${PRIORITY_BADGE[job.priority]}`}>
                        {dict.common[PRIORITY_KEY[job.priority]]}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600 dark:text-slate-400">
                      {job.deadline ? new Date(job.deadline).toLocaleDateString() : dict.common.dash}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600 dark:text-slate-400">
                      {job.price != null ? `$${job.price.toLocaleString()}` : dict.common.dash}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <select
                        value={job.status}
                        onChange={(e) => handleStatusChange(job, e.target.value as JobStatus)}
                        className={`rounded-full border-0 px-2 py-0.5 text-xs font-medium focus:outline-none ${STATUS_BADGE[job.status]}`}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {dict.jobStatus[s]}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="flex justify-end gap-3 text-sm">
                        <button onClick={() => setEditingId(job.id)} className="font-medium text-brand-700 dark:text-brand-300 hover:underline">
                          {dict.common.edit}
                        </button>
                        <button onClick={() => handleDelete(job)} className="font-medium text-red-600 dark:text-red-400 hover:underline">
                          {dict.common.delete}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
