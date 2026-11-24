/**
 * Tester round 5: independent checks of lib/academy/calc.ts against
 * hand-computed values, plus hostile inputs (0, negative, NaN, Infinity,
 * huge numbers). Expected values below were worked out by hand, not by
 * calling the code.
 */
import { describe, expect, it } from "vitest";
import {
  applySplit, buybackEps, capBucket, capWeights, classifyPair, classifySurprise, convert, dividendYield,
  divisorAfterSplit, eps, exDividendPrice, feesOverYears, futuresPosition, indexChangePct, indexWeights,
  invertRate, marginRequired, marginSnapshot, marketCap, matchOrder, navPerUnit, pctChange, peRatio, pipSize,
  pipValue, pipetteSize, pipsBetween, positionSize, premiumPct, priceWeightedLevel, rolloverNights, spreadCost,
  surprisePct, swapPerNight, tradePnl, tradingCost, type Book,
} from "@/lib/academy/calc";

const near = (a: number | null | undefined, b: number, tol = 1e-9) => {
  expect(a, `expected ~${b}`).not.toBeNull();
  expect(a).not.toBeUndefined();
  expect(Math.abs((a as number) - b), `got ${a}, want ${b}`).toBeLessThan(tol);
};
const BAD = [NaN, Infinity, -Infinity];

describe("pips and pipettes", () => {
  it("JPY 0.01, everything else 0.0001, case/space-insensitive", () => {
    expect(pipSize("JPY")).toBe(0.01);
    expect(pipSize(" jpy ")).toBe(0.01);
    expect(pipSize("USD")).toBe(0.0001);
    expect(pipSize("GBP")).toBe(0.0001);
    near(pipetteSize("JPY"), 0.001);
    near(pipetteSize("USD"), 0.00001);
  });
  it("pipsBetween hand values incl. JPY and fractional pips", () => {
    near(pipsBetween(1.1, 1.1025, "USD"), 25);
    near(pipsBetween(1.1025, 1.1, "USD"), -25);
    near(pipsBetween(150.0, 150.255, "JPY"), 25.5);
    near(pipsBetween(1.10003, 1.10008, "USD"), 0.5); // 5 pipettes
    for (const b of [...BAD, 0, -1]) expect(pipsBetween(b, 1, "USD")).toBeNull();
  });
});

describe("pip value (hand worked)", () => {
  it("EUR/USD, USD account, 1 standard lot = $10", () => {
    const v = pipValue({ base: "EUR", quote: "USD", units: 100_000, rate: 1.1, account: "USD" })!;
    near(v.inQuote, 10); near(v.inAccount, 10); expect(v.method).toBe("quote-is-account");
  });
  it("USD/JPY at 150, USD account, 1 lot: ¥1,000 = $6.6667", () => {
    const v = pipValue({ base: "USD", quote: "JPY", units: 100_000, rate: 150, account: "USD" })!;
    near(v.inQuote, 1000); near(v.inAccount, 1000 / 150, 1e-9); expect(v.method).toBe("base-is-account");
  });
  it("EUR/GBP, USD account, GBP/USD 1.25: £10 × 1.25 = $12.50", () => {
    const v = pipValue({ base: "EUR", quote: "GBP", units: 100_000, rate: 0.88, account: "USD", quoteToAccount: 1.25 })!;
    near(v.inQuote, 10); near(v.inAccount, 12.5); expect(v.method).toBe("cross");
  });
  it("EUR/GBP, EUR account (account = base): £10 ÷ 0.88 = €11.3636", () => {
    const v = pipValue({ base: "EUR", quote: "GBP", units: 100_000, rate: 0.88, account: "EUR" })!;
    near(v.inAccount, 10 / 0.88);
  });
  it("GBP/JPY cross into USD: ¥1,000 × (1/150) = $6.6667", () => {
    const v = pipValue({ base: "GBP", quote: "JPY", units: 100_000, rate: 190, account: "USD", quoteToAccount: 1 / 150 })!;
    near(v.inQuote, 1000); near(v.inAccount, 1000 / 150);
  });
  it("EUR/JPY into a GBP account (neither side)", () => {
    // 10,000 units, ¥100 per pip; 1 JPY = 0.0053 GBP → £0.53
    const v = pipValue({ base: "EUR", quote: "JPY", units: 10_000, rate: 160, account: "GBP", quoteToAccount: 0.0053 })!;
    near(v.inAccount, 0.53, 1e-12);
  });
  it("a cross without a conversion rate is refused, not guessed", () => {
    expect(pipValue({ base: "EUR", quote: "GBP", units: 100_000, rate: 0.88, account: "USD" })).toBeNull();
    expect(pipValue({ base: "EUR", quote: "GBP", units: 100_000, rate: 0.88, account: "USD", quoteToAccount: 0 })).toBeNull();
    expect(pipValue({ base: "EUR", quote: "GBP", units: 100_000, rate: 0.88, account: "USD", quoteToAccount: NaN })).toBeNull();
  });
  it("zero units = zero value; bad units/rate = null; same-currency pair = null", () => {
    near(pipValue({ base: "EUR", quote: "USD", units: 0, rate: 1.1, account: "USD" })!.inAccount, 0);
    for (const b of [...BAD, -1]) expect(pipValue({ base: "EUR", quote: "USD", units: b, rate: 1.1, account: "USD" })).toBeNull();
    for (const b of [...BAD, 0, -1]) expect(pipValue({ base: "EUR", quote: "USD", units: 1000, rate: b, account: "USD" })).toBeNull();
    expect(pipValue({ base: "USD", quote: "USD", units: 1000, rate: 1, account: "USD" })).toBeNull();
  });
  it("huge sizes stay finite and linear", () => {
    const v = pipValue({ base: "EUR", quote: "USD", units: 1e15, rate: 1.1, account: "USD" })!;
    near(v.inAccount / 1e11, 1, 1e-9);
  });
});

describe("trade P&L", () => {
  it("long/short, quote currency", () => {
    near(tradePnl("long", 1.1, 1.102, 100_000), 200, 1e-6);
    near(tradePnl("short", 1.1, 1.102, 100_000), -200, 1e-6);
    near(tradePnl("long", 150, 149, 10_000), -10_000, 1e-6); // yen
    expect(tradePnl("long", 0, 1, 1)).toBeNull();
    expect(tradePnl("long", 1, NaN, 1)).toBeNull();
  });
});

describe("position size", () => {
  it("$5,000, 1%, 25 pips, EUR/USD: $50 ÷ (25 × 0.0001) = 20,000 units", () => {
    const s = positionSize(5000, 1, 25, 0.0001)!;
    expect(s.units).toBe(20_000); near(s.lots, 0.2); near(s.riskAmount, 50);
  });
  it("rounds DOWN to micro lots, never up", () => {
    // $50 ÷ (30 × 0.0001) = 16,666.67 → 16,000
    expect(positionSize(5000, 1, 30, 0.0001)!.units).toBe(16_000);
    // exact boundary that floating point could drop: $10 ÷ (10 × 0.0001) = 10,000
    expect(positionSize(1000, 1, 10, 0.0001)!.units).toBe(10_000);
  });
  it("USD/JPY at 150: per-unit pip $0.0000667; $50 ÷ (25 × 0.01/150) = 30,000", () => {
    expect(positionSize(5000, 1, 25, 0.01 / 150)!.units).toBe(30_000);
  });
  it("tiny accounts give 0 units, not a negative or fractional lot", () => {
    const s = positionSize(50, 1, 25, 0.0001)!; // $0.50 risk → 200 units → 0 micro lots
    expect(s.units).toBe(0); expect(s.lots).toBe(0);
  });
  it("100% risk accepted; >100% and ≤0 refused; 0-pip stop refused", () => {
    expect(positionSize(1000, 100, 10, 0.0001)!.units).toBe(1_000_000);
    expect(positionSize(1000, 100.01, 10, 0.0001)).toBeNull();
    expect(positionSize(1000, 0, 10, 0.0001)).toBeNull();
    expect(positionSize(1000, -1, 10, 0.0001)).toBeNull();
    expect(positionSize(1000, 1, 0, 0.0001)).toBeNull();
    expect(positionSize(1000, 1, -5, 0.0001)).toBeNull();
    for (const b of BAD) {
      expect(positionSize(b, 1, 10, 0.0001)).toBeNull();
      expect(positionSize(1000, b, 10, 0.0001)).toBeNull();
      expect(positionSize(1000, 1, b, 0.0001)).toBeNull();
      expect(positionSize(1000, 1, 10, b)).toBeNull();
    }
  });
});

describe("leverage and margin", () => {
  it("lesson figures: 22,000 ÷ 30 = 733.33; 60,000 ÷ 30 = 2,000", () => {
    near(marginRequired(22_000, 30), 733.3333333333, 1e-6);
    near(marginRequired(60_000, 30), 2000);
  });
  it("leverage 1 and 500; below 1 refused", () => {
    near(marginRequired(110_000, 1), 110_000);
    near(marginRequired(110_000, 500), 220);
    expect(marginRequired(110_000, 0.5)).toBeNull();
    expect(marginRequired(110_000, 0)).toBeNull();
    expect(marginRequired(110_000, -30)).toBeNull();
    for (const b of BAD) expect(marginRequired(110_000, b)).toBeNull();
    expect(marginRequired(-1, 30)).toBeNull();
  });
  it("margin level = equity ÷ used × 100; call at 100, stop-out at 50 by default", () => {
    // $1,000 balance, $733.33 used (0.2 lot at 1:30, 1.1)
    const used = 22_000 / 30;
    const ok = marginSnapshot(1000, 0, used)!;
    near(ok.marginLevel, (1000 / used) * 100, 1e-9); expect(ok.status).toBe("ok");
    near(ok.freeMargin, 1000 - used, 1e-9);
    // equity exactly = used → 100% → margin call (at or below)
    expect(marginSnapshot(1000, used - 1000, used)!.status).toBe("margin-call");
    // equity exactly half of used → stop-out
    expect(marginSnapshot(1000, -500, 1000)!.status).toBe("stop-out"); // exactly 50%
    expect(marginSnapshot(1000, -499, 1000)!.status).toBe("margin-call");
    // negative equity
    const neg = marginSnapshot(1000, -1500, used)!;
    expect(neg.equity).toBe(-500); expect(neg.status).toBe("stop-out"); expect(neg.marginLevel!).toBeLessThan(0);
  });
  it("broker-specific levels are honoured", () => {
    expect(marginSnapshot(1000, -100, 1000, 120, 80)!.status).toBe("margin-call"); // 90%
    expect(marginSnapshot(1000, -200, 1000, 120, 80)!.status).toBe("stop-out"); // 80% → at the level
    expect(marginSnapshot(1000, 250, 1000, 120, 80)!.status).toBe("ok"); // 125%
  });
  it("no margin in use → no level, status ok", () => {
    const s = marginSnapshot(1000, 0, 0)!;
    expect(s.marginLevel).toBeNull(); expect(s.status).toBe("ok");
  });
  it("bad inputs → null", () => {
    for (const b of BAD) {
      expect(marginSnapshot(b, 0, 100)).toBeNull();
      expect(marginSnapshot(1000, b, 100)).toBeNull();
      expect(marginSnapshot(1000, 0, b)).toBeNull();
    }
    expect(marginSnapshot(1000, 0, -1)).toBeNull();
  });
  it("widget stop-out distance: 0.2 lot, 1:30, $1,000 → (1000 − 366.67) ÷ $2/pip = 316.7 pips", () => {
    const used = 22_000 / 30, pipUsd = 20_000 * 0.0001;
    const pips = (1000 - 0.5 * used) / pipUsd;
    near(pips, 316.6666666, 1e-6);
    // at that move the snapshot is exactly at the stop-out boundary
    expect(marginSnapshot(1000, -Math.ceil(pips) * pipUsd, used)!.status).toBe("stop-out");
    expect(marginSnapshot(1000, -Math.floor(pips) * pipUsd, used)!.status).toBe("margin-call");
  });
});

describe("costs and swaps", () => {
  it("spread: 1.2 pips × 1 lot = $12; JPY 1.5 pips × 10k = ¥150", () => {
    near(spreadCost(1.2, 100_000, "USD"), 12, 1e-9);
    near(spreadCost(1.5, 10_000, "JPY"), 150, 1e-9);
    expect(spreadCost(-1, 1000, "USD")).toBeNull();
    expect(spreadCost(NaN, 1000, "USD")).toBeNull();
  });
  it("swap direction: long earns base − quote − markup; short the reverse; both negative with markup", () => {
    // 100k EUR/USD at 1.1 → $110,000 notional. base 2%, quote 4%, markup 0.5%
    // long: 110,000 × (2 − 4 − 0.5)% / 365 = −7.5342
    near(swapPerNight("long", 100_000, 1.1, 2, 4, 0.5), (110_000 * -2.5) / 100 / 365, 1e-9);
    // short: 110,000 × (4 − 2 − 0.5)% / 365 = +4.5205
    near(swapPerNight("short", 100_000, 1.1, 2, 4, 0.5), (110_000 * 1.5) / 100 / 365, 1e-9);
    // equal rates, markup 0.5 → both sides pay
    expect(swapPerNight("long", 100_000, 1.1, 3, 3, 0.5)!).toBeLessThan(0);
    expect(swapPerNight("short", 100_000, 1.1, 3, 3, 0.5)!).toBeLessThan(0);
    // small gap smaller than markup → both negative (lesson's claim)
    expect(swapPerNight("long", 100_000, 1.1, 3.2, 3, 0.5)!).toBeLessThan(0);
    expect(swapPerNight("short", 100_000, 1.1, 3.2, 3, 0.5)!).toBeLessThan(0);
    // negative rates are valid input
    expect(swapPerNight("long", 100_000, 1.1, -0.75, 1, 0)!).toBeLessThan(0);
    expect(swapPerNight("long", 100_000, 1.1, 2, 4, -0.1)).toBeNull(); // negative markup refused
    expect(swapPerNight("long", 100_000, 0, 2, 4, 0)).toBeNull();
  });
  it("triple swap on Wednesday; week sums to 7", () => {
    expect([0, 1, 2, 3, 4, 5, 6].map(rolloverNights)).toEqual([0, 1, 1, 3, 1, 1, 0]);
    expect([0, 1, 2, 3, 4, 5, 6].map(rolloverNights).reduce((a, b) => a + b)).toBe(7);
    for (const b of [-1, 7, 2.5, NaN]) expect(rolloverNights(b)).toBe(0);
  });
  it("lesson exercise: 12 + 7 + 6 = $25; swap income lowers cost", () => {
    near(tradingCost(12, 7, -6)!.total, 25);
    near(tradingCost(12, 7, 10)!.total, 9);
    expect(tradingCost(-1, 7, 0)).toBeNull();
    expect(tradingCost(12, 7, NaN)).toBeNull();
  });
});

describe("conversion and pair types", () => {
  it("convert/invert", () => {
    near(convert(1000, 1.1, "base-to-quote"), 1100, 1e-9);
    near(convert(1100, 1.1, "quote-to-base"), 1000, 1e-9);
    near(invertRate(1.25), 0.8);
    expect(convert(1000, 0, "quote-to-base")).toBeNull();
    expect(invertRate(0)).toBeNull();
    near(pctChange(1.1, 1.21), 10, 1e-9);
    expect(pctChange(0, 1)).toBeNull();
  });
  it("classifyPair", () => {
    expect(classifyPair("EUR", "USD")).toBe("major");
    expect(classifyPair("USD", "CAD")).toBe("major");
    expect(classifyPair("EUR", "GBP")).toBe("minor");
    expect(classifyPair("USD", "MXN")).toBe("exotic");
    expect(classifyPair("EUR", "TRY")).toBe("exotic");
    expect(classifyPair("eur", "usd")).toBe("major");
    expect(classifyPair("EUR", "EUR")).toBeNull();
    expect(classifyPair("EU", "USD")).toBeNull();
  });
});

describe("order book matching", () => {
  const BOOK: Book = {
    asks: [{ price: 50.02, qty: 300 }, { price: 50.03, qty: 500 }, { price: 50.05, qty: 800 }],
    bids: [{ price: 49.99, qty: 400 }, { price: 49.98, qty: 600 }],
  };
  it("market buy 1,000 walks the book: 300@50.02 + 500@50.03 + 200@50.05, avg 50.031", () => {
    const r = matchOrder(BOOK, { side: "buy", type: "market", qty: 1000 });
    expect(r.status).toBe("filled");
    expect(r.fills).toEqual([{ price: 50.02, qty: 300 }, { price: 50.03, qty: 500 }, { price: 50.05, qty: 200 }]);
    near(r.avgPrice, (300 * 50.02 + 500 * 50.03 + 200 * 50.05) / 1000, 1e-9);
    expect(r.book.asks).toEqual([{ price: 50.05, qty: 600 }]);
    // input not mutated
    expect(BOOK.asks[0]).toEqual({ price: 50.02, qty: 300 });
  });
  it("fully draining a side: market buy 5,000 → 1,600 filled, 3,400 cancelled, asks empty", () => {
    const r = matchOrder(BOOK, { side: "buy", type: "market", qty: 5000 });
    expect(r.status).toBe("partial-cancelled");
    expect(r.filledQty).toBe(1600); expect(r.cancelledQty).toBe(3400); expect(r.restedQty).toBe(0);
    expect(r.book.asks).toEqual([]);
    const again = matchOrder(r.book, { side: "buy", type: "market", qty: 100 });
    expect(again.status).toBe("unfilled"); expect(again.avgPrice).toBeNull();
  });
  it("limit buy crossing the spread fills what it can and rests the rest at its limit", () => {
    const r = matchOrder(BOOK, { side: "buy", type: "limit", qty: 1000, limit: 50.03 });
    expect(r.status).toBe("partial-rested");
    expect(r.filledQty).toBe(800); expect(r.restedQty).toBe(200);
    expect(r.book.bids[0]).toEqual({ price: 50.03, qty: 200 });
    expect(r.book.asks[0].price).toBe(50.05);
  });
  it("limit buy below the ask rests; limit at the ask fills", () => {
    const r = matchOrder(BOOK, { side: "buy", type: "limit", qty: 100, limit: 49.97 });
    expect(r.status).toBe("rested");
    expect(r.book.bids.map((l) => l.price)).toEqual([49.99, 49.98, 49.97]);
    expect(matchOrder(BOOK, { side: "buy", type: "limit", qty: 300, limit: 50.02 }).status).toBe("filled");
  });
  it("limit sell crossing: takes bids from the highest down", () => {
    const r = matchOrder(BOOK, { side: "sell", type: "limit", qty: 700, limit: 49.98 });
    expect(r.fills).toEqual([{ price: 49.99, qty: 400 }, { price: 49.98, qty: 300 }]);
    expect(r.status).toBe("filled");
  });
  it("tie at the same price: the earlier level fills first and a resting order joins the back", () => {
    const tie: Book = { asks: [{ price: 50, qty: 100 }, { price: 50, qty: 200 }], bids: [] };
    const r = matchOrder(tie, { side: "buy", type: "market", qty: 150 });
    expect(r.fills).toEqual([{ price: 50, qty: 100 }, { price: 50, qty: 50 }]);
    const joined = matchOrder(BOOK, { side: "buy", type: "limit", qty: 100, limit: 49.99 });
    expect(joined.book.bids[0]).toEqual({ price: 49.99, qty: 500 });
  });
  it("many orders in sequence keep the book sorted and conserve quantity", () => {
    let b: Book = BOOK;
    const before = [...b.asks, ...b.bids].reduce((s, l) => s + l.qty, 0);
    let added = 0, removed = 0;
    for (let i = 0; i < 200; i++) {
      const side = i % 2 ? "buy" : "sell";
      const limit = Math.round((49.9 + (i % 25) * 0.01) * 100) / 100;
      const r = matchOrder(b, { side, type: "limit", qty: 100, limit });
      added += r.restedQty; removed += r.filledQty;
      b = r.book;
      for (let k = 1; k < b.asks.length; k++) expect(b.asks[k].price).toBeGreaterThan(b.asks[k - 1].price);
      for (let k = 1; k < b.bids.length; k++) expect(b.bids[k].price).toBeLessThan(b.bids[k - 1].price);
      if (b.asks.length && b.bids.length) expect(b.asks[0].price).toBeGreaterThan(b.bids[0].price); // never crossed
    }
    const after = [...b.asks, ...b.bids].reduce((s, l) => s + l.qty, 0);
    expect(after).toBe(before + added - removed);
  });
  it("invalid orders", () => {
    for (const q of [0, -5, 1.5, NaN, Infinity]) expect(matchOrder(BOOK, { side: "buy", type: "market", qty: q }).status).toBe("invalid");
    for (const l of [0, -1, NaN, undefined]) expect(matchOrder(BOOK, { side: "buy", type: "limit", qty: 10, limit: l }).status).toBe("invalid");
  });
  it("junk levels in the input are dropped, unsorted input is sorted", () => {
    const r = matchOrder({ asks: [{ price: 51, qty: 10 }, { price: NaN, qty: 5 }, { price: 50, qty: 0 }, { price: 50.5, qty: 10 }], bids: [] }, { side: "buy", type: "market", qty: 15 });
    expect(r.fills).toEqual([{ price: 50.5, qty: 10 }, { price: 51, qty: 5 }]);
  });
});

describe("earnings", () => {
  it("EPS, P/E (lesson: 60m/40m = 1.50; 30/1.5 = 20)", () => {
    near(eps(60e6, 40e6), 1.5); near(peRatio(30, 1.5), 20);
    near(eps(-10e6, 5e6), -2);
  });
  it("P/E is n/a for EPS ≤ 0", () => {
    expect(peRatio(30, 0)).toBeNull();
    expect(peRatio(30, -0.5)).toBeNull();
    expect(peRatio(30, -0)).toBeNull();
    expect(peRatio(0, 1)).toBeNull();
    expect(eps(1, 0)).toBeNull();
    expect(eps(NaN, 1)).toBeNull();
  });
  it("surprise: 0.60 vs 0.55 = +9.09% beat; negative forecast uses |expected|", () => {
    near(surprisePct(0.6, 0.55), (0.05 / 0.55) * 100, 1e-9);
    expect(classifySurprise(0.6, 0.55)).toBe("beat");
    expect(classifySurprise(0.555, 0.55)).toBe("in-line"); // +0.9%
    expect(classifySurprise(0.5, 0.55)).toBe("miss");
    near(surprisePct(-0.1, -0.2), 50, 1e-9); // smaller loss than feared = beat
    expect(classifySurprise(-0.1, -0.2)).toBe("beat");
    expect(surprisePct(1, 0)).toBeNull();
  });
});

describe("size and indices", () => {
  it("market cap and buckets at exact cut-offs", () => {
    near(marketCap(40, 500e6), 20e9);
    expect(capBucket(200e9)).toBe("mega");
    expect(capBucket(199.99e9)).toBe("large");
    expect(capBucket(10e9)).toBe("large");
    expect(capBucket(9.99e9)).toBe("mid");
    expect(capBucket(2e9)).toBe("mid");
    expect(capBucket(300e6)).toBe("small");
    expect(capBucket(299e6)).toBe("micro");
    expect(capBucket(0)).toBe("micro");
    expect(capBucket(-1)).toBeNull();
    expect(capBucket(NaN)).toBeNull();
    // lesson exercise items
    expect(capBucket(400 * 30e6)).toBe("large");
    expect(capBucket(120 * 40e6)).toBe("mid");
    expect(capBucket(3 * 500e6)).toBe("small");
  });
  it("price-weighted lesson exercise: $10/$50/$140, +10% on $140 → +7%", () => {
    const m = [{ id: "a", price: 10, shares: 1 }, { id: "b", price: 50, shares: 1 }, { id: "c", price: 140, shares: 1 }];
    near(indexChangePct(m, { c: 10 }, "price"), 7, 1e-9);
    near(indexChangePct(m, { a: 10 }, "price"), 0.5, 1e-9);
    near(indexChangePct(m, { a: 6, b: -3, c: 0 }, "equal"), 1, 1e-9);
  });
  it("float-adjusted: 30% locked → 70% counts", () => {
    const m = [{ id: "a", price: 10, shares: 100, float: 0.7 }, { id: "b", price: 10, shares: 70 }];
    const w = indexWeights(m, "float");
    near(w.a, 0.5); near(w.b, 0.5);
    expect(indexWeights([{ id: "a", price: 10, shares: 1, float: 0 }], "float")).toEqual({});
    expect(indexWeights([{ id: "a", price: 10, shares: 1, float: 1.2 }], "float")).toEqual({});
  });
  it("divisor after a split keeps the level", () => {
    const prices = [10, 50, 140];
    const d = divisorAfterSplit(prices, 1, 2, 2)!;
    near(d, 130 / 200);
    near(priceWeightedLevel([10, 50, 70], d), 200, 1e-9);
    expect(divisorAfterSplit(prices, 1, 5, 2)).toBeNull();
    expect(divisorAfterSplit(prices, 0, 0, 2)).toBeNull();
  });
  it("index change refuses a fall below −100%", () => {
    const m = [{ id: "a", price: 10, shares: 1 }];
    expect(indexChangePct(m, { a: -101 }, "price")).toBeNull();
    expect(indexChangePct(m, { a: NaN }, "cap")).toBeNull();
  });
});

describe("capWeights", () => {
  const sum = (w: Record<string, number>) => Object.values(w).reduce((a, b) => a + b, 0);
  it("redistributes iteratively: {.6,.3,.1} at 40% → {.4,.4,.2}", () => {
    const w = capWeights({ a: 0.6, b: 0.3, c: 0.1 }, 0.4);
    near(w.a, 0.4); near(w.b, 0.4); near(w.c, 0.2); near(sum(w), 1);
  });
  it("widget data at 35%: Birch 48/123 = 39.0% → 35%, others scaled up, sum 1", () => {
    const raw = { alto: 20e9, birch: 48e9, cobalt: 25e9, delta: 30e9 };
    const t = 123e9;
    const w = capWeights(Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, v / t])), 0.35);
    near(w.birch, 0.35);
    near(w.alto, (20 / 75) * 0.65, 1e-12);
    near(sum(w), 1, 1e-12);
    for (const v of Object.values(w)) expect(v).toBeLessThanOrEqual(0.35 + 1e-12);
  });
  it("impossible cap (2 members, 35%) → documented fallback: equal 50/50 (still above the cap)", () => {
    const w = capWeights({ a: 0.9, b: 0.1 }, 0.35);
    near(w.a, 0.5); near(w.b, 0.5);
  });
  it("exactly feasible cap (4 × 25%) ends equal", () => {
    const w = capWeights({ a: 0.7, b: 0.1, c: 0.1, d: 0.1 }, 0.25);
    for (const v of Object.values(w)) near(v, 0.25, 1e-12);
  });
  it("cap ≥ 1 or ≤ 0 or empty → unchanged", () => {
    expect(capWeights({ a: 0.6, b: 0.4 }, 1)).toEqual({ a: 0.6, b: 0.4 });
    expect(capWeights({ a: 0.6, b: 0.4 }, 0)).toEqual({ a: 0.6, b: 0.4 });
    expect(capWeights({}, 0.3)).toEqual({});
  });
});

describe("funds and futures", () => {
  it("NAV: (1,000,000 + 10,000) ÷ 10,000 = 101; premium/discount", () => {
    near(navPerUnit(1_000_000, 10_000, 0, 10_000), 101);
    near(navPerUnit(1_000_000, 10_000, 20_000, 10_000), 99);
    near(premiumPct(101.5, 100), 1.5, 1e-9);
    near(premiumPct(99, 100), -1, 1e-9);
    expect(navPerUnit(1, 1, 0, 0)).toBeNull();
    expect(premiumPct(0, 100)).toBeNull();
  });
  it("fees with no growth: 0.2% on $10,000 → $20 in year 1, 10,000 × (1 − 0.998^10) over 10", () => {
    near(feesOverYears(10_000, 0.2, 1), 20, 1e-9);
    near(feesOverYears(10_000, 0.2, 10), 10_000 * (1 - 0.998 ** 10), 1e-9);
    expect(feesOverYears(10_000, 100, 1)).toBeNull();
    near(feesOverYears(10_000, 0, 10), 0);
  });
  it("E-mini $50 and Micro $5 per point", () => {
    const f = futuresPosition(5000, 50, 1, 25_000, 20)!;
    near(f.notional, 250_000); near(f.pnl, 1000); near(f.leverage, 10); near(f.pnlPctOfMargin, 4);
    const m = futuresPosition(5000, 5, 1, 2500, 20)!;
    near(m.notional, 25_000); near(m.pnl, 100); near(m.leverage, 10);
    near(futuresPosition(5000, 50, 2, 50_000, -50, "short")!.pnl, 5000);
    expect(futuresPosition(5000, 50, 1, 0, 20)!.leverage).toBeNull();
    expect(futuresPosition(5000, 50, 1.5, 25_000, 20)).toBeNull();
    expect(futuresPosition(5000, 50, 1, 25_000, NaN)).toBeNull();
  });
});

describe("dividends, splits, buybacks", () => {
  it("yield and ex-date price", () => {
    near(dividendYield(2, 50), 4); near(dividendYield(1, 25), 4);
    near(exDividendPrice(40, 1), 39);
    expect(exDividendPrice(1, 1)).toBeNull();
    expect(dividendYield(1, 0)).toBeNull();
  });
  it("splits keep value: 3-for-1 of 10 × $300 → 30 × $100; 1-for-10 reverse", () => {
    const s = applySplit(300, 10, 3)!;
    near(s.price, 100); near(s.shares, 30); near(s.price * s.shares, s.value);
    const r = applySplit(0.5, 10, 0.1)!;
    near(r.price, 5); near(r.shares, 1, 1e-12);
    expect(applySplit(300, 10, 0)).toBeNull();
  });
  it("buyback of 10% with flat profit lifts EPS by 11.11%", () => {
    const b = buybackEps(200e6, 100e6, 10e6)!;
    near(b.before, 2); near(b.after, 200 / 90, 1e-12); near(b.changePct, (1 / 0.9 - 1) * 100, 1e-9);
    expect(buybackEps(200e6, 100e6, 100e6)).toBeNull();
    // loss-making company: EPS gets MORE negative, changePct reported as negative
    const l = buybackEps(-100e6, 100e6, 50e6)!;
    near(l.after, -2); expect(l.changePct).toBeLessThan(0);
  });
});
