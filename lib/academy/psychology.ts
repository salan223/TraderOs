import { rng } from "./charts";
import { noteDocChange } from "@/lib/user-docs";

/*
  Pure maths for the Trading Psychology track. Every number these functions
  produce is simulated or computed from inputs the learner sets. Nothing here
  is market data. Results are in R (multiples of the amount risked per trade)
  so no prices or account sizes are invented.
*/

// ── Prospect theory value function ──────────────────────────────────────────

/** Parameters of the Tversky–Kahneman (1992) value function. Their median estimates were α = β = 0.88 and λ = 2.25. */
export type ValueParams = { alpha: number; beta: number; lambda: number };
export const TK1992: ValueParams = { alpha: 0.88, beta: 0.88, lambda: 2.25 };

/** Felt value of a change x from the reference point: x^α for gains, −λ(−x)^β for losses. */
export function prospectValue(x: number, p: ValueParams = TK1992): number {
  if (!Number.isFinite(x)) return NaN;
  if (x >= 0) return Math.pow(x, p.alpha);
  return -p.lambda * Math.pow(-x, p.beta);
}

/** Felt value of a 50/50 bet that wins `gain` or loses `loss` (both positive numbers). */
export function coinBetValue(gain: number, loss: number, p: ValueParams = TK1992): number {
  return 0.5 * prospectValue(gain, p) + 0.5 * prospectValue(-loss, p);
}

/** The smallest gain that makes a 50/50 bet against `loss` feel acceptable (felt value ≥ 0). */
export function acceptableGain(loss: number, p: ValueParams = TK1992): number {
  // 0.5·g^α = 0.5·λ·loss^β  ⇒  g = (λ·loss^β)^(1/α)
  return Math.pow(p.lambda * Math.pow(loss, p.beta), 1 / p.alpha);
}

// ── Disposition effect (Odean 1998 measures) ────────────────────────────────

export type DispositionCounts = { realisedGains: number; paperGains: number; realisedLosses: number; paperLosses: number };

/**
 * PGR = realised gains / (realised + paper gains); PLR = the same for losses.
 * PGR > PLR means gains were sold more readily than losses: the disposition effect.
 */
export function dispositionRatios(c: DispositionCounts): { pgr: number; plr: number; diff: number } {
  const g = c.realisedGains + c.paperGains, l = c.realisedLosses + c.paperLosses;
  const pgr = g > 0 ? c.realisedGains / g : NaN;
  const plr = l > 0 ? c.realisedLosses / l : NaN;
  return { pgr, plr, diff: pgr - plr };
}

// ── Overtrading: turnover and costs ─────────────────────────────────────────

/**
 * Net annual return (percent) for a gross return, a yearly turnover (percent of
 * the portfolio sold and replaced) and a round-trip cost (percent of the value
 * traded, covering commission, spread and impact). 100% turnover = one round trip
 * on the whole portfolio.
 */
export function netOfTurnover(grossPct: number, turnoverPct: number, roundTripCostPct: number): number {
  return grossPct - (turnoverPct / 100) * roundTripCostPct;
}

// ── Coin flips and streaks ──────────────────────────────────────────────────

/** n seeded flips; true = heads (or a win) with probability p. */
export function flips(seed: number, n: number, p = 0.5): boolean[] {
  const r = rng(seed);
  return Array.from({ length: n }, () => r() < p);
}

/** Length of the longest run of `value` in the sequence. */
export function longestRun(seq: readonly boolean[], value: boolean): number {
  let best = 0, cur = 0;
  for (const x of seq) {
    cur = x === value ? cur + 1 : 0;
    if (cur > best) best = cur;
  }
  return best;
}

/** Every run in the sequence, as lengths, in order. */
export function runs(seq: readonly boolean[]): { value: boolean; length: number }[] {
  const out: { value: boolean; length: number }[] = [];
  for (const x of seq) {
    const last = out[out.length - 1];
    if (last && last.value === x) last.length++;
    else out.push({ value: x, length: 1 });
  }
  return out;
}

/**
 * Of the flips that come straight after k heads in a row, the share that are
 * heads. NaN if no flip follows such a streak. Miller and Sanjurjo (2018) show
 * that, averaged over short sequences, this share is below p even for a fair coin.
 */
export function shareAfterStreak(seq: readonly boolean[], k: number): { share: number; count: number } {
  let hits = 0, count = 0;
  for (let i = k; i < seq.length; i++) {
    let streak = true;
    for (let j = i - k; j < i; j++) if (!seq[j]) { streak = false; break; }
    if (!streak) continue;
    count++;
    if (seq[i]) hits++;
  }
  return { share: count ? hits / count : NaN, count };
}

/**
 * The exact expected value of `shareAfterStreak` for a fair coin over all
 * sequences of length n (sequences where it is undefined are left out), by
 * enumeration. Keep n ≤ 20.
 */
export function expectedShareAfterStreak(n: number, k: number): number {
  if (n > 20) throw new Error("n too large to enumerate");
  let sum = 0, used = 0;
  const seq: boolean[] = new Array(n);
  for (let m = 0; m < 1 << n; m++) {
    for (let i = 0; i < n; i++) seq[i] = ((m >> i) & 1) === 1;
    const s = shareAfterStreak(seq, k);
    if (s.count) { sum += s.share; used++; }
  }
  return used ? sum / used : NaN;
}

/** Exact probability of at least one run of k or more losses in n independent trades with loss probability q. */
export function probLosingStreak(n: number, k: number, q: number): number {
  if (k <= 0) return 1;
  if (k > n) return 0;
  // state[j] = probability the current losing run is j (< k) and no run of k has happened yet.
  let state = new Array(k).fill(0);
  state[0] = 1;
  for (let t = 0; t < n; t++) {
    const next = new Array(k).fill(0);
    for (let j = 0; j < k; j++) {
      next[0] += state[j] * (1 - q);
      if (j + 1 < k) next[j + 1] += state[j] * q;
    }
    state = next;
  }
  return 1 - state.reduce((a, b) => a + b, 0);
}

// ── Edge and variance ───────────────────────────────────────────────────────

/** Expectancy per trade in R: win rate × payoff − loss rate × 1R. */
export function expectancyR(winRate: number, payoffR: number): number {
  return winRate * payoffR - (1 - winRate);
}

export type EdgeRun = { path: number[]; final: number; longestLosing: number; maxDrawdown: number };

/**
 * Simulate `runs` traders who each take `trades` trades with the same edge:
 * a win pays `payoffR`, a loss costs 1R, minus `costR` per trade. Paths start at 0.
 */
export function simulateEdge(o: { seed: number; winRate: number; payoffR: number; trades: number; runs: number; costR?: number }): EdgeRun[] {
  const r = rng(o.seed);
  const cost = o.costR ?? 0;
  const out: EdgeRun[] = [];
  for (let k = 0; k < o.runs; k++) {
    const path = [0];
    let eq = 0, peak = 0, dd = 0, cur = 0, longest = 0;
    for (let t = 0; t < o.trades; t++) {
      const win = r() < o.winRate;
      eq += (win ? o.payoffR : -1) - cost;
      cur = win ? 0 : cur + 1;
      if (cur > longest) longest = cur;
      if (eq > peak) peak = eq;
      if (peak - eq > dd) dd = peak - eq;
      path.push(eq);
    }
    out.push({ path, final: eq, longestLosing: longest, maxDrawdown: dd });
  }
  return out;
}

export function median(xs: readonly number[]): number {
  if (!xs.length) return NaN;
  const s = [...xs].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

// ── Revenge trading versus a daily loss stop ────────────────────────────────

export type DayPolicy = "stop" | "revenge";
export type DayResult = { path: number[]; final: number; trades: number; maxRisk: number; stoppedEarly: boolean };

/**
 * One simulated day of up to `maxTrades` trades with a zero-edge 50/50 setup
 * that wins `payoffR`·risk or loses 1·risk, minus `costR` per unit of risk.
 * "stop": risk 1R per trade and stop for the day once the day's loss reaches
 * `dailyStopR`. "revenge": double the risk after each loss (capped at 32R) and
 * keep going until the day is back above zero or trades run out.
 */
export function simulateDay(o: { seed: number; policy: DayPolicy; maxTrades: number; dailyStopR: number; winRate?: number; payoffR?: number; costR?: number }): DayResult {
  const r = rng(o.seed);
  const w = o.winRate ?? 0.5, pay = o.payoffR ?? 1, cost = o.costR ?? 0.05;
  const path = [0];
  let eq = 0, risk = 1, maxRisk = 1, n = 0, stoppedEarly = false;
  for (; n < o.maxTrades; ) {
    if (o.policy === "stop" && eq <= -o.dailyStopR) { stoppedEarly = true; break; }
    if (o.policy === "revenge" && n > 0 && eq > 0) break;
    const win = r() < w;
    eq += (win ? pay * risk : -risk) - cost * risk;
    n++;
    path.push(eq);
    if (o.policy === "revenge") risk = win ? 1 : Math.min(32, risk * 2);
    if (risk > maxRisk) maxRisk = risk;
  }
  return { path, final: eq, trades: n, maxRisk, stoppedEarly };
}

/** Many simulated days under one policy: average, worst, and share of days worse than `badR`. */
export function simulateDays(o: { seed: number; days: number; policy: DayPolicy; maxTrades: number; dailyStopR: number; badR: number; costR?: number }) {
  const finals: number[] = [];
  let riskTraded = 0;
  for (let d = 0; d < o.days; d++) {
    const day = simulateDay({ seed: o.seed * 1000 + d, policy: o.policy, maxTrades: o.maxTrades, dailyStopR: o.dailyStopR, costR: o.costR });
    finals.push(day.final);
    riskTraded += day.maxRisk;
  }
  const mean = finals.reduce((a, b) => a + b, 0) / Math.max(1, finals.length);
  return {
    finals,
    mean,
    worst: Math.min(...finals),
    best: Math.max(...finals),
    winningDays: finals.filter((x) => x > 0).length / Math.max(1, finals.length),
    badDays: finals.filter((x) => x <= -o.badR).length / Math.max(1, finals.length),
    avgMaxRisk: riskTraded / Math.max(1, finals.length),
  };
}

// ── Zero-edge traders after costs ───────────────────────────────────────────

/**
 * `traders` simulated traders, each taking `trades` 50/50 trades of ±1R with a
 * cost of `costR` per trade. Nobody has an edge; any winner is luck.
 */
export function zeroEdgeTraders(o: { seed: number; traders: number; trades: number; costR: number }) {
  const r = rng(o.seed);
  const finals: number[] = [];
  for (let i = 0; i < o.traders; i++) {
    let eq = 0;
    for (let t = 0; t < o.trades; t++) eq += (r() < 0.5 ? 1 : -1) - o.costR;
    finals.push(eq);
  }
  const ahead = finals.filter((x) => x > 0).length;
  return { finals, ahead, shareAhead: ahead / Math.max(1, o.traders), best: Math.max(...finals), worst: Math.min(...finals), mean: finals.reduce((a, b) => a + b, 0) / Math.max(1, o.traders) };
}

// ── Tilt self-check (a reflection, not a diagnosis) ─────────────────────────

export const TILT_PROMPTS = [
  "I want to win back today's loss before I stop.",
  "I have broken one of my own rules since my last loss.",
  "My position size is bigger than my plan allows.",
  "I am entering trades without my checklist.",
  "I feel angry, rushed or that the market owes me.",
  "I slept badly or I am unusually tired or stressed.",
] as const;

/** Answers are 0 (not at all), 1 (a little) or 2 (very much). */
export function tiltReflection(answers: readonly number[]): { score: number; max: number; band: "steady" | "watch" | "pause" } {
  const score = answers.reduce((a, b) => a + (Number.isFinite(b) ? Math.max(0, Math.min(2, b)) : 0), 0);
  const max = TILT_PROMPTS.length * 2;
  // Any rule already broken (prompts 2 and 3) is a reason to pause on its own.
  const ruleBroken = (answers[1] ?? 0) >= 2 || (answers[2] ?? 0) >= 2;
  const band = ruleBroken || score >= 6 ? "pause" : score >= 3 ? "watch" : "steady";
  return { score, max, band };
}

// ── Local storage (this browser only) ───────────────────────────────────────

/** Read a JSON value saved in this browser. Returns the fallback if storage is blocked, empty or corrupt. */
export function loadLocal<T>(key: string, fallback: T, valid: (v: unknown) => v is T): T {
  try {
    if (typeof window === "undefined") return fallback;
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    const v: unknown = JSON.parse(raw);
    return valid(v) ? v : fallback;
  } catch {
    return fallback;
  }
}

/** Save a JSON value in this browser (and, when signed in, to the account: lib/user-docs.ts). Returns false if storage is unavailable. */
export function saveLocal(key: string, value: unknown): boolean {
  try {
    if (typeof window === "undefined") return false;
    window.localStorage.setItem(key, JSON.stringify(value));
    noteDocChange(key, value);
    return true;
  } catch {
    return false;
  }
}

export function removeLocal(key: string): void {
  try {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(key);
      noteDocChange(key, null);
    }
  } catch {
    /* storage blocked: nothing to remove */
  }
}

export const isStringArray = (v: unknown): v is string[] => Array.isArray(v) && v.every((x) => typeof x === "string");
export const isStringRecord = (v: unknown): v is Record<string, string> =>
  typeof v === "object" && v !== null && !Array.isArray(v) && Object.values(v).every((x) => typeof x === "string");
