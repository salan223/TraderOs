import { describe, expect, it } from "vitest";
import {
  applyDailyLimit, atrStop, averagePrice, averagingDown, breakevenWinRate, combinedRisk, correlation, drawdowns, effectiveLeverage,
  equityAfterLosses, expectancy, futuresSize, fxSize, gapLoss, kellyFraction, lossesToDrawdown, marginPlan, monteCarlo,
  moveForEquityChange, portfolioHeat, recoveryNeeded, rewardRisk, riskAmount, ruinEvenMoney, stockSize, streakProbability, structureStop,
} from "@/lib/academy/risk";

const close = (a: number | null | undefined, b: number, eps = 1e-9) => {
  expect(a).not.toBeNull();
  expect(Math.abs((a as number) - b)).toBeLessThan(eps);
};

describe("risk per trade", () => {
  it("risk amount is account × risk%", () => {
    close(riskAmount(10_000, 1), 100);
    close(riskAmount(2_500, 2), 50);
    expect(riskAmount(0, 1)).toBeNull();
    expect(riskAmount(1000, 0)).toBeNull();
    expect(riskAmount(1000, 101)).toBeNull();
    expect(riskAmount(Number.NaN, 1)).toBeNull();
  });

  it("fixed-fractional losing streaks compound: (1 − r)^n", () => {
    close(equityAfterLosses(1, 10), 0.99 ** 10);
    close(equityAfterLosses(10, 2), 0.81);
    close(equityAfterLosses(5, 0), 1);
    expect(equityAfterLosses(100, 1)).toBeNull();
    expect(equityAfterLosses(1, 1.5)).toBeNull();
  });

  it("losses to a drawdown: ceil(ln(1 − d) ÷ ln(1 − r))", () => {
    expect(lossesToDrawdown(1, 20)).toBe(23); // 0.99^22 = 0.8016, 0.99^23 = 0.7936
    expect(lossesToDrawdown(10, 19)).toBe(2); // 0.9^2 = 0.81: exactly 19%
    expect(lossesToDrawdown(2, 50)).toBe(35);
    expect(lossesToDrawdown(0, 50)).toBeNull();
  });
});

describe("position sizing", () => {
  it("stocks: shares = floor(risk ÷ |entry − stop|), rounded down", () => {
    const s = stockSize(10_000, 1, 50, 48)!;
    expect(s.shares).toBe(50);
    close(s.actualRisk, 100);
    close(s.notional, 2500);
    close(s.notionalPct, 25);
    expect(stockSize(10_000, 1, 50, 47)!.shares).toBe(33); // 100 ÷ 3 = 33.3 → 33
    expect(stockSize(10_000, 1, 40, 42)!.shares).toBe(50); // a short: stop above entry
    expect(stockSize(10_000, 1, 50, 50)).toBeNull();
  });

  it("FX, account = quote (EUR/USD, USD account): pip value per unit 0.0001", () => {
    const s = fxSize({ account: 10_000, riskPct: 1, stopPips: 20, base: "EUR", quote: "USD", rate: 1.1, accountCcy: "USD" })!;
    close(s.pipValuePerUnit, 0.0001);
    expect(s.units).toBe(50_000); // 100 ÷ (20 × 0.0001)
    close(s.lots, 0.5);
    close(s.actualRisk, 100);
    expect(s.pip.method).toBe("quote-is-account");
  });

  it("FX, account = base (USD/JPY, USD account): pip value per unit 0.01 ÷ rate", () => {
    const s = fxSize({ account: 10_000, riskPct: 1, stopPips: 25, base: "USD", quote: "JPY", rate: 150, accountCcy: "USD" })!;
    close(s.pipValuePerUnit, 0.01 / 150);
    expect(s.units).toBe(60_000); // 100 ÷ (25 × 0.0000667) = 60,000
    expect(s.pip.method).toBe("base-is-account");
  });

  it("FX, cross (EUR/GBP, USD account): pip value per unit 0.0001 × GBP/USD, rounded down to micro lots", () => {
    const s = fxSize({ account: 10_000, riskPct: 1, stopPips: 30, base: "EUR", quote: "GBP", rate: 0.85, accountCcy: "USD", quoteToAccount: 1.25 })!;
    close(s.pipValuePerUnit, 0.000125);
    expect(s.units).toBe(26_000); // 100 ÷ (30 × 0.000125) = 26,666 → 26,000
    expect(s.actualRisk).toBeLessThanOrEqual(100);
    expect(s.pip.method).toBe("cross");
    expect(fxSize({ account: 10_000, riskPct: 1, stopPips: 30, base: "EUR", quote: "GBP", rate: 0.85, accountCcy: "USD" })).toBeNull();
  });

  it("futures: whole contracts, flagged when even one is too big", () => {
    const f = futuresSize(50_000, 1, 10, 50)!; // 10 points × $50 = $500 per contract
    expect(f.contracts).toBe(1);
    close(f.riskPerContract, 500);
    const g = futuresSize(10_000, 1, 10, 50)!;
    expect(g.contracts).toBe(0);
    expect(g.tooSmall).toBe(true);
    expect(futuresSize(100_000, 2, 8, 5)!.contracts).toBe(50);
  });
});

describe("stops", () => {
  it("ATR and structure stops sit on the right side of the entry", () => {
    close(atrStop(100, 2, 1.5, "long"), 97);
    close(atrStop(100, 2, 1.5, "short"), 103);
    close(structureStop(95, 0.2, "long"), 94.8);
    close(structureStop(105, 0.2, "short"), 105.2);
    expect(atrStop(1, 2, 3, "long")).toBeNull();
  });
});

describe("risk-reward and expectancy", () => {
  it("reward-to-risk", () => {
    close(rewardRisk(100, 98, 106), 3);
    close(rewardRisk(100, 102, 95), 2.5);
    expect(rewardRisk(100, 100, 105)).toBeNull();
  });

  it("expectancy = p × W − (1 − p) × L, with R, break-even and profit factor", () => {
    const e = expectancy(0.4, 300, 100)!;
    close(e.perTrade, 60); // 0.4 × 300 − 0.6 × 100
    close(e.inR!, 0.6);
    close(e.breakevenWinRate!, 0.25);
    close(e.profitFactor!, 2);
    const neg = expectancy(0.6, 50, 100)!;
    close(neg.perTrade, -10);
    expect(neg.profitFactor!).toBeLessThan(1);
    close(expectancy(1, 10, 10)!.perTrade, 10);
    expect(expectancy(1, 10, 10)!.profitFactor).toBeNull();
    expect(expectancy(1.2, 1, 1)).toBeNull();
  });

  it("break-even win rate is 1 ÷ (1 + RR)", () => {
    close(breakevenWinRate(1), 0.5);
    close(breakevenWinRate(2), 1 / 3);
    close(breakevenWinRate(3), 0.25);
    expect(breakevenWinRate(0)).toBeNull();
  });
});

describe("drawdown and recovery", () => {
  it("a loss of x needs x ÷ (1 − x) to recover", () => {
    close(recoveryNeeded(10), 100 / 9);
    close(recoveryNeeded(20), 25);
    close(recoveryNeeded(50), 100);
    close(recoveryNeeded(75), 300);
    close(recoveryNeeded(0), 0);
    expect(recoveryNeeded(100)).toBeNull();
  });

  it("drawdowns from the running peak", () => {
    const d = drawdowns([100, 120, 90, 110, 130, 104])!;
    close(d.maxDrawdownPct, 25);
    expect(d.peakIndex).toBe(1);
    expect(d.troughIndex).toBe(2);
    close(d.series[5], -20);
    expect(drawdowns([])).toBeNull();
  });

  it("losing-streak probability matches brute force", () => {
    const brute = (q: number, k: number, n: number) => {
      let total = 0;
      for (let m = 0; m < 2 ** n; m++) {
        let run = 0, hit = false, p = 1;
        for (let t = 0; t < n; t++) {
          const loss = (m >> t) & 1;
          p *= loss ? q : 1 - q;
          run = loss ? run + 1 : 0;
          if (run >= k) hit = true;
        }
        if (hit) total += p;
      }
      return total;
    };
    for (const [q, k, n] of [[0.5, 3, 10], [0.6, 4, 12], [0.3, 2, 8], [0.5, 1, 5]] as const) close(streakProbability(q, k, n), brute(q, k, n), 1e-12);
    close(streakProbability(0.5, 2, 2), 0.25);
    expect(streakProbability(0.5, 5, 4)).toBe(0);
    close(streakProbability(1, 3, 3), 1);
    expect(streakProbability(0.5, 0, 3)).toBeNull();
  });
});

describe("leverage and margin", () => {
  it("effective leverage and moves", () => {
    close(effectiveLeverage(100_000, 5_000), 20);
    close(moveForEquityChange(-50, 20), -2.5);
    expect(effectiveLeverage(1, 0)).toBeNull();
  });

  it("margin-call and stop-out prices for a long and a short", () => {
    // 100,000 units at 1.1000 = 110,000 notional, 1:30 → used margin 3,666.67; balance 5,000.
    const long = marginPlan({ balance: 5_000, units: 100_000, entry: 1.1, leverage: 30, side: "long" })!;
    close(long.notional, 110_000, 1e-6);
    close(long.usedMargin, 110_000 / 30, 1e-6);
    close(long.effectiveLeverage, 22, 1e-9);
    close(long.callPrice!, 1.1 - (5_000 - 110_000 / 30) / 100_000, 1e-12);
    close(long.stopOutPrice!, 1.1 - (5_000 - 0.5 * (110_000 / 30)) / 100_000, 1e-12);
    // At the stop-out price, equity ÷ used margin = 50%.
    const eq = 5_000 + (long.stopOutPrice! - 1.1) * 100_000;
    close((eq / long.usedMargin) * 100, 50, 1e-6);
    const short = marginPlan({ balance: 5_000, units: 100_000, entry: 1.1, leverage: 30, side: "short" })!;
    expect(short.stopOutPrice!).toBeGreaterThan(1.1);
    close(short.stopOutMovePct!, long.stopOutMovePct!, 1e-9);
  });

  it("over-leveraged: already at the call level when opened", () => {
    const p = marginPlan({ balance: 1_000, units: 100_000, entry: 1, leverage: 100, side: "long", callLevel: 100 })!;
    close(p.callPrice!, 1); // used margin 1,000 = balance: margin level 100% at once
    expect(marginPlan({ balance: 1_000, units: 1, entry: 1, leverage: 0.5, side: "long" })).toBeNull();
  });
});

describe("correlation and heat", () => {
  it("heat is the sum of open risk; combined risk ranges from √Σr² to Σr", () => {
    close(portfolioHeat([1, 1, 0.5]), 2.5);
    close(combinedRisk([1, 1], () => 1), 2);
    close(combinedRisk([1, 1], () => 0), Math.SQRT2);
    close(combinedRisk([1, 1], () => -1), 0);
    close(combinedRisk([3, 4], () => 0), 5);
    expect(combinedRisk([1, 1], () => 2)).toBeNull();
  });

  it("Pearson correlation", () => {
    close(correlation([1, 2, 3, 4], [2, 4, 6, 8]), 1);
    close(correlation([1, 2, 3, 4], [8, 6, 4, 2]), -1);
    expect(correlation([1, 1, 1], [1, 2, 3])).toBeNull();
  });
});

describe("gaps, slippage and daily limits", () => {
  it("a stop fills at the stop, or at the open when the market gaps through it", () => {
    const ok = gapLoss({ entry: 50, stop: 48, open: 49, units: 100, side: "long" })!;
    close(ok.fill, 48);
    close(ok.multipleOfPlan, 1);
    const gap = gapLoss({ entry: 50, stop: 48, open: 44, units: 100, side: "long" })!;
    close(gap.fill, 44);
    close(gap.loss, 600);
    close(gap.multipleOfPlan, 3);
    close(gap.slippage, 4);
    const short = gapLoss({ entry: 50, stop: 52, open: 55, units: 10, side: "short", extraSlippage: 0.5 })!;
    close(short.fill, 55.5);
    close(short.multipleOfPlan, 2.75);
    expect(gapLoss({ entry: 50, stop: 51, open: 49, units: 1, side: "long" })).toBeNull();
  });

  it("a daily loss limit stops trading after the trade that reaches it", () => {
    const r = applyDailyLimit([-100, 50, -150, -100, 200, -50], 300)!;
    expect(r.stoppedAt).toBe(3); // −100 +50 −150 −100 = −300
    expect(r.taken).toBe(4);
    expect(r.skipped).toBe(2);
    close(r.dayPnl, -300);
    expect(applyDailyLimit([10, -20], 300)!.stoppedAt).toBeNull();
  });
});

describe("averaging down", () => {
  it("average price is volume-weighted", () => {
    close(averagePrice([{ price: 100, qty: 10 }, { price: 80, qty: 30 }]), 85);
    expect(averagePrice([])).toBeNull();
  });

  it("equal adds and doubling adds: size grows, and so does the open loss", () => {
    const eq = averagingDown(100, 10, 10, 3, "equal")!;
    expect(eq.map((s) => s.totalQty)).toEqual([10, 20, 30, 40]);
    close(eq[3].avgPrice, 85); // (100 + 90 + 80 + 70) ÷ 4
    close(eq[3].openLoss, 600); // (85 − 70) × 40
    close(eq[3].reboundToBreakevenPct, (85 / 70 - 1) * 100);
    const dbl = averagingDown(100, 10, 10, 3, "double")!;
    expect(dbl.map((s) => s.totalQty)).toEqual([10, 30, 70, 150]);
    close(dbl[3].avgPrice, (100 * 10 + 90 * 20 + 80 * 40 + 70 * 80) / 150);
    expect(dbl[3].openLoss).toBeGreaterThan(eq[3].openLoss);
  });
});

describe("risk of ruin and Monte Carlo", () => {
  it("gambler's ruin and the Kelly fraction", () => {
    close(ruinEvenMoney(0.55, 10), (0.45 / 0.55) ** 10);
    expect(ruinEvenMoney(0.5, 10)).toBe(1);
    close(kellyFraction(0.5, 2), 0.25);
    close(kellyFraction(0.4, 1), -0.2);
  });

  it("is reproducible from its seed and differs between seeds", () => {
    const base = { paths: 50, trades: 100, winRate: 0.5, rr: 1.5, riskPct: 2, mode: "fixed-fractional" as const };
    const a = monteCarlo({ seed: 7, ...base })!, b = monteCarlo({ seed: 7, ...base })!, c = monteCarlo({ seed: 8, ...base })!;
    expect(a.paths).toEqual(b.paths);
    expect(a.paths).not.toEqual(c.paths);
    expect(a.paths).toHaveLength(50);
    expect(a.paths[0]).toHaveLength(101);
    expect(a.p5Final).toBeLessThanOrEqual(a.medianFinal);
    expect(a.medianFinal).toBeLessThanOrEqual(a.p95Final);
  });

  it("each step follows the rule: win rr × stake or lose the stake", () => {
    const m = monteCarlo({ seed: 3, paths: 5, trades: 40, winRate: 0.5, rr: 2, riskPct: 1, mode: "fixed-fractional" })!;
    for (const p of m.paths) for (let t = 1; t < p.length; t++) {
      const ratio = p[t] / p[t - 1];
      expect(Math.abs(ratio - 1.02) < 1e-9 || Math.abs(ratio - 0.99) < 1e-9).toBe(true);
    }
    const d = monteCarlo({ seed: 3, paths: 5, trades: 40, winRate: 0.5, rr: 2, riskPct: 1, mode: "fixed-dollar" })!;
    for (const p of d.paths) for (let t = 1; t < p.length; t++) {
      const step = p[t] - p[t - 1];
      expect(Math.abs(step - 200) < 1e-9 || Math.abs(step + 100) < 1e-9).toBe(true);
    }
  });

  it("fixed fractional never reaches zero; fixed dollar can, and is ruined more often with no edge", () => {
    const common = { seed: 11, paths: 400, trades: 300, winRate: 0.4, rr: 1.5, riskPct: 5 };
    const ff = monteCarlo({ ...common, mode: "fixed-fractional" })!;
    const fd = monteCarlo({ ...common, mode: "fixed-dollar" })!;
    expect(Math.min(...ff.paths.map((p) => p[p.length - 1]))).toBeGreaterThan(0);
    expect(fd.paths.some((p) => p[p.length - 1] === 0)).toBe(true);
    expect(fd.ruinShare).toBeGreaterThan(0);
    expect(monteCarlo({ ...common, paths: 0, mode: "fixed-dollar" })).toBeNull();
  });

  it("higher risk per trade means deeper typical drawdowns", () => {
    const common = { seed: 5, paths: 300, trades: 200, winRate: 0.5, rr: 1.5, mode: "fixed-fractional" as const };
    const lo = monteCarlo({ ...common, riskPct: 1 })!, hi = monteCarlo({ ...common, riskPct: 5 })!;
    expect(hi.medianMaxDrawdownPct).toBeGreaterThan(lo.medianMaxDrawdownPct);
  });
});
