"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  createProject,
  deleteProject,
  setProjectArchived,
  updateProject,
} from "@/lib/actions/projects";
import type { Project } from "@/lib/database.types";
import { ProjectForm, type ProjectFormValues } from "./ProjectForm";

type ProjectWithCounts = Project & { taskCount: number; openTaskCount: number };

export function ProjectsClient({ initialProjects }: { initialProjects: ProjectWithCounts[] }) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const active = initialProjects.filter((p) => !p.is_archived);
  const archived = initialProjects.filter((p) => p.is_archived);

  function handleCreate(values: ProjectFormValues) {
    setError(null);
    setCreating(true);
    startTransition(async () => {
      const result = await createProject(values);
      setCreating(false);
      if (result.error) {
        setError(result.error);
        return;
      }
      setShowCreateForm(false);
    });
  }

  function handleUpdate(id: string, values: ProjectFormValues) {
    setError(null);
    setPendingId(id);
    startTransition(async () => {
      const result = await updateProject({ id, ...values });
      setPendingId(null);
      if (result.error) {
        setError(result.error);
        return;
      }
      setEditingId(null);
    });
  }

  function handleToggleArchive(project: ProjectWithCounts) {
    setError(null);
    setPendingId(project.id);
    startTransition(async () => {
      const result = await setProjectArchived(project.id, !project.is_archived);
      setPendingId(null);
      if (result.error) setError(result.error);
    });
  }

  function handleDelete(project: ProjectWithCounts) {
    if (
      !window.confirm(
        project.taskCount > 0
          ? `Delete "${project.name}"? Its ${project.taskCount} task(s) will be kept but unassigned.`
          : `Delete "${project.name}"?`
      )
    ) {
      return;
    }
    setError(null);
    setPendingId(project.id);
    startTransition(async () => {
      const result = await deleteProject(project.id);
      setPendingId(null);
      if (result.error) setError(result.error);
    });
  }

  return (
    <div>
      <div className="mt-8 flex items-center justify-between">
        <button
          onClick={() => setShowCreateForm((v) => !v)}
          className="rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          {showCreateForm ? "Cancel" : "+ New project"}
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">
          {error}
        </div>
      )}

      {showCreateForm && (
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-5">
          <ProjectForm onSubmit={handleCreate} submitLabel="Create project" disabled={creating} />
        </div>
      )}

      {initialProjects.length === 0 && !showCreateForm ? (
        <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
          <p className="font-medium text-slate-700">No projects yet</p>
          <p className="mt-1 text-sm text-slate-500">
            Create a project to start grouping related tasks together.
          </p>
        </div>
      ) : (
        <div className="mt-8 space-y-8">
          <section>
            <div className="grid gap-4 sm:grid-cols-2">
              {active.map((project) =>
                editingId === project.id ? (
                  <div key={project.id} className="rounded-xl border border-slate-200 bg-white p-5">
                    <ProjectForm
                      initialValues={project}
                      onSubmit={(values) => handleUpdate(project.id, values)}
                      onCancel={() => setEditingId(null)}
                      submitLabel="Save"
                      disabled={pendingId === project.id}
                    />
                  </div>
                ) : (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    pending={pendingId === project.id}
                    onEdit={() => setEditingId(project.id)}
                    onArchive={() => handleToggleArchive(project)}
                    onDelete={() => handleDelete(project)}
                  />
                )
              )}
            </div>
          </section>

          {archived.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Archived
              </h2>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                {archived.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    pending={pendingId === project.id}
                    onEdit={() => setEditingId(project.id)}
                    onArchive={() => handleToggleArchive(project)}
                    onDelete={() => handleDelete(project)}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function ProjectCard({
  project,
  pending,
  onEdit,
  onArchive,
  onDelete,
}: {
  project: ProjectWithCounts;
  pending: boolean;
  onEdit: () => void;
  onArchive: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white p-5 ${
        project.is_archived ? "opacity-60" : ""
      } ${pending ? "pointer-events-none opacity-70" : ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            className="h-3 w-3 shrink-0 rounded-full"
            style={{ backgroundColor: project.color }}
            aria-hidden
          />
          <Link href={`/tasks?project=${project.id}`} className="font-semibold text-slate-900 hover:underline">
            {project.name}
          </Link>
        </div>
      </div>

      {project.description && (
        <p className="mt-2 text-sm text-slate-600 line-clamp-2">{project.description}</p>
      )}

      <p className="mt-3 text-xs font-medium text-slate-500">
        {project.taskCount === 0
          ? "No tasks yet"
          : `${project.openTaskCount} open · ${project.taskCount} total`}
      </p>

      <div className="mt-4 flex gap-3 text-sm">
        <button onClick={onEdit} className="font-medium text-brand-700 hover:underline">
          Edit
        </button>
        <button onClick={onArchive} className="font-medium text-slate-600 hover:underline">
          {project.is_archived ? "Unarchive" : "Archive"}
        </button>
        <button onClick={onDelete} className="font-medium text-red-600 hover:underline">
          Delete
        </button>
      </div>
    </div>
  );
}
