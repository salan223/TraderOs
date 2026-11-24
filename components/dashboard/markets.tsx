"use client";

import { Panel } from "@/components/ui/panel";
import { Term } from "@/components/ui/term";
import { LiveQuotes } from "@/components/market/live-quotes";
import { TopHeadlines } from "@/components/market/live-news";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { useNow } from "@/lib/use-now";
import { SESSIONS, US_STOCKS, sessionStatus, forexSessionStatus, forexWeekOpen, formatCountdown } from "@/lib/sessions";

function StatusDot({ open }: { open: boolean | null }) {
  return (
    <span
      className={cn("inline-block size-1.5 rounded-full", open === null ? "bg-fg-subtle" : open ? "bg-up" : "bg-fg-subtle/60")}
      aria-hidden
    />
  );
}

const fmtLocal = (d: Date) => d.toLocaleTimeString([], { weekday: "short", hour: "2-digit", minute: "2-digit" });

/** Which markets are open right now. Computed from your clock; no prices. */
export function MarketOverview() {
  const now = useNow();
  const fx = now ? forexWeekOpen(now) : null;
  const us = now ? sessionStatus(US_STOCKS, now) : null;

  const rows = [
    { name: "Forex", detail: "Major currency pairs", open: fx, note: "Sun 17:00 – Fri 17:00 New York time" },
    { name: "Gold", detail: "XAU/USD", open: fx, note: "Nearly 24h on weekdays, follows forex hours" },
    { name: "US indices", detail: "S&P 500, Nasdaq 100", open: us?.open ?? null, note: us ? (us.open ? `Closes in ${formatCountdown(us.nextChange.getTime() - now!.getTime())}` : `Opens ${fmtLocal(us.nextChange)}`) : "" },
    { name: "Crypto", detail: "Bitcoin, Ethereum", open: now ? true : null, note: "Trades 24/7, including weekends" },
  ];

  return (
    <Panel
      title="Market overview"
      hint="Which markets are open now, from your clock. Live prices are on the Market Desk."
      source="computed"
      bodyClassName="p-0"
    >
      <ul className="divide-y divide-line">
        {rows.map((r) => (
          <li key={r.name} className="flex items-center justify-between gap-3 px-4 py-2.5">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[13px] font-medium">
                <StatusDot open={r.open} />
                {r.name}
                <span className="text-xs font-normal text-fg-subtle">{r.detail}</span>
              </div>
              <div className="mt-0.5 pl-3.5 text-[11px] text-fg-subtle">{r.note}</div>
            </div>
            <span className={cn("text-xs", r.open ? "text-up" : "text-fg-subtle")}>
              {r.open === null ? "…" : r.open ? "Open" : "Closed"}
            </span>
          </li>
        ))}
      </ul>
      <p className="border-t border-line px-4 py-2 text-[11px] text-fg-subtle">Ignores public holidays and early closes.</p>
    </Panel>
  );
}

/** Daily briefing: trading sessions in your local time, plus the latest market-moving headlines. */
export function DailyBriefing() {
  const now = useNow();
  const tz = typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : "";

  return (
    <Panel
      title="Daily market briefing"
      hint={`Trading sessions in your time zone${tz ? ` (${tz})` : ""}, and the latest headlines.`}
      source="computed"
    >
      <p className="text-xs leading-relaxed text-fg-muted">
        Forex trades around the clock in four overlapping{" "}
        <Term id="session">sessions</Term>.
        Activity and{" "}
        <Term id="volatility">volatility</Term>{" "}
        are usually highest when London and New York overlap.
      </p>
      <ul className="mt-3 grid grid-cols-2 gap-2">
        {SESSIONS.map((s) => {
          const st = now ? forexSessionStatus(s, now) : null;
          return (
            <li key={s.id} className={cn("rounded-lg border px-3 py-2", st?.open ? "border-up/25 bg-up-soft" : "border-line bg-surface")}>
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium">{s.name}</span>
                <span className={cn("text-[11px]", st?.open ? "text-up" : "text-fg-subtle")}>{st ? (st.open ? "Open" : "Closed") : "…"}</span>
              </div>
              <div className="mt-0.5 font-mono text-[11px] tabular text-fg-subtle">
                {st && now ? `${st.open ? "Closes" : "Opens"} in ${formatCountdown(st.nextChange.getTime() - now.getTime())}` : " "}
              </div>
            </li>
          );
        })}
      </ul>
      <div className="mt-3 rounded-lg border border-line bg-surface px-3 py-2.5">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="text-[11px] uppercase tracking-[0.06em] text-fg-subtle">Top headlines</span>
          <Link href="/market-desk" className="text-[11px] text-accent-strong hover:underline">All news</Link>
        </div>
        <TopHeadlines count={3} />
      </div>
    </Panel>
  );
}

/** Starter markets with live prices (a short list; the full one is on the Market Desk). */
export function Watchlist() {
  return (
    <LiveQuotes
      compact
      title="Watchlist"
      hint="Starter markets with real prices. Hover a symbol to learn what it is."
      symbols={["SPY", "QQQ", "NVDA", "EUR/USD", "GBP/USD", "USD/JPY", "XAU/USD", "BTC/USD", "ETH/USD"]}
    />
  );
}
