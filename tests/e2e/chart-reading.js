// Track 6 (Chart Reading): widget behaviour, gating, simulated-data labelling and the practical exam.
// Run with: NODE_PATH=$(npm root -g) node tests/e2e/chart-reading.js   (server on BASE, default :3300)
const H = require("./helpers");
const { chromium, BASE, check } = H;
const CR = H.ALL_LESSONS.filter((l) => l.trackId === "chart-reading");
const BADTEXT = /NaN|Infinity|undefined|null|\[object/;
const status = (w) => w.locator("[role=status][aria-live=polite]").last().textContent();

(async () => {
  const browser = await chromium.launch();

  // ── 0. Gating: locked on a fresh browser, open once Market Foundations is passed.
  {
    const ctx = await browser.newContext(H.DESKTOP);
    const page = await ctx.newPage();
    await page.goto(BASE + H.lessonUrl("cr-what-is-a-chart"), { waitUntil: "networkidle" });
    check("fresh browser: Chart Reading lesson is locked (no widget rendered)", (await page.locator("[data-widget]").count()) === 0);
    check("fresh browser: the gate names Market Foundations", /Market Foundations/.test((await page.locator("main").textContent()) || ""));
    await H.unlockTracks(page);
    await page.goto(BASE + H.lessonUrl("cr-what-is-a-chart"), { waitUntil: "networkidle" });
    check("after passing Market Foundations the lesson renders its widget", (await page.locator("[data-widget]").count()) >= 1);
    await page.goto(BASE + "/academy/chart-reading", { waitUntil: "networkidle" });
    const hrefs = await page.locator("main a[href^='/academy/chart-reading/cr-']").evaluateAll((as) => [...new Set(as.map((a) => a.getAttribute("href")))]);
    check(`track page lists the 12 lessons in order (${hrefs.length})`, JSON.stringify(hrefs) === JSON.stringify(CR.map((l) => l.url)), hrefs.join(","));
    check("track page links to its assessment once unlocked", (await page.locator("main a[href='/academy/chart-reading/assessment']").count()) >= 1);
    await ctx.close();
  }

  // ── 1. Every lesson at 320 / 390 / 1440: widgets, Simulated badges, A–L parts, no overflow, no bad text.
  // CR_ONLY=interactions skips this sweep while debugging section 2+.
  for (const [label, opts] of process.env.CR_ONLY === "interactions" ? [] : [["w320", H.NARROW], ["w390", H.PHONE], ["w1440", H.DESKTOP]]) {
    const ctx = await browser.newContext(opts);
    const page = await ctx.newPage();
    page.setDefaultTimeout(8000);
    const logs = []; H.watchConsole(page, logs);
    await H.unlockTracks(page);
    const missing = [], badges = [], hs = [], bad = [], parts = [], research = [];
    for (const l of CR) {
      await page.goto(BASE + l.url, { waitUntil: "networkidle" });
      const ws = page.locator("[data-widget]");
      if ((await ws.count()) < 1) missing.push(l.id);
      for (let i = 0; i < (await ws.count()); i++) {
        const b = await ws.nth(i).locator("span[title]").filter({ hasText: /^(Simulated|Sample)/ }).count();
        if (b !== 1) badges.push(`${l.id}#${i}`);
        const t = (await ws.nth(i).textContent()) || "";
        if (BADTEXT.test(t)) bad.push(`${l.id}#${i}: ${t.match(BADTEXT)[0]}`);
      }
      const letters = await page.locator("[data-part]").evaluateAll((els) => [...new Set(els.map((e) => e.getAttribute("data-part")))]);
      for (const p of ["why", "beginner", "visual", "example", "deep-dive", "professionals", "mistakes", "summary"]) if (!letters.includes(p)) parts.push(`${l.id}:${p}`);
      const unv = await page.locator("[data-research][data-verified=false]").count();
      if (unv) research.push(`${l.id}: ${unv} unverified`);
      const h = await H.noHScroll(page);
      if (h.over > 0) hs.push(`${l.id}: +${h.over}px ${h.culprit}`);
    }
    check(`[${label}] every Chart Reading lesson renders at least one widget`, missing.length === 0, missing.join(", "));
    check(`[${label}] every chart widget carries exactly one Simulated/Sample badge`, badges.length === 0, badges.join(", "));
    check(`[${label}] every lesson shows the A–L section parts`, parts.length === 0, parts.slice(0, 6).join(", "));
    check(`[${label}] all research cards are verified`, research.length === 0, research.join(", "));
    check(`[${label}] no NaN/undefined/null text in the widgets`, bad.length === 0, bad.join(" | "));
    check(`[${label}] no horizontal page scroll on any lesson`, hs.length === 0, hs.join(" | "));
    check(`[${label}] no console errors or hydration warnings`, logs.length === 0, logs.slice(0, 4).join(" | "));
    await ctx.close();
  }

  const ctx = await browser.newContext(H.DESKTOP);
  const page = await ctx.newPage();
  page.setDefaultTimeout(8000);
  const logs = []; H.watchConsole(page, logs);
  await H.unlockTracks(page);
  const widget = (title) => page.locator("[data-widget]").filter({ has: page.locator("p[id]", { hasText: title }) }).first();

  // ── 2. Trade tape: next trade prints and the counter moves; the chart is keyboard-readable.
  {
    await page.goto(BASE + H.lessonUrl("cr-what-is-a-chart"), { waitUntil: "networkidle" });
    const w = widget("Trades print, the chart builds");
    const before = await w.textContent();
    await w.getByRole("button", { name: "Next 20 trades" }).click();
    const after = await w.textContent();
    check("trade tape: 'Next 20 trades' prints more trades", /32 of 240/.test(after) && before !== after);
    const chart = w.locator("[data-chart] [role=group]").first();
    await chart.focus();
    await page.keyboard.press("ArrowLeft");
    const read = await w.locator("[data-chart] p[aria-live]").first().textContent();
    check("chart keyboard cursor shows that bar's OHLC", /O [\d.,]+ · H [\d.,]+ · L [\d.,]+ · C [\d.,]+/.test(read), read);
    await w.getByRole("button", { name: "Play" }).click();
    await page.waitForTimeout(900);
    const played = await w.textContent();
    await w.getByRole("button", { name: "Pause" }).click();
    check("trade tape: Play prints trades over time, Pause stops", played !== after);
  }

  // ── 3. Chart types: Heikin-Ashi warns that its close is not a traded price; Renko shows bricks.
  {
    await page.goto(BASE + H.lessonUrl("cr-chart-types"), { waitUntil: "networkidle" });
    const w = widget("One series, nine chart types");
    check("chart types: Heikin-Ashi result says its values are averages, not trades", /averages, not prices anyone traded/.test(await status(w)));
    await w.getByText("Renko", { exact: true }).click();
    check("chart types: Renko draws bricks", /bricks/.test(await w.textContent()));
    await w.getByText("Point & figure", { exact: true }).click();
    check("chart types: point and figure draws columns", /columns/.test(await w.textContent()));
  }

  // ── 4. Candle builder: impossible candles are rejected; a doji challenge can be met.
  {
    await page.goto(BASE + H.lessonUrl("cr-candlesticks"), { waitUntil: "networkidle" });
    const w = widget("Candle builder");
    await w.getByRole("textbox", { name: "High", exact: true }).fill("101");
    check("candle builder rejects a high below the close", /Not a possible candle: The high must be at least/.test(await status(w)));
    await w.getByRole("textbox", { name: "High", exact: true }).fill("104");
    await w.getByText("Doji", { exact: true }).click();
    await w.getByRole("textbox", { name: "Close", exact: true }).fill("100.2");
    check("candle builder: a body of 0.2 on a range of 6 meets the doji challenge", /Done: that is a valid "Doji"/.test(await status(w)), await status(w));
    check("candle builder measures body ÷ range", /3%/.test(await w.textContent()));
  }

  // ── 5. Pattern lab: a new random series changes the result; the warning about chance stays.
  {
    await page.goto(BASE + H.lessonUrl("cr-candle-patterns"), { waitUntil: "networkidle" });
    const w = widget("Pattern lab");
    const a = await status(w);
    await w.getByRole("button", { name: "New random series" }).click();
    const b = await status(w);
    check("pattern lab: a new random series gives different counts", a !== b);
    check("pattern lab: the result explains that differences are luck in a random walk", /coin flips|luck/.test(b));
  }

  // ── 6. Structure: nothing labelled before the learner marks and checks.
  {
    await page.goto(BASE + H.lessonUrl("cr-structure"), { waitUntil: "networkidle" });
    const w = widget("Mark the swings, then check");
    const svgText = () => w.locator("svg text").allTextContents();
    check("structure: no HH/HL/LH/LL labels before checking", !(await svgText()).some((t) => /^(HH|HL|LH|LL)$/.test(t)));
    check("structure: Check is disabled until two marks exist", await w.getByRole("button", { name: "Check my marks" }).isDisabled());
    const chart = w.locator("[data-chart] [role=group]").first();
    await chart.focus();
    for (let k = 0; k < 20; k++) await page.keyboard.press("ArrowLeft");
    await page.keyboard.press("Enter");
    for (let k = 0; k < 8; k++) await page.keyboard.press("ArrowLeft");
    await page.keyboard.press("Enter");
    check("structure: keyboard marks appear as H? markers", (await svgText()).filter((t) => t === "H?").length === 2);
    await w.getByRole("button", { name: "Check my marks" }).click();
    check("structure: after checking, swing labels appear", (await svgText()).some((t) => /^(HH|HL|LH|LL)$/.test(t)));
    check("structure: the result explains that swings depend on the rule", /depends on a definition/.test(await status(w)));
  }

  // ── 7. Scale: on a log scale both doublings are drawn the same height.
  {
    await page.goto(BASE + H.lessonUrl("cr-scale"), { waitUntil: "networkidle" });
    const w = widget("Linear and log scales");
    const px = async () => (await w.locator("dd").allTextContents()).filter((t) => / px$/.test(t)).map((t) => parseInt(t, 10));
    const lin = await px();
    await w.getByText("Logarithmic", { exact: true }).click();
    const lg = await px();
    check(`scale: linear draws the last doubling much taller (${lin.join(" vs ")})`, lin.length === 2 && lin[1] > lin[0] * 3);
    check(`scale: log draws both doublings about equally tall (${lg.join(" vs ")})`, lg.length === 2 && Math.abs(lg[0] - lg[1]) <= 2);
  }

  // ── 8. Gaps: an earnings gap fills the stop at the open, with a larger loss than planned.
  {
    await page.goto(BASE + H.lessonUrl("cr-gaps"), { waitUntil: "networkidle" });
    const w = widget("Gaps, fills and stop orders");
    const s = await status(w);
    check("gaps: the earnings scenario fills the stop at the open, beyond the stop", /first price available was the open at \$43\.00/.test(s) && /\$250\.00 loss became \$700\.00/.test(s), s);
    await w.getByText("Ordinary day", { exact: true }).click();
    check("gaps: on an ordinary day a 5% stop is not reached by a 3.5% dip", /never reached the \$47\.50 stop/.test(await status(w)));
    await w.locator("input[type=range]").first().focus();
    await page.keyboard.press("Home"); // 1% stop at $49.50, inside the day's range
    check("gaps: with no gap the stop fills at about the stop price", /triggered at about \$49\.50/.test(await status(w)), await status(w));
  }

  // ── 9. Exam: no model answer before submitting; submit needs every part; outcome does not change the score.
  {
    await page.goto(BASE + H.lessonUrl("cr-practical-exam"), { waitUntil: "networkidle" });
    const w = widget("Practical exam");
    check("exam: no model answer before submitting", (await w.locator("[data-model-answer]").count()) === 0);
    const submit = w.getByRole("button", { name: "Submit and see the model answer" });
    check("exam: submit is disabled before every part is answered", await submit.isDisabled());
    await w.locator("input[type=range]").first().focus();
    await page.keyboard.press("ArrowLeft");
    await w.getByText("Up", { exact: true }).click();
    await w.getByText("Similar", { exact: true }).click();
    await w.getByText("A close below the last swing low", { exact: true }).click();
    await w.getByLabel(/Explain your reading/).fill("Higher lows since day 40; support around the last swing low; volume similar; wrong below that low; news unknown.");
    check("exam: submit enables once every part is answered", !(await submit.isDisabled()));
    await submit.click();
    check("exam: the model answer appears after submitting", (await w.locator("[data-model-answer]").count()) === 1);
    const score = (await w.textContent()).match(/(\d) of 4 match the model/);
    check("exam: the marked parts are scored out of 4", !!score);
    await w.getByLabel(/I said what price action would prove my reading wrong/).check();
    check("exam: self-assessment counts the ticked items", /1 of 5/.test(await w.textContent()));
    await w.getByRole("button", { name: "Show what happened next" }).click();
    const score2 = (await w.textContent()).match(/(\d) of 4 match the model/);
    check("exam: revealing the outcome does not change the score", score && score2 && score[1] === score2[1]);
    check("exam: the result says the outcome does not grade the answer", /do not grade your answer/.test(await status(w)));
    // Part 2: the graded chart interactions use the shared chart-annotate component.
    check("exam part 2 has two chart-annotation questions", (await page.locator("[data-interaction=chart-annotate]").count()) === 2);
  }

  check("no console errors during the interaction checks", logs.length === 0, logs.slice(0, 4).join(" | "));
  await ctx.close();
  await browser.close();
  H.summary();
})().catch((e) => { console.error(e); process.exitCode = 2; process.exit(2); });
