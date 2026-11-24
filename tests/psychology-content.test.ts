import { describe, expect, it } from "vitest";
import { getTrack, lessonsOfTrack } from "@/lib/academy/curriculum";
import { getAssessment } from "@/lib/academy/assessments";
import { fullFormatProblems } from "@/lib/academy/format";
import type { Block } from "@/lib/academy/types";

/** Track 9 (Trading Psychology): the extra rules from its brief. */
const PSY = lessonsOfTrack("trading-psychology");
const walk = (bs: readonly Block[]): Block[] => bs.flatMap((b) => (b.kind === "deeper" ? [b, ...walk(b.blocks)] : [b]));
const blocks = (id: string): Block[] => walk(PSY.find((l) => l.id === id)!.sections.flatMap((s) => s.blocks));
const widgetsOf = (id: string) => blocks(id).flatMap((b) => (b.kind === "interactive" ? [b.widget as string] : []));
const text = (id: string) => JSON.stringify(PSY.find((l) => l.id === id)).toLowerCase();
const research = () => PSY.flatMap((l) => blocks(l.id)).flatMap((b) => (b.kind === "research" ? [b.research] : []));

describe("trading psychology track", () => {
  it("needs Risk Management first", () => {
    expect(getTrack("trading-psychology")!.prerequisites).toEqual(["risk-management"]);
  });

  it("has twelve full-format lessons that pass the A–L check", () => {
    expect(PSY).toHaveLength(12);
    for (const l of PSY) expect(fullFormatProblems(l), l.id).toEqual([]);
  });

  it("every lesson has an interactive tool, a labelled diagram and an exercise", () => {
    for (const l of PSY) {
      const ws = widgetsOf(l.id);
      expect(ws.some((w) => w.startsWith("psy-") && !w.startsWith("psy-fig-")), l.id).toBe(true);
      expect(ws.some((w) => w.startsWith("psy-fig-")), l.id).toBe(true);
      expect(l.exercise, l.id).toBeTruthy();
    }
  });

  it("the six tools from the brief are placed in their lessons", () => {
    expect(widgetsOf("psy-biases")).toContain("psy-bias-trainer");
    expect(widgetsOf("psy-variance")).toContain("psy-edge-sim");
    expect(widgetsOf("psy-randomness")).toContain("psy-streaks");
    expect(widgetsOf("psy-outcome-bias")).toContain("psy-outcome-sorter");
    expect(widgetsOf("psy-checklists-journal")).toContain("psy-checklist");
    expect(widgetsOf("psy-tilt-stress")).toContain("psy-tilt-check");
    expect(widgetsOf("psy-trading-plan")).toContain("psy-plan");
  });

  it("every research item links its source, is verified, and does not overclaim", () => {
    const items = research();
    expect(items.length).toBeGreaterThanOrEqual(12);
    for (const r of items) {
      expect(r.verified, r.title).toBe(true);
      expect(r.url, r.title).toMatch(/^https:\/\//);
      expect(`${r.findings} ${r.practicalMeaning}`).not.toMatch(/\b(proves?|guarantee[sd]?)\b/i);
    }
    // Non-peer-reviewed sources (a regulator's release, a working paper) say so.
    for (const r of items.filter((x) => !x.peerReviewed)) expect(`${r.venue} ${r.limitations}`.toLowerCase(), r.title).toMatch(/working paper|press release|not peer reviewed/);
  });

  it("marks contested findings as disputed, not settled", () => {
    const byTitle = (t: RegExp) => research().find((r) => t.test(r.title))!;
    expect(byTitle(/ego-depletion/).status).toBe("disputed");
    expect(byTitle(/hot hand in basketball/i).status).toBe("disputed");
    expect(byTitle(/loss of loss aversion/i).status).toBe("disputed");
    expect(byTitle(/cumulative representation/i).status).toBe("disputed");
    expect(text("psy-tilt-stress")).toMatch(/contested/);
    expect(text("psy-randomness")).toMatch(/contested/);
    expect(text("psy-prospect-theory")).toMatch(/debated/);
    // Ego depletion is never presented as settled.
    for (const l of PSY) expect(text(l.id), l.id).not.toMatch(/ego depletion (is|has been) (proven|established|settled)/);
  });

  it("covers the topics in the brief", () => {
    expect(text("psy-prospect-theory")).toMatch(/loss aversion/);
    expect(text("psy-prospect-theory")).toMatch(/prospect theory/);
    expect(text("psy-disposition")).toMatch(/disposition effect/);
    expect(text("psy-overconfidence")).toMatch(/overconfidence/);
    expect(text("psy-overconfidence")).toMatch(/overtrading/);
    for (const t of [/hindsight/, /confirmation/, /recency/]) expect(text("psy-biases")).toMatch(t);
    expect(text("psy-randomness")).toMatch(/gambler's fallacy/);
    expect(text("psy-randomness")).toMatch(/hot hand/);
    expect(text("psy-variance")).toMatch(/losing streak/);
    expect(text("psy-outcome-bias")).toMatch(/outcome bias/);
    expect(text("psy-fomo-revenge")).toMatch(/fomo/);
    expect(text("psy-fomo-revenge")).toMatch(/revenge trading/);
    expect(text("psy-fomo-revenge")).toMatch(/daily loss stop/);
    for (const t of [/tilt/, /emotional regulation/, /stress/, /sleep/]) expect(text("psy-tilt-stress")).toMatch(t);
    expect(text("psy-checklists-journal")).toMatch(/checklist/);
    expect(text("psy-checklists-journal")).toMatch(/journal/);
    expect(text("psy-checklists-journal")).toMatch(/process/);
    expect(text("psy-expectations")).toMatch(/74–89%/);
    expect(text("psy-trading-plan")).toMatch(/trading plan/);
  });

  it("labels the tilt check as a reflection, not a diagnosis, and local saving as browser-only", () => {
    expect(text("psy-tilt-stress")).toMatch(/not a diagnosis/);
    expect(text("psy-checklists-journal")).toMatch(/saved only in this browser/);
    expect(text("psy-trading-plan")).toMatch(/saved only in this browser/);
  });

  it("the assessment makes outcome bias, revenge trading and the daily loss stop safety-critical, with enough questions and remediation", () => {
    const a = getAssessment("trading-psychology")!;
    expect(a.concepts.filter((c) => c.safetyCritical).map((c) => c.id).sort()).toEqual(["psy-daily-stop", "psy-outcome-bias", "psy-revenge"]);
    expect(a.concepts.some((c) => c.applied)).toBe(true);
    expect(a.concepts.some((c) => !c.critical && !c.safetyCritical && !c.applied)).toBe(true);
    for (const c of a.concepts) {
      expect(a.questions.filter((q) => q.concept === c.id).length, c.id).toBeGreaterThanOrEqual(4);
      expect(1 + (c.moreRemediation?.length ?? 0), c.id).toBeGreaterThanOrEqual(2);
    }
  });
});
