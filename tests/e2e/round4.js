// Round 4: try to break reset tombstones in the real app.
const H = require("./helpers");
const { chromium, BASE, KEY, check } = H;
const RESET_KEY = "traderos.academy.reset-at";
const quotaInit = (k) => { const o = Storage.prototype.setItem; Storage.prototype.setItem = function (key, v) { if (key === k && window.__full) throw new DOMException("full", "QuotaExceededError"); return o.call(this, key, v); }; };
const stored = (p) => p.evaluate((k) => JSON.parse(localStorage.getItem(k) || "null"), KEY);
const dump = (p) => p.evaluate(() => Object.fromEntries(Object.keys(localStorage).map((k) => [k, localStorage.getItem(k)])));
async function solve(p, lesson = "forex", v = "600") { const i = p.locator("#exercise").getByLabel(/Your answer/); await i.fill(v); await i.press("Enter"); await p.waitForTimeout(100); }
async function refl(p, t) { await p.locator("#practical textarea").fill(t); await p.locator("#practical").getByRole("button", { name: "Save reflection" }).click(); await p.waitForTimeout(150); }
async function reset(p) { await p.getByRole("button", { name: "Reset Academy progress" }).click(); await p.getByRole("button", { name: "Yes, reset" }).click(); await p.waitForTimeout(250); }
const leaks = (d, re) => Object.entries(d).filter(([, v]) => re.test(v || "")).map(([k]) => k);

(async () => {
  const browser = await chromium.launch();
  const fresh = async (opts = H.DESKTOP, init) => { const c = await browser.newContext(opts); c.setDefaultTimeout(8000); if (init) await c.addInitScript(...init); return c; };

  // 1. Reset, then the back button (same tab, client-side nav and full reload)
  {
    const ctx = await fresh(); const p = await ctx.newPage(); const logs = []; H.watchConsole(p, logs);
    await p.goto(BASE + H.lessonUrl("forex"), { waitUntil: "networkidle" });
    await solve(p); await refl(p, "old one");
    await p.getByRole("link", { name: "Settings" }).first().click(); await p.waitForURL("**/settings");
    await reset(p);
    await p.goBack(); await p.waitForURL("**/forex"); await p.waitForTimeout(400);
    check("back after reset (client nav): exercise not Solved", !/Solved/.test(await p.locator("#exercise").textContent()));
    check("back after reset (client nav): reflection box empty", (await p.locator("#practical textarea").inputValue()) === "");
    await p.goForward(); await p.waitForTimeout(300); await p.goBack(); await p.waitForTimeout(300);
    await solve(p, "forex", "1");
    check("back after reset: acting brings nothing back", !leaks(await dump(p), /old one/).length && !(await stored(p))?.lessons?.forex?.exerciseCompletedAt);
    // full navigation + bfcache
    await p.goto(BASE + H.lessonUrl("stocks"), { waitUntil: "networkidle" }); await solve(p, "stocks", "120");
    await p.goto(BASE + "/settings", { waitUntil: "networkidle" }); await reset(p);
    await p.goBack({ waitUntil: "networkidle" }); await p.waitForTimeout(300);
    check("back after reset (full nav / bfcache): stocks exercise not Solved", !/Solved/.test(await p.locator("#exercise").textContent()));
    check("no console errors", logs.length === 0, logs.join(" | ").slice(0, 300));
    await ctx.close();
  }

  // 2. Reset while tab A has UNSAVED reflection edits
  {
    const ctx = await fresh(); const A = await ctx.newPage(), B = await ctx.newPage();
    await A.goto(BASE + H.lessonUrl("forex"), { waitUntil: "networkidle" });
    await refl(A, "saved original");
    await A.locator("#practical textarea").fill("saved original + my unsaved draft");
    await B.goto(BASE + "/settings", { waitUntil: "networkidle" }); await reset(B);
    await A.waitForTimeout(300);
    const box = await A.locator("#practical textarea").inputValue();
    const pr = await A.locator("#practical").textContent();
    check("unsaved edits are kept in the box (not silently discarded)", box === "saved original + my unsaved draft");
    check("a warning explains the saved reflection was removed elsewhere", /reset|removed|deleted|cleared|changed/i.test(pr), pr.slice(0, 400));
    check("storage holds no pre-reset reflection", !leaks(await dump(A), /saved original/).length);
    check("'Last saved' line is gone after the reset", !/Last saved/.test(pr));
    await ctx.close();
  }

  // 3. Reset twice, with activity in between, stale tab acts after
  {
    const ctx = await fresh(); const A = await ctx.newPage(), B = await ctx.newPage();
    await A.goto(BASE + H.lessonUrl("forex"), { waitUntil: "networkidle" }); await solve(A); await refl(A, "epoch0");
    await B.goto(BASE + "/settings", { waitUntil: "networkidle" }); await reset(B);
    await A.waitForTimeout(200); await refl(A, "epoch1");
    await B.reload({ waitUntil: "networkidle" }); await reset(B);
    await A.waitForTimeout(200); await solve(A, "forex", "600");
    const d = await dump(A); const s = await stored(A);
    check("reset twice: nothing from epoch 0 or 1 survives", !leaks(d, /epoch0|epoch1/).length, leaks(d, /epoch0|epoch1/).join(","));
    check("reset twice: only the post-second-reset exercise exists", !!s.lessons.forex?.exerciseCompletedAt && !s.lessons.forex.reflection && Date.parse(s.lessons.forex.exerciseCompletedAt) > Date.parse(d[RESET_KEY]));
    await ctx.close();
  }

  // 4. Clock skew: tab B's clock 1 hour ahead does the reset. Tab A (real clock) then acts.
  for (const failing of [false, true]) {
    const ctx = await fresh(H.DESKTOP, [quotaInit, KEY]); const A = await ctx.newPage(), B = await ctx.newPage();
    await A.goto(BASE + H.lessonUrl("forex"), { waitUntil: "networkidle" }); await refl(A, "pre-skew");
    if (failing) { await A.evaluate(() => (window.__full = true)); await refl(A, "pre-skew edit"); }
    await B.clock.setFixedTime(new Date(Date.now() + 3600_000));
    await B.goto(BASE + "/settings", { waitUntil: "networkidle" }); await reset(B);
    await A.waitForTimeout(300);
    if (failing) await A.evaluate(() => (window.__full = false));
    await A.goto(BASE + H.lessonUrl("stocks")).catch(() => {}); // full nav would reset memory; use client nav instead
    await A.goBack().catch(() => {});
    await A.waitForTimeout(300);
    await A.getByRole("link", { name: "Academy" }).first().click(); await A.waitForURL("**/academy");
    await A.goto(BASE + H.lessonUrl("indices"), { waitUntil: "networkidle" });
    await solve(A, "indices", "2");
    const s = await stored(A);
    check(`clock skew (A ${failing ? "with failing saves" : "normal"}): A's post-reset progress is kept`, !!s?.lessons?.indices?.exerciseCompletedAt, JSON.stringify(s?.lessons));
    await A.reload({ waitUntil: "networkidle" }); await A.waitForTimeout(200);
    check(`clock skew (${failing ? "failing" : "normal"}): post-reset progress still shown after reload`, /Solved/.test(await A.locator("#exercise").textContent()));
    check(`clock skew (${failing ? "failing" : "normal"}): no pre-reset text survives`, !leaks(await dump(A), /pre-skew/).length);
    await ctx.close();
  }

  // 4b. Clock skew with failing saves AND in-memory (client-nav) action before the save recovers
  {
    const ctx = await fresh(H.DESKTOP, [quotaInit, KEY]); const A = await ctx.newPage(), B = await ctx.newPage();
    await A.goto(BASE + H.lessonUrl("forex"), { waitUntil: "networkidle" });
    await A.evaluate(() => (window.__full = true)); await refl(A, "x"); // A now unsaved, memory has no marker
    await B.clock.setFixedTime(new Date(Date.now() + 3600_000));
    await B.goto(BASE + "/settings", { waitUntil: "networkidle" }); await reset(B);
    await A.waitForTimeout(300);
    await solve(A); // real-time action AFTER the reset, but before B's skewed stamp
    await A.evaluate(() => (window.__full = false));
    await refl(A, "after skewed reset");
    const s = await stored(A);
    check("clock skew + failing saves: actions made after the reset survive (exercise + reflection)",
      !!s?.lessons?.forex?.exerciseCompletedAt && s?.lessons?.forex?.reflection?.text === "after skewed reset", JSON.stringify(s?.lessons));
    await ctx.close();
  }

  // 5. Corrupt / missing / future reset-at key
  for (const [name, val] of [["corrupt", "not-a-date"], ["hostile", "{\"__proto__\":1}"], ["future", "2099-01-01T00:00:00.000Z"], ["missing", null]]) {
    const ctx = await fresh(H.DESKTOP, [quotaInit, KEY]);
    const p = await ctx.newPage(); const logs = []; H.watchConsole(p, logs);
    await p.goto(BASE + "/", { waitUntil: "networkidle" });
    const now = new Date().toISOString();
    await p.evaluate(([k, rk, v, now]) => {
      localStorage.setItem(k, JSON.stringify({ version: 1, updatedAt: now, lessons: { stocks: { sectionsRead: {}, exerciseCompletedAt: now, quizAttempts: [], reflection: { text: "kept", updatedAt: now } } } }));
      if (v === null) localStorage.removeItem(rk); else localStorage.setItem(rk, v);
    }, [KEY, RESET_KEY, val, now]);
    await p.goto(BASE + H.lessonUrl("stocks"), { waitUntil: "networkidle" });
    check(`reset-at ${name}: existing progress still shown`, /Solved/.test(await p.locator("#exercise").textContent()) && (await p.locator("#practical textarea").inputValue()) === "kept");
    await p.goto(BASE + H.lessonUrl("forex"), { waitUntil: "networkidle" });
    await solve(p);
    await p.reload({ waitUntil: "networkidle" });
    check(`reset-at ${name}: new progress saved and persists`, /Solved/.test(await p.locator("#exercise").textContent()));
    // failing-save cycle then recovery
    await p.evaluate(() => (window.__full = true)); await refl(p, "during full"); await p.evaluate(() => (window.__full = false)); await refl(p, "after full");
    await p.reload({ waitUntil: "networkidle" });
    const s = await stored(p);
    check(`reset-at ${name}: progress survives a failed-save + recovery cycle`, !!s.lessons.forex?.exerciseCompletedAt && s.lessons.forex?.reflection?.text === "after full" && s.lessons.stocks?.reflection?.text === "kept", JSON.stringify(s.lessons).slice(0, 300));
    await p.goto(BASE + "/", { waitUntil: "networkidle" });
    check(`reset-at ${name}: no console errors`, logs.length === 0, logs.join(" | ").slice(0, 200));
    await ctx.close();
  }

  // 6. Old v1 data without the new fields
  {
    const ctx = await fresh(); const p = await ctx.newPage(); const logs = []; H.watchConsole(p, logs);
    await p.goto(BASE + "/", { waitUntil: "networkidle" });
    const y = new Date(Date.now() - 86400000).toISOString(), now = new Date().toISOString();
    await p.evaluate(([k, y, now]) => localStorage.setItem(k, JSON.stringify({ version: 1, updatedAt: y, lessons: { "what-is-a-market": {
      sectionsRead: { "meeting-place": y, "why-markets-exist": y, "exchange-vs-otc": y, "life-of-a-trade": y }, exerciseCompletedAt: y,
      quizAttempts: [{ at: y, correct: 5, total: 5 }, { at: now, correct: 4, total: 5 }], reflection: { text: "legacy", updatedAt: y } } } })), [KEY, y, now]);
    await p.reload({ waitUntil: "networkidle" });
    const lp = await p.locator("section", { has: p.getByRole("heading", { name: "Learning progress" }) }).textContent();
    check("old v1 data: dashboard shows 1/10 and mastery 10%", /1\/10/.test(lp) && /10%/.test(lp), lp.slice(0, 200));
    await p.goto(BASE + H.lessonUrl("what-is-a-market"), { waitUntil: "networkidle" });
    check("old v1 data: Mastered + legacy reflection", /Mastered/.test(await p.locator("main aside.min-w-0").textContent()) && (await p.locator("#practical textarea").inputValue()) === "legacy");
    check("old v1 data: no backup created (not treated as corrupt)", !(await dump(p))["traderos.academy.progress.v1.corrupt-backup"]);
    await p.goto(BASE + "/settings", { waitUntil: "networkidle" }); await reset(p);
    const d = await dump(p);
    check("Settings reset clears every Academy key except the marker", Object.keys(d).filter((k) => k.startsWith("traderos.academy.") && k !== RESET_KEY).length === 0, Object.keys(d).join(","));
    await p.goto(BASE + "/", { waitUntil: "networkidle" });
    const lp2 = await p.locator("section", { has: p.getByRole("heading", { name: "Learning progress" }) }).textContent();
    check("after reset dashboard back to zero (0/10, 0%, streak 0)", /0\/10/.test(lp2) && /0%/.test(lp2) && /Streak\s*0/.test(lp2), lp2.slice(0, 220));
    check("no console errors", logs.length === 0, logs.join(" | ").slice(0, 200));
    await ctx.close();
  }
  await browser.close();
  H.summary();
})().catch((e) => { console.error(e); process.exitCode = 2; });
