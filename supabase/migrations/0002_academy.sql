-- Trader OS · migration 0002 · academy
-- Course content (readable by any signed-in user) and per-user progress
-- (each user can only touch their own rows), following the 0001 pattern.
--
-- Not wired up at runtime yet: progress is kept in the browser until sign-in
-- exists. Content currently lives in lib/academy/ and can be seeded into
-- these tables later. Ids are the same text slugs used in the app.

-- ── Course content ─────────────────────────────────────────────────────────

create table if not exists public.academy_tracks (
  id text primary key,
  position integer not null unique,
  title text not null,
  summary text not null,
  status text not null default 'planned' check (status in ('written', 'planned')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- A "module" is a lesson inside a track.
create table if not exists public.academy_lessons (
  id text primary key,
  track_id text not null references public.academy_tracks (id) on delete cascade,
  position integer not null,
  title text not null,
  summary text not null,
  minutes integer not null default 10 check (minutes > 0),
  objectives jsonb not null default '[]'::jsonb,
  -- sections, visual ids, exercise and practical exercise, as structured JSON
  content jsonb not null default '{}'::jsonb,
  glossary_ids text[] not null default '{}',
  next_lesson_id text references public.academy_lessons (id) on delete set null,
  status text not null default 'planned' check (status in ('written', 'planned')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (track_id, position)
);

create table if not exists public.academy_glossary (
  id text primary key,
  term text not null,
  definition text not null
);

create table if not exists public.academy_quizzes (
  id uuid primary key default gen_random_uuid(),
  lesson_id text not null unique references public.academy_lessons (id) on delete cascade,
  pass_mark numeric(3, 2) not null default 0.80 check (pass_mark > 0 and pass_mark <= 1)
);

create table if not exists public.academy_quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.academy_quizzes (id) on delete cascade,
  slug text not null,                 -- e.g. 'q1', matches lib/academy content
  position integer not null,
  prompt text not null,
  -- [{ "id": "a", "text": "...", "explain": "why right or wrong" }, ...]
  options jsonb not null check (jsonb_typeof(options) = 'array'),
  correct_option text not null,
  unique (quiz_id, slug),
  unique (quiz_id, position)
);

-- Content is reference material: any signed-in user may read it, nobody may
-- change it through the API (only the service role / SQL editor can).
alter table public.academy_tracks enable row level security;
alter table public.academy_lessons enable row level security;
alter table public.academy_glossary enable row level security;
alter table public.academy_quizzes enable row level security;
alter table public.academy_quiz_questions enable row level security;

create policy "academy_tracks: read when signed in" on public.academy_tracks
  for select to authenticated using (true);
create policy "academy_lessons: read when signed in" on public.academy_lessons
  for select to authenticated using (true);
create policy "academy_glossary: read when signed in" on public.academy_glossary
  for select to authenticated using (true);
create policy "academy_quizzes: read when signed in" on public.academy_quizzes
  for select to authenticated using (true);
create policy "academy_quiz_questions: read when signed in" on public.academy_quiz_questions
  for select to authenticated using (true);

-- ── Per-user progress ──────────────────────────────────────────────────────

create table if not exists public.lesson_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  lesson_id text not null references public.academy_lessons (id) on delete cascade,
  -- { "section-id": "2026-01-01T10:00:00Z", ... }
  sections_read jsonb not null default '{}'::jsonb check (jsonb_typeof(sections_read) = 'object'),
  exercise_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

-- NOTE (trust): quiz scores are computed in the browser and inserted by the
-- client, so a user can record any score for themselves. That is acceptable
-- for a personal learning tool (it only affects their own mastery). If scores
-- ever matter to anyone else, grade server-side instead: insert answers only
-- and compute correct/total in a security-definer function.
create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  lesson_id text not null references public.academy_lessons (id) on delete cascade,
  correct integer not null check (correct >= 0),
  total integer not null check (total > 0 and total <= 100),
  -- { "q1": "b", ... } answers given, for review
  answers jsonb not null default '{}'::jsonb,
  attempted_at timestamptz not null default now(),
  check (correct <= total)
);

create index if not exists quiz_attempts_user_lesson_idx
  on public.quiz_attempts (user_id, lesson_id, attempted_at);

create table if not exists public.practical_reflections (
  user_id uuid not null references auth.users (id) on delete cascade,
  lesson_id text not null references public.academy_lessons (id) on delete cascade,
  body text not null check (char_length(body) <= 4000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

alter table public.lesson_progress enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.practical_reflections enable row level security;

create policy "lesson_progress: read own" on public.lesson_progress
  for select using (auth.uid() = user_id);
create policy "lesson_progress: insert own" on public.lesson_progress
  for insert with check (auth.uid() = user_id);
create policy "lesson_progress: update own" on public.lesson_progress
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "lesson_progress: delete own" on public.lesson_progress
  for delete using (auth.uid() = user_id);

-- Attempts are a history: users can add and read (and delete, for a full
-- reset) their own, but not rewrite past scores.
create policy "quiz_attempts: read own" on public.quiz_attempts
  for select using (auth.uid() = user_id);
create policy "quiz_attempts: insert own" on public.quiz_attempts
  for insert with check (auth.uid() = user_id);
create policy "quiz_attempts: delete own" on public.quiz_attempts
  for delete using (auth.uid() = user_id);

create policy "practical_reflections: read own" on public.practical_reflections
  for select using (auth.uid() = user_id);
create policy "practical_reflections: insert own" on public.practical_reflections
  for insert with check (auth.uid() = user_id);
create policy "practical_reflections: update own" on public.practical_reflections
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "practical_reflections: delete own" on public.practical_reflections
  for delete using (auth.uid() = user_id);

-- Keep updated_at current on every update.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists lesson_progress_touch on public.lesson_progress;
create trigger lesson_progress_touch before update on public.lesson_progress
  for each row execute function public.touch_updated_at();

drop trigger if exists practical_reflections_touch on public.practical_reflections;
create trigger practical_reflections_touch before update on public.practical_reflections
  for each row execute function public.touch_updated_at();
