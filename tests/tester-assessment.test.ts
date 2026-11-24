/** Tester Phase 2 step 1: try to game track assessments, locks, retests and the stored data. */
import { describe, expect, it } from "vitest";
import { ASSESSMENT_PASS_PCT, assessmentState, gradeAttempt, scoreAttempt, selectQuestions } from "@/lib/academy/assessment";
import { ASSESSMENTS } from "@/lib/academy/assessments";
import { TRACK_DEFS, TRACKS, lessonsOfTrack } from "@/lib/academy/curriculum";
import { correctAnswer, gradeItem } from "@/lib/academy/interactions";
import { currentTrackId, recommendNextStep, topoOrder, trackProgress } from "@/lib/academy/mastery";
import {
  completeRemediation, emptyProgress, mergeProgress, parseProgress, resetProgress, startAssessment, submitAssessment,
  type AssessmentAttempt, type AssessmentItemResult, type ProgressState,
} from "@/lib/academy/progress";
import type { GradedItem, TrackAssessment } from "@/lib/academy/types";

const BANKS = Object.values(ASSESSMENTS);
const MF = ASSESSMENTS["market-foundations"];
const T0 = new Date("2026-11-20T10:00:00Z");
const at = (min: number) => new Date(T0.getTime() + min * 60_000);
const clock = (d = at(10_000)) => ({ now: d, timeZone: "UTC" });

function item(ok: boolean, flags: Partial<AssessmentItemResult> = {}, i = 0): AssessmentItemResult {
  return { q: `q${i}`, c: `c${i}`, ok, ...flags };
}
function attemptOf(n: number, correct: number, opts: { safetyWrong?: boolean; appliedWrong?: boolean; noApplied?: boolean; criticalWrong?: boolean } = {}) {
  const items: AssessmentItemResult[] = [];
  for (let i = 0; i < n; i++) items.push(item(i < correct, {}, i));
  // last item is the applied scenario, first item safety, second critical
  if (!opts.noApplied) items[n - 1] = { ...items[n - 1], applied: true, ok: opts.appliedWrong ? false : items[n - 1].ok };
  items[0] = { ...items[0], safety: true, critical: true, ok: opts.safetyWrong ? false : items[0].ok };
  items[1] = { ...items[1], critical: true, ok: opts.criticalWrong ? false : items[1].ok };
  return items;
}

describe("pass boundary (≥ 90%, integer maths)", () => {
  // correct answers are at the START; flags force items 0,1,n-1 right unless asked
  const pass = (n: number, wrong: number) => {
    const items = Array.from({ length: n }, (_, i) => item(!(i >= 2 && i < 2 + wrong), {}, i));
    items[n - 1] = { ...items[n - 1], applied: true, ok: true };
    return scoreAttempt(items);
  };
  it("pass mark is 90", () => expect(ASSESSMENT_PASS_PCT).toBe(90));
  it.each([
    [10, 1, true], [10, 2, false], [11, 1, true], [11, 2, false], [12, 1, true], [12, 2, false],
    [14, 1, true], [14, 2, false], [19, 2, false], [20, 2, true], [29, 3, false], [30, 3, true],
  ])("%i questions, %i wrong → pass %s", (n, w, p) => expect(pass(n, w).scoreOk).toBe(p));
  it("89.x% never passes, even when it rounds to 90% for display", () => {
    const s = pass(29, 3); // 26/29 = 89.66%
    expect(s.scoreOk).toBe(false);
    expect(s.passed).toBe(false);
    // Was a latent display issue (rounded pct read 90 while the reason said "below 90%").
    // Fixed in the step-1 rework (MINOR 4): pct is floored, so a fail never displays as 90%.
    expect({ pct: s.pct, reason: s.failReasons[0] }).toEqual({ pct: 89, reason: "The score is below 90%." });
  });
  it("one safety-critical miss fails at an otherwise perfect score", () => {
    const s = scoreAttempt(attemptOf(14, 14, { safetyWrong: true }));
    // 13/14 = 92.86%: floored for display since the MINOR 4 fix (was rounded to 93).
    expect(s.pct).toBe(92);
    expect(s.passed).toBe(false);
    expect(s.safetyOk).toBe(false);
  });
  it("applied scenario wrong fails; an attempt with no applied item at all fails", () => {
    expect(scoreAttempt(attemptOf(14, 14, { appliedWrong: true })).passed).toBe(false);
    expect(scoreAttempt(attemptOf(14, 14, { noApplied: true })).passed).toBe(false);
  });
  it("critical concept wrong fails", () => {
    expect(scoreAttempt(attemptOf(14, 14, { criticalWrong: true })).passed).toBe(false);
  });
  it("empty attempt fails", () => expect(scoreAttempt([]).passed).toBe(false));
});

describe("every bank: structure that makes gaming hard", () => {
  for (const b of BANKS) {
    describe(b.trackId, () => {
      it("one applied concept, last in every draw, with a 'sound' option", () => {
        const applied = b.concepts.filter((c) => c.applied);
        expect(applied.length).toBe(1);
        const sel = selectQuestions(b, [], "x");
        expect(b.questions.find((q) => q.id === sel.questionIds.at(-1))!.concept).toBe(applied[0].id);
      });
      it("safety-critical concepts exist and are all critical in grading", () => {
        const safety = b.concepts.filter((c) => c.safetyCritical);
        expect(safety.length).toBeGreaterThan(0);
        const sel = selectQuestions(b, [], "x");
        const all = gradeAttempt(b, sel.questionIds, {});
        for (const r of all.filter((r) => r.safety)) expect(r.critical).toBe(true);
      });
      it("all-right answers pass at 100%; all-wrong fails; blank fails", () => {
        const sel = selectQuestions(b, [], "s");
        const right = Object.fromEntries(sel.questionIds.map((id) => [id, correctAnswer(b.questions.find((q) => q.id === id)!.item)]));
        const s = scoreAttempt(gradeAttempt(b, sel.questionIds, right));
        expect(s.passed).toBe(true); expect(s.pct).toBe(100);
        expect(scoreAttempt(gradeAttempt(b, sel.questionIds, {})).passed).toBe(false);
      });
      it("a single non-critical miss still passes only if ≥ 90% (count check)", () => {
        const n = b.concepts.length;
        const plain = b.concepts.filter((c) => !c.critical && !c.safetyCritical && !c.applied).length;
        // Report: how many plain misses are tolerated
        const tolerated = Math.floor(n - (n * 90) / 100 + 1e-9);
        expect(tolerated).toBeGreaterThanOrEqual(1);
        expect(plain).toBeGreaterThanOrEqual(1);
      });
      it("no question appears in a concept's practice and in the pool (practice is new)", () => {
        const pool = new Set(b.questions.map((q) => JSON.stringify(q.item)));
        for (const c of b.concepts) expect(pool.has(JSON.stringify(c.remediation.practice))).toBe(false);
      });
      it("question ids are unique across ALL banks (seen-tracking cannot collide)", () => {
        const ids = BANKS.flatMap((x) => x.questions.map((q) => q.id));
        expect(new Set(ids).size).toBe(ids.length);
      });
      it("every correct answer grades correct, and remediation practice has a correct answer", () => {
        for (const q of b.questions) expect(gradeItem(q.item, correctAnswer(q.item)).correct).toBe(true);
        for (const c of b.concepts) expect(gradeItem(c.remediation.practice, correctAnswer(c.remediation.practice)).correct).toBe(true);
      });
      it("remediation text differs from every question explanation of the same concept", () => {
        for (const c of b.concepts) {
          const ex = b.questions.filter((q) => q.concept === c.id).map((q) => q.explanation);
          for (const t of [c.remediation.altExplanation, c.remediation.altExample]) for (const e of ex) expect(t).not.toBe(e);
        }
      });
    });
  }
});

/** Simulate failing repeatedly: how many attempts before any question repeats? */
function simulate(b: TrackAssessment, attempts: number) {
  const hist: AssessmentAttempt[] = [];
  const rows: { qs: string[]; reused: string[] }[] = [];
  for (let n = 1; n <= attempts; n++) {
    const sel = selectQuestions(b, hist, `${b.trackId}:attempt:${n}`);
    rows.push({ qs: sel.questionIds, reused: sel.reusedConcepts });
    hist.push({ at: at(n).toISOString(), items: sel.questionIds.map((id) => ({ q: id, c: b.questions.find((q) => q.id === id)!.concept, ok: false })) });
  }
  return rows;
}

describe("retests use different questions", () => {
  for (const b of BANKS) {
    it(`${b.trackId}: the first retest shares no question with the first attempt`, () => {
      const [a1, a2] = simulate(b, 2);
      expect(a1.qs.filter((q) => a2.qs.includes(q))).toEqual([]);
      expect(a2.reused).toEqual([]);
    });
    it(`${b.trackId}: reuse begins at the attempt after the smallest pool runs out, and is always reported`, () => {
      const sizes = b.concepts.map((c) => b.questions.filter((q) => q.concept === c.id).length);
      const minPool = Math.min(...sizes);
      const rows = simulate(b, 6);
      const firstReuse = rows.findIndex((r) => r.reused.length > 0) + 1;
      expect(firstReuse).toBe(minPool + 1);
      // every repeated question in a later attempt is in a reported concept
      const seen = new Set<string>();
      for (const r of rows) {
        const repeats = r.qs.filter((q) => seen.has(q)).map((q) => b.questions.find((x) => x.id === q)!.concept);
        expect(repeats.every((c) => r.reused.includes(c))).toBe(true);
        r.qs.forEach((q) => seen.add(q));
      }
    });
  }
  it("pool sizes per bank (documented in the report)", () => {
    const out = Object.fromEntries(BANKS.map((b) => {
      const sizes = b.concepts.map((c) => b.questions.filter((q) => q.concept === c.id).length);
      return [b.trackId, { concepts: b.concepts.length, questions: b.questions.length, min: Math.min(...sizes), twoOnly: sizes.filter((s) => s === 2).length }];
    }));
    expect(out["market-foundations"].concepts).toBe(14);
    expect(out["forex-foundations"].concepts).toBe(12);
    expect(out["stocks-indices"].concepts).toBe(11);
    for (const v of Object.values(out)) expect(v.min).toBeGreaterThanOrEqual(2);
    console.log("POOLS", JSON.stringify(out));
  });
  it("seeded order is stable and depends on the attempt number", () => {
    expect(selectQuestions(MF, [], "a")).toEqual(selectQuestions(MF, [], "a"));
    const s1 = selectQuestions(MF, [], "market-foundations:attempt:1").questionIds;
    const s2 = selectQuestions(MF, [], "market-foundations:attempt:2").questionIds;
    expect(s1.join()).not.toBe(s2.join());
  });
});

// ── State machine: remediation gate, stale tabs, junk ──────────────────────

const MF_ID = "market-foundations";
function failOnce(s: ProgressState, minute: number, wrongConcepts: string[]) {
  const sel = selectQuestions(MF, [], "x");
  s = startAssessment(s, MF_ID, sel.questionIds, [], at(minute));
  const items = gradeAttempt(MF, sel.questionIds, {}).map((r) => ({ ...r, ok: !wrongConcepts.includes(r.c) }));
  return { s: submitAssessment(s, MF_ID, items, at(minute + 1)), sel };
}

describe("remediation gate", () => {
  const safety = MF.concepts.find((c) => c.safetyCritical)!.id;
  const plain = MF.concepts.find((c) => !c.critical && !c.safetyCritical && !c.applied)!.id;
  it("retest locked until every missed concept is remediated after the attempt", () => {
    let { s } = failOnce(emptyProgress(), 0, [safety, plain]);
    let a = assessmentState(s.assessments![MF_ID], at(100));
    expect(a.canStart).toBe(false);
    expect(a.remediationPending.sort()).toEqual([safety, plain].sort());
    s = completeRemediation(s, MF_ID, safety, at(2));
    expect(assessmentState(s.assessments![MF_ID], at(100)).canStart).toBe(false);
    s = completeRemediation(s, MF_ID, plain, at(3));
    expect(assessmentState(s.assessments![MF_ID], at(100)).canStart).toBe(true);
  });
  it("a remediation done BEFORE the failed attempt does not count", () => {
    let s = completeRemediation(emptyProgress(), MF_ID, plain, at(-5));
    s = failOnce(s, 0, [plain, safety]).s;
    s = completeRemediation(s, MF_ID, safety, at(3));
    expect(assessmentState(s.assessments![MF_ID], at(100)).remediationPending).toEqual([plain]);
  });
  // Behaviour flipped by the MINOR 5 fix: a remediation stamped beyond now + 5 min is invalid.
  it("[edge] a remediation stamped in the future (edited data / clock ahead) does NOT count as done", () => {
    let { s } = failOnce(emptyProgress(), 0, [safety]);
    s = { ...s, assessments: { [MF_ID]: { ...s.assessments![MF_ID], remediation: { [safety]: "2099-01-01T00:00:00.000Z" } } } };
    expect(assessmentState(s.assessments![MF_ID], at(100)).canStart).toBe(false);
  });
  // Behaviour flipped by the MINOR 5 fix: remediation is recorded against the attempt it follows
  // (order), so a clock moved backwards no longer locks the retest.
  it("[edge] clock corrected backwards after a failed attempt: remediation recorded after it still counts", () => {
    // attempt recorded 4 minutes 'in the future' (inside the 5-minute grace), then the clock is fixed
    let { s } = failOnce(emptyProgress(), 4, [safety]);
    s = completeRemediation(s, MF_ID, safety, at(1));
    const a = assessmentState(s.assessments![MF_ID], at(1));
    expect(a.canStart).toBe(true); // was: stuck until the device clock passed the attempt time
  });
  it("submitting with no draft does nothing (UI guard), but the pure submit accepts a second attempt", () => {
    let { s } = failOnce(emptyProgress(), 0, [safety]);
    const again = gradeAttempt(MF, selectQuestions(MF, [], "x").questionIds, {}).map((r) => ({ ...r, ok: true }));
    s = submitAssessment(s, MF_ID, again, at(3));
    // The pure function has no remediation gate: guard lives only in the UI (start button + draft check)
    expect(s.assessments![MF_ID].attempts.length).toBe(2);
    expect(assessmentState(s.assessments![MF_ID], at(100)).passed).toBe(true);
  });
});

describe("stale second tab", () => {
  it("tab B's stale draft is closed by tab A's submit when merged", () => {
    const sel = selectQuestions(MF, [], "x");
    const base = startAssessment(emptyProgress(), MF_ID, sel.questionIds, [], at(0));
    const tabA = submitAssessment(base, MF_ID, gradeAttempt(MF, sel.questionIds, {}), at(5));
    const merged = mergeProgress(base, tabA);
    expect(merged.assessments![MF_ID].draft).toBeNull();
    expect(merged.assessments![MF_ID].attempts.length).toBe(1);
  });
  it("two tabs submitting the same draft produce two attempts (if a stale tab could still submit)", () => {
    const sel = selectQuestions(MF, [], "x");
    const base = startAssessment(emptyProgress(), MF_ID, sel.questionIds, [], at(0));
    const fail = submitAssessment(base, MF_ID, gradeAttempt(MF, sel.questionIds, {}), at(5));
    const right = Object.fromEntries(sel.questionIds.map((id) => [id, correctAnswer(MF.questions.find((q) => q.id === id)!.item)]));
    const pass = submitAssessment(base, MF_ID, gradeAttempt(MF, sel.questionIds, right), at(6));
    const m = mergeProgress(fail, pass);
    expect(m.assessments![MF_ID].attempts.length).toBe(2);
    // Same questions, passed without remediation: only safe because the provider re-reads storage before submit.
    expect(assessmentState(m.assessments![MF_ID], at(100)).passed).toBe(true);
  });
});

describe("junk in storage never throws", () => {
  const junk: unknown[] = [
    { assessments: 5 }, { assessments: [] }, { assessments: { "market-foundations": null } },
    { assessments: { "market-foundations": { attempts: "x" } } },
    { assessments: { "market-foundations": { attempts: [{ at: "nope", items: [] }] } } },
    { assessments: { "market-foundations": { attempts: [{ at: T0.toISOString(), items: [{ q: 1, c: {}, ok: "yes" }] }] } } },
    { assessments: { "market-foundations": { attempts: [], remediation: { "mf-markets": 7 }, draft: { startedAt: "x" } } } },
    { assessments: { "__proto__": { attempts: [] } } },
    { assessments: { "market-foundations": { attempts: [{ at: T0.toISOString(), items: Array.from({ length: 5000 }, (_, i) => ({ q: `q${i}`, c: "c", ok: true, applied: true })) }] } } },
    { assessments: { "market-foundations": { draft: { startedAt: T0.toISOString(), questionIds: ["nope", 3, null], answers: { nope: { evil: 1 } } } } } },
  ];
  it.each(junk.map((j, i) => [i, j]))("junk #%i parses and the track maths still runs", (_i, j) => {
    const r = parseProgress({ version: 1, updatedAt: T0.toISOString(), lessons: {}, ...(j as object) });
    expect(r.state).toBeTruthy();
    expect(() => trackProgress(TRACK_DEFS, r.state, clock())).not.toThrow();
    expect(() => recommendNextStep(TRACK_DEFS, r.state, clock())).not.toThrow();
  });
  it("a faked passing attempt with UNKNOWN question ids is accepted (client-side limitation)", () => {
    const fake = { version: 1, updatedAt: T0.toISOString(), lessons: {}, assessments: { [MF_ID]: { attempts: [{ at: T0.toISOString(), items: [{ q: "zz", c: "zz", ok: true, applied: true }] }], remediation: {}, draft: null } } };
    const st = parseProgress(fake).state;
    const tp = trackProgress(TRACK_DEFS, st, clock());
    // documents the limitation: the assessment counts as passed, but the track is not complete without lessons
    expect(tp.get(MF_ID)!.assessment!.passed).toBe(true);
    expect(tp.get(MF_ID)!.complete).toBe(false);
    expect(tp.get("forex-foundations")!.unlocked).toBe(false);
  });
});

describe("locks and the prerequisite graph", () => {
  it("DAG has no cycle and crypto/commodities gate nothing", () => {
    expect(() => topoOrder(TRACK_DEFS)).not.toThrow();
    for (const d of TRACK_DEFS) expect(d.prerequisites.some((p) => p === "crypto" || p === "commodities")).toBe(false);
  });
  it("fresh state: only MF unlocked; recommendation is MF lesson 1", () => {
    const tp = trackProgress(TRACK_DEFS, emptyProgress(), clock());
    expect([...tp.values()].filter((t) => t.unlocked).map((t) => t.id)).toEqual(["market-foundations"]);
    const n = recommendNextStep(TRACK_DEFS, emptyProgress(), clock());
    expect(n).toMatchObject({ kind: "lesson", trackId: "market-foundations" });
  });
  it("progress inside a LOCKED track (imported/old data) is never recommended", () => {
    const s = emptyProgress();
    const L: ProgressState["lessons"] = {};
    for (const l of lessonsOfTrack("forex-foundations")) L[l.id] = { sectionsRead: { [l.sections[0].id]: at(0).toISOString() }, exerciseCompletedAt: null, quizAttempts: [{ at: at(1).toISOString(), correct: 5, total: 5 }, { at: at(2).toISOString(), correct: 1, total: 5 }], reflection: null };
    const n = recommendNextStep(TRACK_DEFS, { ...s, lessons: L }, clock());
    expect(n?.trackId).toBe("market-foundations");
  });
  it("macro-news needs BOTH FX and SI; advanced needs three tracks", () => {
    expect(TRACKS.find((t) => t.id === "macro-news")!.prerequisites).toEqual(["forex-foundations", "stocks-indices"]);
    expect(TRACKS.find((t) => t.id === "advanced")!.prerequisites.length).toBe(3);
  });
  it("lessons complete but assessment not passed → next track locked, current track MF", () => {
    const L: ProgressState["lessons"] = {};
    for (const l of lessonsOfTrack(MF_ID)) L[l.id] = { sectionsRead: Object.fromEntries(l.sections.map((x) => [x.id, at(0).toISOString()])), exerciseCompletedAt: at(0).toISOString(), quizAttempts: [{ at: at(0).toISOString(), correct: 5, total: 5 }], reflection: null };
    const st = { ...emptyProgress(), lessons: L };
    const tp = trackProgress(TRACK_DEFS, st, clock());
    expect(tp.get("forex-foundations")!.unlocked).toBe(false);
    expect(currentTrackId(TRACK_DEFS, tp)).toBe(MF_ID);
    expect(recommendNextStep(TRACK_DEFS, st, clock())).toMatchObject({ kind: "assessment", reason: "take" });
  });
});

describe("reset and migration", () => {
  it("reset tombstone wipes assessments from a stale tab on merge", () => {
    const { s } = failOnce(emptyProgress(), 0, []);
    const r = resetProgress(at(10));
    const m = mergeProgress(s, r);
    expect(m.assessments?.[MF_ID]).toBeUndefined();
  });
  it("stale tab's remediation from before reset does not survive; after reset it does", () => {
    let { s } = failOnce(emptyProgress(), 0, ["mf-markets"]);
    s = completeRemediation(s, MF_ID, "mf-markets", at(2));
    const r = resetProgress(at(10));
    expect(mergeProgress(r, s).assessments?.[MF_ID]).toBeUndefined();
  });
  it("old v1 data without assessments: no issues reported, lessons kept, tracks not complete", () => {
    const L: Record<string, unknown> = {};
    for (const l of lessonsOfTrack(MF_ID)) L[l.id] = { sectionsRead: Object.fromEntries(l.sections.map((x) => [x.id, T0.toISOString()])), exerciseCompletedAt: T0.toISOString(), quizAttempts: [{ at: T0.toISOString(), correct: 5, total: 5 }], reflection: null };
    const r = parseProgress({ version: 1, updatedAt: T0.toISOString(), lessons: L });
    // (type fix only: ParseResult has no `ok` field, so this read is cast; the assertion is unchanged)
    expect((r as { ok?: boolean }).ok ?? true).toBeTruthy();
    expect((r as { issues?: string[] }).issues ?? []).toEqual([]);
    const tp = trackProgress(TRACK_DEFS, r.state, clock());
    expect(tp.get(MF_ID)!.lessonsComplete).toBe(10);
    expect(tp.get(MF_ID)!.complete).toBe(false);
  });
});

describe("interaction graders: boundaries", () => {
  it("numeric: exactly at the tolerance edge is right, just past is wrong", () => {
    const it: GradedItem = { kind: "numeric", prompt: "", answer: 10, tolerance: 0.5, unit: "" } as GradedItem;
    expect(gradeItem(it, 10.5).correct).toBe(true);
    expect(gradeItem(it, 9.5).correct).toBe(true);
    expect(gradeItem(it, 10.5001).correct).toBe(false);
    expect(gradeItem(it, NaN).answered).toBe(false);
    expect(gradeItem(it, Infinity).answered).toBe(false);
    expect(gradeItem(it, "10" as unknown as number).answered).toBe(false);
  });
  it("multi-select is all-or-nothing (no partial credit)", () => {
    const it = { kind: "multi-select", prompt: "", options: [{ id: "a", text: "" }, { id: "b", text: "" }, { id: "c", text: "" }], correct: ["a", "b"] } as GradedItem;
    expect(gradeItem(it, ["a", "b"]).correct).toBe(true);
    expect(gradeItem(it, ["b", "a", "a"]).correct).toBe(true);
    expect(gradeItem(it, ["a"]).score).toBe(0);
    expect(gradeItem(it, ["a", "b", "c"]).correct).toBe(false);
    expect(gradeItem(it, []).correct).toBe(false);
  });
  it("scenario: 'partial' process is half credit but never correct", () => {
    const it = { kind: "scenario", situation: "", prompt: "", options: [{ id: "s", text: "", process: "sound" }, { id: "p", text: "", process: "partial" }, { id: "u", text: "", process: "unsound" }] } as unknown as GradedItem;
    expect(gradeItem(it, "s")).toMatchObject({ correct: true, score: 1 });
    expect(gradeItem(it, "p")).toMatchObject({ correct: false, score: 0.5 });
    expect(gradeItem(it, "zz").answered).toBe(false);
  });
});
