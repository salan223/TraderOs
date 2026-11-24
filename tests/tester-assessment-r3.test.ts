/** Tester Phase 2 step 1, round 3: clock skew after the gate fix, capAttempts, pass future grace. */
import { describe, expect, it } from "vitest";
import { PASS_FUTURE_GRACE_MS, assessmentState, drawSeed, gradeAttempt, selectQuestions } from "@/lib/academy/assessment";
import { ASSESSMENTS } from "@/lib/academy/assessments";
import {
  MAX_ASSESSMENT_ATTEMPTS, capAttempts, completeRemediation, emptyProgress, mergeProgress, parseProgress, startAssessment, submitAssessment,
  type ProgressState,
} from "@/lib/academy/progress";

const MF_ID = "market-foundations";
const MF = ASSESSMENTS[MF_ID];
const T0 = new Date("2026-11-20T10:00:00Z");
const at = (min: number) => new Date(T0.getTime() + min * 60_000);
const safety = MF.concepts.find((c) => c.safetyCritical)!.id;
const plain = MF.concepts.find((c) => !c.critical && !c.safetyCritical && !c.applied)!.id;
const A = (s: ProgressState) => s.assessments![MF_ID];
const reload = (s: ProgressState) => parseProgress(JSON.stringify(s)).state;

function attempt(s: ProgressState, minute: number, wrong: string[]) {
  const cur = s.assessments?.[MF_ID];
  const sel = selectQuestions(MF, cur?.attempts ?? [], drawSeed(MF_ID, (cur?.attempts.length ?? 0) + 1, "seed1234"));
  s = startAssessment(s, MF_ID, sel.questionIds, sel.reusedConcepts, at(minute), "seed1234");
  const items = gradeAttempt(MF, sel.questionIds, {}).map((r) => ({ ...r, ok: !wrong.includes(r.c) }));
  return submitAssessment(s, MF_ID, items, at(minute + 1));
}

describe("gate under clock skew", () => {
  it("clock moved back after a fail: locked, before and after a reload", () => {
    const s = attempt(emptyProgress(), 100, [safety]);
    expect(assessmentState(A(s), at(10), MF).canStart).toBe(false);
    expect(assessmentState(A(reload(s)), at(10), MF).canStart).toBe(false);
  });
  it("clock moved back, remediate, retest fails the SAME concept: retest locked in this tab", () => {
    let s = attempt(emptyProgress(), 100, [safety]); // fail at 101
    s = completeRemediation(s, MF_ID, safety, at(10)); // clock now 90 min behind
    s = attempt(s, 20, [safety]); // second fail, stamped 21 (earlier than 101)
    expect(assessmentState(A(s), at(30), MF).canStart).toBe(false);
  });
  // Fixed (round 3): attempts carry a sequence number assigned on submit, and parse and merge order
  // by it (not by date), so after a reload the latest RECORDED attempt still gates the retest.
  it("[BUG fixed] …and after a reload (parse sorts attempts by date) the retest must STILL be locked", () => {
    let s = attempt(emptyProgress(), 100, [safety]);
    s = completeRemediation(s, MF_ID, safety, at(10));
    s = attempt(s, 20, [safety]);
    const r = reload(s);
    const st = assessmentState(A(r), at(30), MF);
    expect({ canStart: st.canStart, lastAt: st.last?.at }).toEqual({ canStart: false, lastAt: at(21).toISOString() });
  });
  it("[BUG fixed] clock forward 3 h then back: fail, remediate, retest fails again, reload → still locked", () => {
    let s = attempt(emptyProgress(), 180, [plain, safety]); // clock 3 h ahead
    s = completeRemediation(s, MF_ID, safety, at(5)); // corrected clock
    s = completeRemediation(s, MF_ID, plain, at(6));
    expect(assessmentState(A(s), at(7), MF).canStart).toBe(true);
    s = attempt(s, 10, [safety]);
    expect(assessmentState(A(s), at(12), MF).canStart).toBe(false);
    expect(assessmentState(A(reload(s)), at(12), MF).canStart).toBe(false);
  });
  it("clock forward 3 h then back: a remediation made while ahead is ignored once corrected (redo needed), then works", () => {
    let s = attempt(emptyProgress(), 180, [safety]);
    s = completeRemediation(s, MF_ID, safety, at(185)); // still ahead
    expect(assessmentState(A(s), at(0), MF).canStart).toBe(false); // 3 h "in the future" now
    s = completeRemediation(s, MF_ID, safety, at(1));
    expect(assessmentState(A(s), at(2), MF).canStart).toBe(true);
  });
});

describe("pass future grace", () => {
  const passAt = (hoursAhead: number) => {
    const now = at(0);
    let s = emptyProgress();
    const sel = selectQuestions(MF, [], "x");
    s = startAssessment(s, MF_ID, sel.questionIds, [], now);
    s = submitAssessment(s, MF_ID, gradeAttempt(MF, sel.questionIds, {}).map((r) => ({ ...r, ok: true })), new Date(now.getTime() + hoursAhead * 3600_000));
    return assessmentState(A(reload(s)), now, MF);
  };
  it("grace is 24 h", () => expect(PASS_FUTURE_GRACE_MS).toBe(24 * 3600_000));
  it("a pass 23 h ahead counts", () => expect(passAt(23).passed).toBe(true));
  it("a pass 25 h ahead does not count", () => expect(passAt(25).passed).toBe(false));
  it("a pass 25 h ahead: no remediation is demanded either (last attempt is a pass)", () => expect(passAt(25).canStart).toBe(true));
});

describe("capAttempts", () => {
  const many = (n: number, passFirst = true) => {
    let s = attempt(emptyProgress(), 0, passFirst ? [plain] : [safety]); // 92% pass
    for (let k = 1; k <= n; k++) s = attempt(s, k * 10, [safety]);
    return s;
  };
  it.each([31, 45])("%i failed practice retakes after a 92%% pass: pass kept through submit, parse and merge", (n) => {
    const s = many(n);
    expect(A(s).attempts.length).toBe(MAX_ASSESSMENT_ATTEMPTS);
    for (const v of [s, reload(s), mergeProgress(s, reload(s)), mergeProgress(many(3), s), mergeProgress(s, many(3))]) {
      const st = assessmentState(A(v), at(100_000), MF);
      expect({ passed: st.passed, mastery: st.masteryScore }).toEqual({ passed: true, mastery: 92 });
      expect(A(v).attempts.length).toBeLessThanOrEqual(MAX_ASSESSMENT_ATTEMPTS);
      // the latest attempt is always kept
      expect(A(v).attempts.at(-1)!.at).toBe(at(n * 10 + 1).toISOString());
    }
  });
  it("a later better pass replaces the kept one; mastery is the best", () => {
    let s = many(10);
    s = attempt(s, 500, []); // 100% practice pass
    for (let k = 0; k < 35; k++) s = attempt(s, 600 + k * 10, [safety]);
    expect(assessmentState(A(s), at(100_000), MF).masteryScore).toBe(100);
  });
  it("hand-edited storage with 60 attempts is capped on parse and keeps the pass", () => {
    const s = many(29);
    const raw = JSON.parse(JSON.stringify(s));
    const extra = raw.assessments[MF_ID].attempts.slice(1).map((x: { at: string }, i: number) => ({ ...x, at: at(5000 + i).toISOString() }));
    raw.assessments[MF_ID].attempts.push(...extra);
    const p = parseProgress(raw).state;
    expect(A(p).attempts.length).toBe(MAX_ASSESSMENT_ATTEMPTS);
    expect(assessmentState(A(p), at(100_000), MF).passed).toBe(true);
  });
  // Fixed (round 3): was "is chosen as 'best' and can evict the real pass". capAttempts now picks the
  // best pass only among passes inside the 24 h future grace, so the real pass is kept.
  it("[edge] a corrupt pass dated > 24 h ahead is NOT chosen as 'best' and cannot evict the real pass", () => {
    let s = many(0); // real 92% pass at minute 1
    const cur = A(s);
    const fake = { at: at(60 * 24 * 30).toISOString(), items: cur.attempts[0].items.map((i) => ({ ...i, ok: true })) }; // 100%, 30 days ahead
    const fails = Array.from({ length: 30 }, (_, k) => ({ at: at(10 + k).toISOString(), items: cur.attempts[0].items.map((i) => ({ ...i, ok: i.c !== safety })) }));
    const capped = capAttempts([cur.attempts[0], ...fails, fake], at(100));
    s = { ...s, assessments: { [MF_ID]: { ...cur, attempts: capped } } };
    const st = assessmentState(A(s), at(100), MF);
    expect(capped[0]).toEqual(cur.attempts[0]);
    expect({ passed: st.passed, mastery: st.masteryScore }).toEqual({ passed: true, mastery: 92 });
  });
});
