/**
 * Pure chart helpers for the Chart Reading track (and later tracks that reuse
 * the chart component). No React, no DOM, no randomness without a seed.
 *
 * Every price series here is SIMULATED by a seeded generator. Nothing in this
 * file is, or pretends to be, real market data.
 */

// ── Types ───────────────────────────────────────────────────────────────────

/** One bar (candle). `t` is the bar's position in time units of the series (e.g. minutes or days). */
export type Bar = { t: number; o: number; h: number; l: number; c: number; v: number };

/** One simulated trade print. */
export type Tick = { t: number; price: number; size: number; side: "buy" | "sell"; bid: number; ask: number };

// ── Seeded randomness ───────────────────────────────────────────────────────

/** mulberry32: a small, fast, seeded generator. Returns numbers in [0, 1). */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Standard normal draws from a uniform generator (Box–Muller). */
export function normal(rand: () => number): () => number {
  return () => {
    const u = Math.max(rand(), 1e-12), v = rand();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };
}

const round = (x: number, dp: number) => {
  const k = 10 ** dp;
  return Math.round(x * k) / k;
};

// ── Simulation ──────────────────────────────────────────────────────────────

export type Regime = "up" | "down" | "range";

export type SimOptions = {
  seed: number;
  bars: number;
  start?: number;
  /** Typical per-bar volatility of log returns, e.g. 0.01 = about 1% per bar. */
  vol?: number;
  /** Drift per bar in trending regimes (log return), e.g. 0.002. */
  trend?: number;
  /** Chance per bar of switching regime. 0 keeps one regime (a plain random walk if `regimes` is false). */
  switchChance?: number;
  /** false: a driftless random walk with constant volatility (no regimes at all). */
  regimes?: boolean;
  /** The regime to start in (default: chosen by the seed). */
  initial?: Regime;
  /** Chance per bar of an opening gap. */
  gapChance?: number;
  /** Typical gap size as a log return (sign random). */
  gapSize?: number;
  /** Average volume per bar. */
  volume?: number;
  /** Price decimals. */
  decimals?: number;
  /** Sub-steps per bar used to draw a realistic high and low. */
  steps?: number;
};

/**
 * A simulated OHLCV series: a random walk whose drift and volatility switch
 * between regimes (up-trend, down-trend, range), with optional opening gaps.
 * Volume rises with the size of the move and on gaps, as it often does in
 * real markets, but the numbers are made up.
 */
export function simulateSeries(opt: SimOptions): { bars: Bar[]; regimes: Regime[] } {
  const rand = rng(opt.seed);
  const z = normal(rand);
  const n = Math.max(0, Math.floor(opt.bars));
  const vol = opt.vol ?? 0.01;
  const trend = opt.trend ?? 0.0025;
  const sw = opt.switchChance ?? 0.04;
  const useRegimes = opt.regimes ?? true;
  const gapChance = opt.gapChance ?? 0;
  const gapSize = opt.gapSize ?? 0.03;
  const vBase = opt.volume ?? 10_000;
  const dp = opt.decimals ?? 2;
  const steps = Math.max(1, opt.steps ?? 6);
  const out: Bar[] = [];
  const regimes: Regime[] = [];
  const pick = (["up", "down", "range"] as const)[Math.floor(rand() * 3)];
  let regime: Regime = useRegimes ? opt.initial ?? pick : "range";
  let prev = opt.start ?? 100;
  let rangeAnchor = prev;
  for (let i = 0; i < n; i++) {
    if (useRegimes && rand() < sw) {
      const next = (["up", "down", "range"] as const).filter((r) => r !== regime);
      regime = next[Math.floor(rand() * next.length)];
      rangeAnchor = prev;
    }
    let drift = 0, v = vol;
    if (useRegimes) {
      if (regime === "up") drift = trend;
      else if (regime === "down") drift = -trend;
      else { drift = -0.08 * Math.log(prev / rangeAnchor); v = vol * 0.75; } // mean-reverting around the range anchor
    }
    let gap = 0;
    if (gapChance > 0 && rand() < gapChance) gap = (rand() < 0.5 ? -1 : 1) * gapSize * (0.6 + rand() * 0.8);
    const open = prev * Math.exp(gap);
    let p = open, hi = open, lo = open;
    for (let s = 0; s < steps; s++) {
      p *= Math.exp(drift / steps + (v / Math.sqrt(steps)) * z());
      hi = Math.max(hi, p);
      lo = Math.min(lo, p);
    }
    const o = round(open, dp), c = round(p, dp);
    const h = Math.max(round(hi, dp), o, c), l = Math.min(round(lo, dp), o, c);
    const move = Math.abs(Math.log(p / prev)) / vol;
    const volume = Math.round(vBase * (0.55 + 0.35 * move + 0.25 * Math.abs(z())) * (gap !== 0 ? 2.5 : 1));
    out.push({ t: i, o, h, l, c, v: Math.max(1, volume) });
    regimes.push(regime);
    prev = p;
  }
  return { bars: out, regimes };
}

/**
 * Simulated trade prints around a mid price: each trade happens at the bid
 * (a seller crossed the spread) or at the ask (a buyer did). Times are seconds.
 */
export function simulateTicks(opt: { seed: number; trades: number; start?: number; spread?: number; vol?: number; decimals?: number; meanGap?: number }): Tick[] {
  const rand = rng(opt.seed);
  const z = normal(rand);
  const dp = opt.decimals ?? 2;
  const spread = opt.spread ?? 0.02;
  const vol = opt.vol ?? 0.0006;
  const gapMean = opt.meanGap ?? 2;
  let mid = opt.start ?? 100;
  let t = 0;
  const out: Tick[] = [];
  for (let i = 0; i < opt.trades; i++) {
    t += Math.max(0.05, -Math.log(Math.max(rand(), 1e-9)) * gapMean); // waiting times between trades
    mid *= Math.exp(vol * z());
    const bid = round(mid - spread / 2, dp), ask = round(Math.max(mid + spread / 2, bid + 10 ** -dp), dp);
    const side: Tick["side"] = rand() < 0.5 ? "buy" : "sell";
    const size = Math.max(1, Math.round(Math.exp(4 + 1.1 * z())));
    out.push({ t: round(t, 2), price: side === "buy" ? ask : bid, size, side, bid, ask });
  }
  return out;
}

// ── Building and re-aggregating bars ────────────────────────────────────────

/** Combines one group of bars into one: first open, highest high, lowest low, last close, summed volume. */
export function combine(group: readonly Bar[]): Bar {
  if (group.length === 0) throw new Error("combine: empty group");
  let h = -Infinity, l = Infinity, v = 0;
  for (const b of group) { if (b.h > h) h = b.h; if (b.l < l) l = b.l; v += b.v; }
  return { t: group[0].t, o: group[0].o, h, l, c: group[group.length - 1].c, v };
}

/**
 * Re-aggregates bars into bars `k` times longer (e.g. 60 one-minute bars into
 * one hourly bar). A last, incomplete group is kept and flagged by `partial`.
 */
export function aggregate(bars: readonly Bar[], k: number): { bars: Bar[]; partial: boolean } {
  const size = Math.max(1, Math.floor(k));
  const out: Bar[] = [];
  for (let i = 0; i < bars.length; i += size) out.push(combine(bars.slice(i, i + size)));
  return { bars: out, partial: bars.length % size !== 0 };
}

/** Bars from trade prints: by clock time, by number of trades, by traded volume or by price range. */
export type BarRule =
  | { kind: "time"; seconds: number }
  | { kind: "tick"; trades: number }
  | { kind: "volume"; size: number }
  | { kind: "range"; range: number };

export function barsFromTicks(ticks: readonly Tick[], rule: BarRule): Bar[] {
  const out: Bar[] = [];
  let cur: Bar | null = null, count = 0, bucket = -1;
  const close = () => { if (cur) out.push(cur); cur = null; count = 0; };
  for (const tk of ticks) {
    if (rule.kind === "time") {
      const b = Math.floor(tk.t / rule.seconds);
      if (cur && b !== bucket) close();
      bucket = b;
    }
    if (!cur) cur = { t: rule.kind === "time" ? bucket * rule.seconds : tk.t, o: tk.price, h: tk.price, l: tk.price, c: tk.price, v: 0 };
    if (rule.kind === "range" && Math.max(cur.h, tk.price) - Math.min(cur.l, tk.price) > rule.range + 1e-9) {
      close();
      cur = { t: tk.t, o: tk.price, h: tk.price, l: tk.price, c: tk.price, v: 0 };
    }
    cur.h = Math.max(cur.h, tk.price);
    cur.l = Math.min(cur.l, tk.price);
    cur.c = tk.price;
    cur.v += tk.size;
    count++;
    if (rule.kind === "tick" && count >= rule.trades) close();
    else if (rule.kind === "volume" && cur.v >= rule.size) close();
  }
  close();
  return out;
}

// ── Transformed charts ─────────────────────────────────────────────────────

/**
 * Heikin-Ashi candles. They are averages, not prices that traded:
 *   HA close = (O + H + L + C) / 4
 *   HA open  = (previous HA open + previous HA close) / 2   (first: (O + C) / 2)
 *   HA high  = max(H, HA open, HA close),  HA low = min(L, HA open, HA close)
 */
export function heikinAshi(bars: readonly Bar[]): Bar[] {
  const out: Bar[] = [];
  for (let i = 0; i < bars.length; i++) {
    const b = bars[i];
    const c = (b.o + b.h + b.l + b.c) / 4;
    const o = i === 0 ? (b.o + b.c) / 2 : (out[i - 1].o + out[i - 1].c) / 2;
    out.push({ t: b.t, o, c, h: Math.max(b.h, o, c), l: Math.min(b.l, o, c), v: b.v });
  }
  return out;
}

export type Brick = { lo: number; hi: number; dir: "up" | "down"; bar: number };

/**
 * Renko bricks from closing prices. A new brick in the same direction needs a
 * move of one box beyond the last brick; a reversal needs two boxes (one to
 * get back to the far edge of the last brick, one more to print). Time is
 * ignored entirely: quiet periods print nothing.
 */
export function renko(closes: readonly number[], box: number): Brick[] {
  if (!(box > 0) || closes.length === 0) return [];
  const out: Brick[] = [];
  let lo = closes[0], hi = closes[0]; // edges of the last brick (a zero-height start)
  for (let i = 1; i < closes.length; i++) {
    const c = closes[i];
    // Using the far edge of the last brick makes a reversal need two boxes automatically.
    while (c >= hi + box - 1e-9) {
      out.push({ lo: hi, hi: hi + box, dir: "up", bar: i });
      lo = hi; hi = hi + box;
      if (out.length > 100_000) break;
    }
    while (c <= lo - box + 1e-9) {
      out.push({ lo: lo - box, hi: lo, dir: "down", bar: i });
      hi = lo; lo = lo - box;
      if (out.length > 100_000) break;
    }
  }
  return out;
}

export type PfColumn = { dir: "X" | "O"; /** Box levels in box units (price = units × box). */ top: number; bottom: number; startBar: number };

/**
 * Point-and-figure columns from closing prices. X columns rise, O columns
 * fall; a new column starts only after a reversal of `reversal` boxes
 * (3 is the classic choice). Like Renko, it ignores time and small moves.
 */
export function pointAndFigure(closes: readonly number[], box: number, reversal = 3): PfColumn[] {
  if (!(box > 0) || closes.length === 0) return [];
  const up = (p: number) => Math.floor(p / box + 1e-9);
  const dn = (p: number) => Math.ceil(p / box - 1e-9);
  const cols: PfColumn[] = [];
  const startUnit = up(closes[0]);
  for (let i = 1; i < closes.length; i++) {
    const c = closes[i];
    const cur = cols[cols.length - 1];
    if (!cur) {
      if (up(c) >= startUnit + 1) cols.push({ dir: "X", bottom: startUnit, top: up(c), startBar: i });
      else if (dn(c) <= startUnit - 1) cols.push({ dir: "O", top: startUnit, bottom: dn(c), startBar: i });
      continue;
    }
    if (cur.dir === "X") {
      if (up(c) > cur.top) cur.top = up(c);
      else if (dn(c) <= cur.top - reversal) cols.push({ dir: "O", top: cur.top - 1, bottom: dn(c), startBar: i });
    } else {
      if (dn(c) < cur.bottom) cur.bottom = dn(c);
      else if (up(c) >= cur.bottom + reversal) cols.push({ dir: "X", bottom: cur.bottom + 1, top: up(c), startBar: i });
    }
  }
  return cols;
}

// ── Candles ─────────────────────────────────────────────────────────────────

export type CandleMetrics = {
  body: number;
  range: number;
  upperWick: number;
  lowerWick: number;
  /** Body ÷ range, 0–1. 0 when the range is zero. */
  bodyRatio: number;
  direction: "bullish" | "bearish" | "flat";
};

export function candleMetrics(b: Pick<Bar, "o" | "h" | "l" | "c">): CandleMetrics {
  const body = Math.abs(b.c - b.o);
  const range = b.h - b.l;
  return {
    body,
    range,
    upperWick: b.h - Math.max(b.o, b.c),
    lowerWick: Math.min(b.o, b.c) - b.l,
    bodyRatio: range > 0 ? body / range : 0,
    direction: b.c > b.o ? "bullish" : b.c < b.o ? "bearish" : "flat",
  };
}

/** What is wrong with an open/high/low/close set, in plain words. Empty means valid. */
export function validateOhlc(b: Pick<Bar, "o" | "h" | "l" | "c">): string[] {
  const out: string[] = [];
  for (const [k, v] of [["Open", b.o], ["High", b.h], ["Low", b.l], ["Close", b.c]] as const) if (!Number.isFinite(v) || v <= 0) out.push(`${k} must be a price above zero.`);
  if (out.length) return out;
  if (b.h < Math.max(b.o, b.c)) out.push("The high must be at least as high as both the open and the close: it is the highest price traded in the period.");
  if (b.l > Math.min(b.o, b.c)) out.push("The low must be at or below both the open and the close: it is the lowest price traded in the period.");
  if (b.h < b.l) out.push("The high cannot be below the low.");
  return out;
}

// ── Candlestick patterns (shapes only) ──────────────────────────────────────
// These detect SHAPES. They say nothing about what happens next; the lessons
// stress that the evidence for patterns as signals is mixed at best.

export type PatternId =
  | "doji" | "marubozu" | "hammer" | "hanging-man" | "inverted-hammer" | "shooting-star"
  | "bullish-engulfing" | "bearish-engulfing" | "bullish-harami" | "bearish-harami"
  | "inside-bar" | "outside-bar" | "morning-star" | "evening-star" | "three-white-soldiers" | "three-black-crows";

export const PATTERN_IDS: readonly PatternId[] = [
  "doji", "marubozu", "hammer", "hanging-man", "inverted-hammer", "shooting-star",
  "bullish-engulfing", "bearish-engulfing", "bullish-harami", "bearish-harami",
  "inside-bar", "outside-bar", "morning-star", "evening-star", "three-white-soldiers", "three-black-crows",
];

/** Prior direction over the `lookback` bars before bar i (close to close). */
export function priorTrend(bars: readonly Bar[], i: number, lookback = 5): "up" | "down" | "none" {
  if (i - 1 - lookback < 0) return "none";
  const a = bars[i - 1 - lookback].c, b = bars[i - 1].c;
  const ch = (b - a) / a;
  return ch > 0.01 ? "up" : ch < -0.01 ? "down" : "none";
}

/** Every pattern whose shape (and, for hammer-type shapes, prior direction) matches at bar i. */
export function patternsAt(bars: readonly Bar[], i: number): PatternId[] {
  const out: PatternId[] = [];
  const b = bars[i];
  if (!b) return out;
  const m = candleMetrics(b);
  if (m.range <= 0) return out;
  const trend = priorTrend(bars, i);
  if (m.bodyRatio <= 0.1) out.push("doji");
  if (m.bodyRatio >= 0.9) out.push("marubozu");
  const smallBody = m.bodyRatio <= 0.35 && m.body > 0;
  const longLower = m.lowerWick >= 2 * m.body && m.upperWick <= 0.25 * m.range;
  const longUpper = m.upperWick >= 2 * m.body && m.lowerWick <= 0.25 * m.range;
  if (smallBody && longLower) { if (trend === "down") out.push("hammer"); else if (trend === "up") out.push("hanging-man"); }
  if (smallBody && longUpper) { if (trend === "down") out.push("inverted-hammer"); else if (trend === "up") out.push("shooting-star"); }
  const p = bars[i - 1];
  if (p) {
    const pm = candleMetrics(p);
    const bodyTop = Math.max(b.o, b.c), bodyBot = Math.min(b.o, b.c);
    const pTop = Math.max(p.o, p.c), pBot = Math.min(p.o, p.c);
    if (pm.direction === "bearish" && m.direction === "bullish" && bodyTop >= pTop && bodyBot <= pBot && m.body > pm.body) out.push("bullish-engulfing");
    if (pm.direction === "bullish" && m.direction === "bearish" && bodyTop >= pTop && bodyBot <= pBot && m.body > pm.body) out.push("bearish-engulfing");
    if (pm.direction === "bearish" && m.direction === "bullish" && bodyTop < pTop && bodyBot > pBot) out.push("bullish-harami");
    if (pm.direction === "bullish" && m.direction === "bearish" && bodyTop < pTop && bodyBot > pBot) out.push("bearish-harami");
    if (b.h <= p.h && b.l >= p.l && !(b.h === p.h && b.l === p.l)) out.push("inside-bar");
    if (b.h > p.h && b.l < p.l) out.push("outside-bar");
  }
  const q = bars[i - 2];
  if (p && q) {
    const qm = candleMetrics(q), pm = candleMetrics(p);
    const qMid = (q.o + q.c) / 2;
    if (qm.direction === "bearish" && qm.bodyRatio >= 0.5 && pm.bodyRatio <= 0.3 && m.direction === "bullish" && b.c > qMid) out.push("morning-star");
    if (qm.direction === "bullish" && qm.bodyRatio >= 0.5 && pm.bodyRatio <= 0.3 && m.direction === "bearish" && b.c < qMid) out.push("evening-star");
    const three = [q, p, b];
    const allUp = three.every((x) => x.c > x.o && candleMetrics(x).bodyRatio >= 0.5);
    const allDn = three.every((x) => x.c < x.o && candleMetrics(x).bodyRatio >= 0.5);
    if (allUp && p.c > q.c && b.c > p.c && p.o > q.o && b.o > p.o) out.push("three-white-soldiers");
    if (allDn && p.c < q.c && b.c < p.c && p.o < q.o && b.o < p.o) out.push("three-black-crows");
  }
  return out;
}

export type ForwardStats = { count: number; meanPct: number | null; upShare: number | null };

/**
 * What happened `horizon` bars after each occurrence of a pattern, compared
 * with what happened after every bar (the base rate). On a simulated random
 * walk the two should differ only by chance: that is the point.
 */
export function forwardStats(bars: readonly Bar[], indices: readonly number[], horizon: number): ForwardStats {
  const rets: number[] = [];
  for (const i of indices) if (i + horizon < bars.length) rets.push((bars[i + horizon].c - bars[i].c) / bars[i].c * 100);
  if (rets.length === 0) return { count: 0, meanPct: null, upShare: null };
  return { count: rets.length, meanPct: rets.reduce((a, b) => a + b, 0) / rets.length, upShare: rets.filter((r) => r > 0).length / rets.length };
}

// ── Structure and trend ─────────────────────────────────────────────────────

export type Swing = { index: number; price: number; kind: "high" | "low" };

/**
 * Swing highs and lows (pivots): bar i is a swing high if its high is above the
 * highs of the `k` bars on each side (ties on the right allowed), and likewise
 * for lows. Consecutive swings of the same kind are merged, keeping the more
 * extreme one, so highs and lows alternate. The last `k` bars cannot be
 * confirmed yet: a swing is only known after the fact.
 */
export function swings(bars: readonly Bar[], k = 3): Swing[] {
  const raw: Swing[] = [];
  for (let i = k; i < bars.length - k; i++) {
    let isHigh = true, isLow = true;
    for (let j = i - k; j <= i + k; j++) {
      if (j === i) continue;
      if (j < i ? bars[j].h >= bars[i].h : bars[j].h > bars[i].h) isHigh = false;
      if (j < i ? bars[j].l <= bars[i].l : bars[j].l < bars[i].l) isLow = false;
    }
    if (isHigh) raw.push({ index: i, price: bars[i].h, kind: "high" });
    if (isLow) raw.push({ index: i, price: bars[i].l, kind: "low" });
  }
  const out: Swing[] = [];
  for (const s of raw) {
    const last = out[out.length - 1];
    if (last && last.kind === s.kind) {
      if ((s.kind === "high" && s.price > last.price) || (s.kind === "low" && s.price < last.price)) out[out.length - 1] = s;
    } else out.push(s);
  }
  return out;
}

export type SwingLabel = "HH" | "LH" | "EH" | "HL" | "LL" | "EL" | "first";

/** Labels each swing against the previous swing of the same kind: higher/lower/equal high or low. */
export function labelSwings(sw: readonly Swing[], tolerance = 0): (Swing & { label: SwingLabel })[] {
  const lastOf: Partial<Record<Swing["kind"], number>> = {};
  return sw.map((s) => {
    const prev = lastOf[s.kind];
    lastOf[s.kind] = s.price;
    if (prev === undefined) return { ...s, label: "first" as const };
    const d = s.price - prev;
    if (s.kind === "high") return { ...s, label: Math.abs(d) <= tolerance ? "EH" : d > 0 ? "HH" : "LH" };
    return { ...s, label: Math.abs(d) <= tolerance ? "EL" : d > 0 ? "HL" : "LL" };
  });
}

/** Structure from the last two highs and lows: up-trend (HH + HL), down-trend (LH + LL), otherwise mixed. */
export function structureOf(sw: readonly Swing[], tolerance = 0): "uptrend" | "downtrend" | "mixed" | "unknown" {
  const labels = labelSwings(sw, tolerance);
  const hi = labels.filter((s) => s.kind === "high").at(-1)?.label;
  const lo = labels.filter((s) => s.kind === "low").at(-1)?.label;
  if (!hi || !lo || hi === "first" || lo === "first") return "unknown";
  if (hi === "HH" && lo === "HL") return "uptrend";
  if (hi === "LH" && lo === "LL") return "downtrend";
  return "mixed";
}

/** Ordinary least-squares line through (0, y0), (1, y1), … : slope per bar, intercept and r². */
export function linearRegression(ys: readonly number[]): { slope: number; intercept: number; r2: number } {
  const n = ys.length;
  if (n < 2) return { slope: 0, intercept: ys[0] ?? 0, r2: 0 };
  const mx = (n - 1) / 2;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  let sxy = 0, sxx = 0, syy = 0;
  for (let i = 0; i < n; i++) { const dx = i - mx, dy = ys[i] - my; sxy += dx * dy; sxx += dx * dx; syy += dy * dy; }
  const slope = sxy / sxx;
  const intercept = my - slope * mx;
  const r2 = syy === 0 ? 0 : (sxy * sxy) / (sxx * syy);
  return { slope, intercept, r2 };
}

/** Simple moving average. Entries before `n` values exist are null. */
export function sma(xs: readonly number[], n: number): (number | null)[] {
  const out: (number | null)[] = [];
  let sum = 0;
  for (let i = 0; i < xs.length; i++) {
    sum += xs[i];
    if (i >= n) sum -= xs[i - n];
    out.push(i >= n - 1 ? sum / n : null);
  }
  return out;
}

/** Exponential moving average with α = 2 / (n + 1), seeded with the SMA of the first n values. */
export function ema(xs: readonly number[], n: number): (number | null)[] {
  const a = 2 / (n + 1);
  const out: (number | null)[] = [];
  let prev: number | null = null;
  for (let i = 0; i < xs.length; i++) {
    if (i < n - 1) { out.push(null); continue; }
    if (prev === null) prev = xs.slice(0, n).reduce((s, x) => s + x, 0) / n;
    else prev = a * xs[i] + (1 - a) * prev;
    out.push(prev);
  }
  return out;
}

/** True range: the largest of high − low, |high − previous close| and |low − previous close|. */
export function trueRange(b: Bar, prevClose?: number): number {
  if (prevClose === undefined) return b.h - b.l;
  return Math.max(b.h - b.l, Math.abs(b.h - prevClose), Math.abs(b.l - prevClose));
}

/** Average true range with Wilder smoothing: ATR_t = (ATR_{t−1} × (n − 1) + TR_t) / n. */
export function atr(bars: readonly Bar[], n = 14): (number | null)[] {
  const out: (number | null)[] = [];
  let prev: number | null = null, sum = 0;
  for (let i = 0; i < bars.length; i++) {
    const tr = trueRange(bars[i], i > 0 ? bars[i - 1].c : undefined);
    if (i < n) { sum += tr; out.push(i === n - 1 ? (prev = sum / n) : null); continue; }
    prev = (prev! * (n - 1) + tr) / n;
    out.push(prev);
  }
  return out;
}

/**
 * Wilder's directional movement: +DI, −DI and ADX (0–100). ADX measures how
 * directional recent movement has been, in either direction; it is not a
 * forecast and says nothing about which way.
 */
export function directional(bars: readonly Bar[], n = 14): { plusDI: (number | null)[]; minusDI: (number | null)[]; adx: (number | null)[] } {
  const len = bars.length;
  const plusDI: (number | null)[] = Array(len).fill(null);
  const minusDI: (number | null)[] = Array(len).fill(null);
  const adx: (number | null)[] = Array(len).fill(null);
  let trS = 0, pS = 0, mS = 0;
  const dx: number[] = [];
  let adxPrev: number | null = null;
  for (let i = 1; i < len; i++) {
    const up = bars[i].h - bars[i - 1].h, dn = bars[i - 1].l - bars[i].l;
    const pdm = up > dn && up > 0 ? up : 0, mdm = dn > up && dn > 0 ? dn : 0;
    const tr = trueRange(bars[i], bars[i - 1].c);
    if (i <= n) { trS += tr; pS += pdm; mS += mdm; if (i < n) continue; }
    else { trS = trS - trS / n + tr; pS = pS - pS / n + pdm; mS = mS - mS / n + mdm; }
    const p = trS > 0 ? (100 * pS) / trS : 0, m = trS > 0 ? (100 * mS) / trS : 0;
    plusDI[i] = p; minusDI[i] = m;
    const d = p + m > 0 ? (100 * Math.abs(p - m)) / (p + m) : 0;
    dx.push(d);
    if (dx.length === n) adxPrev = dx.reduce((a, b) => a + b, 0) / n;
    else if (dx.length > n) adxPrev = (adxPrev! * (n - 1) + d) / n;
    if (adxPrev !== null) adx[i] = adxPrev;
  }
  return { plusDI, minusDI, adx };
}

/**
 * Kaufman's efficiency ratio over n bars: net move ÷ total distance travelled,
 * from 0 (pure back-and-forth) to 1 (a straight line).
 */
export function efficiencyRatio(closes: readonly number[], n: number): number | null {
  if (closes.length <= n || n < 1) return null;
  const end = closes.length - 1;
  let path = 0;
  for (let i = end - n + 1; i <= end; i++) path += Math.abs(closes[i] - closes[i - 1]);
  return path === 0 ? 0 : Math.abs(closes[end] - closes[end - n]) / path;
}

// ── Volume ──────────────────────────────────────────────────────────────────

/** Relative volume: this bar's volume ÷ the average of the previous n bars. null until n bars exist. */
export function relativeVolume(vols: readonly number[], n = 20): (number | null)[] {
  const out: (number | null)[] = [];
  let sum = 0;
  for (let i = 0; i < vols.length; i++) {
    if (i >= n) {
      out.push(sum > 0 ? vols[i] / (sum / n) : null);
      sum -= vols[i - n];
    } else out.push(null);
    sum += vols[i];
  }
  return out;
}

// ── Scales ──────────────────────────────────────────────────────────────────

export type Scale = { (x: number): number; invert: (y: number) => number };

/** Maps [d0, d1] onto [r0, r1] in straight proportion. */
export function linearScale(d0: number, d1: number, r0: number, r1: number): Scale {
  const k = d1 === d0 ? 0 : (r1 - r0) / (d1 - d0);
  const f = ((x: number) => r0 + (x - d0) * k) as Scale;
  f.invert = (y: number) => (k === 0 ? d0 : d0 + (y - r0) / k);
  return f;
}

/**
 * Maps prices onto [r0, r1] by their logarithm, so equal PERCENTAGE moves get
 * equal distance: 10 → 20 is as tall as 100 → 200. Needs positive prices.
 */
export function logScale(d0: number, d1: number, r0: number, r1: number): Scale {
  const a = Math.log(Math.max(d0, 1e-12)), b = Math.log(Math.max(d1, 1e-12));
  const k = b === a ? 0 : (r1 - r0) / (b - a);
  const f = ((x: number) => r0 + (Math.log(Math.max(x, 1e-12)) - a) * k) as Scale;
  f.invert = (y: number) => (k === 0 ? d0 : Math.exp(a + (y - r0) / k));
  return f;
}

/** Percentage change from a to b. */
export const pctChange = (a: number, b: number) => ((b - a) / a) * 100;
/** Log return from a to b: ln(b / a). Log returns add up over time; percentages do not. */
export const logReturn = (a: number, b: number) => Math.log(b / a);

/** About `count` round axis values covering [min, max] (steps of 1, 2 or 5 × a power of ten). */
export function niceTicks(min: number, max: number, count = 5): number[] {
  if (!Number.isFinite(min) || !Number.isFinite(max) || max <= min) return Number.isFinite(min) ? [min] : [];
  const raw = (max - min) / Math.max(1, count);
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? 10 * mag;
  const out: number[] = [];
  for (let v = Math.ceil(min / step) * step; v <= max + step * 1e-9; v += step) out.push(Number(v.toFixed(10)));
  return out;
}

/** Axis values for a log scale: 1, 2, 5 × powers of ten inside [min, max]; falls back to niceTicks for narrow ranges. */
export function logTicks(min: number, max: number): number[] {
  if (!(min > 0) || !(max > min)) return [];
  if (max / min < 4) return niceTicks(min, max, 5);
  const out: number[] = [];
  for (let e = Math.floor(Math.log10(min)); e <= Math.ceil(Math.log10(max)); e++) for (const m of [1, 2, 5]) {
    const v = m * 10 ** e;
    if (v >= min && v <= max) out.push(v);
  }
  return out;
}

// ── Gaps ────────────────────────────────────────────────────────────────────

export type Gap = {
  index: number;
  dir: "up" | "down";
  /** Open versus the previous close, in percent. */
  gapPct: number;
  /** A "window": the whole bar is beyond the previous bar's range (low above prior high, or high below prior low). */
  window: boolean;
  /** First bar index at which price traded back to the previous close (the gap "filled"), or null. */
  filledAt: number | null;
};

/** Opening gaps of at least `minPct` percent, and whether (and when) each was filled. */
export function detectGaps(bars: readonly Bar[], minPct = 0.5): Gap[] {
  const out: Gap[] = [];
  for (let i = 1; i < bars.length; i++) {
    const prev = bars[i - 1], b = bars[i];
    const g = pctChange(prev.c, b.o);
    if (Math.abs(g) < minPct) continue;
    const dir = g > 0 ? "up" : "down";
    let filledAt: number | null = null;
    for (let j = i; j < bars.length; j++) {
      if ((dir === "up" && bars[j].l <= prev.c) || (dir === "down" && bars[j].h >= prev.c)) { filledAt = j; break; }
    }
    out.push({ index: i, dir, gapPct: g, window: dir === "up" ? b.l > prev.h : b.h < prev.l, filledAt });
  }
  return out;
}

/**
 * Where a stop order is likely to fill when price gaps through it. A sell stop
 * below the market becomes a market order once price trades at or below the
 * stop; if the market opens below the stop, the first available price is the
 * open, not the stop. Returns the fill and the slippage (positive = worse).
 */
export function stopFill(stop: number, side: "sell" | "buy", bar: Pick<Bar, "o" | "h" | "l">): { triggered: boolean; fill: number | null; slippage: number } {
  if (side === "sell") {
    if (bar.o <= stop) return { triggered: true, fill: bar.o, slippage: stop - bar.o };
    if (bar.l <= stop) return { triggered: true, fill: stop, slippage: 0 };
  } else {
    if (bar.o >= stop) return { triggered: true, fill: bar.o, slippage: bar.o - stop };
    if (bar.h >= stop) return { triggered: true, fill: stop, slippage: 0 };
  }
  return { triggered: false, fill: null, slippage: 0 };
}

// ── Levels ──────────────────────────────────────────────────────────────────

/** How many bars touched a zone [lo, hi] (their range overlapped it), and the indices. */
export function zoneTouches(bars: readonly Bar[], lo: number, hi: number): number[] {
  const out: number[] = [];
  for (let i = 0; i < bars.length; i++) if (bars[i].l <= hi && bars[i].h >= lo) out.push(i);
  return out;
}

/** Groups touches into separate visits: a new visit starts after at least `gap` bars outside the zone. */
export function zoneVisits(touches: readonly number[], gap = 3): number {
  let visits = 0, last = -Infinity;
  for (const i of touches) { if (i - last > gap) visits++; last = i; }
  return visits;
}
