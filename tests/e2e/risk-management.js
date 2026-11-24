// Track 8 (Risk Management): gating, every lesson at three widths, badges, diagrams and the five tools.
// Run with: NODE_PATH=$(npm root -g) BASE=http://localhost:3500 node tests/e2e/risk-management.js
const H = require("./helpers");
const { chromium, BASE, check } = H;
const RM = H.ALL_LESSONS.filter((l) => l.trackId === "risk-management");
const BADTEXT = /NaN|Infinity|undefined|null|\[object/;
const status = (w) => w.locator("[role=status][aria-live=polite]").last().textContent();
const unlock = (page) => H.unlockTracks(page, ["market-foundations", "forex-foundations"]);

(async () => {
  const browser = await chromium.launch();

  // ── 0. Gating: needs Market Foundations AND Forex Foundations.
  {
    const ctx = await browser.newContext(H.DESKTOP);
    const page = await ctx.newPage();
    await page.goto(BASE + H.lessonUrl("rm-risk-per-trade"), { waitUntil: "networkidle" });
    check("fresh browser: Risk Management lesson is locked (no widget rendered)", (await page.locator("[data-widget]").count()) === 0);
    await H.unlockTracks(page, ["market-foundations"]);
    await page.goto(BASE + H.lessonUrl("rm-risk-per-trade"), { waitUntil: "networkidle" });
    check("with only Market Foundations passed it is still locked, naming Forex Foundations", (await page.locator("[data-widget]").count()) === 0 && /Forex Foundations/.test((await page.locator("main").textContent()) || ""));
    await unlock(page);
    await page.goto(BASE + H.lessonUrl("rm-risk-per-trade"), { waitUntil: "networkidle" });
    check("after passing both prerequisites the lesson renders its widget", (await page.locator("[data-widget]").count()) >= 1);
    await page.goto(BASE + "/academy/risk-management", { waitUntil: "networkidle" });
    const hrefs = await page.locator("main a[href^='/academy/risk-management/rm-']").evaluateAll((as) => [...new Set(as.map((a) => a.getAttribute("href")))]);
    check(`track page lists the 10 lessons in order (${hrefs.length})`, JSON.stringify(hrefs) === JSON.stringify(RM.map((l) => l.url)), hrefs.join(","));
    check("track page links to its assessment once unlocked", (await page.locator("main a[href='/academy/risk-management/assessment']").count()) >= 1);
    await page.goto(BASE + "/academy/risk-management/assessment", { waitUntil: "networkidle" });
    const at = (await page.locator("main").textContent()) || "";
    check("assessment page opens for Risk Management", /Risk Management: track assessment/.test(at), at.slice(0, 200));
    await ctx.close();
  }

  // ── 1. Every lesson at 320 / 390 / 1440.
  for (const [label, opts] of [["w320", H.NARROW], ["w390", H.PHONE], ["w1440", H.DESKTOP]]) {
    const ctx = await browser.newContext(opts);
    const page = await ctx.newPage();
    page.setDefaultTimeout(8000);
    const logs = []; H.watchConsole(page, logs);
    await unlock(page);
    const missing = [], badges = [], figs = [], hs = [], bad = [], parts = [], research = [];
    for (const l of RM) {
      await page.goto(BASE + l.url, { waitUntil: "networkidle" });
      const ws = page.locator("[data-widget]");
      if ((await ws.count()) < 1) missing.push(l.id);
      for (let i = 0; i < (await ws.count()); i++) {
        if ((await ws.nth(i).locator("span[title]").filter({ hasText: /^(Simulated|Computed|Sample)/ }).count()) !== 1) badges.push(`${l.id}#${i}`);
        const t = (await ws.nth(i).textContent()) || "";
        if (BADTEXT.test(t)) bad.push(`${l.id}#${i}: ${t.match(BADTEXT)[0]}`);
      }
      const f = page.locator("figure[data-illustration] svg[role=img][aria-label]");
      if ((await f.count()) < 1) figs.push(l.id);
      const letters = await page.locator("[data-part]").evaluateAll((els) => [...new Set(els.map((e) => e.getAttribute("data-part")))]);
      for (const p of ["why", "beginner", "visual", "example", "deep-dive", "professionals", "mistakes", "summary"]) if (!letters.includes(p)) parts.push(`${l.id}:${p}`);
      const unv = await page.locator("[data-research][data-verified=false]").count();
      if (unv) research.push(`${l.id}: ${unv} unverified`);
      const h = await H.noHScroll(page);
      if (h.over > 0) hs.push(`${l.id}: +${h.over}px ${h.culprit}`);
    }
    check(`[${label}] every Risk Management lesson renders at least one tool`, missing.length === 0, missing.join(", "));
    check(`[${label}] every tool carries exactly one data badge (Computed or Simulated)`, badges.length === 0, badges.join(", "));
    check(`[${label}] every lesson has a labelled static diagram`, figs.length === 0, figs.join(", "));
    check(`[${label}] every lesson shows the A–L section parts`, parts.length === 0, parts.slice(0, 6).join(", "));
    check(`[${label}] all research cards are verified`, research.length === 0, research.join(", "));
    check(`[${label}] no NaN/undefined/null text in the tools`, bad.length === 0, bad.join(" | "));
    check(`[${label}] no horizontal page scroll on any lesson`, hs.length === 0, hs.join(" | "));
    check(`[${label}] no console errors or hydration warnings`, logs.length === 0, logs.slice(0, 4).join(" | "));
    await ctx.close();
  }

  const ctx = await browser.newContext(H.DESKTOP);
  const page = await ctx.newPage();
  page.setDefaultTimeout(8000);
  const logs = []; H.watchConsole(page, logs);
  await unlock(page);
  const widget = (title) => page.locator("[data-widget]").filter({ has: page.locator("p[id]", { hasText: title }) }).first();
  const badgeOf = async (w) => (await w.locator("span[title]").first().textContent()) || "";

  // ── 2. Position size: shares, FX (quote, base, cross) and futures.
  {
    await page.goto(BASE + H.lessonUrl("rm-position-sizing"), { waitUntil: "networkidle" });
    const w = widget("Position size calculator");
    check("position size: shares default is 50 shares for $100 risk and a $2 stop", /→ 50 shares/.test(await status(w)), await status(w));
    await w.getByText("Forex", { exact: true }).click();
    check("position size: EUR/USD 20 pips → 50,000 units", /50,000 units/.test(await status(w)), await status(w));
    await w.getByText("USD/JPY", { exact: true }).click();
    check("position size: USD/JPY divides by the rate (75,000 units at 150)", /75,000/.test(await status(w)), await status(w));
    await w.getByText("EUR/GBP", { exact: true }).click();
    check("position size: EUR/GBP asks for a GBP/USD rate (cross)", (await w.getByLabel(/GBP\/USD rate/).count()) === 1);
    check("position size: EUR/GBP at GBP/USD 1.25 → 40,000 units", /40,000/.test(await status(w)), await status(w));
    await w.getByText("Futures", { exact: true }).click();
    await w.getByRole("textbox", { name: "Value of one point, one contract" }).fill("50");
    check("position size: a contract too big for the plan says no trade", /does not|Even one contract risks more/.test(await status(w)), await status(w));
    check("position size: badge is Computed", /Computed/.test(await badgeOf(w)));
  }

  // ── 3. Expectancy: break-even and a negative result.
  {
    await page.goto(BASE + H.lessonUrl("rm-risk-reward"), { waitUntil: "networkidle" });
    const w = widget("Expectancy and break-even calculator");
    check("expectancy: default 40% × $150 − 60% × $100 = $0.00 is shown", /= \$0\.00 per trade/.test(await status(w)), await status(w));
    await w.getByRole("slider", { name: "Win rate" }).fill("60");
    check("expectancy: 60% win rate gives a positive result", /= \$50\.00 per trade/.test(await status(w)), await status(w));
    check("expectancy: break-even win rate is 40% for 1.5 : 1", /40\.0%/.test((await w.textContent()) || ""));
  }

  // ── 4. Drawdown: a 50% loss needs 100%.
  {
    await page.goto(BASE + H.lessonUrl("rm-drawdowns"), { waitUntil: "networkidle" });
    const w = widget("Drawdown, recovery and losing streaks");
    await w.getByRole("slider", { name: "Loss from the peak" }).fill("50");
    check("drawdown: a 50% loss needs a 100.0% gain", /= 100\.0%/.test(await status(w)), await status(w));
  }

  // ── 5. Leverage: margin call and stop-out by moving the price.
  {
    await page.goto(BASE + H.lessonUrl("rm-leverage-margin"), { waitUntil: "networkidle" });
    const w = widget("Leverage and margin simulator");
    await w.getByRole("slider", { name: /Position size/ }).fill("1");
    const t = (await w.textContent()) || "";
    check("leverage: 1 lot at 1.1000 on $5,000 is 22.0 : 1 effective", /22\.0 : 1/.test(t));
    check("leverage: stop-out price is 1.0683", /1\.0683/.test(t));
    await w.getByRole("slider", { name: "Move EUR/USD" }).fill("-3");
    check("leverage: at 1:30 a 3% fall reaches the stop-out", /at or below 50%/.test(await status(w)), await status(w));
    await w.getByRole("slider", { name: "Move EUR/USD" }).fill("0");
    await w.getByText("1:500", { exact: true }).click();
    check("leverage: changing the broker maximum does not change effective leverage", /22\.0 : 1/.test((await w.textContent()) || ""));
    check("leverage: at 1:500 less margin is held, so the stop-out is further away (4.45%)", /4\.45% move against you/.test(await status(w)), await status(w));
  }

  // ── 6. Monte Carlo: seeded, reproducible, and the sizing switch changes the result.
  {
    await page.goto(BASE + H.lessonUrl("rm-risk-of-ruin"), { waitUntil: "networkidle" });
    const w = widget("Monte Carlo equity simulator");
    check("monte carlo: badge is Simulated", /Simulated/.test(await badgeOf(w)));
    const a = (await w.locator("dl").first().textContent()) || "";
    await w.getByRole("button", { name: /next seed/ }).click();
    const b = (await w.locator("dl").first().textContent()) || "";
    check("monte carlo: new paths change the results", a !== b);
    await page.reload({ waitUntil: "networkidle" });
    const a2 = (await widget("Monte Carlo equity simulator").locator("dl").first().textContent()) || "";
    check("monte carlo: the same seed gives the same results after a reload", a === a2);
    await widget("Monte Carlo equity simulator").getByText("Fixed dollar (% of starting equity)", { exact: true }).click();
    check("monte carlo: switching to fixed dollar changes the results", ((await widget("Monte Carlo equity simulator").locator("dl").first().textContent()) || "") !== a2);
    check("monte carlo: draws 20 visible paths", (await widget("Monte Carlo equity simulator").locator("svg path").count()) >= 20);
  }

  // ── 7. Gap and averaging-down tools respond.
  {
    await page.goto(BASE + H.lessonUrl("rm-gaps-limits"), { waitUntil: "networkidle" });
    const w = widget("Gap risk and a daily loss limit");
    await w.getByRole("slider", { name: /Next open/ }).fill("12");
    await w.getByRole("slider", { name: /Extra slippage/ }).fill("0");
    check("gap: a 12% gap fills the $48 stop at $44.00, 3.00 R", /\$44\.00/.test((await w.textContent()) || "") && /3\.00 R/.test((await w.textContent()) || ""));
    await page.goto(BASE + H.lessonUrl("rm-averaging-down"), { waitUntil: "networkidle" });
    const v = widget("Averaging down compared with one stop");
    await v.getByText("Double each time", { exact: true }).click();
    const held = await v.locator("tbody tr td:nth-child(3)").allTextContents();
    check("averaging down: doubling with 3 adds holds 10, 30, 70, 150 shares", held.join(",") === "10,30,70,150", held.join(","));
  }

  check("no console errors during the interaction checks", logs.length === 0, logs.slice(0, 4).join(" | "));
  await ctx.close();
  await browser.close();
  H.summary();
})().catch((e) => { console.error(e); process.exitCode = 2; process.exit(2); });
