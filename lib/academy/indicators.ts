/**
 * Technical indicators and test helpers for the Technical Analysis track.
 * Pure functions: no React, no DOM, no randomness without a seed.
 *
 * Builds on lib/academy/charts.ts (sma, ema, atr, swings, aggregate,
 * simulateSeries). Every series these functions are shown on in the Academy
 * is SIMULATED. Nothing here is real market data, and nothing here is a
 * trading recommendation: an indicator describes the past prices it was
 * computed from, and a backtest describes one past path.
 */

import { aggregate, ema, linearRegression, rng, simulateSeries, sma, swings, type Bar, type Swing } from "./charts";

type Series = (number | null)[];

const fin = (x: unknown): x is number => typeof x === "number" && Number.isFinite(x);

// ── Moving averages and crossovers ─────────────────────────────────────────

export type Cross = { index: number; dir: "up" | "down" };

/**
 * Bars where `fast` crosses `slow`: "up" when fast moves from at or below
 * slow to above it, "down" for the reverse. A cross at bar i is only known at
 * the close of bar i.
 */
export function crossovers(fast: readonly (number | null)[], slow: readonly (number | null)[]): Cross[] {
  const out: Cross[] = [];
  for (let i = 1; i < Math.min(fast.length, slow.length); i++) {
    const f0 = fast[i - 1], s0 = slow[i - 1], f1 = fast[i], s1 = slow[i];
    if (!fin(f0) || !fin(s0) || !fin(f1) || !fin(s1)) continue;
    if (f0 <= s0 && f1 > s1) out.push({ index: i, dir: "up" });
    else if (f0 >= s0 && f1 < s1) out.push({ index: i, dir: "down" });
  }
  return out;
}

/** Lag of a simple moving average in bars: (n − 1) ÷ 2. */
export const smaLag = (n: number) => (n - 1) / 2;

// ── RSI (Wilder) ────────────────────────────────────────────────────────────

/**
 * Relative Strength Index, Wilder's version. The first average gain and
 * loss are simple means of the first n changes; after that each average is
 * (previous × (n − 1) + current) ÷ n. RSI = 100 − 100 ÷ (1 + avgGain ÷ avgLoss),
 * 100 when there were no losses, 50 when nothing moved. Null for the first n bars.
 */
export function rsi(closes: readonly number[], n = 14): Series {
  const out: Series = Array(closes.length).fill(null);
  if (n < 1 || closes.length <= n) return out;
  let g = 0, l = 0;
  for (let i = 1; i <= n; i++) {
    const d = closes[i] - closes[i - 1];
    if (d > 0) g += d; else l -= d;
  }
  g /= n; l /= n;
  const val = () => (g === 0 && l === 0 ? 50 : l === 0 ? 100 : 100 - 100 / (1 + g / l));
  out[n] = val();
  for (let i = n + 1; i < closes.length; i++) {
    const d = closes[i] - closes[i - 1];
    g = (g * (n - 1) + Math.max(d, 0)) / n;
    l = (l * (n - 1) + Math.max(-d, 0)) / n;
    out[i] = val();
  }
  return out;
}

// ── MACD ────────────────────────────────────────────────────────────────────

/** EMA of a series that starts with nulls (seeded with the SMA of its first n values). */
function emaOf(xs: readonly (number | null)[], n: number): Series {
  const first = xs.findIndex(fin);
  const out: Series = Array(xs.length).fill(null);
  if (first < 0) return out;
  const tail = ema(xs.slice(first) as number[], n);
  tail.forEach((v, k) => { out[first + k] = v; });
  return out;
}

/**
 * MACD: EMA(fast) − EMA(slow) of the closes; the signal line is an EMA of
 * MACD; the histogram is MACD − signal. Defaults 12, 26, 9 (Appel's).
 */
export function macd(closes: readonly number[], fast = 12, slow = 26, signal = 9): { macd: Series; signal: Series; hist: Series } {
  const ef = ema(closes, fast), es = ema(closes, slow);
  const m: Series = closes.map((_, i) => (fin(ef[i]) && fin(es[i]) ? ef[i]! - es[i]! : null));
  const s = emaOf(m, signal);
  const h: Series = m.map((v, i) => (fin(v) && fin(s[i]) ? v - s[i]! : null));
  return { macd: m, signal: s, hist: h };
}

// ── Stochastic ──────────────────────────────────────────────────────────────

/**
 * Stochastic oscillator. Raw %K = 100 × (close − lowest low) ÷ (highest high − lowest low)
 * over n bars (50 if the range is zero). %K is raw %K smoothed by an SMA of
 * `smooth` (1 = the "fast" stochastic); %D is an SMA of %K over `d`.
 */
export function stochastic(bars: readonly Bar[], n = 14, smooth = 3, d = 3): { k: Series; d: Series } {
  const raw: Series = bars.map((b, i) => {
    if (i < n - 1) return null;
    let hh = -Infinity, ll = Infinity;
    for (let j = i - n + 1; j <= i; j++) { hh = Math.max(hh, bars[j].h); ll = Math.min(ll, bars[j].l); }
    return hh - ll > 0 ? (100 * (b.c - ll)) / (hh - ll) : 50;
  });
  const k = smaOf(raw, smooth);
  return { k, d: smaOf(k, d) };
}

function smaOf(xs: readonly (number | null)[], n: number): Series {
  const first = xs.findIndex(fin);
  const out: Series = Array(xs.length).fill(null);
  if (first < 0) return out;
  sma(xs.slice(first) as number[], n).forEach((v, k) => { out[first + k] = v; });
  return out;
}

// ── Bollinger Bands and volatility ──────────────────────────────────────────

/** Population standard deviation of the last n values (as Bollinger used). */
export function rollingStdev(xs: readonly number[], n: number): Series {
  return xs.map((_, i) => {
    if (i < n - 1) return null;
    const w = xs.slice(i - n + 1, i + 1);
    const m = w.reduce((a, b) => a + b, 0) / n;
    return Math.sqrt(w.reduce((a, b) => a + (b - m) ** 2, 0) / n);
  });
}

/**
 * Bollinger Bands: middle = SMA(n); upper/lower = middle ± k × standard
 * deviation of the same n closes. Bandwidth = (upper − lower) ÷ middle;
 * %b = (close − lower) ÷ (upper − lower).
 */
export function bollinger(closes: readonly number[], n = 20, k = 2): { mid: Series; upper: Series; lower: Series; width: Series; pctB: Series } {
  const mid = sma(closes, n), sd = rollingStdev(closes, n);
  const upper = mid.map((m, i) => (fin(m) ? m + k * sd[i]! : null));
  const lower = mid.map((m, i) => (fin(m) ? m - k * sd[i]! : null));
  const width = mid.map((m, i) => (fin(m) && m !== 0 ? (upper[i]! - lower[i]!) / m : null));
  const pctB = mid.map((m, i) => {
    if (!fin(m)) return null;
    const r = upper[i]! - lower[i]!;
    return r > 0 ? (closes[i] - lower[i]!) / r : 0.5;
  });
  return { mid, upper, lower, width, pctB };
}

/** Share of non-null bars whose close is outside the bands. */
export function outsideBands(closes: readonly number[], b: { upper: Series; lower: Series }): number {
  let n = 0, out = 0;
  closes.forEach((c, i) => {
    const u = b.upper[i], l = b.lower[i];
    if (!fin(u) || !fin(l)) return;
    n++;
    if (c > u || c < l) out++;
  });
  return n ? out / n : 0;
}

// ── Volume indicators ───────────────────────────────────────────────────────

/** Typical price (high + low + close) ÷ 3. */
export const typicalPrice = (b: Pick<Bar, "h" | "l" | "c">) => (b.h + b.l + b.c) / 3;

/**
 * Volume-weighted average price, reset at the start of every session of
 * `session` bars: Σ(typical price × volume) ÷ Σ volume since the reset.
 */
export function vwap(bars: readonly Bar[], session = Infinity): number[] {
  let pv = 0, v = 0;
  return bars.map((b, i) => {
    if (i % session === 0) { pv = 0; v = 0; }
    pv += typicalPrice(b) * b.v;
    v += b.v;
    return v > 0 ? pv / v : typicalPrice(b);
  });
}

/** On-balance volume: add the bar's volume on an up close, subtract it on a down close. Starts at 0. */
export function obv(bars: readonly Bar[]): number[] {
  let s = 0;
  return bars.map((b, i) => {
    if (i > 0) s += b.c > bars[i - 1].c ? b.v : b.c < bars[i - 1].c ? -b.v : 0;
    return s;
  });
}

/**
 * Accumulation/distribution line: running sum of the close location value
 * ((close − low) − (high − close)) ÷ (high − low) × volume.
 */
export function adLine(bars: readonly Bar[]): number[] {
  let s = 0;
  return bars.map((b) => {
    const r = b.h - b.l;
    s += r > 0 ? (((b.c - b.l) - (b.h - b.c)) / r) * b.v : 0;
    return s;
  });
}

// ── Divergence ──────────────────────────────────────────────────────────────

export type Divergence = { kind: "bearish" | "bullish"; a: number; b: number };

/**
 * Regular divergences between price swings and an indicator: two
 * consecutive swing highs where price makes a higher high but the indicator a
 * lower high (bearish), or two swing lows where price makes a lower low but
 * the indicator a higher low (bullish). `maxGap` limits how far apart the
 * two swings may be. A divergence needs the second swing to be confirmed,
 * which takes `k` more bars.
 */
export function divergences(bars: readonly Bar[], values: readonly (number | null)[], k = 3, maxGap = 40): Divergence[] {
  const sw = swings(bars, k);
  const out: Divergence[] = [];
  const last: Partial<Record<Swing["kind"], Swing>> = {};
  for (const s of sw) {
    const p = last[s.kind];
    last[s.kind] = s;
    if (!p || s.index - p.index > maxGap) continue;
    const v0 = values[p.index], v1 = values[s.index];
    if (!fin(v0) || !fin(v1)) continue;
    if (s.kind === "high" && s.price > p.price && v1 < v0) out.push({ kind: "bearish", a: p.index, b: s.index });
    if (s.kind === "low" && s.price < p.price && v1 > v0) out.push({ kind: "bullish", a: p.index, b: s.index });
  }
  return out;
}

// ── Trendlines and channels ─────────────────────────────────────────────────

export type Line = { slope: number; at: (i: number) => number };

/** The straight line through (i0, p0) and (i1, p1), extended to any bar. */
export function lineThrough(i0: number, p0: number, i1: number, p1: number): Line {
  const slope = i1 === i0 ? 0 : (p1 - p0) / (i1 - i0);
  return { slope, at: (i) => p0 + slope * (i - i0) };
}

/**
 * Touches and the first break of a trendline after bar `from`. For a
 * "support" line (below price) a touch is a low within `tol` of the line and
 * a break is a close below it by more than `tol`; "resistance" is the mirror.
 */
export function trendlineTest(bars: readonly Bar[], line: Line, side: "support" | "resistance", from: number, tol: number): { touches: number[]; breakAt: number | null } {
  const touches: number[] = [];
  for (let i = Math.max(0, from); i < bars.length; i++) {
    const L = line.at(i), b = bars[i];
    if (side === "support") {
      if (b.c < L - tol) return { touches, breakAt: i };
      if (Math.abs(b.l - L) <= tol) touches.push(i);
    } else {
      if (b.c > L + tol) return { touches, breakAt: i };
      if (Math.abs(b.h - L) <= tol) touches.push(i);
    }
  }
  return { touches, breakAt: null };
}

/**
 * A linear-regression channel over bars [from, to): the least-squares line
 * through the closes, with parallel lines k standard deviations of the
 * residuals above and below. r² says how well a straight line fits.
 */
export function regressionChannel(closes: readonly number[], from: number, to: number, k = 2): { mid: Line; upper: Line; lower: Line; sd: number; r2: number } {
  const ys = closes.slice(from, to);
  const { slope, intercept, r2 } = linearRegression(ys);
  const at = (i: number) => intercept + slope * (i - from);
  const sd = ys.length ? Math.sqrt(ys.reduce((a, y, j) => a + (y - (intercept + slope * j)) ** 2, 0) / ys.length) : 0;
  return { mid: { slope, at }, upper: { slope, at: (i) => at(i) + k * sd }, lower: { slope, at: (i) => at(i) - k * sd }, sd, r2 };
}

// ── Chart patterns ──────────────────────────────────────────────────────────

export type PatternHit =
  | { kind: "double-top" | "double-bottom"; points: number[]; neckline: number; target: number; confirmedAt: number | null }
  | { kind: "head-and-shoulders" | "inverse-head-and-shoulders"; points: number[]; neckline: number; target: number; confirmedAt: number | null };

const near = (a: number, b: number, tolPct: number) => Math.abs(a - b) <= (Math.abs(a) * tolPct) / 100;

/** First close beyond `level` after bar `from` ("below" or "above"), or null. */
function confirm(bars: readonly Bar[], from: number, level: number, dir: "below" | "above"): number | null {
  for (let i = from + 1; i < bars.length; i++) if (dir === "below" ? bars[i].c < level : bars[i].c > level) return i;
  return null;
}

/**
 * Mechanical pattern finder on swing points (a strict, simplified rule set,
 * so its hits can be counted and tested):
 * - double top: high, low, high with the two highs within `tolPct`% of each
 *   other; neckline = the low between; confirmed by a close below it.
 * - head and shoulders: high, low, higher high, low, high where the outer
 *   highs (shoulders) are within `tolPct`% and both below the head; neckline
 *   = the lower of the two lows (a flat simplification).
 * Mirror images give the bottom versions. Target = the measured move:
 * neckline ∓ (pattern height).
 */
export function findPatterns(bars: readonly Bar[], k = 3, tolPct = 1.5): PatternHit[] {
  const sw = swings(bars, k);
  const out: PatternHit[] = [];
  for (let j = 0; j + 2 < sw.length; j++) {
    const [a, b, c] = [sw[j], sw[j + 1], sw[j + 2]];
    if (a.kind === "high" && c.kind === "high" && near(a.price, c.price, tolPct)) {
      const top = Math.max(a.price, c.price), neck = b.price;
      out.push({ kind: "double-top", points: [a.index, b.index, c.index], neckline: neck, target: neck - (top - neck), confirmedAt: confirm(bars, c.index, neck, "below") });
    }
    if (a.kind === "low" && c.kind === "low" && near(a.price, c.price, tolPct)) {
      const bot = Math.min(a.price, c.price), neck = b.price;
      out.push({ kind: "double-bottom", points: [a.index, b.index, c.index], neckline: neck, target: neck + (neck - bot), confirmedAt: confirm(bars, c.index, neck, "above") });
    }
    if (j + 4 < sw.length) {
      const [, , , d, e] = [a, b, c, sw[j + 3], sw[j + 4]];
      if (a.kind === "high" && c.price > a.price && c.price > e.price && near(a.price, e.price, tolPct)) {
        const neck = Math.min(b.price, d.price);
        out.push({ kind: "head-and-shoulders", points: [a.index, b.index, c.index, d.index, e.index], neckline: neck, target: neck - (c.price - neck), confirmedAt: confirm(bars, e.index, neck, "below") });
      }
      if (a.kind === "low" && c.price < a.price && c.price < e.price && near(a.price, e.price, tolPct)) {
        const neck = Math.max(b.price, d.price);
        out.push({ kind: "inverse-head-and-shoulders", points: [a.index, b.index, c.index, d.index, e.index], neckline: neck, target: neck + (neck - c.price), confirmedAt: confirm(bars, e.index, neck, "above") });
      }
    }
  }
  return out;
}

/** Did price reach the pattern's target within `horizon` bars after confirmation? null if not confirmed or not enough bars. */
export function reachedTarget(bars: readonly Bar[], p: PatternHit, horizon: number): boolean | null {
  if (p.confirmedAt === null || p.confirmedAt + horizon >= bars.length) return null;
  const bearish = p.kind === "double-top" || p.kind === "head-and-shoulders";
  for (let i = p.confirmedAt + 1; i <= p.confirmedAt + horizon; i++) if (bearish ? bars[i].l <= p.target : bars[i].h >= p.target) return true;
  return false;
}

/**
 * The control for reachedTarget. Measured from the confirming close, the
 * target is some distance d away; the mirror target is the same distance d
 * the OTHER way. Did price reach the mirror within the horizon? On a random
 * walk both are reached about equally often; a pattern that carries
 * information should reach its target clearly more often than its mirror.
 */
export function reachedMirror(bars: readonly Bar[], p: PatternHit, horizon: number): boolean | null {
  if (p.confirmedAt === null || p.confirmedAt + horizon >= bars.length) return null;
  const bearish = p.kind === "double-top" || p.kind === "head-and-shoulders";
  const c = bars[p.confirmedAt].c;
  const mirror = c + (c - p.target);
  for (let i = p.confirmedAt + 1; i <= p.confirmedAt + horizon; i++) if (bearish ? bars[i].h >= mirror : bars[i].l <= mirror) return true;
  return false;
}

/**
 * Triangle type from the slopes of the line through the highs and the line
 * through the lows (price per bar). `flat` is the slope treated as level.
 */
export function classifyTriangle(highSlope: number, lowSlope: number, flat: number): "ascending" | "descending" | "symmetrical" | "expanding" | "channel" {
  const hFlat = Math.abs(highSlope) <= flat, lFlat = Math.abs(lowSlope) <= flat;
  if (hFlat && lowSlope > flat) return "ascending";
  if (lFlat && highSlope < -flat) return "descending";
  if (highSlope < -flat && lowSlope > flat) return "symmetrical";
  if (highSlope > flat && lowSlope < -flat) return "expanding";
  return "channel";
}

// ── Fibonacci ───────────────────────────────────────────────────────────────

export const FIB_RATIOS = [0.236, 0.382, 0.5, 0.618, 0.786] as const;

/** Retracement levels of a move from `from` to `to` (prices), for each ratio. */
export function fibLevels(from: number, to: number, ratios: readonly number[] = FIB_RATIOS): { ratio: number; price: number }[] {
  return ratios.map((r) => ({ ratio: r, price: to - (to - from) * r }));
}

/**
 * The share of the 0–1 retracement range that lies within ±tol of at least
 * one ratio. It is the chance that a retracement chosen at random "lands on
 * a Fibonacci level". With the five usual ratios and tol = 0.03, it is 30%.
 */
export function fibCoverage(tol: number, ratios: readonly number[] = FIB_RATIOS): number {
  const iv = ratios.map((r) => [Math.max(0, r - tol), Math.min(1, r + tol)] as const).sort((a, b) => a[0] - b[0]);
  let total = 0, curS = -1, curE = -1;
  for (const [s, e] of iv) {
    if (s > curE) { total += Math.max(0, curE - curS); curS = s; curE = e; }
    else curE = Math.max(curE, e);
  }
  total += Math.max(0, curE - curS);
  return total;
}

/** Retracement ratios of each swing leg: |leg 2| ÷ |leg 1| for consecutive legs, kept when below 1. */
export function retracementRatios(sw: readonly Swing[]): number[] {
  const out: number[] = [];
  for (let j = 0; j + 2 < sw.length; j++) {
    const l1 = Math.abs(sw[j + 1].price - sw[j].price), l2 = Math.abs(sw[j + 2].price - sw[j + 1].price);
    if (l1 > 0 && l2 / l1 < 1) out.push(l2 / l1);
  }
  return out;
}

/** Share of ratios within ±tol of any level in `levels` (the Fibonacci ratios by default). */
export function nearFibShare(ratios: readonly number[], tol: number, levels: readonly number[] = FIB_RATIOS): number {
  if (!ratios.length) return 0;
  return ratios.filter((r) => levels.some((f) => Math.abs(r - f) <= tol)).length / ratios.length;
}

// ── Multi-timeframe and redundancy ──────────────────────────────────────────

/** +1 when the close is above its n-bar SMA, −1 when below, null before the SMA exists. */
export function trendState(closes: readonly number[], n: number): (1 | -1 | null)[] {
  const m = sma(closes, n);
  return closes.map((c, i) => (fin(m[i]) ? (c >= m[i]! ? 1 : -1) : null));
}

/**
 * Trend state on the base bars and on bars aggregated k-to-1, mapped back to
 * the base bars. A higher-timeframe value is only used once its bar has
 * CLOSED (no look-ahead): base bar i sees the higher bar that ended at or
 * before i.
 */
export function timeframeStates(bars: readonly Bar[], k: number, n: number): { base: (1 | -1 | null)[]; higher: (1 | -1 | null)[]; aligned: number } {
  const base = trendState(bars.map((b) => b.c), n);
  const hb = aggregate(bars, k).bars;
  const hs = trendState(hb.map((b) => b.c), n);
  const higher = bars.map((_, i) => {
    const done = Math.floor((i + 1) / k) - 1; // last fully closed higher bar
    return done >= 0 && done < hs.length ? hs[done] : null;
  });
  let both = 0, same = 0;
  base.forEach((s, i) => { const h = higher[i]; if (s !== null && h !== null) { both++; if (s === h) same++; } });
  return { base, higher, aligned: both ? same / both : 0 };
}

/** Pearson correlation of two series over the bars where both have values. */
export function alignedCorrelation(a: readonly (number | null)[], b: readonly (number | null)[]): number | null {
  const xs: number[] = [], ys: number[] = [];
  for (let i = 0; i < Math.min(a.length, b.length); i++) if (fin(a[i]) && fin(b[i])) { xs.push(a[i]!); ys.push(b[i]!); }
  if (xs.length < 3) return null;
  const n = xs.length, mx = xs.reduce((s, x) => s + x, 0) / n, my = ys.reduce((s, y) => s + y, 0) / n;
  let sxy = 0, sxx = 0, syy = 0;
  for (let i = 0; i < n; i++) { sxy += (xs[i] - mx) * (ys[i] - my); sxx += (xs[i] - mx) ** 2; syy += (ys[i] - my) ** 2; }
  return sxx > 0 && syy > 0 ? sxy / Math.sqrt(sxx * syy) : null;
}

/** n-bar rate of change in percent: 100 × (close − close n bars ago) ÷ close n bars ago. */
export function rateOfChange(closes: readonly number[], n: number): Series {
  return closes.map((c, i) => (i >= n && closes[i - n] !== 0 ? (100 * (c - closes[i - n])) / closes[i - n] : null));
}

// ── Testable rules, backtests and overfitting ───────────────────────────────

export type BacktestResult = {
  /** Total return in percent, after costs. */
  returnPct: number;
  /** Number of entries. */
  trades: number;
  /** Share of bars in the market. */
  exposure: number;
  /** Equity after each bar, starting at 1. */
  equity: number[];
};

/**
 * Long-or-flat moving-average crossover: in the market from the bar after
 * the fast SMA closes above the slow SMA, out from the bar after it closes
 * below. The position decided at the close of bar i earns the return from
 * i to i + 1, so the rule never uses a price it could not have known.
 * `costPct` is charged on every entry and every exit (one side each).
 */
export function crossoverBacktest(closes: readonly number[], fast: number, slow: number, costPct = 0): BacktestResult {
  const f = sma(closes, fast), s = sma(closes, slow);
  let eq = 1, inMkt = false, trades = 0, bars = 0;
  const equity = [1];
  for (let i = 0; i < closes.length - 1; i++) {
    const want = fin(f[i]) && fin(s[i]) ? f[i]! > s[i]! : false;
    if (want !== inMkt) { eq *= 1 - costPct / 100; if (want) trades++; inMkt = want; }
    if (inMkt) { eq *= closes[i + 1] / closes[i]; bars++; }
    equity.push(eq);
  }
  return { returnPct: (eq - 1) * 100, trades, exposure: closes.length > 1 ? bars / (closes.length - 1) : 0, equity };
}

/** Buy-and-hold return in percent. */
export const buyHoldPct = (closes: readonly number[]) => (closes.length > 1 ? (closes[closes.length - 1] / closes[0] - 1) * 100 : 0);

export type SweepRow = { fast: number; slow: number; inSample: number; outSample: number };

/**
 * Tries every (fast, slow) pair with fast < slow on the in-sample part
 * (the first `split` share of the closes) and the out-of-sample rest.
 * The out-of-sample part is run on its own closes, so no in-sample price
 * leaks into it.
 */
export function parameterSweep(closes: readonly number[], fasts: readonly number[], slows: readonly number[], split = 0.5, costPct = 0): SweepRow[] {
  const cut = Math.floor(closes.length * split);
  const ins = closes.slice(0, cut), outs = closes.slice(cut);
  const rows: SweepRow[] = [];
  for (const f of fasts) for (const s of slows) if (f < s) {
    rows.push({ fast: f, slow: s, inSample: crossoverBacktest(ins, f, s, costPct).returnPct, outSample: crossoverBacktest(outs, f, s, costPct).returnPct });
  }
  return rows;
}

/** The row with the best in-sample result (what an optimiser would pick). */
export function bestInSample(rows: readonly SweepRow[]): SweepRow | null {
  return rows.reduce<SweepRow | null>((b, r) => (b === null || r.inSample > b.inSample ? r : b), null);
}

/** Median of a list (null if empty). */
export function median(xs: readonly number[]): number | null {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b), m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

/**
 * The overfitting experiment: on `paths` driftless random walks (no edge
 * exists by construction), sweep `combos` parameter pairs, pick the best
 * in-sample, and record its in-sample and out-of-sample returns. The gap
 * between the two is what selecting the best of many tries does on its own.
 */
export function overfitExperiment(opt: { seed: number; paths: number; bars: number; combos: number; costPct?: number }): { bestIn: number[]; itsOut: number[] } {
  const grid = sweepGrid(opt.combos);
  const bestIn: number[] = [], itsOut: number[] = [];
  const pick = rng(opt.seed);
  for (let p = 0; p < opt.paths; p++) {
    const { bars } = simulateSeries({ seed: Math.floor(pick() * 1e9), bars: opt.bars, regimes: false, vol: 0.012, decimals: 4 });
    const rows = parameterSweep(bars.map((b) => b.c), grid.fasts, grid.slows, 0.5, opt.costPct ?? 0).slice(0, opt.combos);
    const best = bestInSample(rows);
    if (best) { bestIn.push(best.inSample); itsOut.push(best.outSample); }
  }
  return { bestIn, itsOut };
}

/** A grid of fast and slow lengths with at least `combos` valid pairs. */
export function sweepGrid(combos: number): { fasts: number[]; slows: number[] } {
  const fasts = [3, 5, 8, 10, 13, 15, 20, 25];
  const slows = [30, 40, 50, 60, 80, 100, 120, 150];
  const side = Math.max(1, Math.min(8, Math.ceil(Math.sqrt(Math.max(1, combos)))));
  return { fasts: fasts.slice(0, side), slows: slows.slice(0, Math.max(1, Math.ceil(combos / side))) };
}
