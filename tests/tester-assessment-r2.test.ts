/** Tester Phase 2 step 1, round 2: try to break the rework (learner seed, draft validation,
 *  attempt-linked remediation, variant rotation, pool exhaustion, practice retakes). */
import { describe, expect, it } from "vitest";
import {
  assessmentState, drawSeed, gradeAttempt, isDraftValid, remediationVariantIndex, remediationVariants, scoreAttempt, selectQuestions,
} from "@/lib/academy/assessment";
import { ASSESSMENTS } from "@/lib/academy/assessments";
import {
  completeRemediation, discardAssessmentDraft, emptyProgress, mergeProgress, parseProgress, resetProgress, startAssessment, submitAssessment,
  MAX_ASSESSMENT_ATTEMPTS, type AssessmentAttempt, type ProgressState,
} from "@/lib/academy/progress";

const MF_ID = "market-foundations";
const MF = ASSESSMENTS[MF_ID];
const BANKS = Object.values(ASSESSMENTS);
const T0 = new Date("2026-11-20T10:00:00Z");
const at = (min: number) => new Date(T0.getTime() + min * 60_000);
const safety = MF.concepts.find((c) => c.safetyCritical)!.id;
const plain = MF.concepts.find((c) => !c.critical && !c.safetyCritical && !c.applied)!.id;
const A = (s: ProgressState) => s.assessments![MF_ID];

/** Start (with the learner seed) and submit one attempt, answering `wrong` concepts wrongly. */
function attempt(s: ProgressState, minute: number, wrong: string[], seed = "learnerseed1") {
  const cur = s.assessments?.[MF_ID];
  const n = (cur?.attempts.length ?? 0) + 1;
  const sel = selectQuestions(MF, cur?.attempts ?? [], drawSeed(MF_ID, n, cur?.seed ?? seed));
  s = startAssessment(s, MF_ID, sel.questionIds, sel.reusedConcepts, at(minute), seed);
  const items = gradeAttempt(MF, sel.questionIds, {}).map((r) => ({ ...r, ok: !wrong.includes(r.c) }));
  return { s: submitAssessment(s, MF_ID, items, at(minute + 1)), sel };
}

describe("question pools", () => {
  it.each(BANKS.map((b) => [b.trackId, b] as const))("%s: every concept has ≥ 4 questions; attempts 1–4 share none; attempt 5 reuses every concept, announced", (_, b) => {
    for (const c of b.concepts) expect(b.questions.filter((q) => q.concept === c.id).length).toBeGreaterThanOrEqual(4);
    const attempts: AssessmentAttempt[] = [];
    const seen = new Set<string>();
    for (let n = 1; n <= 5; n++) {
      const sel = selectQuestions(b, attempts, drawSeed(b.trackId, n, "abc123"));
      if (n <= 4) {
        expect(sel.reusedConcepts).toEqual([]);
        for (const id of sel.questionIds) { expect(seen.has(id)).toBe(false); seen.add(id); }
      } else {
        const minPool = Math.min(...b.concepts.map((c) => b.questions.filter((q) => q.concept === c.id).length));
        if (minPool === 4) expect(sel.reusedConcepts.length).toBeGreaterThan(0);
        // every repeat is reported
        const repeats = sel.questionIds.filter((id) => seen.has(id));
        const qc = new Map(b.questions.map((q) => [q.id, q.concept]));
        expect(repeats.map((id) => qc.get(id)).sort()).toEqual([...sel.reusedConcepts].sort());
      }
      attempts.push({ at: at(n).toISOString(), items: gradeAttempt(b, sel.questionIds, {}) });
    }
  });
  it("different learner seeds give different first draws (most of the time)", () => {
    const draws = new Set(["s1aaaa", "s2bbbb", "s3cccc", "s4dddd", "s5eeee", "s6ffff"].map((sd) => selectQuestions(MF, [], drawSeed(MF_ID, 1, sd)).questionIds.join()));
    expect(draws.size).toBeGreaterThanOrEqual(5);
  });
});

describe("learner seed", () => {
  it("is stored on the first start and never replaced", () => {
    let { s } = attempt(emptyProgress(), 0, [], "firstseed");
    expect(A(s).seed).toBe("firstseed");
    s = startAssessment(s, MF_ID, [MF.questions[0].id], [], at(5), "otherseed");
    expect(A(s).seed).toBe("firstseed");
  });
  it("survives a merge; two tabs with different seeds converge on one", () => {
    const a = attempt(emptyProgress(), 0, [], "aaaa1111").s;
    const b = attempt(emptyProgress(), 0, [], "bbbb2222").s;
    expect(A(mergeProgress(a, b)).seed).toBe(A(mergeProgress(b, a)).seed);
  });
  it("survives a parse round-trip; junk seeds are dropped", () => {
    const { s } = attempt(emptyProgress(), 0, [], "keepme42");
    expect(A(parseProgress(JSON.stringify(s)).state).seed).toBe("keepme42");
    const bad = JSON.parse(JSON.stringify(s));
    bad.assessments[MF_ID].seed = "<script>";
    const r = parseProgress(bad);
    expect(A(r.state).seed).toBeUndefined();
  });
  it("reset drops the seed, and a stale tab merged after the reset cannot bring it back", () => {
    const { s } = attempt(emptyProgress(), 0, [], "oldseed99");
    const reset = resetProgress(at(10));
    const merged = mergeProgress(reset, s);
    expect(merged.assessments?.[MF_ID]?.seed).toBeUndefined();
    expect(merged.assessments?.[MF_ID]?.attempts.length ?? 0).toBe(0);
  });
});

describe("draft validation", () => {
  const byConcept = (b = MF) => b.concepts.map((c) => b.questions.find((q) => q.concept === c.id)!.id);
  it("a full, one-per-concept draft is valid in any order", () => {
    expect(isDraftValid(MF, { questionIds: byConcept() })).toBe(true);
    expect(isDraftValid(MF, { questionIds: [...byConcept()].reverse() })).toBe(true);
  });
  it.each([
    ["missing one concept", () => byConcept().slice(1)],
    ["one unknown id", () => [...byConcept().slice(1), "no-such-q"]],
    ["extra unknown id", () => [...byConcept(), "no-such-q"]],
    ["duplicate concept (two questions for one concept)", () => {
      const ids = byConcept();
      const second = MF.questions.filter((q) => q.concept === MF.concepts[0].id)[1].id;
      return [...ids.slice(1), ids[0], second];
    }],
    ["duplicate concept replacing another", () => {
      const ids = byConcept();
      ids[1] = MF.questions.filter((q) => q.concept === MF.concepts[0].id)[1].id;
      return ids;
    }],
    ["a question from another track", () => [...byConcept().slice(1), ASSESSMENTS["forex-foundations"].questions[0].id]],
    ["empty", () => []],
  ])("invalid: %s", (_, ids) => expect(isDraftValid(MF, { questionIds: ids() })).toBe(false));
  it("discarding a stale draft leaves a tombstone, so a merge cannot resurrect it", () => {
    const sel = selectQuestions(MF, [], "x");
    const withDraft = startAssessment(emptyProgress(), MF_ID, sel.questionIds, [], at(0));
    const discarded = discardAssessmentDraft(withDraft, MF_ID, at(1));
    expect(A(discarded).draft).toBeNull();
    expect(A(mergeProgress(discarded, withDraft)).draft).toBeNull();
    expect(A(mergeProgress(withDraft, discarded)).draft).toBeNull();
  });
  it("assessmentState with a bank reports a stale draft as not in progress", () => {
    const s = startAssessment(emptyProgress(), MF_ID, ["no-such-q"], [], at(0));
    expect(assessmentState(A(s), at(1), MF).inProgress).toBe(false);
  });
});

describe("attempt-linked remediation under clock skew", () => {
  it("remediation for attempt 1 does not unlock the retest after attempt 2, even when attempt 2 is stamped EARLIER (clock moved back)", () => {
    let { s } = attempt(emptyProgress(), 100, [safety]); // attempt 1 at t=101
    s = completeRemediation(s, MF_ID, safety, at(110)); // remediated at 110, for attempt 1
    expect(assessmentState(A(s), at(111)).canStart).toBe(true);
    // Clock moved back an hour: attempt 2 is stamped at t=41, before the remediation time.
    s = attempt(s, 40, [safety]).s;
    const st = assessmentState(A(s), at(50));
    expect(st.remediationRequired).toEqual([safety]);
    expect(st.canStart).toBe(false);
  });
  it("clock moved back after failing: remediation recorded afterwards still counts", () => {
    let { s } = attempt(emptyProgress(), 100, [safety]);
    s = completeRemediation(s, MF_ID, safety, at(30));
    expect(assessmentState(A(s), at(31)).canStart).toBe(true);
  });
  it("future grace: a remediation 4 minutes ahead counts, 6 minutes ahead does not", () => {
    let { s } = attempt(emptyProgress(), 0, [safety]);
    const now = at(10);
    s = completeRemediation(s, MF_ID, safety, new Date(now.getTime() + 4 * 60_000));
    expect(assessmentState(A(s), now).canStart).toBe(true);
    s = completeRemediation(s, MF_ID, safety, new Date(now.getTime() + 6 * 60_000));
    expect(assessmentState(A(s), now).canStart).toBe(false);
  });
  // Fixed (round 2): the gate follows the latest stored attempt whatever its date, so moving the
  // device clock back after a fail no longer hides the failed attempt and unlocks the retest.
  it("[BUG fixed] clock moved back 90 min after a fail: retest must stay locked until remediation", () => {
    const { s } = attempt(emptyProgress(), 100, [safety]);
    expect(assessmentState(A(s), at(10), MF).canStart).toBe(false);
  });
  it("merge: the later remediation's attempt link wins", () => {
    let { s } = attempt(emptyProgress(), 0, [safety]);
    const tabA = completeRemediation(s, MF_ID, safety, at(5));
    s = attempt(tabA, 10, [safety]).s; // attempt 2 fails again
    const tabB = completeRemediation(s, MF_ID, safety, at(20));
    const m1 = mergeProgress(tabA, tabB), m2 = mergeProgress(tabB, tabA);
    expect(assessmentState(A(m1), at(30)).canStart).toBe(true);
    expect(assessmentState(A(m2), at(30)).canStart).toBe(true);
  });
  it("hand-edited remediationFor pointing at the latest attempt with a timestamp BEFORE it is accepted (tampering, documented)", () => {
    let { s } = attempt(emptyProgress(), 100, [safety]);
    const last = A(s).attempts[0].at;
    s = { ...s, assessments: { [MF_ID]: { ...A(s), remediation: { [safety]: at(0).toISOString() }, remediationFor: { [safety]: last } } } };
    expect(assessmentState(A(s), at(200)).canStart).toBe(true);
  });
});

describe("remediation variant rotation", () => {
  const c = MF.concepts.find((x) => x.id === safety)!;
  it("every concept has ≥ 2 variants and their practice questions differ", () => {
    for (const b of BANKS) for (const k of b.concepts) {
      const vs = remediationVariants(k);
      expect(vs.length).toBeGreaterThanOrEqual(2);
      const prompts = vs.map((v) => JSON.stringify(v.practice));
      expect(new Set(prompts).size, `${k.id}: identical practice in two variants`).toBe(prompts.length);
    }
  });
  it("rotates 0 → 1 → 0 on the 1st, 2nd, 3rd miss; a correct attempt in between does not advance it", () => {
    let s = attempt(emptyProgress(), 0, [safety]).s;
    expect(remediationVariantIndex(c, A(s).attempts)).toBe(0);
    s = completeRemediation(s, MF_ID, safety, at(2));
    s = attempt(s, 10, [safety]).s;
    expect(remediationVariantIndex(c, A(s).attempts)).toBe(1);
    s = completeRemediation(s, MF_ID, safety, at(12));
    s = attempt(s, 20, [plain]).s; // passes (one plain miss)
    expect(remediationVariantIndex(c, A(s).attempts)).toBe(1);
    s = attempt(s, 30, [safety]).s; // practice retake, safety missed a 3rd time
    expect(remediationVariantIndex(c, A(s).attempts)).toBe(0);
  });
});

describe("practice retakes after a pass", () => {
  it("a failed practice retake keeps the pass, needs no remediation and never blocks practice", () => {
    let s = attempt(emptyProgress(), 0, [plain]).s; // pass at 92%
    s = attempt(s, 10, MF.concepts.map((x) => x.id)).s; // 0%
    const st = assessmentState(A(s), at(20), MF);
    expect(st.passed).toBe(true);
    expect(st.masteryScore).toBe(92);
    expect(st.remediationRequired).toEqual([]);
    expect(st.canStart).toBe(true);
    expect(st.lastIsPractice).toBe(true);
  });
  // Fixed (round 2): was "push the only passing attempt out of the capped history". Trimming now
  // always keeps the best passing attempt, so the pass and the mastery score survive.
  it(`[edge] ${MAX_ASSESSMENT_ATTEMPTS} failed practice retakes do not push the only passing attempt out of the capped history`, () => {
    let s = attempt(emptyProgress(), 0, []).s;
    const passAt = A(s).attempts[0].at;
    for (let k = 1; k <= MAX_ASSESSMENT_ATTEMPTS; k++) s = attempt(s, k * 10, [safety]).s;
    const st = assessmentState(A(s), at(100_000), MF);
    expect({ passed: st.passed, masteryScore: st.masteryScore, attempts: st.attempts }).toEqual({ passed: true, masteryScore: 100, attempts: MAX_ASSESSMENT_ATTEMPTS });
    expect(A(s).attempts[0].at).toBe(passAt);
    expect(st.lastIsPractice).toBe(true);
    // The pass also survives a parse round-trip and a merge with an older copy.
    expect(assessmentState(A(parseProgress(JSON.stringify(s)).state), at(100_000), MF).passed).toBe(true);
    const older = attempt(emptyProgress(), 0, []).s;
    expect(assessmentState(A(mergeProgress(s, older)), at(100_000), MF).passed).toBe(true);
  });
});

describe("floored percentages", () => {
  it("26/29 shows 89, 13/14 shows 92, 9/10 shows 90 and passes", () => {
    const mk = (n: number, c: number) => scoreAttempt(Array.from({ length: n }, (_, i) => ({ q: `q${i}`, c: `c${i}`, ok: i < c, applied: i === 0 })));
    expect([mk(29, 26).pct, mk(14, 13).pct, mk(10, 9).pct]).toEqual([89, 92, 90]);
    expect(mk(10, 9).passed).toBe(true);
    expect(mk(29, 26).passed).toBe(false);
  });
});
