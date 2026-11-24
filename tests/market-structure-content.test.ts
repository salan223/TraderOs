import { describe, expect, it } from "vitest";
import { getTrack, lessonsOfTrack } from "@/lib/academy/curriculum";
import { getAssessment } from "@/lib/academy/assessments";
import { fullFormatProblems } from "@/lib/academy/format";
import type { Block } from "@/lib/academy/types";

/** Track 13 (Market Structure): the extra rules from its brief. */
const MS = lessonsOfTrack("market-structure");
const walk = (bs: readonly Block[]): Block[] => bs.flatMap((b) => (b.kind === "deeper" ? [b, ...walk(b.blocks)] : [b]));
const blocks = (id: string): Block[] => walk(MS.find((l) => l.id === id)!.sections.flatMap((s) => s.blocks));
const widgetsOf = (id: string) => blocks(id).flatMap((b) => (b.kind === "interactive" ? [b.widget as string] : []));
const text = (id: string) => JSON.stringify(MS.find((l) => l.id === id)).toLowerCase();
const all = () => MS.map((l) => text(l.id)).join(" ");

describe("market structure track", () => {
  it("needs Stocks and Indices first", () => {
    expect(getTrack("market-structure")!.prerequisites).toEqual(["stocks-indices"]);
  });

  it("has eleven full-format lessons that pass the A–L check", () => {
    expect(MS).toHaveLength(11);
    for (const l of MS) expect(fullFormatProblems(l), l.id).toEqual([]);
  });

  it("every lesson has an interactive tool, a labelled diagram and an exercise", () => {
    for (const l of MS) {
      const ws = widgetsOf(l.id);
      expect(ws.some((w) => w.startsWith("ms-") && !w.startsWith("ms-fig-")), l.id).toBe(true);
      expect(ws.some((w) => w.startsWith("ms-fig-")), l.id).toBe(true);
      expect(l.exercise, l.id).toBeTruthy();
    }
  });

  it("the order book simulator is in the order book, order types, slippage and halts lessons", () => {
    expect(widgetsOf("ms-order-book")).toContain("ms-book");
    expect(widgetsOf("ms-order-types")).toContain("ms-book-types");
    expect(widgetsOf("ms-slippage-impact")).toContain("ms-book-slippage");
    expect(widgetsOf("ms-halts")).toContain("ms-book-thin");
  });

  it("every research item is verified and links its source", () => {
    const items = MS.flatMap((l) => blocks(l.id)).flatMap((b) => (b.kind === "research" ? [b.research] : []));
    expect(items.length).toBeGreaterThanOrEqual(8);
    for (const r of items) {
      expect(r.verified, r.title).toBe(true);
      expect(r.url, r.title).toMatch(/^https:\/\//);
      expect(`${r.findings} ${r.practicalMeaning}`).not.toMatch(/\b(proves?|guarantee[sd]?)\b/i);
    }
  });

  it("covers the topics in the brief", () => {
    expect(text("ms-venues")).toMatch(/otc|over the counter/);
    expect(text("ms-venues")).toMatch(/dealer/);
    expect(text("ms-market-makers")).toMatch(/adverse selection/);
    expect(text("ms-market-makers")).toMatch(/inventory/);
    expect(text("ms-order-book")).toMatch(/price-time priority/);
    expect(text("ms-order-book")).toMatch(/depth/);
    for (const t of [/market order/, /limit order/, /stop-limit/, /ioc|immediate or cancel/, /fok|fill or kill/, /iceberg/]) expect(text("ms-order-types")).toMatch(t);
    expect(text("ms-slippage-impact")).toMatch(/market impact/);
    expect(text("ms-auctions")).toMatch(/opening auction/);
    expect(text("ms-auctions")).toMatch(/closing auction/);
    expect(text("ms-fragmentation")).toMatch(/nbbo/);
    expect(text("ms-fragmentation")).toMatch(/best execution/);
    expect(text("ms-dark-pools")).toMatch(/dark pool/);
    expect(text("ms-hft")).toMatch(/latency/);
    expect(text("ms-retail-fills")).toMatch(/payment for order flow/);
    expect(text("ms-retail-fills")).toMatch(/wholesaler/);
    expect(text("ms-halts")).toMatch(/circuit breaker/);
    expect(text("ms-halts")).toMatch(/limit up-limit down/);
  });

  it("labels US specifics as US", () => {
    for (const id of ["ms-fragmentation", "ms-retail-fills", "ms-halts"]) expect(text(id), id).toMatch(/\bus\b/);
    expect(all()).toMatch(/nbbo in the us|us: regulation nms/);
  });

  it("the assessment makes order-type failure modes and slippage safety-critical, with enough questions and remediation", () => {
    const a = getAssessment("market-structure")!;
    expect(a.concepts.filter((c) => c.safetyCritical).map((c) => c.id).sort()).toEqual(["ms-order-types", "ms-slippage"]);
    expect(a.concepts.some((c) => c.applied)).toBe(true);
    expect(a.concepts.some((c) => !c.critical && !c.safetyCritical && !c.applied)).toBe(true);
    for (const c of a.concepts) {
      expect(a.questions.filter((q) => q.concept === c.id).length, c.id).toBeGreaterThanOrEqual(4);
      expect(1 + (c.moreRemediation?.length ?? 0), c.id).toBeGreaterThanOrEqual(2);
    }
  });
});
