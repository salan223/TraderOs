import "server-only";
import { fetchWithTimeout } from "../cache";
import { instrumentsIn } from "../instruments";
import type { Quote } from "../types";

/**
 * Twelve Data. The free "Basic" plan gives real-time forex and gold quotes,
 * limited to 8 credits a minute and 800 a day (one credit per symbol).
 * Sign up: https://twelvedata.com/register  Docs: https://twelvedata.com/docs#quote
 *
 * With 7 symbols, one refresh costs 7 credits. Instead of a fixed interval,
 * the refresh is paced from the daily budget: the credits left today are
 * spread evenly over the time left until the daily reset (00:00 UTC), so the
 * key never runs out however long the app stays open. Early in a fresh day
 * that is about every 12 minutes; with plenty of credits and little time
 * left it speeds up, but never below the per-minute floor.
 *
 * Several copies of the app can share one key (your computer and the hosted
 * site, say). So every few refreshes each copy asks Twelve Data for the real
 * number of credits used today, and paces against that. When another copy is
 * spending credits too, the remaining budget shrinks faster and every copy
 * slows down on its own, so together they still never run out before the reset.
 *
 * TWELVE_DATA_REFRESH_SECONDS, if set, raises the floor. Set it high on a
 * copy you want to use few credits (for example 1800 on your computer, so the
 * public site gets most of them).
 */
export const twelveDataKey = () => process.env.TWELVE_DATA_API_KEY?.trim() || "";

/** 7 credits per refresh must fit in the 8-a-minute limit, with headroom. */
const MIN_SECONDS = 75;
/** Credits held back for usage checks and requests from other copies of the app. */
const RESERVE = 20;
/** Re-check the real daily usage after this many refreshes (1 credit per check). */
const SYNC_EVERY = 4;

type Budget = { day: string; used: number; limit: number; seeded: boolean; sinceSync: number };
const g = globalThis as Record<string, unknown>;
const budget: Budget = (g.__traderosTdBudget as Budget) ?? (g.__traderosTdBudget = { day: "", used: 0, limit: 800, seeded: false, sinceSync: 0 });
budget.sinceSync ??= 0;

/** An error the cache should retry sooner (or later) than the usual refresh interval. */
export class RetryAfterError extends Error {
  constructor(message: string, readonly retryAfterMs: number) {
    super(message);
  }
}

function msUntilReset(now = Date.now()) {
  return Date.parse(`${utcDay(now)}T00:00:00Z`) + 86_400_000 - now;
}

const utcDay = (t = Date.now()) => new Date(t).toISOString().slice(0, 10);

function rollDay() {
  const d = utcDay();
  if (budget.day !== d) Object.assign(budget, { day: d, used: 0, seeded: false, sinceSync: 0 });
}

/**
 * Ask Twelve Data how many credits today already used, by every copy of the
 * app sharing this key. Costs 1 credit; done on the first refresh of the day
 * and then every SYNC_EVERY refreshes.
 */
async function syncBudget(key: string) {
  rollDay();
  if (budget.seeded && budget.sinceSync < SYNC_EVERY) return;
  budget.seeded = true;
  budget.sinceSync = 0;
  budget.used += 1; // the check itself
  try {
    const res = await fetchWithTimeout("https://api.twelvedata.com/api_usage", {
      headers: { Authorization: `apikey ${key}`, Accept: "application/json" },
    });
    if (!res.ok) return;
    const u = (await res.json()) as { daily_usage?: number; plan_daily_limit?: number };
    if (typeof u.daily_usage === "number") budget.used = u.daily_usage;
    if (typeof u.plan_daily_limit === "number" && u.plan_daily_limit > 0) budget.limit = u.plan_daily_limit;
  } catch {
    // Keep counting locally; the reserve covers the uncertainty.
  }
}

export function twelveDataRefreshSeconds(now = Date.now()) {
  rollDay();
  const n = Number(process.env.TWELVE_DATA_REFRESH_SECONDS);
  const floor = Number.isFinite(n) && n >= MIN_SECONDS ? Math.round(n) : MIN_SECONDS;
  const perRefresh = Math.max(1, instrumentsIn("fx").length);
  const secondsLeft = Math.max(60, Math.ceil(msUntilReset(now) / 1000));
  const refreshesLeft = Math.floor((budget.limit - budget.used - RESERVE) / perRefresh);
  if (refreshesLeft < 1) return secondsLeft; // wait for the reset
  return Math.max(floor, Math.ceil(secondsLeft / refreshesLeft));
}

type TdQuote = {
  symbol?: string;
  name?: string;
  close?: string;
  previous_close?: string;
  change?: string;
  percent_change?: string;
  high?: string;
  low?: string;
  timestamp?: number;
  last_quote_at?: number;
  code?: number;
  message?: string;
  status?: string;
};

/**
 * A 429 is either the 8-a-minute limit (another copy of the app refreshed in
 * the same minute: try again in a minute) or the daily limit (wait for the
 * reset at 00:00 UTC). The last good prices stay on screen meanwhile.
 */
function limitError(message?: string) {
  const daily = /day|daily/i.test(message ?? "");
  if (daily) {
    budget.used = budget.limit; // pace as empty until the reset
    return new RetryAfterError("Twelve Data's free daily credits are used up. Forex prices resume after 00:00 UTC.", msUntilReset() + 30_000);
  }
  return new RetryAfterError("Twelve Data's per-minute limit was hit. Retrying in about a minute.", 65_000);
}

const num = (s: string | undefined) => {
  const n = s === undefined ? NaN : Number(s);
  return Number.isFinite(n) ? n : null;
};

export async function fetchFxQuotes(): Promise<Quote[]> {
  const key = twelveDataKey();
  if (!key) throw new Error("TWELVE_DATA_API_KEY is not set.");
  const list = instrumentsIn("fx");
  const symbols = list.map((i) => i.providerSymbol).join(",");
  await syncBudget(key);
  const res = await fetchWithTimeout(
    `https://api.twelvedata.com/quote?symbol=${encodeURIComponent(symbols)}`,
    { headers: { Authorization: `apikey ${key}`, Accept: "application/json" } },
  );
  rollDay();
  budget.used += Number(res.headers.get("api-credits-request")) || list.length;
  budget.sinceSync += 1;
  if (res.status === 429) {
    const body = (await res.json().catch(() => null)) as TdQuote | null;
    throw limitError(body?.message);
  }
  if (!res.ok) throw new Error(`Twelve Data answered ${res.status}.`);
  const body = (await res.json()) as TdQuote | Record<string, TdQuote>;

  // A whole-request error (bad key, out of credits) comes back as one object.
  const top = body as TdQuote;
  if (top.status === "error" || typeof top.code === "number") {
    if (top.code === 429) throw limitError(top.message);
    if (top.code === 401) throw new Error("Twelve Data rejected the API key. Check TWELVE_DATA_API_KEY.");
    throw new Error(top.message || "Twelve Data returned an error.");
  }

  // With several symbols the answer is keyed by symbol; with one it is not.
  const bySymbol = list.length === 1 ? { [list[0].providerSymbol]: top } : (body as Record<string, TdQuote>);

  const quotes: Quote[] = [];
  for (const inst of list) {
    const q = bySymbol[inst.providerSymbol];
    if (!q || q.status === "error") continue;
    const price = num(q.close);
    if (price === null) continue;
    const prev = num(q.previous_close);
    const change = num(q.change) ?? (prev !== null ? price - prev : null);
    const ts = q.last_quote_at ?? q.timestamp;
    quotes.push({
      symbol: inst.symbol,
      name: inst.name,
      price,
      change,
      changePct: num(q.percent_change) ?? (change !== null && prev ? (change / prev) * 100 : null),
      high: num(q.high),
      low: num(q.low),
      changeBasis: "previous daily close",
      asOf: ts ? ts * 1000 : null,
      decimals: inst.decimals,
    });
  }
  if (quotes.length === 0) throw new Error("Twelve Data sent no usable prices.");
  return quotes;
}

export type DailyBar = { t: string; o: number; h: number; l: number; c: number };

/**
 * Daily price history for one symbol, oldest first (up to 5,000 trading
 * days). Costs 1 credit, counted in the shared daily budget.
 */
export async function fetchDailyHistory(providerSymbol: string): Promise<DailyBar[]> {
  const key = twelveDataKey();
  if (!key) throw new Error("TWELVE_DATA_API_KEY is not set.");
  const res = await fetchWithTimeout(
    `https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(providerSymbol)}&interval=1day&outputsize=5000&order=ASC`,
    { headers: { Authorization: `apikey ${key}`, Accept: "application/json" } },
    15_000,
  );
  rollDay();
  budget.used += Number(res.headers.get("api-credits-request")) || 1;
  if (res.status === 429) {
    const body = (await res.json().catch(() => null)) as TdQuote | null;
    throw limitError(body?.message);
  }
  if (!res.ok) throw new Error(`Twelve Data answered ${res.status}.`);
  const body = (await res.json()) as { status?: string; code?: number; message?: string; values?: { datetime: string; open: string; high: string; low: string; close: string }[] };
  if (body.status === "error" || typeof body.code === "number") {
    if (body.code === 429) throw limitError(body.message);
    throw new Error(body.message || "Twelve Data returned an error.");
  }
  const bars: DailyBar[] = [];
  for (const v of body.values ?? []) {
    const o = num(v.open), h = num(v.high), l = num(v.low), c = num(v.close);
    if (o === null || h === null || l === null || c === null || c <= 0) continue;
    bars.push({ t: v.datetime.slice(0, 10), o, h, l, c });
  }
  if (bars.length < 300) throw new Error("Twelve Data sent too little history for this symbol.");
  return bars;
}
