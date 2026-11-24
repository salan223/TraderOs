/** Tester round 6: parseFieldNumber edge cases and capWeightsChecked. */
import { describe, expect, it } from "vitest";
import { parseFieldNumber as p } from "@/lib/academy/shuffle";
import * as calc from "@/lib/academy/calc";

describe("parseFieldNumber: unambiguous inputs", () => {
  it.each([
    ["10000", 10000], ["12.5", 12.5], ["12,5", 12.5], ["1,5", 1.5], ["0,25", 0.25], [",5", 0.5], [".5", 0.5], ["5.", 5],
    ["1,000", 1000], ["10,000,000", 1e7], ["1,000.5", 1000.5], ["1 000", 1000], ["$5,000", 5000], ["−500", -500], ["-500", -500],
    ["1e3", 1000], ["  42  ", 42], ["+7", 7],
  ])("%s → %s", (s, n) => expect(p(s)).toBe(n));
  it.each(["", " ", "abc", "1,2,3", "1.2.3", "12a", "0x10", "Infinity", "NaN", "1e400", "1,000,00", "--5", "1'000", "e5"])("%s → null", (s) => expect(p(s)).toBeNull());
});

describe("parseFieldNumber: ambiguous European inputs (documenting behaviour)", () => {
  // These are the risky ones: a German/French user writes thousands with '.' and decimals with ','.
  it("'1.000' (German one thousand) is read as 1 — silently 1000× too small", () => expect(p("1.000")).toBe(1));
  it("'5.000,50' (German 5000.50) is rejected rather than misread", () => expect(p("5.000,50")).toBeNull());
  it("'1,234' is read as 1234 (US thousands), although a European means 1.234", () => expect(p("1,234")).toBe(1234));
  it("'1,0000' (4 digits after the comma) → 1", () => expect(p("1,0000")).toBe(1));
  it("'1,00' → 1 (decimal reading)", () => expect(p("1,00")).toBe(1));
});

describe("capWeightsChecked", () => {
  const f = (calc as unknown as Record<string, (w: Record<string, number>, c: number) => { weights: Record<string, number>; feasible: boolean; capped: string[] | boolean }>).capWeightsChecked;
  it("exists", () => expect(typeof f).toBe("function"));
  it("infeasible 2 × 35% is flagged", () => {
    const r = f({ a: 0.9, b: 0.1 }, 0.35);
    expect(r.feasible).toBe(false);
    expect(r.weights.a).toBeCloseTo(0.5);
  });
  it("feasible 4 × 35% caps the biggest and keeps sum 1", () => {
    const r = f({ a: 48 / 123, b: 20 / 123, c: 25 / 123, d: 30 / 123 }, 0.35);
    expect(r.feasible).toBe(true);
    expect(r.weights.a).toBeCloseTo(0.35, 12);
    expect(Object.values(r.weights).reduce((x, y) => x + y, 0)).toBeCloseTo(1, 12);
  });
});
