-- Adds jobs.completed_at, kept in sync with jobs.status the same way
-- tasks.completed_at already is. Without this, "revenue by month" on the
-- Analytics page would attribute a completed job's price to whatever month
-- it was last *edited* (updated_at) rather than the month it was actually
-- completed — e.g. editing a job's notes months after completion would
-- silently move its revenue to the wrong month.
-- Idempotent: safe to re-run.

alter table public.jobs add column if not exists completed_at timestamptz;

create or replace function public.sync_job_completed_at()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'completed' and old.status is distinct from 'completed' then
    new.completed_at := now();
  elsif new.status <> 'completed' then
    new.completed_at := null;
  end if;
  return new;
end;
$$;

drop trigger if exists jobs_sync_completed_at on public.jobs;
create trigger jobs_sync_completed_at
  before update on public.jobs
  for each row execute function public.sync_job_completed_at();

-- Backfill: jobs already sitting at status = 'completed' get completed_at
-- set to updated_at (the closest available signal) rather than left null.
update public.jobs
set completed_at = updated_at
where status = 'completed' and completed_at is null;
