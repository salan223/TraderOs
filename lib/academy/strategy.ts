import { normal, rng } from "./charts";
import { probLosingStreak } from "./psychology";

/*
  Pure maths for the Strategy Development track. Every series here is
  simulated from a seed; nothing is market data. Prices are made-up index
  levels starting at 100, and results are in percent of that simulated price
  or in R (multiples of the amount risked per trade).
*/

// ── Simulated regimes ───────────────────────────────────────────────────────

export type Regime = "trending" | "ranging" | "random";
export const REGIMES: readonly { id: Regime; label: string }[] = [
  { id: "trending", label: "Trending" },
  { id: "ranging", label: "Ranging" },
  { id: "random", label: "Random walk" },
];

/** Daily volatility of the simulated log price (1%). */
export const SIGMA = 0.01;

/**
 * A seeded log-price path of n + 1 points starting at 0.
 * trending: a drift of ±0.1σ a bar that flips sign rarely (persistent trends);
 * ranging: pulled back towards a level (Ornstein–Uhlenbeck, θ = 0.04);
 * random: a pure random walk with no drift.
 */
export function logPath(regime: Regime, seed: number, n: number): number[] {
  const r = rng(seed), z = normal(r);
  const x = [0];
  let drift = (r() < 0.5 ? 1 : -1) * 0.1 * SIGMA;
  for (let t = 1; t <= n; t++) {
    const prev = x[t - 1];
    let step = SIGMA * z();
    if (regime === "trending") {
      if (r() < 0.004) drift = -drift;
      step += drift;
    } else if (regime === "ranging") {
      step += 0.04 * (0 - prev);
    }
    x.push(prev + step);
  }
  return x;
}

/** A path that alternates trending and ranging segments of `segment` bars, with the regime of each bar. */
export function mixedPath(seed: number, n: number, segment = 250): { x: number[]; regime: ("trending" | "ranging")[] } {
  const r = rng(seed), z = normal(r);
  const x = [0];
  const regime: ("trending" | "ranging")[] = ["trending"];
  let drift = 0.3 * SIGMA, anchor = 0;
  for (let t = 1; t <= n; t++) {
    const seg = Math.floor((t - 1) / segment) % 2 === 0 ? "trending" : "ranging";
    if (seg === "trending" && (t - 1) % segment === 0) drift = (r() < 0.5 ? 1 : -1) * 0.3 * SIGMA;
    if (seg === "ranging" && (t - 1) % segment === 0) anchor = x[t - 1];
    const prev = x[t - 1];
    const step = SIGMA * z() + (seg === "trending" ? drift : 0.1 * (anchor - prev));
    x.push(prev + step);
    regime.push(seg);
  }
  return { x, regime };
}

export const toPrices = (x: readonly number[]) => x.map((v) => 100 * Math.exp(v));

function smaAt(x: readonly number[], t: number, n: number): number | null {
  if (t + 1 < n) return null;
  let s = 0;
  for (let i = t - n + 1; i <= t; i++) s += x[i];
  return s / n;
}
function sdAt(x: readonly number[], t: number, n: number, m: number): number {
  let s = 0;
  for (let i = t - n + 1; i <= t; i++) s += (x[i] - m) ** 2;
  return Math.sqrt(s / n);
}
function extreme(x: readonly number[], from: number, to: number, hi: boolean): number {
  let v = hi ? -Infinity : Infinity;
  for (let i = from; i <= to; i++) v = hi ? Math.max(v, x[i]) : Math.min(v, x[i]);
  return v;
}

/** Efficiency ratio of the log path over the n bars ending at t (0 = back and forth, 1 = straight line). */
export function efficiencyAt(x: readonly number[], t: number, n: number): number | null {
  if (t < n) return null;
  let path = 0;
  for (let i = t - n + 1; i <= t; i++) path += Math.abs(x[i] - x[i - 1]);
  return path === 0 ? 0 : Math.abs(x[t] - x[t - n]) / path;
}

// ── Archetypes ──────────────────────────────────────────────────────────────

export type Archetype = "trend" | "meanrev" | "breakout" | "carry";
export const ARCHETYPES: readonly { id: Archetype; label: string; rule: string }[] = [
  { id: "trend", label: "Trend-following", rule: "Long when the close is above its 50-bar average, short when below." },
  { id: "meanrev", label: "Mean-reversion", rule: "Long when the close is more than 1 standard deviation below its 20-bar average, short when more than 1 above; exit when back within 0.2." },
  { id: "breakout", label: "Breakout", rule: "Long on a close above the 20-bar high, short below the 20-bar low; exit on the opposite 10-bar extreme." },
  { id: "carry", label: "Carry", rule: "Always long, earning a steady carry of 0.03% a bar, and exposed to every price move." },
];

/** Position (−1, 0 or +1) decided at the close of bar t for each archetype, given the previous position. */
function decide(a: Archetype, x: readonly number[], t: number, prev: number): number {
  if (a === "carry") return 1;
  if (a === "trend") {
    const m = smaAt(x, t, 50);
    return m === null ? 0 : x[t] > m ? 1 : -1;
  }
  if (a === "meanrev") {
    const m = smaAt(x, t, 20);
    if (m === null) return 0;
    const sd = sdAt(x, t, 20, m);
    if (sd === 0) return prev;
    const zs = (x[t] - m) / sd;
    if (zs < -1) return 1;
    if (zs > 1) return -1;
    if (Math.abs(zs) < 0.2) return 0;
    return prev;
  }
  // breakout
  if (t < 21) return 0;
  if (x[t] > extreme(x, t - 20, t - 1, true)) return 1;
  if (x[t] < extreme(x, t - 20, t - 1, false)) return -1;
  if (prev === 1 && x[t] < extreme(x, t - 10, t - 1, false)) return 0;
  if (prev === -1 && x[t] > extreme(x, t - 10, t - 1, true)) return 0;
  return prev;
}

export type BacktestResult = { equity: number[]; totalPct: number; maxDrawdownPct: number; trades: number; exposure: number };

export const CARRY_PER_BAR = 0.0003;

/**
 * Run an archetype on a log path. The position chosen at the close of bar t
 * earns the move from t to t + 1. Each change of position costs `costPct`
 * percent per unit traded. `active(t)` can switch the strategy off (flat).
 * Equity is the running total in percent (sum of log returns × 100).
 */
export function runArchetype(a: Archetype, x: readonly number[], costPct = 0.05, active?: (t: number) => boolean): BacktestResult {
  const equity = [0];
  let pos = 0, eq = 0, peak = 0, dd = 0, trades = 0, inMarket = 0;
  for (let t = 0; t < x.length - 1; t++) {
    let next = decide(a, x, t, pos);
    if (active && !active(t)) next = 0;
    if (next !== pos) {
      eq -= (Math.abs(next - pos) * costPct);
      if (next !== 0) trades++;
      pos = next;
    }
    const ret = (x[t + 1] - x[t]) * 100;
    eq += pos * ret + (a === "carry" && pos === 1 ? CARRY_PER_BAR * 100 : 0);
    if (pos !== 0) inMarket++;
    if (eq > peak) peak = eq;
    if (peak - eq > dd) dd = peak - eq;
    equity.push(eq);
  }
  return { equity, totalPct: eq, maxDrawdownPct: dd, trades, exposure: inMarket / Math.max(1, x.length - 1) };
}

// ── Entry versus exit ───────────────────────────────────────────────────────

export type EntryKind = "random" | "signal";
export type ExitKind = "good" | "bad";
export const UNIT = 2 * SIGMA; // the initial risk: a stop two daily moves away

/**
 * Many trades on one long simulated path. Entry: "random" picks a direction
 * by coin flip; "signal" goes with the last 20 bars' move. Exit: "good" has a
 * 1-unit initial stop that later trails 2 units behind the best price, so losses are cut
 * and winners run (up to 120 bars); "bad" takes profit at +0.5 unit and only
 * stops out at −3 units, so winners are cut and losers run (up to 120 bars).
 * Exits fill at the close that crosses the level, so gaps cost both rules.
 * Results are in R, where 1R is one unit (the good exit's initial stop).
 */
export function entryExitTrades(o: { seed: number; regime: Regime; entry: EntryKind; exit: ExitKind; trades: number; costR?: number }) {
  const bars = o.trades * 130 + 40;
  const x = logPath(o.regime, o.seed, bars);
  const pick = rng(o.seed * 7 + (o.entry === "random" ? 1 : 2));
  const cost = o.costR ?? 0.05;
  const results: number[] = [];
  let t = 21;
  for (let k = 0; k < o.trades && t < bars - 121; k++) {
    const dir = o.entry === "random" ? (pick() < 0.5 ? 1 : -1) : x[t] - x[t - 20] >= 0 ? 1 : -1;
    const e = x[t];
    let out = 0, best = 0;
    for (let j = 1; j <= 120; j++) {
      const move = (dir * (x[t + j] - e)) / UNIT;
      if (o.exit === "good") {
        if (move > best) best = move;
        const stop = Math.max(-1, best - 2);
        if (move <= stop) { out = move; t += j; break; } // filled at the close that crossed the stop
      } else {
        if (move >= 0.5) { out = move; t += j; break; }
        if (move <= -3) { out = move; t += j; break; }
      }
      out = move;
      if (j === 120) t += j;
    }
    results.push(out - cost);
    t += 1;
  }
  const n = results.length;
  const wins = results.filter((r) => r > 0);
  const losses = results.filter((r) => r <= 0);
  const mean = results.reduce((a, b) => a + b, 0) / Math.max(1, n);
  return {
    results,
    n,
    meanR: mean,
    totalR: mean * n,
    winRate: wins.length / Math.max(1, n),
    avgWin: wins.length ? wins.reduce((a, b) => a + b, 0) / wins.length : 0,
    avgLoss: losses.length ? losses.reduce((a, b) => a + b, 0) / losses.length : 0,
    worst: n ? Math.min(...results) : 0,
  };
}

// ── Overfitting: the best of many rules on noise ────────────────────────────

/** Sharpe-like ratio of a list of per-bar returns: mean / sd × √250. */
export function sharpe(rets: readonly number[]): number {
  const n = rets.length;
  if (n < 2) return 0;
  const m = rets.reduce((a, b) => a + b, 0) / n;
  const sd = Math.sqrt(rets.reduce((a, b) => a + (b - m) ** 2, 0) / (n - 1));
  return sd === 0 ? 0 : (m / sd) * Math.sqrt(250);
}

/** Per-bar returns of a fast/slow moving-average crossover (long above, short below) on x over [from, to), using prefix sums. */
function crossoverReturns(x: readonly number[], pre: readonly number[], fast: number, slow: number, from: number, to: number, costPct: number): number[] {
  const out: number[] = [];
  const avg = (t: number, n: number) => (pre[t + 1] - pre[t + 1 - n]) / n;
  let pos = 0;
  for (let t = Math.max(from, slow); t < to - 1; t++) {
    const next = avg(t, fast) > avg(t, slow) ? 1 : -1;
    let r = pos * (x[t + 1] - x[t]) * 100;
    if (next !== pos) { r -= Math.abs(next - pos) * costPct; pos = next; }
    out.push(r);
  }
  return out;
}

export const CROSSOVER_PAIRS: readonly [number, number][] = (() => {
  const pairs: [number, number][] = [];
  for (let f = 2; f <= 40; f += 2) for (let s = f + 5; s <= 120; s += 5) pairs.push([f, s]);
  return pairs;
})();

/**
 * Overfitting on noise. For each of `paths` seeded random walks (no edge
 * exists), try `variants` fast/slow crossover pairs on the first 1,000 bars,
 * keep the best in-sample, then run that same pair on the next 1,000 bars.
 * Reports averages across paths, plus one example path.
 */
export function bestOfNoise(o: { seed: number; variants: number; paths?: number; costPct?: number }) {
  const bars = 2000, split = 1000, paths = o.paths ?? 12, cost = o.costPct ?? 0.02;
  const order = rng(o.seed + 99);
  const shuffled = CROSSOVER_PAIRS.map((p) => ({ p, k: order() })).sort((a, b) => a.k - b.k).map((q) => q.p);
  const tried = shuffled.slice(0, Math.max(1, Math.min(o.variants, shuffled.length)));
  let sumIs = 0, sumOos = 0;
  let example: { x: number[]; pair: [number, number]; is: number; oos: number } | null = null;
  for (let k = 0; k < paths; k++) {
    const x = logPath("random", o.seed * 100 + k, bars);
    const pre = [0];
    for (const v of x) pre.push(pre[pre.length - 1] + v);
    let best = { p: tried[0], is: -Infinity };
    for (const p of tried) {
      const is = sharpe(crossoverReturns(x, pre, p[0], p[1], 0, split, cost));
      if (is > best.is) best = { p, is };
    }
    const oos = sharpe(crossoverReturns(x, pre, best.p[0], best.p[1], split, bars, cost));
    sumIs += best.is; sumOos += oos;
    if (!example) example = { x, pair: best.p, is: best.is, oos };
  }
  return { tried: tried.length, available: CROSSOVER_PAIRS.length, paths, avgBestIs: sumIs / paths, avgOos: sumOos / paths, split, example: example! };
}

// ── Kill criteria ───────────────────────────────────────────────────────────

/** Mean and standard deviation of one trade's result in R: win `payoffR` with probability `winRate`, else −1R. */
export function tradeMoments(winRate: number, payoffR: number): { mean: number; sd: number } {
  const mean = winRate * payoffR - (1 - winRate);
  const v = winRate * (payoffR - mean) ** 2 + (1 - winRate) * (-1 - mean) ** 2;
  return { mean, sd: Math.sqrt(v) };
}

/** Standard normal cumulative distribution (Abramowitz–Stegun 7.1.26, error < 1.5e−7). */
export function normCdf(zv: number): number {
  const s = zv < 0 ? -1 : 1, a = Math.abs(zv) / Math.SQRT2;
  const t = 1 / (1 + 0.3275911 * a);
  const y = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-a * a);
  return 0.5 * (1 + s * y);
}

/**
 * After n trades with an observed average of `observedR`, how unusual is that
 * if the expected average really is `expectedR` with per-trade sd `sd`?
 * Returns the z-score and the one-sided chance of doing this badly or worse.
 */
export function underperformance(expectedR: number, observedR: number, sd: number, n: number): { z: number; pLower: number } {
  if (!(n > 0) || !(sd > 0)) return { z: NaN, pLower: NaN };
  const zv = ((observedR - expectedR) * Math.sqrt(n)) / sd;
  return { z: zv, pLower: normCdf(zv) };
}

/** Trades needed before a shortfall of `gapR` a trade below expectation reaches z standard errors. */
export function tradesToDetect(gapR: number, sd: number, zv = 2): number {
  if (!(gapR > 0) || !(sd > 0)) return NaN;
  return Math.ceil(((zv * sd) / gapR) ** 2);
}

/** Trades needed for an expected average of `meanR` to stand z standard errors above zero. */
export function tradesToConfirm(meanR: number, sd: number, zv = 2): number {
  return tradesToDetect(meanR, sd, zv);
}

/** Seeded Monte Carlo of the largest peak-to-trough drawdown in R over n trades: percentiles. */
export function drawdownDistribution(o: { seed: number; winRate: number; payoffR: number; trades: number; runs?: number }) {
  const r = rng(o.seed);
  const runs = o.runs ?? 2000;
  const dds: number[] = [];
  for (let k = 0; k < runs; k++) {
    let eq = 0, peak = 0, dd = 0;
    for (let t = 0; t < o.trades; t++) {
      eq += r() < o.winRate ? o.payoffR : -1;
      if (eq > peak) peak = eq;
      if (peak - eq > dd) dd = peak - eq;
    }
    dds.push(dd);
  }
  dds.sort((a, b) => a - b);
  const q = (p: number) => dds[Math.min(dds.length - 1, Math.floor(p * dds.length))];
  return { dds, p50: q(0.5), p95: q(0.95), p99: q(0.99), shareAtLeast: (d: number) => dds.filter((x) => x >= d).length / dds.length };
}

export { probLosingStreak };

// ── Diversifying across strategies ──────────────────────────────────────────

/** Sharpe ratio of an equal-risk mix of n strategies with the same Sharpe s and average pairwise correlation rho. */
export function combinedSharpe(s: number, n: number, rho: number): number {
  const d = 1 + (n - 1) * rho;
  return d <= 0 ? NaN : s * Math.sqrt(n / d);
}

/** Volatility of an equal-weight mix of two strategies. */
export function twoStrategyVol(vol1: number, vol2: number, rho: number): number {
  return Math.sqrt(0.25 * vol1 * vol1 + 0.25 * vol2 * vol2 + 0.5 * rho * vol1 * vol2);
}

// ── Strategy decay ──────────────────────────────────────────────────────────

/** Expected edge per trade after t trades when it halves every `halfLife` trades. */
export function decayedEdge(edge0: number, halfLife: number, t: number): number {
  return halfLife > 0 ? edge0 * Math.pow(0.5, t / halfLife) : edge0;
}

/** First trade at which a decaying edge falls to or below the cost per trade (NaN if never within `max`). */
export function tradesUntilBelowCost(edge0: number, halfLife: number, cost: number, max = 100_000): number {
  if (edge0 <= cost) return 0;
  if (!(halfLife > 0) || cost <= 0) return NaN;
  const t = Math.ceil(halfLife * Math.log2(edge0 / cost));
  return t <= max ? t : NaN;
}

/** Seeded path of trade results (normal, sd `sd`) whose mean decays, net of cost: cumulative R. */
export function decayPath(o: { seed: number; edge0: number; halfLife: number; cost: number; sd: number; trades: number }) {
  const z = normal(rng(o.seed));
  const cum = [0], expected = [0];
  for (let t = 0; t < o.trades; t++) {
    const m = decayedEdge(o.edge0, o.halfLife, t) - o.cost;
    cum.push(cum[t] + m + o.sd * z());
    expected.push(expected[t] + m);
  }
  return { cum, expected };
}

// ── Rule builder: plain choices to an exact spec ────────────────────────────

export type RuleOption = { id: string; label: string; spec: string; ambiguous?: string };
export type RuleField = { id: string; label: string; options: RuleOption[] };

export const RULE_FIELDS: RuleField[] = [
  { id: "market", label: "Market", options: [
    { id: "one", label: "One named instrument", spec: "Market: one named instrument (e.g. a stated index future), nothing else." },
    { id: "list", label: "A fixed list", spec: "Market: a fixed list of instruments written in the spec." },
    { id: "whatever", label: "Whatever is moving", spec: "Market: whatever is moving today.", ambiguous: "\"Whatever is moving\" changes daily and cannot be tested on past data. Name the instruments." },
  ] },
  { id: "timeframe", label: "Timeframe", options: [
    { id: "daily", label: "Daily bars, at the close", spec: "Timeframe: daily bars; signals checked once, at the close." },
    { id: "hourly", label: "1-hour bars, at each bar close", spec: "Timeframe: 1-hour bars; signals checked at each bar close." },
    { id: "feel", label: "Depends on the setup", spec: "Timeframe: depends on the setup.", ambiguous: "A timeframe that depends on the setup lets you pick the chart that agrees with you. Fix one." },
  ] },
  { id: "entry", label: "Entry signal", options: [
    { id: "ma", label: "Close crosses above the 50-bar average", spec: "Entry: buy at the next open after a close above the 50-bar simple moving average." },
    { id: "breakout", label: "Close above the 20-bar high", spec: "Entry: buy at the next open after a close above the highest close of the previous 20 bars." },
    { id: "strong", label: "Price looks strong", spec: "Entry: buy when price looks strong.", ambiguous: "\"Looks strong\" is a judgement. Two people would disagree, and a backtest cannot code it." },
    { id: "breakout-vague", label: "When it breaks out", spec: "Entry: buy when it breaks out.", ambiguous: "Breaks out of what, over how many bars, on a close or intrabar? Say exactly." },
  ] },
  { id: "filter", label: "Filter", options: [
    { id: "none", label: "No filter", spec: "Filter: none." },
    { id: "er", label: "Efficiency ratio above 0.3", spec: "Filter: only take entries when the 20-bar efficiency ratio is above 0.3." },
    { id: "news", label: "Avoid bad news", spec: "Filter: avoid bad news.", ambiguous: "Which news, how long before and after, and who decides it is bad? Write a calendar rule instead." },
  ] },
  { id: "stop", label: "Stop", options: [
    { id: "atr", label: "2 × ATR(14) below entry", spec: "Stop: a stop order 2 × ATR(14) below the entry price, placed at entry, never widened." },
    { id: "swing", label: "Below the last 10-bar low", spec: "Stop: a stop order just below the lowest low of the 10 bars before entry, never widened." },
    { id: "mental", label: "A mental stop", spec: "Stop: a mental stop.", ambiguous: "A mental stop has no price and no order, so it can move. Give a price rule and place the order." },
  ] },
  { id: "exit", label: "Exit", options: [
    { id: "trail", label: "Trailing: close below the 20-bar low", spec: "Exit: sell at the next open after a close below the lowest close of the previous 20 bars." },
    { id: "target", label: "Fixed target at 2R", spec: "Exit: a limit order at 2R above entry; otherwise the stop." },
    { id: "time", label: "After 10 bars", spec: "Exit: sell at the close of the 10th bar after entry if neither stop nor target was hit." },
    { id: "feel", label: "When it stops working", spec: "Exit: when it stops working.", ambiguous: "\"Stops working\" is not a price or time rule. Define the exit you would code." },
  ] },
  { id: "sizing", label: "Position size", options: [
    { id: "fixed", label: "Risk 1% of equity per trade", spec: "Sizing: shares = (1% of equity) ÷ (entry − stop), rounded down." },
    { id: "half", label: "Risk 0.5% of equity per trade", spec: "Sizing: shares = (0.5% of equity) ÷ (entry − stop), rounded down." },
    { id: "conviction", label: "Bigger when confident", spec: "Sizing: bigger when confident.", ambiguous: "Confidence is not measurable in a backtest, and it rises after wins. Use a fixed risk rule." },
  ] },
  { id: "costs", label: "Costs assumed", options: [
    { id: "stated", label: "Commission plus half the spread, per side", spec: "Costs: commission plus half the typical spread on every entry and exit." },
    { id: "none", label: "None", spec: "Costs: none assumed.", ambiguous: "Not ambiguous, but untestable in practice: a rule tested without costs can look profitable and lose live." },
  ] },
];

export function buildSpec(choices: Record<string, string>): { lines: string[]; flags: { field: string; reason: string }[]; testable: boolean } {
  const lines: string[] = [], flags: { field: string; reason: string }[] = [];
  for (const f of RULE_FIELDS) {
    const o = f.options.find((x) => x.id === choices[f.id]);
    if (!o) { flags.push({ field: f.label, reason: "Not chosen. Every part of the rule must be written down." }); continue; }
    lines.push(o.spec);
    if (o.ambiguous) flags.push({ field: f.label, reason: o.ambiguous });
  }
  return { lines, flags, testable: flags.length === 0 };
}
