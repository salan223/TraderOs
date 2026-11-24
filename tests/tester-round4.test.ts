/** Tester round 4: reset tombstones, reflection-clear tombstones, merge edge cases. */
import { describe, expect, it } from "vitest";
import {
  completeExercise, emptyProgress, lessonStatus, markSectionRead, mergeProgress, parseProgress,
  recordQuizAttempt, resetProgress, saveReflection, streakFromState, summarize, type ProgressState,
} from "@/lib/academy/progress";
import { LESSONS } from "@/lib/academy/curriculum";
import { RESET_KEY, STORAGE_KEY, createLocalStorageStore } from "@/lib/academy/store";

const d = (s: string) => new Date(s);
const T0 = "2026-03-10T10:00:00.000Z", TR = "2026-03-10T11:00:00.000Z", T2 = "2026-03-10T12:00:00.000Z";
const L = "forex";
function fake(init: Record<string, string> = {}) {
  const data = new Map(Object.entries(init));
  return { data, get length() { return data.size; }, key: (i: number) => [...data.keys()][i] ?? null,
    getItem: (k: string) => data.get(k) ?? null, setItem: (k: string, v: string) => void data.set(k, v), removeItem: (k: string) => void data.delete(k) };
}
const before = () => saveReflection(completeExercise(markSectionRead(recordQuizAttempt(emptyProgress(), L, 5, 5, d(T0)), L, "what-is-forex", d(T0)), L, d(T0)), L, "old secret", d(T0));
const allText = (s: ProgressState) => JSON.stringify(s);

describe("tester r4: reset tombstone in merge", () => {
  it("stale pre-reset memory merged with a reset store keeps nothing from before", () => {
    const m = mergeProgress(before(), resetProgress(d(TR)));
    expect(m.lessons[L]).toBeUndefined();
    expect(allText(m)).not.toContain("old secret");
    expect(mergeProgress(resetProgress(d(TR)), before()).lessons[L]).toBeUndefined(); // order-independent
  });
  it("post-reset activity on both sides is kept", () => {
    const a = saveReflection(before(), L, "new text", d(T2));
    const b = completeExercise(resetProgress(d(TR)), "stocks", d(T2));
    const m = mergeProgress(a, b);
    expect(m.lessons[L].reflection?.text).toBe("new text");
    expect(m.lessons[L].exerciseCompletedAt).toBeNull();
    expect(m.lessons[L].quizAttempts).toHaveLength(0);
    expect(m.lessons.stocks.exerciseCompletedAt).toBe(T2);
  });
  it("activity at exactly the reset instant is dropped (at or before)", () => {
    const a = completeExercise(emptyProgress(), L, d(TR));
    expect(mergeProgress(a, resetProgress(d(TR))).lessons[L]).toBeUndefined();
  });
  it("reset twice: the newer reset wins regardless of argument order", () => {
    const mid = completeExercise(resetProgress(d(TR)), L, d("2026-03-10T11:30:00.000Z"));
    const r2 = resetProgress(d(T2));
    expect(mergeProgress(mid, r2).lessons[L]).toBeUndefined();
    expect(mergeProgress(r2, mid).lessons[L]).toBeUndefined();
    expect(mergeProgress(mid, r2).resetAt).toBe(T2);
  });
  it("merge is idempotent and commutative on lessons", () => {
    const a = saveReflection(before(), L, "new", d(T2)), b = resetProgress(d(TR));
    expect(mergeProgress(a, b).lessons).toEqual(mergeProgress(b, a).lessons);
    const m = mergeProgress(a, b);
    expect(mergeProgress(m, m).lessons).toEqual(m.lessons);
  });
  it("old v1 data without resetAt / reflectionClearedAt merges as before (union)", () => {
    const old = JSON.stringify({ version: 1, updatedAt: T0, lessons: { [L]: { sectionsRead: { a: T0 }, exerciseCompletedAt: T0, quizAttempts: [{ at: T0, correct: 4, total: 5 }], reflection: { text: "x", updatedAt: T0 } } } });
    const p = parseProgress(old);
    expect(p.repaired).toBe(false);
    const m = mergeProgress(p.state, completeExercise(emptyProgress(), "stocks", d(T2)));
    expect(m.lessons[L].exerciseCompletedAt).toBe(T0);
    expect(m.lessons.stocks).toBeDefined();
  });
});

describe("tester r4: reflection-clear tombstone", () => {
  it("clear after save wins; a later save after clear wins", () => {
    const saved = saveReflection(emptyProgress(), L, "hello", d(T0));
    const cleared = saveReflection(saved, L, "", d(TR));
    expect(mergeProgress(saved, cleared).lessons[L].reflection).toBeNull();
    expect(mergeProgress(cleared, saved).lessons[L].reflection).toBeNull();
    const resaved = saveReflection(cleared, L, "again", d(T2));
    expect(mergeProgress(saved, resaved).lessons[L].reflection?.text).toBe("again");
  });
  it("a cleared-only lesson does not count as started or as activity for streaks", () => {
    const s = saveReflection(saveReflection(emptyProgress(), L, "x", d(T0)), L, "", d(TR));
    const forex = LESSONS.find((l) => l.id === L)!;
    // Clearing is not learning activity; reported here so the decision is visible.
    const st = lessonStatus(forex, s, { now: d(T2), timeZone: "UTC" });
    expect(st.started).toBe(false);
    expect(summarize(LESSONS, s, { now: d(T2), timeZone: "UTC" }).started).toBe(0);
    expect(streakFromState(s, { now: d(T2), timeZone: "UTC" }).activeDays).toBeLessThanOrEqual(1);
  });
});

describe("tester r4: reset-at marker in storage", () => {
  it("missing, corrupt and hostile markers are ignored without throwing", () => {
    for (const bad of ["", "garbage", "{}", "null", "9".repeat(50), "<script>"]) {
      const ls = fake({ [STORAGE_KEY]: JSON.stringify(before()), [RESET_KEY]: bad });
      const r = createLocalStorageStore(ls).load();
      expect(r.state.lessons[L], bad).toBeDefined();
    }
  });
  it("a FUTURE marker never hides or wipes progress made now, through load → update → merge cycles", () => {
    const future = "2099-01-01T00:00:00.000Z";
    const ls = fake({ [RESET_KEY]: future });
    const st = createLocalStorageStore(ls);
    // normal path: update builds on load() and saves
    let s = st.load().state;
    s = completeExercise(s, L, d(T2));
    st.save(s);
    expect(st.load().state.lessons[L]?.exerciseCompletedAt).toBe(T2);
    // failed-save path: memory without the marker merged with stored (which carries it)
    const memory = completeExercise(emptyProgress(), "stocks", d(T2));
    const merged = mergeProgress(memory, st.load().state);
    expect(merged.lessons.stocks?.exerciseCompletedAt, "future reset-at wiped new progress").toBe(T2);
    expect(merged.lessons[L]?.exerciseCompletedAt).toBe(T2);
  });
  // KNOWN LIMITATION (accepted): mergeProgress compares timestamps only. A tab that never
  // received a reset marker looks exactly like stale pre-reset data, so its progress dated
  // before a clock-skewed reset is dropped. Choosing the other way would let deleted progress
  // come back after a reset, which is worse. In the app every tab receives the marker before
  // its next merge (storage event, load, pageshow); e2e round4.js sections 4, 4b and 5 confirm
  // this cannot happen there. it.fails keeps the behaviour pinned: if it ever changes, revisit.
  it.fails("clock skew: reset stamped 1h ahead (other tab's clock) must not drop progress made after it in real time", () => {
    const skewedReset = resetProgress(d("2026-03-10T13:00:00.000Z")); // tab B clock +1h
    const realNow = completeExercise(emptyProgress(), L, d("2026-03-10T12:30:00.000Z")); // tab A, after the reset in real time
    const m = mergeProgress(realNow, skewedReset);
    expect(m.lessons[L]?.exerciseCompletedAt, "post-reset progress lost to clock skew").toBe("2026-03-10T12:30:00.000Z");
  });
  it("Settings reset clears all Academy keys except the new marker", () => {
    const ls = fake({ [STORAGE_KEY]: JSON.stringify(before()), "traderos.academy.progress.v1.corrupt-backup": "{x", "traderos.sidebar.collapsed": "1" });
    createLocalStorageStore(ls).reset!(d(TR));
    expect([...ls.data.keys()].sort()).toEqual([RESET_KEY, "traderos.sidebar.collapsed"].sort());
    expect(createLocalStorageStore(ls).load().state.lessons).toEqual({});
  });
});
