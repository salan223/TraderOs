import { describe, expect, it } from "vitest";
import { ASSESSMENTS, getAssessment } from "@/lib/academy/assessments";
import { LESSONS, TRACKS, getLesson } from "@/lib/academy/curriculum";
import { getGlossaryEntry } from "@/lib/academy/glossary";
import { correctAnswer, gradeItem } from "@/lib/academy/interactions";
import { termIdsIn } from "@/lib/academy/rich";
import { conceptTexts, questionTexts } from "@/lib/academy/text";
import type { ChoiceOption, GradedItem, TrackAssessment } from "@/lib/academy/types";

const BANKS: TrackAssessment[] = Object.values(ASSESSMENTS);
const ALL_QUESTIONS = BANKS.flatMap((b) => b.questions);
/** Every remediation variant of a concept (the first is `remediation`). */
const variantsOf = (c: TrackAssessment["concepts"][number]) => [c.remediation, ...(c.moreRemediation ?? [])];
/** Practice questions used in remediation, every variant (never in the assessment itself). */
const ALL_PRACTICE = BANKS.flatMap((b) => b.concepts.flatMap((c) => variantsOf(c).map((r) => r.practice)));
/** Every bank must give each concept at least this many questions: three retests in a row then draw unseen ones. */
const MIN_QUESTIONS_PER_CONCEPT = 4;
const ALL_ITEMS: GradedItem[] = [...ALL_QUESTIONS.map((q) => q.item), ...ALL_PRACTICE];
const SAFETY_TOPICS = /leverage|margin|sizing|stop|futures|risk|backtest/i;

function optionsOf(i: GradedItem): ChoiceOption[] | null {
  return i.kind === "single" || i.kind === "multi-select" || i.kind === "scenario" ? i.options : null;
}

describe("assessment banks: coverage", () => {
  it("every written track has an assessment, and only written tracks do", () => {
    for (const t of TRACKS) expect(!!getAssessment(t.id), t.id).toBe(t.status === "written");
  });

  it("ids are unique across all banks (questions and concepts)", () => {
    const q = ALL_QUESTIONS.map((x) => x.id);
    expect(new Set(q).size).toBe(q.length);
    const c = BANKS.flatMap((b) => b.concepts.map((x) => x.id));
    expect(new Set(c).size).toBe(c.length);
  });

  for (const bank of BANKS) {
    describe(bank.trackId, () => {
      it(`every concept has at least ${MIN_QUESTIONS_PER_CONCEPT} questions, so retests use different ones (applies to every future track too)`, () => {
        for (const c of bank.concepts) expect(bank.questions.filter((q) => q.concept === c.id).length, c.id).toBeGreaterThanOrEqual(MIN_QUESTIONS_PER_CONCEPT);
      });
      it("no two questions of a concept are copies (different prompt or statement, and different item)", () => {
        for (const c of bank.concepts) {
          const qs = bank.questions.filter((q) => q.concept === c.id);
          const prompts = qs.map((q) => JSON.stringify(questionTexts(q).slice(1, 3)));
          expect(new Set(prompts).size, c.id).toBe(qs.length);
          expect(new Set(qs.map((q) => JSON.stringify(q.item))).size, c.id).toBe(qs.length);
        }
      });
      it("every question belongs to a concept of this bank", () => {
        const ids = new Set(bank.concepts.map((c) => c.id));
        for (const q of bank.questions) expect(ids.has(q.concept), q.id).toBe(true);
      });
      it("has an applied scenario concept whose questions are all scenarios", () => {
        const applied = bank.concepts.filter((c) => c.applied);
        expect(applied.length).toBeGreaterThanOrEqual(1);
        for (const c of applied) for (const q of bank.questions.filter((x) => x.concept === c.id)) expect(q.item.kind, q.id).toBe("scenario");
      });
      it("mixes knowledge, applied and calculation questions", () => {
        expect(new Set(bank.questions.map((q) => q.type))).toEqual(new Set(["knowledge", "applied", "calculation"]));
      });
      it("every concept links to real lessons of this track", () => {
        for (const c of bank.concepts) {
          expect(c.lessonIds.length, c.id).toBeGreaterThan(0);
          for (const id of c.lessonIds) expect(getLesson(id)?.trackId, `${c.id} → ${id}`).toBe(bank.trackId);
        }
      });
      it("every lesson of the track is covered by at least one concept", () => {
        const covered = new Set(bank.concepts.flatMap((c) => c.lessonIds));
        for (const l of LESSONS.filter((x) => x.trackId === bank.trackId)) expect(covered.has(l.id), l.id).toBe(true);
      });
      it("remediation is complete for every concept, in at least two different variants", () => {
        for (const c of bank.concepts) {
          const vs = variantsOf(c);
          expect(vs.length, c.id).toBeGreaterThanOrEqual(2);
          for (const r of vs) {
            expect(r.misconception.length, c.id).toBeGreaterThan(40);
            expect(r.altExplanation.length, c.id).toBeGreaterThan(80);
            expect(r.altExample.length, c.id).toBeGreaterThan(60);
            expect(r.practice, c.id).toBeDefined();
          }
          for (const k of ["misconception", "altExplanation", "altExample", "practice"] as const) {
            expect(new Set(vs.map((r) => JSON.stringify(r[k]))).size, `${c.id} ${k}`).toBe(vs.length);
          }
          expect(c.flashcard.front.length && c.flashcard.back.length, c.id).toBeTruthy();
        }
      });
      it("no remediation example solves its own practice question (answer or the same numbers)", () => {
        // Heuristic: the "A different example" text must not contain the practice question's numeric
        // answer, nor every number of the practice prompt (two or more), so it teaches the method
        // without giving the answer away.
        const nums = (t: string) => new Set((t.replace(/−/g, "-").match(/-?\d[\d,]*(?:\.\d+)?/g) ?? []).map((x) => Math.round(Number(x.replace(/,/g, "")) * 1e6) / 1e6));
        for (const c of bank.concepts) {
          variantsOf(c).forEach((r, i) => {
            const ex = nums(r.altExample);
            const p = r.practice;
            const promptText = p.kind === "true-false" ? p.statement : p.kind === "scenario" ? `${p.situation} ${p.question}` : "prompt" in p ? String(p.prompt) : "";
            const pn = [...nums(promptText)];
            if (pn.length >= 2) expect(pn.every((n) => ex.has(n)), `${c.id} R${i}: example uses the practice question's exact numbers ${pn.join(", ")}`).toBe(false);
            if (p.kind === "numeric") expect(ex.has(Math.round(Math.abs(p.answer) * 1e6) / 1e6) || ex.has(Math.round(p.answer * 1e6) / 1e6), `${c.id} R${i}: example contains the practice answer ${p.answer}`).toBe(false);
          });
        }
      });
      it("practice questions (every variant) are not reused from the assessment pool", () => {
        const pool = new Set(bank.questions.map((q) => JSON.stringify(q.item)));
        for (const c of bank.concepts) for (const r of variantsOf(c)) expect(pool.has(JSON.stringify(r.practice)), c.id).toBe(false);
      });
    });
  }

  it("safety-critical concepts are exactly the risk topics, and each is critical", () => {
    const fx = getAssessment("forex-foundations")!;
    const safetyFx = fx.concepts.filter((c) => c.safetyCritical).map((c) => c.id).sort();
    // The coordinator's brief: leverage and margin questions in track 2 are safety-critical.
    expect(safetyFx).toEqual(["fx-leverage", "fx-margin", "fx-margin-call", "fx-sizing"]);
    for (const b of BANKS) for (const c of b.concepts.filter((x) => x.safetyCritical)) {
      expect(c.critical, c.id).toBe(true);
      expect(SAFETY_TOPICS.test(c.title), `${c.id}: "${c.title}" should be a risk topic`).toBe(true);
    }
    // Every bank has at least one safety-critical concept with ≥2 questions.
    for (const b of BANKS) expect(b.concepts.some((c) => c.safetyCritical && b.questions.filter((q) => q.concept === c.id).length >= 2), b.trackId).toBe(true);
  });
});

describe("assessment items: well formed", () => {
  it("every choice item has unique option ids and an explanation on every option", () => {
    for (const i of ALL_ITEMS) {
      const opts = optionsOf(i);
      if (!opts) continue;
      const ids = opts.map((o) => o.id);
      expect(new Set(ids).size).toBe(ids.length);
      for (const o of opts) expect(o.explain.trim().length, o.text).toBeGreaterThan(10);
    }
  });

  it("single choice: exactly one correct option, and 4 options", () => {
    for (const i of ALL_ITEMS) if (i.kind === "single") {
      expect(i.options.filter((o) => o.id === i.correct), i.prompt).toHaveLength(1);
      expect(i.options, i.prompt).toHaveLength(4);
    }
  });

  it("multi-select: a defined answer set of at least one, but not every, option", () => {
    for (const i of ALL_ITEMS) if (i.kind === "multi-select") {
      const ids = new Set(i.options.map((o) => o.id));
      expect(i.correct.length).toBeGreaterThan(0);
      expect(i.correct.length).toBeLessThan(i.options.length);
      for (const c of i.correct) expect(ids.has(c)).toBe(true);
      expect(new Set(i.correct).size).toBe(i.correct.length);
    }
  });

  it("scenario: exactly one sound option, at least one unsound, and every option explained", () => {
    for (const i of ALL_ITEMS) if (i.kind === "scenario") {
      expect(i.options.filter((o) => o.process === "sound"), i.situation).toHaveLength(1);
      expect(i.options.some((o) => o.process === "unsound"), i.situation).toBe(true);
    }
  });

  it("find-error: at least one wrong line and at least one fine line", () => {
    for (const i of ALL_ITEMS) if (i.kind === "find-error") {
      expect(i.lines.some((l) => l.error)).toBe(true);
      expect(i.lines.some((l) => !l.error)).toBe(true);
    }
  });

  it("numeric: finite answers and non-negative tolerances smaller than the answer's size", () => {
    for (const i of ALL_ITEMS) if (i.kind === "numeric") {
      expect(Number.isFinite(i.answer)).toBe(true);
      expect(i.tolerance).toBeGreaterThanOrEqual(0);
      if (i.answer !== 0) expect(i.tolerance, i.prompt).toBeLessThan(Math.abs(i.answer) * 0.05);
    }
  });

  it("chart annotation: the target sits inside the plotted range, labelled as illustrative", () => {
    for (const i of ALL_ITEMS) if (i.kind === "chart-annotate") {
      expect(i.prompt).toMatch(/illustrative/i);
      if (i.target.mode === "level") {
        const span = Math.max(...i.series) - Math.min(...i.series);
        expect(i.target.value).toBeGreaterThan(Math.min(...i.series) - span * 0.25);
        expect(i.target.value).toBeLessThan(Math.max(...i.series) + span * 0.25);
      } else {
        expect(Number.isInteger(i.target.value) && i.target.value >= 0 && i.target.value < i.series.length).toBe(true);
      }
    }
  });

  it("the grader accepts each item's own correct answer", () => {
    for (const i of ALL_ITEMS) expect(gradeItem(i, correctAnswer(i)).correct).toBe(true);
  });

  it("every question has an explanation", () => {
    for (const q of ALL_QUESTIONS) expect(q.explanation.trim().length, q.id).toBeGreaterThan(30);
  });

  it("every glossary link in assessment text points to a real term", () => {
    const texts = [...ALL_QUESTIONS.flatMap(questionTexts), ...BANKS.flatMap((b) => b.concepts.flatMap(conceptTexts))];
    for (const t of texts) for (const id of termIdsIn(t)) expect(getGlossaryEntry(id), id).toBeDefined();
  });
});

describe("assessment items: bias guards", () => {
  const choice = ALL_ITEMS.filter((i): i is Extract<GradedItem, { kind: "single" | "scenario" }> => i.kind === "single" || i.kind === "scenario");
  const correctOf = (i: (typeof choice)[number]) => (i.kind === "single" ? i.correct : i.options.find((o) => o.process === "sound")!.id);

  it("the correct option is not usually the longest or the shortest", () => {
    let longest = 0, shortest = 0;
    for (const i of choice) {
      const lens = i.options.map((o) => o.text.length);
      const c = i.options.find((o) => o.id === correctOf(i))!.text.length;
      if (c === Math.max(...lens)) longest++;
      if (c === Math.min(...lens)) shortest++;
    }
    expect(longest / choice.length).toBeLessThanOrEqual(0.3);
    expect(shortest / choice.length).toBeLessThanOrEqual(0.3);
    // And not the reverse tell ("never the longest"): the correct option is sometimes the longest and sometimes the shortest.
    expect(longest / choice.length).toBeGreaterThanOrEqual(0.08);
    expect(shortest / choice.length).toBeGreaterThanOrEqual(0.08);
  });

  it("the correct option's position varies (stored order; the UI also shuffles)", () => {
    const positions = choice.map((i) => i.options.findIndex((o) => o.id === correctOf(i)));
    expect(new Set(positions).size).toBe(4);
    for (let p = 0; p < 4; p++) expect(positions.filter((x) => x === p).length / positions.length).toBeLessThanOrEqual(0.45);
  });

  it("multi-select answers do not always have the same number of right options", () => {
    const sizes = ALL_ITEMS.flatMap((i) => (i.kind === "multi-select" ? [i.correct.length] : []));
    expect(new Set(sizes).size).toBeGreaterThan(1);
  });

  it("true/false wording is not a giveaway: absolutes are not always false, hedges are not always true", () => {
    const ABS = /\b(always|never|guarantee[sd]?|cannot|can't|must|only|exactly|every|all|whenever)\b/i;
    const HEDGE = /\b(usually|often|tends?|can|may|might|typically|sometimes|likely|normally)\b/i;
    const tf = ALL_ITEMS.filter((i): i is Extract<GradedItem, { kind: "true-false" }> => i.kind === "true-false");
    const abs = tf.filter((i) => ABS.test(i.statement));
    const hedged = tf.filter((i) => HEDGE.test(i.statement) && !ABS.test(i.statement));
    expect(abs.length).toBeGreaterThanOrEqual(5);
    expect(hedged.length).toBeGreaterThanOrEqual(5);
    const absTrue = abs.filter((i) => i.answer).length / abs.length;
    const hedgedFalse = hedged.filter((i) => !i.answer).length / hedged.length;
    expect(absTrue, "share of absolute statements that are true").toBeGreaterThanOrEqual(0.3);
    expect(absTrue, "share of absolute statements that are true").toBeLessThanOrEqual(0.7);
    expect(hedgedFalse, "share of hedged statements that are false").toBeGreaterThanOrEqual(0.3);
    expect(hedgedFalse, "share of hedged statements that are false").toBeLessThanOrEqual(0.7);
  });

  it("true/false answers are balanced", () => {
    const tf = ALL_ITEMS.filter((i) => i.kind === "true-false");
    const t = tf.filter((i) => i.kind === "true-false" && i.answer).length;
    expect(t / tf.length).toBeGreaterThanOrEqual(0.25);
    expect(t / tf.length).toBeLessThanOrEqual(0.75);
  });
});
