import { describe, expect, it } from "vitest";
import {
  MAX_ATTEMPTS_PER_LESSON,
  MAX_REFLECTION_LENGTH,
  completeExercise,
  computeStreak,
  currentTrackIndex,
  dayKey,
  emptyProgress,
  isPass,
  journeyStage,
  lessonStatus,
  markSectionRead,
  mergeProgress,
  resetProgress,
  nextStepHint,
  parseProgress,
  recommendNext,
  recordQuizAttempt,
  resetLesson,
  saveReflection,
  streakFromState,
  summarize,
  type Clock,
  type LessonRef,
  type ProgressState,
} from "@/lib/academy/progress";
import { LESSONS, TRACKS, lessonsOfTrack } from "@/lib/academy/curriculum";
import { createLocalStorageStore, createMemoryStore, backupKeys, BACKUP_KEY, MAX_BACKUPS, RESET_KEY, STORAGE_KEY } from "@/lib/academy/store";
import { seededShuffle } from "@/lib/academy/shuffle";

const A: LessonRef = { id: "lesson-a", sections: [{ id: "s1" }, { id: "s2" }] };
const B: LessonRef = { id: "lesson-b", sections: [{ id: "s1" }] };
const C: LessonRef = { id: "lesson-c", sections: [{ id: "s1" }] };
const ALL = [A, B, C];

const UTC: Clock = { now: new Date("2026-03-10T12:00:00Z"), timeZone: "UTC" };
const at = (iso: string) => new Date(iso);

/** Complete a lesson: read all sections, solve the exercise, pass the quiz. */
function complete(state: ProgressState, l: LessonRef, when: string, correct = 5, total = 5) {
  let s = state;
  for (const sec of l.sections) s = markSectionRead(s, l.id, sec.id, at(when));
  s = completeExercise(s, l.id, at(when));
  return recordQuizAttempt(s, l.id, correct, total, at(when));
}

describe("pass mark", () => {
  it("treats exactly 80% as a pass without floating point errors", () => {
    expect(isPass(4, 5)).toBe(true);
    expect(isPass(8, 10)).toBe(true);
    expect(isPass(3, 4)).toBe(false);
    expect(isPass(5, 6)).toBe(true);
    expect(isPass(4, 6)).toBe(false);
    expect(isPass(0, 0)).toBe(false);
  });
});

describe("lesson completion", () => {
  it("is not started with no data", () => {
    const s = lessonStatus(A, emptyProgress(), UTC);
    expect(s.started).toBe(false);
    expect(s.mastery).toBe("not-started");
    expect(s.bestScore).toBeNull();
  });

  it("requires every section, the exercise and a passing best score", () => {
    let s = emptyProgress();
    s = markSectionRead(s, A.id, "s1", at("2026-03-10T09:00:00Z"));
    expect(lessonStatus(A, s, UTC).mastery).toBe("learning");
    s = markSectionRead(s, A.id, "s2", at("2026-03-10T09:01:00Z"));
    s = completeExercise(s, A.id, at("2026-03-10T09:02:00Z"));
    s = recordQuizAttempt(s, A.id, 3, 5, at("2026-03-10T09:03:00Z"));
    let st = lessonStatus(A, s, UTC);
    expect(st.complete).toBe(false);
    expect(st.passed).toBe(false);
    s = recordQuizAttempt(s, A.id, 4, 5, at("2026-03-10T09:04:00Z"));
    st = lessonStatus(A, s, UTC);
    expect(st.complete).toBe(true);
    expect(st.bestScore).toBe(80);
    expect(st.mastery).toBe("practising");
  });

  it("does not complete without the exercise even with 100%", () => {
    let s = emptyProgress();
    s = markSectionRead(s, B.id, "s1", at("2026-03-10T09:00:00Z"));
    s = recordQuizAttempt(s, B.id, 5, 5, at("2026-03-10T09:00:00Z"));
    expect(lessonStatus(B, s, UTC).complete).toBe(false);
  });

  it("ignores read entries for sections the lesson no longer has", () => {
    let s = emptyProgress();
    s = markSectionRead(s, B.id, "old-section", at("2026-03-10T09:00:00Z"));
    const st = lessonStatus(B, s, UTC);
    expect(st.sectionsRead).toBe(0);
    expect(st.started).toBe(true);
  });

  it("keeps the best score even after a worse later attempt", () => {
    let s = complete(emptyProgress(), B, "2026-03-09T09:00:00Z", 5, 5);
    s = recordQuizAttempt(s, B.id, 2, 5, at("2026-03-10T09:00:00Z"));
    const st = lessonStatus(B, s, UTC);
    expect(st.bestScore).toBe(100);
    expect(st.lastScore).toBe(40);
    expect(st.complete).toBe(true);
    expect(st.needsReview).toBe(true);
    expect(st.mastery).toBe("practising");
  });

  it("returns the same object when nothing changes (no needless saves)", () => {
    const s = markSectionRead(emptyProgress(), A.id, "s1", at("2026-03-10T09:00:00Z"));
    expect(markSectionRead(s, A.id, "s1", at("2026-03-10T10:00:00Z"))).toBe(s);
    const e = completeExercise(s, A.id, at("2026-03-10T09:00:00Z"));
    expect(completeExercise(e, A.id, at("2026-03-11T09:00:00Z"))).toBe(e);
  });

  it("rejects invalid quiz results and ids", () => {
    const s = emptyProgress();
    expect(recordQuizAttempt(s, A.id, 6, 5, UTC.now)).toBe(s);
    expect(recordQuizAttempt(s, A.id, -1, 5, UTC.now)).toBe(s);
    expect(recordQuizAttempt(s, A.id, 1.5, 5, UTC.now)).toBe(s);
    expect(recordQuizAttempt(s, A.id, 0, 0, UTC.now)).toBe(s);
    expect(markSectionRead(s, "__proto__", "s1", UTC.now)).toBe(s);
    expect(markSectionRead(s, "Bad Id", "s1", UTC.now)).toBe(s);
  });

  it("caps stored attempts", () => {
    let s = emptyProgress();
    for (let i = 0; i < MAX_ATTEMPTS_PER_LESSON + 10; i++) s = recordQuizAttempt(s, A.id, 1, 5, new Date(Date.UTC(2026, 0, 1, 0, i)));
    expect(s.lessons[A.id].quizAttempts).toHaveLength(MAX_ATTEMPTS_PER_LESSON);
  });

  it("saves, trims, clears reflections and counts a reflection as starting a lesson", () => {
    let s = saveReflection(emptyProgress(), A.id, "I noticed spreads widen at night.", UTC.now);
    expect(s.lessons[A.id].reflection?.text).toContain("spreads");
    expect(lessonStatus(A, s, UTC).started).toBe(true);
    s = saveReflection(s, A.id, "x".repeat(MAX_REFLECTION_LENGTH + 50), UTC.now);
    expect(s.lessons[A.id].reflection?.text).toHaveLength(MAX_REFLECTION_LENGTH);
    s = saveReflection(s, A.id, "   ", UTC.now);
    expect(s.lessons[A.id].reflection).toBeNull();
  });

  it("resetLesson removes only that lesson", () => {
    let s = complete(emptyProgress(), A, "2026-03-10T09:00:00Z");
    s = complete(s, B, "2026-03-10T09:00:00Z");
    s = resetLesson(s, A.id, UTC.now);
    expect(lessonStatus(A, s, UTC).started).toBe(false);
    expect(lessonStatus(B, s, UTC).complete).toBe(true);
  });

  it("does not leak inherited properties as lesson progress", () => {
    const st = lessonStatus({ id: "constructor", sections: [{ id: "s1" }] }, emptyProgress(), UTC);
    expect(st.started).toBe(false);
  });
});

describe("mastery", () => {
  it("needs passes on two different local days", () => {
    let s = complete(emptyProgress(), B, "2026-03-09T09:00:00Z");
    expect(lessonStatus(B, s, UTC).mastery).toBe("practising");
    s = recordQuizAttempt(s, B.id, 5, 5, at("2026-03-09T18:00:00Z")); // same day
    expect(lessonStatus(B, s, UTC).mastery).toBe("practising");
    s = recordQuizAttempt(s, B.id, 4, 5, at("2026-03-10T08:00:00Z")); // next day
    expect(lessonStatus(B, s, UTC).mastery).toBe("mastered");
  });

  it("drops back to practising if the latest attempt fails", () => {
    let s = complete(emptyProgress(), B, "2026-03-08T09:00:00Z");
    s = recordQuizAttempt(s, B.id, 5, 5, at("2026-03-09T09:00:00Z"));
    expect(lessonStatus(B, s, UTC).mastery).toBe("mastered");
    s = recordQuizAttempt(s, B.id, 1, 5, at("2026-03-10T09:00:00Z"));
    const st = lessonStatus(B, s, UTC);
    expect(st.mastery).toBe("practising");
    expect(st.needsReview).toBe(true);
  });

  it("uses the learner's time zone for day boundaries", () => {
    // 23:30 and 00:30 UTC are different UTC days but the same day in New York (UTC-4/-5).
    let s = complete(emptyProgress(), B, "2026-03-10T23:30:00Z");
    s = recordQuizAttempt(s, B.id, 5, 5, at("2026-03-11T00:30:00Z"));
    const now = at("2026-03-11T12:00:00Z");
    expect(lessonStatus(B, s, { now, timeZone: "UTC" }).mastery).toBe("mastered");
    expect(lessonStatus(B, s, { now, timeZone: "America/New_York" }).mastery).toBe("practising");
  });

  it("ignores future-dated passes for mastery", () => {
    let s = complete(emptyProgress(), B, "2026-03-10T09:00:00Z");
    s = recordQuizAttempt(s, B.id, 5, 5, at("2027-01-01T09:00:00Z"));
    expect(lessonStatus(B, s, UTC).mastery).toBe("practising");
  });

  it("summarises mastery as 0 / 50 / 100 per lesson", () => {
    let s = complete(emptyProgress(), A, "2026-03-09T09:00:00Z");
    s = recordQuizAttempt(s, A.id, 5, 5, at("2026-03-10T09:00:00Z")); // mastered
    s = complete(s, B, "2026-03-10T09:00:00Z"); // practising
    s = markSectionRead(s, C.id, "s1", at("2026-03-10T09:00:00Z")); // learning
    const sum = summarize(ALL, s, UTC);
    expect(sum).toEqual({ total: 3, started: 3, completed: 2, mastered: 1, masteryPct: 50 });
    expect(summarize([], s, UTC).masteryPct).toBeNull();
    expect(summarize(ALL, emptyProgress(), UTC).masteryPct).toBe(0);
  });

  it("gives a helpful next-step hint", () => {
    expect(nextStepHint(lessonStatus(A, emptyProgress(), UTC), UTC)).toMatch(/read 2 more sections/);
    const s = complete(emptyProgress(), B, "2026-03-10T09:00:00Z");
    expect(nextStepHint(lessonStatus(B, s, UTC), UTC)).toMatch(/another day/);
  });
});

describe("recommended next lesson", () => {
  it("starts with the first lesson on a first visit", () => {
    expect(recommendNext(ALL, emptyProgress(), UTC)).toEqual({ lessonId: A.id, reason: "start" });
  });

  it("returns the first incomplete lesson in order, even if a later one was opened", () => {
    let s = complete(emptyProgress(), A, "2026-03-10T09:00:00Z");
    s = markSectionRead(s, C.id, "s1", at("2026-03-10T09:00:00Z"));
    expect(recommendNext(ALL, s, UTC)).toEqual({ lessonId: B.id, reason: "start" });
  });

  it("flags a failed quiz on an incomplete lesson", () => {
    let s = markSectionRead(emptyProgress(), A.id, "s1", at("2026-03-10T09:00:00Z"));
    expect(recommendNext(ALL, s, UTC)?.reason).toBe("continue");
    s = recordQuizAttempt(s, A.id, 1, 5, at("2026-03-10T09:00:00Z"));
    expect(recommendNext(ALL, s, UTC)).toEqual({ lessonId: A.id, reason: "retry-quiz" });
  });

  it("prioritises reviewing a completed lesson whose latest attempt failed", () => {
    let s = complete(emptyProgress(), A, "2026-03-09T09:00:00Z");
    s = complete(s, B, "2026-03-09T09:00:00Z");
    s = recordQuizAttempt(s, B.id, 1, 5, at("2026-03-10T09:00:00Z"));
    expect(recommendNext(ALL, s, UTC)).toEqual({ lessonId: B.id, reason: "review" });
  });

  it("asks to consolidate once all are complete, and returns null when all are mastered", () => {
    let s = emptyProgress();
    for (const l of ALL) s = complete(s, l, "2026-03-09T09:00:00Z");
    expect(recommendNext(ALL, s, UTC)).toEqual({ lessonId: A.id, reason: "consolidate" });
    for (const l of ALL) s = recordQuizAttempt(s, l.id, 5, 5, at("2026-03-10T09:00:00Z"));
    expect(recommendNext(ALL, s, UTC)).toBeNull();
  });

  it("says come back later when everything was passed only today", () => {
    let s = emptyProgress();
    for (const l of ALL) s = complete(s, l, "2026-03-10T09:00:00Z");
    expect(recommendNext(ALL, s, UTC)).toEqual({ lessonId: A.id, reason: "consolidate-later" });
  });
});

describe("streak", () => {
  const clock = (iso: string, timeZone = "UTC"): Clock => ({ now: at(iso), timeZone });

  it("is zero with no activity", () => {
    expect(computeStreak([], UTC)).toEqual({ current: 0, longest: 0, activeToday: false, activeDays: 0 });
  });

  it("counts several activities on one day once", () => {
    const st = computeStreak(["2026-03-10T08:00:00Z", "2026-03-10T09:00:00Z", "2026-03-10T23:59:00Z"], clock("2026-03-10T23:59:30Z"));
    expect(st).toEqual({ current: 1, longest: 1, activeToday: true, activeDays: 1 });
  });

  it("counts consecutive days and stays alive until the end of the next day", () => {
    const times = ["2026-03-07T10:00:00Z", "2026-03-08T10:00:00Z", "2026-03-09T10:00:00Z"];
    expect(computeStreak(times, clock("2026-03-09T20:00:00Z")).current).toBe(3);
    expect(computeStreak(times, clock("2026-03-10T23:00:00Z"))).toMatchObject({ current: 3, activeToday: false });
    expect(computeStreak(times, clock("2026-03-11T00:00:01Z")).current).toBe(0);
  });

  it("breaks on a gap but remembers the longest run", () => {
    const times = ["2026-03-01T10:00:00Z", "2026-03-02T10:00:00Z", "2026-03-03T10:00:00Z", "2026-03-05T10:00:00Z", "2026-03-06T10:00:00Z"];
    expect(computeStreak(times, clock("2026-03-06T12:00:00Z"))).toEqual({ current: 2, longest: 3, activeToday: true, activeDays: 5 });
  });

  it("uses local calendar days, not 24-hour windows", () => {
    // 23:00 and 01:00 the next day (local) are two days in a row.
    const times = ["2026-06-01T22:00:00Z", "2026-06-02T00:30:00Z"];
    expect(computeStreak(times, clock("2026-06-02T01:00:00Z", "UTC")).current).toBe(2);
    // In Tokyo (UTC+9) both are on 2 June, so only one day.
    expect(computeStreak(times, clock("2026-06-02T01:00:00Z", "Asia/Tokyo")).current).toBe(1);
  });

  it("is not skewed by daylight saving changes", () => {
    // US clocks spring forward on 8 March 2026.
    const times = ["2026-03-07T15:00:00Z", "2026-03-08T15:00:00Z", "2026-03-09T15:00:00Z"];
    expect(computeStreak(times, clock("2026-03-09T16:00:00Z", "America/New_York")).current).toBe(3);
  });

  it("ignores future-dated and invalid timestamps", () => {
    const st = computeStreak(["2026-03-10T09:00:00Z", "2030-01-01T00:00:00Z", "not a date", ""], UTC);
    expect(st).toEqual({ current: 1, longest: 1, activeToday: true, activeDays: 1 });
  });

  it("falls back gracefully for an unknown time zone", () => {
    expect(() => computeStreak(["2026-03-10T09:00:00Z"], { now: UTC.now, timeZone: "Mars/Olympus" })).not.toThrow();
    expect(dayKey("2026-03-10T09:00:00Z", "UTC")).toBe("2026-03-10");
  });

  it("reads activity from all parts of the state", () => {
    let s = markSectionRead(emptyProgress(), A.id, "s1", at("2026-03-08T09:00:00Z"));
    s = completeExercise(s, A.id, at("2026-03-09T09:00:00Z"));
    s = saveReflection(s, B.id, "note", at("2026-03-10T09:00:00Z"));
    expect(streakFromState(s, UTC).current).toBe(3);
  });
});

describe("parsing stored data", () => {
  it("handles empty input without flagging repair", () => {
    for (const v of [null, undefined, ""]) {
      const r = parseProgress(v);
      expect(r.repaired).toBe(false);
      expect(r.state).toEqual(emptyProgress());
    }
  });

  it("repairs invalid JSON and non-objects", () => {
    for (const v of ["{not json", "42", "[]", 7, true, "null"]) {
      const r = parseProgress(v);
      expect(r.state.lessons).toEqual({});
      if (v !== "null") expect(r.repaired).toBe(true);
    }
  });

  it("round-trips valid state exactly", () => {
    let s = complete(emptyProgress(), A, "2026-03-10T09:00:00Z");
    s = saveReflection(s, A.id, "hello", at("2026-03-10T10:00:00Z"));
    const r = parseProgress(JSON.stringify(s));
    expect(r.repaired).toBe(false);
    expect(r.state).toEqual(s);
  });

  it("keeps valid parts and drops corrupt parts", () => {
    const raw = {
      version: 1,
      updatedAt: "garbage",
      lessons: {
        "lesson-a": {
          sectionsRead: { s1: "2026-03-10T09:00:00Z", s2: "nope", "BAD KEY": "2026-03-10T09:00:00Z" },
          exerciseCompletedAt: 12345,
          quizAttempts: [
            { at: "2026-03-10T09:00:00Z", correct: 4, total: 5 },
            { at: "2026-03-10T09:00:00Z", correct: 9, total: 5 },
            { at: "bad", correct: 1, total: 5 },
            { at: "2026-03-10T09:00:00Z", correct: "4", total: 5 },
            null,
          ],
          reflection: { text: 5 },
        },
        "lesson-b": "corrupt",
        "Bad Id!": {},
      },
    };
    // A real "__proto__" key, as JSON.parse would produce from hostile data.
    const json = JSON.stringify(raw).replace('"lesson-b"', '"__proto__":{"polluted":true},"lesson-b"');
    const r = parseProgress(json);
    expect(r.repaired).toBe(true);
    expect(r.issues.length).toBeGreaterThan(0);
    const a = r.state.lessons["lesson-a"];
    expect(a.sectionsRead).toEqual({ s1: "2026-03-10T09:00:00Z" });
    expect(a.exerciseCompletedAt).toBeNull();
    expect(a.quizAttempts).toEqual([{ at: "2026-03-10T09:00:00Z", correct: 4, total: 5 }]);
    expect(a.reflection).toBeNull();
    expect(Object.keys(r.state.lessons)).toEqual(["lesson-a"]);
    expect(r.state.updatedAt).toBeNull();
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
  });

  it("migrates data without a version and keeps newer-version data it understands", () => {
    const old = parseProgress({ lessons: { "lesson-a": { exerciseCompletedAt: "2026-03-10T09:00:00Z" } } });
    expect(old.state.version).toBe(1);
    expect(old.state.lessons["lesson-a"].exerciseCompletedAt).toBe("2026-03-10T09:00:00Z");
    expect(old.repaired).toBe(true);
    const newer = parseProgress({ version: 99, lessons: { "lesson-a": { exerciseCompletedAt: "2026-03-10T09:00:00Z" } }, extra: 1 });
    expect(newer.state.lessons["lesson-a"].exerciseCompletedAt).toBe("2026-03-10T09:00:00Z");
    expect(newer.issues.join(" ")).toMatch(/newer version/);
  });

  it("sorts attempts by time so 'latest' is reliable", () => {
    const r = parseProgress({
      version: 1,
      lessons: { "lesson-b": { quizAttempts: [{ at: "2026-03-10T09:00:00Z", correct: 1, total: 5 }, { at: "2026-03-01T09:00:00Z", correct: 5, total: 5 }] } },
    });
    expect(r.state.lessons["lesson-b"].quizAttempts[1].correct).toBe(1);
  });
});

describe("journey stage", () => {
  it("stays at Awareness until Market Foundations is complete", () => {
    expect(journeyStage({ total: 10, started: 0, completed: 0, mastered: 0, masteryPct: 0 }).index).toBe(0);
    const mid = journeyStage({ total: 10, started: 4, completed: 3, mastered: 0, masteryPct: 15 });
    expect(mid.index).toBe(0);
    expect(mid.detail).toMatch(/7 Market Foundations lessons left/);
    expect(journeyStage({ total: 10, started: 10, completed: 10, mastered: 2, masteryPct: 60 }).index).toBe(1);
    expect(journeyStage({ total: 0, started: 0, completed: 0, mastered: 0, masteryPct: null }).index).toBe(0);
  });

  it("works end to end with the real curriculum", () => {
    let s = emptyProgress();
    for (const l of LESSONS) s = complete(s, l, "2026-03-09T09:00:00Z");
    expect(journeyStage(summarize(LESSONS, s, UTC)).index).toBe(1);
  });
});

describe("stores", () => {
  function fakeStorage(initial: Record<string, string> = {}, opts: { failWrites?: boolean } = {}) {
    const data = new Map(Object.entries(initial));
    return {
      data,
      getItem: (k: string) => data.get(k) ?? null,
      setItem: (k: string, v: string) => {
        if (opts.failWrites) throw new Error("QuotaExceededError");
        data.set(k, v);
      },
      removeItem: (k: string) => void data.delete(k),
    };
  }

  it("saves and loads through localStorage", () => {
    const ls = fakeStorage();
    const store = createLocalStorageStore(ls);
    const s = complete(emptyProgress(), A, "2026-03-10T09:00:00Z");
    expect(store.save(s).ok).toBe(true);
    expect(store.load().state).toEqual(s);
    store.clear();
    expect(store.load().state).toEqual(emptyProgress());
  });

  it("backs up corrupt data once before it can be overwritten", () => {
    const ls = fakeStorage({ [STORAGE_KEY]: "{broken" });
    const store = createLocalStorageStore(ls);
    const r = store.load();
    expect(r.repaired).toBe(true);
    expect(ls.data.get(BACKUP_KEY)).toBe("{broken");
  });

  it("reports failed writes instead of throwing", () => {
    const store = createLocalStorageStore(fakeStorage({}, { failWrites: true }));
    expect(store.save(emptyProgress()).ok).toBe(false);
  });

  it("notifies on storage events for its key only", () => {
    const listeners: ((e: StorageEvent) => void)[] = [];
    const events = {
      addEventListener: (_: string, fn: (e: StorageEvent) => void) => listeners.push(fn),
      removeEventListener: () => {},
    } as unknown as Window;
    const store = createLocalStorageStore(fakeStorage(), events);
    let calls = 0;
    store.subscribe(() => calls++);
    listeners[0]({ key: STORAGE_KEY } as StorageEvent);
    listeners[0]({ key: "something-else" } as StorageEvent);
    listeners[0]({ key: null } as StorageEvent);
    expect(calls).toBe(2);
  });

  it("memory store works when storage is blocked", () => {
    const m = createMemoryStore();
    const s = complete(emptyProgress(), A, "2026-03-10T09:00:00Z");
    m.save(s);
    expect(m.load().state).toBe(s);
    expect(m.kind).toBe("memory");
  });
});

describe("store backups and reset (round 2)", () => {
  function fake(initial: Record<string, string> = {}) {
    const data = new Map(Object.entries(initial));
    return {
      data,
      getItem: (k: string) => data.get(k) ?? null,
      setItem: (k: string, v: string) => void data.set(k, v),
      removeItem: (k: string) => void data.delete(k),
      key: (i: number) => [...data.keys()][i] ?? null,
      get length() { return data.size; },
    };
  }

  it("keeps each different corruption, newest first, capped at MAX_BACKUPS", () => {
    const ls = fake();
    const st = createLocalStorageStore(ls);
    for (const bad of ["{1", "{2", "{2", "{3", "{4"]) {
      ls.data.set(STORAGE_KEY, bad);
      st.load();
    }
    const keys = backupKeys();
    expect(keys).toHaveLength(MAX_BACKUPS);
    expect(keys.map((k) => ls.data.get(k))).toEqual(["{4", "{3", "{2"]);
    expect([...ls.data.keys()].filter((k) => k.includes("corrupt-backup"))).toHaveLength(MAX_BACKUPS);
  });

  it("clear() removes progress, every backup and any other traderos.academy.* key, but nothing else", () => {
    const ls = fake({ [STORAGE_KEY]: "{x", "traderos.academy.old-thing": "1", "traderos.sidebar.collapsed": "1", other: "1" });
    const st = createLocalStorageStore(ls);
    st.load();
    st.clear();
    expect([...ls.data.keys()].sort()).toEqual(["other", "traderos.sidebar.collapsed"]);
  });
});

describe("quiz option shuffle", () => {
  it("is stable per seed, varies across attempts, and keeps every option", () => {
    const opts = ["a", "b", "c", "d"];
    expect(seededShuffle(opts, "l:q1:1")).toEqual(seededShuffle(opts, "l:q1:1"));
    const orders = new Set(Array.from({ length: 20 }, (_, i) => seededShuffle(opts, `l:q1:${i}`).join("")));
    expect(orders.size).toBeGreaterThan(5);
    for (const o of orders) expect([...o].sort().join("")).toBe("abcd");
  });

  it("puts the correct answer in every position across attempts", () => {
    const seen = new Set<number>();
    for (let i = 0; i < 40; i++) seen.add(seededShuffle(["a", "b", "c", "d"], `x:q:${i}`).indexOf("b"));
    expect(seen.size).toBe(4);
  });
});

describe("future-dated attempts (round 2)", () => {
  it("are ignored for best, last, completion and review", () => {
    let s = complete(emptyProgress(), B, "2026-03-09T09:00:00Z", 2, 5); // failed, real
    s = recordQuizAttempt(s, B.id, 5, 5, at("2030-01-01T00:00:00Z")); // future pass
    const st = lessonStatus(B, s, UTC);
    expect(st.attempts).toBe(1);
    expect(st.bestScore).toBe(40);
    expect(st.complete).toBe(false);
    expect(s.lessons[B.id].quizAttempts).toHaveLength(2); // still stored
  });
});

describe("mergeProgress (round 3: recovering after failed saves / two tabs)", () => {
  it("unions sections, exercises and attempts, dedupes attempts and keeps the newer reflection", () => {
    // Tab 1 (saves failing) and tab 2 (saved successfully) both did work.
    let mem = markSectionRead(emptyProgress(), A.id, "s1", at("2026-03-10T09:00:00Z"));
    mem = recordQuizAttempt(mem, A.id, 3, 5, at("2026-03-10T09:05:00Z"));
    mem = saveReflection(mem, A.id, "older note", at("2026-03-10T09:06:00Z"));
    let stored = markSectionRead(emptyProgress(), A.id, "s2", at("2026-03-10T09:01:00Z"));
    stored = markSectionRead(stored, A.id, "s1", at("2026-03-10T08:00:00Z"));
    stored = completeExercise(stored, B.id, at("2026-03-10T09:02:00Z"));
    stored = recordQuizAttempt(stored, A.id, 3, 5, at("2026-03-10T09:05:00Z")); // same attempt (duplicate)
    stored = recordQuizAttempt(stored, A.id, 5, 5, at("2026-03-10T09:07:00Z"));
    stored = saveReflection(stored, A.id, "newer note", at("2026-03-10T09:08:00Z"));

    const m = mergeProgress(mem, stored);
    expect(m.lessons[A.id].sectionsRead).toEqual({ s1: "2026-03-10T08:00:00.000Z", s2: "2026-03-10T09:01:00.000Z" });
    expect(m.lessons[A.id].quizAttempts.map((q) => q.correct)).toEqual([3, 5]);
    expect(m.lessons[A.id].reflection?.text).toBe("newer note");
    expect(m.lessons[B.id].exerciseCompletedAt).toBe("2026-03-10T09:02:00.000Z");
    expect(lessonStatus(A, m, UTC).bestScore).toBe(100);
    // symmetric for the facts that matter
    expect(mergeProgress(stored, mem).lessons[A.id]).toEqual(m.lessons[A.id]);
    // merging with itself or with empty changes nothing
    expect(mergeProgress(m, m).lessons).toEqual(m.lessons);
    expect(mergeProgress(m, emptyProgress()).lessons).toEqual(m.lessons);
  });

  it("a failed-save session that recovers does not overwrite the other tab's save", () => {
    const ls = new Map<string, string>();
    let full = true;
    const storage = {
      getItem: (k: string) => ls.get(k) ?? null,
      setItem: (k: string, v: string) => { if (full) throw new Error("QuotaExceededError"); ls.set(k, v); },
      removeItem: (k: string) => void ls.delete(k),
    };
    const store = createLocalStorageStore(storage);
    // This tab: exercise solved, save fails.
    const mine = completeExercise(emptyProgress(), A.id, at("2026-03-10T09:00:00Z"));
    expect(store.save(mine).ok).toBe(false);
    // Other tab saves meanwhile (space freed).
    ls.set(STORAGE_KEY, JSON.stringify(completeExercise(emptyProgress(), B.id, at("2026-03-10T09:01:00Z"))));
    full = false;
    // Recovery: what the provider does on the next update.
    const merged = mergeProgress(mine, store.load().state);
    expect(store.save(merged).ok).toBe(true);
    const after = store.load().state;
    expect(after.lessons[A.id].exerciseCompletedAt).not.toBeNull();
    expect(after.lessons[B.id].exerciseCompletedAt).not.toBeNull();
  });
});

describe("merge tombstones (round 3: resets and cleared reflections)", () => {
  it("a reset (resetAt) discards older in-memory progress instead of unioning it", () => {
    // Tab A (saves failing) solved things before the reset...
    let mem = completeExercise(emptyProgress(), A.id, at("2026-03-10T09:00:00Z"));
    mem = saveReflection(mem, A.id, "secret", at("2026-03-10T09:01:00Z"));
    // ...and one thing after it.
    mem = markSectionRead(mem, B.id, "s1", at("2026-03-10T11:00:00Z"));
    const stored = resetProgress(at("2026-03-10T10:00:00Z"));
    const m = mergeProgress(mem, stored);
    expect(m.lessons[A.id]).toBeUndefined();
    expect(m.lessons[B.id].sectionsRead).toEqual({ s1: "2026-03-10T11:00:00.000Z" });
    expect(m.resetAt).toBe("2026-03-10T10:00:00.000Z");
    expect(mergeProgress(stored, mem)).toEqual(m); // order does not matter
  });

  it("the newest reset wins, and data recorded after it survives on both sides", () => {
    const a = { ...completeExercise(emptyProgress(), A.id, at("2026-03-10T12:00:00Z")), resetAt: "2026-03-10T08:00:00.000Z" };
    const b = { ...completeExercise(emptyProgress(), B.id, at("2026-03-10T09:30:00Z")), resetAt: "2026-03-10T09:00:00.000Z" };
    const m = mergeProgress(a, b);
    expect(m.resetAt).toBe("2026-03-10T09:00:00.000Z");
    expect(Object.keys(m.lessons).sort()).toEqual([A.id, B.id]);
  });

  it("a cleared reflection stays cleared when merged with an older copy that still has it", () => {
    const older = saveReflection(emptyProgress(), A.id, "keep me?", at("2026-03-10T09:00:00Z"));
    const cleared = saveReflection(older, A.id, "", at("2026-03-10T09:05:00Z"));
    expect(cleared.lessons[A.id].reflection).toBeNull();
    expect(cleared.lessons[A.id].reflectionClearedAt).toBe("2026-03-10T09:05:00.000Z");
    expect(mergeProgress(cleared, older).lessons[A.id].reflection).toBeNull();
    expect(mergeProgress(older, cleared).lessons[A.id].reflection).toBeNull();
  });

  it("a reflection written after a clear wins over the clear", () => {
    const cleared = saveReflection(saveReflection(emptyProgress(), A.id, "x", at("2026-03-10T09:00:00Z")), A.id, "", at("2026-03-10T09:05:00Z"));
    const newer = saveReflection(emptyProgress(), A.id, "new text", at("2026-03-10T09:10:00Z"));
    expect(mergeProgress(cleared, newer).lessons[A.id].reflection?.text).toBe("new text");
  });

  it("old data without tombstone fields still parses, and the fields round-trip", () => {
    const old = parseProgress(JSON.stringify({ version: 1, lessons: { [A.id]: { reflection: { text: "hi", updatedAt: "2026-03-10T09:00:00Z" } } }, updatedAt: null }));
    expect(old.repaired).toBe(false);
    expect(old.state.resetAt).toBeUndefined();
    const s = saveReflection({ ...old.state, resetAt: "2026-03-01T00:00:00.000Z" }, A.id, "", at("2026-03-10T10:00:00Z"));
    const back = parseProgress(JSON.stringify(s));
    expect(back.repaired).toBe(false);
    expect(back.state).toEqual(s);
    expect(parseProgress(JSON.stringify({ ...s, resetAt: "nope" })).repaired).toBe(true);
  });

  it("store.reset() clears everything but leaves a marker that load() applies", () => {
    const ls = new Map<string, string>();
    const storage = { getItem: (k: string) => ls.get(k) ?? null, setItem: (k: string, v: string) => void ls.set(k, v), removeItem: (k: string) => void ls.delete(k) };
    const store = createLocalStorageStore(storage);
    store.save(completeExercise(emptyProgress(), A.id, at("2026-03-10T09:00:00Z")));
    store.reset(at("2026-03-10T10:00:00Z"));
    expect(ls.get(STORAGE_KEY)).toBeUndefined();
    expect(ls.get(RESET_KEY)).toBe("2026-03-10T10:00:00.000Z");
    const loaded = store.load().state;
    expect(loaded.resetAt).toBe("2026-03-10T10:00:00.000Z");
    // A recovering tab's older progress cannot come back.
    const mem = completeExercise(emptyProgress(), A.id, at("2026-03-10T09:00:00Z"));
    expect(mergeProgress(mem, loaded).lessons[A.id]).toBeUndefined();
  });
});

describe("cross-track progress", () => {
  const written = TRACKS.filter((t) => t.status === "written").map((t) => lessonsOfTrack(t.id));
  const byId = (id: string) => lessonsOfTrack(id);
  const mf = byId("market-foundations"), fx = byId("forex-foundations"), si = byId("stocks-indices"), cy = byId("crypto"), co = byId("commodities"), cr = byId("chart-reading"), ta = byId("technical-analysis"), rm = byId("risk-management"), psy = byId("trading-psychology"), strat = byId("strategy-development"), bt = byId("backtesting"), mn = byId("macro-news"), ms = byId("market-structure"), adv = byId("advanced");
  const clock: Clock = { now: at("2026-03-10T12:00:00Z"), timeZone: "UTC" };

  it("current track is the first one not complete, then the last when all are complete", () => {
    let s = emptyProgress();
    expect(currentTrackIndex(written, s, clock)).toBe(0);
    for (const l of mf) s = complete(s, l, "2026-03-10T09:00:00Z");
    expect(currentTrackIndex(written, s, clock)).toBe(1);
    for (const l of fx) s = complete(s, l, "2026-03-10T09:00:00Z");
    expect(currentTrackIndex(written, s, clock)).toBe(2);
    for (const l of si) s = complete(s, l, "2026-03-10T09:00:00Z");
    // Tracks follow curriculum order: Cryptocurrency (4) and Commodities (5) come next, then Chart Reading (6) onward to Advanced (14).
    const rest = [cy, co, cr, ta, rm, psy, strat, bt, mn, ms, adv];
    rest.forEach((track, k) => {
      expect(currentTrackIndex(written, s, clock)).toBe(3 + k);
      for (const l of track) s = complete(s, l, "2026-03-10T09:00:00Z");
    });
    // …and the last written track stays current once everything is complete.
    expect(currentTrackIndex(written, s, clock)).toBe(written.length - 1);
    expect(currentTrackIndex([], s, clock)).toBe(-1);
    expect(currentTrackIndex([[], fx], emptyProgress(), clock)).toBe(1); // skips empty tracks
  });

  it("a skipped lesson in an earlier track keeps that track current", () => {
    let s = emptyProgress();
    for (const l of mf.slice(1)) s = complete(s, l, "2026-03-10T09:00:00Z");
    for (const l of fx) s = complete(s, l, "2026-03-10T09:00:00Z");
    expect(currentTrackIndex(written, s, clock)).toBe(0);
    expect(recommendNext(LESSONS, s, clock)).toEqual({ lessonId: mf[0].id, reason: "start" });
  });

  it("the recommendation carries on into Forex Foundations, then Stocks and Indices, Chart Reading, Technical Analysis, Risk Management, Trading Psychology, Strategy Development, Backtesting, Macro and News and Market Structure", () => {
    let s = emptyProgress();
    for (const l of mf) s = complete(s, l, "2026-03-10T09:00:00Z");
    expect(recommendNext(LESSONS, s, clock)).toEqual({ lessonId: "fx-quotes", reason: "start" });
    s = markSectionRead(s, "fx-quotes", fx[0].sections[0].id, at("2026-03-10T10:00:00Z"));
    expect(recommendNext(LESSONS, s, clock)).toEqual({ lessonId: "fx-quotes", reason: "continue" });
    for (const l of fx) s = complete(s, l, "2026-03-10T09:00:00Z");
    expect(recommendNext(LESSONS, s, clock)).toEqual({ lessonId: "si-exchanges", reason: "start" });
    for (const l of si) s = complete(s, l, "2026-03-10T09:00:00Z");
    // Track 4 (Cryptocurrency) and Track 5 (Commodities) follow Stocks and Indices…
    expect(recommendNext(LESSONS, s, clock)).toEqual({ lessonId: "cy-blockchains", reason: "start" });
    for (const l of cy) s = complete(s, l, "2026-03-10T09:00:00Z");
    expect(recommendNext(LESSONS, s, clock)).toEqual({ lessonId: "co-energy", reason: "start" });
    for (const l of co) s = complete(s, l, "2026-03-10T09:00:00Z");
    // …then Track 6 (Chart Reading).
    expect(recommendNext(LESSONS, s, clock)).toEqual({ lessonId: "cr-what-is-a-chart", reason: "start" });
    for (const l of cr) s = complete(s, l, "2026-03-10T09:00:00Z");
    // Track 7 (Technical Analysis) follows Chart Reading in curriculum order…
    expect(recommendNext(LESSONS, s, clock)).toEqual({ lessonId: "ta-moving-averages", reason: "start" });
    for (const l of ta) s = complete(s, l, "2026-03-10T09:00:00Z");
    // …then Track 8 (Risk Management).
    expect(recommendNext(LESSONS, s, clock)).toEqual({ lessonId: "rm-risk-per-trade", reason: "start" });
    // …then Track 9 (Trading Psychology)…
    for (const l of rm) s = complete(s, l, "2026-03-10T09:00:00Z");
    expect(recommendNext(LESSONS, s, clock)).toEqual({ lessonId: "psy-prospect-theory", reason: "start" });
    // …then Track 10 (Strategy Development)…
    for (const l of psy) s = complete(s, l, "2026-03-10T09:00:00Z");
    expect(recommendNext(LESSONS, s, clock)).toEqual({ lessonId: "strat-anatomy", reason: "start" });
    // …then Track 11 (Backtesting)…
    for (const l of strat) s = complete(s, l, "2026-03-10T09:00:00Z");
    expect(recommendNext(LESSONS, s, clock)).toEqual({ lessonId: "bt-what-it-tells", reason: "start" });
    // …then Track 12 (Macro and News)…
    for (const l of bt) s = complete(s, l, "2026-03-10T09:00:00Z");
    expect(recommendNext(LESSONS, s, clock)).toEqual({ lessonId: "mn-central-banks", reason: "start" });
    // …then Track 13 (Market Structure).
    for (const l of mn) s = complete(s, l, "2026-03-10T09:00:00Z");
    expect(recommendNext(LESSONS, s, clock)).toEqual({ lessonId: "ms-venues", reason: "start" });
    for (const l of ms) s = complete(s, l, "2026-03-10T09:00:00Z");
    // …then Track 14 (Advanced Trading Concepts).
    expect(recommendNext(LESSONS, s, clock)).toEqual({ lessonId: "adv-correlation", reason: "start" });
    for (const l of adv) s = complete(s, l, "2026-03-10T09:00:00Z");
    // all complete but practised on one day only → consolidate (later: same day)
    expect(recommendNext(LESSONS, s, clock)?.reason).toBe("consolidate-later");
  });

  it("journey stays at Learning through tracks 2 and 3, with a track-aware detail line", () => {
    let s = emptyProgress();
    for (const l of mf) s = complete(s, l, "2026-03-10T09:00:00Z");
    const mfSum = summarize(mf, s, clock);
    const fxSum = summarize(fx, s, clock);
    const j1 = journeyStage(mfSum, { title: "Forex Foundations", completed: fxSum.completed, total: fxSum.total });
    expect(j1.index).toBe(1);
    expect(j1.detail).toContain("Forex Foundations: 0 of 7");
    for (const l of [...fx, ...si]) s = complete(s, l, "2026-03-10T09:00:00Z");
    const siSum = summarize(si, s, clock);
    const j2 = journeyStage(summarize(mf, s, clock), { title: "Stocks and Indices", completed: siSum.completed, total: siSum.total });
    expect(j2.index).toBe(1);
    expect(j2.detail).toContain("Every written Academy lesson is complete");
    // without the optional argument the old wording is kept
    expect(journeyStage(mfSum).detail).toContain("completed Market Foundations");
    // the second argument never changes the stage before foundations are done
    expect(journeyStage(summarize(mf, emptyProgress(), clock), { title: "Forex Foundations", completed: 7, total: 7 }).index).toBe(0);
  });
});
