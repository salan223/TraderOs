"use client";

import { useEffect, useState } from "react";
import type { HistoryResponse } from "@/lib/market/history";

/** Loads real daily history for one symbol from /api/market/history (cached on the server). */
export function useHistory(symbol: string) {
  const [data, setData] = useState<HistoryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    fetch(`/api/market/history?symbol=${encodeURIComponent(symbol)}`, { cache: "no-store" })
      .then(async (r) => {
        const body = (await r.json().catch(() => null)) as (HistoryResponse & { error?: string }) | null;
        if (!alive) return;
        if (!r.ok || !body) throw new Error(body?.error ?? `The server answered ${r.status}.`);
        setData(body);
        if (body.error && body.bars.length === 0) setError(body.error);
      })
      .catch((e: unknown) => alive && setError(e instanceof Error ? e.message : "Could not load price history."))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [symbol]);
  return { data, error, loading };
}
