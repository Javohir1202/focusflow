"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import {
  createAppointment,
  deleteAppointment,
  setAppointmentStatus,
  updateAppointment,
} from "@/lib/actions/appointments";
import type { Appointment, AppointmentStatus, Customer, Job } from "@/lib/database.types";
import { useTranslation } from "@/components/i18n/LanguageProvider";
import type { Dictionary } from "@/lib/i18n/translations";
import { AppointmentForm, type AppointmentFormValues } from "./AppointmentForm";

const STATUS_BADGE: Record<AppointmentStatus, string> = {
  scheduled: "bg-sky-50 dark:bg-sky-500/15 text-sky-700 dark:text-sky-400",
  confirmed: "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  completed: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400",
  cancelled: "bg-red-50 dark:bg-red-500/15 text-red-700 dark:text-red-400",
};

function dayLabel(date: Date, dict: Dictionary): string {
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  if (sameDay(date, today)) return dict.appointments.today;
  if (sameDay(date, tomorrow)) return dict.appointments.tomorrow;
  return date.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
}

export function AppointmentsClient({
  initialAppointments,
  customers,
  jobs,
}: {
  initialAppointments: (Appointment & { customerName: string })[];
  customers: Customer[];
  jobs: Job[];
}) {
  const { dict } = useTranslation();
  const [appointments, setAppointments] = useState(initialAppointments);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPast, setShowPast] = useState(false);
  const [, startTransition] = useTransition();

  function customerName(id: string) {
    return customers.find((c) => c.id === id)?.name ?? "Unknown";
  }

  const visible = useMemo(() => {
    if (showPast) return appointments;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return appointments.filter((a) => new Date(a.scheduled_at) >= now);
  }, [appointments, showPast]);

  const groups = useMemo(() => {
    const map = new Map<string, (Appointment & { customerName: string })[]>();
    for (const appt of visible) {
      const d = new Date(appt.scheduled_at);
      const key = d.toDateString();
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(appt);
    }
    return Array.from(map.entries())
      .map(([key, items]) => ({
        date: new Date(key),
        items: items.sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at)),
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [visible]);

  function handleCreate(values: AppointmentFormValues) {
    setError(null);
    setCreating(true);
    startTransition(async () => {
      const result = await createAppointment(values);
      setCreating(false);
      if (result.error || !result.data) {
        setError(result.error ?? dict.appointments.failedCreate);
        return;
      }
      setAppointments((prev) => [
        { ...result.data!, customerName: customerName(result.data!.customer_id) },
        ...prev,
      ]);
      setShowCreateForm(false);
    });
  }

  function handleUpdate(id: string, values: AppointmentFormValues) {
    setError(null);
    setPendingId(id);
    startTransition(async () => {
      const result = await updateAppointment({ id, ...values });
      setPendingId(null);
      if (result.error || !result.data) {
        setError(result.error ?? dict.appointments.failedUpdate);
        return;
      }
      setAppointments((prev) =>
        prev.map((a) =>
          a.id === id ? { ...result.data!, customerName: customerName(result.data!.customer_id) } : a
        )
      );
      setEditingId(null);
    });
  }

  function handleStatusChange(appt: Appointment, status: AppointmentStatus) {
    setError(null);
    setAppointments((prev) => prev.map((a) => (a.id === appt.id ? { ...a, status } : a)));
    startTransition(async () => {
      const result = await setAppointmentStatus(appt.id, status);
      if (result.error) {
        setError(result.error);
        setAppointments((prev) => prev.map((a) => (a.id === appt.id ? { ...a, status: appt.status } : a)));
      }
    });
  }

  function handleDelete(appt: Appointment) {
    if (!window.confirm(dict.appointments.deleteConfirm.replace("{name}", appt.title))) return;
    setError(null);
    setPendingId(appt.id);
    startTransition(async () => {
      const result = await deleteAppointment(appt.id);
      setPendingId(null);
      if (result.error) {
        setError(result.error);
        return;
      }
      setAppointments((prev) => prev.filter((a) => a.id !== appt.id));
    });
  }

  return (
    <div>
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <input
            type="checkbox"
            checked={showPast}
            onChange={(e) => setShowPast(e.target.checked)}
            className="rounded border-slate-300 dark:border-slate-600"
          />
          {dict.appointments.showPast}
        </label>
        <button
          onClick={() => setShowCreateForm((v) => !v)}
          disabled={customers.length === 0}
          className="rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {showCreateForm ? dict.common.cancel : dict.appointments.newAppointment}
        </button>
      </div>

      {customers.length === 0 && (
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
          {dict.appointments.addCustomerFirst}{" "}
          <Link href="/customers" className="font-medium text-brand-700 dark:text-brand-300 hover:underline">
            {dict.appointments.addCustomerFirstLink}
          </Link>{" "}
          {dict.appointments.addCustomerFirstSuffix}
        </p>
      )}

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 dark:bg-red-500/15 p-3 text-sm text-red-700 dark:text-red-400" role="alert">
          {error}
        </div>
      )}

      {showCreateForm && (
        <div className="mt-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
          <AppointmentForm
            customers={customers}
            jobs={jobs}
            onSubmit={handleCreate}
            submitLabel={dict.appointments.scheduleAppointment}
            disabled={creating}
          />
        </div>
      )}

      {groups.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-slate-50 dark:bg-slate-950 p-10 text-center">
          <p className="font-medium text-slate-700 dark:text-slate-300">
            {appointments.length === 0 ? dict.appointments.emptyNoneTitle : dict.appointments.emptyFilteredTitle}
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {appointments.length === 0 ? dict.appointments.emptyNoneSubtitle : dict.appointments.emptyFilteredSubtitle}
          </p>
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          {groups.map((group) => (
            <div key={group.date.toDateString()}>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {dayLabel(group.date, dict)}
              </h2>
              <ul className="mt-3 space-y-2">
                {group.items.map((appt) =>
                  editingId === appt.id ? (
                    <li key={appt.id} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
                      <AppointmentForm
                        initialValues={appt}
                        customers={customers}
                        jobs={jobs}
                        onSubmit={(values) => handleUpdate(appt.id, values)}
                        onCancel={() => setEditingId(null)}
                        submitLabel={dict.common.save}
                        disabled={pendingId === appt.id}
                      />
                    </li>
                  ) : (
                    <li
                      key={appt.id}
                      className={`flex flex-wrap items-start justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 ${
                        pendingId === appt.id ? "pointer-events-none opacity-60" : ""
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium text-slate-900 dark:text-slate-100">{appt.title}</span>
                          <select
                            value={appt.status}
                            onChange={(e) =>
                              handleStatusChange(appt, e.target.value as AppointmentStatus)
                            }
                            className={`rounded-full border-0 px-2 py-0.5 text-xs font-medium focus:outline-none ${STATUS_BADGE[appt.status]}`}
                          >
                            {(["scheduled", "confirmed", "completed", "cancelled"] as AppointmentStatus[]).map(
                              (s) => (
                                <option key={s} value={s}>
                                  {dict.appointmentStatus[s]}
                                </option>
                              )
                            )}
                          </select>
                        </div>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                          <Link href={`/customers/${appt.customer_id}`} className="hover:underline">
                            {appt.customerName}
                          </Link>{" "}
                          &middot;{" "}
                          {new Date(appt.scheduled_at).toLocaleTimeString(undefined, {
                            hour: "numeric",
                            minute: "2-digit",
                          })}{" "}
                          &middot; {appt.duration_minutes} {dict.appointments.min}
                        </p>
                        {appt.notes && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{appt.notes}</p>}
                      </div>
                      <div className="flex shrink-0 gap-3 text-sm">
                        <button
                          onClick={() => setEditingId(appt.id)}
                          className="font-medium text-brand-700 dark:text-brand-300 hover:underline"
                        >
                          {dict.common.edit}
                        </button>
                        <button
                          onClick={() => handleDelete(appt)}
                          className="font-medium text-red-600 dark:text-red-400 hover:underline"
                        >
                          {dict.common.delete}
                        </button>
                      </div>
                    </li>
                  )
                )}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
