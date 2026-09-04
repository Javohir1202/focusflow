"use client";

import { useMemo, useState, useTransition } from "react";
import { createTask, deleteTask, setTaskStatus, updateTask } from "@/lib/actions/tasks";
import type { Project, Task, TaskStatus } from "@/lib/database.types";
import { TaskForm, type TaskFormValues } from "./TaskForm";

const STATUS_LABEL: Record<TaskStatus, string> = {
  todo: "To do",
  in_progress: "In progress",
  done: "Done",
};

const STATUS_ORDER: TaskStatus[] = ["todo", "in_progress", "done"];

const PRIORITY_STYLE: Record<string, string> = {
  low: "bg-slate-100 text-slate-600",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-red-100 text-red-700",
};

export function TasksClient({
  initialTasks,
  projects,
  initialProjectFilter,
}: {
  initialTasks: Task[];
  projects: Project[];
  initialProjectFilter: string;
}) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");
  const [projectFilter, setProjectFilter] = useState<string>(initialProjectFilter);

  const projectById = useMemo(() => new Map(projects.map((p) => [p.id, p])), [projects]);

  const filteredTasks = initialTasks.filter((task) => {
    if (statusFilter !== "all" && task.status !== statusFilter) return false;
    if (projectFilter === "all") return true;
    if (projectFilter === "unassigned") return !task.project_id;
    return task.project_id === projectFilter;
  });

  function handleCreate(values: TaskFormValues) {
    setError(null);
    setCreating(true);
    startTransition(async () => {
      const result = await createTask(values);
      setCreating(false);
      if (result.error) {
        setError(result.error);
        return;
      }
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
        projectId: values.projectId ?? null,
        deadline: values.deadline ?? null,
        estimatedMinutes: values.estimatedMinutes ?? null,
      });
      setPendingId(null);
      if (result.error) {
        setError(result.error);
        return;
      }
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
      if (result.error) setError(result.error);
    });
  }

  function handleDelete(task: Task) {
    if (!window.confirm(`Delete "${task.title}"? This can't be undone.`)) return;
    setError(null);
    setPendingId(task.id);
    startTransition(async () => {
      const result = await deleteTask(task.id);
      setPendingId(null);
      if (result.error) setError(result.error);
    });
  }

  return (
    <div>
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <button
          onClick={() => setShowCreateForm((v) => !v)}
          className="rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          {showCreateForm ? "Cancel" : "+ New task"}
        </button>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as TaskStatus | "all")}
          className="rounded-full border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="all">All statuses</option>
          <option value="todo">To do</option>
          <option value="in_progress">In progress</option>
          <option value="done">Done</option>
        </select>

        <select
          value={projectFilter}
          onChange={(e) => setProjectFilter(e.target.value)}
          className="rounded-full border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="all">All projects</option>
          <option value="unassigned">No project</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">
          {error}
        </div>
      )}

      {showCreateForm && (
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-5">
          <TaskForm
            projects={projects}
            onSubmit={handleCreate}
            submitLabel="Create task"
            disabled={creating}
          />
        </div>
      )}

      {initialTasks.length === 0 && !showCreateForm ? (
        <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
          <p className="font-medium text-slate-700">No tasks yet</p>
          <p className="mt-1 text-sm text-slate-500">Create your first task to get started.</p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
          <p className="font-medium text-slate-700">No tasks match these filters</p>
          <button
            onClick={() => {
              setStatusFilter("all");
              setProjectFilter("all");
            }}
            className="mt-2 text-sm font-medium text-brand-700 hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {filteredTasks.map((task) =>
            editingId === task.id ? (
              <li key={task.id} className="rounded-xl border border-slate-200 bg-white p-5">
                <TaskForm
                  initialValues={task}
                  projects={projects}
                  onSubmit={(values) => handleUpdate(task.id, values)}
                  onCancel={() => setEditingId(null)}
                  submitLabel="Save"
                  disabled={pendingId === task.id}
                />
              </li>
            ) : (
              <TaskRow
                key={task.id}
                task={task}
                project={task.project_id ? projectById.get(task.project_id) : undefined}
                pending={pendingId === task.id}
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
  project,
  pending,
  onCycleStatus,
  onEdit,
  onDelete,
}: {
  task: Task;
  project?: Project;
  pending: boolean;
  onCycleStatus: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const overdue =
    task.status !== "done" && task.deadline !== null && new Date(task.deadline) < new Date();

  return (
    <li
      className={`flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-4 ${
        pending ? "pointer-events-none opacity-70" : ""
      }`}
    >
      <button
        onClick={onCycleStatus}
        title={`Status: ${STATUS_LABEL[task.status]} (click to advance)`}
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
            className={`font-medium text-slate-900 ${task.status === "done" ? "line-through text-slate-400" : ""}`}
          >
            {task.title}
          </span>
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${PRIORITY_STYLE[task.priority]}`}>
            {task.priority}
          </span>
          {project && (
            <span
              className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600"
            >
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: project.color }} />
              {project.name}
            </span>
          )}
          {overdue && (
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
              Overdue
            </span>
          )}
        </div>

        {task.description && <p className="mt-1 text-sm text-slate-600">{task.description}</p>}

        <div className="mt-1 flex flex-wrap gap-3 text-xs text-slate-500">
          {task.deadline && <span>Due {new Date(task.deadline).toLocaleString()}</span>}
          {task.estimated_minutes && <span>{task.estimated_minutes} min</span>}
        </div>
      </div>

      <div className="flex shrink-0 gap-3 text-sm">
        <button onClick={onEdit} className="font-medium text-brand-700 hover:underline">
          Edit
        </button>
        <button onClick={onDelete} className="font-medium text-red-600 hover:underline">
          Delete
        </button>
      </div>
    </li>
  );
}
