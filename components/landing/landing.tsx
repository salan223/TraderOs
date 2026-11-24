import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  Check,
  CircleSlash,
  ClipboardCheck,
  GraduationCap,
  LineChart,
  Lock,
  NotebookPen,
  ShieldCheck,
  Target,
} from "lucide-react";
import { LogoMark } from "@/components/shell/logo";
import { GLOSSARY_LIST } from "@/lib/academy/glossary";
import { LESSONS, TRACKS } from "@/lib/academy/curriculum";
import { LIVE_INSTRUMENTS } from "@/lib/market/instruments";
import { NAV, isBuilt } from "@/lib/nav";
import { cn } from "@/lib/cn";
import { HeroPulse, MarketBoard, NewsBoard, TickerTape } from "./live-market";
import { Ctas, HeaderActions } from "./account-actions";

/*
  Public landing page. Everything stated here is true of the app as built:
  counts come from the curriculum, glossary and instrument list; prices and
  headlines are live from /api/market/quotes and /api/news; module status
  comes from lib/nav.ts. There are no testimonials, user counts or
  performance claims.
*/

function SectionHead({ id, eyebrow, title, text, center }: { id: string; eyebrow: string; title: React.ReactNode; text?: string; center?: boolean }) {
  return (
    <div className={cn("max-w-2xl", center && "mx-auto text-center")}>
      <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-accent-strong">{eyebrow}</p>
      <h2 id={id} className="mt-3 text-balance text-3xl font-semibold leading-tight tracking-[-0.02em] md:text-[2.5rem]">
        {title}
      </h2>
      {text && <p className="mt-4 text-[16px] leading-relaxed text-fg-muted">{text}</p>}
    </div>
  );
}

/** Decorative candlesticks behind the hero. Shapes only, no values. */
function HeroCandles() {
  const candles = [
    [40, 58, 46, 62], [44, 50, 38, 56], [50, 44, 40, 60], [42, 36, 30, 48], [38, 30, 26, 44],
    [32, 40, 28, 46], [40, 34, 30, 50], [34, 26, 22, 38], [28, 22, 16, 34], [24, 30, 18, 36],
    [30, 20, 14, 34], [22, 16, 10, 28], [18, 24, 12, 30], [24, 14, 8, 28], [16, 10, 4, 22],
  ];
  return (
    <svg aria-hidden viewBox="0 0 300 70" preserveAspectRatio="none" className="pointer-events-none absolute bottom-0 left-[45%] right-0 h-[45%] opacity-[0.10] [mask-image:linear-gradient(to_right,transparent,#000_30%)]">
      {candles.map(([o, c, h, l], i) => {
        const x = 10 + i * 19.5;
        const up = c < o;
        const top = Math.min(o, c);
        return (
          <g key={i} className={up ? "text-up" : "text-down"}>
            <line x1={x} x2={x} y1={h} y2={l} stroke="currentColor" strokeWidth="0.6" />
            <rect x={x - 3.5} y={top} width="7" height={Math.max(1.5, Math.abs(o - c))} rx="0.8" fill="currentColor" />
          </g>
        );
      })}
    </svg>
  );
}

const STEPS = [
  { icon: BookOpenCheck, title: "Learn", text: "Short lessons with interactive tools, worked examples and the research behind each idea, including what it does not show." },
  { icon: ClipboardCheck, title: "Prove it", text: "Each track ends with an assessment. Safety-critical topics like leverage and position sizing must be answered correctly to pass." },
  { icon: Target, title: "Practise", text: "Try ideas with simulated money and real market data, where mistakes cost nothing." },
  { icon: NotebookPen, title: "Review", text: "Journal what you did and why, then measure your practice with every number explained." },
];

const PROMISES = [
  { icon: GraduationCap, title: "Education only", text: "Trader OS teaches how markets work and how to manage risk. It is not financial advice." },
  { icon: CircleSlash, title: "No real orders", text: "It never connects to a broker. Every trade you place here is simulated with virtual money." },
  { icon: ShieldCheck, title: "No signals or tips", text: "Nothing here tells you what to buy or sell. You learn to test ideas and judge them yourself." },
];

const NAV_LINKS = [
  { href: "#markets", label: "Markets" },
  { href: "#news", label: "News" },
  { href: "#features", label: "Features" },
  { href: "#academy", label: "Academy" },
];

export function Landing() {
  const written = TRACKS.filter((t) => t.status === "written");
  const sortedTracks = [...TRACKS].sort((a, b) => a.order - b.order);
  const modules = NAV.filter((n) => n.href !== "/dashboard" && n.href !== "/" && n.href !== "/settings");
  const academy = modules.find((m) => m.href === "/academy");
  const firstTrack = sortedTracks.find((t) => t.status === "written");
  const firstLesson = firstTrack ? LESSONS.find((l) => l.id === firstTrack.lessonIds[0]) : undefined;
  const others = modules.filter((m) => m.href !== "/academy");

  const stats = [
    { value: written.length, label: "Academy tracks ready", sub: `of ${TRACKS.length} planned` },
    { value: LESSONS.length, label: "Interactive lessons", sub: "quizzes and exercises in each" },
    { value: GLOSSARY_LIST.length, label: "Glossary terms", sub: "explained the first time they appear" },
    { value: LIVE_INSTRUMENTS.length, label: "Live markets", sub: "stocks, forex, gold and crypto" },
  ];

  return (
    <div className="min-h-dvh bg-canvas text-fg">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-line/70 bg-canvas/75 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 md:px-8">
          <Link href="/" className="flex items-center gap-2.5" aria-label="Trader OS home">
            <LogoMark className="size-8" />
            <span className="text-[17px] font-semibold tracking-tight">
              Trader <span className="text-accent-strong">OS</span>
            </span>
          </Link>
          <nav aria-label="Sections" className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((l) => (
              <a key={l.href} href={l.href} className="rounded-lg px-3 py-2 text-[14px] text-fg-muted transition-colors hover:text-fg">
                {l.label}
              </a>
            ))}
          </nav>
          <nav aria-label="Account" className="flex items-center gap-2">
            <HeaderActions />
          </nav>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div aria-hidden className="hero-grid pointer-events-none absolute inset-0" />
          <div aria-hidden className="pointer-events-none absolute left-1/2 top-[-20%] h-[640px] w-[1100px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(123,110,246,0.28),transparent)]" />
          <div aria-hidden className="pointer-events-none absolute right-[-10%] top-[30%] h-[420px] w-[520px] rounded-full bg-[radial-gradient(closest-side,rgba(46,189,133,0.12),transparent)]" />
          <HeroCandles />

          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pb-20 pt-16 md:px-8 md:pt-24 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14 lg:pb-28">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent-soft px-3 py-1.5 text-[12px] font-medium text-accent-strong">
                <span className="flex size-1.5 rounded-full bg-up" aria-hidden />
                Trading academy + live practice desk
              </p>
              <h1 className="mt-6 text-[2.75rem] font-semibold leading-[1.04] tracking-[-0.035em] sm:text-6xl lg:text-[3.75rem] xl:text-[4.25rem]">
                <span className="lg:whitespace-nowrap">Master the markets.</span>
                <br />
                <span className="text-gradient lg:whitespace-nowrap">Without the risk.</span>
              </h1>
              <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-fg-body md:text-lg">
                Trader OS takes you from your first lesson to your own tested strategy. Learn how stocks, forex, gold and crypto really move, watch live markets and news, and practise with simulated money until your decisions are sharp.
              </p>
              <Ctas className="mt-9" />
              <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-fg-muted">
                {["Free to start", "No broker, no real orders", "No signals or hype"].map((t) => (
                  <li key={t} className="inline-flex items-center gap-1.5">
                    <Check className="size-4 text-up" strokeWidth={2.25} aria-hidden /> {t}
                  </li>
                ))}
              </ul>
            </div>
            <HeroPulse />
          </div>
        </section>

        <TickerTape />

        {/* Stats */}
        <section aria-label="Trader OS in numbers" className="border-b border-line">
          <ul className="mx-auto grid max-w-7xl grid-cols-2 px-4 md:px-8 lg:grid-cols-4">
            {stats.map((s, i) => (
              <li key={s.label} className={cn("px-2 py-10 md:px-6", i % 2 === 1 && "border-l border-line", i >= 2 && "border-t border-line lg:border-t-0", i === 2 && "lg:border-l")}>
                <p className="text-4xl font-semibold tracking-tight tabular md:text-5xl">{s.value}</p>
                <p className="mt-2 text-[14px] font-medium">{s.label}</p>
                <p className="mt-0.5 text-[12px] text-fg-subtle">{s.sub}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Markets */}
        <section id="markets" aria-labelledby="markets-h" className="scroll-mt-20 border-b border-line">
          <div className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-24">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <SectionHead
                id="markets-h"
                eyebrow="Markets, live"
                title="Watch real markets while you learn."
                text="Stocks and index funds, major currency pairs, gold and crypto, refreshed from named data providers. Every price says where it came from, and nothing is ever made up."
              />
              <Link href="/market-desk" className="inline-flex items-center gap-1.5 text-[14px] font-medium text-accent-strong hover:underline">
                Open the Market Desk <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="mt-10">
              <MarketBoard />
            </div>
          </div>
        </section>

        {/* News */}
        <section id="news" aria-labelledby="news-h" className="scroll-mt-20 border-b border-line bg-surface/40">
          <div className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-24">
            <SectionHead
              id="news-h"
              eyebrow="Market news"
              title="The headlines moving markets today."
              text="Live from major financial news sources, with likely market-moving stories flagged. The Academy teaches you how to read them without overreacting."
            />
            <div className="mt-10">
              <NewsBoard />
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" aria-labelledby="features-h" className="scroll-mt-20 border-b border-line">
          <div className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-24">
            <SectionHead
              id="features-h"
              eyebrow="Everything in one place"
              title="One workspace for your whole trading education."
              text="The Academy is the heart of it. The other sections are being built in phases; the ones not ready yet are clearly marked."
            />
            <div className="mt-12 grid gap-4 lg:grid-cols-3">
              {academy && (
                <div className="relative overflow-hidden rounded-2xl border border-line bg-linear-to-br from-accent/15 via-panel to-panel p-7 lg:row-span-2">
                  <div aria-hidden className="absolute -right-16 -top-16 size-56 rounded-full bg-accent/20 blur-3xl" />
                  <div className="relative">
                    <span className="grid size-11 place-items-center rounded-xl border border-accent/30 bg-accent-soft">
                      <academy.icon className="size-5 text-accent-strong" strokeWidth={1.75} />
                    </span>
                    <h3 className="mt-5 text-2xl font-semibold tracking-tight">{academy.label}</h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-fg-muted">
                      {TRACKS.length} tracks from market basics to backtesting, {written.length} ready now. {academy.purpose}
                    </p>
                    <ul className="mt-6 space-y-2">
                      {written.slice(0, 5).map((t) => (
                        <li key={t.id} className="flex items-center justify-between gap-3 rounded-lg border border-line bg-canvas/50 px-3.5 py-2.5 text-[13px]">
                          <span className="flex min-w-0 items-center gap-2.5">
                            <span className="w-5 shrink-0 text-right text-[11px] tabular text-fg-subtle">{t.order}</span>
                            <span className="truncate font-medium">{t.title}</span>
                          </span>
                          <span className="shrink-0 text-[11px] tabular text-fg-subtle">{t.lessonIds.length} lessons</span>
                        </li>
                      ))}
                    </ul>
                    <a href="#academy" className="mt-5 inline-flex items-center gap-1.5 text-[14px] font-medium text-accent-strong hover:underline">
                      See every track <ArrowRight className="size-4" />
                    </a>
                  </div>
                </div>
              )}
              <ul className="grid gap-4 sm:grid-cols-2 lg:col-span-2">
                {others.map((m) => {
                  const Icon = m.icon;
                  const built = isBuilt(m);
                  return (
                    <li key={m.href} className="group flex flex-col rounded-2xl border border-line bg-panel p-6 transition-colors hover:border-line-strong">
                      <div className="flex items-center justify-between gap-2">
                        <span className="grid size-10 place-items-center rounded-xl border border-line-strong bg-raised">
                          <Icon className="size-[18px] text-accent-strong" strokeWidth={1.75} />
                        </span>
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.08em]",
                            built ? "border-up/30 bg-up-soft text-up" : "border-line-strong text-fg-subtle",
                          )}
                        >
                          {!built && <Lock className="size-2.5" aria-hidden />}
                          {built ? "Available" : "Coming soon"}
                        </span>
                      </div>
                      <h3 className="mt-4 text-[17px] font-semibold tracking-tight">{m.label}</h3>
                      <p className="mt-1.5 text-[14px] leading-relaxed text-fg-muted">{m.purpose}</p>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how" aria-labelledby="how-h" className="scroll-mt-20 border-b border-line bg-surface/40">
          <div className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-24">
            <SectionHead id="how-h" eyebrow="How it works" title="From zero to a tested plan, in four steps." center />
            <ol className="relative mt-14 grid gap-6 md:grid-cols-4">
              <div aria-hidden className="absolute left-[12.5%] right-[12.5%] top-6 hidden h-px bg-linear-to-r from-accent/0 via-accent/50 to-accent/0 md:block" />
              {STEPS.map(({ icon: Icon, title, text }, i) => (
                <li key={title} className="relative text-center">
                  <span className="relative mx-auto grid size-12 place-items-center rounded-2xl border border-accent/40 bg-canvas shadow-[0_0_30px_-6px_rgba(123,110,246,0.6)]">
                    <Icon className="size-5 text-accent-strong" strokeWidth={1.75} />
                  </span>
                  <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-fg-subtle">Step {i + 1}</p>
                  <h3 className="mt-1.5 text-xl font-semibold tracking-tight">{title}</h3>
                  <p className="mx-auto mt-2 max-w-[30ch] text-[14px] leading-relaxed text-fg-muted">{text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Academy tracks */}
        <section id="academy" aria-labelledby="academy-h" className="scroll-mt-20 border-b border-line">
          <div className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-24">
            <SectionHead
              id="academy-h"
              eyebrow="The curriculum"
              title="The Academy, track by track."
              text="Tracks unlock in order, so each builds on the last. Planned tracks are listed so you can see where the course is going."
            />
            <ol className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {sortedTracks.map((t) => {
                const ready = t.status === "written";
                return (
                  <li key={t.id} className={cn("flex gap-4 rounded-xl border p-4", ready ? "border-line bg-panel" : "border-dashed border-line bg-transparent")}>
                    <span
                      className={cn(
                        "grid size-9 shrink-0 place-items-center rounded-lg text-[13px] font-semibold tabular",
                        ready ? "bg-accent-soft text-accent-strong" : "bg-raised text-fg-subtle",
                      )}
                    >
                      {t.order}
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={cn("text-[15px] font-medium", !ready && "text-fg-muted")}>{t.title}</span>
                        {ready ? (
                          <span className="text-[11px] tabular text-fg-subtle">{t.lessonIds.length} lessons</span>
                        ) : (
                          <span className="rounded-full border border-line-strong px-1.5 text-[10px] uppercase tracking-[0.06em] text-fg-subtle">Planned</span>
                        )}
                      </div>
                      <p className="mt-1 text-[13px] leading-snug text-fg-muted">{t.summary}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>

        {/* Promises */}
        <section aria-labelledby="promises-h" className="border-b border-line">
          <div className="mx-auto max-w-7xl px-4 py-20 md:px-8">
            <SectionHead id="promises-h" eyebrow="Our promise" title="Honest by design." center />
            <ul className="mt-12 grid gap-4 md:grid-cols-3">
              {PROMISES.map(({ icon: Icon, title, text }) => (
                <li key={title} className="rounded-2xl border border-line bg-panel p-7">
                  <span className="grid size-11 place-items-center rounded-xl border border-up/25 bg-up-soft">
                    <Icon className="size-5 text-up" strokeWidth={1.75} />
                  </span>
                  <h3 className="mt-5 text-lg font-semibold tracking-tight">{title}</h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-fg-muted">{text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Final CTA */}
        <section aria-labelledby="start-h">
          <div className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28">
            <div className="relative overflow-hidden rounded-3xl border border-accent/30 bg-linear-to-br from-accent/25 via-panel to-panel px-6 py-14 text-center md:px-12 md:py-20">
              <div aria-hidden className="hero-grid pointer-events-none absolute inset-0 opacity-60" />
              <div aria-hidden className="absolute -bottom-24 left-1/2 h-64 w-[700px] -translate-x-1/2 rounded-full bg-accent/25 blur-3xl" />
              <div className="relative">
                <LineChart className="mx-auto size-8 text-accent-strong" strokeWidth={1.75} />
                <h2 id="start-h" className="mx-auto mt-5 text-balance max-w-2xl text-3xl font-semibold leading-tight tracking-[-0.02em] md:text-5xl">
                  {firstLesson ? `Your first lesson takes about ${firstLesson.minutes} minutes.` : "Start with the first lesson."}
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-[16px] leading-relaxed text-fg-muted">
                  {firstTrack?.title ?? "The first track"} assumes no prior knowledge. Create a free account and your progress, quiz results and streak follow you to your dashboard.
                </p>
                <Ctas className="mt-9" center />
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
          <div className="flex flex-wrap items-start justify-between gap-8">
            <div className="max-w-sm">
              <Link href="/" className="flex items-center gap-2.5">
                <LogoMark />
                <span className="text-[15px] font-semibold tracking-tight">
                  Trader <span className="text-accent-strong">OS</span>
                </span>
              </Link>
              <p className="mt-3 text-[13px] leading-relaxed text-fg-muted">Learn, practise and review. A trading academy and practice workspace in one.</p>
            </div>
            <nav aria-label="Footer" className="flex flex-wrap gap-x-8 gap-y-2 text-[13px] text-fg-muted">
              {NAV_LINKS.map((l) => (
                <a key={l.href} href={l.href} className="hover:text-fg">
                  {l.label}
                </a>
              ))}
              <Link href="/login" className="hover:text-fg">Log in</Link>
              <Link href="/signup" className="hover:text-fg">Sign up</Link>
            </nav>
          </div>
          <p className="mt-10 border-t border-line pt-6 text-[12px] leading-relaxed text-fg-subtle">
            Trader OS is educational software. It does not provide financial, investment or tax advice, does not recommend any trade, and never places real orders. Market data is shown for learning and may be delayed or incomplete. Trading real money carries a high risk of loss, and with leverage losses can grow quickly.
          </p>
          <p className="mt-2 text-[12px] text-fg-subtle">© Trader OS</p>
        </div>
      </footer>
    </div>
  );
}
