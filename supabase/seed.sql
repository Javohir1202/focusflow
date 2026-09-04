-- Demo data for ServiceFlow — a realistic-looking set of customers, leads,
-- jobs, tasks, and appointments so a fresh account doesn't look empty.
--
-- HOW TO USE
--   1. Sign up / log in to the app once, so an auth.users row exists.
--   2. Replace 'you@example.com' below with the email you signed up with.
--   3. Paste this whole file into the Supabase SQL editor and run it.
--
-- Every seeded row's title/name is prefixed "Demo — " so it's easy to spot
-- and to remove later — see the cleanup block commented out at the bottom.
-- activity_log entries are NOT inserted here; they populate automatically
-- from the same triggers that fire for rows created through the app.
--
-- Safe to run more than once, but each run adds another full batch — run
-- the cleanup block first if you want to reset before reseeding.

do $$
declare
  v_user_id uuid;
  v_acme_id uuid;
  v_nguyen_id uuid;
  v_park_id uuid;
  v_diaz_id uuid;
  v_riverside_id uuid;
  v_job_repaint_id uuid;
  v_job_hvac_id uuid;
begin
  select id into v_user_id from auth.users where email = 'you@example.com' limit 1;

  if v_user_id is null then
    raise exception
      'No auth user found for that email. Sign up in the app first, then edit the email at the top of this script.';
  end if;

  -- -------------------------------------------------------------------
  -- Customers
  -- -------------------------------------------------------------------
  insert into public.customers (id, user_id, name, company, phone, email, status, source, tags, notes)
  values
    (gen_random_uuid(), v_user_id, 'Demo — Sarah Nguyen', 'Nguyen Family Home', '555-0101', 'sarah.nguyen@example.com', 'active', 'referral', array['demo','recurring'], 'Prefers morning appointments.')
    returning id into v_nguyen_id;

  insert into public.customers (id, user_id, name, company, phone, email, status, source, tags, notes)
  values
    (gen_random_uuid(), v_user_id, 'Demo — Acme Property Group', 'Acme Property Group', '555-0102', 'ops@acmeproperty.example.com', 'active', 'website', array['demo','commercial','vip'], 'Manages 6 rental units in the same building.')
    returning id into v_acme_id;

  insert into public.customers (id, user_id, name, company, phone, email, status, source, tags, notes)
  values
    (gen_random_uuid(), v_user_id, 'Demo — Marcus Park', null, '555-0103', 'marcus.park@example.com', 'prospect', 'cold_call', array['demo'], null)
    returning id into v_park_id;

  insert into public.customers (id, user_id, name, company, phone, email, status, source, tags, notes)
  values
    (gen_random_uuid(), v_user_id, 'Demo — Elena Diaz', null, '555-0104', 'elena.diaz@example.com', 'inactive', 'social_media', array['demo'], 'Moved out of the service area.')
    returning id into v_diaz_id;

  insert into public.customers (id, user_id, name, company, phone, email, status, source, tags, notes)
  values
    (gen_random_uuid(), v_user_id, 'Demo — Riverside Diner', 'Riverside Diner', '555-0105', 'manager@riversidediner.example.com', 'active', 'event', array['demo','commercial'], 'Booth found us at the county fair.')
    returning id into v_riverside_id;

  -- -------------------------------------------------------------------
  -- Leads — spread across every pipeline stage
  -- -------------------------------------------------------------------
  insert into public.leads (user_id, customer_id, contact_name, company, email, phone, source, status, value, assigned_to, notes, next_follow_up_at, created_at)
  values
    (v_user_id, null, 'Demo — Jordan Lee', null, 'jordan.lee@example.com', '555-0201', 'website', 'new', 450, 'You', 'Filled out the contact form last night.', now() + interval '2 days', now() - interval '1 day'),
    (v_user_id, null, 'Demo — Priya Shah', 'Shah Consulting', 'priya.shah@example.com', '555-0202', 'referral', 'contacted', 1200, 'You', 'Referred by Sarah Nguyen.', now() + interval '3 days', now() - interval '4 days'),
    (v_user_id, null, 'Demo — Tom Becker', null, 'tom.becker@example.com', '555-0203', 'cold_call', 'qualified', 800, 'You', null, now() + interval '1 day', now() - interval '6 days'),
    (v_user_id, null, 'Demo — Highline Cafe', 'Highline Cafe', 'owner@highlinecafe.example.com', '555-0204', 'event', 'quoted', 2400, 'You', 'Quote sent for full kitchen deep clean.', now() + interval '5 days', now() - interval '9 days'),
    (v_user_id, v_park_id, 'Demo — Marcus Park', null, 'marcus.park@example.com', '555-0103', 'cold_call', 'quoted', 600, 'You', null, now() + interval '2 days', now() - interval '3 days'),
    (v_user_id, v_nguyen_id, 'Demo — Sarah Nguyen', 'Nguyen Family Home', 'sarah.nguyen@example.com', '555-0101', 'referral', 'won', 950, 'You', 'Converted after first job went well.', null, now() - interval '45 days'),
    (v_user_id, v_riverside_id, 'Demo — Riverside Diner', 'Riverside Diner', 'manager@riversidediner.example.com', '555-0105', 'event', 'won', 1800, 'You', null, null, now() - interval '30 days'),
    (v_user_id, null, 'Demo — Old Mill Apartments', 'Old Mill Apartments', 'leasing@oldmill.example.com', '555-0205', 'website', 'lost', 3000, 'You', 'Went with a competitor on price.', null, now() - interval '20 days');

  -- -------------------------------------------------------------------
  -- Jobs — linked to customers, various statuses
  -- -------------------------------------------------------------------
  insert into public.jobs (id, user_id, customer_id, title, status, priority, deadline, assigned_to, price, notes, completed_at, created_at)
  values
    (gen_random_uuid(), v_user_id, v_nguyen_id, 'Demo — Interior repaint, 3 bedrooms', 'completed', 'medium', now() - interval '50 days', 'You', 1400, 'Client supplied paint color.', now() - interval '48 days', now() - interval '55 days')
    returning id into v_job_repaint_id;

  insert into public.jobs (id, user_id, customer_id, title, status, priority, deadline, assigned_to, price, notes, completed_at, created_at)
  values
    (gen_random_uuid(), v_user_id, v_riverside_id, 'Demo — HVAC tune-up, dining room units', 'completed', 'high', now() - interval '15 days', 'You', 900, null, now() - interval '14 days', now() - interval '25 days')
    returning id into v_job_hvac_id;

  insert into public.jobs (user_id, customer_id, title, status, priority, deadline, assigned_to, price, notes, completed_at, created_at)
  values
    (v_user_id, v_acme_id, 'Demo — Unit 4B turnover cleaning', 'in_progress', 'high', now() + interval '2 days', 'You', 350, 'Tenant moves in Friday.', null, now() - interval '3 days'),
    (v_user_id, v_acme_id, 'Demo — Gutter cleaning, all 6 units', 'scheduled', 'medium', now() + interval '9 days', 'You', 720, null, null, now() - interval '2 days'),
    (v_user_id, v_riverside_id, 'Demo — Quarterly deep clean', 'new', 'low', now() + interval '20 days', null, 1100, 'Recurring — same as last quarter.', null, now() - interval '1 day');

  -- -------------------------------------------------------------------
  -- Tasks — mix of standalone, job-linked, and customer-linked
  -- -------------------------------------------------------------------
  insert into public.tasks (user_id, job_id, customer_id, title, description, priority, status, assignee, estimated_minutes, deadline, completed_at, created_at)
  values
    (v_user_id, v_job_repaint_id, v_nguyen_id, 'Demo — Buy drop cloths and painter''s tape', null, 'low', 'done', 'You', 20, now() - interval '52 days', now() - interval '52 days', now() - interval '53 days'),
    (v_user_id, v_job_repaint_id, v_nguyen_id, 'Demo — Prime and paint master bedroom', null, 'medium', 'done', 'You', 180, now() - interval '49 days', now() - interval '49 days', now() - interval '53 days'),
    (v_user_id, v_job_hvac_id, v_riverside_id, 'Demo — Order replacement filters', null, 'medium', 'done', 'You', 15, now() - interval '16 days', now() - interval '16 days', now() - interval '20 days'),
    (v_user_id, null, v_acme_id, 'Demo — Follow up on Unit 4B key drop-off', null, 'high', 'in_progress', 'You', 10, now() + interval '1 day', null, now() - interval '2 days'),
    (v_user_id, null, v_acme_id, 'Demo — Confirm gutter cleaning crew availability', null, 'medium', 'todo', 'You', 15, now() + interval '4 days', null, now() - interval '1 day'),
    (v_user_id, null, null, 'Demo — Call Priya Shah back about the quote', 'She asked for an itemized breakdown.', 'high', 'todo', 'You', 15, now() - interval '1 day', null, now() - interval '2 days'),
    (v_user_id, null, null, 'Demo — Order more business cards', null, 'low', 'todo', 'You', 10, now() + interval '14 days', null, now() - interval '5 days'),
    (v_user_id, null, v_park_id, 'Demo — Send Marcus Park the quoted estimate', null, 'medium', 'todo', 'You', 20, now() + interval '2 days', null, now() - interval '3 days');

  -- -------------------------------------------------------------------
  -- Appointments — past, today-ish, and upcoming
  -- -------------------------------------------------------------------
  insert into public.appointments (user_id, customer_id, job_id, title, scheduled_at, duration_minutes, status, notes)
  values
    (v_user_id, v_riverside_id, v_job_hvac_id, 'Demo — HVAC tune-up visit', now() - interval '14 days', 90, 'completed', null),
    (v_user_id, v_acme_id, null, 'Demo — Unit 4B walkthrough', now() + interval '1 day' + interval '10 hours', 45, 'confirmed', 'Meet the property manager on-site.'),
    (v_user_id, v_park_id, null, 'Demo — On-site estimate', now() + interval '2 days' + interval '14 hours', 30, 'scheduled', null),
    (v_user_id, v_riverside_id, null, 'Demo — Quarterly deep clean walkthrough', now() + interval '18 days' + interval '9 hours', 60, 'scheduled', null);

  raise notice 'Demo data seeded for user %', v_user_id;
end $$;

-- -------------------------------------------------------------------------
-- CLEANUP — uncomment and run to remove everything this script created for
-- a given account (matches on the "Demo — " prefix and the 'demo' tag).
-- -------------------------------------------------------------------------
-- do $$
-- declare
--   v_user_id uuid;
-- begin
--   select id into v_user_id from auth.users where email = 'you@example.com' limit 1;
--   delete from public.appointments where user_id = v_user_id and title like 'Demo — %';
--   delete from public.tasks where user_id = v_user_id and title like 'Demo — %';
--   delete from public.jobs where user_id = v_user_id and title like 'Demo — %';
--   delete from public.leads where user_id = v_user_id and contact_name like 'Demo — %';
--   delete from public.customers where user_id = v_user_id and 'demo' = any(tags);
-- end $$;
