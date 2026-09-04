-- ServiceFlow pivot: customers, leads, jobs, tasks, appointments, activity_log.
-- Supersedes the FocusFlow "projects" concept (renamed to "jobs") and drops
-- the AI-only `source` column on tasks. This is a portfolio project with no
-- production data, so this migration rebuilds the schema cleanly rather than
-- carrying forward FocusFlow-specific compatibility shims.
-- Run via `supabase db push` or paste into the Supabase SQL editor.
-- Idempotent: safe to re-run (uses IF NOT EXISTS / OR REPLACE / drop-then-create for policies).

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists "pgcrypto"; -- gen_random_uuid()

-- ---------------------------------------------------------------------------
-- Drop the old FocusFlow tables (projects/tasks) and their policies/triggers.
-- Their functionality is superseded below (projects -> jobs, tasks rebuilt).
-- ---------------------------------------------------------------------------
drop trigger if exists tasks_check_project_ownership on public.tasks;
drop trigger if exists tasks_sync_completed_at on public.tasks;
drop trigger if exists tasks_set_updated_at on public.tasks;
drop trigger if exists projects_set_updated_at on public.projects;
drop function if exists public.check_task_project_ownership();
drop table if exists public.tasks;
drop table if exists public.projects;

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

  if not exists (select 1 from pg_type where typname = 'customer_status') then
    create type customer_status as enum ('prospect', 'active', 'inactive');
  end if;

  if not exists (select 1 from pg_type where typname = 'lead_source') then
    create type lead_source as enum ('website', 'referral', 'cold_call', 'social_media', 'event', 'other');
  end if;

  if not exists (select 1 from pg_type where typname = 'lead_status') then
    create type lead_status as enum ('new', 'contacted', 'qualified', 'quoted', 'won', 'lost');
  end if;

  if not exists (select 1 from pg_type where typname = 'job_status') then
    create type job_status as enum ('new', 'scheduled', 'in_progress', 'on_hold', 'completed', 'cancelled');
  end if;

  if not exists (select 1 from pg_type where typname = 'appointment_status') then
    create type appointment_status as enum ('scheduled', 'confirmed', 'completed', 'cancelled');
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- Shared trigger functions
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

-- Append-only activity feed. Called from per-table triggers below rather
-- than from application code, so every write path (including future ones)
-- is logged automatically and deterministically — no AI involved.
create or replace function public.log_activity(
  p_user_id uuid,
  p_entity_type text,
  p_entity_id uuid,
  p_action text,
  p_description text
) returns void
language plpgsql
as $$
begin
  insert into public.activity_log (user_id, entity_type, entity_id, action, description)
  values (p_user_id, p_entity_type, p_entity_id, p_action, p_description);
end;
$$;

-- ---------------------------------------------------------------------------
-- customers
-- ---------------------------------------------------------------------------
create table if not exists public.customers (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  name        text not null check (char_length(name) between 1 and 200),
  company     text check (char_length(company) <= 200),
  phone       text check (char_length(phone) <= 40),
  email       text check (char_length(email) <= 320),
  status      customer_status not null default 'prospect',
  source      lead_source not null default 'other',
  tags        text[] not null default '{}',
  notes       text check (char_length(notes) <= 4000),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists customers_user_id_idx on public.customers (user_id);
create index if not exists customers_user_id_status_idx on public.customers (user_id, status);

drop trigger if exists customers_set_updated_at on public.customers;
create trigger customers_set_updated_at
  before update on public.customers
  for each row execute function public.set_updated_at();

create or replace function public.log_customer_activity()
returns trigger
language plpgsql
as $$
begin
  if TG_OP = 'INSERT' then
    perform public.log_activity(new.user_id, 'customer', new.id, 'created', new.name || ' was added as a customer');
  elsif TG_OP = 'UPDATE' and old.status is distinct from new.status then
    perform public.log_activity(new.user_id, 'customer', new.id, 'status_changed', new.name || ' status changed to ' || new.status);
  end if;
  return new;
end;
$$;

drop trigger if exists customers_log_activity on public.customers;
create trigger customers_log_activity
  after insert or update on public.customers
  for each row execute function public.log_customer_activity();

-- ---------------------------------------------------------------------------
-- leads
-- ---------------------------------------------------------------------------
create table if not exists public.leads (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users (id) on delete cascade,
  customer_id       uuid references public.customers (id) on delete set null,
  contact_name      text not null check (char_length(contact_name) between 1 and 200),
  company           text check (char_length(company) <= 200),
  email             text check (char_length(email) <= 320),
  phone             text check (char_length(phone) <= 40),
  source            lead_source not null default 'other',
  status            lead_status not null default 'new',
  value             numeric(12, 2) check (value is null or value >= 0),
  assigned_to       text check (char_length(assigned_to) <= 120),
  notes             text check (char_length(notes) <= 4000),
  next_follow_up_at timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists leads_user_id_idx on public.leads (user_id);
create index if not exists leads_user_id_status_idx on public.leads (user_id, status);
create index if not exists leads_customer_id_idx on public.leads (customer_id);

drop trigger if exists leads_set_updated_at on public.leads;
create trigger leads_set_updated_at
  before update on public.leads
  for each row execute function public.set_updated_at();

-- A lead's customer_id (if set) must belong to the same user.
create or replace function public.check_lead_customer_ownership()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.customer_id is not null then
    if not exists (
      select 1 from public.customers where id = new.customer_id and user_id = new.user_id
    ) then
      raise exception 'customer_id does not belong to the lead owner';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists leads_check_customer_ownership on public.leads;
create trigger leads_check_customer_ownership
  before insert or update of customer_id, user_id on public.leads
  for each row execute function public.check_lead_customer_ownership();

create or replace function public.log_lead_activity()
returns trigger
language plpgsql
as $$
begin
  if TG_OP = 'INSERT' then
    perform public.log_activity(new.user_id, 'lead', new.id, 'created', 'Lead created for ' || new.contact_name);
  elsif TG_OP = 'UPDATE' and old.status is distinct from new.status then
    perform public.log_activity(new.user_id, 'lead', new.id, 'status_changed', new.contact_name || ' lead moved to ' || new.status);
  end if;
  return new;
end;
$$;

drop trigger if exists leads_log_activity on public.leads;
create trigger leads_log_activity
  after insert or update on public.leads
  for each row execute function public.log_lead_activity();

-- ---------------------------------------------------------------------------
-- jobs (replaces the old FocusFlow "projects" concept)
-- ---------------------------------------------------------------------------
create table if not exists public.jobs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  customer_id uuid not null references public.customers (id) on delete cascade,
  title       text not null check (char_length(title) between 1 and 200),
  status      job_status not null default 'new',
  priority    task_priority not null default 'medium',
  deadline    timestamptz,
  assigned_to text check (char_length(assigned_to) <= 120),
  price       numeric(12, 2) check (price is null or price >= 0),
  notes       text check (char_length(notes) <= 4000),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists jobs_user_id_idx on public.jobs (user_id);
create index if not exists jobs_user_id_status_idx on public.jobs (user_id, status);
create index if not exists jobs_customer_id_idx on public.jobs (customer_id);

drop trigger if exists jobs_set_updated_at on public.jobs;
create trigger jobs_set_updated_at
  before update on public.jobs
  for each row execute function public.set_updated_at();

create or replace function public.check_job_customer_ownership()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.customers where id = new.customer_id and user_id = new.user_id
  ) then
    raise exception 'customer_id does not belong to the job owner';
  end if;
  return new;
end;
$$;

drop trigger if exists jobs_check_customer_ownership on public.jobs;
create trigger jobs_check_customer_ownership
  before insert or update of customer_id, user_id on public.jobs
  for each row execute function public.check_job_customer_ownership();

create or replace function public.log_job_activity()
returns trigger
language plpgsql
as $$
begin
  if TG_OP = 'INSERT' then
    perform public.log_activity(new.user_id, 'job', new.id, 'created', 'Job created: ' || new.title);
  elsif TG_OP = 'UPDATE' and old.status is distinct from new.status then
    perform public.log_activity(
      new.user_id, 'job', new.id, 'status_changed',
      new.title || ' status changed to ' || new.status
    );
  end if;
  return new;
end;
$$;

drop trigger if exists jobs_log_activity on public.jobs;
create trigger jobs_log_activity
  after insert or update on public.jobs
  for each row execute function public.log_job_activity();

-- ---------------------------------------------------------------------------
-- tasks
-- ---------------------------------------------------------------------------
create table if not exists public.tasks (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references auth.users (id) on delete cascade,
  job_id             uuid references public.jobs (id) on delete set null,
  customer_id        uuid references public.customers (id) on delete set null,
  title              text not null check (char_length(title) between 1 and 200),
  description        text check (char_length(description) <= 2000),
  priority           task_priority not null default 'medium',
  status             task_status not null default 'todo',
  assignee           text check (char_length(assignee) <= 120),
  estimated_minutes  integer check (estimated_minutes is null or estimated_minutes > 0),
  deadline           timestamptz,
  completed_at       timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index if not exists tasks_user_id_idx on public.tasks (user_id);
create index if not exists tasks_user_id_status_idx on public.tasks (user_id, status);
create index if not exists tasks_job_id_idx on public.tasks (job_id);
create index if not exists tasks_customer_id_idx on public.tasks (customer_id);
create index if not exists tasks_user_id_deadline_idx on public.tasks (user_id, deadline);

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
  for each row execute function public.sync_task_completed_at();

drop trigger if exists tasks_set_updated_at on public.tasks;
create trigger tasks_set_updated_at
  before update on public.tasks
  for each row execute function public.set_updated_at();

create or replace function public.check_task_relations_ownership()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.job_id is not null then
    if not exists (select 1 from public.jobs where id = new.job_id and user_id = new.user_id) then
      raise exception 'job_id does not belong to the task owner';
    end if;
  end if;
  if new.customer_id is not null then
    if not exists (select 1 from public.customers where id = new.customer_id and user_id = new.user_id) then
      raise exception 'customer_id does not belong to the task owner';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists tasks_check_relations_ownership on public.tasks;
create trigger tasks_check_relations_ownership
  before insert or update of job_id, customer_id, user_id on public.tasks
  for each row execute function public.check_task_relations_ownership();

create or replace function public.log_task_activity()
returns trigger
language plpgsql
as $$
begin
  if TG_OP = 'INSERT' then
    perform public.log_activity(new.user_id, 'task', new.id, 'created', 'Task created: ' || new.title);
  elsif TG_OP = 'UPDATE' and old.status is distinct from new.status then
    perform public.log_activity(
      new.user_id, 'task', new.id,
      case when new.status = 'done' then 'completed' else 'status_changed' end,
      new.title || case when new.status = 'done' then ' was completed' else ' status changed to ' || new.status end
    );
  end if;
  return new;
end;
$$;

drop trigger if exists tasks_log_activity on public.tasks;
create trigger tasks_log_activity
  after insert or update on public.tasks
  for each row execute function public.log_task_activity();

-- ---------------------------------------------------------------------------
-- appointments
-- ---------------------------------------------------------------------------
create table if not exists public.appointments (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users (id) on delete cascade,
  customer_id      uuid not null references public.customers (id) on delete cascade,
  job_id           uuid references public.jobs (id) on delete set null,
  title            text not null check (char_length(title) between 1 and 200),
  scheduled_at     timestamptz not null,
  duration_minutes integer not null default 60 check (duration_minutes > 0),
  status           appointment_status not null default 'scheduled',
  notes            text check (char_length(notes) <= 4000),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists appointments_user_id_idx on public.appointments (user_id);
create index if not exists appointments_user_id_scheduled_at_idx on public.appointments (user_id, scheduled_at);
create index if not exists appointments_customer_id_idx on public.appointments (customer_id);
create index if not exists appointments_job_id_idx on public.appointments (job_id);

drop trigger if exists appointments_set_updated_at on public.appointments;
create trigger appointments_set_updated_at
  before update on public.appointments
  for each row execute function public.set_updated_at();

create or replace function public.check_appointment_relations_ownership()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.customers where id = new.customer_id and user_id = new.user_id) then
    raise exception 'customer_id does not belong to the appointment owner';
  end if;
  if new.job_id is not null then
    if not exists (select 1 from public.jobs where id = new.job_id and user_id = new.user_id) then
      raise exception 'job_id does not belong to the appointment owner';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists appointments_check_relations_ownership on public.appointments;
create trigger appointments_check_relations_ownership
  before insert or update of customer_id, job_id, user_id on public.appointments
  for each row execute function public.check_appointment_relations_ownership();

create or replace function public.log_appointment_activity()
returns trigger
language plpgsql
as $$
begin
  if TG_OP = 'INSERT' then
    perform public.log_activity(new.user_id, 'appointment', new.id, 'created', 'Appointment scheduled: ' || new.title);
  elsif TG_OP = 'UPDATE' and old.status is distinct from new.status then
    perform public.log_activity(new.user_id, 'appointment', new.id, 'status_changed', new.title || ' status changed to ' || new.status);
  end if;
  return new;
end;
$$;

drop trigger if exists appointments_log_activity on public.appointments;
create trigger appointments_log_activity
  after insert or update on public.appointments
  for each row execute function public.log_appointment_activity();

-- ---------------------------------------------------------------------------
-- activity_log (append-only; populated by the triggers above)
-- ---------------------------------------------------------------------------
create table if not exists public.activity_log (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  entity_type text not null check (entity_type in ('customer', 'lead', 'job', 'task', 'appointment')),
  entity_id   uuid not null,
  action      text not null check (char_length(action) <= 60),
  description text not null check (char_length(description) <= 500),
  created_at  timestamptz not null default now()
);

create index if not exists activity_log_user_id_created_at_idx on public.activity_log (user_id, created_at desc);
create index if not exists activity_log_entity_idx on public.activity_log (entity_type, entity_id);

-- ---------------------------------------------------------------------------
-- Row Level Security — every row is owner-scoped to auth.uid()
-- ---------------------------------------------------------------------------
alter table public.customers    enable row level security;
alter table public.leads        enable row level security;
alter table public.jobs         enable row level security;
alter table public.tasks        enable row level security;
alter table public.appointments enable row level security;
alter table public.activity_log enable row level security;

do $$
declare
  t text;
begin
  foreach t in array array['customers', 'leads', 'jobs', 'tasks', 'appointments'] loop
    execute format('drop policy if exists "%1$s_select_own" on public.%1$s', t);
    execute format('create policy "%1$s_select_own" on public.%1$s for select using (auth.uid() = user_id)', t);

    execute format('drop policy if exists "%1$s_insert_own" on public.%1$s', t);
    execute format('create policy "%1$s_insert_own" on public.%1$s for insert with check (auth.uid() = user_id)', t);

    execute format('drop policy if exists "%1$s_update_own" on public.%1$s', t);
    execute format('create policy "%1$s_update_own" on public.%1$s for update using (auth.uid() = user_id) with check (auth.uid() = user_id)', t);

    execute format('drop policy if exists "%1$s_delete_own" on public.%1$s', t);
    execute format('create policy "%1$s_delete_own" on public.%1$s for delete using (auth.uid() = user_id)', t);
  end loop;
end $$;

-- activity_log is append-only from the app's perspective: readable and
-- insertable (triggers insert as the invoking user via RLS), never
-- updated/deleted directly.
drop policy if exists "activity_log_select_own" on public.activity_log;
create policy "activity_log_select_own" on public.activity_log
  for select using (auth.uid() = user_id);

drop policy if exists "activity_log_insert_own" on public.activity_log;
create policy "activity_log_insert_own" on public.activity_log
  for insert with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Grants (RLS still applies on top of these — this just allows the role in)
-- ---------------------------------------------------------------------------
grant select, insert, update, delete on public.customers    to authenticated;
grant select, insert, update, delete on public.leads        to authenticated;
grant select, insert, update, delete on public.jobs         to authenticated;
grant select, insert, update, delete on public.tasks        to authenticated;
grant select, insert, update, delete on public.appointments to authenticated;
grant select, insert           on public.activity_log       to authenticated;
