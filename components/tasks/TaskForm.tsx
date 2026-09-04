"use client";

import { useState } from "react";
import type { Customer, Job, Task, TaskPriority } from "@/lib/database.types";
import { useTranslation } from "@/components/i18n/LanguageProvider";

export type TaskFormValues = {
  title: string;
  description?: string;
  priority: TaskPriority;
  jobId?: string;
  customerId?: string;
  assignee?: string;
  deadline?: string; // datetime-local string, "" clears it
  estimatedMinutes?: number;
};

const PRIORITY_KEY = {
  low: "priorityLow",
  medium: "priorityMedium",
  high: "priorityHigh",
} as const;

function toDatetimeLocal(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

export function TaskForm({
  initialValues,
  jobs,
  customers,
  onSubmit,
  onCancel,
  submitLabel,
  disabled,
}: {
  initialValues?: Task;
  jobs: Job[];
  customers: Customer[];
  onSubmit: (values: TaskFormValues) => void;
  onCancel?: () => void;
  submitLabel: string;
  disabled?: boolean;
}) {
  const { dict } = useTranslation();
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [priority, setPriority] = useState<TaskPriority>(initialValues?.priority ?? "medium");
  const [jobId, setJobId] = useState(initialValues?.job_id ?? "");
  const [customerId, setCustomerId] = useState(initialValues?.customer_id ?? "");
  const [assignee, setAssignee] = useState(initialValues?.assignee ?? "");
  const [deadline, setDeadline] = useState(toDatetimeLocal(initialValues?.deadline ?? null));
  const [estimatedMinutes, setEstimatedMinutes] = useState(
    initialValues?.estimated_minutes != null ? String(initialValues.estimated_minutes) : ""
  );
  const [formError, setFormError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) {
      setFormError(dict.taskForm.titleRequired);
      return;
    }
    const minutes = estimatedMinutes.trim() ? Number(estimatedMinutes) : undefined;
    if (minutes !== undefined && (!Number.isInteger(minutes) || minutes <= 0)) {
      setFormError(dict.taskForm.minutesPositive);
      return;
    }
    setFormError(null);
    onSubmit({
      title: trimmed,
      description: description.trim(),
      priority,
      jobId: jobId || undefined,
      customerId: customerId || undefined,
      assignee: assignee.trim(),
      deadline,
      estimatedMinutes: minutes,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{dict.taskForm.title}</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          required
          autoFocus
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 text-sm focus:border-brand-500 focus:outline-none"
          placeholder={dict.taskForm.titlePlaceholder}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{dict.taskForm.description}</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={2000}
          rows={2}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 text-sm focus:border-brand-500 focus:outline-none"
          placeholder={dict.common.optional}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{dict.taskForm.priority}</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 text-sm focus:border-brand-500 focus:outline-none"
          >
            <option value="low">{dict.common[PRIORITY_KEY.low]}</option>
            <option value="medium">{dict.common[PRIORITY_KEY.medium]}</option>
            <option value="high">{dict.common[PRIORITY_KEY.high]}</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{dict.taskForm.job}</label>
          <select
            value={jobId}
            onChange={(e) => setJobId(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 text-sm focus:border-brand-500 focus:outline-none"
          >
            <option value="">{dict.taskForm.noJob}</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{dict.taskForm.customer}</label>
          <select
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 text-sm focus:border-brand-500 focus:outline-none"
          >
            <option value="">{dict.taskForm.noCustomer}</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{dict.taskForm.assignee}</label>
          <input
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 text-sm focus:border-brand-500 focus:outline-none"
            placeholder={dict.common.optional}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{dict.taskForm.deadline}</label>
          <input
            type="datetime-local"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 text-sm focus:border-brand-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{dict.taskForm.estimatedMinutes}</label>
          <input
            type="number"
            min={1}
            max={1440}
            value={estimatedMinutes}
            onChange={(e) => setEstimatedMinutes(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 text-sm focus:border-brand-500 focus:outline-none"
            placeholder={dict.taskForm.estimatedMinutesPlaceholder}
          />
        </div>
      </div>

      {formError && <p className="text-sm text-red-600 dark:text-red-400">{formError}</p>}

      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={disabled}
          className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {disabled ? dict.common.saving : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {dict.common.cancel}
          </button>
        )}
      </div>
    </form>
  );
}
