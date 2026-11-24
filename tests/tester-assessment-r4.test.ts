/** Tester Phase 2 step 1, round 4: attempt seq, remediationForSeq, merge laws, backfill exploits. */
import { describe, expect, it } from "vitest";
import { assessmentState, drawSeed, gradeAttempt, orderAttempts, selectQuestions } from "@/lib/academy/assessment";
import { ASSESSMENTS } from "@/lib/academy/assessments";
import {
  MAX_ASSESSMENT_ATTEMPTS, completeRemediation, emptyProgress, mergeProgress, parseProgress, resetProgress, startAssessment, submitAssessment,
  type AssessmentAttempt, type ProgressState,
} from "@/lib/academy/progress";

const MF_ID = "market-foundations";
const MF = ASSESSMENTS[MF_ID];
const T0 = new Date("2026-11-20T10:00:00Z");
const at = (min: number) => new Date(T0.getTime() + min * 60_000);
const NOW = at(100_000);
const safety = MF.concepts.find((c) => c.safetyCritical)!.id;
const plain = MF.concepts.find((c) => !c.critical && !c.safetyCritical && !c.applied)!.id;
const A = (s: ProgressState) => s.assessments![MF_ID];
const reload = (s: ProgressState) => parseProgress(JSON.parse(JSON.stringify(s))).state;
const gate = (s: ProgressState, now = NOW) => assessmentState(A(s), now, MF);

function attempt(s: ProgressState, minute: number, wrong: string[]) {
  const cur = s.assessments?.[MF_ID];
  const sel = selectQuestions(MF, orderAttempts(cur?.attempts ?? []), drawSeed(MF_ID, (cur?.attempts.length ?? 0) + 1, "seed1234"));
  s = startAssessment(s, MF_ID, sel.questionIds, sel.reusedConcepts, at(minute), "seed1234");
  const items = gradeAttempt(MF, sel.questionIds, {}).map((r) => ({ ...r, ok: !wrong.includes(r.c) }));
  return submitAssessment(s, MF_ID, items, at(minute + 1));
}
/** Raw attempt object (for hand-built stored data). */
const raw = (minute: number, wrong: string[], k = 0, seq?: unknown) => {
  const items = MF.concepts.map((c) => {
    const q = MF.questions.filter((x) => x.concept === c.id)[k];
    const it: Record<string, unknown> = { q: q.id, c: c.id, ok: !wrong.includes(c.id) };
    if (c.safetyCritical) it.safety = true;
    if (c.critical || c.safetyCritical) it.critical = true;
    if (c.applied) it.applied = true;
    return it;
  });
  const o: Record<string, unknown> = { at: at(minute).toISOString(), items };
  if (seq !== undefined) o.seq = seq;
  return o;
};
const stateWith = (a: Record<string, unknown>) => parseProgress({ version: 1, updatedAt: at(0).toISOString(), lessons: {}, assessments: { [MF_ID]: { remediation: {}, draft: null, ...a } } });

describe("clock change + reload, both directions", () => {
  for (const [name, first, remAt, second] of [
    ["clock back 90 min", 100, 10, 20],
    ["clock forward 3 h then corrected", 180, 5, 10],
    ["clock back 2 days", 3000, 10, 20],
  ] as const) {
    it(`${name}: fail, remediate, fail again → locked in-tab, after reload, after double reload and after merge with an older copy`, () => {
      let s = attempt(emptyProgress(), first, [safety]);
      const older = s;
      s = completeRemediation(s, MF_ID, safety, at(remAt));
      expect(gate(s, at(remAt + 1)).canStart).toBe(true);
      s = attempt(s, second, [safety]);
      const now = at(second + 2);
      for (const v of [s, reload(s), reload(reload(s)), mergeProgress(s, older), mergeProgress(older, s), reload(mergeProgress(older, reload(s)))]) {
        const g = gate(v, now);
        expect({ canStart: g.canStart, lastAt: g.last?.at }).toEqual({ canStart: false, lastAt: at(second + 1).toISOString() });
      }
    });
  }
});

describe("stored seq values", () => {
  it.each([
    ["negative", -1], ["zero", 0], ["non-integer", 1.5], ["huge (> 1e9)", 1e12], ["string", "2"], ["NaN-like null", null],
  ])("%s seq on the later fail is dropped and backfilled in stored order: still locked", (_, bad) => {
    // a1 (fail, remediated, seq 1) then a2 (fail, not remediated, corrupt seq), stored in recorded order.
    const s = stateWith({ attempts: [raw(100, [safety], 0, 1), raw(20, [safety], 1, bad)], remediation: { [safety]: at(25).toISOString() }, remediationFor: { [safety]: at(100).toISOString() }, remediationForSeq: { [safety]: 1 } });
    expect(gate(s.state, at(30)).canStart).toBe(false);
  });
  it("duplicate seq (two tabs both wrote seq 2): both kept; the gate is deterministic and locked either way", () => {
    const base = { remediation: { [safety]: at(50).toISOString() }, remediationFor: { [safety]: at(10).toISOString() }, remediationForSeq: { [safety]: 1 } };
    const s1 = stateWith({ ...base, attempts: [raw(10, [safety], 0, 1), raw(60, [safety], 1, 2), raw(70, [plain, safety], 2, 2)] }).state;
    const s2 = stateWith({ ...base, attempts: [raw(10, [safety], 0, 1), raw(70, [plain, safety], 2, 2), raw(60, [safety], 1, 2)] }).state;
    expect(A(s1).attempts.length).toBe(3);
    expect(gate(s1).last?.at).toBe(gate(s2).last?.at);
    expect(gate(s1).canStart).toBe(false);
  });
  it("[probe] duplicate seq where the remediated attempt has the LATER date: who wins?", () => {
    // Tab A failed seq 2 at minute 60 (remediated); tab B failed seq 2 at minute 70 with a new miss, not remediated.
    const s = stateWith({
      attempts: [raw(10, [plain], 0, 1), raw(80, [safety], 1, 2), raw(70, [plain], 2, 2)],
      remediation: { [safety]: at(90).toISOString(), [plain]: at(5).toISOString() },
      remediationFor: { [safety]: at(80).toISOString() }, remediationForSeq: { [safety]: 2 },
    }).state;
    // Last by (seq, date) is the minute-80 attempt; its only miss (safety) is remediated → unlocks,
    // although the minute-70 attempt's miss (plain) was never remediated for that attempt.
    const g = gate(s);
    console.log("duplicate-seq probe:", { canStart: g.canStart, last: g.last?.at, required: g.remediationRequired });
    expect(g.last?.at).toBe(at(80).toISOString());
  });
  it("gaps in seq are harmless: order kept, next submit is max+1", () => {
    let s = stateWith({ attempts: [raw(10, [safety], 0, 3), raw(20, [safety], 1, 40)] }).state;
    s = attempt(s, 30, [plain]);
    expect(orderAttempts(A(s).attempts).map((x) => x.seq)).toEqual([3, 40, 41]);
  });
  it("[probe] seq 1e9 then a submit: the new seq 1e9+1 is invalid on parse; order and gate still hold", () => {
    let s = stateWith({ attempts: [raw(10, [], 0, 1e9)] }).state; // pass with max allowed seq
    s = attempt(s, 20, [safety]);
    const r = parseProgress(JSON.parse(JSON.stringify(s)));
    console.log("seq 1e9 probe issues:", r.issues);
    expect(orderAttempts(A(r.state).attempts).at(-1)!.at).toBe(at(21).toISOString());
  });
});

describe("old data without seq (backfill in stored order)", () => {
  it("stored order, not date order, decides the last attempt", () => {
    const s = stateWith({ attempts: [raw(100, [safety], 0), raw(20, [safety], 1)], remediation: { [safety]: at(25).toISOString() }, remediationFor: { [safety]: at(100).toISOString() } }).state;
    expect(gate(s, at(30)).canStart).toBe(false);
  });
  it("[exploit attempt] reorder old (no-seq) attempts in storage so a remediated one is last → unlocks (needs hand-editing: inherent)", () => {
    const s = stateWith({ attempts: [raw(20, [safety], 1), raw(100, [safety], 0)], remediation: { [safety]: at(25).toISOString() }, remediationFor: { [safety]: at(100).toISOString() } }).state;
    expect(gate(s, at(30)).canStart).toBe(true);
  });
  it("mixed: seq'd attempts plus no-seq ones appended later by an old tab are numbered after them", () => {
    const s = stateWith({ attempts: [raw(10, [safety], 0, 1), raw(20, [safety], 1, 2), raw(5, [safety], 2)] }).state;
    expect(orderAttempts(A(s).attempts).map((x) => [x.seq, x.at])).toEqual([[1, at(10).toISOString()], [2, at(20).toISOString()], [3, at(5).toISOString()]]);
  });
});

describe("merge laws with seq", () => {
  const build = () => {
    let a = attempt(emptyProgress(), 0, [safety]);
    a = completeRemediation(a, MF_ID, safety, at(2));
    let b = attempt(a, 10, [plain, safety]);
    b = completeRemediation(b, MF_ID, plain, at(12));
    a = attempt(a, 20, [safety]); // a's own second attempt (also seq 2): two tabs, save-failure mode
    return { a, b };
  };
  const canon = (v: unknown): unknown => Array.isArray(v) ? v.map(canon) : v && typeof v === "object" ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, canon((v as Record<string, unknown>)[k])])) : v;
  const norm = (s: ProgressState) => JSON.stringify(canon({ ...A(s), attempts: orderAttempts(A(s).attempts) }));
  it("commutative", () => {
    const { a, b } = build();
    expect(norm(mergeProgress(a, b))).toBe(norm(mergeProgress(b, a)));
  });
  it("idempotent", () => {
    const { a, b } = build();
    const m = mergeProgress(a, b);
    expect(norm(mergeProgress(m, m))).toBe(norm(m));
    expect(norm(mergeProgress(m, a))).toBe(norm(m));
    expect(norm(mergeProgress(m, b))).toBe(norm(m));
  });
  it("survives a parse round-trip unchanged", () => {
    const { a, b } = build();
    const m = mergeProgress(a, b);
    expect(norm(reload(m))).toBe(norm(m));
  });
  it("two seq-2 fails merged: locked until the later-ordered one is remediated", () => {
    const { a, b } = build();
    const g = gate(mergeProgress(a, b), at(30));
    expect(g.canStart).toBe(false);
  });
  it(`over ${MAX_ASSESSMENT_ATTEMPTS} attempts on both sides: merge keeps the pass and the latest`, () => {
    let s = attempt(emptyProgress(), 0, []);
    for (let k = 1; k <= 35; k++) s = attempt(s, k * 10, [safety]);
    const m = mergeProgress(s, reload(s));
    expect(A(m).attempts.length).toBe(MAX_ASSESSMENT_ATTEMPTS);
    expect(gate(m).passed).toBe(true);
    expect(orderAttempts(A(m).attempts).at(-1)!.seq).toBe(36);
  });
});

describe("remediationForSeq", () => {
  it("is validated on parse", () => {
    const base = { attempts: [raw(10, [safety], 0, 1)], remediation: { [safety]: at(20).toISOString(), [plain]: at(20).toISOString() }, remediationFor: { [safety]: at(10).toISOString() } };
    for (const bad of [-1, 0, 1.5, "1", null, 2 ** 60]) {
      const r = stateWith({ ...base, remediationForSeq: { [safety]: bad } });
      expect(A(r.state).remediationForSeq?.[safety]).toBeUndefined();
    }
    // entry without a matching remediationFor is dropped
    const r = stateWith({ ...base, remediationForSeq: { [plain]: 1 } });
    expect(A(r.state).remediationForSeq?.[plain]).toBeUndefined();
    expect(stateWith({ ...base, remediationForSeq: "x" }).issues.some((i) => /remediationForSeq invalid/.test(i))).toBe(true);
  });
  it("a seq mismatch blocks even when the date matches", () => {
    const s = stateWith({ attempts: [raw(10, [safety], 0, 1), raw(10, [safety], 1, 2)], remediation: { [safety]: at(20).toISOString() }, remediationFor: { [safety]: at(10).toISOString() }, remediationForSeq: { [safety]: 1 } }).state;
    expect(gate(s, at(30)).canStart).toBe(false);
  });
  it("[probe] same date, no remediationForSeq (old data): a remediation for attempt 1 also matches attempt 2", () => {
    const s = stateWith({ attempts: [raw(10, [safety], 0, 1), raw(10, [safety], 1, 2)], remediation: { [safety]: at(20).toISOString() }, remediationFor: { [safety]: at(10).toISOString() } }).state;
    console.log("same-date old-data probe canStart:", gate(s, at(30)).canStart);
  });
  it("reset trims remediation, remediationFor and remediationForSeq together; a stale tab cannot bring them back", () => {
    let s = attempt(emptyProgress(), 0, [safety]);
    s = completeRemediation(s, MF_ID, safety, at(2));
    const r = resetProgress(at(5));
    const m = mergeProgress(r, s);
    expect(m.assessments?.[MF_ID]).toBeUndefined();
    // activity after the reset: the new link survives, the old one does not
    let after = attempt(m, 10, [safety]);
    after = completeRemediation(after, MF_ID, safety, at(12));
    const m2 = mergeProgress(after, s);
    expect(A(m2).remediationForSeq).toEqual({ [safety]: 1 });
    expect(A(m2).attempts.length).toBe(1);
    expect(gate(m2, at(20)).canStart).toBe(true);
  });
});
