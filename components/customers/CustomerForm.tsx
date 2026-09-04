"use client";

import { useState } from "react";
import type { Customer, CustomerStatus, LeadSource } from "@/lib/database.types";
import { useTranslation } from "@/components/i18n/LanguageProvider";

export type CustomerFormValues = {
  name: string;
  company?: string;
  phone?: string;
  email?: string;
  status: CustomerStatus;
  source: LeadSource;
  tags: string[];
  notes?: string;
};

const STATUS_OPTIONS: CustomerStatus[] = ["prospect", "active", "inactive"];
const SOURCE_OPTIONS: LeadSource[] = ["website", "referral", "cold_call", "social_media", "event", "other"];

export function CustomerForm({
  initialValues,
  onSubmit,
  onCancel,
  submitLabel,
  disabled,
}: {
  initialValues?: Customer;
  onSubmit: (values: CustomerFormValues) => void;
  onCancel?: () => void;
  submitLabel: string;
  disabled?: boolean;
}) {
  const { dict } = useTranslation();
  const [name, setName] = useState(initialValues?.name ?? "");
  const [company, setCompany] = useState(initialValues?.company ?? "");
  const [phone, setPhone] = useState(initialValues?.phone ?? "");
  const [email, setEmail] = useState(initialValues?.email ?? "");
  const [status, setStatus] = useState<CustomerStatus>(initialValues?.status ?? "prospect");
  const [source, setSource] = useState<LeadSource>(initialValues?.source ?? "other");
  const [tagsInput, setTagsInput] = useState((initialValues?.tags ?? []).join(", "));
  const [notes, setNotes] = useState(initialValues?.notes ?? "");
  const [formError, setFormError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setFormError(dict.customerForm.nameRequired);
      return;
    }
    setFormError(null);
    onSubmit({
      name: trimmed,
      company: company.trim(),
      phone: phone.trim(),
      email: email.trim(),
      status,
      source,
      tags: tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      notes: notes.trim(),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{dict.customerForm.name}</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={200}
            required
            autoFocus
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 text-sm focus:border-brand-500 focus:outline-none"
            placeholder={dict.customerForm.namePlaceholder}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{dict.customerForm.company}</label>
          <input
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            maxLength={200}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 text-sm focus:border-brand-500 focus:outline-none"
            placeholder={dict.common.optional}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{dict.customerForm.phone}</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            maxLength={40}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 text-sm focus:border-brand-500 focus:outline-none"
            placeholder={dict.common.optional}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{dict.customerForm.email}</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            maxLength={320}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 text-sm focus:border-brand-500 focus:outline-none"
            placeholder={dict.common.optional}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{dict.customerForm.status}</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as CustomerStatus)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 text-sm focus:border-brand-500 focus:outline-none"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {dict.customerStatus[s]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{dict.customerForm.source}</label>
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
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{dict.customerForm.tags}</label>
        <input
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 text-sm focus:border-brand-500 focus:outline-none"
          placeholder={dict.customerForm.tagsPlaceholder}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{dict.customerForm.notes}</label>
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
