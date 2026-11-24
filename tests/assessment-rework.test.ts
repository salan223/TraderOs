/** Step-1 rework: no recycling, per-learner seeds, stale drafts, practice after a pass, order-based remediation, variants. */
import { describe, expect, it } from "vitest";
import {
  assessmentState, drawSeed, gradeAttempt, isDraftValid, newLearnerSeed, remediationDone, remediationVariantIndex,
  remediationVariants, scoreAttempt, selectQuestions,
} from "@/lib/academy/assessment";
import { ASSESSMENTS } from "@/lib/academy/assessments";
import { correctAnswer } from "@/lib/academy/interactions";
import {
  completeRemediation, discardAssessmentDraft, emptyProgress, ensureAssessmentSeed, getAssessmentProgress, mergeProgress,
  parseProgress, resetProgress, startAssessment, submitAssessment, type AssessmentAttempt, type ProgressState,
} from "@/lib/academy/progress";
import type { TrackAssessment } from "@/lib/academy/types";

const BANKS = Object.values(ASSESSMENTS);
const MF = ASSESSMENTS["market-foundations"];
const T0 = new Date("2026-11-20T10:00:00Z");
const at = (min: number) => new Date(T0.getTime() + min * 60_000);
const conceptOf = (b: TrackAssessment, q: string) => b.questions.find((x) => x.id === q)!.concept;

/** Fail `n` attempts in a row (wrong on `wrong`, or on everything), returning each attempt's questions. */
function failRepeatedly(b: TrackAssessment, n: number, seed: string, wrong?: string[]) {
  const hist: AssessmentAttempt[] = [];
  const draws: { qs: string[]; reused: string[] }[] = [];
  for (let k = 1; k <= n; k++) {
    const sel = selectQuestions(b, hist, drawSeed(b.trackId, k, seed));
    draws.push({ qs: sel.questionIds, reused: sel.reusedConcepts });
    hist.push({ at: at(k).toISOString(), items: sel.questionIds.map((q) => ({ q, c: conceptOf(b, q), ok: wrong ? !wrong.includes(conceptOf(b, q)) : false })) });
  }
  return { draws, hist };
}

describe("retests never recycle while a pool has unseen questions", () => {
  for (const b of BANKS) {
    it(`${b.trackId}: four attempts in a row share no question and report no reuse`, () => {
      const { draws } = failRepeatedly(b, 4, "learner1");
      const all = draws.flatMap((d) => d.qs);
      expect(new Set(all).size).toBe(all.length);
      for (const d of draws) expect(d.reused).toEqual([]);
    });
    it(`${b.trackId}: every attempt draws a fresh question for EVERY concept, not only missed ones`, () => {
      const { draws } = failRepeatedly(b, 3, "learner2", [b.concepts[0].id]);
      for (let k = 1; k < draws.length; k++) for (const q of draws[k].qs) expect(draws.slice(0, k).some((d) => d.qs.includes(q))).toBe(false);
    });
    it(`${b.trackId}: a missed concept's questions do not repeat until its pool is exhausted, then reuse is reported`, () => {
      const c = b.concepts.find((x) => x.safetyCritical) ?? b.concepts[0];
      const pool = b.questions.filter((q) => q.concept === c.id).length;
      const { draws } = failRepeatedly(b, pool + 1, "learner3", [c.id]);
      const forC = draws.map((d) => d.qs.find((q) => conceptOf(b, q) === c.id)!);
      expect(new Set(forC.slice(0, pool)).size).toBe(pool);
      expect(draws[pool].reused).toContain(c.id);
    });
  }
});

describe("per-learner seed", () => {
  it("the first attempt differs between learners (seeded per learner, not globally)", () => {
    const firsts = new Set(Array.from({ length: 12 }, (_, i) => selectQuestions(MF, [], drawSeed(MF.trackId, 1, `seed${i}x`)).questionIds.join()));
    expect(firsts.size).toBeGreaterThan(6);
  });
  it("the same learner gets the same draw for the same attempt (refresh-safe)", () => {
    expect(selectQuestions(MF, [], drawSeed(MF.trackId, 1, "abcdef"))).toEqual(selectQuestions(MF, [], drawSeed(MF.trackId, 1, "abcdef")));
  });
  it("newLearnerSeed gives valid, varied seeds", () => {
    const seeds = new Set(Array.from({ length: 20 }, () => newLearnerSeed()));
    expect(seeds.size).toBe(20);
    for (const s of seeds) expect(s).toMatch(/^[a-z0-9]{6,16}$/);
  });
  it("startAssessment stores the seed once and keeps it; ensureAssessmentSeed never overwrites", () => {
    const sel = selectQuestions(MF, [], "x");
    let s = startAssessment(emptyProgress(), MF.trackId, sel.questionIds, [], at(0), "firstseed");
    expect(getAssessmentProgress(s, MF.trackId)!.seed).toBe("firstseed");
    s = submitAssessment(s, MF.trackId, gradeAttempt(MF, sel.questionIds, {}), at(1));
    s = startAssessment(s, MF.trackId, sel.questionIds, [], at(2), "otherseed");
    expect(getAssessmentProgress(s, MF.trackId)!.seed).toBe("firstseed");
    expect(getAssessmentProgress(ensureAssessmentSeed(s, MF.trackId, "zzzzzz", at(3)), MF.trackId)!.seed).toBe("firstseed");
  });
  it("seed survives parse, merges to one value, and junk seeds are dropped", () => {
    const sel = selectQuestions(MF, [], "x");
    const a = startAssessment(emptyProgress(), MF.trackId, sel.questionIds, [], at(0), "bbbbbb");
    const b = startAssessment(emptyProgress(), MF.trackId, sel.questionIds, [], at(0), "aaaaaa");
    expect(parseProgress(JSON.parse(JSON.stringify(a))).state.assessments![MF.trackId].seed).toBe("bbbbbb");
    expect(mergeProgress(a, b).assessments![MF.trackId].seed).toBe("aaaaaa");
    expect(mergeProgress(b, a).assessments![MF.trackId].seed).toBe("aaaaaa");
    const junk = parseProgress({ version: 1, updatedAt: null, lessons: {}, assessments: { [MF.trackId]: { attempts: [], remediation: {}, draft: null, seed: "<script>" } } });
    expect(junk.state.assessments?.[MF.trackId]?.seed).toBeUndefined();
  });
});

describe("drafts that no longer match the bank", () => {
  const sel = selectQuestions(MF, [], "x");
  it("a full, current draft is valid", () => expect(isDraftValid(MF, { questionIds: sel.questionIds })).toBe(true));
  it("unknown ids, a partial draw, or two questions for one concept are invalid", () => {
    expect(isDraftValid(MF, { questionIds: ["no-such-q", "also-gone"] })).toBe(false);
    expect(isDraftValid(MF, { questionIds: [sel.questionIds[0], "no-such-q"] })).toBe(false);
    expect(isDraftValid(MF, { questionIds: sel.questionIds.slice(1) })).toBe(false);
    const c0 = conceptOf(MF, sel.questionIds[0]);
    const twin = MF.questions.find((q) => q.concept === c0 && q.id !== sel.questionIds[0])!.id;
    expect(isDraftValid(MF, { questionIds: [...sel.questionIds.slice(1), sel.questionIds[0], twin] })).toBe(false);
    expect(isDraftValid(MF, null)).toBe(false);
  });
  it("assessmentState (with the bank) does not report a stale draft as in progress", () => {
    const s = startAssessment(emptyProgress(), MF.trackId, ["no-such-q", "also-gone"], [], at(0));
    expect(assessmentState(getAssessmentProgress(s, MF.trackId), at(1), MF).inProgress).toBe(false);
    expect(assessmentState(getAssessmentProgress(s, MF.trackId), at(1)).inProgress).toBe(true);
  });
  it("discardAssessmentDraft closes the draft with a tombstone, so a merge cannot bring it back", () => {
    const s = startAssessment(emptyProgress(), MF.trackId, ["no-such-q"], [], at(0));
    const d = discardAssessmentDraft(s, MF.trackId, at(1));
    expect(getAssessmentProgress(d, MF.trackId)!.draft).toBeNull();
    expect(mergeProgress(s, d).assessments![MF.trackId].draft).toBeNull();
    expect(discardAssessmentDraft(d, MF.trackId, at(2))).toBe(d);
  });
  it("attempts naming concepts the bank no longer has never require remediation", () => {
    const p = { attempts: [{ at: at(0).toISOString(), items: [{ q: "gone", c: "gone", ok: false, safety: true, critical: true }] }], remediation: {}, draft: null };
    const a = assessmentState(p, at(1), MF);
    expect(a.remediationRequired).toEqual([]);
    expect(a.canStart).toBe(true);
  });
});

/** Grade every question right except those of `wrong` concepts. */
function attempt(b: TrackAssessment, s: ProgressState, when: Date, wrong: string[]) {
  const prev = getAssessmentProgress(s, b.trackId)?.attempts ?? [];
  const sel = selectQuestions(b, prev, drawSeed(b.trackId, prev.length + 1, "seedxx"));
  s = startAssessment(s, b.trackId, sel.questionIds, sel.reusedConcepts, when, "seedxx");
  const answers = Object.fromEntries(sel.questionIds.filter((q) => !wrong.includes(conceptOf(b, q))).map((q) => [q, correctAnswer(b.questions.find((x) => x.id === q)!.item)]));
  return submitAssessment(s, b.trackId, gradeAttempt(b, sel.questionIds, answers), new Date(when.getTime() + 60_000), answers);
}

describe("practice after a pass", () => {
  it("a failed practice retake keeps the pass and the best score, and never requires remediation", () => {
    let s = attempt(MF, emptyProgress(), at(0), []);
    const best = assessmentState(getAssessmentProgress(s, MF.trackId), at(10), MF).masteryScore;
    s = attempt(MF, s, at(20), MF.concepts.map((c) => c.id));
    const a = assessmentState(getAssessmentProgress(s, MF.trackId), at(30), MF);
    expect(a.passed).toBe(true);
    expect(a.masteryScore).toBe(best);
    expect(a.last!.passed).toBe(false);
    expect(a.lastIsPractice).toBe(true);
    expect(a.remediationRequired).toEqual([]);
    expect(a.canStart).toBe(true);
  });
  it("before any pass, the latest attempt is not practice and its misses gate the retest", () => {
    const s = attempt(MF, emptyProgress(), at(0), [MF.concepts[0].id, MF.concepts[1].id]);
    const a = assessmentState(getAssessmentProgress(s, MF.trackId), at(10), MF);
    expect(a.lastIsPractice).toBe(false);
    expect(a.canStart).toBe(false);
  });
});

describe("remediation gating by order, not by clock", () => {
  const c = MF.concepts.find((x) => x.safetyCritical)!.id;
  it("a remediation stamped more than 5 minutes in the future does not count", () => {
    let s = attempt(MF, emptyProgress(), at(0), [c]);
    s = completeRemediation(s, MF.trackId, c, at(60));
    expect(assessmentState(getAssessmentProgress(s, MF.trackId), at(10), MF).canStart).toBe(false);
    expect(assessmentState(getAssessmentProgress(s, MF.trackId), at(58), MF).canStart).toBe(true);
  });
  it("a remediation recorded after the attempt counts even if the clock went backwards", () => {
    let s = attempt(MF, emptyProgress(), at(10), [c]);
    s = completeRemediation(s, MF.trackId, c, at(2));
    const p = getAssessmentProgress(s, MF.trackId)!;
    expect(p.remediationFor![c]).toBe(p.attempts.at(-1)!.at);
    expect(assessmentState(p, at(2), MF).canStart).toBe(true);
  });
  it("a remediation recorded for an EARLIER attempt does not unlock the next retest", () => {
    let s = attempt(MF, emptyProgress(), at(0), [c]);
    s = completeRemediation(s, MF.trackId, c, at(5));
    s = attempt(MF, s, at(10), [c]);
    const p = getAssessmentProgress(s, MF.trackId)!;
    expect(remediationDone(p, c, p.attempts.at(-1)!.at, at(20))).toBe(false);
    expect(assessmentState(p, at(20), MF).remediationPending).toEqual([c]);
  });
  it("remediationFor survives parse and merge, is dropped by reset, and junk entries are removed", () => {
    let s = attempt(MF, emptyProgress(), at(0), [c]);
    s = completeRemediation(s, MF.trackId, c, at(5));
    const parsed = parseProgress(JSON.parse(JSON.stringify(s))).state;
    expect(parsed.assessments![MF.trackId].remediationFor).toEqual(s.assessments![MF.trackId].remediationFor);
    expect(mergeProgress(emptyProgress(), s).assessments![MF.trackId].remediationFor).toEqual(s.assessments![MF.trackId].remediationFor);
    expect(mergeProgress(s, resetProgress(at(20))).assessments?.[MF.trackId]).toBeUndefined();
    const junk = parseProgress({ ...JSON.parse(JSON.stringify(s)), assessments: { [MF.trackId]: { ...s.assessments![MF.trackId], remediationFor: { [c]: "nope", other: at(1).toISOString() } } } });
    expect(junk.state.assessments![MF.trackId].remediationFor).toBeUndefined();
  });
});

describe("remediation variants rotate across failures", () => {
  it("every concept has at least two variants", () => {
    for (const b of BANKS) for (const c of b.concepts) expect(remediationVariants(c).length, c.id).toBeGreaterThanOrEqual(2);
  });
  it("the first miss shows variant 0, the second miss variant 1, then it wraps", () => {
    const c = MF.concepts[0];
    const miss = (k: number): AssessmentAttempt => ({ at: at(k).toISOString(), items: [{ q: `q${k}`, c: c.id, ok: false }] });
    const hit = (k: number): AssessmentAttempt => ({ at: at(k).toISOString(), items: [{ q: `q${k}`, c: c.id, ok: true }] });
    const n = remediationVariants(c).length;
    expect(remediationVariantIndex(c, [miss(0)])).toBe(0);
    expect(remediationVariantIndex(c, [miss(0), hit(1), miss(2)])).toBe(1 % n);
    expect(remediationVariantIndex(c, [miss(0), miss(1), miss(2)])).toBe(2 % n);
    expect(remediationVariantIndex(c, [])).toBe(0);
  });
});

describe("displayed percentages never contradict the pass rule", () => {
  it("is floored: every fail on score shows below 90%, every pass at 90% or more", () => {
    for (let n = 10; n <= 40; n++) for (let k = 0; k <= n; k++) {
      const items = Array.from({ length: n }, (_, i) => ({ q: `q${i}`, c: `c${i}`, ok: i < k, applied: i === 0 }));
      const s = scoreAttempt(items);
      expect(s.scoreOk ? s.pct >= 90 : s.pct < 90, `${k}/${n} → ${s.pct}%`).toBe(true);
    }
  });
});

describe("attempt sequence numbers (round 3)", () => {
  const MF_ID = MF.trackId;
  const c = MF.concepts.find((x) => x.safetyCritical)!.id;
  const A = (s: ProgressState) => getAssessmentProgress(s, MF_ID)!;
  const submit = (s: ProgressState, min: number, wrong: string[], seed = "seqseed1") => {
    const cur = s.assessments?.[MF_ID];
    const sel = selectQuestions(MF, cur?.attempts ?? [], drawSeed(MF_ID, (cur?.attempts.length ?? 0) + 1, seed));
    s = startAssessment(s, MF_ID, sel.questionIds, sel.reusedConcepts, at(min), seed);
    return submitAssessment(s, MF_ID, gradeAttempt(MF, sel.questionIds, {}).map((r) => ({ ...r, ok: !wrong.includes(r.c) })), at(min + 1));
  };
  it("submit assigns max + 1, whatever the dates", () => {
    let s = submit(emptyProgress(), 100, [c]);
    s = submit(s, 20, [c]); // clock moved back
    expect(A(s).attempts.map((x) => x.seq)).toEqual([1, 2]);
    expect(A(parseProgress(JSON.stringify(s)).state).attempts.map((x) => x.at)).toEqual([at(101).toISOString(), at(21).toISOString()]);
  });
  it("old data without seq is numbered in stored order, not date order, deterministically", () => {
    let s = submit(emptyProgress(), 100, [c]);
    s = submit(s, 20, [c]);
    const raw = JSON.parse(JSON.stringify(s));
    for (const x of raw.assessments[MF_ID].attempts) delete x.seq;
    delete raw.assessments[MF_ID].remediationForSeq;
    const p1 = A(parseProgress(raw).state), p2 = A(parseProgress(JSON.parse(JSON.stringify(raw))).state);
    expect(p1.attempts.map((x) => [x.seq, x.at])).toEqual([[1, at(101).toISOString()], [2, at(21).toISOString()]]);
    expect(p2).toEqual(p1);
  });
  it("remediation links name the attempt's seq; a remediation for attempt 1 does not count for attempt 2", () => {
    let s = submit(emptyProgress(), 0, [c]);
    s = completeRemediation(s, MF_ID, c, at(5));
    expect(A(s).remediationForSeq).toEqual({ [c]: 1 });
    s = submit(s, 10, [c]);
    expect(assessmentState(A(s), at(20), MF).canStart).toBe(false);
    s = completeRemediation(s, MF_ID, c, at(21));
    expect(A(s).remediationForSeq).toEqual({ [c]: 2 });
    expect(assessmentState(A(parseProgress(JSON.stringify(s)).state), at(22), MF).canStart).toBe(true);
  });
  it("two tabs that both submit attempt N: both kept, the same order either way, and the gate needs remediation", () => {
    let base = submit(emptyProgress(), 0, [c]);
    base = completeRemediation(base, MF_ID, c, at(2));
    const tabA = submit(base, 10, [c], "seqseed1");
    const tabB = submitAssessment(base, MF_ID, A(tabA).attempts[1].items.map((i) => ({ ...i, ok: true })), at(12));
    expect(A(tabA).attempts[1].seq).toBe(2);
    expect(A(tabB).attempts[1].seq).toBe(2);
    const m1 = mergeProgress(tabA, tabB), m2 = mergeProgress(tabB, tabA);
    expect(A(m1).attempts).toHaveLength(3);
    expect(A(m1).attempts).toEqual(A(m2).attempts);
    // Tie on seq 2: broken by time, so tab B's later attempt (a pass) is last; the track is passed.
    expect(A(m1).attempts.at(-1)!.at).toBe(at(12).toISOString());
    expect(assessmentState(A(m1), at(20), MF).passed).toBe(true);
    // The next submit continues at 3.
    expect(A(submit(m1, 30, [])).attempts.at(-1)!.seq).toBe(3);
  });
  it("two tabs: a stale tab's draft is closed by the other tab's submit, so one draft gives one attempt", () => {
    const sel = selectQuestions(MF, [], "x");
    const started = startAssessment(emptyProgress(), MF_ID, sel.questionIds, [], at(0));
    const submitted = submitAssessment(started, MF_ID, gradeAttempt(MF, sel.questionIds, {}), at(5));
    const merged = mergeProgress(started, submitted);
    expect(A(merged).draft).toBeNull();
    expect(A(merged).attempts.map((x) => x.seq)).toEqual([1]);
    expect(A(mergeProgress(submitted, parseProgress(JSON.stringify(submitted)).state)).attempts).toHaveLength(1);
  });
});
