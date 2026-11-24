import "server-only";
import { fetchWithTimeout } from "../cache";
import { instrumentsIn } from "../instruments";
import type { Quote } from "../types";

/**
 * Finnhub. The free plan gives real-time US stock and fund quotes and a
 * general market news feed, at up to 60 requests a minute.
 * Sign up: https://finnhub.io/register  Docs: https://finnhub.io/docs/api
 *
 * The key is read from FINNHUB_API_KEY on the server and sent as a header,
 * so it never reaches the browser.
 */
export const finnhubKey = () => process.env.FINNHUB_API_KEY?.trim() || "";

export class MissingKeyError extends Error {}

async function finnhub<T>(path: string): Promise<T> {
  const key = finnhubKey();
  if (!key) throw new MissingKeyError("FINNHUB_API_KEY is not set.");
  const res = await fetchWithTimeout(`https://finnhub.io/api/v1${path}`, {
    headers: { "X-Finnhub-Token": key, Accept: "application/json" },
  });
  if (res.status === 401 || res.status === 403) throw new Error("Finnhub rejected the API key. Check FINNHUB_API_KEY.");
  if (res.status === 429) throw new Error("Finnhub's free-plan limit was reached. Prices resume within a minute.");
  if (!res.ok) throw new Error(`Finnhub answered ${res.status}.`);
  return (await res.json()) as T;
}

type FinnhubQuote = { c: number; d: number | null; dp: number | null; h: number; l: number; o: number; pc: number; t: number };

export async function fetchUsQuotes(): Promise<Quote[]> {
  const list = instrumentsIn("us");
  const results = await Promise.allSettled(
    list.map(async (inst) => {
      const q = await finnhub<FinnhubQuote>(`/quote?symbol=${encodeURIComponent(inst.providerSymbol)}`);
      // Finnhub answers an unknown or unavailable symbol with zeros.
      if (!q || !q.c) throw new Error(`Finnhub has no price for ${inst.symbol}.`);
      const quote: Quote = {
        symbol: inst.symbol,
        name: inst.name,
        price: q.c,
        change: q.d ?? (q.pc ? q.c - q.pc : null),
        changePct: q.dp ?? (q.pc ? ((q.c - q.pc) / q.pc) * 100 : null),
        high: q.h || null,
        low: q.l || null,
        changeBasis: "previous close",
        asOf: q.t ? q.t * 1000 : null,
        decimals: inst.decimals,
      };
      return quote;
    }),
  );
  const quotes = results.flatMap((r) => (r.status === "fulfilled" ? [r.value] : []));
  if (quotes.length === 0) {
    const first = results.find((r) => r.status === "rejected") as PromiseRejectedResult | undefined;
    throw first?.reason instanceof Error ? first.reason : new Error("Finnhub could not be reached.");
  }
  return quotes;
}

type FinnhubNews = {
  category: string;
  datetime: number;
  headline: string;
  id: number;
  related: string;
  source: string;
  summary: string;
  url: string;
};

export async function fetchFinnhubNews() {
  const items = await finnhub<FinnhubNews[]>("/news?category=general");
  if (!Array.isArray(items)) throw new Error("Finnhub sent an unexpected news response.");
  return items
    .filter((n) => n.headline && n.url && n.datetime)
    .map((n) => ({
      title: n.headline,
      url: n.url,
      source: n.source || "Finnhub",
      publishedAt: n.datetime * 1000,
      summary: n.summary || undefined,
    }));
}
