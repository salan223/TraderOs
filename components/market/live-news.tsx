"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ExternalLink, Flame, RefreshCw, Search } from "lucide-react";
import { Panel } from "@/components/ui/panel";
import { cn } from "@/lib/cn";
import { IMPACT_NOTE } from "@/lib/market/impact";
import type { NewsResponse } from "@/lib/market/types";
import { ago, usePoll, useTick } from "./use-poll";

/** The server refreshes each source once a minute; the browser checks every 30 s. */
const POLL_MS = 30_000;

type Filter = "all" | "high";

export function LiveNews({
  compact = false,
  limit,
  title = "Live market news",
  hint = "Headlines from major financial news sources, newest first. Updated every minute.",
  className,
  listClassName,
}: {
  compact?: boolean;
  limit?: number;
  title?: string;
  hint?: string;
  className?: string;
  listClassName?: string;
}) {
  const { data, error, loading, lastLoaded, reload } = usePoll<NewsResponse>("/api/news", POLL_MS);
  const now = useTick(5000);
  const [filter, setFilter] = useState<Filter>(compact ? "high" : "all");
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState<string | null>(null);

  // Mark headlines that arrived after the page was opened.
  const firstSeen = useRef<Set<string> | null>(null);
  useEffect(() => {
    if (data && !firstSeen.current) firstSeen.current = new Set(data.items.map((n) => n.id));
  }, [data]);

  const allTags = useMemo(() => {
    const counts = new Map<string, number>();
    for (const n of data?.items ?? []) for (const t of n.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([t]) => t);
  }, [data]);

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = (data?.items ?? []).filter(
      (n) =>
        (filter === "all" || n.impact === "high") &&
        (!tag || n.tags.includes(tag)) &&
        (!q || n.title.toLowerCase().includes(q) || n.source.toLowerCase().includes(q)),
    );
    // In the compact card, fall back to all headlines if nothing is flagged.
    if (compact && list.length === 0 && filter === "high") list = data?.items ?? [];
    return limit ? list.slice(0, limit) : list;
  }, [data, filter, tag, query, limit, compact]);

  const okSources = data?.sources.filter((s) => s.status === "ok") ?? [];
  const highCount = data?.items.filter((n) => n.impact === "high").length ?? 0;

  return (
    <Panel
      title={title}
      hint={hint}
      source={data ? (okSources.length ? "live" : "none") : undefined}
      className={className}
      bodyClassName="p-0 flex min-h-0 flex-col"
      action={
        <button
          type="button"
          onClick={() => void reload()}
          className="grid size-6 place-items-center rounded-md text-fg-subtle hover:bg-raised hover:text-fg"
          aria-label="Refresh news"
          title="Refresh now"
        >
          <RefreshCw className={cn("size-3.5", loading && "animate-spin")} />
        </button>
      }
    >
      {!compact && (
        <div className="space-y-2 border-b border-line px-4 py-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-lg border border-line bg-surface p-0.5 text-[12px]">
              {(["all", "high"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  className={cn(
                    "rounded-md px-2.5 py-1",
                    filter === f ? "bg-raised text-fg" : "text-fg-subtle hover:text-fg-muted",
                  )}
                >
                  {f === "all" ? "All headlines" : (
                    <span className="inline-flex items-center gap-1">
                      <Flame className="size-3 text-warn" /> Likely market-moving
                      {data ? <span className="text-fg-subtle">({highCount})</span> : null}
                    </span>
                  )}
                </button>
              ))}
            </div>
            <label className="flex min-w-[10rem] flex-1 items-center gap-1.5 rounded-lg border border-line bg-surface px-2 py-1 text-[12px]">
              <Search className="size-3.5 text-fg-subtle" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search headlines (e.g. Fed, Nvidia, oil)"
                className="w-full bg-transparent text-fg placeholder:text-fg-subtle focus:outline-none"
              />
            </label>
          </div>
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {allTags.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTag(tag === t ? null : t)}
                  className={cn(
                    "rounded-full border px-2 py-0.5 text-[11px]",
                    tag === t ? "border-accent/40 bg-accent-soft text-accent-strong" : "border-line text-fg-subtle hover:text-fg-muted",
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {!data && loading && (
        <ul className="divide-y divide-line" aria-busy>
          {Array.from({ length: compact ? 4 : 8 }).map((_, i) => (
            <li key={i} className="space-y-2 px-4 py-3">
              <span className="block h-3 w-4/5 animate-pulse rounded bg-raised" />
              <span className="block h-2.5 w-1/3 animate-pulse rounded bg-raised" />
            </li>
          ))}
        </ul>
      )}
      {!data && !loading && error && <p className="px-4 py-4 text-xs text-warn">Could not load news: {error}</p>}
      {data && items.length === 0 && (
        <p className="px-4 py-6 text-center text-xs text-fg-subtle">
          {data.items.length === 0
            ? "No headlines could be loaded from any source right now. Nothing is shown rather than made-up news."
            : "No headlines match this filter."}
        </p>
      )}

      <ul className={cn("min-h-0 divide-y divide-line", !compact && "overflow-y-auto", listClassName)}>
        {items.map((n) => {
          const fresh = firstSeen.current && !firstSeen.current.has(n.id);
          return (
            <li key={n.id} className={cn("px-4 py-2.5 hover:bg-raised/40", fresh && "bg-accent-soft/50")}>
              <a href={n.url} target="_blank" rel="noreferrer" className="group block">
                <div className="flex items-start gap-2">
                  {n.impact === "high" && (
                    <Flame className="mt-0.5 size-3.5 shrink-0 text-warn" aria-label="Likely market-moving" />
                  )}
                  <span className="text-[13px] leading-snug text-fg group-hover:text-accent-strong">
                    {n.title}
                    <ExternalLink className="ml-1 inline size-2.5 text-fg-subtle opacity-0 group-hover:opacity-100" />
                  </span>
                </div>
                {!compact && n.summary && (
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-fg-subtle">{n.summary}</p>
                )}
                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-fg-subtle">
                  {fresh && <span className="font-medium text-accent-strong">New</span>}
                  <span className="text-fg-muted">{n.source}</span>
                  <span title={new Date(n.publishedAt).toLocaleString()}>{ago(n.publishedAt, now)}</span>
                  {!compact &&
                    n.tags.map((t) => (
                      <span key={t} className="rounded border border-line px-1.5 leading-4">
                        {t}
                      </span>
                    ))}
                </div>
              </a>
            </li>
          );
        })}
      </ul>

      {data && (
        <div className="mt-auto border-t border-line px-4 py-2 text-[11px] leading-relaxed text-fg-subtle">
          {lastLoaded ? `Checked ${ago(lastLoaded, now)}. ` : ""}
          {error ? `Last check failed: ${error}. ` : ""}
          {!compact && (
            <>
              <span>{IMPACT_NOTE} </span>
              <details className="mt-1">
                <summary className="cursor-pointer select-none hover:text-fg-muted">
                  Sources ({okSources.length} of {data.sources.length} working)
                </summary>
                <ul className="mt-1 space-y-0.5">
                  {data.sources.map((s) => (
                    <li key={s.id} className="flex gap-2">
                      <span
                        className={cn(
                          "mt-1.5 size-1.5 shrink-0 rounded-full",
                          s.status === "ok" ? "bg-up" : s.status === "missing_key" ? "bg-fg-subtle" : "bg-warn",
                        )}
                        aria-hidden
                      />
                      <span>
                        {s.name}: {s.status === "ok" ? `${s.count} headlines` : s.message ?? "unavailable"}
                      </span>
                    </li>
                  ))}
                </ul>
              </details>
            </>
          )}
          {compact && <span>Flame = likely market-moving (keyword match, not a prediction).</span>}
        </div>
      )}
    </Panel>
  );
}

/**
 * A few of the latest likely market-moving headlines, without a panel around
 * them, for use inside another card (the dashboard briefing).
 */
export function TopHeadlines({ count = 3 }: { count?: number }) {
  const { data, error } = usePoll<NewsResponse>("/api/news", 60_000);
  const now = useTick(15_000);
  if (!data) {
    return (
      <p className="text-xs text-fg-subtle">{error ? `News unavailable: ${error}` : "Loading the latest headlines…"}</p>
    );
  }
  const high = data.items.filter((n) => n.impact === "high");
  const list = (high.length ? high : data.items).slice(0, count);
  if (list.length === 0) return <p className="text-xs text-fg-subtle">No headlines could be loaded right now.</p>;
  return (
    <ul className="space-y-2">
      {list.map((n) => (
        <li key={n.id}>
          <a href={n.url} target="_blank" rel="noreferrer" className="group block">
            <span className="flex items-start gap-1.5 text-[12px] leading-snug text-fg group-hover:text-accent-strong">
              {n.impact === "high" && <Flame className="mt-0.5 size-3 shrink-0 text-warn" aria-label="Likely market-moving" />}
              {n.title}
            </span>
            <span className="mt-0.5 block text-[11px] text-fg-subtle">
              {n.source} · {ago(n.publishedAt, now)}
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}
