"use client";

import { useState } from "react";
import type { Customer, Lead, LeadSource, LeadStatus } from "@/lib/database.types";
import { useTranslation } from "@/components/i18n/LanguageProvider";

export type LeadFormValues = {
  contactName: string;
  company?: string;
  email?: string;
  phone?: string;
  source: LeadSource;
  status: LeadStatus;
  value?: number;
  assignedTo?: string;
  notes?: string;
  nextFollowUpAt?: string;
  customerId?: string;
};

const SOURCE_OPTIONS: LeadSource[] = ["website", "referral", "cold_call", "social_media", "event", "other"];
const STATUS_OPTIONS: LeadStatus[] = ["new", "contacted", "qualified", "quoted", "won", "lost"];

function toDatetimeLocal(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(
    d.getMinutes()
  )}`;
}

export function LeadForm({
  initialValues,
  customers,
  defaultStatus,
  onSubmit,
  onCancel,
  submitLabel,
  disabled,
}: {
  initialValues?: Lead;
  customers: Customer[];
  defaultStatus?: LeadStatus;
  onSubmit: (values: LeadFormValues) => void;
  onCancel?: () => void;
  submitLabel: string;
  disabled?: boolean;
}) {
  const { dict } = useTranslation();
  const [contactName, setContactName] = useState(initialValues?.contact_name ?? "");
  const [company, setCompany] = useState(initialValues?.company ?? "");
  const [email, setEmail] = useState(initialValues?.email ?? "");
  const [phone, setPhone] = useState(initialValues?.phone ?? "");
  const [source, setSource] = useState<LeadSource>(initialValues?.source ?? "other");
  const [status, setStatus] = useState<LeadStatus>(initialValues?.status ?? defaultStatus ?? "new");
  const [value, setValue] = useState(initialValues?.value != null ? String(initialValues.value) : "");
  const [assignedTo, setAssignedTo] = useState(initialValues?.assigned_to ?? "");
  const [notes, setNotes] = useState(initialValues?.notes ?? "");
  const [nextFollowUpAt, setNextFollowUpAt] = useState(toDatetimeLocal(initialValues?.next_follow_up_at));
  const [customerId, setCustomerId] = useState(initialValues?.customer_id ?? "");
  const [formError, setFormError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = contactName.trim();
    if (!trimmed) {
      setFormError(dict.leads.contactNameRequired);
      return;
    }
    const parsedValue = value.trim() ? Number(value) : undefined;
    if (parsedValue !== undefined && (Number.isNaN(parsedValue) || parsedValue < 0)) {
      setFormError(dict.leads.valuePositive);
      return;
    }
    setFormError(null);
    onSubmit({
      contactName: trimmed,
      company: company.trim(),
      email: email.trim(),
      phone: phone.trim(),
      source,
      status,
      value: parsedValue,
      assignedTo: assignedTo.trim(),
      notes: notes.trim(),
      nextFollowUpAt,
      customerId: customerId || undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{dict.leads.contactName}</label>
          <input
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            maxLength={200}
            required
            autoFocus
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 text-sm focus:border-brand-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{dict.leads.company}</label>
          <input
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            maxLength={200}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 text-sm focus:border-brand-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{dict.leads.email}</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 text-sm focus:border-brand-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{dict.leads.phone}</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 text-sm focus:border-brand-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{dict.leads.source}</label>
          <select
            value={source}
            onChange={(e) => setSource(e.target.value as LeadSource)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 text-sm focus:border-brand-500 focus:outline-none"
          >
            {SOURCE_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {dict.leadSource[s]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{dict.leads.status}</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as LeadStatus)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 text-sm focus:border-brand-500 focus:outline-none"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {dict.leadStatus[s]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{dict.leads.value}</label>
          <input
            type="number"
            min={0}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 text-sm focus:border-brand-500 focus:outline-none"
            placeholder={dict.common.optional}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{dict.leads.assignedTo}</label>
          <input
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 text-sm focus:border-brand-500 focus:outline-none"
            placeholder={dict.common.optional}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{dict.leads.nextFollowUp}</label>
          <input
            type="datetime-local"
            value={nextFollowUpAt}
            onChange={(e) => setNextFollowUpAt(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 text-sm focus:border-brand-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{dict.leads.linkedCustomer}</label>
          <select
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 text-sm focus:border-brand-500 focus:outline-none"
          >
            <option value="">{dict.common.notLinkedYet}</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{dict.leads.notes}</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
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
