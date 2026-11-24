import { describe, expect, it } from "vitest";
import {
  TK1992, acceptableGain, coinBetValue, dispositionRatios, expectancyR, expectedShareAfterStreak, flips, longestRun, median,
  netOfTurnover, probLosingStreak, prospectValue, runs, shareAfterStreak, simulateDay, simulateDays, simulateEdge, tiltReflection,
  zeroEdgeTraders, loadLocal, saveLocal, isStringArray, isStringRecord,
} from "@/lib/academy/psychology";

describe("prospect value function", () => {
  it("is x^0.88 for gains and −2.25·|x|^0.88 for losses", () => {
    expect(prospectValue(0)).toBe(0);
    expect(prospectValue(100)).toBeCloseTo(Math.pow(100, 0.88), 10);
    expect(prospectValue(-100)).toBeCloseTo(-2.25 * Math.pow(100, 0.88), 10);
    expect(prospectValue(-100) / prospectValue(100)).toBeCloseTo(-2.25, 10);
  });
  it("is concave for gains and convex for losses (diminishing sensitivity)", () => {
    expect(prospectValue(200) - prospectValue(100)).toBeLessThan(prospectValue(100) - prospectValue(0));
    expect(Math.abs(prospectValue(-200) - prospectValue(-100))).toBeLessThan(Math.abs(prospectValue(-100)));
  });
  it("with linear value (α = β = 1) a 50/50 bet needs a gain of λ times the loss", () => {
    const lin = { alpha: 1, beta: 1, lambda: 2.25 };
    expect(acceptableGain(100, lin)).toBeCloseTo(225, 10);
    expect(coinBetValue(225, 100, lin)).toBeCloseTo(0, 10);
    expect(coinBetValue(200, 100, lin)).toBeLessThan(0);
  });
  it("with no loss aversion (λ = 1, linear) a fair bet is neutral", () => {
    expect(coinBetValue(100, 100, { alpha: 1, beta: 1, lambda: 1 })).toBe(0);
    expect(acceptableGain(50, TK1992)).toBeGreaterThan(100);
  });
  it("NaN in, NaN out", () => {
    expect(prospectValue(NaN)).toBeNaN();
  });
});

describe("disposition ratios", () => {
  it("computes PGR and PLR as in Odean (1998)", () => {
    const r = dispositionRatios({ realisedGains: 6, paperGains: 14, realisedLosses: 3, paperLosses: 17 });
    expect(r.pgr).toBeCloseTo(0.3, 12);
    expect(r.plr).toBeCloseTo(0.15, 12);
    expect(r.diff).toBeCloseTo(0.15, 12);
  });
  it("is NaN when there are no gains or no losses", () => {
    expect(dispositionRatios({ realisedGains: 0, paperGains: 0, realisedLosses: 1, paperLosses: 1 }).pgr).toBeNaN();
  });
});

describe("turnover and costs", () => {
  it("subtracts one round-trip cost per 100% of turnover", () => {
    expect(netOfTurnover(10, 200, 1)).toBe(8);
    expect(netOfTurnover(10, 0, 1)).toBe(10);
    expect(netOfTurnover(5, 1000, 0.5)).toBe(0);
  });
});

describe("flips, runs and streaks", () => {
  it("are seeded and repeatable", () => {
    expect(flips(42, 50)).toEqual(flips(42, 50));
    expect(flips(42, 50)).not.toEqual(flips(43, 50));
    const f = flips(1, 10_000);
    const share = f.filter(Boolean).length / f.length;
    expect(share).toBeGreaterThan(0.48);
    expect(share).toBeLessThan(0.52);
  });
  it("finds the longest run and every run", () => {
    const s = [true, true, false, false, false, true];
    expect(longestRun(s, true)).toBe(2);
    expect(longestRun(s, false)).toBe(3);
    expect(runs(s)).toEqual([{ value: true, length: 2 }, { value: false, length: 3 }, { value: true, length: 1 }]);
    expect(runs([])).toEqual([]);
  });
  it("measures the share of heads straight after k heads", () => {
    expect(shareAfterStreak([true, true, false, true, true, true], 1)).toEqual({ share: 3 / 4, count: 4 });
    expect(shareAfterStreak([false, false], 1).share).toBeNaN();
  });
  it("reproduces the Miller–Sanjurjo streak selection bias: 17/42 for n = 4, k = 1", () => {
    expect(expectedShareAfterStreak(4, 1)).toBeCloseTo(17 / 42, 12);
    expect(expectedShareAfterStreak(10, 3)).toBeLessThan(0.5);
    expect(() => expectedShareAfterStreak(25, 1)).toThrow();
  });
  it("gives the exact chance of a losing streak", () => {
    expect(probLosingStreak(3, 3, 0.5)).toBeCloseTo(0.125, 12);
    expect(probLosingStreak(4, 2, 0.5)).toBeCloseTo(0.5, 12);
    expect(probLosingStreak(5, 6, 0.5)).toBe(0);
    expect(probLosingStreak(5, 0, 0.5)).toBe(1);
    // Matches brute force for n = 10, k = 4, q = 0.6.
    let p = 0;
    for (let m = 0; m < 1 << 10; m++) {
      const seq = Array.from({ length: 10 }, (_, i) => ((m >> i) & 1) === 1); // true = loss
      const losses = seq.filter(Boolean).length;
      if (longestRun(seq, true) >= 4) p += Math.pow(0.6, losses) * Math.pow(0.4, 10 - losses);
    }
    expect(probLosingStreak(10, 4, 0.6)).toBeCloseTo(p, 12);
  });
});

describe("edge simulator", () => {
  it("computes expectancy in R", () => {
    expect(expectancyR(0.4, 2)).toBeCloseTo(0.2, 12);
    expect(expectancyR(0.5, 1)).toBe(0);
  });
  it("is seeded, and paths, streaks and drawdowns are consistent", () => {
    const a = simulateEdge({ seed: 9, winRate: 0.45, payoffR: 1.5, trades: 200, runs: 20 });
    expect(a).toEqual(simulateEdge({ seed: 9, winRate: 0.45, payoffR: 1.5, trades: 200, runs: 20 }));
    expect(a).toHaveLength(20);
    for (const r of a) {
      expect(r.path).toHaveLength(201);
      expect(r.path[0]).toBe(0);
      expect(r.final).toBeCloseTo(r.path[200], 10);
      expect(r.maxDrawdown).toBeGreaterThanOrEqual(r.longestLosing - 1e-9);
    }
  });
  it("with a positive edge the median ends positive over many trades, yet losing streaks still occur", () => {
    const a = simulateEdge({ seed: 3, winRate: 0.5, payoffR: 1.5, trades: 500, runs: 200 });
    expect(median(a.map((r) => r.final))).toBeGreaterThan(0);
    expect(Math.max(...a.map((r) => r.longestLosing))).toBeGreaterThanOrEqual(7);
  });
  it("median handles odd, even and empty", () => {
    expect(median([3, 1, 2])).toBe(2);
    expect(median([4, 1, 2, 3])).toBe(2.5);
    expect(median([])).toBeNaN();
  });
});

describe("revenge trading versus a daily loss stop", () => {
  it("the stop policy never loses much more than the stop on a day", () => {
    const s = simulateDays({ seed: 5, days: 300, policy: "stop", maxTrades: 10, dailyStopR: 3, badR: 5 });
    expect(s.worst).toBeGreaterThanOrEqual(-3 - 1.05 - 1e-9);
    expect(s.badDays).toBe(0);
    expect(s.avgMaxRisk).toBe(1);
  });
  it("the revenge policy wins on more days but has far worse days and risks much more", () => {
    const st = simulateDays({ seed: 5, days: 300, policy: "stop", maxTrades: 10, dailyStopR: 3, badR: 5 });
    const rv = simulateDays({ seed: 5, days: 300, policy: "revenge", maxTrades: 10, dailyStopR: 3, badR: 5 });
    expect(rv.winningDays).toBeGreaterThan(st.winningDays);
    expect(rv.worst).toBeLessThan(st.worst - 10);
    expect(rv.badDays).toBeGreaterThan(0);
    expect(rv.avgMaxRisk).toBeGreaterThan(st.avgMaxRisk);
  });
  it("one day is seeded and doubles risk after losses under revenge", () => {
    const d = simulateDay({ seed: 77, policy: "revenge", maxTrades: 10, dailyStopR: 3 });
    expect(d).toEqual(simulateDay({ seed: 77, policy: "revenge", maxTrades: 10, dailyStopR: 3 }));
    expect(d.maxRisk).toBeLessThanOrEqual(32);
    expect(d.path).toHaveLength(d.trades + 1);
  });
});

describe("zero-edge traders", () => {
  it("costs push the average below zero, but luck still leaves some ahead", () => {
    const z = zeroEdgeTraders({ seed: 11, traders: 1000, trades: 100, costR: 0.1 });
    expect(z.mean).toBeLessThan(0);
    expect(z.mean).toBeCloseTo(-10, 0);
    expect(z.ahead).toBeGreaterThan(50);
    expect(z.shareAhead).toBeLessThan(0.5);
  });
});

describe("tilt reflection", () => {
  it("bands the total, and a broken rule alone means pause", () => {
    expect(tiltReflection([0, 0, 0, 0, 0, 0])).toEqual({ score: 0, max: 12, band: "steady" });
    expect(tiltReflection([1, 0, 0, 1, 1, 0]).band).toBe("watch");
    expect(tiltReflection([2, 1, 1, 1, 1, 0]).band).toBe("pause");
    expect(tiltReflection([0, 2, 0, 0, 0, 0]).band).toBe("pause");
    expect(tiltReflection([5, NaN, -1, 0, 0, 0]).score).toBe(2);
  });
});

describe("local storage helpers", () => {
  it("fall back safely when there is no window", () => {
    expect(loadLocal("x", ["a"], isStringArray)).toEqual(["a"]);
    expect(saveLocal("x", [1])).toBe(false);
  });
  it("type guards", () => {
    expect(isStringArray(["a", "b"])).toBe(true);
    expect(isStringArray(["a", 1])).toBe(false);
    expect(isStringRecord({ a: "b" })).toBe(true);
    expect(isStringRecord(["a"])).toBe(false);
  });
});
