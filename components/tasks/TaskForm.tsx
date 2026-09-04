"use client";

import { useState } from "react";
import type { Project, Task, TaskPriority } from "@/lib/database.types";

export type TaskFormValues = {
  title: string;
  description?: string;
  priority: TaskPriority;
  projectId?: string;
  deadline?: string; // datetime-local string, "" clears it
  estimatedMinutes?: number;
};

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
  projects,
  onSubmit,
  onCancel,
  submitLabel,
  disabled,
}: {
  initialValues?: Task;
  projects: Project[];
  onSubmit: (values: TaskFormValues) => void;
  onCancel?: () => void;
  submitLabel: string;
  disabled?: boolean;
}) {
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [priority, setPriority] = useState<TaskPriority>(initialValues?.priority ?? "medium");
  const [projectId, setProjectId] = useState(initialValues?.project_id ?? "");
  const [deadline, setDeadline] = useState(toDatetimeLocal(initialValues?.deadline ?? null));
  const [estimatedMinutes, setEstimatedMinutes] = useState(
    initialValues?.estimated_minutes != null ? String(initialValues.estimated_minutes) : ""
  );
  const [formError, setFormError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) {
      setFormError("Title is required.");
      return;
    }
    const minutes = estimatedMinutes.trim() ? Number(estimatedMinutes) : undefined;
    if (minutes !== undefined && (!Number.isInteger(minutes) || minutes <= 0)) {
      setFormError("Estimated minutes must be a positive whole number.");
      return;
    }
    setFormError(null);
    onSubmit({
      title: trimmed,
      description: description.trim(),
      priority,
      projectId: projectId || undefined,
      deadline,
      estimatedMinutes: minutes,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-slate-700">Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          required
          autoFocus
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          placeholder="e.g. Draft the Q3 report"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={2000}
          rows={2}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          placeholder="Optional"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700">Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Project</label>
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          >
            <option value="">No project</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Deadline</label>
          <input
            type="datetime-local"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Estimated minutes</label>
          <input
            type="number"
            min={1}
            max={1440}
            value={estimatedMinutes}
            onChange={(e) => setEstimatedMinutes(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
            placeholder="e.g. 30"
          />
        </div>
      </div>

      {formError && <p className="text-sm text-red-600">{formError}</p>}

      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={disabled}
          className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {disabled ? "Saving..." : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
