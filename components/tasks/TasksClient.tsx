"use client";

import { useMemo, useState, useTransition } from "react";
import { createTask, deleteTask, setTaskStatus, updateTask } from "@/lib/actions/tasks";
import type { Customer, Job, Task, TaskStatus } from "@/lib/database.types";
import { useTranslation } from "@/components/i18n/LanguageProvider";
import type { Dictionary } from "@/lib/i18n/translations";
import { TaskForm, type TaskFormValues } from "./TaskForm";

const STATUS_ORDER: TaskStatus[] = ["todo", "in_progress", "done"];

const PRIORITY_STYLE: Record<string, string> = {
  low: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400",
  medium: "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400",
  high: "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400",
};

const PRIORITY_KEY = {
  low: "priorityLow",
  medium: "priorityMedium",
  high: "priorityHigh",
} as const;

export function TasksClient({
  initialTasks,
  jobs,
  customers,
  initialJobFilter,
}: {
  initialTasks: Task[];
  jobs: Job[];
  customers: Customer[];
  initialJobFilter: string;
}) {
  const { dict } = useTranslation();
  const [tasks, setTasks] = useState(initialTasks);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");
  const [jobFilter, setJobFilter] = useState<string>(initialJobFilter);

  const jobById = useMemo(() => new Map(jobs.map((j) => [j.id, j])), [jobs]);

  const filteredTasks = tasks.filter((task) => {
    if (statusFilter !== "all" && task.status !== statusFilter) return false;
    if (jobFilter === "all") return true;
    if (jobFilter === "unassigned") return !task.job_id;
    return task.job_id === jobFilter;
  });

  function handleCreate(values: TaskFormValues) {
    setError(null);
    setCreating(true);
    startTransition(async () => {
      const result = await createTask(values);
      setCreating(false);
      if (result.error || !result.data) {
        setError(result.error ?? dict.tasks.failedCreate);
        return;
      }
      setTasks((prev) => [result.data!, ...prev]);
      setShowCreateForm(false);
    });
  }

  function handleUpdate(id: string, values: TaskFormValues) {
    setError(null);
    setPendingId(id);
    startTransition(async () => {
      const result = await updateTask({
        id,
        title: values.title,
        description: values.description ?? null,
        priority: values.priority,
        jobId: values.jobId ?? null,
        customerId: values.customerId ?? null,
        assignee: values.assignee ?? null,
        deadline: values.deadline ?? null,
        estimatedMinutes: values.estimatedMinutes ?? null,
      });
      setPendingId(null);
      if (result.error || !result.data) {
        setError(result.error ?? dict.tasks.failedUpdate);
        return;
      }
      setTasks((prev) => prev.map((t) => (t.id === id ? result.data! : t)));
      setEditingId(null);
    });
  }

  function handleCycleStatus(task: Task) {
    const nextIndex = (STATUS_ORDER.indexOf(task.status) + 1) % STATUS_ORDER.length;
    setError(null);
    setPendingId(task.id);
    startTransition(async () => {
      const result = await setTaskStatus(task.id, STATUS_ORDER[nextIndex]);
      setPendingId(null);
      if (result.error || !result.data) {
        setError(result.error ?? dict.tasks.failedStatus);
        return;
      }
      setTasks((prev) => prev.map((t) => (t.id === task.id ? result.data! : t)));
    });
  }

  function handleDelete(task: Task) {
    if (!window.confirm(dict.tasks.deleteConfirm.replace("{name}", task.title))) return;
    setError(null);
    setPendingId(task.id);
    startTransition(async () => {
      const result = await deleteTask(task.id);
      setPendingId(null);
      if (result.error) {
        setError(result.error);
        return;
      }
      setTasks((prev) => prev.filter((t) => t.id !== task.id));
    });
  }

  return (
    <div>
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <button
          onClick={() => setShowCreateForm((v) => !v)}
          className="rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          {showCreateForm ? dict.common.cancel : dict.tasks.newTask}
        </button>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as TaskStatus | "all")}
          className="rounded-full border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 text-sm"
        >
          <option value="all">{dict.common.allStatuses}</option>
          <option value="todo">{dict.taskStatus.todo}</option>
          <option value="in_progress">{dict.taskStatus.in_progress}</option>
          <option value="done">{dict.taskStatus.done}</option>
        </select>

        <select
          value={jobFilter}
          onChange={(e) => setJobFilter(e.target.value)}
          className="rounded-full border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 text-sm"
        >
          <option value="all">{dict.common.allJobs}</option>
          <option value="unassigned">{dict.common.unassigned}</option>
          {jobs.map((j) => (
            <option key={j.id} value={j.id}>
              {j.title}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 dark:bg-red-500/15 p-3 text-sm text-red-700 dark:text-red-400" role="alert">
          {error}
        </div>
      )}

      {showCreateForm && (
        <div className="mt-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
          <TaskForm
            jobs={jobs}
            customers={customers}
            onSubmit={handleCreate}
            submitLabel={dict.tasks.createTask}
            disabled={creating}
          />
        </div>
      )}

      {tasks.length === 0 && !showCreateForm ? (
        <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-slate-50 dark:bg-slate-950 p-10 text-center">
          <p className="font-medium text-slate-700 dark:text-slate-300">{dict.tasks.emptyNoneTitle}</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{dict.tasks.emptyNoneSubtitle}</p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-slate-50 dark:bg-slate-950 p-10 text-center">
          <p className="font-medium text-slate-700 dark:text-slate-300">{dict.tasks.emptyFilteredTitle}</p>
          <button
            onClick={() => {
              setStatusFilter("all");
              setJobFilter("all");
            }}
            className="mt-2 text-sm font-medium text-brand-700 dark:text-brand-300 hover:underline"
          >
            {dict.tasks.clearFilters}
          </button>
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {filteredTasks.map((task) =>
            editingId === task.id ? (
              <li key={task.id} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
                <TaskForm
                  initialValues={task}
                  jobs={jobs}
                  customers={customers}
                  onSubmit={(values) => handleUpdate(task.id, values)}
                  onCancel={() => setEditingId(null)}
                  submitLabel={dict.common.save}
                  disabled={pendingId === task.id}
                />
              </li>
            ) : (
              <TaskRow
                key={task.id}
                task={task}
                job={task.job_id ? jobById.get(task.job_id) : undefined}
                pending={pendingId === task.id}
                dict={dict}
                onCycleStatus={() => handleCycleStatus(task)}
                onEdit={() => setEditingId(task.id)}
                onDelete={() => handleDelete(task)}
              />
            )
          )}
        </ul>
      )}
    </div>
  );
}

function TaskRow({
  task,
  job,
  pending,
  dict,
  onCycleStatus,
  onEdit,
  onDelete,
}: {
  task: Task;
  job?: Job;
  pending: boolean;
  dict: Dictionary;
  onCycleStatus: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const overdue =
    task.status !== "done" && task.deadline !== null && new Date(task.deadline) < new Date();

  return (
    <li
      className={`flex items-start gap-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 ${
        pending ? "pointer-events-none opacity-70" : ""
      }`}
    >
      <button
        onClick={onCycleStatus}
        title={`${dict.taskStatus[task.status]}`}
        className={`mt-0.5 h-5 w-5 shrink-0 rounded-full border-2 ${
          task.status === "done"
            ? "border-brand-600 bg-brand-600"
            : task.status === "in_progress"
              ? "border-brand-500 bg-brand-100"
              : "border-slate-300"
        }`}
      />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`font-medium text-slate-900 dark:text-slate-100 ${task.status === "done" ? "line-through text-slate-400 dark:text-slate-500" : ""}`}
          >
            {task.title}
          </span>
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${PRIORITY_STYLE[task.priority]}`}>
            {dict.common[PRIORITY_KEY[task.priority]]}
          </span>
          {job && (
            <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-600 dark:text-slate-400">
              {job.title}
            </span>
          )}
          {task.assignee && (
            <span className="rounded-full bg-brand-50 dark:bg-brand-500/15 px-2 py-0.5 text-xs font-medium text-brand-700 dark:text-brand-300">
              {task.assignee}
            </span>
          )}
          {overdue && (
            <span className="rounded-full bg-red-100 dark:bg-red-500/20 px-2 py-0.5 text-xs font-medium text-red-700 dark:text-red-400">
              {dict.tasks.overdue}
            </span>
          )}
        </div>

        {task.description && <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{task.description}</p>}

        <div className="mt-1 flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400">
          {task.deadline && <span>{dict.tasks.due} {new Date(task.deadline).toLocaleString()}</span>}
          {task.estimated_minutes && <span>{task.estimated_minutes} min</span>}
        </div>
      </div>

      <div className="flex shrink-0 gap-3 text-sm">
        <button onClick={onEdit} className="font-medium text-brand-700 dark:text-brand-300 hover:underline">
          {dict.common.edit}
        </button>
        <button onClick={onDelete} className="font-medium text-red-600 dark:text-red-400 hover:underline">
          {dict.common.delete}
        </button>
      </div>
    </li>
  );
}
