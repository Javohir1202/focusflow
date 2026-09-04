-- FocusFlow initial schema: projects, tasks, ownership + RLS
-- Run via `supabase db push` or paste into the Supabase SQL editor.
-- Idempotent: safe to re-run (uses IF NOT EXISTS / OR REPLACE / drop-then-create for policies).

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists "pgcrypto"; -- gen_random_uuid()

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'task_priority') then
    create type task_priority as enum ('low', 'medium', 'high');
  end if;

  if not exists (select 1 from pg_type where typname = 'task_status') then
    create type task_status as enum ('todo', 'in_progress', 'done');
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- projects
-- ---------------------------------------------------------------------------
create table if not exists public.projects (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  name        text not null check (char_length(name) between 1 and 120),
  description text check (char_length(description) <= 2000),
  color       text not null default '#6366f1' check (color ~ '^#[0-9a-fA-F]{6}$'),
  is_archived boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists projects_user_id_idx on public.projects (user_id);
create index if not exists projects_user_id_archived_idx on public.projects (user_id, is_archived);

-- ---------------------------------------------------------------------------
-- tasks
-- ---------------------------------------------------------------------------
create table if not exists public.tasks (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references auth.users (id) on delete cascade,
  project_id         uuid references public.projects (id) on delete set null,
  title              text not null check (char_length(title) between 1 and 200),
  description        text check (char_length(description) <= 2000),
  priority           task_priority not null default 'medium',
  status             task_status not null default 'todo',
  estimated_minutes  integer check (estimated_minutes is null or estimated_minutes > 0),
  deadline           timestamptz,
  completed_at       timestamptz,
  -- set by AI breakdown/daily-plan features; null for manually-created tasks
  source             text not null default 'manual' check (source in ('manual', 'ai_breakdown', 'ai_daily_plan')),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index if not exists tasks_user_id_idx on public.tasks (user_id);
create index if not exists tasks_user_id_status_idx on public.tasks (user_id, status);
create index if not exists tasks_project_id_idx on public.tasks (project_id);
create index if not exists tasks_user_id_deadline_idx on public.tasks (user_id, deadline);

-- Keep completed_at consistent with status without trusting the client.
create or replace function public.sync_task_completed_at()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'done' and old.status is distinct from 'done' then
    new.completed_at := now();
  elsif new.status <> 'done' then
    new.completed_at := null;
  end if;
  return new;
end;
$$;

drop trigger if exists tasks_sync_completed_at on public.tasks;
create trigger tasks_sync_completed_at
  before update on public.tasks
  for each row
  execute function public.sync_task_completed_at();

-- ---------------------------------------------------------------------------
-- updated_at maintenance (shared trigger)
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
  before update on public.projects
  for each row
  execute function public.set_updated_at();

drop trigger if exists tasks_set_updated_at on public.tasks;
create trigger tasks_set_updated_at
  before update on public.tasks
  for each row
  execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security — every row is owner-scoped to auth.uid()
-- ---------------------------------------------------------------------------
alter table public.projects enable row level security;
alter table public.tasks    enable row level security;

drop policy if exists "projects_select_own" on public.projects;
create policy "projects_select_own" on public.projects
  for select using (auth.uid() = user_id);

drop policy if exists "projects_insert_own" on public.projects;
create policy "projects_insert_own" on public.projects
  for insert with check (auth.uid() = user_id);

drop policy if exists "projects_update_own" on public.projects;
create policy "projects_update_own" on public.projects
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "projects_delete_own" on public.projects;
create policy "projects_delete_own" on public.projects
  for delete using (auth.uid() = user_id);

drop policy if exists "tasks_select_own" on public.tasks;
create policy "tasks_select_own" on public.tasks
  for select using (auth.uid() = user_id);

drop policy if exists "tasks_insert_own" on public.tasks;
create policy "tasks_insert_own" on public.tasks
  for insert with check (auth.uid() = user_id);

drop policy if exists "tasks_update_own" on public.tasks;
create policy "tasks_update_own" on public.tasks
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "tasks_delete_own" on public.tasks;
create policy "tasks_delete_own" on public.tasks
  for delete using (auth.uid() = user_id);

-- A task's project_id (if set) must belong to the same user. RLS alone
-- doesn't enforce cross-table ownership on insert/update, so check it here.
create or replace function public.check_task_project_ownership()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.project_id is not null then
    if not exists (
      select 1 from public.projects
      where id = new.project_id and user_id = new.user_id
    ) then
      raise exception 'project_id does not belong to the task owner';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists tasks_check_project_ownership on public.tasks;
create trigger tasks_check_project_ownership
  before insert or update of project_id, user_id on public.tasks
  for each row
  execute function public.check_task_project_ownership();

-- ---------------------------------------------------------------------------
-- Grants (RLS still applies on top of these — this just allows the role in)
-- ---------------------------------------------------------------------------
grant select, insert, update, delete on public.projects to authenticated;
grant select, insert, update, delete on public.tasks    to authenticated;
