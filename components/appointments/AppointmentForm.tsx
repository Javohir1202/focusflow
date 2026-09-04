"use client";

import { useState } from "react";
import type { Appointment, AppointmentStatus, Customer, Job } from "@/lib/database.types";
import { useTranslation } from "@/components/i18n/LanguageProvider";

export type AppointmentFormValues = {
  title: string;
  customerId: string;
  jobId?: string;
  scheduledAt: string;
  durationMinutes: number;
  status: AppointmentStatus;
  notes?: string;
};

const STATUS_OPTIONS: AppointmentStatus[] = ["scheduled", "confirmed", "completed", "cancelled"];

function toDatetimeLocal(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(
    d.getMinutes()
  )}`;
}

export function AppointmentForm({
  initialValues,
  customers,
  jobs,
  defaultCustomerId,
  onSubmit,
  onCancel,
  submitLabel,
  disabled,
}: {
  initialValues?: Appointment;
  customers: Customer[];
  jobs: Job[];
  defaultCustomerId?: string;
  onSubmit: (values: AppointmentFormValues) => void;
  onCancel?: () => void;
  submitLabel: string;
  disabled?: boolean;
}) {
  const { dict } = useTranslation();
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [customerId, setCustomerId] = useState(initialValues?.customer_id ?? defaultCustomerId ?? "");
  const [jobId, setJobId] = useState(initialValues?.job_id ?? "");
  const [scheduledAt, setScheduledAt] = useState(toDatetimeLocal(initialValues?.scheduled_at));
  const [durationMinutes, setDurationMinutes] = useState(
    String(initialValues?.duration_minutes ?? 60)
  );
  const [status, setStatus] = useState<AppointmentStatus>(initialValues?.status ?? "scheduled");
  const [notes, setNotes] = useState(initialValues?.notes ?? "");
  const [formError, setFormError] = useState<string | null>(null);

  const jobsForCustomer = jobs.filter((j) => j.customer_id === customerId);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) {
      setFormError(dict.appointmentForm.titleRequired);
      return;
    }
    if (!customerId) {
      setFormError(dict.appointmentForm.customerRequired);
      return;
    }
    if (!scheduledAt) {
      setFormError(dict.appointmentForm.dateTimeRequired);
      return;
    }
    const minutes = Number(durationMinutes);
    if (!Number.isInteger(minutes) || minutes <= 0) {
      setFormError(dict.appointmentForm.durationPositive);
      return;
    }
    setFormError(null);
    onSubmit({
      title: trimmed,
      customerId,
      jobId: jobId || undefined,
      scheduledAt,
      durationMinutes: minutes,
      status,
      notes: notes.trim(),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{dict.appointmentForm.title}</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
            required
            autoFocus
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 text-sm focus:border-brand-500 focus:outline-none"
            placeholder={dict.appointmentForm.titlePlaceholder}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{dict.appointmentForm.customer}</label>
          <select
            value={customerId}
            onChange={(e) => {
              setCustomerId(e.target.value);
              setJobId("");
            }}
            required
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 text-sm focus:border-brand-500 focus:outline-none"
          >
            <option value="">{dict.appointmentForm.selectCustomer}</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{dict.appointmentForm.job}</label>
          <select
            value={jobId}
            onChange={(e) => setJobId(e.target.value)}
            disabled={!customerId}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 text-sm focus:border-brand-500 focus:outline-none disabled:opacity-60"
          >
            <option value="">{dict.appointmentForm.noJob}</option>
            {jobsForCustomer.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{dict.appointmentForm.dateTime}</label>
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 text-sm focus:border-brand-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{dict.appointmentForm.duration}</label>
          <input
            type="number"
            min={1}
            max={1440}
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 text-sm focus:border-brand-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{dict.appointmentForm.status}</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as AppointmentStatus)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 text-sm focus:border-brand-500 focus:outline-none"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {dict.appointmentStatus[s]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{dict.appointmentForm.notes}</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          maxLength={4000}
          rows={2}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 text-sm focus:border-brand-500 focus:outline-none"
          placeholder={dict.common.optional}
        />
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
