-- Trader OS · migration 0003 · per-user sync
-- What the app actually reads and writes once a user is signed in.
-- Run after 0001 and 0002. Safe to run more than once.
--
-- Why not the 0002 progress tables? lesson_progress, quiz_attempts and
-- practical_reflections reference academy_lessons, which is only filled once
-- course content is seeded into the database. Course content still lives in
-- the app's code, so these tables use plain text ids with no foreign key to
-- content. The 0002 tables are left in place, unused, for a later seeding step.
--
-- Every table here follows the 0001 pattern: user_id references auth.users,
-- Row Level Security is on, and each policy only allows user_id = auth.uid().

-- ── Profiles: let a user create their own row if the signup trigger missed it ──
-- (for example, accounts created before 0001 was run).
drop policy if exists "profiles: insert own" on public.profiles;
create policy "profiles: insert own" on public.profiles
  for insert with check (auth.uid() = id);

drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

-- Backfill profiles for any users who signed up before the trigger existed.
insert into public.profiles (id)
  select u.id from auth.users u
  where not exists (select 1 from public.profiles p where p.id = u.id);

-- ── Academy progress: the whole ProgressState as JSON (the source of truth) ──
-- One row per user. The app merges this with the browser's copy using
-- mergeProgress (lib/academy/progress.ts), so nothing is lost between devices.
create table if not exists public.academy_progress (
  user_id uuid primary key references auth.users (id) on delete cascade,
  state jsonb not null default '{}'::jsonb check (jsonb_typeof(state) = 'object'),
  schema_version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Generous cap so one account cannot fill the database by accident.
  check (pg_column_size(state) < 2000000)
);

-- ── Track assessment attempts (a queryable copy of what is in the JSON) ──────
create table if not exists public.assessment_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  track_id text not null check (char_length(track_id) <= 100),
  attempted_at timestamptz not null,
  seq integer,
  correct integer not null check (correct >= 0),
  total integer not null check (total > 0 and total <= 200),
  -- [{ "q": "question id", "c": "concept id", "ok": true, ... }]
  items jsonb not null default '[]'::jsonb check (jsonb_typeof(items) = 'array'),
  answers jsonb not null default '{}'::jsonb check (jsonb_typeof(answers) = 'object'),
  created_at timestamptz not null default now(),
  check (correct <= total),
  unique (user_id, track_id, attempted_at)
);

create index if not exists assessment_attempts_user_track_idx
  on public.assessment_attempts (user_id, track_id, attempted_at);

-- ── Lesson reflections (practical-exercise notes; also kept in the JSON) ─────
create table if not exists public.lesson_reflections (
  user_id uuid not null references auth.users (id) on delete cascade,
  lesson_id text not null check (char_length(lesson_id) <= 100),
  body text not null check (char_length(body) <= 4000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

-- ── Saved widget documents ─────────────────────────────────────────────────
-- Trading checklist, trading plan, strategy spec, backtest checklist and any
-- later notes, keyed by the same name the widget uses in localStorage
-- (for example 'trader-os:psy-plan:v1'). value null means "cleared".
create table if not exists public.user_documents (
  user_id uuid not null references auth.users (id) on delete cascade,
  key text not null check (char_length(key) between 1 and 200),
  value jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (value is null or pg_column_size(value) < 200000),
  primary key (user_id, key)
);

-- ── Row Level Security: each user sees and changes only their own rows ──────
alter table public.academy_progress enable row level security;
alter table public.assessment_attempts enable row level security;
alter table public.lesson_reflections enable row level security;
alter table public.user_documents enable row level security;

do $$
declare
  t text;
begin
  foreach t in array array['academy_progress', 'lesson_reflections', 'user_documents'] loop
    execute format('drop policy if exists "%1$s: read own" on public.%1$I', t);
    execute format('drop policy if exists "%1$s: insert own" on public.%1$I', t);
    execute format('drop policy if exists "%1$s: update own" on public.%1$I', t);
    execute format('drop policy if exists "%1$s: delete own" on public.%1$I', t);
    execute format('create policy "%1$s: read own" on public.%1$I for select to authenticated using (auth.uid() = user_id)', t);
    execute format('create policy "%1$s: insert own" on public.%1$I for insert to authenticated with check (auth.uid() = user_id)', t);
    execute format('create policy "%1$s: update own" on public.%1$I for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id)', t);
    execute format('create policy "%1$s: delete own" on public.%1$I for delete to authenticated using (auth.uid() = user_id)', t);
  end loop;
end $$;

-- Attempts are a history: add, read and delete (for a full reset) your own,
-- but never rewrite a past score.
drop policy if exists "assessment_attempts: read own" on public.assessment_attempts;
drop policy if exists "assessment_attempts: insert own" on public.assessment_attempts;
drop policy if exists "assessment_attempts: delete own" on public.assessment_attempts;
create policy "assessment_attempts: read own" on public.assessment_attempts
  for select to authenticated using (auth.uid() = user_id);
create policy "assessment_attempts: insert own" on public.assessment_attempts
  for insert to authenticated with check (auth.uid() = user_id);
create policy "assessment_attempts: delete own" on public.assessment_attempts
  for delete to authenticated using (auth.uid() = user_id);

-- Keep updated_at current on every update (touch_updated_at comes from 0002).
drop trigger if exists academy_progress_touch on public.academy_progress;
create trigger academy_progress_touch before update on public.academy_progress
  for each row execute function public.touch_updated_at();

drop trigger if exists lesson_reflections_touch on public.lesson_reflections;
create trigger lesson_reflections_touch before update on public.lesson_reflections
  for each row execute function public.touch_updated_at();

-- user_documents.updated_at is set by the app to the time the document was
-- changed on the device (used for newest-wins merging), so it has no trigger.

-- Same trust note as 0002: scores and progress are computed in the browser,
-- so a user can write anything about themselves. That only affects their own
-- account. If scores ever matter to anyone else, grade on the server instead.
