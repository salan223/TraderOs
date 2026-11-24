// Corrupt / blocked / full storage, settings reset, glossary, outline-only tracks.
const H = require("./helpers");
const { chromium, BASE, KEY, BACKUP, check } = H;
const big = "x".repeat(200_000);
const CORRUPT = {
  "invalid JSON": "{not json",
  "wrong types": JSON.stringify({ version: 1, lessons: { "what-is-a-market": { sectionsRead: "nope", quizAttempts: { a: 1 }, exerciseCompletedAt: 42, reflection: [] } } }),
  "array root": "[1,2,3]",
  "future version": JSON.stringify({ version: 7, lessons: { "what-is-a-market": { exerciseCompletedAt: "2026-01-01T00:00:00Z" } }, newField: { a: 1 } }),
  "huge reflection": JSON.stringify({ version: 1, lessons: { "what-is-a-market": { reflection: { text: big, updatedAt: "2026-01-01T00:00:00Z" } } } }),
  "__proto__ pollution": '{"version":1,"__proto__":{"polluted":true},"lessons":{"__proto__":{"exerciseCompletedAt":"2026-01-01T00:00:00Z"}}}',
  "future timestamps": JSON.stringify({ version: 1, lessons: { "what-is-a-market": { quizAttempts: [{ at: "2099-01-01T00:00:00Z", correct: 5, total: 5 }] } } }),
};
(async () => {
  const browser = await chromium.launch();

  for (const [name, value] of Object.entries(CORRUPT)) {
    const ctx = await browser.newContext(H.DESKTOP);
    await ctx.addInitScript(([k, v]) => { if (!sessionStorage.getItem("seeded")) { localStorage.setItem(k, v); sessionStorage.setItem("seeded", "1"); } }, [KEY, value]);
    const page = await ctx.newPage();
    const logs = []; H.watchConsole(page, logs);
    for (const url of ["/", H.lessonUrl("what-is-a-market"), "/academy", "/academy/glossary", "/settings"]) {
      const r = await page.goto(BASE + url, { waitUntil: "networkidle" });
      check(`corrupt[${name}] ${url} renders`, r.status() === 200 && (await page.locator("main h2").count()) > 0);
    }
    const backup = await page.evaluate((k) => localStorage.getItem(k), BACKUP);
    const shouldBackup = name !== "future timestamps";
    if (shouldBackup) check(`corrupt[${name}] backup key created`, backup === value, backup ? backup.slice(0, 40) : "none");
    check(`corrupt[${name}] no prototype pollution`, await page.evaluate(() => ({}).polluted === undefined));
    check(`corrupt[${name}] no console errors`, logs.length === 0, logs.join(" | ").slice(0, 300));
    if (name === "huge reflection") {
      await page.goto(BASE + H.lessonUrl("what-is-a-market"), { waitUntil: "networkidle" });
      const v = await page.locator("#practical textarea").inputValue();
      check("huge reflection trimmed to 4000 in UI", v.length === 4000, `len ${v.length}`);
    }
    if (name === "future timestamps") {
      await page.goto(BASE + "/", { waitUntil: "networkidle" });
      const lp = await page.locator("section", { has: page.getByRole("heading", { name: "Learning progress" }) }).textContent();
      check("future-dated activity does not create a streak", /Streak\s*0/.test(lp), lp.slice(0, 260));
    }
    await ctx.close();
  }

  // localStorage blocked
  {
    const ctx = await browser.newContext(H.DESKTOP);
    await ctx.addInitScript(() => {
      Object.defineProperty(window, "localStorage", { get() { throw new DOMException("blocked", "SecurityError"); } });
    });
    const page = await ctx.newPage();
    const logs = []; H.watchConsole(page, logs);
    await page.goto(BASE + H.lessonUrl("forex"), { waitUntil: "networkidle" });
    const txt = await page.textContent("main");
    check("blocked storage: warning shown", /blocking storage/.test(txt));
    await page.locator("#exercise").getByLabel(/Your answer/).fill("600");
    await page.locator("#exercise").getByLabel(/Your answer/).press("Enter");
    check("blocked storage: app still usable (exercise solved in memory)", /Solved/.test(await page.locator("#exercise").textContent()));
    await page.getByRole("link", { name: "Dashboard" }).first().click();
    await page.waitForURL(BASE + "/"); await page.waitForTimeout(400);
    check("blocked storage: progress kept across client-side navigation", /Continue lesson|Start lesson/.test(await page.textContent("main")));
    check("blocked storage: no uncaught errors", !logs.some((l) => /pageerror/.test(l)), logs.join(" | ").slice(0, 300));
    await ctx.close();
  }

  // Storage full (quota) after load
  {
    const ctx = await browser.newContext(H.DESKTOP);
    await ctx.addInitScript((k) => {
      const orig = Storage.prototype.setItem;
      Storage.prototype.setItem = function (key, v) { if (key === k && window.__full) throw new DOMException("full", "QuotaExceededError"); return orig.call(this, key, v); };
    }, KEY);
    const page = await ctx.newPage();
    await page.goto(BASE + H.lessonUrl("forex"), { waitUntil: "networkidle" });
    await page.evaluate(() => (window.__full = true));
    await page.locator("#exercise").getByLabel(/Your answer/).fill("600");
    await page.locator("#exercise").getByLabel(/Your answer/).press("Enter");
    const t1 = await page.textContent("main");
    check("quota full: a warning is shown", /blocking storage|could not save|not saved/i.test(t1));
    check("quota full: warning wording is accurate (not 'blocking storage')", !/This browser is blocking storage/.test(t1));
    await page.locator("#practical textarea").fill("note");
    await page.locator("#practical").getByRole("button", { name: "Save reflection" }).click();
    await page.waitForTimeout(200);
    check("quota full: earlier in-memory progress survives a second failed save", /Solved/.test(await page.locator("#exercise").textContent()));
    await ctx.close();
  }

  // Settings reset
  {
    const ctx = await browser.newContext(H.DESKTOP);
    const page = await ctx.newPage();
    await page.goto(BASE + H.lessonUrl("forex"), { waitUntil: "networkidle" });
    await page.locator("#exercise").getByLabel(/Your answer/).fill("600");
    await page.locator("#exercise").getByLabel(/Your answer/).press("Enter");
    await page.evaluate((k) => localStorage.setItem(k, "{old private notes"), BACKUP);
    await page.goto(BASE + "/settings", { waitUntil: "networkidle" });
    check("settings shows 1 lesson started", /1 lesson started, 0 completed/.test(await page.textContent("main")));
    await page.getByRole("button", { name: "Reset Academy progress" }).click();
    await page.getByRole("button", { name: "Cancel" }).click();
    check("reset cancel keeps data", !!(await page.evaluate((k) => localStorage.getItem(k), KEY)));
    await page.getByRole("button", { name: "Reset Academy progress" }).click();
    await page.getByRole("button", { name: "Yes, reset" }).click();
    check("reset confirm clears progress key", (await page.evaluate((k) => localStorage.getItem(k), KEY)) === null);
    check("reset shows confirmation", /Progress reset/.test(await page.textContent("main")));
    check("reset also clears the corrupt-backup copy", (await page.evaluate((k) => localStorage.getItem(k), BACKUP)) === null);
    await page.goto(BASE + "/", { waitUntil: "networkidle" });
    const lp = await page.locator("section", { has: page.getByRole("heading", { name: "Learning progress" }) }).textContent();
    check("dashboard back to zero after reset", /0\/10/.test(lp) && /Streak\s*0/.test(lp), lp.slice(0, 200));
    // other tab sees reset
    await ctx.close();
  }

  // Glossary
  {
    const ctx = await browser.newContext(H.DESKTOP);
    const page = await ctx.newPage();
    await page.goto(BASE + "/academy/glossary", { waitUntil: "networkidle" });
    const search = page.getByRole("searchbox", { name: "Search the glossary" });
    await search.fill("SPREAD");
    let t = await page.textContent("main");
    check("glossary search case-insensitive", /matching "SPREAD"/.test(t) && /Spread/.test(t));
    await search.fill("zzzqqq");
    check("glossary no-results state", /No terms match/.test(await page.textContent("main")));
    await search.fill("<img src=x onerror=window.__xss=1>");
    await page.waitForTimeout(200);
    check("glossary search is not an XSS vector", await page.evaluate(() => !window.__xss));
    await search.fill("");
    await page.getByRole("button", { name: /^Learned/ }).click();
    check("Learned filter with no progress shows 0 terms", /^0 terms/.test((await page.locator("main p[aria-live]").textContent()).trim()));
    await page.getByRole("button", { name: "All" }).click();
    const letters = page.getByRole("navigation", { name: "Jump to letter" }).getByRole("link");
    const n = await letters.count();
    check("A–Z links present", n > 10, `count ${n}`);
    let broken = 0;
    for (let i = 0; i < n; i++) { const href = await letters.nth(i).getAttribute("href"); if (!(await page.locator(href).count())) broken++; }
    check("every A–Z link has a target", broken === 0, `broken ${broken}`);
    await letters.last().click();
    await page.waitForTimeout(300);
    check("A–Z link scrolls", await page.evaluate(() => window.scrollY > 100));
    // Learned after completing lesson 1 via storage injection
    await page.evaluate((k) => {
      const now = new Date().toISOString();
      const sr = {}; for (const s of ["meeting-place", "why-markets-exist", "exchange-vs-otc", "life-of-a-trade"]) sr[s] = now;
      localStorage.setItem(k, JSON.stringify({ version: 1, lessons: { "what-is-a-market": { sectionsRead: sr, exerciseCompletedAt: now, quizAttempts: [{ at: now, correct: 5, total: 5 }], reflection: null } }, updatedAt: now }));
    }, KEY);
    await page.reload({ waitUntil: "networkidle" });
    await page.getByRole("button", { name: /^Learned/ }).click();
    // Lesson 1 now also introduces "bond" and "order-book" (tester round 1 content fixes): 7 → 9.
    check("Learned filter shows lesson 1's 9 terms", /^9 terms/.test((await page.locator("main p[aria-live]").textContent()).trim()), await page.locator("main p[aria-live]").textContent());
    await ctx.close();
  }

  // Outline-only tracks
  {
    const ctx = await browser.newContext(H.DESKTOP);
    const page = await ctx.newPage();
    await page.goto(BASE + "/academy/risk-management", { waitUntil: "networkidle" });
    const t = await page.textContent("main");
    check("planned track says Not written yet", /Not written yet/.test(t));
    const lessonLinks = await page.locator("main a[href^='/academy/risk-management/']").count();
    check("planned track has no openable lessons", lessonLinks === 0);
    await page.goto(BASE + "/academy", { waitUntil: "networkidle" });
    const nw = await page.getByText("Not written yet").count();
    // Was a fixed 13 while only track 1 was written. Tracks 2 and 3 are now written, so the
    // expected count is the number of planned tracks in the curriculum (11 today).
    check(`academy shows ${H.PLANNED_TRACKS.length} 'Not written yet' tracks`, nw === H.PLANNED_TRACKS.length && H.PLANNED_TRACKS.length === 10, `found ${nw}`); // 14 tracks − 4 written (track 6 added in Phase 2 step 2)
    await ctx.close();
  }
  await browser.close();
  H.summary();
})().catch((e) => { console.error(e); process.exitCode = 2; });
