"use client";

import { useEffect, useRef, useState } from "react";
import { ExternalLink, KeyRound, RefreshCw, TriangleAlert } from "lucide-react";
import { Panel } from "@/components/ui/panel";
import { DataBadge } from "@/components/ui/data-badge";
import { Term } from "@/components/ui/term";
import { cn } from "@/lib/cn";
import { explainerFor } from "@/lib/market/instruments";
import type { Quote, QuoteGroup, QuoteGroupId, QuotesResponse } from "@/lib/market/types";
import { ago, usePoll, useTick } from "./use-poll";

/** The browser asks our server every 15 s; the server asks each provider at its own pace. */
const POLL_MS = 10_000;

const fmt = (n: number, d: number) =>
  n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

function signed(n: number, d: number) {
  return `${n > 0 ? "+" : n < 0 ? "−" : ""}${fmt(Math.abs(n), d)}`;
}

function Row({ q, compact }: { q: Quote; compact: boolean }) {
  const prev = useRef(q.price);
  const [flash, setFlash] = useState<"up" | "down" | null>(null);
  useEffect(() => {
    if (q.price === prev.current) return;
    setFlash(q.price > prev.current ? "up" : "down");
    prev.current = q.price;
    const t = setTimeout(() => setFlash(null), 1200);
    return () => clearTimeout(t);
  }, [q.price]);

  const dir = q.change === null ? 0 : Math.sign(q.change);
  const tone = dir > 0 ? "text-up" : dir < 0 ? "text-down" : "text-fg-muted";
  const explainer = explainerFor(q.symbol);

  return (
    <tr className="hover:bg-raised/50">
      <td className="px-4 py-2">
        {explainer ? (
          <Term def={explainer}>
            <span className="font-mono text-[12px]">{q.symbol}</span>
          </Term>
        ) : (
          <span className="font-mono text-[12px]">{q.symbol}</span>
        )}
        <div className="text-[11px] text-fg-subtle">{q.name}</div>
      </td>
      <td
        className={cn(
          "px-2 py-2 text-right font-mono tabular transition-colors duration-700",
          flash === "up" && "bg-up-soft text-up",
          flash === "down" && "bg-down-soft text-down",
        )}
      >
        {fmt(q.price, q.decimals)}
      </td>
      <td className={cn("px-2 py-2 text-right font-mono tabular", tone, compact && "pr-4")}>
        {q.changePct === null ? "—" : `${signed(q.changePct, 2)}%`}
        {!compact && q.change !== null && (
          <div className="text-[11px] opacity-80">{signed(q.change, q.decimals)}</div>
        )}
      </td>
      {!compact && (
        <td className="hidden px-4 py-2 text-right font-mono text-[11px] tabular text-fg-subtle sm:table-cell">
          {q.high !== null && q.low !== null ? (
            <>
              <div>H {fmt(q.high, q.decimals)}</div>
              <div>L {fmt(q.low, q.decimals)}</div>
            </>
          ) : (
            "—"
          )}
        </td>
      )}
    </tr>
  );
}

function GroupStatusPill({ g }: { g: QuoteGroup }) {
  if (g.status === "missing_key" || g.status === "error") return <DataBadge source="none" />;
  if (g.status === "stale")
    return (
      <span
        title="The last refresh failed, so these are the most recent prices we have."
        className="inline-flex items-center gap-1 rounded-full border border-warn/25 bg-warn-soft px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.06em] text-warn"
      >
        <TriangleAlert className="size-3" /> Stale
      </span>
    );
  if (g.marketOpen === false)
    return (
      <span
        title="This market is closed. Prices shown are the last trades before it closed."
        className="inline-flex items-center gap-1.5 rounded-full border border-line-strong px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.06em] text-fg-muted"
      >
        <span className="size-1.5 rounded-full bg-fg-subtle" aria-hidden /> Closed · last price
      </span>
    );
  return <DataBadge source="live" />;
}

function GroupBlock({ g, compact, now }: { g: QuoteGroup; compact: boolean; now: number }) {
  return (
    <div className="border-b border-line last:border-b-0">
      <div className="flex flex-wrap items-center justify-between gap-2 bg-surface/60 px-4 py-2">
        <div className="flex items-center gap-2 text-[12px] font-medium">
          {g.label}
          <a
            href={g.providerUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-0.5 text-[11px] font-normal text-fg-subtle hover:text-fg-muted"
          >
            via {g.provider} <ExternalLink className="size-2.5" />
          </a>
        </div>
        <GroupStatusPill g={g} />
      </div>

      {g.quotes.length > 0 ? (
        <table className="w-full text-[13px]">
          <tbody className="divide-y divide-line">
            {g.quotes.map((q) => (
              <Row key={q.symbol} q={q} compact={compact} />
            ))}
          </tbody>
        </table>
      ) : (
        <div className="flex items-start gap-2 px-4 py-3 text-xs text-fg-muted">
          {g.status === "missing_key" ? (
            <KeyRound className="mt-0.5 size-3.5 shrink-0 text-fg-subtle" />
          ) : (
            <TriangleAlert className="mt-0.5 size-3.5 shrink-0 text-warn" />
          )}
          <span>{g.message ?? "No prices available right now."} Nothing is shown rather than made-up numbers.</span>
        </div>
      )}

      {g.quotes.length > 0 && (
        <p className="px-4 pb-2 pt-1 text-[11px] text-fg-subtle">
          {g.fetchedAt ? `Fetched ${ago(g.fetchedAt, now)}` : ""} · refreshed every{" "}
          {g.refreshSeconds >= 60 ? `${Math.round(g.refreshSeconds / 60)} min` : `${g.refreshSeconds}s`}
          {g.marketOpen === false ? " while closed" : ""} · change vs {g.quotes[0].changeBasis}
          {g.status === "stale" && g.message ? ` · ${g.message}` : ""}
        </p>
      )}
    </div>
  );
}

export function LiveQuotes({
  groups,
  symbols,
  compact = false,
  title = "Live prices",
  hint = "Real prices from market data providers. Hover a symbol to learn what it is.",
  className,
}: {
  groups?: QuoteGroupId[];
  /** Only show these symbols (a group with none of them still shows its setup message). */
  symbols?: string[];
  compact?: boolean;
  title?: string;
  hint?: string;
  className?: string;
}) {
  const { data, error, loading, lastLoaded, reload } = usePoll<QuotesResponse>("/api/market/quotes", POLL_MS);
  const now = useTick(1000);
  const shown = (data?.groups ?? [])
    .filter((g) => !groups || groups.includes(g.id))
    .map((g) => (symbols ? { ...g, quotes: g.quotes.filter((q) => symbols.includes(q.symbol)) } : g))
    .filter((g) => g.quotes.length > 0 || g.status === "missing_key" || g.status === "error");
  const anyLive = shown.some((g) => g.status === "ok" && g.marketOpen !== false && g.quotes.length > 0);

  return (
    <Panel
      title={title}
      hint={hint}
      source={data ? (anyLive ? undefined : "none") : undefined}
      className={className}
      bodyClassName="p-0"
      action={
        <button
          type="button"
          onClick={() => void reload()}
          className="grid size-6 place-items-center rounded-md text-fg-subtle hover:bg-raised hover:text-fg"
          aria-label="Refresh prices"
          title="Refresh now"
        >
          <RefreshCw className={cn("size-3.5", loading && "animate-spin")} />
        </button>
      }
    >
      {!data && loading && (
        <ul className="divide-y divide-line" aria-busy>
          {Array.from({ length: compact ? 5 : 8 }).map((_, i) => (
            <li key={i} className="flex items-center justify-between px-4 py-3">
              <span className="h-3 w-24 animate-pulse rounded bg-raised" />
              <span className="h-3 w-16 animate-pulse rounded bg-raised" />
            </li>
          ))}
        </ul>
      )}
      {!data && !loading && error && <p className="px-4 py-4 text-xs text-warn">Could not load prices: {error}</p>}
      {shown.map((g) => (
        <GroupBlock key={g.id} g={g} compact={compact} now={now} />
      ))}
      {data && (
        <p className="border-t border-line px-4 py-2 text-[11px] text-fg-subtle">
          {lastLoaded ? `Checked ${ago(lastLoaded, now)}.` : ""}
          {error ? ` Last check failed: ${error}.` : ""}
          {shown.some((g) => g.id === "us" && g.quotes.length > 0)
            ? " Index rows use the funds that track them; their price is not the index level."
            : ""}
        </p>
      )}
    </Panel>
  );
}
