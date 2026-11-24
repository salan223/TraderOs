import { describe, expect, it } from "vitest";
import { lessonsOfTrack } from "@/lib/academy/curriculum";
import { getAssessment } from "@/lib/academy/assessments";
import { fullFormatProblems } from "@/lib/academy/format";
import type { Block } from "@/lib/academy/types";

/** Track 6 (Chart Reading): the extra rules from its brief. */
const CR = lessonsOfTrack("chart-reading");
const blocks = (id: string): Block[] => CR.find((l) => l.id === id)!.sections.flatMap((s) => s.blocks);

describe("chart reading track", () => {
  it("has twelve full-format lessons that pass the A–L check", () => {
    expect(CR).toHaveLength(12);
    for (const l of CR) expect(fullFormatProblems(l), l.id).toEqual([]);
  });

  it("every lesson has an interactive chart widget (cr-*) and an advanced-concept card", () => {
    for (const l of CR) {
      const bs = blocks(l.id);
      expect(bs.some((b) => b.kind === "interactive" && b.widget.startsWith("cr-")), l.id).toBe(true);
      expect(bs.some((b) => b.kind === "concept-card"), l.id).toBe(true);
    }
  });

  it("every research item is verified, links its source and avoids certainty", () => {
    const items = CR.flatMap((l) => blocks(l.id)).flatMap((b) => (b.kind === "research" ? [b.research] : []));
    expect(items.length).toBeGreaterThanOrEqual(7);
    for (const r of items) {
      expect(r.verified, r.title).toBe(true);
      expect(r.url, r.title).toMatch(/^https:\/\//);
      expect(`${r.findings} ${r.practicalMeaning}`).not.toMatch(/\b(proves?|guarantee[sd]?)\b/i);
    }
  });

  it("covers the sixteen candlestick patterns by name in lesson 4", () => {
    const text = JSON.stringify(blocks("cr-candle-patterns")).toLowerCase();
    for (const p of ["hammer", "shooting star", "hanging man", "inverted hammer", "engulfing", "harami", "doji", "marubozu", "pin bar", "inside bar", "outside bar", "morning star", "evening star", "three white soldiers", "three black crows"]) {
      expect(text, p).toContain(p);
    }
  });

  it("the practical exam includes annotation, reasoning choices and a written answer with a model to compare", () => {
    const kinds = blocks("cr-practical-exam").map((b) => (b.kind === "interaction" ? b.interaction.kind : b.kind === "interactive" ? b.widget : b.kind));
    for (const k of ["cr-exam", "chart-annotate", "scenario", "multi-select", "reveal"]) expect(kinds, k).toContain(k);
  });

  it("the track assessment marks gap risk to stops as safety-critical and has an applied concept", () => {
    const a = getAssessment("chart-reading")!;
    expect(a.concepts.filter((c) => c.safetyCritical).map((c) => c.id)).toEqual(["cr-gap-stops"]);
    expect(a.concepts.some((c) => c.applied)).toBe(true);
    for (const c of a.concepts) expect(a.questions.filter((q) => q.concept === c.id).length, c.id).toBeGreaterThanOrEqual(4);
  });
});
