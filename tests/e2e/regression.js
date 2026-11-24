// Phase 1 regression + every-route sanity (status, console errors, hydration, horizontal scroll).
const H = require("./helpers");
const { chromium, BASE, check } = H;
const NAV = ["/", "/academy", "/market-desk", "/strategy-lab", "/paper-trading", "/journal", "/mentor", "/analytics", "/settings"];
const TRACKS = H.CURRICULUM.tracks.map((t) => t.id);
const ALL = [...NAV, "/academy/glossary", ...TRACKS.map((t) => `/academy/${t}`), ...H.ALL_LESSON_IDS.map(H.lessonUrl)]; // every written lesson, from the content sources
(async () => {
  const browser = await chromium.launch();
  for (const [label, opts] of [["desktop", H.DESKTOP], ["phone", H.PHONE], ["w320", H.NARROW], ["w800", H.TABLET]]) {
    const ctx = await browser.newContext(opts);
    const page = await ctx.newPage();
    // Tracks 2, 3 and 6 are locked until Market Foundations is passed; seed that so their lessons render in full.
    await H.unlockTracks(page);
    for (const url of ALL) {
      const logs = [];
      const handler = (m) => { if (m.type() === "error" || m.type() === "warning") logs.push(m.text()); };
      page.on("console", handler);
      const pe = (e) => logs.push("pageerror " + e.message);
      page.on("pageerror", pe);
      const res = await page.goto(BASE + url, { waitUntil: "networkidle" });
      await page.waitForTimeout(250);
      const status = res.status();
      const hs = await H.noHScroll(page);
      const h = await page.locator("main h2, main h1").first().textContent().catch(() => null);
      check(`[${label}] ${url} 200`, status === 200, `status ${status}`);
      check(`[${label}] ${url} no horizontal scroll`, hs.over <= 0, `over=${hs.over} ${hs.culprit || ""}`);
      check(`[${label}] ${url} no console errors/hydration warnings`, logs.length === 0, logs.join(" | ").slice(0, 400));
      check(`[${label}] ${url} renders a heading`, !!h);
      page.off("console", handler); page.off("pageerror", pe);
    }
    // 404s
    for (const url of ["/nope", "/academy/xyz", "/academy/market-foundations/xyz", "/academy/forex-foundations/forex", "/academy/market-foundations/constructor"]) {
      const logs = []; const handler = (m) => { if (m.type() === "error" && !/404|Failed to load resource/.test(m.text())) logs.push(m.text()); };
      page.on("console", handler);
      const res = await page.goto(BASE + url, { waitUntil: "networkidle" });
      const txt = await page.textContent("main");
      check(`[${label}] ${url} → 404 page`, res.status() === 404 && /doesn.t exist/.test(txt), `status ${res.status()}`);
      check(`[${label}] ${url} 404 no hydration/console errors`, logs.length === 0, logs.join(" | ").slice(0, 300));
      page.off("console", handler);
    }
    await ctx.close();
  }

  // The lesson list read from the sources must match what the track pages actually link to.
  {
    const ctx = await browser.newContext(H.DESKTOP);
    const page = await ctx.newPage();
    check("curriculum has 14 tracks", TRACKS.length === 14, `found ${TRACKS.length}`);
    for (const t of H.WRITTEN_TRACKS) {
      await page.goto(BASE + `/academy/${t.id}`, { waitUntil: "networkidle" });
      const all = await page.locator(`main a[href^='/academy/${t.id}/']`).evaluateAll((as) => [...new Set(as.map((a) => a.getAttribute("href")))]);
      // Phase 2 step 1: each written track page also links to its track assessment (status panel);
      // that link is checked on its own and is not part of the lesson list.
      const hrefs = all.filter((h) => h !== `/academy/${t.id}/assessment`);
      // On a fresh browser only tracks without prerequisites are unlocked, so only they offer it.
      const open = t.id === "market-foundations"; // the only track with no prerequisites
      check(`track ${t.id} page ${open ? "links" : "does not link (locked)"} to its track assessment`, all.includes(`/academy/${t.id}/assessment`) === open);
      const expected = H.ALL_LESSONS.filter((l) => l.trackId === t.id).map((l) => l.url);
      check(`track ${t.id} page lists exactly its written lessons in order (${expected.length})`, JSON.stringify(hrefs) === JSON.stringify(expected), `page: ${hrefs.join(",")}`);
    }
    await ctx.close();
  }

  // Desktop specifics
  {
    const ctx = await browser.newContext(H.DESKTOP);
    const page = await ctx.newPage();
    await page.goto(BASE + "/", { waitUntil: "networkidle" });
    // dashboard panels + badges
    const text = await page.textContent("main");
    for (const t of ["Learning progress", "Recommended next lesson", "Market overview", "Daily market briefing", "Paper trading account", "Watchlist", "Open simulated positions", "Performance", "Recent journal entries", "Trading discipline", "AI Mentor"]) check(`dashboard panel "${t}"`, text.includes(t));
    const BADGE = 'span[title]:has(> span.rounded-full[aria-hidden])';
    const badges = await page.locator("main " + BADGE).count();
    check("dashboard DataBadges still present (>=7)", badges >= 7, `found ${badges}`);
    const lp = page.locator("section", { has: page.getByRole("heading", { name: "Learning progress" }) });
    const lpBadge = await lp.locator(BADGE).count();
    check("Learning progress panel (shows numbers) carries a DataBadge", lpBadge > 0, `badges in panel: ${lpBadge}`);
    check("market session panel renders (Sydney/Tokyo/London/New York)", ["Sydney", "Tokyo", "London", "New York"].every((c) => text.includes(c)));
    check("first visit: 0/10 lessons", /0\/10/.test(text));
    check("first visit: mastery 0%", /0%/.test(text));
    check("first visit: lesson 1 recommended", await page.getByRole("link", { name: /Start lesson/ }).getAttribute("href") === H.lessonUrl("what-is-a-market"));
    // sidebar collapse persists
    await page.getByRole("button", { name: "Collapse sidebar" }).click();
    await page.reload({ waitUntil: "networkidle" });
    check("sidebar collapse persists across reload", await page.getByRole("button", { name: "Expand sidebar" }).count() === 1);
    await page.getByRole("button", { name: "Expand sidebar" }).click();
    // settings legend
    await page.goto(BASE + "/settings", { waitUntil: "networkidle" });
    const st = await page.textContent("main");
    check("settings data-label legend", ["Live", "Delayed", "Simulated", "Sample", "Computed", "No data source"].every((l) => st.includes(l)));
    check("settings reset button disabled with no progress", await page.getByRole("button", { name: "Reset Academy progress" }).isDisabled());
    await ctx.close();
  }
  // Mobile nav
  {
    const ctx = await browser.newContext(H.PHONE);
    const page = await ctx.newPage();
    await page.goto(BASE + "/", { waitUntil: "networkidle" });
    const more = page.getByRole("button", { name: "More" });
    check("mobile bottom nav visible", await more.isVisible());
    await more.click();
    check("More sheet opens", await page.getByRole("dialog", { name: "More sections" }).isVisible());
    await page.keyboard.press("Escape");
    await page.waitForTimeout(150);
    check("More sheet closes on Escape", await page.getByRole("dialog").count() === 0);
    await more.click();
    await page.getByRole("button", { name: "Close", exact: true }).click();
    check("More sheet closes on X", await page.getByRole("dialog").count() === 0);
    await more.click();
    await page.getByRole("dialog").getByRole("link", { name: /Settings/ }).click();
    await page.waitForURL("**/settings");
    await page.waitForTimeout(500);
    check("More sheet link navigates and closes", await page.getByRole("dialog").count() === 0);
    await ctx.close();
  }
  await browser.close();
  H.summary();
})();
