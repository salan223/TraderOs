# Trader OS

A personal trading academy and analytics workspace. Education first, simulated trading only. It never connects to a broker or places real orders.

## Run it on your computer

You need **Node.js 20.9 or newer** (download the LTS version from nodejs.org).

```bash
cd ~/Trading
npm install      # first time only: downloads the libraries the app uses
npm run dev      # starts the app
npm test         # runs the unit tests (progress rules and lesson content checks)
```

Then open http://localhost:3000 in your browser. Press `Ctrl + C` in the terminal to stop it.

## How it is built

| Part | Tool | Why |
|---|---|---|
| Framework | Next.js 16 (App Router) + TypeScript | Pages and server code in one project; TypeScript catches mistakes in money math |
| Styling | Tailwind CSS 4 | Design tokens in `app/globals.css` keep the dark theme consistent |
| Database & login | Supabase (Postgres + Row Level Security) | Only your account can read your data |
| Charts (phase 3+) | TradingView lightweight-charts, Recharts | Open-source candlestick and analytics charts |

## Folder map

```
app/                 Pages (one folder per sidebar section)
  globals.css        Visual system: colours, fonts, radii
components/
  shell/             Sidebar, mobile navigation, top bar
  ui/                Panel, DataBadge, Stat, Term (glossary tooltip), buttons
  dashboard/         Dashboard panels
lib/
  nav.ts             Sidebar sections and which phase builds each one
  data-source.ts     The data labels: Live, Delayed, Simulated, Sample, Computed, No data source
  academy/           Academy (phase 2)
    types.ts         Content model: tracks, lessons, exercises, quizzes
    curriculum.ts    The 14 tracks; Market Foundations lessons live in content/
    glossary.ts      Every term, defined once (<Term id="..."> reads from here)
    progress.ts      Pure progress, mastery, streak and recommendation rules
    store.ts         Where progress is saved in this browser
    remote-store.ts  Sync of that progress to the signed-in account
  curriculum.ts      Re-exports lib/academy for older imports
  markets.ts         Starter instruments (no prices)
  sessions.ts        Market session hours, computed from your clock
  supabase/          Supabase clients (browser and server)
  auth/              Route rules and sign-in error messages
proxy.ts             Session refresh and page protection
supabase/migrations/ Database tables and security rules
```

## Rules the code follows

- **No invented numbers.** Every data panel shows a `DataBadge`. If there is no source, the value is `—`.
- **Secrets stay on the server.** Only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` may reach the browser. Everything else (market data keys, AI keys) is read only in server code.
- **Every user table has Row Level Security**, following `supabase/migrations/0001_profiles.sql`.

## Accounts and saving progress (Supabase)

Trader OS works without any setup: with no Supabase keys it runs in **guest mode**, and progress, notes and plans are saved in your browser only. The sign-in pages then show a "not configured" note. Connect Supabase to get accounts, so each person's progress is saved to their account and follows them between devices.

### Step by step (about 15 minutes)

1. **Create a project.** Go to [supabase.com](https://supabase.com), sign up, and click **New project**. Pick any name, set a database password (save it somewhere safe), choose a region near you, and wait a minute or two while it starts.
2. **Copy the two public values.** In the project, open **Project Settings → API** (in newer dashboards: **Project Settings → API Keys** and **Data API**). Copy the **Project URL** and the **anon public** key (or the **publishable** key, which works too).
   - Never copy the **service_role** / **secret** key into this app. Trader OS does not need it.
3. **Create `.env.local`.** In the project folder, copy `.env.example` to `.env.local` and fill in:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-or-publishable-key
   ```
   (`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` is accepted instead of the anon key.)
4. **Create the tables.** In Supabase, open **SQL Editor → New query**. Open each file in `supabase/migrations/` **in number order** (`0001_profiles.sql`, then `0002_academy.sql`, then `0003_user_sync.sql`), paste its whole contents, and click **Run**. Each should say "Success. No rows returned". They are safe to run again.
5. **Turn on email sign-in.** Open **Authentication → Sign In / Providers** (older dashboards: **Authentication → Providers**) and make sure **Email** is enabled. "Confirm email" on means new users must click a link before they can log in (recommended); off means they are signed in straight away.
6. **Set the redirect URLs.** Open **Authentication → URL Configuration**.
   - **Site URL:** `http://localhost:3000` while developing (your real address once deployed).
   - **Redirect URLs:** add `http://localhost:3000/auth/callback` and, once deployed, `https://your-domain/auth/callback`.
   Confirmation, magic-link and password-reset emails all come back through `/auth/callback`.
7. **Restart the app** (`Ctrl + C`, then `npm run dev`) so it reads `.env.local`. Open http://localhost:3000, click **Sign up**, and follow the email.

Supabase's built-in email sender only allows a few emails per hour and is meant for testing. For real use, add your own SMTP provider under **Authentication → Emails → SMTP Settings**.

### What happens once it is connected

- `/` is the public landing page; the app's home is **`/dashboard`**. Signed-in visitors of `/`, `/login` or `/signup` go straight to the dashboard.
- App pages need sign-in. Signed-out visitors are sent to `/login?next=…` and come back afterwards. Set `TRADEROS_ALLOW_GUESTS=1` in `.env.local` to let signed-out visitors use the app as guests too. `/api/market/*` and `/api/news` stay public.
- **First sign-in moves your guest progress into your account** (it is merged, never overwritten), and later sign-ins on other devices merge too. Saves are sent a moment after each change; if you are offline they wait and retry, and the save note under each lesson says so.
- Signing out (top-right menu) saves anything pending, then removes your account's copy from that browser.
- Saved widget documents (trading checklist and plan, strategy spec, backtest checklist) sync the same way.

### Where it lives in the code

| What | Where |
|---|---|
| Session refresh and page protection | `proxy.ts` (Next 16's name for middleware), rules in `lib/auth/routes.ts` |
| Email links (confirm, magic link, reset) | `app/auth/callback/route.ts` |
| Sign-in pages | `app/login`, `app/signup`, `app/forgot-password`, `app/reset-password`, `app/check-email` |
| Who is signed in, sign-out | `components/auth/auth-provider.tsx` |
| Progress sync (merge, debounce, offline retry) | `lib/academy/remote-store.ts` |
| Widget document sync | `lib/user-docs.ts` |
| Tables and Row Level Security | `supabase/migrations/0003_user_sync.sql` (`academy_progress`, `assessment_attempts`, `lesson_reflections`, `user_documents`; profiles from 0001) |

Every table has Row Level Security: a signed-in user can only read and write rows where `user_id` is their own id.

## Academy rules

- **Complete** = every section read + exercise solved + best quiz score of 80% or more.
- **Mastered** = complete, passed on two different days (your local time), and the latest attempt passed.
- **Mastery %** = average over written lessons: Mastered 100%, Practising 50%, otherwise 0%.
- Rules are in `lib/academy/progress.ts` and covered by `tests/`.

## Build phases

1. ✅ Architecture, shell, navigation, dashboard, visual system
2. ✅ Academy: Market Foundations (10 lessons), quizzes, mastery, glossary. Progress is saved in this browser, or in your account once Supabase is connected.
3. Market Desk · 4. Paper Trading · 5. Journal · 6. Strategy Lab · 7. AI Mentor · 8. Analytics, polish, deploy
