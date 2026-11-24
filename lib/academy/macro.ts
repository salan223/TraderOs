import { normal, rng } from "./charts";

/*
  Pure calculations for the Macro and News track (Track 12). Every number is
  either computed from what the learner sets or drawn from a seeded random
  model. Nothing here is market data, a real release or a real reaction.
*/

// ── Small helpers ───────────────────────────────────────────────────────────

export function quantile(sorted: readonly number[], q: number): number {
  if (!sorted.length) return NaN;
  const k = Math.min(sorted.length - 1, Math.max(0, Math.round(q * (sorted.length - 1))));
  return sorted[k];
}

const mean = (x: readonly number[]) => (x.length ? x.reduce((s, v) => s + v, 0) / x.length : NaN);

// ── Inflation: headline and core from a made-up basket ─────────────────────

export type BasketItem = { id: string; label: string; weight: number; core: boolean };

/** A made-up basket. Weights are illustrative shares that add to 100. */
export const BASKET: readonly BasketItem[] = [
  { id: "food", label: "Food", weight: 14, core: false },
  { id: "energy", label: "Energy", weight: 7, core: false },
  { id: "housing", label: "Housing", weight: 35, core: true },
  { id: "goods", label: "Other goods", weight: 20, core: true },
  { id: "services", label: "Other services", weight: 24, core: true },
];

/** Weighted yearly inflation of every item (headline) and of core items only (food and energy removed). */
export function basketInflation(items: readonly BasketItem[], changes: Readonly<Record<string, number>>): { headline: number; core: number } {
  let w = 0, s = 0, wc = 0, sc = 0;
  for (const it of items) {
    const c = changes[it.id] ?? 0;
    w += it.weight; s += it.weight * c;
    if (it.core) { wc += it.weight; sc += it.weight * c; }
  }
  return { headline: w ? s / w : 0, core: wc ? sc / wc : 0 };
}

// ── PMI: a diffusion index ──────────────────────────────────────────────────

/** Diffusion index = % reporting higher + half of % reporting no change. 50 means as many higher as lower. */
export function diffusionIndex(higherPct: number, samePct: number): number {
  return higherPct + 0.5 * samePct;
}

// ── Surprise simulator ──────────────────────────────────────────────────────

export type SurpriseInput = {
  consensus: number;
  actual: number;
  /** Typical size of past surprises for this release (one standard deviation), in the release's units. */
  surpriseSd: number;
  /** Simulated price move per one standard deviation of surprise, in %. */
  beta: number;
  /** Simulated move from everything else in the minutes after the release, one standard deviation, in %. */
  noise: number;
  seed: number;
  runs?: number;
};

export type SurpriseResult = {
  surprise: number;
  standardised: number;
  moves: number[]; // sorted
  mean: number;
  p5: number;
  p95: number;
  shareUp: number;
};

/**
 * Simulated reactions to one release. In this model the expected move is
 * beta × standardised surprise; noise from everything else is added on top,
 * so the same surprise can still produce a move the "wrong" way. The level of
 * the release does not enter at all: only actual − consensus does.
 */
export function simulateSurprise(i: SurpriseInput): SurpriseResult {
  const runs = i.runs ?? 1000;
  const surprise = i.actual - i.consensus;
  const standardised = i.surpriseSd > 0 ? surprise / i.surpriseSd : 0;
  const z = normal(rng(i.seed * 977 + 13));
  const moves: number[] = [];
  for (let k = 0; k < runs; k++) moves.push(i.beta * standardised + i.noise * z());
  moves.sort((a, b) => a - b);
  return { surprise, standardised, moves, mean: mean(moves), p5: quantile(moves, 0.05), p95: quantile(moves, 0.95), shareUp: moves.filter((m) => m > 0).length / runs };
}

/** Counts per bin for a histogram over [lo, hi]. */
export function histogram(values: readonly number[], lo: number, hi: number, bins: number): number[] {
  const out = new Array<number>(bins).fill(0);
  const w = (hi - lo) / bins;
  for (const v of values) {
    if (!(w > 0)) break;
    const k = Math.min(bins - 1, Math.max(0, Math.floor((v - lo) / w)));
    out[k]++;
  }
  return out;
}

// ── Rate differential and carry ─────────────────────────────────────────────

export type CarryInput = {
  /** Yearly interest rate of the currency you hold (bought), in %. */
  longRate: number;
  /** Yearly interest rate of the currency you owe (sold), in %. */
  shortRate: number;
  /** Position size in the account currency. */
  notional: number;
  days: number;
  /** Yearly mark-up the broker keeps out of the differential, in percentage points. */
  markup: number;
  /** Move in the exchange rate over the holding period, in %, positive in your favour. */
  fxMovePct: number;
};

export function carry(i: CarryInput) {
  const diff = i.longRate - i.shortRate;
  const net = diff - Math.sign(diff || 1) * Math.abs(i.markup);
  const carryPct = (net * i.days) / 365;
  const carryMoney = (i.notional * carryPct) / 100;
  const fxMoney = (i.notional * i.fxMovePct) / 100;
  return {
    diff,
    netDiff: net,
    carryPct,
    carryMoney,
    fxMoney,
    total: carryMoney + fxMoney,
    /** The adverse exchange-rate move, in %, that wipes out the carry over the period. */
    breakevenMovePct: carryPct,
  };
}

// ── Yield curve ─────────────────────────────────────────────────────────────

export const MATURITIES: readonly { id: string; label: string; years: number }[] = [
  { id: "3m", label: "3m", years: 0.25 },
  { id: "2y", label: "2y", years: 2 },
  { id: "5y", label: "5y", years: 5 },
  { id: "10y", label: "10y", years: 10 },
  { id: "30y", label: "30y", years: 30 },
];

export type CurveShape = "normal" | "flat" | "inverted";

/**
 * Classifies a curve by its 10-year minus 3-month spread, in percentage
 * points. The ±0.5 point band for "flat" is this course's convention, not an
 * official definition; "inverted" means the 10-year yield is below the 3-month.
 */
export function classifyCurve(yields: Readonly<Record<string, number>>, flatBand = 0.5): { spread10y3m: number; spread10y2y: number; shape: CurveShape } {
  const s = (yields["10y"] ?? 0) - (yields["3m"] ?? 0);
  const s2 = (yields["10y"] ?? 0) - (yields["2y"] ?? 0);
  const shape: CurveShape = s < 0 ? "inverted" : s < flatBand ? "flat" : "normal";
  return { spread10y3m: s, spread10y2y: s2, shape };
}

// ── News spike: spreads, slippage and gaps ──────────────────────────────────

export type EventKind = "quiet" | "minor" | "major" | "shock";

export const EVENT_KINDS: readonly { id: EventKind; label: string; spreadMult: number; jumpSd: number; gapChance: number }[] = [
  { id: "quiet", label: "Quiet hour", spreadMult: 1, jumpSd: 3, gapChance: 0 },
  { id: "minor", label: "Minor release", spreadMult: 3, jumpSd: 10, gapChance: 0.1 },
  { id: "major", label: "Major release", spreadMult: 8, jumpSd: 30, gapChance: 0.35 },
  { id: "shock", label: "Unscheduled shock", spreadMult: 15, jumpSd: 60, gapChance: 0.6 },
];

export type SpikeInput = {
  kind: EventKind;
  /** Normal spread, in pips. */
  baseSpread: number;
  /** Stop distance from entry, in pips. */
  stopPips: number;
  seed: number;
  runs?: number;
};

export type SpikeResult = {
  spread: number;
  /** Extra cost of a market order filled at the event, in pips (half the widened spread plus a slippage draw), sorted. */
  marketSlip: number[];
  /** Loss on a stopped trade in multiples of the planned stop (1 = as planned), sorted. Only for runs where the stop was hit. */
  stopLossR: number[];
  stopHitShare: number;
  /** Share of stop hits that filled worse than 1.5 × the planned loss. */
  badFillShare: number;
};

/**
 * A simulated event. The spread widens by the event's multiplier. The price
 * jumps by a normal draw with the event's size; with the event's gap chance
 * the jump happens with no trading in between (a gap), so a stop fills at the
 * first price after the jump instead of at the stop. The numbers describe
 * this model only.
 */
export function simulateSpike(i: SpikeInput): SpikeResult {
  const ev = EVENT_KINDS.find((e) => e.id === i.kind) ?? EVENT_KINDS[0];
  const runs = i.runs ?? 1000;
  const rand = rng(i.seed * 613 + ev.spreadMult * 31 + 7);
  const z = normal(rand);
  const spread = i.baseSpread * ev.spreadMult;
  const marketSlip: number[] = [], stopLossR: number[] = [];
  let hits = 0, bad = 0;
  for (let k = 0; k < runs; k++) {
    marketSlip.push(spread / 2 + Math.abs(z()) * ev.jumpSd * 0.1);
    // A long trade with a stop below entry: the adverse move is the negative part of the jump.
    const jump = z() * ev.jumpSd;
    const gap = rand() < ev.gapChance;
    // The stop is a sell, so it fills at the bid: half the widened spread below the mid.
    const reach = -jump + spread / 2;
    if (reach >= i.stopPips) {
      hits++;
      const fill = gap ? reach : i.stopPips + Math.abs(z()) * ev.jumpSd * 0.05;
      const r = Math.max(1, fill / i.stopPips);
      stopLossR.push(r);
      if (r > 1.5) bad++;
    }
  }
  marketSlip.sort((a, b) => a - b);
  stopLossR.sort((a, b) => a - b);
  return { spread, marketSlip, stopLossR, stopHitShare: hits / runs, badFillShare: hits ? bad / hits : 0 };
}

// ── Earnings gap through a stop ─────────────────────────────────────────────

/**
 * A long share position held through results. If the opening price after the
 * report is below the stop, the stop fills at that opening price, not at the
 * stop. Returns the planned loss, the actual loss and the loss in R.
 */
export function earningsGap(i: { entry: number; stop: number; shares: number; gapPct: number }) {
  const open = i.entry * (1 + i.gapPct / 100);
  const risk = Math.max(0, (i.entry - i.stop) * i.shares);
  const stopped = open <= i.stop;
  const exit = stopped ? open : NaN;
  const loss = stopped ? (i.entry - open) * i.shares : Math.max(0, (i.entry - open) * i.shares);
  return { open, risk, stopped, exit, loss, lossR: risk > 0 ? loss / risk : NaN, pnl: (open - i.entry) * i.shares };
}

// ── Changing correlation (simulated) ────────────────────────────────────────

/**
 * Two simulated daily return series whose true correlation switches between
 * two values every `regimeLen` days, and their rolling correlation over a
 * window. Shows that a correlation measured in one period need not hold in
 * the next.
 */
export function switchingCorrelation(i: { rhoA: number; rhoB: number; regimeLen: number; window: number; days: number; seed: number }) {
  const z = normal(rng(i.seed * 7331 + 3));
  const a: number[] = [], b: number[] = [], truth: number[] = [];
  for (let t = 0; t < i.days; t++) {
    const rho = Math.floor(t / i.regimeLen) % 2 === 0 ? i.rhoA : i.rhoB;
    const x = z(), e = z();
    a.push(x);
    b.push(rho * x + Math.sqrt(Math.max(0, 1 - rho * rho)) * e);
    truth.push(rho);
  }
  const rolling: number[] = new Array(i.days).fill(NaN);
  for (let t = i.window - 1; t < i.days; t++) rolling[t] = corr(a.slice(t - i.window + 1, t + 1), b.slice(t - i.window + 1, t + 1));
  return { a, b, truth, rolling, full: corr(a, b) };
}

export function corr(x: readonly number[], y: readonly number[]): number {
  const n = Math.min(x.length, y.length);
  if (n < 3) return NaN;
  const mx = mean(x.slice(0, n)), my = mean(y.slice(0, n));
  let sxy = 0, sxx = 0, syy = 0;
  for (let k = 0; k < n; k++) { const dx = x[k] - mx, dy = y[k] - my; sxy += dx * dy; sxx += dx * dx; syy += dy * dy; }
  return sxx > 0 && syy > 0 ? sxy / Math.sqrt(sxx * syy) : NaN;
}

// ── Statement tone ──────────────────────────────────────────────────────────

/** A tiny, made-up word list for teaching. Real tone measures are far larger and still imperfect. */
export const HAWKISH_TERMS = ["elevated", "further tightening", "remain vigilant", "upside risks", "strong", "persistent", "firming", "higher for longer"] as const;
export const DOVISH_TERMS = ["moderating", "easing", "downside risks", "patient", "softening", "accommodative", "slowing", "gradual"] as const;

export function toneScore(text: string): { hawk: string[]; dove: string[]; score: number } {
  const t = text.toLowerCase();
  const hawk = HAWKISH_TERMS.filter((w) => t.includes(w));
  const dove = DOVISH_TERMS.filter((w) => t.includes(w));
  const n = hawk.length + dove.length;
  return { hawk, dove, score: n ? (hawk.length - dove.length) / n : 0 };
}

/** Sentences in b that are not in a, and sentences in a that are gone from b. */
export function sentenceDiff(a: string, b: string): { added: string[]; removed: string[] } {
  const split = (s: string) => s.split(/(?<=\.)\s+/).map((x) => x.trim()).filter(Boolean);
  const sa = split(a), sb = split(b);
  return { added: sb.filter((x) => !sa.includes(x)), removed: sa.filter((x) => !sb.includes(x)) };
}
