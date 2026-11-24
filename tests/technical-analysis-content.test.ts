import { describe, expect, it } from "vitest";
import { getTrack, lessonsOfTrack } from "@/lib/academy/curriculum";
import { getAssessment } from "@/lib/academy/assessments";
import { fullFormatProblems } from "@/lib/academy/format";
import type { Block } from "@/lib/academy/types";

/** Track 7 (Technical Analysis): the extra rules from its brief. */
const TA = lessonsOfTrack("technical-analysis");
const walk = (bs: readonly Block[]): Block[] => bs.flatMap((b) => (b.kind === "deeper" ? [b, ...walk(b.blocks)] : [b]));
const blocks = (id: string): Block[] => walk(TA.find((l) => l.id === id)!.sections.flatMap((s) => s.blocks));
const widgetsOf = (id: string) => blocks(id).flatMap((b) => (b.kind === "interactive" ? [b.widget as string] : []));
const text = (id: string) => JSON.stringify(TA.find((l) => l.id === id)).toLowerCase();

describe("technical analysis track", () => {
  it("needs Chart Reading first", () => {
    expect(getTrack("technical-analysis")!.prerequisites).toEqual(["chart-reading"]);
  });

  it("has twelve full-format lessons that pass the A–L check", () => {
    expect(TA).toHaveLength(12);
    for (const l of TA) expect(fullFormatProblems(l), l.id).toEqual([]);
  });

  it("every lesson has an interactive tool, a labelled diagram and an exercise", () => {
    for (const l of TA) {
      const ws = widgetsOf(l.id);
      expect(ws.some((w) => w.startsWith("ta-") && !w.startsWith("ta-fig-")), l.id).toBe(true);
      expect(ws.some((w) => w.startsWith("ta-fig-")), l.id).toBe(true);
      expect(l.exercise, l.id).toBeTruthy();
    }
  });

  it("the indicator lab is in lesson 1", () => {
    expect(TA[0].id).toBe("ta-moving-averages");
    expect(widgetsOf("ta-moving-averages")).toContain("ta-lab");
  });

  it("every research item is verified and links its source", () => {
    const items = TA.flatMap((l) => blocks(l.id)).flatMap((b) => (b.kind === "research" ? [b.research] : []));
    expect(items.length).toBeGreaterThanOrEqual(8);
    for (const r of items) {
      expect(r.verified, r.title).toBe(true);
      expect(r.url, r.title).toMatch(/^https:\/\//);
      expect(`${r.findings} ${r.practicalMeaning}`).not.toMatch(/\b(proves?|guarantee[sd]?)\b/i);
    }
  });

  it("every indicator lesson says what the indicator does NOT tell you", () => {
    for (const l of TA) expect(text(l.id), l.id).toMatch(/(does|do) not tell you/);
  });

  it("covers the topics in the brief", () => {
    expect(text("ta-moving-averages")).toMatch(/crossover/);
    expect(text("ta-rsi")).toMatch(/wilder/);
    expect(text("ta-bands-atr")).toMatch(/true range/);
    expect(text("ta-volume-indicators")).toMatch(/vwap/);
    expect(text("ta-volume-indicators")).toMatch(/obv|on-balance/);
    expect(text("ta-trendlines")).toMatch(/channel/);
    for (const p of [/head and shoulders/, /double top/, /triangle/, /flag/]) expect(text("ta-chart-patterns")).toMatch(p);
    expect(text("ta-fibonacci")).toMatch(/made-up/);
    expect(text("ta-confluence")).toMatch(/redundan/);
    expect(text("ta-testable-rules")).toMatch(/overfit/);
    expect(text("ta-testable-rules")).toMatch(/look-ahead/);
    expect(text("ta-testable-rules")).toMatch(/out-of-sample/);
  });

  it("the assessment makes overfitting and backtest validity safety-critical, with enough questions and remediation", () => {
    const a = getAssessment("technical-analysis")!;
    expect(a.concepts.filter((c) => c.safetyCritical).map((c) => c.id).sort()).toEqual(["ta-backtest-validity", "ta-overfitting"]);
    expect(a.concepts.some((c) => c.applied)).toBe(true);
    expect(a.concepts.some((c) => !c.critical && !c.safetyCritical && !c.applied)).toBe(true);
    for (const c of a.concepts) {
      expect(a.questions.filter((q) => q.concept === c.id).length, c.id).toBeGreaterThanOrEqual(4);
      expect(1 + (c.moreRemediation?.length ?? 0), c.id).toBeGreaterThanOrEqual(2);
    }
  });
});
