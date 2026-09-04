"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { createCustomer, deleteCustomer, updateCustomer } from "@/lib/actions/customers";
import type { Customer, CustomerStatus } from "@/lib/database.types";
import { useTranslation } from "@/components/i18n/LanguageProvider";
import { CustomerForm, type CustomerFormValues } from "./CustomerForm";

const STATUS_BADGE: Record<CustomerStatus, string> = {
  prospect: "bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400",
  active: "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  inactive: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400",
};

export function CustomersClient({ initialCustomers }: { initialCustomers: Customer[] }) {
  const { dict } = useTranslation();
  const [customers, setCustomers] = useState(initialCustomers);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | CustomerStatus>("all");
  const [, startTransition] = useTransition();

  const filtered = useMemo(() => {
    return customers.filter((c) => {
      if (statusFilter !== "all" && c.status !== statusFilter) return false;
      if (!query.trim()) return true;
      const q = query.trim().toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        (c.company ?? "").toLowerCase().includes(q) ||
        (c.email ?? "").toLowerCase().includes(q)
      );
    });
  }, [customers, query, statusFilter]);

  function handleCreate(values: CustomerFormValues) {
    setError(null);
    setCreating(true);
    startTransition(async () => {
      const result = await createCustomer(values);
      setCreating(false);
      if (result.error || !result.data) {
        setError(result.error ?? dict.customers.failedCreate);
        return;
      }
      setCustomers((prev) => [result.data!, ...prev]);
      setShowCreateForm(false);
    });
  }

  function handleUpdate(id: string, values: CustomerFormValues) {
    setError(null);
    setPendingId(id);
    startTransition(async () => {
      const result = await updateCustomer({ id, ...values });
      setPendingId(null);
      if (result.error || !result.data) {
        setError(result.error ?? dict.customers.failedUpdate);
        return;
      }
      setCustomers((prev) => prev.map((c) => (c.id === id ? result.data! : c)));
      setEditingId(null);
    });
  }

  function handleDelete(customer: Customer) {
    if (!window.confirm(dict.customers.deleteConfirm.replace("{name}", customer.name))) return;
    setError(null);
    setPendingId(customer.id);
    startTransition(async () => {
      const result = await deleteCustomer(customer.id);
      setPendingId(null);
      if (result.error) {
        setError(result.error);
        return;
      }
      setCustomers((prev) => prev.filter((c) => c.id !== customer.id));
    });
  }

  return (
    <div>
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={dict.customers.searchPlaceholder}
            className="w-56 rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 text-sm focus:border-brand-500 focus:outline-none"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 text-sm focus:border-brand-500 focus:outline-none"
          >
            <option value="all">{dict.common.allStatuses}</option>
            {(Object.keys(dict.customerStatus) as CustomerStatus[]).map((s) => (
              <option key={s} value={s}>
                {dict.customerStatus[s]}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={() => setShowCreateForm((v) => !v)}
          className="rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          {showCreateForm ? dict.common.cancel : dict.customers.newCustomer}
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 dark:bg-red-500/15 p-3 text-sm text-red-700 dark:text-red-400" role="alert">
          {error}
        </div>
      )}

      {showCreateForm && (
        <div className="mt-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
          <CustomerForm onSubmit={handleCreate} submitLabel={dict.customers.createCustomer} disabled={creating} />
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-slate-50 dark:bg-slate-950 p-10 text-center">
          <p className="font-medium text-slate-700 dark:text-slate-300">
            {customers.length === 0 ? dict.customers.emptyNoneTitle : dict.customers.emptyFilteredTitle}
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {customers.length === 0 ? dict.customers.emptyNoneSubtitle : dict.customers.emptyFilteredSubtitle}
          </p>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-sm">
            <thead className="bg-slate-50 dark:bg-slate-950 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">{dict.customers.colName}</th>
                <th className="px-4 py-3">{dict.customers.colCompany}</th>
                <th className="px-4 py-3">{dict.customers.colContact}</th>
                <th className="px-4 py-3">{dict.customers.colStatus}</th>
                <th className="px-4 py-3">{dict.customers.colTags}</th>
                <th className="px-4 py-3 text-right">{dict.customers.colActions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((customer) =>
                editingId === customer.id ? (
                  <tr key={customer.id}>
                    <td colSpan={6} className="px-4 py-4">
                      <CustomerForm
                        initialValues={customer}
                        onSubmit={(values) => handleUpdate(customer.id, values)}
                        onCancel={() => setEditingId(null)}
                        submitLabel={dict.common.save}
                        disabled={pendingId === customer.id}
                      />
                    </td>
                  </tr>
                ) : (
                  <tr
                    key={customer.id}
                    className={pendingId === customer.id ? "pointer-events-none opacity-60" : ""}
                  >
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                      <Link href={`/customers/${customer.id}`} className="hover:underline">
                        {customer.name}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600 dark:text-slate-400">{customer.company || dict.common.dash}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600 dark:text-slate-400">
                      <div>{customer.email || dict.common.dash}</div>
                      <div className="text-xs text-slate-400 dark:text-slate-500">{customer.phone || ""}</div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[customer.status]}`}
                      >
                        {dict.customerStatus[customer.status]}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-500 dark:text-slate-400">
                      {customer.tags.length > 0 ? customer.tags.join(", ") : dict.common.dash}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="flex justify-end gap-3 text-sm">
                        <button
                          onClick={() => setEditingId(customer.id)}
                          className="font-medium text-brand-700 dark:text-brand-300 hover:underline"
                        >
                          {dict.common.edit}
                        </button>
                        <button
                          onClick={() => handleDelete(customer)}
                          className="font-medium text-red-600 dark:text-red-400 hover:underline"
                        >
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
