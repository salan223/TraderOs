import { describe, expect, it } from "vitest";
import { getTrack, lessonsOfTrack } from "@/lib/academy/curriculum";
import { getAssessment } from "@/lib/academy/assessments";
import { fullFormatProblems } from "@/lib/academy/format";
import type { Block } from "@/lib/academy/types";

/** Track 8 (Risk Management): the extra rules from its brief. */
const RM = lessonsOfTrack("risk-management");
const blocks = (id: string): Block[] => RM.find((l) => l.id === id)!.sections.flatMap((s) => s.blocks);
const text = (id: string) => JSON.stringify(RM.find((l) => l.id === id)).toLowerCase();

describe("risk management track", () => {
  it("needs Market Foundations and Forex Foundations first", () => {
    expect(getTrack("risk-management")!.prerequisites).toEqual(["market-foundations", "forex-foundations"]);
  });

  it("has ten full-format lessons that pass the A–L check", () => {
    expect(RM).toHaveLength(10);
    for (const l of RM) expect(fullFormatProblems(l), l.id).toEqual([]);
  });

  it("every lesson has an interactive tool (rm-*) and an advanced-concept card", () => {
    for (const l of RM) {
      const bs = blocks(l.id);
      expect(bs.some((b) => b.kind === "interactive" && b.widget.startsWith("rm-")), l.id).toBe(true);
      expect(bs.some((b) => b.kind === "concept-card"), l.id).toBe(true);
    }
  });

  it("the five required tools are in the lessons that teach them", () => {
    const widgetsOf = (id: string) => blocks(id).flatMap((b) => (b.kind === "interactive" ? [b.widget] : []));
    expect(widgetsOf("rm-position-sizing")).toContain("rm-position-size");
    expect(widgetsOf("rm-risk-reward")).toContain("rm-expectancy");
    expect(widgetsOf("rm-drawdowns")).toContain("rm-drawdown");
    expect(widgetsOf("rm-leverage-margin")).toContain("rm-leverage");
    expect(widgetsOf("rm-risk-of-ruin")).toContain("rm-monte-carlo");
  });

  it("every research item is verified, links its source and avoids certainty", () => {
    const items = RM.flatMap((l) => blocks(l.id)).flatMap((b) => (b.kind === "research" ? [b.research] : []));
    expect(items.length).toBeGreaterThanOrEqual(8);
    for (const r of items) {
      expect(r.verified, r.title).toBe(true);
      expect(r.url, r.title).toMatch(/^https:\/\//);
      expect(`${r.findings} ${r.practicalMeaning}`).not.toMatch(/\b(proves?|guarantee[sd]?)\b/i);
    }
  });

  it("covers the topics in the brief", () => {
    expect(text("rm-position-sizing")).toMatch(/cross/);
    expect(text("rm-position-sizing")).toMatch(/futures/);
    expect(text("rm-stop-placement")).toMatch(/structure stop/);
    expect(text("rm-stop-placement")).toMatch(/atr/);
    expect(text("rm-correlation-heat")).toMatch(/portfolio heat/);
    expect(text("rm-gaps-limits")).toMatch(/slippage/);
    expect(text("rm-gaps-limits")).toMatch(/daily loss limit/);
    expect(text("rm-averaging-down")).toMatch(/martingale/);
    expect(text("rm-risk-of-ruin")).toMatch(/fixed fractional|fixed-fractional/);
    expect(text("rm-risk-of-ruin")).toMatch(/fixed dollar|fixed-dollar/);
  });

  it("the assessment makes risk, sizing, stops, leverage and gap risk safety-critical, with enough questions and remediation", () => {
    const a = getAssessment("risk-management")!;
    expect(a.concepts.filter((c) => c.safetyCritical).map((c) => c.id).sort()).toEqual(["rm-gaps-limits", "rm-leverage", "rm-risk-per-trade", "rm-sizing", "rm-stops"]);
    expect(a.concepts.some((c) => c.applied)).toBe(true);
    for (const c of a.concepts) {
      expect(a.questions.filter((q) => q.concept === c.id).length, c.id).toBeGreaterThanOrEqual(4);
      expect(1 + (c.moreRemediation?.length ?? 0), c.id).toBeGreaterThanOrEqual(2);
    }
  });
});
