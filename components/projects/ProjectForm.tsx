"use client";

import { useState } from "react";
import type { Project } from "@/lib/database.types";

export type ProjectFormValues = {
  name: string;
  description?: string;
  color: string;
};

const COLOR_SWATCHES = ["#6366f1", "#ec4899", "#f59e0b", "#10b981", "#0ea5e9", "#8b5cf6", "#ef4444"];

export function ProjectForm({
  initialValues,
  onSubmit,
  onCancel,
  submitLabel,
  disabled,
}: {
  initialValues?: Pick<Project, "name" | "description" | "color">;
  onSubmit: (values: ProjectFormValues) => void;
  onCancel?: () => void;
  submitLabel: string;
  disabled?: boolean;
}) {
  const [name, setName] = useState(initialValues?.name ?? "");
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [color, setColor] = useState(initialValues?.color ?? COLOR_SWATCHES[0]);
  const [formError, setFormError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setFormError("Name is required.");
      return;
    }
    setFormError(null);
    onSubmit({ name: trimmed, description: description.trim(), color });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-slate-700">Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={120}
          required
          autoFocus
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          placeholder="e.g. Website Redesign"
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

      <div>
        <label className="block text-sm font-medium text-slate-700">Color</label>
        <div className="mt-1 flex gap-2">
          {COLOR_SWATCHES.map((swatch) => (
            <button
              type="button"
              key={swatch}
              onClick={() => setColor(swatch)}
              aria-label={`Use color ${swatch}`}
              className={`h-7 w-7 rounded-full ${
                color === swatch ? "ring-2 ring-offset-2 ring-slate-900" : ""
              }`}
              style={{ backgroundColor: swatch }}
            />
          ))}
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
