// Screenshots for manual review + tooltip clipping check on phone.
const fs = require("fs"), path = require("path");
const H = require("./helpers");
const { chromium, BASE, KEY, check } = H;
const SHOTS = process.env.SHOTS || path.join(__dirname, "../../shots/tester");
fs.mkdirSync(SHOTS, { recursive: true });
function seed() {
  const now = new Date(); const y = new Date(now.getTime() - 86400000);
  const sr = (ids, t) => Object.fromEntries(ids.map((i) => [i, t.toISOString()]));
  return JSON.stringify({ version: 1, updatedAt: now.toISOString(), lessons: {
    "what-is-a-market": { sectionsRead: sr(["meeting-place", "why-markets-exist", "exchange-vs-otc", "life-of-a-trade"], y), exerciseCompletedAt: y.toISOString(), quizAttempts: [{ at: y.toISOString(), correct: 5, total: 5 }, { at: now.toISOString(), correct: 4, total: 5 }], reflection: null },
    "why-prices-move": { sectionsRead: sr(["supply-demand", "information", "liquidity-volatility", "no-certainty"], now), exerciseCompletedAt: now.toISOString(), quizAttempts: [{ at: now.toISOString(), correct: 4, total: 5 }], reflection: null },
    "market-participants": { sectionsRead: sr(["who-trades"], now), exerciseCompletedAt: null, quizAttempts: [{ at: now.toISOString(), correct: 2, total: 5 }], reflection: null },
  } });
}
(async () => {
  const browser = await chromium.launch();
  for (const [label, opts] of [["desktop", H.DESKTOP], ["phone", H.PHONE]]) {
    const ctx = await browser.newContext(opts);
    const data = seed();
    await ctx.addInitScript(([k, v]) => { if (!localStorage.getItem(k)) localStorage.setItem(k, v); }, [KEY, data]);
    const page = await ctx.newPage();
    for (const [name, url] of [["dashboard", "/"], ["academy", "/academy"], ["track", "/academy/market-foundations"], ["track-forex", "/academy/forex-foundations"], ["track-stocks", "/academy/stocks-indices"], ["glossary", "/academy/glossary"], ["planned", "/academy/backtesting"], ["settings", "/settings"]]) {
      await page.goto(BASE + url, { waitUntil: "networkidle" }); await page.waitForTimeout(300);
      await page.screenshot({ path: path.join(SHOTS, `${label}-${name}.png`), fullPage: true });
    }
    await page.goto(BASE + H.lessonUrl("market-participants"), { waitUntil: "networkidle" });
    await page.screenshot({ path: path.join(SHOTS, `${label}-lesson-top.png`) });
    await page.locator("#exercise").scrollIntoViewIfNeeded();
    await page.locator("#exercise").screenshot({ path: path.join(SHOTS, `${label}-exercise-match.png`) });
    await page.locator("#quiz").getByRole("button", { name: /quiz/i }).first().click();
    await page.locator("#quiz").getByRole("radio").nth(0).check();
    await page.locator("#quiz").getByRole("button", { name: "Check answer" }).click();
    await page.locator("#quiz").screenshot({ path: path.join(SHOTS, `${label}-quiz-mid.png`) });
    for (let i = 0; i < 5; i++) {
      if (i) { await page.locator("#quiz").getByRole("radio").nth(2).check(); await page.locator("#quiz").getByRole("button", { name: "Check answer" }).click(); }
      await page.locator("#quiz").getByRole("button", { name: /Next question|See results/ }).click();
    }
    await page.locator("#quiz").screenshot({ path: path.join(SHOTS, `${label}-quiz-results.png`) });
    await page.goto(BASE + H.lessonUrl("stocks"), { waitUntil: "networkidle" });
    await page.locator("#exercise").screenshot({ path: path.join(SHOTS, `${label}-exercise-calc.png`) });
    await page.goto(BASE + H.lessonUrl("why-prices-move"), { waitUntil: "networkidle" });
    await page.locator("#exercise").screenshot({ path: path.join(SHOTS, `${label}-exercise-classify.png`) });

    // Tooltip clipping: focus every inline term on every lesson and check its tooltip box is inside the viewport.
    let clipped = [], total = 0;
    // Tracks 2, 3 and 6 are locked until Market Foundations is passed; store that so every lesson's terms render.
    await H.writeState(page, H.seedState({ complete: ["market-foundations"] }));
    for (const id of H.ALL_LESSON_IDS) {
      await page.goto(BASE + H.lessonUrl(id), { waitUntil: "networkidle" });
      const terms = page.locator("article span[tabindex='0']");
      const n = await terms.count();
      for (let i = 0; i < n; i++) {
        total++;
        await terms.nth(i).focus();
        const box = await terms.nth(i).evaluate((el) => {
          const tip = el.parentElement.querySelector("[role=tooltip]"); const r = tip.getBoundingClientRect();
          return { l: r.left, r: r.right, t: r.top, vw: document.documentElement.clientWidth, txt: el.textContent };
        });
        if (box.l < 0 || box.r > box.vw || box.t < 0) clipped.push(`${id}:"${box.txt}" [${Math.round(box.l)},${Math.round(box.r)}/${box.vw}, top ${Math.round(box.t)}]`);
        if (clipped.length === 1 && !fs.existsSync(path.join(SHOTS, `${label}-tooltip-clipped.png`)) && (box.r > box.vw || box.l < 0)) await page.screenshot({ path: path.join(SHOTS, `${label}-tooltip-clipped.png`) });
      }
    }
    const horiz = clipped.filter((c) => !/top -/.test(c));
    check(`[${label}] glossary tooltips stay inside the viewport horizontally (${total} checked)`, horiz.length === 0, `${horiz.length} clipped, e.g. ${horiz.slice(0, 4).join("; ")}`);
    await ctx.close();
  }
  await browser.close();
  H.summary();
})().catch((e) => { console.error(e); process.exitCode = 2; });
