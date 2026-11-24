/**
 * Independent tester's edge-case suite for the Academy progress engine and store.
 * Run under several time zones, for example:
 *   TZ=America/New_York npx vitest run
 *   TZ=Asia/Kathmandu   npx vitest run
 *   TZ=Pacific/Auckland npx vitest run
 * Tests that pass no explicit timeZone exercise the device zone (TZ env).
 */
import { describe, expect, it } from "vitest";
import {
  MAX_ATTEMPTS_PER_LESSON,
  MAX_REFLECTION_LENGTH,
  FUTURE_TOLERANCE_MS,
  completeExercise,
  computeStreak,
  dayKey,
  dayNumber,
  emptyProgress,
  isPass,
  isValidIsoTime,
  journeyStage,
  lessonStatus,
  markSectionRead,
  parseProgress,
  recommendNext,
  recordQuizAttempt,
  saveReflection,
  scorePct,
  streakFromState,
  summarize,
  type Clock,
  type LessonRef,
  type ProgressState,
} from "@/lib/academy/progress";
import { LESSONS, lessonsOfTrack } from "@/lib/academy/curriculum";
import { BACKUP_KEY, STORAGE_KEY, createLocalStorageStore, storageWorks } from "@/lib/academy/store";

const A: LessonRef = { id: "lesson-a", sections: [{ id: "s1" }, { id: "s2" }] };
const B: LessonRef = { id: "lesson-b", sections: [{ id: "s1" }] };
const C: LessonRef = { id: "lesson-c", sections: [{ id: "s1" }] };
const ALL = [A, B, C];
const d = (iso: string) => new Date(iso);

function readAndSolve(s: ProgressState, l: LessonRef, when: string) {
  for (const sec of l.sections) s = markSectionRead(s, l.id, sec.id, d(when));
  return completeExercise(s, l.id, d(when));
}
function complete(s: ProgressState, l: LessonRef, when: string, correct = 5, total = 5) {
  return recordQuizAttempt(readAndSolve(s, l, when), l.id, correct, total, d(when));
}

// ── Pass mark boundaries ────────────────────────────────────────────────────
describe("tester: pass mark boundaries", () => {
  it("79% fails and 80% passes for every total 1..100", () => {
    for (let total = 1; total <= 100; total++) {
      for (let correct = 0; correct <= total; correct++) {
        const exact = (correct * 100) / total >= 80; // rational maths, no rounding
        expect(isPass(correct, total), `${correct}/${total}`).toBe(exact);
      }
    }
  });
  it("specific cases from the spec", () => {
    expect(isPass(4, 5)).toBe(true);
    expect(isPass(3, 4)).toBe(false);
    expect(isPass(4, 4)).toBe(true);
    expect(isPass(5, 6)).toBe(true);
    expect(isPass(4, 6)).toBe(false);
    expect(isPass(79, 100)).toBe(false);
    expect(isPass(80, 100)).toBe(true);
  });
  it("guards 0-question quizzes and junk numbers", () => {
    expect(isPass(0, 0)).toBe(false);
    expect(scorePct({ correct: 0, total: 0 })).toBe(0);
    const s0 = emptyProgress();
    for (const [c, t] of [[0, 0], [6, 5], [-1, 5], [NaN, 5], [4, NaN], [Infinity, 5], [4.5, 5], [1, 101], [1, -5]] as const) {
      expect(recordQuizAttempt(s0, "lesson-a", c, t, d("2026-01-01T00:00:00Z"))).toBe(s0);
    }
  });
});

// ── Mastery over days and time zones ────────────────────────────────────────
describe("tester: mastery", () => {
  it("two passes on the same local day stay Practising; next local day masters", () => {
    let s = complete(emptyProgress(), A, "2026-03-10T09:00:00Z");
    s = recordQuizAttempt(s, A.id, 5, 5, d("2026-03-10T20:00:00Z"));
    const clock: Clock = { now: d("2026-03-10T21:00:00Z"), timeZone: "UTC" };
    expect(lessonStatus(A, s, clock).mastery).toBe("practising");
    s = recordQuizAttempt(s, A.id, 4, 5, d("2026-03-11T00:00:01Z"));
    expect(lessonStatus(A, s, { now: d("2026-03-11T01:00:00Z"), timeZone: "UTC" }).mastery).toBe("mastered");
  });

  it("Kathmandu (+05:45): 23:50 and 00:10 local are different days", () => {
    // 2026-03-10 23:50 NPT = 18:05Z; 2026-03-11 00:10 NPT = 18:25Z
    let s = complete(emptyProgress(), A, "2026-03-10T18:05:00Z");
    s = recordQuizAttempt(s, A.id, 5, 5, d("2026-03-10T18:25:00Z"));
    const k: Clock = { now: d("2026-03-10T19:00:00Z"), timeZone: "Asia/Kathmandu" };
    expect(lessonStatus(A, s, k).mastery).toBe("mastered");
    // in UTC both are the same day
    expect(lessonStatus(A, s, { now: k.now, timeZone: "UTC" }).mastery).toBe("practising");
  });

  it("Auckland DST end (2026-04-05) does not merge or split days", () => {
    // NZ DST ends 2026-04-05 03:00 NZDT -> 02:00 NZST
    const tz = "Pacific/Auckland";
    expect(dayKey("2026-04-04T10:30:00Z", tz)).toBe("2026-04-04"); // 23:30 NZDT
    expect(dayKey("2026-04-04T11:30:00Z", tz)).toBe("2026-04-05"); // 00:30 NZDT
    let s = complete(emptyProgress(), A, "2026-04-04T10:30:00Z");
    s = recordQuizAttempt(s, A.id, 5, 5, d("2026-04-04T11:30:00Z"));
    expect(lessonStatus(A, s, { now: d("2026-04-05T00:00:00Z"), timeZone: tz }).mastery).toBe("mastered");
  });

  it("device zone (TZ env) is used when no timeZone is given", () => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const t = "2026-07-01T12:00:00Z";
    expect(dayKey(t)).toBe(dayKey(t, tz));
  });

  it("later fail drops to Practising + needsReview, a later pass restores Mastered", () => {
    let s = complete(emptyProgress(), A, "2026-03-10T09:00:00Z");
    s = recordQuizAttempt(s, A.id, 5, 5, d("2026-03-11T09:00:00Z"));
    const clock: Clock = { now: d("2026-03-12T10:00:00Z"), timeZone: "UTC" };
    expect(lessonStatus(A, s, clock).mastery).toBe("mastered");
    s = recordQuizAttempt(s, A.id, 3, 5, d("2026-03-12T09:00:00Z"));
    const st = lessonStatus(A, s, clock);
    expect(st.mastery).toBe("practising");
    expect(st.needsReview).toBe(true);
    expect(st.complete).toBe(true); // best score still counts
    s = recordQuizAttempt(s, A.id, 4, 5, d("2026-03-12T09:30:00Z"));
    expect(lessonStatus(A, s, clock).mastery).toBe("mastered");
  });

  it("a FAILED attempt dated in the future should not flag needsReview (future timestamps ignored)", () => {
    let s = complete(emptyProgress(), A, "2026-03-10T09:00:00Z");
    s = recordQuizAttempt(s, A.id, 5, 5, d("2026-03-11T09:00:00Z"));
    // corrupt / wrong-clock attempt one year ahead
    s = recordQuizAttempt(s, A.id, 0, 5, d("2027-03-11T09:00:00Z"));
    const clock: Clock = { now: d("2026-03-12T10:00:00Z"), timeZone: "UTC" };
    const st = lessonStatus(A, s, clock);
    // Spec: timestamps > 5 min in the future are ignored. Expect Mastered, not review.
    expect(st.mastery).toBe("mastered");
    expect(st.needsReview).toBe(false);
  });

  it("future tolerance boundary: +5 min counts, +5 min +1 ms does not", () => {
    const now = d("2026-03-11T09:00:00Z");
    let s = complete(emptyProgress(), A, "2026-03-10T09:00:00Z");
    const s1 = recordQuizAttempt(s, A.id, 5, 5, new Date(now.getTime() + FUTURE_TOLERANCE_MS));
    expect(lessonStatus(A, s1, { now, timeZone: "UTC" }).mastery).toBe("mastered");
    const s2 = recordQuizAttempt(s, A.id, 5, 5, new Date(now.getTime() + FUTURE_TOLERANCE_MS + 1));
    expect(lessonStatus(A, s2, { now, timeZone: "UTC" }).mastery).toBe("practising");
    s = s2;
  });

  it("summary maths: 1 mastered + 1 practising + 1 learning of 3 = 50%", () => {
    let s = complete(emptyProgress(), A, "2026-03-10T09:00:00Z");
    s = recordQuizAttempt(s, A.id, 5, 5, d("2026-03-11T09:00:00Z"));
    s = complete(s, B, "2026-03-11T09:00:00Z");
    s = markSectionRead(s, C.id, "s1", d("2026-03-11T09:00:00Z"));
    const sum = summarize(ALL, s, { now: d("2026-03-11T10:00:00Z"), timeZone: "UTC" });
    expect(sum).toEqual({ total: 3, started: 3, completed: 2, mastered: 1, masteryPct: 50 });
    expect(summarize([], s, { now: d("2026-03-11T10:00:00Z") }).masteryPct).toBeNull();
  });

  it("rounding: 1 practising of 3 rounds 16.67 -> 17", () => {
    const s = complete(emptyProgress(), A, "2026-03-10T09:00:00Z");
    expect(summarize(ALL, s, { now: d("2026-03-10T10:00:00Z"), timeZone: "UTC" }).masteryPct).toBe(17);
  });
});

// ── Recommendation in every branch ─────────────────────────────────────────
describe("tester: recommendNext branches", () => {
  const clock: Clock = { now: d("2026-03-12T10:00:00Z"), timeZone: "UTC" };
  it("review beats an earlier incomplete lesson", () => {
    let s = complete(emptyProgress(), C, "2026-03-10T09:00:00Z");
    s = recordQuizAttempt(s, C.id, 1, 5, d("2026-03-11T09:00:00Z"));
    expect(recommendNext(ALL, s, clock)).toEqual({ lessonId: C.id, reason: "review" });
  });
  it("continue vs retry-quiz vs start", () => {
    let s = markSectionRead(emptyProgress(), A.id, "s1", d("2026-03-10T09:00:00Z"));
    expect(recommendNext(ALL, s, clock)).toEqual({ lessonId: A.id, reason: "continue" });
    s = recordQuizAttempt(s, A.id, 1, 5, d("2026-03-10T09:00:00Z"));
    expect(recommendNext(ALL, s, clock)).toEqual({ lessonId: A.id, reason: "retry-quiz" });
    // passed quiz but exercise missing -> continue
    s = recordQuizAttempt(s, A.id, 5, 5, d("2026-03-10T09:10:00Z"));
    expect(recommendNext(ALL, s, clock)?.reason).toBe("continue");
    s = complete(emptyProgress(), A, "2026-03-10T09:00:00Z");
    expect(recommendNext(ALL, s, clock)).toEqual({ lessonId: B.id, reason: "start" });
  });
  it("consolidate (passable today) beats consolidate-later, in curriculum order", () => {
    let s = complete(emptyProgress(), A, "2026-03-12T09:00:00Z"); // passed today
    s = complete(s, B, "2026-03-11T09:00:00Z"); // passed yesterday
    s = complete(s, C, "2026-03-12T09:00:00Z");
    expect(recommendNext(ALL, s, clock)).toEqual({ lessonId: B.id, reason: "consolidate" });
    s = recordQuizAttempt(s, B.id, 5, 5, d("2026-03-12T09:30:00Z")); // B now mastered
    expect(recommendNext(ALL, s, clock)).toEqual({ lessonId: A.id, reason: "consolidate-later" });
  });
  it("null when all mastered; review still wins over everything", () => {
    let s = emptyProgress();
    for (const l of ALL) {
      s = complete(s, l, "2026-03-10T09:00:00Z");
      s = recordQuizAttempt(s, l.id, 5, 5, d("2026-03-11T09:00:00Z"));
    }
    expect(recommendNext(ALL, s, clock)).toBeNull();
    s = recordQuizAttempt(s, B.id, 0, 5, d("2026-03-12T09:00:00Z"));
    expect(recommendNext(ALL, s, clock)).toEqual({ lessonId: B.id, reason: "review" });
  });
  it("with the real curriculum: first visit recommends lesson 1", () => {
    expect(recommendNext(LESSONS, emptyProgress(), clock)).toEqual({ lessonId: LESSONS[0].id, reason: "start" });
  });
});

// ── Streak ─────────────────────────────────────────────────────────────────
describe("tester: streak", () => {
  it("23:59:59 and 00:00:00 local are two consecutive days", () => {
    const st = computeStreak(["2026-03-10T23:59:59Z", "2026-03-11T00:00:00Z"], { now: d("2026-03-11T08:00:00Z"), timeZone: "UTC" });
    expect(st).toMatchObject({ current: 2, longest: 2, activeToday: true, activeDays: 2 });
  });
  it("alive through the whole next day, dead the day after", () => {
    const t = ["2026-03-10T10:00:00Z"];
    expect(computeStreak(t, { now: d("2026-03-11T23:59:59Z"), timeZone: "UTC" }).current).toBe(1);
    expect(computeStreak(t, { now: d("2026-03-12T00:00:00Z"), timeZone: "UTC" }).current).toBe(0);
    expect(computeStreak(t, { now: d("2026-03-12T00:00:00Z"), timeZone: "UTC" }).longest).toBe(1);
  });
  it("duplicates on the same day count once; gaps break the current run", () => {
    const t = ["2026-03-01T01:00:00Z", "2026-03-01T02:00:00Z", "2026-03-02T01:00:00Z", "2026-03-04T01:00:00Z", "2026-03-04T05:00:00Z"];
    expect(computeStreak(t, { now: d("2026-03-04T10:00:00Z"), timeZone: "UTC" })).toEqual({ current: 1, longest: 2, activeToday: true, activeDays: 3 });
  });
  it("DST spring-forward week in New York stays consecutive", () => {
    const tz = "America/New_York"; // DST starts 2026-03-08
    const t = ["2026-03-07T15:00:00Z", "2026-03-08T15:00:00Z", "2026-03-09T15:00:00Z"];
    expect(computeStreak(t, { now: d("2026-03-09T16:00:00Z"), timeZone: tz }).current).toBe(3);
  });
  it("ignores future and garbage timestamps without throwing", () => {
    const st = computeStreak(["2099-01-01T00:00:00Z", "garbage", "", "2026-03-10T10:00:00Z"], { now: d("2026-03-10T11:00:00Z"), timeZone: "UTC" });
    expect(st.activeDays).toBe(1);
  });
  it("10k activity timestamps compute quickly", () => {
    const base = Date.parse("2020-01-01T00:00:00Z");
    const t = Array.from({ length: 10_000 }, (_, i) => new Date(base + i * 3_600_000 * 7).toISOString());
    const t0 = performance.now();
    const st = computeStreak(t, { now: new Date(base + 10_000 * 3_600_000 * 7), timeZone: "UTC" });
    expect(performance.now() - t0).toBeLessThan(500);
    expect(st.activeDays).toBeGreaterThan(2000);
  });
});

// ── Performance ─────────────────────────────────────────────────────────────
describe("tester: performance", () => {
  it("lessonStatus over 10k attempts is fast", () => {
    const s = emptyProgress();
    const attempts = Array.from({ length: 10_000 }, (_, i) => ({ at: new Date(Date.parse("2020-01-01T00:00:00Z") + i * 60_000).toISOString(), correct: i % 6, total: 5 }));
    s.lessons[A.id] = { sectionsRead: { s1: "2020-01-01T00:00:00Z", s2: "2020-01-01T00:00:00Z" }, exerciseCompletedAt: "2020-01-01T00:00:00Z", quizAttempts: attempts.filter((a) => a.correct <= 5), reflection: null };
    const t0 = performance.now();
    const st = lessonStatus(A, s, { now: d("2026-01-01T00:00:00Z"), timeZone: "UTC" });
    expect(performance.now() - t0).toBeLessThan(500);
    expect(st.complete).toBe(true);
  });
  it("parseProgress caps a 10k-attempt history to the last 50", () => {
    const attempts = Array.from({ length: 10_000 }, (_, i) => ({ at: new Date(Date.parse("2020-01-01T00:00:00Z") + i * 60_000).toISOString(), correct: 5, total: 5 }));
    const raw = JSON.stringify({ version: 1, lessons: { [A.id]: { quizAttempts: attempts } }, updatedAt: null });
    const t0 = performance.now();
    const r = parseProgress(raw);
    expect(performance.now() - t0).toBeLessThan(1000);
    expect(r.state.lessons[A.id].quizAttempts).toHaveLength(MAX_ATTEMPTS_PER_LESSON);
    expect(r.state.lessons[A.id].quizAttempts.at(-1)!.at).toBe(attempts.at(-1)!.at);
  });
  it("parseProgress of 5,000 junk lessons stays fast", () => {
    const lessons: Record<string, unknown> = {};
    for (let i = 0; i < 5000; i++) lessons[`l-${i}`] = { sectionsRead: { a: "2020-01-01T00:00:00Z" } };
    const t0 = performance.now();
    const r = parseProgress(JSON.stringify({ version: 1, lessons }));
    expect(performance.now() - t0).toBeLessThan(1000);
    expect(Object.keys(r.state.lessons)).toHaveLength(5000);
  });
});

// ── Hostile / corrupt storage ──────────────────────────────────────────────
describe("tester: hostile input never throws", () => {
  const inputs: unknown[] = [
    "null", "[]", "\"str\"", "42", "true", "{}", "{\"version\":1}", "{\"version\":1,\"lessons\":[]}",
    "{\"version\":1,\"lessons\":null}", "{\"version\":1,\"lessons\":\"x\"}", "{\"version\":99,\"lessons\":{}}",
    "{\"__proto__\":{\"polluted\":1},\"version\":1,\"lessons\":{\"__proto__\":{\"sectionsRead\":{}}}}",
    "{\"version\":1,\"lessons\":{\"constructor\":{\"sectionsRead\":{\"constructor\":\"2026-01-01T00:00:00Z\"}}}}",
    "{\"version\":1,\"lessons\":{\"a\":null,\"b\":[],\"c\":{\"sectionsRead\":null,\"quizAttempts\":[null,1,\"x\",{\"at\":null}],\"reflection\":{\"text\":null}}}}",
    "{\"version\":1,\"lessons\":{\"a\":{\"quizAttempts\":[{\"at\":\"2026-01-01T00:00:00Z\",\"correct\":\"4\",\"total\":\"5\"}]}}}",
    "{\"version\":1,\"lessons\":{\"a\":{\"quizAttempts\":[{\"at\":\"2026-01-01T00:00:00Z\",\"correct\":1e308,\"total\":5}]}}}",
    "{\"version\":1,\"lessons\":{\"a\":{\"exerciseCompletedAt\":\"+275760-09-13T00:00:00.000Z\"}}}",
    "{\"version\":1,\"lessons\":{\"a\":{\"exerciseCompletedAt\":\"-271821-04-20T00:00:00.000Z\"}}}",
    "{\"version\":1,\"lessons\":{\"a\":{\"reflection\":{\"text\":\"<img src=x onerror=alert(1)>\",\"updatedAt\":\"2026-01-01T00:00:00Z\"}}}}",
    "{".repeat(5000), "\u0000\u0001", undefined, null, 0, [], new Date(), Object.create(null),
  ];
  it.each(inputs.map((x, i) => [i, x]))("input #%i", (_i, x) => {
    expect(() => parseProgress(x)).not.toThrow();
    const r = parseProgress(x);
    expect(r.state.version).toBe(1);
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
    // every downstream function must cope with what parse returns
    const clock: Clock = { now: d("2026-03-10T00:00:00Z"), timeZone: "UTC" };
    expect(() => streakFromState(r.state, clock)).not.toThrow();
    expect(() => summarize(LESSONS, r.state, clock)).not.toThrow();
    expect(() => recommendNext(LESSONS, r.state, clock)).not.toThrow();
    expect(() => JSON.stringify(r.state)).not.toThrow();
  });

  it("huge reflection is trimmed to the max length", () => {
    const raw = JSON.stringify({ version: 1, lessons: { a: { reflection: { text: "x".repeat(1_000_000), updatedAt: "2026-01-01T00:00:00Z" } } } });
    const r = parseProgress(raw);
    expect(r.state.lessons.a.reflection!.text.length).toBe(MAX_REFLECTION_LENGTH);
    expect(saveReflection(emptyProgress(), "a", "y".repeat(10_000), d("2026-01-01T00:00:00Z")).lessons.a.reflection!.text.length).toBe(MAX_REFLECTION_LENGTH);
  });

  it("whitespace-only reflection is not saved", () => {
    const s = saveReflection(emptyProgress(), "a", "   \n\t ", d("2026-01-01T00:00:00Z"));
    expect(s.lessons.a).toBeUndefined();
  });

  it("isValidIsoTime rejects junk", () => {
    for (const v of [null, 1, "", "nope", "x".repeat(41), {}, NaN]) expect(isValidIsoTime(v)).toBe(false);
    expect(dayNumber("1970-01-02")).toBe(1);
  });
});

// ── Store ──────────────────────────────────────────────────────────────────
describe("tester: store", () => {
  function fake(initial: Record<string, string> = {}, opts: { getThrows?: boolean; setThrows?: boolean } = {}) {
    const data = new Map(Object.entries(initial));
    return {
      data,
      getItem: (k: string) => { if (opts.getThrows) throw new Error("SecurityError"); return data.get(k) ?? null; },
      setItem: (k: string, v: string) => { if (opts.setThrows) throw new Error("QuotaExceededError"); data.set(k, v); },
      removeItem: (k: string) => void data.delete(k),
    };
  }
  it("storageWorks detects throwing storage", () => {
    expect(storageWorks(fake({}, { setThrows: true }))).toBe(false);
    expect(storageWorks(null)).toBe(false);
    expect(storageWorks(fake())).toBe(true);
  });
  it("load never throws when getItem throws", () => {
    const st = createLocalStorageStore(fake({}, { getThrows: true }));
    expect(() => st.load()).not.toThrow();
  });
  it("a newer-version blob is backed up before being overwritten", () => {
    const raw = JSON.stringify({ version: 2, lessons: {}, extra: { important: true } });
    const ls = fake({ [STORAGE_KEY]: raw });
    createLocalStorageStore(ls).load();
    expect(ls.data.get(BACKUP_KEY)).toBe(raw);
  });
  it("a SECOND, different corruption later is also preserved (backup is only written once)", () => {
    const ls = fake({ [STORAGE_KEY]: "{first-broken" });
    const st = createLocalStorageStore(ls);
    st.load();
    st.save(emptyProgress());
    ls.data.set(STORAGE_KEY, "{second-broken with different content");
    st.load();
    st.save(emptyProgress()); // the next write after load (what ProgressProvider.update does)
    // Expectation: nothing silently lost. Actual design keeps only the first backup.
    expect([...ls.data.values()].some((v) => v === "{second-broken with different content")).toBe(true);
  });
  it("clear() leaves the corrupt-backup (which may hold old reflections) in place", () => {
    const ls = fake({ [STORAGE_KEY]: "{broken reflection: my private notes" });
    const st = createLocalStorageStore(ls);
    st.load();
    st.clear();
    // Settings says reset "deletes all lesson progress, quiz attempts and reflections in this browser".
    expect(ls.data.has(BACKUP_KEY)).toBe(false);
  });
});

// ── Journey with the real curriculum ───────────────────────────────────────
describe("tester: journey stage", () => {
  it("stays Awareness at 9/10 and becomes Learning at 10/10", () => {
    const mf = lessonsOfTrack("market-foundations");
    let s = emptyProgress();
    for (const l of mf.slice(0, 9)) s = complete(s, l, "2026-03-10T09:00:00Z");
    const clock: Clock = { now: d("2026-03-10T10:00:00Z"), timeZone: "UTC" };
    expect(journeyStage(summarize(mf, s, clock)).index).toBe(0);
    expect(journeyStage(summarize(mf, s, clock)).detail).toContain("1 Market Foundations lesson left");
    s = complete(s, mf[9], "2026-03-10T09:00:00Z");
    expect(journeyStage(summarize(mf, s, clock)).index).toBe(1);
  });
  it("a 4-question quiz needs 4/4, a 6-question quiz needs 5/6 (real lessons)", () => {
    for (const l of LESSONS) {
      const n = l.quiz.length;
      const needed = Math.ceil(n * 0.8);
      expect(isPass(needed, n)).toBe(true);
      expect(isPass(needed - 1, n)).toBe(false);
    }
  });
});
