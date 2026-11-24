// Track 7 (Technical Analysis): gating, every lesson at three widths, badges, diagrams, the indicator lab and the tools.
// Run with: NODE_PATH=$(npm root -g) BASE=http://localhost:3600 node tests/e2e/technical-analysis.js
const H = require("./helpers");
const { chromium, BASE, check } = H;
const TA = H.ALL_LESSONS.filter((l) => l.trackId === "technical-analysis");
const BADTEXT = /NaN|Infinity|undefined|null|\[object/;
const unlock = (page) => H.unlockTracks(page, ["market-foundations", "chart-reading"]);

(async () => {
  const browser = await chromium.launch();

  // ── 0. Gating: needs Chart Reading.
  {
    const ctx = await browser.newContext(H.DESKTOP);
    const page = await ctx.newPage();
    await page.goto(BASE + H.lessonUrl("ta-moving-averages"), { waitUntil: "networkidle" });
    check("fresh browser: Technical Analysis lesson is locked (no widget rendered)", (await page.locator("[data-widget]").count()) === 0);
    check("the locked page names Chart Reading", /Chart Reading/.test((await page.locator("main").textContent()) || ""));
    await unlock(page);
    await page.goto(BASE + H.lessonUrl("ta-moving-averages"), { waitUntil: "networkidle" });
    check("after passing Chart Reading the lesson renders its widgets", (await page.locator("[data-widget]").count()) >= 1);
    await page.goto(BASE + "/academy/technical-analysis", { waitUntil: "networkidle" });
    const hrefs = await page.locator("main a[href^='/academy/technical-analysis/ta-']").evaluateAll((as) => [...new Set(as.map((a) => a.getAttribute("href")))]);
    check(`track page lists the 12 lessons in order (${hrefs.length})`, TA.length === 12 && JSON.stringify(hrefs) === JSON.stringify(TA.map((l) => l.url)), hrefs.join(","));
    await page.goto(BASE + "/academy/technical-analysis/assessment", { waitUntil: "networkidle" });
    const at = (await page.locator("main").textContent()) || "";
    check("assessment page opens for Technical Analysis", /Technical Analysis: track assessment/.test(at), at.slice(0, 200));
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
    for (const l of TA) {
      await page.goto(BASE + l.url, { waitUntil: "networkidle" });
      const ws = page.locator("[data-widget]");
      if ((await ws.count()) < 1) missing.push(l.id);
      for (let i = 0; i < (await ws.count()); i++) {
        const w = ws.nth(i);
        if ((await w.locator("[data-illustration]").count()) > 0) continue; // static diagrams carry the "Not real data" frame instead
        if ((await w.locator("span[title]").filter({ hasText: /^(Simulated|Computed|Sample)/ }).count()) !== 1) badges.push(`${l.id}#${i}`);
        const t = (await w.textContent()) || "";
        if (BADTEXT.test(t)) bad.push(`${l.id}#${i}: ${t.match(BADTEXT)[0]}`);
      }
      const f = page.locator("figure[data-illustration] svg[role=img][aria-label]");
      if ((await f.count()) < 1 || !/Not real data/.test((await page.locator("figure[data-illustration]").first().textContent()) || "")) figs.push(l.id);
      const letters = await page.locator("[data-part]").evaluateAll((els) => [...new Set(els.map((e) => e.getAttribute("data-part")))]);
      for (const p of ["why", "beginner", "visual", "example", "deep-dive", "professionals", "mistakes", "summary"]) if (!letters.includes(p)) parts.push(`${l.id}:${p}`);
      const unv = await page.locator("[data-research][data-verified=false]").count();
      if (unv) research.push(`${l.id}: ${unv} unverified`);
      const h = await H.noHScroll(page);
      if (h.over > 0) hs.push(`${l.id}: +${h.over}px ${h.culprit}`);
    }
    check(`[${label}] every Technical Analysis lesson renders at least one tool`, missing.length === 0, missing.join(", "));
    check(`[${label}] every tool carries exactly one data badge`, badges.length === 0, badges.join(", "));
    check(`[${label}] every lesson has a labelled 'Not real data' diagram`, figs.length === 0, figs.join(", "));
    check(`[${label}] every lesson shows the A–L section parts`, parts.length === 0, parts.slice(0, 6).join(", "));
    check(`[${label}] all research cards are verified`, research.length === 0, research.join(", "));
    check(`[${label}] no NaN/undefined/null text in the tools`, bad.length === 0, bad.join(" | "));
    check(`[${label}] no horizontal page scroll on any lesson`, hs.length === 0, hs.join(" | "));
    check(`[${label}] no console errors or hydration warnings`, logs.length === 0, logs.slice(0, 4).join(" | "));
    await ctx.close();
  }

  // ── 2. The indicator lab and the tools respond (desktop and 390px).
  for (const [label, opts] of [["w1440", H.DESKTOP], ["w390", H.PHONE]]) {
    const ctx = await browser.newContext(opts);
    const page = await ctx.newPage();
    page.setDefaultTimeout(8000);
    const logs = []; H.watchConsole(page, logs);
    await unlock(page);
    const widget = (title) => page.locator("[data-widget]").filter({ has: page.locator("p[id]", { hasText: title }) }).first();
    const txt = async (w) => (await w.textContent()) || "";

    await page.goto(BASE + H.lessonUrl("ta-moving-averages"), { waitUntil: "networkidle" });
    const lab = widget("Indicator lab: moving averages");
    check(`[${label}] lab: badge is Simulated`, /Simulated/.test((await lab.locator("span[title]").first().textContent()) || ""));
    const chart = lab.locator("[data-synced-chart]");
    check(`[${label}] lab: one synced chart`, (await chart.count()) === 1);
    const before = await txt(lab);
    await lab.getByRole("slider", { name: "Fast average" }).fill("5");
    check(`[${label}] lab: changing the fast average changes the readouts`, (await txt(lab)) !== before);
    await lab.getByText("Bollinger Bands", { exact: true }).click();
    check(`[${label}] lab: toggling Bollinger Bands adds the bands readout`, /Bands \(lower \/ upper\)/.test(await txt(lab)));
    await lab.getByText("VWAP", { exact: true }).click();
    check(`[${label}] lab: toggling VWAP shows the reset choice`, /VWAP resets every/.test(await txt(lab)));
    await lab.getByText("RSI", { exact: true }).click();
    check(`[${label}] lab: choosing the RSI pane adds a pane and an RSI slider`, (await chart.locator("[data-pane]").count()) >= 1 && (await lab.getByRole("slider", { name: "RSI length" }).count()) === 1);
    const rsiBefore = await txt(lab);
    await lab.getByRole("slider", { name: "RSI length" }).fill("5");
    check(`[${label}] lab: changing the RSI length changes the readout`, (await txt(lab)) !== rsiBefore);
    await lab.getByText("MACD", { exact: true }).click();
    check(`[${label}] lab: MACD pane shows MACD / signal / histogram`, /MACD \/ signal \/ histogram/.test(await txt(lab)));
    await lab.getByText("Random walk", { exact: false }).first().click();
    check(`[${label}] lab: no NaN after switching market`, !BADTEXT.test(await txt(lab)));
    // Drag the chart: the view moves (svg changes) and price and pane stay in step.
    const svg = chart.locator("svg").first();
    const box = await svg.boundingBox();
    const html0 = await svg.innerHTML();
    await page.mouse.move(box.x + box.width * 0.6, box.y + 40);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.2, box.y + 40, { steps: 6 });
    await page.mouse.up();
    check(`[${label}] lab: dragging the chart pans the view`, (await svg.innerHTML()) !== html0);

    await page.goto(BASE + H.lessonUrl("ta-divergence"), { waitUntil: "networkidle" });
    const dv = widget("Divergence finder with a base rate");
    const d0 = await txt(dv);
    await dv.getByRole("slider", { name: /Swing strength/ }).fill("5");
    check(`[${label}] divergence: swing strength changes the counts`, (await txt(dv)) !== d0);

    await page.goto(BASE + H.lessonUrl("ta-chart-patterns"), { waitUntil: "networkidle" });
    const pc = widget("Pattern counter with a control");
    check(`[${label}] patterns: shows target and mirror hit columns`, /Target hit/.test(await txt(pc)) && /Mirror hit/.test(await txt(pc)));

    await page.goto(BASE + H.lessonUrl("ta-fibonacci"), { waitUntil: "networkidle" });
    const fb = widget("Fibonacci levels against a control");
    const f0 = await txt(fb);
    await fb.getByText("Made-up ratios", { exact: true }).click();
    check(`[${label}] fibonacci: switching to made-up ratios changes the result`, (await txt(fb)) !== f0);

    await page.goto(BASE + H.lessonUrl("ta-confluence"), { waitUntil: "networkidle" });
    const cf = widget("Timeframe agreement and indicator correlations");
    check(`[${label}] confluence: lists indicator correlations`, (await cf.locator("[data-redundancy]").count()) === 1 && /Rate of change/.test(await txt(cf)));

    await page.goto(BASE + H.lessonUrl("ta-testable-rules"), { waitUntil: "networkidle" });
    const of = widget("The best of many tries");
    const o0 = await txt(of);
    await of.getByRole("slider", { name: /pairs tried/ }).fill("6");
    check(`[${label}] overfitting: trying 64 pairs changes the result`, (await txt(of)) !== o0 && !BADTEXT.test(await txt(of)));

    check(`[${label}] no console errors during the interaction checks`, logs.length === 0, logs.slice(0, 4).join(" | "));
    await ctx.close();
  }

  await browser.close();
  H.summary();
})().catch((e) => { console.error(e); process.exitCode = 2; process.exit(2); });
