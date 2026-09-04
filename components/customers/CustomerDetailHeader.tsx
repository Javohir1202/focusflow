"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteCustomer, updateCustomer } from "@/lib/actions/customers";
import type { Customer, CustomerStatus } from "@/lib/database.types";
import { useTranslation } from "@/components/i18n/LanguageProvider";
import { CustomerForm, type CustomerFormValues } from "./CustomerForm";

const STATUS_BADGE: Record<CustomerStatus, string> = {
  prospect: "bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400",
  active: "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  inactive: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400",
};

export function CustomerDetailHeader({ customer: initial }: { customer: Customer }) {
  const router = useRouter();
  const { dict } = useTranslation();
  const [customer, setCustomer] = useState(initial);
  const [editing, setEditing] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function handleUpdate(values: CustomerFormValues) {
    setError(null);
    setPending(true);
    startTransition(async () => {
      const result = await updateCustomer({ id: customer.id, ...values });
      setPending(false);
      if (result.error || !result.data) {
        setError(result.error ?? dict.customers.failedUpdate);
        return;
      }
      setCustomer(result.data);
      setEditing(false);
    });
  }

  function handleDelete() {
    if (!window.confirm(dict.customers.deleteConfirm.replace("{name}", customer.name))) return;
    setError(null);
    setPending(true);
    startTransition(async () => {
      const result = await deleteCustomer(customer.id);
      setPending(false);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.push("/customers");
      router.refresh();
    });
  }

  if (editing) {
    return (
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
        {error && <p className="mb-3 text-sm text-red-600 dark:text-red-400">{error}</p>}
        <CustomerForm
          initialValues={customer}
          onSubmit={handleUpdate}
          onCancel={() => setEditing(false)}
          submitLabel={dict.common.save}
          disabled={pending}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="break-words text-2xl font-bold text-slate-900 dark:text-slate-100">{customer.name}</h1>
          <span
            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[customer.status]}`}
          >
            {dict.customerStatus[customer.status]}
          </span>
        </div>
        <p className="mt-1 text-slate-600 dark:text-slate-400">{customer.company || dict.customerDetail.noCompanyOnFile}</p>
        <p className="mt-1 break-words text-sm text-slate-500 dark:text-slate-400">
          {customer.email || dict.customerDetail.noEmail} {customer.phone ? `· ${customer.phone}` : ""}
        </p>
        {customer.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {customer.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs text-slate-600 dark:text-slate-400">
                {tag}
              </span>
            ))}
          </div>
        )}
        {customer.notes && <p className="mt-3 max-w-2xl text-sm text-slate-600 dark:text-slate-400">{customer.notes}</p>}
        {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
      </div>
      <div className="flex gap-3 text-sm">
        <button onClick={() => setEditing(true)} className="font-medium text-brand-700 dark:text-brand-300 hover:underline">
          {dict.common.edit}
        </button>
        <button
          onClick={handleDelete}
          disabled={pending}
          className="font-medium text-red-600 dark:text-red-400 hover:underline disabled:opacity-60"
        >
          {dict.common.delete}
        </button>
      </div>
    </div>
  );
}
