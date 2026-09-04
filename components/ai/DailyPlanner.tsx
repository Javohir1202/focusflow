"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { DailyPlanResponse } from "@/lib/schemas";
import type { Project, Task } from "@/lib/database.types";

const PRIORITY_STYLE: Record<string, string> = {
  low: "bg-slate-100 text-slate-600",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-red-100 text-red-700",
};

export function DailyPlanner({
  initialTasks,
  projects,
}: {
  initialTasks: Task[];
  projects: Project[];
}) {
  const projectById = useMemo(() => new Map(projects.map((p) => [p.id, p])), [projects]);

  const plannableTasks = initialTasks.filter((t) => t.estimated_minutes != null);
  const tasksNeedingEstimate = initialTasks.filter((t) => t.estimated_minutes == null);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(plannableTasks.map((t) => t.id))
  );
  const [plan, setPlan] = useState<DailyPlanResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggle(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleGenerate() {
    const selected = plannableTasks.filter((t) => selectedIds.has(t.id));
    if (selected.length === 0) return;

    setLoading(true);
    setError(null);
    setPlan(null);

    const now = new Date();
    const date = now.toISOString().slice(0, 10);
    const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`;

    try {
      const res = await fetch("/api/ai/daily-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          currentTime,
          tasks: selected.map((t) => ({
            id: t.id,
            title: t.title,
            priority: t.priority,
            deadline: t.deadline,
            estimatedMinutes: t.estimated_minutes as number,
            project: t.project_id ? (projectById.get(t.project_id)?.name ?? null) : null,
          })),
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Something went wrong. Please try again.");
      }

      const data: DailyPlanResponse = await res.json();
      setPlan(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  if (initialTasks.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
        <p className="font-medium text-slate-700">No incomplete tasks to schedule</p>
        <p className="mt-1 text-sm text-slate-500">
          <Link href="/tasks" className="font-medium text-brand-700 hover:underline">
            Add a task
          </Link>{" "}
          to build today&apos;s plan from.
        </p>
      </div>
    );
  }

  return (
    <div>
      {plannableTasks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <p className="font-medium text-slate-700">None of your tasks have a time estimate yet</p>
          <p className="mt-1 text-sm text-slate-500">
            Add an estimated duration to a task on the{" "}
            <Link href="/tasks" className="font-medium text-brand-700 hover:underline">
              Tasks
            </Link>{" "}
            page so Claude can schedule it.
          </p>
        </div>
      ) : (
        <>
          <ul className="space-y-2">
            {plannableTasks.map((task) => {
              const project = task.project_id ? projectById.get(task.project_id) : undefined;
              return (
                <li key={task.id}>
                  <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 p-3 hover:border-brand-300">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(task.id)}
                      onChange={() => toggle(task.id)}
                      className="mt-1"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-slate-900">{task.title}</span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${PRIORITY_STYLE[task.priority]}`}
                        >
                          {task.priority}
                        </span>
                        {project && (
                          <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                            <span
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: project.color }}
                            />
                            {project.name}
                          </span>
                        )}
                      </span>
                      <span className="mt-0.5 flex flex-wrap gap-3 text-xs text-slate-500">
                        <span>{task.estimated_minutes} min</span>
                        {task.deadline && <span>Due {new Date(task.deadline).toLocaleString()}</span>}
                      </span>
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>

          {tasksNeedingEstimate.length > 0 && (
            <p className="mt-3 text-xs text-slate-500">
              {tasksNeedingEstimate.length} task{tasksNeedingEstimate.length === 1 ? "" : "s"} not shown
              here {tasksNeedingEstimate.length === 1 ? "has" : "have"} no time estimate yet — add one on
              the{" "}
              <Link href="/tasks" className="font-medium text-brand-700 hover:underline">
                Tasks
              </Link>{" "}
              page to include it.
            </p>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading || selectedIds.size === 0}
            className="mt-5 rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {loading ? "Planning..." : "Generate today's plan"}
          </button>
        </>
      )}

      {error && (
        <div className="mt-6 rounded-lg bg-red-50 p-4 text-sm text-red-700" role="alert">
          {error}{" "}
          <button className="underline" onClick={() => setError(null)}>
            Dismiss
          </button>
        </div>
      )}

      {plan && (
        <ol className="mt-8 space-y-3 border-l-2 border-brand-200 pl-4">
          {plan.plan.map((slot, i) => (
            <li key={i} className="relative">
              <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-brand-600" />
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="text-sm font-semibold text-slate-900">
                  {slot.start}–{slot.end}
                </span>
                <span className="font-medium text-slate-900">{slot.task}</span>
              </div>
              <p className="text-sm text-slate-600">{slot.reason}</p>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
