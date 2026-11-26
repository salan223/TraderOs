/**
 * Forecasting maths for the Forecast Lab and the Options Lab. Pure functions
 * over arrays of closing prices (oldest first). Nothing here predicts the
 * future reliably; every method comes with a walk-through-history test of how
 * often it was right, compared with a naive baseline.
 */

export type Bar = { t: string; o: number; h: number; l: number; c: number };

/** Simple moving average of the `n` values ending at index `i` (inclusive). NaN if not enough data. */
export function smaAt(xs: readonly number[], n: number, i: number): number {
  if (n < 1 || i < n - 1 || i >= xs.length) return NaN;
  let s = 0;
  for (let k = i - n + 1; k <= i; k++) s += xs[k];
  return s / n;
}

/** Natural-log returns: ln(x[k] / x[k−1]). One shorter than the input. */
export function logReturns(xs: readonly number[]): number[] {
  const out: number[] = [];
  for (let k = 1; k < xs.length; k++) out.push(Math.log(xs[k] / xs[k - 1]));
  return out;
}

/**
 * Historical (realised) volatility, annualised, as a decimal: the standard
 * deviation of the last `n` daily log returns ending at index `i`, times
 * √(periods per year). Use 252 for markets that close at weekends, 365 for crypto.
 */
export function histVolAt(closes: readonly number[], i: number, n: number, periodsPerYear = 252): number {
  if (i < n || i >= closes.length || n < 2) return NaN;
  let s = 0, s2 = 0;
  for (let k = i - n + 1; k <= i; k++) {
    const r = Math.log(closes[k] / closes[k - 1]);
    s += r;
    s2 += r * r;
  }
  const mean = s / n;
  const varr = (s2 - n * mean * mean) / (n - 1);
  return Math.sqrt(Math.max(0, varr)) * Math.sqrt(periodsPerYear);
}

export type Regression = { slopePerDay: number; intercept: number; residualSd: number; fitted: number; projected: number; lower: number; upper: number };

/**
 * Least-squares straight line through ln(price) over the `lookback` days
 * ending at `i`, projected `horizon` days ahead. The band is ±1 residual
 * standard deviation around the projection (a rough guide, not a confidence
 * interval for the future).
 */
export function regressionAt(closes: readonly number[], i: number, lookback: number, horizon: number): Regression | null {
  if (lookback < 3 || i < lookback - 1 || i >= closes.length) return null;
  const n = lookback;
  let sx = 0, sy = 0, sxx = 0, sxy = 0;
  for (let k = 0; k < n; k++) {
    const y = Math.log(closes[i - n + 1 + k]);
    sx += k; sy += y; sxx += k * k; sxy += k * y;
  }
  const den = n * sxx - sx * sx;
  if (den === 0) return null;
  const b = (n * sxy - sx * sy) / den;
  const a = (sy - b * sx) / n;
  let ss = 0;
  for (let k = 0; k < n; k++) {
    const e = Math.log(closes[i - n + 1 + k]) - (a + b * k);
    ss += e * e;
  }
  const sd = Math.sqrt(ss / Math.max(1, n - 2));
  const tProj = n - 1 + horizon;
  const proj = a + b * tProj;
  return { slopePerDay: b, intercept: a, residualSd: sd, fitted: Math.exp(a + b * (n - 1)), projected: Math.exp(proj), lower: Math.exp(proj - sd), upper: Math.exp(proj + sd) };
}

/**
 * Volatility bands: where the price would end `horizon` trading days ahead
 * with probability about 68% (±1σ) and 95% (±2σ), if log returns were normal
 * with zero drift and volatility `vol` (annualised, decimal).
 */
export function volBands(price: number, vol: number, horizon: number, periodsPerYear = 252) {
  const s = vol * Math.sqrt(horizon / periodsPerYear);
  return { sigmaMove: s, lo1: price * Math.exp(-s), hi1: price * Math.exp(s), lo2: price * Math.exp(-2 * s), hi2: price * Math.exp(2 * s) };
}

export type MethodId = "ma-cross" | "price-vs-ma" | "momentum" | "regression";

export const METHODS: readonly { id: MethodId; name: string; rule: string; math: string }[] = [
  { id: "ma-cross", name: "Moving-average trend (50 vs 200 days)", rule: "Says \"up\" when the 50-day average is above the 200-day average, \"down\" when below.", math: "SMAₙ = (P₁ + … + Pₙ) ÷ n. Signal = sign(SMA₅₀ − SMA₂₀₀)." },
  { id: "price-vs-ma", name: "Price against its 50-day average", rule: "Says \"up\" when today's close is above the 50-day average, \"down\" when below.", math: "Signal = sign(Pₜ − SMA₅₀)." },
  { id: "momentum", name: "Six-month momentum", rule: "Says \"up\" if the price rose over the last 126 trading days (about six months), \"down\" if it fell.", math: "Signal = sign(Pₜ ÷ Pₜ₋₁₂₆ − 1)." },
  { id: "regression", name: "60-day trend line", rule: "Fits a straight line through the logarithm of the last 60 closes and says \"up\" if it slopes up.", math: "ln P = a + b·t by least squares. Signal = sign(b)." },
];

/** A method's call at index `i`: +1 up, −1 down, 0 no call (not enough data). */
export function signalAt(method: MethodId, closes: readonly number[], i: number): -1 | 0 | 1 {
  const sg = (x: number): -1 | 0 | 1 => (!Number.isFinite(x) || x === 0 ? 0 : x > 0 ? 1 : -1);
  switch (method) {
    case "ma-cross": return sg(smaAt(closes, 50, i) - smaAt(closes, 200, i));
    case "price-vs-ma": return sg(closes[i] - smaAt(closes, 50, i));
    case "momentum": return i >= 126 ? sg(closes[i] / closes[i - 126] - 1) : 0;
    case "regression": { const r = regressionAt(closes, i, 60, 1); return r ? sg(r.slopePerDay) : 0; }
  }
}

export type DirectionTest = {
  windows: number;
  hits: number;
  hitRate: number;
  /** Share of the same windows in which the price rose: the hit rate of always saying "up". */
  upRate: number;
  /** Hit rate minus the better of always-up or always-down. Near zero or negative = no evidence of skill. */
  edge: number;
  /** Rough 95% margin of error on the hit rate from sampling alone (±). Overlapping windows make the true one larger. */
  margin: number;
};

/**
 * Walks through history: at every `step`-th day from `start`, asks the method
 * for a direction and checks it against the actual change `horizon` days
 * later. Only uses data up to each day (no look-ahead).
 */
export function testDirection(method: MethodId, closes: readonly number[], horizon: number, step = 5, start = 210, end = closes.length - 1): DirectionTest {
  let windows = 0, hits = 0, ups = 0;
  for (let i = start; i + horizon <= end; i += step) {
    const s = signalAt(method, closes, i);
    if (s === 0) continue;
    const move = closes[i + horizon] - closes[i];
    if (move === 0) continue;
    windows++;
    if (move > 0) ups++;
    if (Math.sign(move) === s) hits++;
  }
  const hitRate = windows ? hits / windows : NaN;
  const upRate = windows ? ups / windows : NaN;
  const margin = windows ? 1.96 * Math.sqrt((hitRate * (1 - hitRate)) / windows) : NaN;
  return { windows, hits, hitRate, upRate, edge: hitRate - Math.max(upRate, 1 - upRate), margin };
}

/**
 * How often the price actually ended inside the ±1σ volatility band computed
 * on each day from the previous `volLookback` days. A well-calibrated band
 * would catch about 68%.
 */
export function testBands(closes: readonly number[], horizon: number, volLookback = 60, periodsPerYear = 252, step = 5, start = 210, end = closes.length - 1) {
  let windows = 0, inside1 = 0, inside2 = 0;
  for (let i = Math.max(start, volLookback + 1); i + horizon <= end; i += step) {
    const vol = histVolAt(closes, i, volLookback, periodsPerYear);
    if (!Number.isFinite(vol)) continue;
    const b = volBands(closes[i], vol, horizon, periodsPerYear);
    const p = closes[i + horizon];
    windows++;
    if (p >= b.lo1 && p <= b.hi1) inside1++;
    if (p >= b.lo2 && p <= b.hi2) inside2++;
  }
  return { windows, inside1: windows ? inside1 / windows : NaN, inside2: windows ? inside2 / windows : NaN };
}
