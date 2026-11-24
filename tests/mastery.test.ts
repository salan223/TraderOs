import { describe, expect, it } from "vitest";
import { ASSESSMENT_PASS_PCT, assessmentState, gradeAttempt, scoreAttempt, selectQuestions } from "@/lib/academy/assessment";
import { getAssessment } from "@/lib/academy/assessments";
import { TRACKS, TRACK_DEFS, lessonsOfTrack } from "@/lib/academy/curriculum";
import { correctAnswer, gradeItem } from "@/lib/academy/interactions";
import { currentTrackId, overallProgressPct, recommendNextStep, topoOrder, trackProgress } from "@/lib/academy/mastery";
import {
  completeExercise,
  completeRemediation,
  emptyProgress,
  getAssessmentProgress,
  journeyStage,
  markSectionRead,
  mergeProgress,
  parseProgress,
  recordQuizAttempt,
  resetProgress,
  saveAssessmentAnswer,
  startAssessment,
  submitAssessment,
  summarize,
  type AssessmentItemResult,
  type ProgressState,
  type StoredAnswer,
} from "@/lib/academy/progress";
import type { TrackAssessment } from "@/lib/academy/types";

const NOW = new Date("2026-06-10T12:00:00Z");
const clock = { now: NOW, timeZone: "UTC" };
const at = (min: number) => new Date(NOW.getTime() - (24 * 60 - min) * 60_000); // earlier the same day/yesterday, before NOW
const MF = getAssessment("market-foundations")!;
const FX = getAssessment("forex-foundations")!;

function completeLessons(s: ProgressState, trackId: string, when: Date): ProgressState {
  for (const l of lessonsOfTrack(trackId)) {
    for (const sec of l.sections) s = markSectionRead(s, l.id, sec.id, when);
    s = completeExercise(s, l.id, when);
    s = recordQuizAttempt(s, l.id, 5, 5, when);
  }
  return s;
}

/** Answers for every question in `ids`: right, except for the ids in `wrong`. */
function answersFor(bank: TrackAssessment, ids: string[], wrong: string[] = []): Record<string, StoredAnswer> {
  const out: Record<string, StoredAnswer> = {};
  for (const id of ids) {
    const q = bank.questions.find((x) => x.id === id)!;
    const right = correctAnswer(q.item);
    out[id] = wrong.includes(id) ? wrongAnswer(q.item, right) : right;
  }
  return out;
}
function wrongAnswer(item: TrackAssessment["questions"][number]["item"], right: StoredAnswer): StoredAnswer {
  switch (item.kind) {
    case "single": return item.options.find((o) => o.id !== right)!.id;
    case "scenario": return item.options.find((o) => o.process === "unsound")!.id;
    case "true-false": return !right;
    case "numeric": return (right as number) + 1000;
    case "chart-annotate": return (right as number) + 1;
    case "multi-select": case "find-error": return [];
  }
}

/** Take a full attempt through the real flow (start → answer → submit). */
function takeAttempt(s: ProgressState, bank: TrackAssessment, when: Date, wrongConcepts: string[] = []): { s: ProgressState; ids: string[] } {
  const prev = getAssessmentProgress(s, bank.trackId)?.attempts ?? [];
  const sel = selectQuestions(bank, prev, `${bank.trackId}:attempt:${prev.length + 1}`);
  s = startAssessment(s, bank.trackId, sel.questionIds, sel.reusedConcepts, when);
  const wrong = sel.questionIds.filter((id) => wrongConcepts.includes(bank.questions.find((q) => q.id === id)!.concept));
  const answers = answersFor(bank, sel.questionIds, wrong);
  for (const [q, v] of Object.entries(answers)) s = saveAssessmentAnswer(s, bank.trackId, q, v, when);
  const d = getAssessmentProgress(s, bank.trackId)!.draft!;
  s = submitAssessment(s, bank.trackId, gradeAttempt(bank, d.questionIds, d.answers), new Date(when.getTime() + 60_000), d.answers);
  return { s, ids: sel.questionIds };
}

const items = (spec: Partial<AssessmentItemResult>[]): AssessmentItemResult[] => spec.map((x, i) => ({ q: `q${i}`, c: `c${i}`, ok: true, ...x }));

describe("assessment scoring", () => {
  it("passes at 90% or more with every safety-critical, critical and applied item right", () => {
    const ten = items(Array.from({ length: 10 }, (_, i) => (i === 9 ? { applied: true, critical: true } : i < 2 ? { safety: true, critical: true } : {})));
    expect(scoreAttempt(ten).passed).toBe(true);
    const oneMiss = ten.map((x, i) => (i === 5 ? { ...x, ok: false } : x));
    expect(scoreAttempt(oneMiss).pct).toBe(90);
    expect(scoreAttempt(oneMiss).passed).toBe(true);
    const twoMiss = oneMiss.map((x, i) => (i === 6 ? { ...x, ok: false } : x));
    expect(scoreAttempt(twoMiss).scoreOk).toBe(false);
    expect(scoreAttempt(twoMiss).passed).toBe(false);
  });

  it("uses integer maths at the boundary (9/10 = 90% passes; 8/9 ≈ 88.9% fails)", () => {
    expect(ASSESSMENT_PASS_PCT).toBe(90);
    const nine = items([...Array(8).fill({}), { ok: false }, { applied: true }] as Partial<AssessmentItemResult>[]);
    expect(scoreAttempt(nine.slice(0, 10)).scoreOk).toBe(true);
    const eightOfNine = items([...Array(7).fill({}), { ok: false }, { applied: true }] as Partial<AssessmentItemResult>[]);
    expect(scoreAttempt(eightOfNine).scoreOk).toBe(false);
  });

  it("a safety-critical miss FAILS even when the score is above 90%", () => {
    const twelve = items(Array.from({ length: 13 }, (_, i) => (i === 0 ? { safety: true, critical: true, ok: false } : i === 12 ? { applied: true } : {})));
    const s = scoreAttempt(twelve);
    expect(s.pct).toBe(92);
    expect(s.scoreOk).toBe(true);
    expect(s.safetyOk).toBe(false);
    expect(s.passed).toBe(false);
    expect(s.failReasons.join(" ")).toMatch(/safety-critical/);
    expect(s.wrongConcepts).toEqual(["c0"]);
  });

  it("a critical-concept miss or an unsound applied scenario also fails", () => {
    const base = Array.from({ length: 12 }, () => ({})) as Partial<AssessmentItemResult>[];
    expect(scoreAttempt(items([...base, { critical: true, ok: false }, { applied: true }])).passed).toBe(false);
    expect(scoreAttempt(items([...base, {}, { applied: true, ok: false }])).passed).toBe(false);
    // An attempt without any applied item cannot pass.
    expect(scoreAttempt(items([...base, {}])).appliedOk).toBe(false);
  });

  it("grades real bank questions with the concept flags copied in", () => {
    const sel = selectQuestions(FX, [], "fx:1");
    const graded = gradeAttempt(FX, sel.questionIds, answersFor(FX, sel.questionIds));
    expect(graded).toHaveLength(FX.concepts.length);
    expect(graded.every((g) => g.ok)).toBe(true);
    expect(graded.filter((g) => g.safety).map((g) => g.c).sort()).toEqual(["fx-leverage", "fx-margin", "fx-margin-call", "fx-sizing"]);
    expect(graded.filter((g) => g.applied).map((g) => g.c)).toEqual(["fx-applied"]);
    expect(scoreAttempt(graded).passed).toBe(true);
  });
});

describe("question selection", () => {
  it("is deterministic for a seed, one question per concept, applied scenario last", () => {
    const a = selectQuestions(MF, [], "seed-1");
    const b = selectQuestions(MF, [], "seed-1");
    expect(a).toEqual(b);
    expect(a.questionIds).toHaveLength(MF.concepts.length);
    const concepts = a.questionIds.map((id) => MF.questions.find((q) => q.id === id)!.concept);
    expect(new Set(concepts).size).toBe(MF.concepts.length);
    expect(concepts[concepts.length - 1]).toBe("mf-applied");
    expect(a.reusedConcepts).toEqual([]);
  });

  it("a retest draws only questions not seen before, while the pools last", () => {
    let s = completeLessons(emptyProgress(), "market-foundations", at(0));
    const first = takeAttempt(s, MF, at(10), ["mf-leverage"]);
    s = first.s;
    const second = selectQuestions(MF, getAssessmentProgress(s, MF.trackId)!.attempts, "market-foundations:attempt:2");
    expect(second.questionIds.some((id) => first.ids.includes(id))).toBe(false);
    expect(second.reusedConcepts).toEqual([]);
  });

  it("when a pool runs out it says so, and reuses the question seen longest ago", () => {
    // The pool is now four questions (was two); see all of them, oldest first.
    const attempts = ["mf-q-markets-1", "mf-q-markets-2", "mf-q-markets-3", "mf-q-markets-4"].map((q, i) => ({ at: at(i + 1).toISOString(), items: [{ q, c: "mf-markets", ok: false }] }));
    const sel = selectQuestions(MF, attempts, "x");
    expect(sel.reusedConcepts).toEqual(["mf-markets"]);
    expect(sel.questionIds).toContain("mf-q-markets-1");
    expect(sel.questionIds).not.toContain("mf-q-markets-2");
  });

  it("different seeds can give different draws, but never two questions for one concept", () => {
    const draws = new Set(Array.from({ length: 20 }, (_, i) => selectQuestions(FX, [], `s${i}`).questionIds.slice().sort().join(",")));
    expect(draws.size).toBeGreaterThan(1);
  });
});

describe("remediation before retest", () => {
  it("a failed attempt locks the retest until every missed concept's remediation is finished after it", () => {
    let s = completeLessons(emptyProgress(), "forex-foundations", at(0));
    s = takeAttempt(s, FX, at(10), ["fx-margin", "fx-pairs"]).s;
    let a = assessmentState(getAssessmentProgress(s, FX.trackId), NOW);
    expect(a.last!.passed).toBe(false);
    expect(a.remediationRequired.sort()).toEqual(["fx-margin", "fx-pairs"]);
    expect(a.canStart).toBe(false);

    s = completeRemediation(s, FX.trackId, "fx-pairs", at(20));
    a = assessmentState(getAssessmentProgress(s, FX.trackId), NOW);
    expect(a.remediationPending).toEqual(["fx-margin"]);
    expect(a.canStart).toBe(false);

    s = completeRemediation(s, FX.trackId, "fx-margin", at(21));
    a = assessmentState(getAssessmentProgress(s, FX.trackId), NOW);
    expect(a.canStart).toBe(true);
  });

  it("remediation done BEFORE the failed attempt does not count for it", () => {
    let s = completeLessons(emptyProgress(), "forex-foundations", at(0));
    s = completeRemediation(s, FX.trackId, "fx-margin", at(5));
    s = takeAttempt(s, FX, at(10), ["fx-margin"]).s;
    expect(assessmentState(getAssessmentProgress(s, FX.trackId), NOW).remediationPending).toEqual(["fx-margin"]);
  });

  it("a passed attempt needs no remediation", () => {
    let s = completeLessons(emptyProgress(), "forex-foundations", at(0));
    s = takeAttempt(s, FX, at(10), ["fx-pairs"]).s;
    const a = assessmentState(getAssessmentProgress(s, FX.trackId), NOW);
    expect(a.passed).toBe(true);
    expect(a.masteryScore).toBe(91); // 11/12 = 91.7%, floored (a fail can never display as 90%)
    expect(a.remediationRequired).toEqual([]);
    expect(a.canStart).toBe(true);
  });

  it("a practice retake that fails does not remove an earlier pass", () => {
    let s = completeLessons(emptyProgress(), "forex-foundations", at(0));
    s = takeAttempt(s, FX, at(10)).s;
    s = takeAttempt(s, FX, at(30), ["fx-margin", "fx-pairs", "fx-costs"]).s;
    const a = assessmentState(getAssessmentProgress(s, FX.trackId), NOW);
    expect(a.passed).toBe(true);
    expect(a.masteryScore).toBe(100);
    expect(a.last!.passed).toBe(false);
  });

  // Changed with the clock-skew fix: a pass stamped up to 24 h ahead (a clock that ran ahead)
  // counts; anything further ahead (edited or corrupt data) is still ignored.
  it("assessment passes dated more than 24 hours in the future are ignored", () => {
    const future = new Date(NOW.getTime() + 25 * 3600_000);
    let s = completeLessons(emptyProgress(), "forex-foundations", at(0));
    s = takeAttempt(s, FX, future).s;
    expect(assessmentState(getAssessmentProgress(s, FX.trackId), NOW).passed).toBe(false);
  });

  it("an assessment pass dated up to 24 hours ahead (clock ran ahead) counts", () => {
    const future = new Date(NOW.getTime() + 60 * 60_000);
    let s = completeLessons(emptyProgress(), "forex-foundations", at(0));
    s = takeAttempt(s, FX, future).s;
    const a = assessmentState(getAssessmentProgress(s, FX.trackId), NOW);
    expect(a.passed).toBe(true);
    expect(a.masteryScore).toBe(100);
  });
});

describe("unlocking over the track DAG", () => {
  it("the curriculum's prerequisites form a DAG over known tracks", () => {
    const order = topoOrder(TRACK_DEFS);
    expect(order).toHaveLength(TRACKS.length);
    const pos = new Map(order.map((id, i) => [id, i]));
    for (const t of TRACKS) for (const p of t.prerequisites) expect(pos.get(p)!, `${p} before ${t.id}`).toBeLessThan(pos.get(t.id)!);
    expect(TRACKS.find((t) => t.id === "market-foundations")!.prerequisites).toEqual([]);
  });

  it("rejects cycles and unknown prerequisites", () => {
    expect(() => topoOrder([{ id: "a", prerequisites: ["b"] }, { id: "b", prerequisites: ["a"] }])).toThrow(/cycle/);
    expect(() => topoOrder([{ id: "a", prerequisites: ["zzz"] }])).toThrow(/unknown/);
  });

  it("crypto and commodities are not prerequisites for anything", () => {
    for (const t of TRACKS) expect(t.prerequisites.filter((p) => p === "crypto" || p === "commodities"), t.id).toEqual([]);
  });

  it("a fresh learner: only Market Foundations is unlocked", () => {
    const tp = trackProgress(TRACK_DEFS, emptyProgress(), clock);
    expect([...tp.values()].filter((t) => t.unlocked).map((t) => t.id)).toEqual(["market-foundations"]);
    expect(tp.get("forex-foundations")!.missing).toEqual(["market-foundations"]);
  });

  it("completing every lesson is NOT enough: the next tracks stay locked until the assessment is passed", () => {
    const s = completeLessons(emptyProgress(), "market-foundations", at(0));
    const tp = trackProgress(TRACK_DEFS, s, clock);
    expect(tp.get("market-foundations")!.allLessonsComplete).toBe(true);
    expect(tp.get("market-foundations")!.complete).toBe(false);
    expect(tp.get("market-foundations")!.assessmentAvailable).toBe(true);
    expect(tp.get("forex-foundations")!.unlocked).toBe(false);
  });

  it("a failed assessment keeps them locked; a pass unlocks every track that only needs track 1", () => {
    let s = completeLessons(emptyProgress(), "market-foundations", at(0));
    s = takeAttempt(s, MF, at(10), ["mf-stop-loss"]).s; // 12/13 = 92%, but safety-critical
    let tp = trackProgress(TRACK_DEFS, s, clock);
    expect(tp.get("market-foundations")!.complete).toBe(false);
    expect(tp.get("forex-foundations")!.unlocked).toBe(false);

    s = completeRemediation(s, MF.trackId, "mf-stop-loss", at(20));
    s = takeAttempt(s, MF, at(30)).s;
    tp = trackProgress(TRACK_DEFS, s, clock);
    expect(tp.get("market-foundations")!.complete).toBe(true);
    const unlocked = [...tp.values()].filter((t) => t.unlocked).map((t) => t.id).sort();
    expect(unlocked).toEqual(["chart-reading", "commodities", "crypto", "forex-foundations", "market-foundations", "stocks-indices"].sort());
    // Risk Management also needs Forex Foundations; Macro needs tracks 2 and 3.
    expect(tp.get("risk-management")!.missing).toEqual(["forex-foundations"]);
    expect(tp.get("macro-news")!.missing.sort()).toEqual(["forex-foundations", "stocks-indices"]);
  });

  it("progress in a locked track never completes it (for example, edited or old data)", () => {
    let s = completeLessons(emptyProgress(), "forex-foundations", at(0));
    s = takeAttempt(s, FX, at(10)).s;
    const tp = trackProgress(TRACK_DEFS, s, clock);
    expect(tp.get("forex-foundations")!.unlocked).toBe(false);
    expect(tp.get("forex-foundations")!.complete).toBe(false);
    expect(tp.get("forex-foundations")!.assessment!.passed).toBe(true); // kept, and counts once track 1 is done
  });

  it("practical competency needs every exercise solved and the applied scenario passed", () => {
    let s = completeLessons(emptyProgress(), "market-foundations", at(0));
    expect(trackProgress(TRACK_DEFS, s, clock).get("market-foundations")!.practicalCompetency).toBe(false);
    s = takeAttempt(s, MF, at(10)).s;
    expect(trackProgress(TRACK_DEFS, s, clock).get("market-foundations")!.practicalCompetency).toBe(true);
  });

  it("overall progress counts lessons and assessments", () => {
    let s = completeLessons(emptyProgress(), "market-foundations", at(0));
    const total = TRACK_DEFS.filter((d) => d.status === "written").reduce((n, d) => n + d.lessons.length + 1, 0);
    expect(overallProgressPct(TRACK_DEFS, trackProgress(TRACK_DEFS, s, clock))).toBe(Math.round((10 / total) * 100));
    s = takeAttempt(s, MF, at(10)).s;
    expect(overallProgressPct(TRACK_DEFS, trackProgress(TRACK_DEFS, s, clock))).toBe(Math.round((11 / total) * 100));
  });
});

describe("recommendations respect locks", () => {
  it("lessons first, then the assessment, then remediation, the retest, and only then track 2", () => {
    let s = emptyProgress();
    expect(recommendNextStep(TRACK_DEFS, s, clock)).toEqual({ kind: "lesson", lessonId: "what-is-a-market", trackId: "market-foundations", reason: "start" });
    s = completeLessons(s, "market-foundations", at(0));
    expect(recommendNextStep(TRACK_DEFS, s, clock)).toEqual({ kind: "assessment", trackId: "market-foundations", reason: "take" });
    const sel = selectQuestions(MF, [], "market-foundations:attempt:1");
    s = startAssessment(s, MF.trackId, sel.questionIds, [], at(5));
    expect(recommendNextStep(TRACK_DEFS, s, clock)).toMatchObject({ kind: "assessment", reason: "resume" });
    const d = getAssessmentProgress(s, MF.trackId)!.draft!;
    const wrongId = sel.questionIds.find((id) => MF.questions.find((q) => q.id === id)!.concept === "mf-leverage")!;
    const ans = answersFor(MF, d.questionIds, [wrongId]);
    s = submitAssessment(s, MF.trackId, gradeAttempt(MF, d.questionIds, ans), at(6), ans);
    expect(recommendNextStep(TRACK_DEFS, s, clock)).toMatchObject({ kind: "assessment", reason: "remediate" });
    s = completeRemediation(s, MF.trackId, "mf-leverage", at(7));
    expect(recommendNextStep(TRACK_DEFS, s, clock)).toMatchObject({ kind: "assessment", reason: "retest" });
    s = takeAttempt(s, MF, at(8)).s;
    expect(recommendNextStep(TRACK_DEFS, s, clock)).toEqual({ kind: "lesson", lessonId: "fx-quotes", trackId: "forex-foundations", reason: "start" });
  });

  it("starting a locked track's lesson (old data) does not make it the recommendation", () => {
    let s = markSectionRead(emptyProgress(), "fx-quotes", "one-price-two-currencies", at(0));
    s = markSectionRead(s, "what-is-a-market", "meeting-place", at(1));
    expect(recommendNextStep(TRACK_DEFS, s, clock)).toMatchObject({ kind: "lesson", trackId: "market-foundations" });
    expect(currentTrackId(TRACK_DEFS, trackProgress(TRACK_DEFS, s, clock))).toBe("market-foundations");
  });
});

describe("journey stage with the assessment gate", () => {
  it("stays Awareness until the Market Foundations assessment is passed", () => {
    const s = completeLessons(emptyProgress(), "market-foundations", at(0));
    const f = summarize(lessonsOfTrack("market-foundations"), s, clock);
    expect(journeyStage(f, null, { foundationsAssessmentPassed: false }).index).toBe(0);
    expect(journeyStage(f, null, { foundationsAssessmentPassed: false }).detail).toMatch(/track assessment/);
    expect(journeyStage(f, null, { foundationsAssessmentPassed: true }).index).toBe(1);
    // Without the gate argument, the original lesson-only rule still applies.
    expect(journeyStage(f).index).toBe(1);
  });

  it("names a pending assessment for the current track", () => {
    const f = { total: 10, started: 10, completed: 10, mastered: 0, masteryPct: 50 };
    const j = journeyStage(f, { title: "Forex Foundations", completed: 7, total: 7, assessmentPending: true }, { foundationsAssessmentPassed: true });
    expect(j.index).toBe(1);
    expect(j.detail).toMatch(/Forex Foundations: all 7 lessons complete\. Pass its track assessment/);
  });
});

describe("stored data: migration, merge and reset", () => {
  it("old version-1 data (no assessments) still shows completed lessons, and is not reported as damaged", () => {
    const old = completeLessons(emptyProgress(), "market-foundations", at(0));
    const raw = JSON.stringify({ version: 1, lessons: old.lessons, updatedAt: at(0).toISOString() });
    const r = parseProgress(raw);
    expect(r.repaired).toBe(false);
    expect(r.state.assessments).toBeUndefined();
    const tp = trackProgress(TRACK_DEFS, r.state, clock);
    expect(tp.get("market-foundations")!.lessonsComplete).toBe(10);
    // A returning user must now sit the exam.
    expect(tp.get("market-foundations")!.complete).toBe(false);
    expect(recommendNextStep(TRACK_DEFS, r.state, clock)).toEqual({ kind: "assessment", trackId: "market-foundations", reason: "take" });
  });

  it("round-trips assessment records through JSON", () => {
    let s = completeLessons(emptyProgress(), "forex-foundations", at(0));
    s = takeAttempt(s, FX, at(10), ["fx-pairs", "fx-margin"]).s;
    s = completeRemediation(s, FX.trackId, "fx-pairs", at(20));
    const sel = selectQuestions(FX, getAssessmentProgress(s, FX.trackId)!.attempts, "x");
    s = startAssessment(s, FX.trackId, sel.questionIds, ["fx-quotes"], at(30));
    s = saveAssessmentAnswer(s, FX.trackId, sel.questionIds[0], "a", at(31));
    const r = parseProgress(JSON.stringify(s));
    expect(r.repaired).toBe(false);
    expect(r.state.assessments).toEqual(s.assessments);
  });

  it("drops broken assessment parts and keeps the rest", () => {
    const good = { at: at(5).toISOString(), items: [{ q: "fx-q-pips-1", c: "fx-pips", ok: true }], answers: { "fx-q-pips-1": 37, other: 1 } };
    const r = parseProgress({
      version: 1,
      lessons: {},
      assessments: {
        "forex-foundations": {
          attempts: [good, { at: "nope", items: [] }, { at: at(6).toISOString(), items: [{ q: "x", c: "y", ok: "yes" }] }, { at: at(7).toISOString(), items: [] }],
          remediation: { "fx-pips": at(8).toISOString(), "BAD ID": at(8).toISOString(), "fx-margin": 5 },
          draft: { startedAt: at(9).toISOString(), questionIds: ["fx-q-pips-2"], answers: { "fx-q-pips-2": { evil: true }, "not-in-draft": 1 }, reusedConcepts: [1, "fx-pips"] },
        },
        "__proto__": { attempts: [] },
        "Bad Track": {},
      },
    });
    expect(r.repaired).toBe(true);
    const a = r.state.assessments!["forex-foundations"];
    // seq is backfilled on load (round 3): old data without it is numbered in stored order.
    expect(a.attempts).toEqual([{ ...good, seq: 1, answers: { "fx-q-pips-1": 37 } }]);
    expect(a.remediation).toEqual({ "fx-pips": at(8).toISOString() });
    expect(a.draft).toEqual({ startedAt: at(9).toISOString(), questionIds: ["fx-q-pips-2"], answers: {}, reusedConcepts: ["fx-pips"] });
    expect(Object.keys(r.state.assessments!)).toEqual(["forex-foundations"]);
    expect(({} as Record<string, unknown>).attempts).toBeUndefined();
  });

  it("merging two tabs: attempts are united, remediation keeps the latest, the newest draft wins", () => {
    let base = completeLessons(emptyProgress(), "forex-foundations", at(0));
    const a1 = takeAttempt(base, FX, at(10), ["fx-pairs"]).s;
    let tabA = completeRemediation(a1, FX.trackId, "fx-pairs", at(20));
    let tabB = takeAttempt(base, FX, at(15), ["fx-costs"]).s;
    tabB = completeRemediation(tabB, FX.trackId, "fx-pairs", at(25));
    const sel = selectQuestions(FX, [], "d");
    tabA = startAssessment(tabA, FX.trackId, sel.questionIds, [], at(30));
    tabB = startAssessment(tabB, FX.trackId, sel.questionIds, [], at(40));
    const m = mergeProgress(tabA, tabB);
    const ap = m.assessments![FX.trackId];
    expect(ap.attempts.map((x) => x.at)).toEqual([new Date(at(10).getTime() + 60_000).toISOString(), new Date(at(15).getTime() + 60_000).toISOString()]);
    expect(ap.remediation["fx-pairs"]).toBe(at(25).toISOString());
    expect(ap.draft!.startedAt).toBe(at(40).toISOString());
    expect(mergeProgress(tabB, tabA).assessments).toEqual(m.assessments);
  });

  it("a submitted draft cannot be brought back by a tab that still holds it", () => {
    let s = completeLessons(emptyProgress(), "forex-foundations", at(0));
    const sel = selectQuestions(FX, [], "d");
    const stale = startAssessment(s, FX.trackId, sel.questionIds, [], at(10));
    const ans = answersFor(FX, sel.questionIds);
    const submitted = submitAssessment(stale, FX.trackId, gradeAttempt(FX, sel.questionIds, ans), at(20), ans);
    const m = mergeProgress(submitted, stale);
    expect(m.assessments![FX.trackId].draft).toBeNull();
    expect(m.assessments![FX.trackId].attempts).toHaveLength(1);
    s = m;
  });

  it("a reset wipes assessment records, and a tab holding older ones cannot restore them", () => {
    let s = completeLessons(emptyProgress(), "market-foundations", at(0));
    s = takeAttempt(s, MF, at(10)).s;
    expect(trackProgress(TRACK_DEFS, s, clock).get("market-foundations")!.complete).toBe(true);
    const reset = resetProgress(at(60));
    const m = mergeProgress(reset, s);
    expect(m.assessments).toBeUndefined();
    expect(Object.keys(m.lessons)).toEqual([]);
    expect(trackProgress(TRACK_DEFS, m, clock).get("forex-foundations")!.unlocked).toBe(false);
    // Records made after the reset survive the merge.
    const after = takeAttempt(completeLessons(m, "market-foundations", at(70)), MF, at(80)).s;
    expect(mergeProgress(after, s).assessments![MF.trackId].attempts).toHaveLength(1);
  });
});

describe("interaction graders", () => {
  it("numeric tolerance, multi-select sets, find-error lines, chart levels and scenario process", () => {
    expect(gradeItem({ kind: "numeric", prompt: "", unit: "", answer: 10, tolerance: 0.5, explain: "" }, 10.4).correct).toBe(true);
    expect(gradeItem({ kind: "numeric", prompt: "", unit: "", answer: 10, tolerance: 0.5, explain: "" }, 10.6).correct).toBe(false);
    expect(gradeItem({ kind: "numeric", prompt: "", unit: "", answer: 0.3, tolerance: 0, explain: "" }, 0.1 + 0.2).correct).toBe(true);
    const ms = { kind: "multi-select" as const, prompt: "", options: [{ id: "a", text: "", explain: "" }, { id: "b", text: "", explain: "" }, { id: "c", text: "", explain: "" }], correct: ["a", "c"] };
    expect(gradeItem(ms, ["c", "a"]).correct).toBe(true);
    expect(gradeItem(ms, ["a"]).correct).toBe(false);
    expect(gradeItem(ms, ["a", "b", "c"]).correct).toBe(false);
    const fe = { kind: "find-error" as const, prompt: "", explain: "", lines: [{ id: "l1", text: "" }, { id: "l2", text: "", error: "x" }] };
    expect(gradeItem(fe, ["l2"]).correct).toBe(true);
    expect(gradeItem(fe, []).correct).toBe(false);
    const ch = { kind: "chart-annotate" as const, prompt: "", explain: "", decimals: 4, series: [1, 2], target: { mode: "level" as const, value: 1.096, tolerance: 0.0005 } };
    expect(gradeItem(ch, 1.0964).correct).toBe(true);
    expect(gradeItem(ch, 1.097).correct).toBe(false);
    const sc = { kind: "scenario" as const, situation: "", question: "", options: [{ id: "a", text: "", explain: "", process: "partial" as const }, { id: "b", text: "", explain: "", process: "sound" as const }] };
    expect(gradeItem(sc, "a")).toEqual({ correct: false, score: 0.5, answered: true });
    expect(gradeItem(sc, "b").correct).toBe(true);
    // Wrong shapes are "not answered", never correct.
    expect(gradeItem(ms, "a").answered).toBe(false);
    expect(gradeItem({ kind: "true-false", statement: "", answer: false, explain: "" }, "false").answered).toBe(false);
  });
});
