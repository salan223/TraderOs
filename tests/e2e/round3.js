// Round 3: reset/merge resurrection across tabs, and fixed-position tooltip stress.
const H = require("./helpers");
const { chromium, BASE, KEY, check } = H;
const stored = (p) => p.evaluate((k) => JSON.parse(localStorage.getItem(k) || "null"), KEY);
const quotaInit = (k) => { const o = Storage.prototype.setItem; Storage.prototype.setItem = function (key, v) { if (key === k && window.__full) throw new DOMException("full", "QuotaExceededError"); return o.call(this, key, v); }; };
async function solveForex(p) { const i = p.locator("#exercise").getByLabel(/Your answer/); await i.fill("600"); await i.press("Enter"); }
async function saveReflection(p, text) { await p.locator("#practical textarea").fill(text); await p.locator("#practical").getByRole("button", { name: "Save reflection" }).click(); await p.waitForTimeout(150); }
async function resetIn(p) { await p.goto(BASE + "/settings", { waitUntil: "networkidle" }); await p.getByRole("button", { name: "Reset Academy progress" }).click(); await p.getByRole("button", { name: "Yes, reset" }).click(); await p.waitForTimeout(200); }
const openTips = (p) => p.evaluate(() => [...document.querySelectorAll("[role=tooltip]")].filter((t) => getComputedStyle(t).display !== "none").length);

(async () => {
  const browser = await chromium.launch();

  // S1: normal two tabs. Reset in B, then act in A.
  {
    const ctx = await browser.newContext(H.DESKTOP); ctx.setDefaultTimeout(8000);
    const A = await ctx.newPage(), B = await ctx.newPage();
    await A.goto(BASE + H.lessonUrl("forex"), { waitUntil: "networkidle" });
    await solveForex(A); await saveReflection(A, "secret reflection");
    await B.goto(BASE + H.lessonUrl("stocks"), { waitUntil: "networkidle" });
    const i = B.locator("#exercise").getByLabel(/Your answer/); await i.fill("120"); await i.press("Enter");
    await resetIn(B);
    await A.waitForTimeout(300);
    check("S1: tab A UI drops the reset progress (exercise no longer Solved)", !/Solved/.test(await A.locator("#exercise").textContent()));
    const ta = await A.locator("#practical textarea").inputValue();
    check("S1: tab A reflection box no longer shows the deleted reflection", ta === "", `textarea still shows "${ta}"`);
    // do things in A: open another lesson section-read via scroll, take a quiz attempt
    await A.goto(BASE + H.lessonUrl("indices"), { waitUntil: "networkidle" });
    const j = A.locator("#exercise").getByLabel(/Your answer/); await j.fill("2"); await j.press("Enter");
    const s = await stored(A);
    check("S1: after acting in A, deleted forex progress did not come back", !s.lessons.forex, JSON.stringify(Object.keys(s.lessons)));
    check("S1: after acting in A, B's deleted stocks progress did not come back", !s.lessons.stocks);
    await B.goto(BASE + "/", { waitUntil: "networkidle" });
    const lp = await B.locator("section", { has: B.getByRole("heading", { name: "Learning progress" }) }).textContent();
    check("S1: dashboard in B shows only new activity", /0\/10/.test(lp));
    // stale reflection text: user in A goes back to forex and presses Save (what a beginner might do)
    await ctx.close();
  }

  // S1b: reflection textarea stale after reset in other tab, then user clicks Save
  {
    const ctx = await browser.newContext(H.DESKTOP); ctx.setDefaultTimeout(8000);
    const A = await ctx.newPage(), B = await ctx.newPage();
    await A.goto(BASE + H.lessonUrl("forex"), { waitUntil: "networkidle" });
    await saveReflection(A, "private thoughts");
    await resetIn(B);
    await A.waitForTimeout(300);
    const btn = A.locator("#practical").getByRole("button", { name: "Save reflection" });
    const enabled = await btn.isEnabled();
    const shown = await A.locator("#practical textarea").inputValue();
    check("S1b: after reset elsewhere, the deleted reflection is not still displayed in tab A", shown === "", `shown="${shown}", Save enabled=${enabled}`);
    await ctx.close();
  }

  // S2: tab A's saves are failing (storage full); reset in tab B; then act in A.
  {
    const afterResetUI = "n/a";
    // Re-run with in-app navigation only (provider memory must survive)
    const ctx2 = await browser.newContext(H.DESKTOP); ctx2.setDefaultTimeout(8000);
    await ctx2.addInitScript(quotaInit, KEY);
    const A2 = await ctx2.newPage(), B2 = await ctx2.newPage();
    await A2.goto(BASE + H.lessonUrl("forex"), { waitUntil: "networkidle" });
    await solveForex(A2); await saveReflection(A2, "before full");
    await A2.evaluate(() => (window.__full = true));
    await saveReflection(A2, "unsaved edit");
    check("S2 setup: A is in the could-not-save state", /Could not save/.test(await A2.textContent("main")));
    await B2.goto(BASE + "/settings", { waitUntil: "networkidle" });
    await B2.getByRole("button", { name: "Reset Academy progress" }).click(); await B2.getByRole("button", { name: "Yes, reset" }).click(); await B2.waitForTimeout(300);
    const uiA = /Solved/.test(await A2.locator("#exercise").textContent());
    await A2.evaluate(() => (window.__full = false));
    // any action in A: solve via practise-again? simplest: save a different reflection
    await saveReflection(A2, "after reset");
    const s2 = await stored(A2);
    check("S2: (A's saves were failing) after B resets and A acts, deleted forex exercise does NOT come back",
      !s2?.lessons?.forex?.exerciseCompletedAt, `A UI still showed Solved after reset: ${uiA}; stored forex.exerciseCompletedAt=${s2?.lessons?.forex?.exerciseCompletedAt}`);
    await B2.reload({ waitUntil: "networkidle" });
    // Programmer (round 3): the original assertion expected "0 lessons started", but A saved a NEW
    // reflection ("after reset") after the reset, which legitimately starts the forex lesson.
    // The check is now stricter about resurrection instead: the only thing left is that new
    // reflection, and nothing recorded before the reset (exercise, sections, quiz, old text) is back.
    const f2 = s2?.lessons?.forex;
    const onlyNew = !!f2 && f2.reflection?.text === "after reset" && !f2.exerciseCompletedAt && Object.keys(f2.sectionsRead || {}).length === 0 && (f2.quizAttempts || []).length === 0 && Object.keys(s2.lessons).length === 1;
    check("S2: B's settings page shows no progress reappeared after its reset (only A's post-reset reflection)", onlyNew && /1 lesson started, 0 completed/.test(await B2.textContent("main")), `${JSON.stringify(s2?.lessons)} | ${(await B2.textContent("main")).match(/\d+ lessons? started, \d+ completed/)?.[0]}`);
    // Tester (round 4): prove nothing from before the reset survives anywhere.
    const dump = await A2.evaluate(() => Object.fromEntries(Object.keys(localStorage).map((k) => [k, localStorage.getItem(k)])));
    const leaked = Object.entries(dump).filter(([, v]) => /before full|unsaved edit/.test(v || "")).map(([k]) => k);
    check("S2: no pre-reset reflection text survives in ANY localStorage key", leaked.length === 0, `found in ${leaked.join(", ")}`);
    const marker = dump["traderos.academy.reset-at"] || s2?.resetAt;
    const times = [];
    for (const l of Object.values(s2?.lessons || {})) { times.push(...Object.values(l.sectionsRead || {})); if (l.exerciseCompletedAt) times.push(l.exerciseCompletedAt); for (const q of l.quizAttempts || []) times.push(q.at); if (l.reflection) times.push(l.reflection.updatedAt); }
    check("S2: a reset marker exists and every stored timestamp is after it", !!marker && times.every((t) => Date.parse(t) > Date.parse(marker)), `marker=${marker} times=${times.join(",")}`);
    check("S2: tab A's UI no longer shows the deleted exercise after acting", !/Solved/.test(await A2.locator("#exercise").textContent()));
    check("S2 info: A's UI after B's reset", true, `A still showed Solved=${afterResetUI}/${uiA}`);
    await ctx2.close();
  }

  // S3: same tab, saves failing: clear the reflection, then do something else. Does the cleared reflection come back?
  {
    const ctx = await browser.newContext(H.DESKTOP); ctx.setDefaultTimeout(8000);
    await ctx.addInitScript(quotaInit, KEY);
    const A = await ctx.newPage();
    await A.goto(BASE + H.lessonUrl("forex"), { waitUntil: "networkidle" });
    await saveReflection(A, "keep me?");          // stored
    await A.evaluate(() => (window.__full = true));
    await A.locator("#practical textarea").fill(""); await A.locator("#practical").getByRole("button", { name: "Save reflection" }).click(); await A.waitForTimeout(150);
    await solveForex(A);                          // any later update
    await A.waitForTimeout(200);
    const shown = await A.locator("#practical").textContent();
    check("S3: (saves failing) a cleared reflection stays cleared after the next action", !/Last saved/.test(shown), "the 'Last saved' line came back, so the reflection was resurrected in memory");
    await A.evaluate(() => (window.__full = false));
    await A.locator("#exercise").getByRole("button", { name: /Practise again/ }).click().catch(() => {});
    await solveForex(A);
    await saveReflection(A, "").catch(() => {});
    await ctx.close();
  }

  // S4: single tab reset then back-navigation (bfcache) in another tab
  {
    const ctx = await browser.newContext(H.DESKTOP); ctx.setDefaultTimeout(8000);
    const A = await ctx.newPage(), B = await ctx.newPage();
    await A.goto(BASE + H.lessonUrl("forex"), { waitUntil: "networkidle" });
    await solveForex(A);
    await A.goto("about:blank");
    await resetIn(B);
    await A.goBack({ waitUntil: "networkidle" });
    await A.waitForTimeout(300);
    check("S4: page restored from history after a reset shows no deleted progress", !/Solved/.test(await A.locator("#exercise").textContent()));
    const i = A.locator("#exercise").getByLabel(/Your answer/);
    if (await i.count()) { await i.fill("1"); await i.press("Enter"); }
    check("S4: acting after history restore does not bring progress back", !(await stored(A))?.lessons?.forex?.exerciseCompletedAt);
    await ctx.close();
  }

  // ── Tooltip stress ──
  for (const [label, opts] of [["w320", H.NARROW], ["phone", H.PHONE]]) {
    const ctx = await browser.newContext(opts); ctx.setDefaultTimeout(8000);
    const p = await ctx.newPage();
    const logs = []; H.watchConsole(p, logs);
    await p.goto(BASE + H.lessonUrl("forex"), { waitUntil: "networkidle" });
    const t = p.locator("article [role=button][aria-describedby]").nth(2);
    await t.scrollIntoViewIfNeeded(); await p.evaluate(() => window.scrollBy(0, -150));
    await t.tap(); await p.waitForTimeout(100);
    const rel = async () => t.evaluate((el) => { const tip = document.getElementById(el.getAttribute("aria-describedby")); const a = el.getBoundingClientRect(), b = tip.getBoundingClientRect(); return { dy: Math.round(Math.min(Math.abs(b.bottom - a.top), Math.abs(b.top - a.bottom))), tipTop: Math.round(b.top), termTop: Math.round(a.top), shown: getComputedStyle(tip).display !== "none" }; });
    const r0 = await rel();
    await p.mouse.wheel(0, 120); await p.evaluate(() => window.scrollBy(0, 120)); await p.waitForTimeout(150);
    const r1 = await rel();
    check(`[${label}] tooltip follows its term while scrolling`, r1.shown && r1.dy <= 12, JSON.stringify({ r0, r1 }));
    await p.evaluate(() => window.scrollBy(0, 2000)); await p.waitForTimeout(150);
    const r2 = await rel();
    check(`[${label}] tooltip does not float detached when its term scrolls off screen`, !r2.shown || r2.dy <= 12, JSON.stringify(r2));
    // resize (rotate) while open
    await p.evaluate(() => window.scrollBy(0, -2000)); await p.waitForTimeout(100);
    if (!(await rel()).shown) { await t.tap(); await p.waitForTimeout(80); }
    await p.setViewportSize({ width: 600, height: 380 }); await p.waitForTimeout(200);
    const rr = await t.evaluate((el) => { const b = document.getElementById(el.getAttribute("aria-describedby")).getBoundingClientRect(); return { l: b.left, r: b.right, vw: document.documentElement.clientWidth, sw: document.documentElement.scrollWidth }; });
    check(`[${label}] after rotate/resize the tooltip stays inside the viewport`, rr.l >= 0 && rr.r <= rr.vw && rr.sw <= rr.vw, JSON.stringify(rr));
    await p.setViewportSize(opts.viewport); await p.waitForTimeout(100);
    // open then tap More: sheet must not be covered by the tooltip, and tooltip closes
    if (!(await rel()).shown) { await t.tap(); await p.waitForTimeout(80); }
    await p.getByRole("button", { name: "More" }).tap(); await p.waitForTimeout(150);
    check(`[${label}] opening the More sheet closes the tooltip`, (await openTips(p)) === 0);
    const sheetTerms = await p.getByRole("dialog").locator("[role=button][aria-describedby]").count();
    check(`[${label}] More sheet contains no terms (nothing to test there)`, sheetTerms === 0, `terms in sheet: ${sheetTerms}`);
    await p.keyboard.press("Escape");
    // route change with a tooltip open by keyboard, then history back/forward
    await t.focus(); await p.waitForTimeout(60);
    await p.goBack().catch(() => {}); await p.waitForTimeout(600);
    check(`[${label}] no tooltip left open after a route change`, (await openTips(p)) === 0);
    await p.goto(BASE + "/", { waitUntil: "networkidle" });
    // dashboard table term inside horizontally scrollable watchlist
    const ch = p.locator("table [role=button][aria-describedby]").first();
    if (await ch.count()) {
      await ch.scrollIntoViewIfNeeded(); await ch.tap(); await p.waitForTimeout(100);
      const v = await ch.evaluate((el) => { const b = document.getElementById(el.getAttribute("aria-describedby")).getBoundingClientRect(); return { l: b.left, r: b.right, t: b.top, vw: document.documentElement.clientWidth, sw: document.documentElement.scrollWidth }; });
      check(`[${label}] table-header tooltip inside viewport, no page h-scroll`, v.l >= 0 && v.r <= v.vw && v.sw <= v.vw, JSON.stringify(v));
      await p.locator("body").tap({ position: { x: 5, y: 300 } }); await p.waitForTimeout(80);
    }
    // open right after navigation (panel fade-in animation uses transform → containing block for fixed)
    await p.goto(BASE + "/academy", { waitUntil: "domcontentloaded" });
    const m = p.locator("main [role=button][aria-describedby]").first();
    await m.waitFor(); await m.focus();
    const early = await m.evaluate((el) => { const tip = document.getElementById(el.getAttribute("aria-describedby")); const a = el.getBoundingClientRect(), b = tip.getBoundingClientRect(); return { dy: Math.round(Math.min(Math.abs(b.bottom - a.top), Math.abs(b.top - a.bottom))), dx: Math.round(b.left - a.left) }; });
    await p.waitForTimeout(400);
    const late = await m.evaluate((el) => { const tip = document.getElementById(el.getAttribute("aria-describedby")); const a = el.getBoundingClientRect(), b = tip.getBoundingClientRect(); return { dy: Math.round(Math.min(Math.abs(b.bottom - a.top), Math.abs(b.top - a.bottom))) }; });
    check(`[${label}] tooltip opened during panel fade-in is placed next to its term`, late.dy <= 12, JSON.stringify({ early, late }));
    check(`[${label}] no console errors in tooltip stress`, logs.length === 0, logs.join(" | ").slice(0, 300));
    await ctx.close();
  }
  // desktop: hover A while B keyboard-open → single tooltip
  {
    const ctx = await browser.newContext(H.DESKTOP); const p = await ctx.newPage();
    await p.goto(BASE + H.lessonUrl("what-is-a-market"), { waitUntil: "networkidle" });
    const ts = p.locator("article [role=button][aria-describedby]");
    await ts.nth(0).focus(); await p.waitForTimeout(50); await ts.nth(3).hover(); await p.waitForTimeout(80);
    check("[desktop] hover while another is keyboard-open: one tooltip", (await openTips(p)) === 1, `open=${await openTips(p)}`);
    await p.mouse.move(5, 600); await p.waitForTimeout(80);
    const left = await openTips(p);
    check("[desktop] after hover leaves, focused term's tooltip state is consistent with aria-expanded", (left === 1) === ((await ts.nth(0).getAttribute("aria-expanded")) === "true"), `open=${left}, aria-expanded=${await ts.nth(0).getAttribute("aria-expanded")}`);
    await ctx.close();
  }
  await browser.close();
  H.summary();
})().catch((e) => { console.error(e); process.exitCode = 2; });
