/**
 * Helpers for the Options Lab simulator. The underlying's path is real daily
 * history; option prices are modelled with Black-Scholes, using recent
 * realised volatility as a stand-in for implied volatility (real historical
 * option quotes are not freely available).
 */
import { blackScholes, breakeven, type OptionKind } from "./options";
import { histVolAt } from "./forecast";

/** Rounds a raw step to a "nice" strike spacing: 1, 2, 2.5 or 5 × a power of ten. */
export function niceStep(raw: number): number {
  if (!(raw > 0)) return 1;
  const p = 10 ** Math.floor(Math.log10(raw));
  const m = raw / p;
  const nice = m < 1.5 ? 1 : m < 2.25 ? 2 : m < 3.5 ? 2.5 : m < 7.5 ? 5 : 10;
  return nice * p;
}

/** Strikes centred on the nearest strike to `spot`, spaced about 2.5% apart. */
export function strikeLadder(spot: number, count = 9): number[] {
  const step = niceStep(spot * 0.025);
  const atm = Math.round(spot / step) * step;
  const half = Math.floor(count / 2);
  return Array.from({ length: count }, (_, k) => +(atm + (k - half) * step).toFixed(6)).filter((k) => k > 0);
}

/** Trading bars until expiry for a number of calendar days. */
export function barsForDays(days: number, periodsPerYear: number): number {
  return Math.max(1, Math.round((days * periodsPerYear) / 365));
}

/** Volatility used to price options at bar `i`: 30-day realised volatility, floored at 5%. */
export function modelVolAt(closes: readonly number[], i: number, periodsPerYear: number): number {
  const v = histVolAt(closes, i, 30, periodsPerYear);
  return Number.isFinite(v) ? Math.max(0.05, v) : 0.3;
}

export type ChainRow = { strike: number; call: number; put: number; callDelta: number; putDelta: number; callItm: number; putItm: number };

/** A model option chain at one moment. */
export function optionChain(spot: number, vol: number, years: number, rate = 0.03): ChainRow[] {
  return strikeLadder(spot).map((strike) => {
    const c = blackScholes({ kind: "call", spot, strike, years, vol, rate })!;
    const p = blackScholes({ kind: "put", spot, strike, years, vol, rate })!;
    return { strike, call: c.price, put: p.price, callDelta: c.delta, putDelta: p.delta, callItm: c.probItm, putItm: p.probItm };
  });
}

/**
 * Picks a scenario start bar from a seed: at least `minHistory` bars of past
 * data before it (for volatility and the chart) and `room` bars after it.
 */
export function scenarioStart(length: number, seed: number, minHistory = 260, room = 70): number {
  const lo = minHistory, hi = length - 1 - room;
  if (hi <= lo) return Math.max(0, length - 1 - room);
  const r = Math.abs(Math.sin(seed * 12.9898 + 78.233) * 43758.5453) % 1;
  return lo + Math.floor(r * (hi - lo));
}

export type Leg = { kind: OptionKind; strike: number; expiryBars: number; contracts: number; multiplier: number; entryPremium: number };

/** Model value per unit of the option `k` bars after entry, at underlying price `spot`. */
export function legValueAt(leg: Leg, closes: readonly number[], entryIndex: number, k: number, periodsPerYear: number): number {
  const left = Math.max(0, leg.expiryBars - k);
  const spot = closes[entryIndex + k];
  const vol = modelVolAt(closes, entryIndex + k, periodsPerYear);
  return blackScholes({ kind: leg.kind, spot, strike: leg.strike, years: left / periodsPerYear, vol, rate: 0.03 })?.price ?? 0;
}

/** First bar (1-based offset after entry) at which the underlying touched `target`, or null. */
export function firstTouch(bars: readonly { h: number; l: number }[], entryIndex: number, upTo: number, target: number, entryPrice: number): number | null {
  const up = target >= entryPrice;
  for (let k = 1; k <= upTo && entryIndex + k < bars.length; k++) {
    const b = bars[entryIndex + k];
    if (up ? b.h >= target : b.l <= target) return k;
  }
  return null;
}

export { breakeven };
