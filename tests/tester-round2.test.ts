/** Tester round 2: backup rotation, reset sweep, quiz option shuffle, answer-length bias. */
import { describe, expect, it } from "vitest";
import { emptyProgress } from "@/lib/academy/progress";
import { BACKUP_KEY, STORAGE_KEY, backupKeys, createLocalStorageStore } from "@/lib/academy/store";
import { seededShuffle } from "@/lib/academy/shuffle";
import { LESSONS } from "@/lib/academy/curriculum";

function fake(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  return {
    data,
    get length() { return data.size; },
    key: (i: number) => [...data.keys()][i] ?? null,
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
    removeItem: (k: string) => void data.delete(k),
  };
}

describe("tester r2: corrupt backup rotation", () => {
  it("keeps the 3 most recent distinct corruptions, newest first", () => {
    const ls = fake();
    const st = createLocalStorageStore(ls);
    for (const c of ["{c1", "{c2", "{c3", "{c4"]) {
      ls.data.set(STORAGE_KEY, c);
      st.load();
      st.save(emptyProgress());
    }
    expect(backupKeys().map((k) => ls.data.get(k))).toEqual(["{c4", "{c3", "{c2"]);
  });
  it("re-loading the same corrupt data does not rotate", () => {
    const ls = fake({ [STORAGE_KEY]: "{same" });
    const st = createLocalStorageStore(ls);
    st.load(); st.load(); st.load();
    expect(backupKeys().map((k) => ls.data.get(k) ?? null)).toEqual(["{same", null, null]);
  });
  it("a corruption equal to an OLDER backup is not stored twice", () => {
    const ls = fake();
    const st = createLocalStorageStore(ls);
    for (const c of ["{A", "{B", "{A"]) { ls.data.set(STORAGE_KEY, c); st.load(); st.save(emptyProgress()); }
    const vals = backupKeys().map((k) => ls.data.get(k)).filter(Boolean);
    expect(new Set(vals).size).toBe(vals.length);
  });
  it("valid data never creates a backup", () => {
    const ls = fake();
    const st = createLocalStorageStore(ls);
    st.save(emptyProgress());
    st.load();
    expect(ls.data.has(BACKUP_KEY)).toBe(false);
  });
});

describe("tester r2: reset sweep", () => {
  it("removes every traderos.academy.* key but nothing else", () => {
    const ls = fake({
      [STORAGE_KEY]: "{}", [BACKUP_KEY]: "x", [`${BACKUP_KEY}.2`]: "y", [`${BACKUP_KEY}.3`]: "z",
      "traderos.academy.future-thing": "1", "traderos.sidebar.collapsed": "1", "other.app": "keep",
    });
    createLocalStorageStore(ls).clear();
    expect([...ls.data.keys()].sort()).toEqual(["other.app", "traderos.sidebar.collapsed"]);
  });
  it("works on storage without key()/length (falls back to known keys)", () => {
    const data = new Map([[STORAGE_KEY, "{}"], [BACKUP_KEY, "x"], [`${BACKUP_KEY}.3`, "z"]]);
    createLocalStorageStore({ getItem: (k) => data.get(k) ?? null, setItem: (k, v) => void data.set(k, v), removeItem: (k) => void data.delete(k) }).clear();
    expect(data.size).toBe(0);
  });
});

describe("tester r2: quiz option shuffle", () => {
  it("is a deterministic permutation", () => {
    for (const l of LESSONS) for (const q of l.quiz) {
      const a = seededShuffle(q.options, `${l.id}:${q.id}:3`);
      expect(seededShuffle(q.options, `${l.id}:${q.id}:3`)).toEqual(a);
      expect(a.map((o) => o.id).sort()).toEqual(q.options.map((o) => o.id).sort());
    }
  });
  it("over 200 retakes the correct answer is not stuck in one position (each position < 45%)", () => {
    const bad: string[] = [];
    for (const l of LESSONS) for (const q of l.quiz) {
      const c = new Array(q.options.length).fill(0);
      for (let s = 1; s <= 200; s++) c[seededShuffle(q.options, `${l.id}:${q.id}:${s}`).findIndex((o) => o.id === q.correct)]++;
      if (Math.max(...c) / 200 >= 0.45) bad.push(`${l.id}/${q.id} ${c.join(",")}`);
    }
    expect(bad, bad.join("; ")).toEqual([]);
  });
  it("first attempt: correct answer position is spread (no position > 40%)", () => {
    const pos = [0, 0, 0, 0];
    let n = 0;
    for (const l of LESSONS) for (const q of l.quiz) { pos[seededShuffle(q.options, `${l.id}:${q.id}:1`).findIndex((o) => o.id === q.correct)]++; n++; }
    console.log("[tester] attempt-1 correct positions", pos);
    for (const p of pos) expect(p / n).toBeLessThan(0.4);
  });
});

describe("tester r2: answer length bias", () => {
  it("correct answer is neither usually the longest nor usually the shortest", () => {
    let longest = 0, shortest = 0, total = 0;
    for (const l of LESSONS) for (const q of l.quiz) {
      total++;
      const lens = q.options.map((o) => o.text.length);
      const c = q.options.find((o) => o.id === q.correct)!.text.length;
      if (c === Math.max(...lens)) longest++;
      if (c === Math.min(...lens)) shortest++;
    }
    console.log(`[tester] correct longest ${longest}/${total}, shortest ${shortest}/${total}`);
    expect(longest / total).toBeLessThan(0.45);
    expect(shortest / total).toBeLessThan(0.45);
  });
});
