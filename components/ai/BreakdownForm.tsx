"use client";

import { useState } from "react";
import type { BreakdownResponse } from "@/lib/schemas";

export function BreakdownForm() {
  const [task, setTask] = useState("");
  const [result, setResult] = useState<BreakdownResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleBreakdown(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/ai/breakdown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Something went wrong. Please try again.");
      }

      const data: BreakdownResponse = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <form onSubmit={handleBreakdown} className="flex gap-3">
        <input
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="e.g. Build an e-commerce website"
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
          required
          minLength={3}
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-brand-600 px-5 py-2 font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {loading ? "Thinking..." : "Break it down"}
        </button>
      </form>

      {error && (
        <div className="mt-6 rounded-lg bg-red-50 p-4 text-sm text-red-700" role="alert">
          {error}{" "}
          <button className="underline" onClick={() => setError(null)}>
            Try again
          </button>
        </div>
      )}

      {result && (
        <ul className="mt-8 space-y-4">
          {result.tasks.map((t, i) => (
            <li key={i} className="rounded-lg border border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">{t.title}</h3>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                  {t.priority} · {t.estimated_minutes} min
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-600">{t.description}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
