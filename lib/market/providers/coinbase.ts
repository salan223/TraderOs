import "server-only";
import { fetchWithTimeout } from "../cache";
import { instrumentsIn } from "../instruments";
import type { Quote } from "../types";

/**
 * Coinbase Exchange public market data. Free, real time, no account or key.
 * Docs: https://docs.cdp.coinbase.com/exchange/reference/exchangerestapi_getproductstats
 *
 * /stats gives the last trade price and the open, high and low of the last
 * 24 hours, so "change" here is versus 24 hours ago (crypto has no close).
 */
type Stats = { open?: string; high?: string; low?: string; last?: string };

const num = (s: string | undefined) => {
  const n = s === undefined ? NaN : Number(s);
  return Number.isFinite(n) ? n : null;
};

export async function fetchCryptoQuotes(): Promise<Quote[]> {
  const list = instrumentsIn("crypto");
  const results = await Promise.allSettled(
    list.map(async (inst) => {
      const res = await fetchWithTimeout(
        `https://api.exchange.coinbase.com/products/${inst.providerSymbol}/stats`,
        { headers: { Accept: "application/json", "User-Agent": "TraderOS/1.0" } },
      );
      if (!res.ok) throw new Error(`Coinbase answered ${res.status} for ${inst.symbol}.`);
      const s = (await res.json()) as Stats;
      const last = num(s.last);
      const open = num(s.open);
      if (last === null) throw new Error(`Coinbase sent no price for ${inst.symbol}.`);
      const change = open !== null ? last - open : null;
      const q: Quote = {
        symbol: inst.symbol,
        name: inst.name,
        price: last,
        change,
        changePct: change !== null && open ? (change / open) * 100 : null,
        high: num(s.high),
        low: num(s.low),
        changeBasis: "24 hours ago",
        asOf: Date.now(),
        decimals: inst.decimals,
      };
      return q;
    }),
  );
  const quotes = results.flatMap((r) => (r.status === "fulfilled" ? [r.value] : []));
  if (quotes.length === 0) {
    const first = results.find((r) => r.status === "rejected") as PromiseRejectedResult | undefined;
    throw new Error(first?.reason instanceof Error ? first.reason.message : "Coinbase could not be reached.");
  }
  return quotes;
}
