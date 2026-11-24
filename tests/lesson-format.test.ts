import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { LESSONS } from "@/lib/academy/curriculum";
import { fullFormatProblems } from "@/lib/academy/format";
import { blockTexts } from "@/lib/academy/text";
import type { ConceptCard, Lesson, ResearchItem } from "@/lib/academy/types";
import { ConceptCardView, LESSON_PARTS, ResearchCard } from "@/components/academy/lesson-format";

const research: ResearchItem = {
  title: "An example study title", authors: "A. Author and B. Author", year: 2001, venue: "Example Journal", peerReviewed: false,
  question: "Q", methodology: "M", data: "D", findings: "F", limitations: "L", practicalMeaning: "P", status: "disputed", verified: false,
};
const card: ConceptCard = {
  name: "Example concept", what: "w", whyItExists: "y", problemSolved: "p", mechanics: "m", math: "x = y", howTradersUseIt: "h",
  whenUseful: "u", whenItFails: "f", limitations: "l", misconceptions: "c", realExample: "r", exercise: "e", practicalTest: "t",
};

/** A minimal lesson in the full A–L format (a test fixture, not real content). */
function fixture(): Lesson {
  const base = LESSONS[0];
  const sec = (id: string, part: Lesson["sections"][number]["part"], blocks: Lesson["sections"][number]["blocks"]) => ({ id, heading: id, part, blocks });
  return {
    ...base,
    id: "fixture",
    format: "full",
    sections: [
      sec("why", "why", [{ kind: "p", text: "Why." }]),
      sec("beginner", "beginner", [{ kind: "p", text: "Simply." }]),
      sec("visual", "visual", [{ kind: "interaction", id: "fx", title: "Try", interaction: { kind: "reveal", prompt: "Think", label: "Show", content: "Answer" } }]),
      sec("example", "example", [{ kind: "p", text: "Example." }]),
      sec("deep-dive", "deep-dive", [{ kind: "concept-card", card }, { kind: "research", research: { ...research, url: "https://example.org/paper" } }]),
      sec("pros", "professionals", [{ kind: "methodologies", items: [{ name: "One school", view: "v1" }, { name: "Another", view: "v2" }] }]),
      sec("mistakes", "mistakes", [{ kind: "mistakes", items: [{ mistake: "m", why: "w", instead: "i" }] }]),
      sec("summary", "summary", [{ kind: "summary", keyConcepts: ["k"], equations: [{ label: "E", formula: "a = b" }], implications: ["i"] }]),
    ],
  };
}

describe("full lesson format (A–L)", () => {
  it("lists twelve parts, A to L", () => {
    expect(LESSON_PARTS.map((p) => p.letter).join("")).toBe("ABCDEFGHIJKL");
  });

  it("a complete fixture passes the format check", () => {
    expect(fullFormatProblems(fixture())).toEqual([]);
  });

  it("reports missing parts and weak parts", () => {
    const l = fixture();
    l.sections = l.sections.filter((s) => s.part !== "mistakes").map((s) => (s.part === "professionals" ? { ...s, blocks: [{ kind: "methodologies" as const, items: [{ name: "Only one", view: "v" }] }] } : s));
    const p = fullFormatProblems(l);
    expect(p).toContain("missing part: mistakes");
    expect(p).toContain("G: needs at least two methodologies");
  });

  it("every lesson that declares the full format conforms; older lessons are left as written", () => {
    for (const l of LESSONS) if (l.format === "full") expect(fullFormatProblems(l), l.id).toEqual([]);
    // Tracks 1–3 predate the format and are not force-retrofitted.
    const OLD = ["market-foundations", "forex-foundations", "stocks-indices"];
    expect(LESSONS.filter((l) => OLD.includes(l.trackId) && l.format === "full")).toEqual([]);
    // Track 6 (Chart Reading) is the first track written in the full format, and Track 8 (Risk Management) follows it: every lesson declares it.
    const cr = LESSONS.filter((l) => l.trackId === "chart-reading");
    expect(cr).toHaveLength(12);
    for (const l of cr) expect(l.format, l.id).toBe("full");
    const rm = LESSONS.filter((l) => l.trackId === "risk-management");
    expect(rm).toHaveLength(10);
    for (const l of rm) expect(l.format, l.id).toBe("full");
    // Track 7 (Technical Analysis) is written in the full format too.
    const ta = LESSONS.filter((l) => l.trackId === "technical-analysis");
    expect(ta).toHaveLength(12);
    for (const l of ta) expect(l.format, l.id).toBe("full");
    // Track 13 (Market Structure) too.
    const ms = LESSONS.filter((l) => l.trackId === "market-structure");
    expect(ms).toHaveLength(11);
    for (const l of ms) expect(l.format, l.id).toBe("full");
    // Track 9 (Trading Psychology) too.
    const psy = LESSONS.filter((l) => l.trackId === "trading-psychology");
    expect(psy).toHaveLength(12);
    for (const l of psy) expect(l.format, l.id).toBe("full");
    // Track 10 (Strategy Development) too.
    const strat = LESSONS.filter((l) => l.trackId === "strategy-development");
    expect(strat).toHaveLength(12);
    for (const l of strat) expect(l.format, l.id).toBe("full");
    // Track 11 (Backtesting) too.
    const bt = LESSONS.filter((l) => l.trackId === "backtesting");
    expect(bt).toHaveLength(13);
    for (const l of bt) expect(l.format, l.id).toBe("full");
    // Track 12 (Macro and News) too.
    const mn = LESSONS.filter((l) => l.trackId === "macro-news");
    expect(mn).toHaveLength(13);
    for (const l of mn) expect(l.format, l.id).toBe("full");
  });

  it("text helpers cover the new block kinds (so glossary and wording checks see them)", () => {
    const texts = fixture().sections.flatMap((s) => s.blocks.flatMap(blockTexts));
    for (const t of ["Answer", "x = y", "One school", "a = b", "An example study title"]) expect(texts).toContain(t);
  });
});

describe("research and concept cards render", () => {
  it("an unverified research item is clearly labelled Unverified", () => {
    const html = renderToStaticMarkup(createElement(ResearchCard, { r: research }));
    expect(html).toMatch(/Unverified/);
    expect(html).toMatch(/not yet been checked against the original source/);
    expect(html).toMatch(/Working paper \(not peer-reviewed\)/);
    expect(html).toMatch(/Disputed/);
    expect(html).not.toMatch(/>Verified</);
  });

  it("a verified, peer-reviewed item says so, with its status and source link", () => {
    const html = renderToStaticMarkup(createElement(ResearchCard, { r: { ...research, verified: true, peerReviewed: true, status: "replicated", url: "https://example.org/x" } }));
    expect(html).toMatch(/Verified/);
    expect(html).not.toMatch(/Unverified/);
    expect(html).toMatch(/Peer-reviewed/);
    expect(html).toMatch(/Replicated/);
    expect(html).toMatch(/href="https:\/\/example.org\/x"/);
  });

  it("a concept card shows all 13 fields", () => {
    const html = renderToStaticMarkup(createElement(ConceptCardView, { card }));
    for (const label of ["What it is", "Why it exists", "The problem it solves", "How it works", "The maths", "How traders use it", "When it is useful", "When it fails", "Limitations", "Common misconceptions", "A real example", "Exercise", "Practical test"]) {
      expect(html, label).toContain(label);
    }
  });
});
