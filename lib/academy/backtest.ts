import { normal, rng } from "./charts";
import { normCdf } from "./strategy";

/*
  The backtesting engine for Track 11. Everything runs on seeded simulated
  price series built to trend, range, wander or switch between regimes. No
  real market data is used and no result is a claim about any real market.

  Execution model (the default, honest one):
  - a rule is checked on the close of bar t, and any order fills at the OPEN
    of bar t + 1;
  - every fill pays commission plus half the spread and slippage, per side;
  - size is fixed-fractional: risk a set share of equity per trade, where the
    risk is the distance to an ATR stop, capped at 100% of equity (no leverage);
  - the stop is a stop order: if a bar trades through it, the exit is at the
    stop, or at the open if the bar gaps past it;
  - long or flat only.
  The "lookahead bug" mode deliberately breaks the first rule: it reads the
  close of bar t and fills at the open of the same bar, before that close
  could have been known.
*/

export const BARS_PER_YEAR = 252;
export const N_BARS = 1260; // five simulated years of daily bars
const SIGMA = 0.012;

export type Bar = { o: number; h: number; l: number; c: number };
export type Regime = "trending" | "ranging" | "random" | "switching";
export const REGIMES: readonly { id: Regime; label: string }[] = [
  { id: "trending", label: "Trending" },
  { id: "ranging", label: "Ranging" },
  { id: "random", label: "Random walk" },
  { id: "switching", label: "Switching" },
];

/** Seeded daily OHLC bars for one regime. Prices start at 100. */
export function makeSeries(regime: Regime, seed: number, n = N_BARS): Bar[] {
  const rand = rng(seed * 7919 + regime.length * 104729 + 17);
  const z = normal(rand);
  const bars: Bar[] = [];
  let lc = Math.log(100), anchor = lc, drift = (rand() < 0.5 ? 1 : -1) * 0.09 * SIGMA;
  // Trending markets in this model have a mild upward tilt overall.
  if (regime === "trending") drift = 0.09 * SIGMA;
  let prev = 100;
  for (let t = 0; t < n; t++) {
    let mode: "trend" | "range" | "random" = regime === "trending" ? "trend" : regime === "ranging" ? "range" : "random";
    if (regime === "switching") mode = Math.floor(t / 210) % 2 === 0 ? "trend" : "range";
    let r: number;
    if (mode === "trend") {
      if (rand() < 0.004) drift = -drift;
      if (regime === "trending" && drift < 0 && rand() < 0.01) drift = -drift; // up-phases last longer
      r = drift + SIGMA * z();
    } else if (mode === "range") {
      r = -0.04 * (lc - anchor) + SIGMA * z();
    } else {
      r = SIGMA * z();
    }
    if (mode !== "range") anchor = lc + r;
    const nlc = lc + r;
    const c = Math.exp(nlc);
    // The open sits between yesterday's close and today's close, plus a small gap.
    const o = Math.max(0.01, prev * Math.exp(0.35 * r + 0.25 * SIGMA * z()));
    const h = Math.max(o, c) * Math.exp(Math.abs(z()) * 0.45 * SIGMA);
    const l = Math.min(o, c) * Math.exp(-Math.abs(z()) * 0.45 * SIGMA);
    bars.push({ o, h, l, c });
    prev = c;
    lc = nlc;
  }
  return bars;
}

// ── Indicators (value at index i uses bars 0..i only) ──────────────────────

export function sma(x: readonly number[], n: number): number[] {
  const out = new Array<number>(x.length).fill(NaN);
  let s = 0;
  for (let i = 0; i < x.length; i++) {
    s += x[i];
    if (i >= n) s -= x[i - n];
    if (i >= n - 1) out[i] = s / n;
  }
  return out;
}

export function rsi(x: readonly number[], n = 14): number[] {
  const out = new Array<number>(x.length).fill(NaN);
  let up = 0, dn = 0;
  for (let i = 1; i < x.length; i++) {
    const d = x[i] - x[i - 1];
    const u = Math.max(d, 0), v = Math.max(-d, 0);
    if (i <= n) { up += u / n; dn += v / n; } else { up = (up * (n - 1) + u) / n; dn = (dn * (n - 1) + v) / n; }
    if (i >= n) out[i] = dn === 0 ? 100 : 100 - 100 / (1 + up / dn);
  }
  return out;
}

export function atr(bars: readonly Bar[], n = 14): number[] {
  const out = new Array<number>(bars.length).fill(NaN);
  let a = 0;
  for (let i = 0; i < bars.length; i++) {
    const b = bars[i], pc = i > 0 ? bars[i - 1].c : b.o;
    const tr = Math.max(b.h - b.l, Math.abs(b.h - pc), Math.abs(b.l - pc));
    if (i < n) { a += tr / n; if (i === n - 1) out[i] = a; } else { a = (a * (n - 1) + tr) / n; out[i] = a; }
  }
  return out;
}

/** Highest close of the n bars BEFORE index i (not including i). */
function priorExtreme(x: readonly number[], i: number, n: number, kind: "max" | "min"): number {
  if (i < n) return NaN;
  let v = kind === "max" ? -Infinity : Infinity;
  for (let k = i - n; k < i; k++) v = kind === "max" ? Math.max(v, x[k]) : Math.min(v, x[k]);
  return v;
}

// ── Rule templates ──────────────────────────────────────────────────────────

export type Template = "ma" | "breakout" | "rsi";
export type Params = { p1: number; p2: number };
export type TemplateDef = {
  id: Template;
  label: string;
  p1: { label: string; min: number; max: number; step: number; grid: number[] };
  p2: { label: string; min: number; max: number; step: number; grid: number[] };
  defaults: Params;
  describe: (p: Params) => string;
};

export const TEMPLATES: Record<Template, TemplateDef> = {
  ma: {
    id: "ma",
    label: "Moving-average cross",
    p1: { label: "Fast average (bars)", min: 5, max: 60, step: 5, grid: [5, 10, 20, 30, 40, 50] },
    p2: { label: "Slow average (bars)", min: 50, max: 250, step: 10, grid: [60, 90, 120, 150, 200, 250] },
    defaults: { p1: 20, p2: 100 },
    describe: (p) => `Long while the ${p.p1}-bar average of closes is above the ${p.p2}-bar average; flat otherwise.`,
  },
  breakout: {
    id: "breakout",
    label: "Breakout",
    p1: { label: "Entry lookback (bars)", min: 10, max: 120, step: 5, grid: [10, 20, 40, 60, 90, 120] },
    p2: { label: "Exit lookback (bars)", min: 5, max: 60, step: 5, grid: [5, 10, 20, 30, 45, 60] },
    defaults: { p1: 40, p2: 20 },
    describe: (p) => `Buy after a close above the highest close of the previous ${p.p1} bars; sell after a close below the lowest close of the previous ${p.p2}.`,
  },
  rsi: {
    id: "rsi",
    label: "RSI mean-reversion",
    p1: { label: "Buy when RSI(14) is below", min: 10, max: 45, step: 5, grid: [15, 20, 25, 30, 35, 40] },
    p2: { label: "Sell when RSI(14) is above", min: 45, max: 80, step: 5, grid: [45, 50, 55, 60, 70, 80] },
    defaults: { p1: 35, p2: 55 },
    describe: (p) => `Buy after a close with RSI(14) below ${p.p1}; sell after a close with RSI(14) above ${p.p2}.`,
  },
};

export type CostModel = {
  /** Commission per side, in basis points of the trade's value. */
  commissionBps: number;
  /** Half the spread plus slippage, per side, in basis points. */
  slipBps: number;
};

export type RunOptions = {
  template: Template;
  params: Params;
  costs: CostModel;
  /** Share of equity risked per trade, e.g. 0.01. */
  riskFrac: number;
  /** Stop distance in multiples of ATR(14). */
  stopAtr: number;
  /** Deliberate bug: trade at the open of the bar whose close produced the signal. */
  lookahead?: boolean;
  startEquity?: number;
};

export type Trade = {
  entryBar: number;
  exitBar: number;
  entryPx: number;
  exitPx: number;
  units: number;
  /** Money risked at entry (entry − stop) × units. */
  risk: number;
  pnl: number;
  /** pnl ÷ risk. */
  r: number;
  /** pnl ÷ equity at entry. */
  ret: number;
  reason: "signal" | "stop" | "end";
};

export type RunResult = {
  equity: number[];
  position: number[]; // units held at each close
  trades: Trade[];
  costsPaid: number;
};

export const DEFAULT_COSTS: CostModel = { commissionBps: 5, slipBps: 5 };
export const DEFAULT_RUN = { riskFrac: 0.02, stopAtr: 2.5 } as const;

/** The signal (true = want to be long) at the close of bar i, given whether we are long now. */
function signalFn(template: Template, p: Params, closes: readonly number[]) {
  if (template === "ma") {
    const f = sma(closes, Math.min(p.p1, p.p2 - 1)), s = sma(closes, p.p2);
    return (i: number) => Number.isFinite(f[i]) && Number.isFinite(s[i]) && f[i] > s[i];
  }
  if (template === "breakout") {
    return (i: number, long: boolean) => {
      if (!long) return closes[i] > priorExtreme(closes, i, p.p1, "max");
      return !(closes[i] < priorExtreme(closes, i, p.p2, "min"));
    };
  }
  const r = rsi(closes, 14);
  return (i: number, long: boolean) => {
    if (!Number.isFinite(r[i])) return false;
    return long ? !(r[i] > p.p2) : r[i] < p.p1;
  };
}

/** Run one backtest over the whole series. */
export function runBacktest(bars: readonly Bar[], o: RunOptions): RunResult {
  const n = bars.length;
  const closes = bars.map((b) => b.c);
  const a = atr(bars, 14);
  const want = signalFn(o.template, o.params, closes);
  const side = (o.costs.commissionBps + o.costs.slipBps) / 1e4;
  const slip = o.costs.slipBps / 1e4, comm = o.costs.commissionBps / 1e4;
  let cash = o.startEquity ?? 100_000;
  let units = 0, stop = 0, entryPx = 0, entryBar = -1, risk = 0, eqAtEntry = 0, entryCost = 0;
  // A moving-average rule must see its signal turn off before it can re-enter after a stop.
  let armed = true;
  const equity: number[] = new Array(n), position: number[] = new Array(n);
  const trades: Trade[] = [];
  let costsPaid = 0;

  const exit = (i: number, px: number, reason: Trade["reason"]) => {
    const fill = px * (1 - slip);
    const c = fill * units * comm;
    cash += fill * units - c;
    costsPaid += c + px * units * slip;
    const pnl = (fill - entryPx) * units - c - entryCost;
    trades.push({ entryBar, exitBar: i, entryPx, exitPx: fill, units, risk, pnl, r: risk > 0 ? pnl / risk : 0, ret: eqAtEntry > 0 ? pnl / eqAtEntry : 0, reason });
    units = 0;
  };
  const enter = (i: number, px: number, atrNow: number) => {
    const eq = cash;
    const dist = o.stopAtr * atrNow;
    if (!(dist > 0) || !(px > 0)) return;
    const fill = px * (1 + slip);
    let u = (o.riskFrac * eq) / dist;
    u = Math.min(u, eq / (fill * (1 + side))); // no leverage
    if (u <= 0) return;
    const c = fill * u * comm;
    cash -= fill * u + c;
    costsPaid += c + px * u * slip;
    units = u; entryPx = fill; entryBar = i; stop = px - dist; risk = (fill - stop) * u; eqAtEntry = eq; entryCost = c;
  };

  for (let i = 0; i < n; i++) {
    const b = bars[i];
    // Orders decided on the previous close fill at this open (honest mode).
    if (!o.lookahead && i > 0) {
      const long = units > 0;
      const w = want(i - 1, long);
      if (o.template === "ma" && !w) armed = true;
      if (long && !w) exit(i, b.o, "signal");
      else if (!long && w && armed && Number.isFinite(a[i - 1])) { enter(i, b.o, a[i - 1]); armed = false; }
    }
    // Lookahead bug: read this bar's close, trade at this bar's open.
    if (o.lookahead) {
      const long = units > 0;
      const w = want(i, long);
      if (o.template === "ma" && !w) armed = true;
      if (long && !w) exit(i, b.o, "signal");
      else if (!long && w && armed && Number.isFinite(a[i])) { enter(i, b.o, a[i]); armed = false; }
    }
    // The stop order works during the bar.
    if (units > 0 && b.l <= stop) {
      exit(i, Math.min(b.o, stop), "stop");
      if (o.template !== "ma") armed = true;
    }
    if (o.template !== "ma") armed = true;
    if (i === n - 1 && units > 0) exit(i, b.c, "end");
    equity[i] = cash + units * b.c;
    position[i] = units;
  }
  return { equity, position, trades, costsPaid };
}

/** Buy at the first bar's open, hold to the end, paying one entry cost. */
export function buyAndHold(bars: readonly Bar[], costs: CostModel, startEquity = 100_000): number[] {
  const side = (costs.commissionBps + costs.slipBps) / 1e4;
  const u = startEquity / (bars[0].o * (1 + side));
  return bars.map((b) => u * b.c);
}

// ── Metrics ─────────────────────────────────────────────────────────────────

export type Metrics = {
  totalReturn: number;
  cagr: number;
  sharpe: number;
  sortino: number;
  maxDD: number;
  profitFactor: number;
  winRate: number;
  expectancyR: number;
  exposure: number;
  trades: number;
  years: number;
};

export function returnsOf(equity: readonly number[], from = 0, to = equity.length): number[] {
  const out: number[] = [];
  for (let i = Math.max(1, from + 1); i < to; i++) out.push(equity[i] / equity[i - 1] - 1);
  return out;
}

export function sharpeOf(rets: readonly number[]): number {
  if (rets.length < 2) return NaN;
  const m = rets.reduce((s, x) => s + x, 0) / rets.length;
  const v = rets.reduce((s, x) => s + (x - m) ** 2, 0) / (rets.length - 1);
  return v > 0 ? (m / Math.sqrt(v)) * Math.sqrt(BARS_PER_YEAR) : 0;
}

export function drawdowns(equity: readonly number[]): number[] {
  let peak = -Infinity;
  return equity.map((e) => { peak = Math.max(peak, e); return peak > 0 ? e / peak - 1 : 0; });
}

export function maxDrawdown(equity: readonly number[]): number {
  return Math.min(0, ...drawdowns(equity));
}

export function metrics(run: Pick<RunResult, "equity" | "position" | "trades">, from = 0, to = run.equity.length): Metrics {
  const eq = run.equity.slice(from, to);
  const rets = returnsOf(run.equity, from, to);
  const years = Math.max(1 / BARS_PER_YEAR, (to - from) / BARS_PER_YEAR);
  const total = eq.length ? eq[eq.length - 1] / eq[0] - 1 : 0;
  const m = rets.length ? rets.reduce((s, x) => s + x, 0) / rets.length : 0;
  const down = rets.length ? Math.sqrt(rets.reduce((s, x) => s + Math.min(0, x) ** 2, 0) / rets.length) : 0;
  const tr = run.trades.filter((t) => t.entryBar >= from && t.entryBar < to);
  const wins = tr.filter((t) => t.pnl > 0), losses = tr.filter((t) => t.pnl <= 0);
  const gw = wins.reduce((s, t) => s + t.pnl, 0), gl = -losses.reduce((s, t) => s + t.pnl, 0);
  let inMkt = 0;
  for (let i = from; i < to; i++) if (run.position[i] > 0) inMkt++;
  return {
    totalReturn: total,
    cagr: eq.length ? Math.pow(Math.max(1e-9, 1 + total), 1 / years) - 1 : 0,
    sharpe: sharpeOf(rets),
    sortino: down > 0 ? (m / down) * Math.sqrt(BARS_PER_YEAR) : NaN,
    maxDD: maxDrawdown(eq),
    profitFactor: gl > 0 ? gw / gl : gw > 0 ? Infinity : NaN,
    winRate: tr.length ? wins.length / tr.length : NaN,
    expectancyR: tr.length ? tr.reduce((s, t) => s + t.r, 0) / tr.length : NaN,
    exposure: to > from ? inMkt / (to - from) : 0,
    trades: tr.length,
    years,
  };
}

/** Metrics for a plain equity curve (benchmark), with no trades. */
export function curveMetrics(equity: readonly number[], from = 0, to = equity.length): Metrics {
  return { ...metrics({ equity: [...equity], position: equity.map(() => 1), trades: [] }, from, to), profitFactor: NaN, winRate: NaN, expectancyR: NaN, trades: 1 };
}

/** First bar where every indicator of the template has a value (so IS starts fairly). */
export function warmup(template: Template, p: Params): number {
  if (template === "ma") return p.p2;
  if (template === "breakout") return Math.max(p.p1, p.p2) + 1;
  return 15;
}

// ── Parameter sweep, walk-forward ───────────────────────────────────────────

export type Cell = { p1: number; p2: number; valid: boolean; run: RunResult | null };

/** Run every grid combination once over the whole series (invalid pairs skipped). */
export function sweep(bars: readonly Bar[], template: Template, base: Omit<RunOptions, "template" | "params">): Cell[][] {
  const def = TEMPLATES[template];
  return def.p1.grid.map((p1) => def.p2.grid.map((p2) => {
    const valid = template === "ma" ? p1 < p2 : template === "rsi" ? p1 < p2 : true;
    return { p1, p2, valid, run: valid ? runBacktest(bars, { ...base, template, params: { p1, p2 } }) : null };
  }));
}

export function sharpeIn(run: RunResult | null, from: number, to: number): number {
  return run ? sharpeOf(returnsOf(run.equity, from, to)) : NaN;
}

/** Mean Sharpe of a cell's neighbours (8-connected), to tell plateaus from spikes. */
export function neighbourMean(grid: number[][], i: number, j: number): number {
  let s = 0, k = 0;
  for (let di = -1; di <= 1; di++) for (let dj = -1; dj <= 1; dj++) {
    if (!di && !dj) continue;
    const v = grid[i + di]?.[j + dj];
    if (v !== undefined && Number.isFinite(v)) { s += v; k++; }
  }
  return k ? s / k : NaN;
}

export type WfWindow = { trainFrom: number; trainTo: number; testTo: number; p1: number; p2: number; trainSharpe: number; testSharpe: number };

/**
 * Walk-forward: at each step pick the grid cell with the best Sharpe on the
 * training window, then use only that cell's returns on the next test window.
 * Cells are run once on the whole series, so a position can carry into a
 * test window from before it; the choice itself never sees test data.
 */
export function walkForward(cells: Cell[][], n: number, train: number, test: number, start: number): { windows: WfWindow[]; oosEquity: number[]; oosSharpe: number; avgTrainSharpe: number } {
  const flat = cells.flat().filter((c) => c.valid && c.run);
  const windows: WfWindow[] = [];
  const oosRets: number[] = [];
  for (let s = start; s + train + test <= n; s += test) {
    let best: Cell | null = null, bestS = -Infinity;
    for (const c of flat) { const sh = sharpeIn(c.run, s, s + train); if (sh > bestS) { bestS = sh; best = c; } }
    if (!best) break;
    const r = returnsOf(best.run!.equity, s + train - 1, s + train + test);
    oosRets.push(...r);
    windows.push({ trainFrom: s, trainTo: s + train, testTo: s + train + test, p1: best.p1, p2: best.p2, trainSharpe: bestS, testSharpe: sharpeOf(r) });
  }
  const oosEquity = [1];
  for (const r of oosRets) oosEquity.push(oosEquity[oosEquity.length - 1] * (1 + r));
  return { windows, oosEquity, oosSharpe: sharpeOf(oosRets), avgTrainSharpe: windows.length ? windows.reduce((a, w) => a + w.trainSharpe, 0) / windows.length : NaN };
}

// ── Monte Carlo and bootstrap ───────────────────────────────────────────────

function quantile(sorted: readonly number[], q: number): number {
  if (!sorted.length) return NaN;
  const k = Math.min(sorted.length - 1, Math.max(0, Math.round(q * (sorted.length - 1))));
  return sorted[k];
}

function pathDD(rets: readonly number[]): number {
  let e = 1, peak = 1, dd = 0;
  for (const r of rets) { e *= 1 + r; peak = Math.max(peak, e); dd = Math.min(dd, e / peak - 1); }
  return dd;
}

export type MonteCarlo = {
  actualDD: number;
  dds: number[]; // sorted, most negative first
  ddP5: number; ddP50: number; ddP95: number;
  bootMeanR: number[]; // sorted
  meanR: number;
  rCI: [number, number];
  totalCI: [number, number];
  shareMeanRBelowZero: number;
};

/** Shuffle trade order (drawdown spread) and resample trades with replacement (confidence intervals). */
export function monteCarlo(trades: readonly Trade[], seed: number, runs = 1000): MonteCarlo {
  const rets = trades.map((t) => t.ret), rs = trades.map((t) => t.r);
  const rand = rng(seed * 31 + 5);
  const dds: number[] = [], boot: number[] = [], tot: number[] = [];
  const k = rets.length;
  for (let s = 0; s < runs && k > 0; s++) {
    const a = rets.slice();
    for (let i = k - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    dds.push(pathDD(a));
    let sr = 0, e = 1;
    for (let i = 0; i < k; i++) { const j = Math.floor(rand() * k); sr += rs[j]; e *= 1 + rets[j]; }
    boot.push(sr / k);
    tot.push(e - 1);
  }
  dds.sort((x, y) => x - y); boot.sort((x, y) => x - y); tot.sort((x, y) => x - y);
  return {
    actualDD: pathDD(rets),
    dds,
    ddP5: quantile(dds, 0.05), ddP50: quantile(dds, 0.5), ddP95: quantile(dds, 0.95),
    bootMeanR: boot,
    meanR: k ? rs.reduce((x, y) => x + y, 0) / k : NaN,
    rCI: [quantile(boot, 0.05), quantile(boot, 0.95)],
    totalCI: [quantile(tot, 0.05), quantile(tot, 0.95)],
    shareMeanRBelowZero: boot.length ? boot.filter((x) => x <= 0).length / boot.length : NaN,
  };
}

// ── Multiple testing: deflated Sharpe and a simple haircut ─────────────────

/** Inverse of the standard normal CDF (Acklam's approximation). */
export function invNorm(p: number): number {
  if (p <= 0) return -Infinity;
  if (p >= 1) return Infinity;
  const a = [-39.69683028665376, 220.9460984245205, -275.9285104469687, 138.357751867269, -30.66479806614716, 2.506628277459239];
  const b = [-54.47609879822406, 161.5858368580409, -155.6989798598866, 66.80131188771972, -13.28068155288572];
  const c = [-0.007784894002430293, -0.3223964580411365, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
  const d = [0.007784695709041462, 0.3224671290700398, 2.445134137142996, 3.754408661907416];
  const pl = 0.02425;
  if (p < pl) { const q = Math.sqrt(-2 * Math.log(p)); return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
  if (p > 1 - pl) { const q = Math.sqrt(-2 * Math.log(1 - p)); return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
  const q = p - 0.5, r = q * q;
  return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
}

const EULER_GAMMA = 0.5772156649;

/**
 * Expected maximum of N independent Sharpe estimates when every true Sharpe
 * is zero, in units of their standard deviation (Bailey and López de Prado 2014, eq. 1).
 */
export function expectedMaxZ(nTrials: number): number {
  if (nTrials <= 1) return 0;
  return (1 - EULER_GAMMA) * invNorm(1 - 1 / nTrials) + EULER_GAMMA * invNorm(1 - 1 / (nTrials * Math.E));
}

export function moments(rets: readonly number[]): { skew: number; kurt: number } {
  const n = rets.length;
  if (n < 3) return { skew: 0, kurt: 3 };
  const m = rets.reduce((s, x) => s + x, 0) / n;
  const v = rets.reduce((s, x) => s + (x - m) ** 2, 0) / n;
  if (!(v > 0)) return { skew: 0, kurt: 3 };
  const s3 = rets.reduce((s, x) => s + (x - m) ** 3, 0) / n, s4 = rets.reduce((s, x) => s + (x - m) ** 4, 0) / n;
  return { skew: s3 / v ** 1.5, kurt: s4 / v ** 2 };
}

/**
 * Deflated Sharpe ratio: the probability that the true Sharpe is above zero
 * after allowing for N trials and for skew and fat tails. Uses per-bar
 * Sharpe ratios; the spread of trial Sharpes is taken as 1/√T, as if every
 * trial had no edge and the trials were independent (a simplification).
 */
export function deflatedSharpe(annualSharpe: number, nTrials: number, T: number, skew = 0, kurt = 3): { sr0Annual: number; dsr: number } {
  const sr = annualSharpe / Math.sqrt(BARS_PER_YEAR);
  const sr0 = expectedMaxZ(nTrials) / Math.sqrt(Math.max(2, T));
  const den = Math.sqrt(Math.max(1e-9, 1 - skew * sr + ((kurt - 1) / 4) * sr * sr));
  return { sr0Annual: sr0 * Math.sqrt(BARS_PER_YEAR), dsr: normCdf(((sr - sr0) * Math.sqrt(Math.max(1, T - 1))) / den) };
}

/**
 * A simple haircut in the spirit of Harvey and Liu: turn the Sharpe into a
 * t-statistic, multiply its p-value by the number of trials (Bonferroni),
 * and turn the adjusted p-value back into a Sharpe.
 */
export function haircutSharpe(annualSharpe: number, years: number, nTrials: number): { tStat: number; p: number; pAdj: number; adjusted: number; haircut: number } {
  const t = annualSharpe * Math.sqrt(Math.max(1e-9, years));
  const p = 2 * (1 - normCdf(Math.abs(t)));
  const pAdj = Math.min(1, p * Math.max(1, nTrials));
  const tAdj = pAdj >= 1 ? 0 : invNorm(1 - pAdj / 2);
  const adjusted = Math.sign(annualSharpe) * Math.max(0, tAdj) / Math.sqrt(Math.max(1e-9, years));
  return { tStat: t, p, pAdj, adjusted, haircut: annualSharpe > 0 ? 1 - adjusted / annualSharpe : NaN };
}

// ── Survivorship ────────────────────────────────────────────────────────────

export type Stock = { finalReturn: number; delisted: boolean; delistBar: number; vol: number };

/**
 * A simulated universe of stocks with no edge built in. A stock that falls
 * below `floor` × its start price is delisted, and the investor gets
 * `recovery` × that price back. A survivor-only database would hold only
 * the stocks still listed at the end.
 */
export function survivorUniverse(seed: number, count = 200, bars = N_BARS, floor = 0.3, recovery = 0.5): Stock[] {
  const rand = rng(seed * 4099 + 3);
  const z = normal(rand);
  const out: Stock[] = [];
  for (let s = 0; s < count; s++) {
    const vol = 0.01 + 0.025 * rand();
    let lp = 0, delisted = false, at = -1;
    for (let t = 0; t < bars; t++) {
      lp += -0.5 * vol * vol + vol * z(); // zero expected return
      if (Math.exp(lp) < floor) { delisted = true; at = t; break; }
    }
    out.push({ finalReturn: delisted ? Math.exp(lp) * recovery - 1 : Math.exp(lp) - 1, delisted, delistBar: at, vol });
  }
  return out;
}

// ── Data adjustments ────────────────────────────────────────────────────────

export type AdjustKind = "split" | "dividend" | "roll";

/**
 * A short raw series and its adjusted version. Split: a 2-for-1 split halves
 * the raw price. Dividend: the price drops by each payout on its ex-date.
 * Roll: a continuous futures series stitched from contracts whose prices differ
 * at each roll. Back-adjusting removes the artificial jumps.
 */
export function adjustmentDemo(kind: AdjustKind, seed: number, n = 300): { raw: number[]; adjusted: number[]; events: number[]; biggestRawMove: number; biggestAdjMove: number; rawTotal: number; adjTotal: number } {
  const rand = rng(seed * 613 + 11), z = normal(rand);
  const base: number[] = [];
  let p = 50;
  for (let i = 0; i < n; i++) { p *= Math.exp(0.0003 + 0.011 * z()); base.push(p); }
  const raw = base.slice(), events: number[] = [];
  let adjusted = base.slice();
  if (kind === "split") {
    const at = 150; events.push(at);
    for (let i = at; i < n; i++) raw[i] = base[i] / 2;
    adjusted = raw.map((x, i) => (i < at ? x / 2 : x));
  } else if (kind === "dividend") {
    // Quarterly payouts of 1.5% of price: the raw price drops on each ex-date; total return adds it back.
    let cum = 1;
    const factor: number[] = new Array(n).fill(1);
    for (let i = 0; i < n; i++) {
      if (i > 0 && i % 63 === 0) { events.push(i); cum *= 1 - 0.015; }
      factor[i] = cum;
    }
    for (let i = 0; i < n; i++) raw[i] = base[i] * factor[i];
    adjusted = base.slice();
  } else {
    // Each new contract trades 3% above the expiring one (contango). A naive stitch jumps up at each roll.
    let jump = 1;
    for (let i = 0; i < n; i++) {
      if (i > 0 && i % 60 === 0) { events.push(i); jump *= 1.03; }
      raw[i] = base[i] * jump;
    }
    const last = jump;
    adjusted = base.map((x) => x * last); // back-adjusted to the latest contract's level
  }
  const big = (s: number[]) => { let m = 0; for (let i = 1; i < s.length; i++) { const r = s[i] / s[i - 1] - 1; if (Math.abs(r) > Math.abs(m)) m = r; } return m; };
  return { raw, adjusted, events, biggestRawMove: big(raw), biggestAdjMove: big(adjusted), rawTotal: raw[n - 1] / raw[0] - 1, adjTotal: adjusted[n - 1] / adjusted[0] - 1 };
}

// ── Forward gap: best of a search on history versus the next two years ─────

export type ForwardPoint = { seed: number; bestIs: number; bestFwd: number; fixedIs: number; fixedFwd: number };

/**
 * For each seed: simulate 5 years, search the grid on the first 3 years, then
 * trade the winner on the last 2. Also report a single rule chosen before
 * looking (the template's defaults) on both periods.
 */
export function forwardGap(regime: Regime, template: Template, seeds: number, base: Omit<RunOptions, "template" | "params">): ForwardPoint[] {
  const out: ForwardPoint[] = [];
  const split = 756;
  for (let s = 1; s <= seeds; s++) {
    const bars = makeSeries(regime, 500 + s);
    const cells = sweep(bars, template, base).flat().filter((c) => c.valid);
    let best: Cell | null = null, bs = -Infinity;
    const w = 260;
    for (const c of cells) { const sh = sharpeIn(c.run, w, split); if (sh > bs) { bs = sh; best = c; } }
    const fixed = runBacktest(bars, { ...base, template, params: TEMPLATES[template].defaults });
    out.push({ seed: s, bestIs: bs, bestFwd: sharpeIn(best?.run ?? null, split, bars.length), fixedIs: sharpeIn(fixed, w, split), fixedFwd: sharpeIn(fixed, split, bars.length) });
  }
  return out;
}

/** Cost sweep: net Sharpe and CAGR at each per-side cost level (commission + slippage combined). */
export function costSweep(bars: readonly Bar[], template: Template, params: Params, levelsBps: readonly number[], riskFrac: number, stopAtr: number) {
  return levelsBps.map((bps) => {
    const run = runBacktest(bars, { template, params, costs: { commissionBps: bps / 2, slipBps: bps / 2 }, riskFrac, stopAtr });
    const w = warmup(template, params);
    const m = metrics(run, w);
    return { bps, sharpe: m.sharpe, cagr: m.cagr, trades: m.trades, costsPaid: run.costsPaid };
  });
}

/** A stable text key for a configuration, used by the data-snooping counter. */
export function configKey(regime: Regime, seed: number, o: RunOptions): string {
  return [regime, seed, o.template, o.params.p1, o.params.p2, o.costs.commissionBps, o.costs.slipBps, o.riskFrac, o.stopAtr, o.lookahead ? 1 : 0].join("|");
}
