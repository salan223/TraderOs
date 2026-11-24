"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Fetch JSON from one of our API routes every `intervalMs`, pausing while the
 * tab is hidden and refreshing at once when it comes back. Keeps the last
 * good answer if a refresh fails.
 */
export function usePoll<T>(url: string, intervalMs: number) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastLoaded, setLastLoaded] = useState<number | null>(null);
  const busy = useRef(false);

  const load = useCallback(async () => {
    if (busy.current) return;
    busy.current = true;
    try {
      const res = await fetch(url, { cache: "no-store" });
      const body = (await res.json().catch(() => null)) as (T & { error?: string }) | null;
      if (!res.ok || !body) throw new Error(body?.error ?? `The server answered ${res.status}.`);
      setData(body);
      setError(null);
      setLastLoaded(Date.now());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not reach the server.");
    } finally {
      busy.current = false;
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    let id: ReturnType<typeof setInterval> | undefined;
    const start = () => {
      clearInterval(id);
      id = setInterval(() => void load(), intervalMs);
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        void load();
        start();
      } else clearInterval(id);
    };
    void load();
    start();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [load, intervalMs]);

  return { data, error, loading, lastLoaded, reload: load };
}

/** "just now", "12s ago", "4m ago", "3h ago", or a date. */
export function ago(ms: number, now: number) {
  const s = Math.max(0, Math.round((now - ms) / 1000));
  if (s < 5) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return new Date(ms).toLocaleDateString([], { month: "short", day: "numeric" });
}

/** A clock that ticks every `ms`, for "updated 12s ago" labels. */
export function useTick(ms = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(id);
  }, [ms]);
  return now;
}
