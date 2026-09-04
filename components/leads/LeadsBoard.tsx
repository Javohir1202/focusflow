"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  convertLeadToCustomer,
  createLead,
  deleteLead,
  setLeadStatus,
  updateLead,
} from "@/lib/actions/leads";
import type { Customer, Lead, LeadStatus } from "@/lib/database.types";
import { useTranslation } from "@/components/i18n/LanguageProvider";
import { LeadForm, type LeadFormValues } from "./LeadForm";

const COLUMN_STATUSES: LeadStatus[] = ["new", "contacted", "qualified", "quoted", "won", "lost"];

export function LeadsBoard({
  initialLeads,
  customers,
}: {
  initialLeads: Lead[];
  customers: Customer[];
}) {
  const router = useRouter();
  const { dict } = useTranslation();
  const [leads, setLeads] = useState(initialLeads);
  const [query, setQuery] = useState("");
  const [creatingFor, setCreatingFor] = useState<LeadStatus | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<LeadStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return leads;
    return leads.filter(
      (l) =>
        l.contact_name.toLowerCase().includes(q) ||
        (l.company ?? "").toLowerCase().includes(q) ||
        (l.email ?? "").toLowerCase().includes(q)
    );
  }, [leads, query]);

  const byColumn = useMemo(() => {
    const map = new Map<LeadStatus, Lead[]>();
    for (const status of COLUMN_STATUSES) map.set(status, []);
    for (const lead of filtered) map.get(lead.status)?.push(lead);
    return map;
  }, [filtered]);

  function handleCreate(values: LeadFormValues) {
    setError(null);
    startTransition(async () => {
      // values.status already reflects the form's Status field — it starts
      // out matching the column the "+ Add" button was clicked in
      // (LeadForm's defaultStatus), but the user can change it before
      // submitting, and that choice must win.
      const result = await createLead(values);
      if (result.error || !result.data) {
        setError(result.error ?? dict.leads.failedCreate);
        return;
      }
      setLeads((prev) => [result.data!, ...prev]);
      setCreatingFor(null);
    });
  }

  function handleUpdate(id: string, values: LeadFormValues) {
    setError(null);
    setPendingId(id);
    startTransition(async () => {
      const result = await updateLead({ id, ...values });
      setPendingId(null);
      if (result.error || !result.data) {
        setError(result.error ?? dict.leads.failedUpdate);
        return;
      }
      setLeads((prev) => prev.map((l) => (l.id === id ? result.data! : l)));
      setEditingId(null);
    });
  }

  function handleDelete(lead: Lead) {
    if (!window.confirm(dict.leads.deleteConfirm.replace("{name}", lead.contact_name))) return;
    setError(null);
    setPendingId(lead.id);
    startTransition(async () => {
      const result = await deleteLead(lead.id);
      setPendingId(null);
      if (result.error) {
        setError(result.error);
        return;
      }
      setLeads((prev) => prev.filter((l) => l.id !== lead.id));
    });
  }

  function handleMove(lead: Lead, status: LeadStatus) {
    if (lead.status === status) return;
    setError(null);
    setLeads((prev) => prev.map((l) => (l.id === lead.id ? { ...l, status } : l)));
    startTransition(async () => {
      const result = await setLeadStatus(lead.id, status);
      if (result.error) {
        setError(result.error);
        // revert optimistic move
        setLeads((prev) => prev.map((l) => (l.id === lead.id ? { ...l, status: lead.status } : l)));
      }
    });
  }

  function handleConvert(lead: Lead) {
    setError(null);
    setPendingId(lead.id);
    startTransition(async () => {
      const result = await convertLeadToCustomer(lead.id);
      setPendingId(null);
      if (result.error || !result.data) {
        setError(result.error ?? dict.leads.failedConvert);
        return;
      }
      setLeads((prev) =>
        prev.map((l) => (l.id === lead.id ? { ...l, status: "won", customer_id: result.data!.id } : l))
      );
      router.push(`/customers/${result.data.id}`);
    });
  }

  return (
    <div>
      <div className="mt-8 flex items-center justify-between gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={dict.leads.searchPlaceholder}
          className="w-64 rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 text-sm focus:border-brand-500 focus:outline-none"
        />
      </div>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 dark:bg-red-500/15 p-3 text-sm text-red-700 dark:text-red-400" role="alert">
          {error}
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 overflow-x-auto sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {COLUMN_STATUSES.map((status) => (
          <div
            key={status}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOverColumn(status);
            }}
            onDragLeave={() => setDragOverColumn((cur) => (cur === status ? null : cur))}
            onDrop={(e) => {
              e.preventDefault();
              const leadId = e.dataTransfer.getData("text/lead-id");
              const lead = leads.find((l) => l.id === leadId);
              setDragOverColumn(null);
              if (lead) handleMove(lead, status);
            }}
            className={`flex min-h-[200px] flex-col rounded-xl border bg-slate-50 dark:bg-slate-950 p-3 transition-colors ${
              dragOverColumn === status ? "border-brand-400 bg-brand-50 dark:bg-brand-500/15" : "border-slate-200 dark:border-slate-800"
            }`}
          >
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {dict.leadStatus[status]} <span className="text-slate-400 dark:text-slate-500">({byColumn.get(status)?.length ?? 0})</span>
              </h2>
              <button
                onClick={() => setCreatingFor(creatingFor === status ? null : status)}
                className="text-xs font-semibold text-brand-700 dark:text-brand-300 hover:underline"
              >
                {dict.leads.add}
              </button>
            </div>

            {creatingFor === status && (
              <div className="mb-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3">
                <LeadForm
                  customers={customers}
                  defaultStatus={status}
                  onSubmit={handleCreate}
                  onCancel={() => setCreatingFor(null)}
                  submitLabel={dict.leads.addLead}
                />
              </div>
            )}

            <div className="space-y-2">
              {byColumn.get(status)?.map((lead) =>
                editingId === lead.id ? (
                  <div key={lead.id} className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3">
                    <LeadForm
                      initialValues={lead}
                      customers={customers}
                      onSubmit={(values) => handleUpdate(lead.id, values)}
                      onCancel={() => setEditingId(null)}
                      submitLabel={dict.common.save}
                      disabled={pendingId === lead.id}
                    />
                  </div>
                ) : (
                  <div
                    key={lead.id}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData("text/lead-id", lead.id)}
                    className={`cursor-grab rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-sm ${
                      pendingId === lead.id ? "pointer-events-none opacity-60" : ""
                    }`}
                  >
                    <p className="font-medium text-slate-900 dark:text-slate-100">{lead.contact_name}</p>
                    {lead.company && <p className="text-xs text-slate-500 dark:text-slate-400">{lead.company}</p>}
                    {lead.value != null && (
                      <p className="mt-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">${lead.value.toLocaleString()}</p>
                    )}
                    {lead.next_follow_up_at && (
                      <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                        {dict.leads.followUp} {new Date(lead.next_follow_up_at).toLocaleDateString()}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      <button onClick={() => setEditingId(lead.id)} className="font-medium text-brand-700 dark:text-brand-300 hover:underline">
                        {dict.common.edit}
                      </button>
                      {lead.status === "won" && !lead.customer_id && (
                        <button
                          onClick={() => handleConvert(lead)}
                          className="font-medium text-emerald-700 dark:text-emerald-400 hover:underline"
                        >
                          {dict.leads.convert}
                        </button>
                      )}
                      <button onClick={() => handleDelete(lead)} className="font-medium text-red-600 dark:text-red-400 hover:underline">
                        {dict.common.delete}
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
