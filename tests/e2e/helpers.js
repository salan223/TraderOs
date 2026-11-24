// Shared helpers for the tester's Playwright scripts.
// Run with: NODE_PATH=$(npm root -g) node tests/e2e/<script>.js   (server on BASE, default http://localhost:3300)
const { chromium, devices } = require("playwright");
const BASE = process.env.BASE || "http://localhost:3300";
const KEY = "traderos.academy.progress.v1";
const BACKUP = KEY + ".corrupt-backup";
const results = [];
function check(name, ok, detail = "") {
  results.push({ name, ok: !!ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  — " + detail : ""}`);
}
function summary() {
  const f = results.filter((r) => !r.ok);
  console.log(`\n${results.length - f.length}/${results.length} passed`);
  if (f.length) { console.log("FAILURES:"); for (const r of f) console.log(" - " + r.name + (r.detail ? ": " + r.detail : "")); }
  process.exitCode = f.length ? 1 : 0;
}
function watchConsole(page, bucket) {
  page.on("console", (m) => { if (m.type() === "error" || m.type() === "warning") bucket.push(`[${m.type()}] ${m.text()}`); });
  page.on("pageerror", (e) => bucket.push(`[pageerror] ${e.message}`));
}
async function noHScroll(page) {
  return page.evaluate(() => {
    const de = document.documentElement;
    const over = de.scrollWidth - de.clientWidth;
    let culprit = null;
    if (over > 0) {
      for (const el of document.querySelectorAll("body *")) {
        const r = el.getBoundingClientRect();
        if (r.right > de.clientWidth + 1 && getComputedStyle(el).position !== "fixed") { culprit = `${el.tagName}.${(el.className || "").toString().slice(0, 80)} right=${Math.round(r.right)}`; break; }
      }
    }
    return { over, culprit };
  });
}
const DESKTOP = { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 };
const PHONE = { ...devices["iPhone 14"], deviceScaleFactor: 1 };
const NARROW = { viewport: { width: 320, height: 640 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true };
const TABLET = { viewport: { width: 800, height: 1000 }, deviceScaleFactor: 1 };
// Market Foundations lesson ids (several scripts test this track specifically).
const LESSON_IDS = ["what-is-a-market", "why-prices-move", "market-participants", "stocks", "forex", "indices", "commodities-intro", "crypto-intro", "trading-vs-investing", "terminology"];

// Every WRITTEN lesson, read from the content and curriculum sources so the
// list can never go stale when a track is added. Sorted by track order, then
// lesson order. regression.js cross-checks it against the rendered track pages.
const fs = require("fs"), path = require("path");
function readCurriculum() {
  const root = path.join(__dirname, "../../lib/academy");
  const cur = fs.readFileSync(path.join(root, "curriculum.ts"), "utf8");
  const tracks = [...cur.matchAll(/\{ id: "([a-z0-9-]+)", order: (\d+), title: "([^"]+)",[^\n]*?status: "(written|planned)"/g)]
    .map((m) => ({ id: m[1], order: +m[2], title: m[3], status: m[4] }));
  const lessons = [];
  const dir = path.join(root, "content");
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".ts"))) {
    const src = fs.readFileSync(path.join(dir, f), "utf8");
    const T = (/const T = "([^"]+)"/.exec(src) || [])[1];
    for (const m of src.matchAll(/export const \w+: Lesson = \{\s*id: "([^"]+)",\s*trackId: (T|"[^"]+"),\s*order: (\d+)/g)) {
      const trackId = m[2] === "T" ? T : m[2].slice(1, -1);
      lessons.push({ id: m[1], trackId, order: +m[3] });
    }
  }
  const tOrder = Object.fromEntries(tracks.map((t) => [t.id, t.order]));
  lessons.sort((a, b) => tOrder[a.trackId] - tOrder[b.trackId] || a.order - b.order);
  for (const l of lessons) l.url = `/academy/${l.trackId}/${l.id}`;
  return { tracks, lessons };
}
const CURRICULUM = readCurriculum();
const ALL_LESSONS = CURRICULUM.lessons;
const ALL_LESSON_IDS = ALL_LESSONS.map((l) => l.id);
const WRITTEN_TRACKS = CURRICULUM.tracks.filter((t) => t.status === "written");
const PLANNED_TRACKS = CURRICULUM.tracks.filter((t) => t.status === "planned");
const URL_BY_ID = new Map(ALL_LESSONS.map((l) => [l.id, l.url]));
const lessonUrl = (id) => URL_BY_ID.get(id) || `/academy/market-foundations/${id}`;

// ── Track gating (Phase 2 step 1) ──────────────────────────────────────────
// Tracks 2 and 3 are locked until Market Foundations is complete (every lesson
// AND its track assessment). Scripts that only exercise a locked track's
// widgets open it in read-only Preview mode; scripts that test progress there
// seed a state in which the prerequisite tracks are passed.
// Content and assessment banks only use `import type`, so Node can load the .ts directly.
const LESSON_OBJ = new Map();
for (const f of fs.readdirSync(path.join(__dirname, "../../lib/academy/content")).filter((x) => x.endsWith(".ts"))) {
  for (const v of Object.values(require(path.join(__dirname, "../../lib/academy/content", f)))) if (v && v.id && v.sections) LESSON_OBJ.set(v.id, v);
}
const BANKS = {};
for (const f of fs.readdirSync(path.join(__dirname, "../../lib/academy/assessments")).filter((x) => x.endsWith(".ts") && x !== "index.ts")) {
  for (const v of Object.values(require(path.join(__dirname, "../../lib/academy/assessments", f)))) if (v && v.trackId && v.questions) BANKS[v.trackId] = v;
}
const previewUrl = (id) => lessonUrl(id) + "?preview=1";
const assessmentUrl = (trackId) => `/academy/${trackId}/assessment`;
/** Progress for one lesson, complete (every section read, exercise solved, quiz 5/5) at `iso`. */
function completeLesson(id, iso) {
  const l = LESSON_OBJ.get(id);
  return { sectionsRead: Object.fromEntries(l.sections.map((s) => [s.id, iso])), exerciseCompletedAt: iso, quizAttempts: [{ at: iso, correct: 5, total: 5 }], reflection: null };
}
/** A passing assessment attempt for a track (one right answer per concept). */
function passedAttempt(trackId, iso) {
  const b = BANKS[trackId];
  return {
    at: iso,
    items: b.concepts.map((c) => {
      const q = b.questions.find((x) => x.concept === c.id);
      const it = { q: q.id, c: c.id, ok: true };
      if (c.safetyCritical) it.safety = true;
      if (c.critical || c.safetyCritical) it.critical = true;
      if (c.applied) it.applied = true;
      return it;
    }),
  };
}
/**
 * A stored progress state: `complete` tracks have every lesson complete and
 * (unless listed in `noExam`) a passed assessment. `lessons` are merged on top.
 */
function seedState({ complete = [], noExam = [], lessons = {}, iso = new Date(Date.now() - 3600_000).toISOString(), extra = {} } = {}) {
  const L = {};
  const assessments = {};
  for (const t of complete) {
    for (const l of ALL_LESSONS.filter((x) => x.trackId === t)) L[l.id] = completeLesson(l.id, iso);
    if (!noExam.includes(t)) assessments[t] = { attempts: [passedAttempt(t, iso)], remediation: {}, draft: null };
  }
  const state = { version: 1, updatedAt: iso, lessons: { ...L, ...lessons }, ...extra };
  if (Object.keys(assessments).length) state.assessments = { ...assessments, ...(extra.assessments || {}) };
  return state;
}
/** Write a seeded state into the page's storage (call after a goto on the same origin). */
async function writeState(page, state) {
  await page.evaluate(([k, v]) => { for (const key of Object.keys(localStorage)) localStorage.removeItem(key); localStorage.setItem(k, v); }, [KEY, JSON.stringify(state)]);
}
/**
 * Open the site and store a state in which `tracks` are complete (lessons + passed
 * assessment), so the tracks that depend on them are unlocked. Used by scripts written
 * before track gating that exercise tracks 2 and 3 as an unlocked learner would.
 */
async function unlockTracks(page, tracks = ["market-foundations"]) {
  await page.goto(BASE + "/academy", { waitUntil: "domcontentloaded" });
  await writeState(page, seedState({ complete: tracks }));
}

module.exports = {
  chromium, devices, BASE, KEY, BACKUP, check, summary, watchConsole, noHScroll, DESKTOP, PHONE, NARROW, TABLET,
  LESSON_IDS, ALL_LESSONS, ALL_LESSON_IDS, WRITTEN_TRACKS, PLANNED_TRACKS, CURRICULUM, lessonUrl, results,
  LESSON_OBJ, BANKS, previewUrl, assessmentUrl, completeLesson, passedAttempt, seedState, writeState, unlockTracks,
};
