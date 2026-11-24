"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDownRight, ArrowUpRight, ExternalLink, Flame, Newspaper, Radio } from "lucide-react";
import { ago, usePoll, useTick } from "@/components/market/use-poll";
import type { NewsItem, NewsResponse, Quote, QuoteGroup, QuoteGroupId, QuotesResponse } from "@/lib/market/types";
import { cn } from "@/lib/cn";

/*
  Live market pieces for the public landing page. Every number comes from
  /api/market/quotes or /api/news (real providers, named on screen). When a
  provider has no data, the slot says so instead of showing a made-up price.
*/

const QUOTES_POLL = 10_000;
const NEWS_POLL = 60_000;

function useQuotes() {
  return usePoll<QuotesResponse>("/api/market/quotes", QUOTES_POLL);
}

function fmt(n: number, decimals: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function pct(n: number | null) {
  if (n === null) return "—";
  return `${n > 0 ? "+" : ""}${n.toFixed(2)}%`;
}

const dir = (n: number | null) => (n === null || n === 0 ? "flat" : n > 0 ? "up" : "down");

/** Briefly tints a price green or red when it changes between polls. */
function useFlash(price: number | undefined) {
  const prev = useRef(price);
  const [flash, setFlash] = useState<"up" | "down" | null>(null);
  useEffect(() => {
    if (price === undefined || prev.current === undefined || price === prev.current) {
      prev.current = price;
      return;
    }
    setFlash(price > prev.current ? "up" : "down");
    prev.current = price;
    const t = setTimeout(() => setFlash(null), 1100);
    return () => clearTimeout(t);
  }, [price]);
  return flash;
}

function Price({ q, className }: { q: Quote; className?: string }) {
  const flash = useFlash(q.price);
  return (
    <span
      className={cn(
        "tabular rounded px-1 -mx-1 transition-colors duration-700",
        flash === "up" && "bg-up-soft text-up",
        flash === "down" && "bg-down-soft text-down",
        className,
      )}
    >
      {fmt(q.price, q.decimals)}
    </span>
  );
}

function Change({ q, className }: { q: Quote; className?: string }) {
  const d = dir(q.changePct);
  const Icon = d === "down" ? ArrowDownRight : ArrowUpRight;
  return (
    <span className={cn("inline-flex items-center gap-0.5 tabular", d === "up" ? "text-up" : d === "down" ? "text-down" : "text-fg-muted", className)}>
      {d !== "flat" && <Icon className="size-3.5" strokeWidth={2} aria-hidden />}
      {pct(q.changePct)}
    </span>
  );
}

const allQuotes = (data: QuotesResponse | null) => (data?.groups ?? []).flatMap((g) => g.quotes.map((q) => ({ q, g })));

/* ------------------------------------------------------------------ */
/* Hero card: a compact live board                                     */
/* ------------------------------------------------------------------ */

const HERO_SYMBOLS = ["SPY", "QQQ", "EUR/USD", "XAU/USD", "BTC/USD", "ETH/USD"];

export function HeroPulse() {
  const { data, loading } = useQuotes();
  const news = usePoll<NewsResponse>("/api/news", NEWS_POLL);
  const now = useTick(5_000);
  const rows = allQuotes(data);
  const picked = HERO_SYMBOLS.map((s) => rows.find((r) => r.q.symbol === s)).filter(Boolean) as { q: Quote; g: QuoteGroup }[];
  const list = picked.length >= 4 ? picked : rows.slice(0, 6);
  const top = news.data?.items.find((n) => n.impact === "high") ?? news.data?.items[0];

  return (
    <div className="relative">
      <div aria-hidden className="absolute -inset-px rounded-2xl bg-linear-to-b from-accent/40 via-line to-transparent" />
      <div className="relative overflow-hidden rounded-2xl bg-panel/95 shadow-[0_30px_80px_-20px_rgba(123,110,246,0.35)] backdrop-blur">
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="flex gap-1" aria-hidden>
              <span className="size-2.5 rounded-full bg-down/70" />
              <span className="size-2.5 rounded-full bg-warn/70" />
              <span className="size-2.5 rounded-full bg-up/70" />
            </span>
            <span className="ml-2 text-[12px] font-medium text-fg-muted">Market pulse</span>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-up/30 bg-up-soft px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.08em] text-up">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-up opacity-60" />
              <span className="relative inline-flex size-1.5 rounded-full bg-up" />
            </span>
            Live
          </span>
        </div>

        <ul className="divide-y divide-line/70" aria-label="Live prices" aria-busy={loading && !data}>
          {!data &&
            Array.from({ length: 6 }).map((_, i) => (
              <li key={i} className="flex items-center justify-between px-4 py-3">
                <span className="h-3 w-24 animate-pulse rounded bg-raised" />
                <span className="h-3 w-20 animate-pulse rounded bg-raised" />
              </li>
            ))}
          {data && list.length === 0 && <li className="px-4 py-6 text-sm text-fg-muted">Live prices are unavailable right now. Nothing is shown rather than made-up numbers.</li>}
          {list.map(({ q, g }) => (
            <li key={q.symbol} className="grid grid-cols-[1fr_auto_auto] items-center gap-4 px-4 py-2.5">
              <div className="min-w-0">
                <p className="truncate text-[13px] font-semibold tracking-tight">{q.symbol}</p>
                <p className="truncate text-[11px] text-fg-subtle">{q.name}</p>
              </div>
              <Price q={q} className="text-right font-mono text-[13px]" />
              <span className="w-20 text-right">
                <Change q={q} className="text-[12px] font-medium" />
              </span>
              <span className="sr-only">via {g.provider}</span>
            </li>
          ))}
        </ul>

        <div className="border-t border-line bg-surface/60 px-4 py-3">
          <p className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.08em] text-fg-subtle">
            <Newspaper className="size-3" aria-hidden /> Top headline
          </p>
          {top ? (
            <a href={top.url} target="_blank" rel="noreferrer" className="group mt-1.5 block">
              <span className="line-clamp-2 text-[13px] leading-snug text-fg group-hover:text-accent-strong">
                {top.impact === "high" && <Flame className="mr-1 inline size-3.5 -translate-y-px text-warn" aria-label="Likely market-moving" />}
                {top.title}
              </span>
              <span className="mt-1 block text-[11px] text-fg-subtle">
                {top.source} · {ago(top.publishedAt, now)}
              </span>
            </a>
          ) : (
            <p className="mt-1.5 text-[12px] text-fg-subtle">{news.error ? "Headlines are unavailable right now." : "Loading headlines…"}</p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Ticker tape                                                         */
/* ------------------------------------------------------------------ */

export function TickerTape() {
  const { data } = useQuotes();
  const rows = allQuotes(data).map((r) => r.q);
  if (rows.length === 0) {
    return <div className="h-11 border-y border-line bg-surface" aria-hidden />;
  }
  const Item = ({ q }: { q: Quote }) => (
    <span className="flex shrink-0 items-center gap-2 px-5 text-[13px]">
      <span className="font-semibold tracking-tight text-fg">{q.symbol}</span>
      <span className="font-mono tabular text-fg-muted">{fmt(q.price, q.decimals)}</span>
      <Change q={q} className="text-[12px]" />
    </span>
  );
  return (
    <div className="ticker-mask relative overflow-hidden border-y border-line bg-surface" aria-label="Live price ticker">
      <div className="flex w-max animate-marquee py-3 hover:[animation-play-state:paused]">
        <div className="flex">{rows.map((q) => <Item key={q.symbol} q={q} />)}</div>
        <div className="flex" aria-hidden>{rows.map((q) => <Item key={q.symbol} q={q} />)}</div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Markets board with tabs                                             */
/* ------------------------------------------------------------------ */

const TABS: { id: QuoteGroupId; label: string }[] = [
  { id: "us", label: "Stocks & indices" },
  { id: "fx", label: "Forex & gold" },
  { id: "crypto", label: "Crypto" },
];

function RangeBar({ q }: { q: Quote }) {
  if (q.high === null || q.low === null || q.high <= q.low) return null;
  const pos = Math.min(100, Math.max(0, ((q.price - q.low) / (q.high - q.low)) * 100));
  return (
    <div className="mt-4">
      <div className="relative h-1 rounded-full bg-raised">
        <div className="absolute inset-y-0 left-0 rounded-full bg-linear-to-r from-down/60 via-fg-subtle/40 to-up/60" style={{ width: "100%" }} />
        <span className="absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-panel bg-fg" style={{ left: `${pos}%` }} />
      </div>
      <div className="mt-1.5 flex justify-between font-mono text-[10px] tabular text-fg-subtle">
        <span>L {fmt(q.low, q.decimals)}</span>
        <span>H {fmt(q.high, q.decimals)}</span>
      </div>
    </div>
  );
}

export function MarketBoard() {
  const { data, error } = useQuotes();
  const now = useTick(1_000);
  const [tab, setTab] = useState<QuoteGroupId>("us");
  const group = data?.groups.find((g) => g.id === tab);

  return (
    <div>
      <div role="tablist" aria-label="Market" className="inline-flex flex-wrap gap-1 rounded-xl border border-line bg-surface p-1">
        {TABS.map((t) => {
          const g = data?.groups.find((x) => x.id === t.id);
          const live = g?.status === "ok" && g.quotes.length > 0;
          return (
            <button
              key={t.id}
              role="tab"
              type="button"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-[13px] font-medium transition-colors",
                tab === t.id ? "bg-raised text-fg shadow-sm" : "text-fg-muted hover:text-fg",
              )}
            >
              {t.label}
              {live && <span className="size-1.5 rounded-full bg-up" aria-label="live" />}
            </button>
          );
        })}
      </div>

      <div className="mt-6" role="tabpanel">
        {!data && !error && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-36 animate-pulse rounded-xl border border-line bg-panel" />
            ))}
          </div>
        )}
        {!data && error && <p className="text-sm text-warn">Could not load prices: {error}</p>}
        {group && group.quotes.length === 0 && (
          <div className="rounded-xl border border-line bg-panel p-6 text-sm text-fg-muted">
            {group.message ?? "No prices are available right now."} Nothing is shown rather than made-up numbers.
          </div>
        )}
        {group && group.quotes.length > 0 && (
          <>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {group.quotes.map((q) => {
                const d = dir(q.changePct);
                return (
                  <li
                    key={q.symbol}
                    className={cn(
                      "group relative overflow-hidden rounded-xl border border-line bg-panel p-4 transition-colors hover:border-line-strong hover:bg-raised",
                    )}
                  >
                    <div
                      aria-hidden
                      className={cn(
                        "pointer-events-none absolute -right-8 -top-8 size-24 rounded-full blur-2xl transition-opacity group-hover:opacity-100",
                        d === "up" ? "bg-up/15" : d === "down" ? "bg-down/15" : "bg-accent/10",
                        "opacity-60",
                      )}
                    />
                    <div className="relative flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[14px] font-semibold tracking-tight">{q.symbol}</p>
                        <p className="truncate text-[12px] text-fg-subtle">{q.name}</p>
                      </div>
                      <Change q={q} className={cn("rounded-md px-1.5 py-0.5 text-[12px] font-medium", d === "up" ? "bg-up-soft" : d === "down" ? "bg-down-soft" : "bg-raised")} />
                    </div>
                    <p className="relative mt-3 font-mono text-2xl font-medium tracking-tight">
                      <Price q={q} />
                    </p>
                    <p className="relative mt-0.5 text-[11px] tabular text-fg-subtle">
                      {q.change !== null ? `${q.change > 0 ? "+" : ""}${fmt(q.change, q.decimals)}` : "—"} vs {q.changeBasis}
                    </p>
                    <div className="relative">
                      <RangeBar q={q} />
                    </div>
                  </li>
                );
              })}
            </ul>
            <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-fg-subtle">
              <span className="inline-flex items-center gap-1.5">
                <Radio className="size-3.5 text-up" aria-hidden />
                Real prices via{" "}
                <a href={group.providerUrl} target="_blank" rel="noreferrer" className="text-fg-muted underline-offset-2 hover:text-fg hover:underline">
                  {group.provider}
                </a>
              </span>
              {group.fetchedAt && <span>· updated {ago(group.fetchedAt, now)}</span>}
              {group.marketOpen === false && <span>· market closed now</span>}
              {group.id === "us" && <span>· index rows use the funds that track them</span>}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* News board                                                          */
/* ------------------------------------------------------------------ */

/** Some feeds repeat the headline as the summary; skip it then. */
function sameText(a: string, b: string) {
  const norm = (x: string) => x.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  const A = norm(a);
  const B = norm(b);
  return A.startsWith(B.slice(0, 40)) || B.startsWith(A.slice(0, 40));
}

function NewsCard({ n, now, featured }: { n: NewsItem; now: number; featured?: boolean }) {
  return (
    <a
      href={n.url}
      target="_blank"
      rel="noreferrer"
      className={cn(
        "group flex h-full flex-col rounded-xl border border-line bg-panel p-5 transition-colors hover:border-line-strong hover:bg-raised",
        featured && "bg-linear-to-br from-accent/10 via-panel to-panel md:p-7",
      )}
    >
      <div className="flex flex-wrap items-center gap-2 text-[11px]">
        <span className="font-medium text-fg-muted">{n.source}</span>
        <span className="text-fg-subtle">· {ago(n.publishedAt, now)}</span>
        {n.impact === "high" && (
          <span className="inline-flex items-center gap-1 rounded-full border border-warn/30 bg-warn-soft px-2 py-0.5 text-[10px] font-medium text-warn">
            <Flame className="size-3" aria-hidden /> Likely market-moving
          </span>
        )}
      </div>
      <h3 className={cn("mt-3 font-semibold leading-snug tracking-tight text-fg group-hover:text-accent-strong", featured ? "text-xl md:text-2xl" : "text-[15px]")}>
        {n.title}
      </h3>
      {n.summary && !sameText(n.summary, n.title) && (
        <p className={cn("mt-2 text-fg-muted", featured ? "line-clamp-4 text-[15px] leading-relaxed" : "line-clamp-2 text-[13px] leading-relaxed")}>{n.summary}</p>
      )}
      <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-4">
        {n.tags.slice(0, 3).map((t) => (
          <span key={t} className="rounded-md border border-line px-1.5 py-0.5 text-[10px] text-fg-subtle">
            {t}
          </span>
        ))}
        <ExternalLink className="ml-auto size-3.5 text-fg-subtle group-hover:text-accent-strong" aria-label="Opens the source" />
      </div>
    </a>
  );
}

export function NewsBoard() {
  const { data, error } = usePoll<NewsResponse>("/api/news", NEWS_POLL);
  const now = useTick(15_000);
  if (!data) {
    return (
      <div className="grid gap-3 md:grid-cols-3">
        {error ? (
          <p className="text-sm text-warn">Headlines are unavailable right now: {error}</p>
        ) : (
          Array.from({ length: 4 }).map((_, i) => <div key={i} className={cn("h-40 animate-pulse rounded-xl border border-line bg-panel", i === 0 && "md:col-span-2 md:row-span-2 md:h-auto")} />)
        )}
      </div>
    );
  }
  const items = [...data.items.filter((n) => n.impact === "high"), ...data.items.filter((n) => n.impact !== "high")].slice(0, 5);
  if (items.length === 0) return <p className="text-sm text-fg-muted">No headlines could be loaded right now.</p>;
  const [first, ...rest] = items;
  return (
    <div className="grid gap-3 md:grid-cols-3">
      <div className="md:col-span-2">
        <NewsCard n={first} now={now} featured />
      </div>
      {rest.map((n) => (
        <NewsCard key={n.id} n={n} now={now} />
      ))}
    </div>
  );
}
