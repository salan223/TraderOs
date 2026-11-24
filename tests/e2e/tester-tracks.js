// Tester round 5: progress across tracks 1–3 on the dashboard and Academy pages.
// Run with: NODE_PATH=$(npm root -g) node tests/e2e/tester-tracks.js   (server on BASE, default :3300)
const H = require("./helpers");
const { chromium, BASE, KEY, check } = H;

const NOW = new Date("2026-11-25T12:00:00Z"); // a Wednesday, fixed clock
const iso = (d) => new Date(d).toISOString();
const daysAgo = (n) => iso(NOW.getTime() - n * 86400_000);

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ ...H.DESKTOP, timezoneId: "UTC" });
  const page = await ctx.newPage();
  page.setDefaultTimeout(8000);
  await page.clock.setFixedTime(NOW);
  const logs = []; H.watchConsole(page, logs);

  // Section ids per lesson, read from the rendered pages.
  const SECTIONS = {};
  // Phase 2 step 1: tracks 2 and 3 are locked on a fresh browser and their lesson body renders on the
  // client, so their ids are read from the read-only Preview once the article has rendered.
  for (const l of H.ALL_LESSONS) {
    if (l.trackId === "market-foundations") await page.goto(BASE + l.url, { waitUntil: "domcontentloaded" });
    else { await page.goto(BASE + l.url + "?preview=1", { waitUntil: "networkidle" }); await page.locator("article section[id]").first().waitFor(); }
    SECTIONS[l.id] = await page.locator("article section[id]").evaluateAll((ss) => ss.map((s) => s.id));
  }
  // Phase 2 step 2 added Chart Reading (track 6, 12 lessons): 10 + 7 + 6 + 12 = 35.
  check(`read section ids for ${H.ALL_LESSONS.length} lessons (expect 35)`, H.ALL_LESSONS.length === 35 && Object.values(SECTIONS).every((s) => s.length > 0));

  const done = (id, at, attempts) => ({
    sectionsRead: Object.fromEntries(SECTIONS[id].map((s) => [s, at])),
    exerciseCompletedAt: at,
    quizAttempts: attempts || [{ at, correct: 5, total: 5 }],
    reflection: null,
  });
  const ids = (track) => H.ALL_LESSONS.filter((l) => l.trackId === track).map((l) => l.id);
  const T1 = ids("market-foundations"), T2 = ids("forex-foundations"), T3 = ids("stocks-indices"), T6 = ids("chart-reading");
  check("track sizes 10 / 7 / 6", T1.length === 10 && T2.length === 7 && T3.length === 6, `${T1.length}/${T2.length}/${T3.length}`);

  // Phase 2 step 1: a track is complete only when its lessons are complete AND its assessment is
  // passed, and tracks 2 and 3 unlock after Market Foundations. Scenarios that mean "track 1 is
  // complete" therefore also store a passed track-1 assessment (taken at the given time).
  const passed = (tracks, at) => ({ assessments: Object.fromEntries(tracks.map((t) => [t, { attempts: [H.passedAttempt(t, at)], remediation: {}, draft: null }])) });
  async function load(lessons, extra = {}) {
    await page.goto(BASE + "/settings", { waitUntil: "domcontentloaded" });
    await page.evaluate(([k, v]) => { for (const key of Object.keys(localStorage)) localStorage.removeItem(key); localStorage.setItem(k, v); }, [KEY, JSON.stringify({ version: 1, updatedAt: iso(NOW), lessons, ...extra })]);
    await page.goto(BASE + "/", { waitUntil: "networkidle" });
    await page.waitForTimeout(150);
  }
  const panel = (name) => page.locator("section", { has: page.getByRole("heading", { name }) });
  async function dash() {
    const lp = (await panel("Learning progress").textContent()) || "";
    const nl = panel("Recommended next lesson");
    const nlText = (await nl.textContent()) || "";
    const href = await nl.getByRole("link").last().getAttribute("href").catch(() => null);
    const main = (await page.locator("main").textContent()) || "";
    return { lp, nlText, href, main };
  }

  // 1. Track 1 complete (passed 2 days ago → practising) → fx-quotes, Forex is current
  {
    const L = {}; for (const id of T1) L[id] = done(id, daysAgo(2));
    // 1a (new behaviour): lessons alone do not complete the track; the next step is its assessment.
    await load(L);
    const d0 = await dash();
    check("T1 lessons only: recommends the Market Foundations assessment, journey stays Awareness", d0.href === H.assessmentUrl("market-foundations") && /Market Foundations/.test(d0.lp) && /Pass the track assessment/.test(d0.main), `${d0.href}`);
    await load(L, passed(["market-foundations"], daysAgo(2)));
    const d = await dash();
    check("T1 complete: recommends fx-quotes (incomplete track 2 beats consolidating track 1)", d.href === H.lessonUrl("fx-quotes"), d.href);
    check("T1 complete: Learning progress shows Forex Foundations 0/7, track 2 of 14", /Forex Foundations/.test(d.lp) && /0\/7/.test(d.lp) && /Track 2 of 14/.test(d.lp), d.lp.slice(0, 200));
    // overall mastery: 10 practising × 0.5 / 35 written lessons (track 6 added) = 14.3% → 14%
    check("T1 complete: overall mastery 14% (10 × 0.5 / 35)", /14% overall/.test(d.lp), d.lp);
    check("T1 complete: journey stage is Learning, names Forex", /Now working through Forex Foundations: 0 of 7/.test(d.main));
  }

  // 2. Track 1 complete + mastered (2 pass days) + 3 forex lessons done → track mastery and overall
  {
    const L = {};
    for (const id of T1) L[id] = done(id, daysAgo(1), [{ at: daysAgo(3), correct: 5, total: 5 }, { at: daysAgo(1), correct: 5, total: 5 }]);
    for (const id of T2.slice(0, 3)) L[id] = done(id, daysAgo(0.1));
    await load(L, passed(["market-foundations"], daysAgo(1)));
    const d = await dash();
    // track 2: 3 practising × 0.5 / 7 = 21.4% → 21%; overall (10 + 1.5) / 35 = 32.9% → 33% (35 lessons since track 6)
    check("T2 3/7: lessons 3/7, track mastery 21%, overall 33%", /3\/7/.test(d.lp) && /21%/.test(d.lp) && /33% overall/.test(d.lp), d.lp);
    check("T2 3/7: recommends fx-pairs", d.href === H.lessonUrl("fx-pairs"), d.href);
    check("T2 3/7: journey says 3 of 7", /Forex Foundations: 3 of 7/.test(d.main));
  }

  // 3. An incomplete earlier lesson (track 1 'indices' half read) while working in track 2
  {
    const L = {};
    for (const id of T1) L[id] = done(id, daysAgo(2));
    L.indices = { ...done("indices", daysAgo(2)), exerciseCompletedAt: null, quizAttempts: [] };
    for (const id of T2.slice(0, 2)) L[id] = done(id, daysAgo(1));
    await load(L);
    const d = await dash();
    check("incomplete T1 lesson: recommendation goes back to it (curriculum order)", d.href === H.lessonUrl("indices"), d.href);
    check("incomplete T1 lesson: Learning progress shows Market Foundations 9/10", /Market Foundations/.test(d.lp) && /9\/10/.test(d.lp), d.lp.slice(0, 120));
    check("incomplete T1 lesson: journey drops back to Awareness wording (1 lesson left)", /1 Market Foundations lesson left/.test(d.main), (d.main.match(/You are at stage[^.]*\./) || [""])[0]);
  }

  // 4. A track-1 lesson due for review (latest attempt failed) while in track 2
  {
    const L = {};
    for (const id of T1) L[id] = done(id, daysAgo(2));
    L.stocks = done("stocks", daysAgo(2), [{ at: daysAgo(2), correct: 5, total: 5 }, { at: daysAgo(1), correct: 2, total: 5 }]);
    for (const id of T2.slice(0, 2)) L[id] = done(id, daysAgo(1));
    await load(L, passed(["market-foundations"], daysAgo(2)));
    const d = await dash();
    check("review due in T1: recommendation is the T1 'stocks' review", d.href === H.lessonUrl("stocks") && /dropped below 80%/.test(d.nlText), `${d.href} ${d.nlText.slice(0, 120)}`);
    check("review due in T1: Learning progress stays on Forex Foundations 2/7", /Forex Foundations/.test(d.lp) && /2\/7/.test(d.lp), d.lp.slice(0, 120));
    check("review due in T1: journey stays Learning", /Now working through Forex Foundations: 2 of 7/.test(d.main));
    await page.goto(BASE + "/academy", { waitUntil: "networkidle" });
    const a = (await page.locator("main").textContent()) || "";
    check("academy page: shows the review recommendation and a needs-review state", /Review lesson/.test(a), a.slice(0, 200));
  }

  // 5. Everything complete, two days → all mastered; journey still Learning
  {
    const L = {};
    // Track 6 (Chart Reading) is written too now, so "everything" includes it.
    for (const id of [...T1, ...T2, ...T3, ...T6]) L[id] = done(id, daysAgo(1), [{ at: daysAgo(3), correct: 5, total: 5 }, { at: daysAgo(1), correct: 5, total: 5 }]);
    await load(L, passed(["market-foundations", "forex-foundations", "stocks-indices", "chart-reading"], daysAgo(1)));
    const d = await dash();
    check("all mastered: no recommendation, 'Every written lesson is mastered'", /Every written lesson is mastered/.test(d.nlText), d.nlText.slice(0, 100));
    // The last written track is now Chart Reading (12 lessons).
    check("all mastered: Learning progress shows the last written track 12/12, 100%", /Chart Reading/.test(d.lp) && /12\/12/.test(d.lp) && /100% overall/.test(d.lp), d.lp.slice(0, 200));
    check("all mastered: journey stays Learning with 'Every written Academy lesson is complete'", /Every written Academy lesson is complete/.test(d.main));
    const stage = await page.evaluate(() => { const el = document.querySelector("[aria-current=step]"); return el ? el.textContent : null; });
    check("all mastered: current journey step is Learning", stage !== null && /Learning/.test(stage), String(stage));
  }

  // 6. Track 3 started before track 2 (skipping ahead)
  {
    const L = {};
    for (const id of T1) L[id] = done(id, daysAgo(2));
    L["si-exchanges"] = done("si-exchanges", daysAgo(1));
    await load(L, passed(["market-foundations"], daysAgo(2)));
    const d = await dash();
    check("skip ahead to T3: still recommends fx-quotes and shows Forex as current", d.href === H.lessonUrl("fx-quotes") && /Forex Foundations/.test(d.lp), `${d.href}`);
  }

  // 7. Old Phase-2 data (track-1 lessons only, with a lesson id that no longer exists) still loads
  {
    const L = {};
    for (const id of T1.slice(0, 4)) L[id] = done(id, daysAgo(5));
    L["some-removed-lesson"] = { sectionsRead: { a: daysAgo(5) }, exerciseCompletedAt: null, quizAttempts: [], reflection: null };
    await load(L);
    const d = await dash();
    check("old Phase-2 data: 4/10 in Market Foundations, recommends lesson 5 (forex)", /4\/10/.test(d.lp) && d.href === H.lessonUrl("forex"), `${d.lp.slice(0, 80)} ${d.href}`);
    const stored = await page.evaluate((k) => localStorage.getItem(k), KEY);
    check("old Phase-2 data: not rewritten as corrupt (no backup key)", !(await page.evaluate((k) => localStorage.getItem(k), H.BACKUP)) && stored.includes("what-is-a-market"));
    await page.goto(BASE + H.lessonUrl("fx-quotes"), { waitUntil: "networkidle" });
    const lt = (await page.locator("main").textContent()) || "";
    // Phase 2 step 1: with track 1 at 4/10, track 2 is locked, so its lesson shows the lock panel
    // (naming what unlocks it) instead of a "Not started" lesson.
    check("old Phase-2 data: a track-2 lesson page is locked behind Market Foundations", (await page.locator("[data-locked]").count()) === 1 && /unlocks after you complete Market Foundations/i.test(lt), lt.slice(0, 160));
  }

  // 8. Reset clears progress in every track
  {
    const L = {};
    for (const id of [...T1, ...T2.slice(0, 3), ...T3.slice(0, 2)]) L[id] = done(id, daysAgo(1));
    await load(L);
    await page.goto(BASE + "/settings", { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Reset Academy progress" }).click();
    await page.getByRole("button", { name: "Yes, reset" }).click();
    await page.waitForTimeout(300);
    const raw = await page.evaluate((k) => localStorage.getItem(k), KEY);
    const parsed = raw ? JSON.parse(raw) : { lessons: {} };
    const left = Object.values(parsed.lessons || {}).filter((l) => Object.keys(l.sectionsRead || {}).length || l.exerciseCompletedAt || (l.quizAttempts || []).length).length;
    check("reset: no lesson in any track keeps activity", left === 0, `${left} lessons still have activity`);
    await page.goto(BASE + "/", { waitUntil: "networkidle" });
    const d = await dash();
    check("reset: dashboard back to Market Foundations 0/10, recommends lesson 1", /Market Foundations/.test(d.lp) && /0\/10/.test(d.lp) && d.href === H.lessonUrl("what-is-a-market"), `${d.lp.slice(0, 80)} ${d.href}`);
  }

  check("no console errors", logs.length === 0, logs.slice(0, 3).join(" | "));
  await browser.close();
  H.summary();
})().catch((e) => { console.error(e); process.exitCode = 2; });
