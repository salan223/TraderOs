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
 * TWELVE_DATA_REFRESH_SECONDS, if set, raises that floor.
 */
export const twelveDataKey = () => process.env.TWELVE_DATA_API_KEY?.trim() || "";

/** 7 credits per refresh must fit in the 8-a-minute limit, with headroom. */
const MIN_SECONDS = 75;
/** Credits held back for the once-a-day usage check and any stray request. */
const RESERVE = 10;

type Budget = { day: string; used: number; limit: number; seeded: boolean };
const g = globalThis as Record<string, unknown>;
const budget: Budget = (g.__traderosTdBudget as Budget) ?? (g.__traderosTdBudget = { day: "", used: 0, limit: 800, seeded: false });

const utcDay = (t = Date.now()) => new Date(t).toISOString().slice(0, 10);

function rollDay() {
  const d = utcDay();
  if (budget.day !== d) Object.assign(budget, { day: d, used: 0, seeded: false });
}

/** Ask Twelve Data how many credits today already used (costs 1 credit, once a day per server). */
async function seedBudget(key: string) {
  rollDay();
  if (budget.seeded) return;
  budget.seeded = true;
  try {
    const res = await fetchWithTimeout("https://api.twelvedata.com/api_usage", {
      headers: { Authorization: `apikey ${key}`, Accept: "application/json" },
    });
    if (!res.ok) return;
    const u = (await res.json()) as { daily_usage?: number; plan_daily_limit?: number };
    if (typeof u.daily_usage === "number") budget.used = Math.max(budget.used, u.daily_usage);
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
  const nextReset = Date.parse(`${utcDay(now)}T00:00:00Z`) + 86_400_000;
  const secondsLeft = Math.max(60, Math.ceil((nextReset - now) / 1000));
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

const num = (s: string | undefined) => {
  const n = s === undefined ? NaN : Number(s);
  return Number.isFinite(n) ? n : null;
};

export async function fetchFxQuotes(): Promise<Quote[]> {
  const key = twelveDataKey();
  if (!key) throw new Error("TWELVE_DATA_API_KEY is not set.");
  const list = instrumentsIn("fx");
  const symbols = list.map((i) => i.providerSymbol).join(",");
  await seedBudget(key);
  const res = await fetchWithTimeout(
    `https://api.twelvedata.com/quote?symbol=${encodeURIComponent(symbols)}`,
    { headers: { Authorization: `apikey ${key}`, Accept: "application/json" } },
  );
  rollDay();
  budget.used += Number(res.headers.get("api-credits-request")) || list.length;
  if (res.status === 429) throw new Error("Twelve Data's free-plan limit was reached (8 requests a minute, 800 a day). Forex prices resume at the next refresh.");
  if (!res.ok) throw new Error(`Twelve Data answered ${res.status}.`);
  const body = (await res.json()) as TdQuote | Record<string, TdQuote>;

  // A whole-request error (bad key, out of credits) comes back as one object.
  const top = body as TdQuote;
  if (top.status === "error" || typeof top.code === "number") {
    if (top.code === 429) throw new Error("Twelve Data's free-plan credit limit was reached. Forex prices resume when it resets.");
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
