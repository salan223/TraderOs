// Track 9 (Trading Psychology): gating, every lesson at three widths, badges, diagrams, research labels and the tools.
// Run with: NODE_PATH=$(npm root -g) BASE=http://localhost:3800 node tests/e2e/psychology.js
const H = require("./helpers");
const { chromium, BASE, check } = H;
const PSY = H.ALL_LESSONS.filter((l) => l.trackId === "trading-psychology");
const BADTEXT = /NaN|Infinity|undefined|null|\[object/;
const unlock = (page) => H.unlockTracks(page, ["market-foundations", "forex-foundations", "risk-management"]);
const num = (s) => Number(String(s).replace(/−/g, "-").replace(/[^0-9.+-]/g, ""));

(async () => {
  const browser = await chromium.launch();

  // ── 0. Gating: needs Risk Management.
  {
    const ctx = await browser.newContext(H.DESKTOP);
    const page = await ctx.newPage();
    await page.goto(BASE + H.lessonUrl("psy-prospect-theory"), { waitUntil: "networkidle" });
    check("fresh browser: Trading Psychology lesson is locked (no widget rendered)", (await page.locator("[data-widget]").count()) === 0);
    check("the locked page names Risk Management", /Risk Management/.test((await page.locator("main").textContent()) || ""));
    await unlock(page);
    await page.goto(BASE + H.lessonUrl("psy-prospect-theory"), { waitUntil: "networkidle" });
    check("after passing Risk Management the lesson renders its widgets", (await page.locator("[data-widget]").count()) >= 1);
    await page.goto(BASE + "/academy/trading-psychology", { waitUntil: "networkidle" });
    const hrefs = await page.locator("main a[href^='/academy/trading-psychology/psy-']").evaluateAll((as) => [...new Set(as.map((a) => a.getAttribute("href")))]);
    check(`track page lists the 12 lessons in order (${hrefs.length})`, PSY.length === 12 && JSON.stringify(hrefs) === JSON.stringify(PSY.map((l) => l.url)), hrefs.join(","));
    await page.goto(BASE + "/academy/trading-psychology/assessment", { waitUntil: "networkidle" });
    const at = (await page.locator("main").textContent()) || "";
    check("assessment page opens for Trading Psychology", /Trading Psychology: track assessment/.test(at), at.slice(0, 200));
    await page.goto(BASE + H.lessonUrl("rm-risk-of-ruin"), { waitUntil: "networkidle" });
    check("Risk Management's last lesson points on to Trading Psychology", (await page.locator("a[href='/academy/trading-psychology/psy-prospect-theory']").count()) >= 1);
    await ctx.close();
  }

  // ── 1. Every lesson at 320 / 390 / 1440.
  for (const [label, opts] of [["w320", H.NARROW], ["w390", H.PHONE], ["w1440", H.DESKTOP]]) {
    const ctx = await browser.newContext(opts);
    const page = await ctx.newPage();
    page.setDefaultTimeout(8000);
    const logs = []; H.watchConsole(page, logs);
    await unlock(page);
    const missing = [], badges = [], figs = [], hs = [], bad = [], parts = [], research = [], statuses = new Set();
    for (const l of PSY) {
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
      for (const s of await page.locator("[data-research]").evaluateAll((els) => els.map((e) => e.textContent || ""))) {
        for (const k of ["Replicated", "Disputed", "Regime-sensitive"]) if (s.includes(k)) statuses.add(k);
      }
      const h = await H.noHScroll(page);
      if (h.over > 0) hs.push(`${l.id}: +${h.over}px ${h.culprit}`);
    }
    check(`[${label}] every Trading Psychology lesson renders at least one tool`, missing.length === 0, missing.join(", "));
    check(`[${label}] every tool carries exactly one data badge`, badges.length === 0, badges.join(", "));
    check(`[${label}] every lesson has a labelled 'Not real data' diagram`, figs.length === 0, figs.join(", "));
    check(`[${label}] every lesson shows the A–L section parts`, parts.length === 0, parts.slice(0, 6).join(", "));
    check(`[${label}] all research cards are verified`, research.length === 0, research.join(", "));
    check(`[${label}] research cards show replicated and disputed findings`, statuses.has("Replicated") && statuses.has("Disputed"), [...statuses].join(","));
    check(`[${label}] no NaN/undefined/null text in the tools`, bad.length === 0, bad.join(" | "));
    check(`[${label}] no horizontal page scroll on any lesson`, hs.length === 0, hs.join(" | "));
    check(`[${label}] no console errors or hydration warnings`, logs.length === 0, logs.slice(0, 4).join(" | "));
    await ctx.close();
  }

  // ── 2. The tools (desktop and 390px).
  for (const [label, opts] of [["w1440", H.DESKTOP], ["w390", H.PHONE]]) {
    const ctx = await browser.newContext(opts);
    const page = await ctx.newPage();
    page.setDefaultTimeout(8000);
    const logs = []; H.watchConsole(page, logs);
    await unlock(page);
    const widget = (title) => page.locator("[data-widget]").filter({ has: page.locator("p[id]", { hasText: title }) }).first();
    const txt = async (w) => (await w.textContent()) || "";
    const status = async (w) => (await w.locator("[role=status]").first().textContent()) || "";
    const readout = async (w, name) => (await w.locator("dl > div, dl div").filter({ has: page.locator("dt", { hasText: name }) }).first().locator("dd").first().textContent()) || "";

    // L1 prospect theory
    await page.goto(BASE + H.lessonUrl("psy-prospect-theory"), { waitUntil: "networkidle" });
    const pt = widget("Prospect theory value function");
    const bet0 = num(await readout(pt, "A 50/50 bet on both"));
    await pt.getByText("λ = 1 (no loss aversion)").click();
    const bet1 = num(await readout(pt, "A 50/50 bet on both"));
    check(`[${label}] prospect: with λ = 2.25 the +150/−100 bet feels bad, with λ = 1 good (${bet0} → ${bet1})`, bet0 < 0 && bet1 > 0);
    check(`[${label}] prospect: the tool says loss aversion's size is debated`, /debated/.test(await status(pt)));

    // L2 disposition
    await page.goto(BASE + H.lessonUrl("psy-disposition"), { waitUntil: "networkidle" });
    const dp = widget("Which positions would you sell?");
    await dp.locator("[data-position=A]").getByText("Sell").click();
    await dp.locator("[data-position=B]").getByText("Sell").click();
    check(`[${label}] disposition: selling two winners gives PGR 67%, PLR 0%`, /67%/.test(await readout(dp, "Gains realised")) && /^0%/.test(await readout(dp, "Losses realised")));
    check(`[${label}] disposition: the tool names the disposition effect`, /disposition effect/.test(await status(dp)));

    // L3 overtrading
    await page.goto(BASE + H.lessonUrl("psy-overconfidence"), { waitUntil: "networkidle" });
    const ot = widget("Turnover and costs");
    await ot.getByRole("slider", { name: "Turnover, per year" }).fill("1000");
    check(`[${label}] overtrading: 1000% turnover at 1% cost turns +8% into a loss`, /^−2\.00%/.test((await readout(ot, "Return after costs")).trim()), await readout(ot, "Return after costs"));

    // L4 bias trainer
    await page.goto(BASE + H.lessonUrl("psy-biases"), { waitUntil: "networkidle" });
    const bt = widget("Bias-spotting trainer");
    await bt.getByText("Hindsight bias", { exact: true }).click();
    check(`[${label}] bias trainer: the right answer is confirmed`, /^Right/.test(await status(bt)) && /Score: 1 of 1/.test(await txt(bt)));
    await bt.getByRole("button", { name: "Next scenario" }).click();
    check(`[${label}] bias trainer: moves to scenario 2`, /Scenario 2 of 8/.test(await txt(bt)));
    await bt.getByText("Disposition effect", { exact: true }).click();
    check(`[${label}] bias trainer: a wrong answer is explained`, /Not quite/.test(await status(bt)) && /confirmation bias/.test(await status(bt)));

    // L5 streaks
    await page.goto(BASE + H.lessonUrl("psy-randomness"), { waitUntil: "networkidle" });
    const st = widget("Coin flips and streaks");
    const cells = await st.locator("[data-flips] > span").count();
    const f0 = await st.locator("[data-flips]").innerHTML();
    await st.getByRole("button", { name: "New flips" }).click();
    check(`[${label}] streaks: 100 seeded flips are drawn, and new flips change them`, cells === 100 && (await st.locator("[data-flips]").innerHTML()) !== f0);
    check(`[${label}] streaks: shows the exact biased share for 10 flips (35.3% after 3 heads)`, /35\.3%/.test(await status(st)), await status(st));

    // L6 edge simulator
    await page.goto(BASE + H.lessonUrl("psy-variance"), { waitUntil: "networkidle" });
    const ed = widget("Edge and variance simulator");
    check(`[${label}] edge sim: default edge is +0.1R a trade, with a streak chance shown`, /\+0\.1R/.test(await readout(ed, "Expectancy per trade")) && /%/.test(await readout(ed, "losses in a row")));
    check(`[${label}] edge sim: draws 20 paths`, (await ed.locator("svg path, svg polyline").count()) >= 20);
    await ed.getByRole("slider", { name: "Win rate" }).fill("30");
    check(`[${label}] edge sim: a negative edge is called out`, /no positive expectancy/.test(await status(ed)));

    // L7 outcome sorter
    await page.goto(BASE + H.lessonUrl("psy-outcome-bias"), { waitUntil: "networkidle" });
    const os = widget("Decision versus outcome sorter");
    await os.locator("[data-case=c2]").getByText("Poor process").click();
    check(`[${label}] outcome sorter: a winning rule break is dumb luck`, /Right\./.test(await txt(os.locator("[data-case=c2] [data-verdict]"))) && /dumb luck/.test(await txt(os.locator("[data-case=c2] [data-verdict]"))));
    await os.locator("[data-case=c1]").getByText("Poor process").click();
    check(`[${label}] outcome sorter: a stopped-out planned trade judged poor is corrected`, /Look again/.test(await txt(os.locator("[data-case=c1] [data-verdict]"))));

    // L8 revenge simulator
    await page.goto(BASE + H.lessonUrl("psy-fomo-revenge"), { waitUntil: "networkidle" });
    const rv = widget("Revenge trading simulator");
    const worst = async (p) => num(await rv.locator(`[data-policy=${p}]`).locator("div").filter({ has: page.locator("dt", { hasText: "Worst day" }) }).first().locator("dd").first().textContent());
    const ws = await worst("stop"), wr = await worst("revenge");
    check(`[${label}] revenge: the daily stop caps the worst day, revenge sizing does not (${ws}R vs ${wr}R)`, ws >= -4.2 && wr < ws - 10);
    check(`[${label}] revenge: says the setup has no edge`, /no edge/.test(await status(rv)));

    // L9 tilt self-check
    await page.goto(BASE + H.lessonUrl("psy-tilt-stress"), { waitUntil: "networkidle" });
    const tc = widget("Tilt self-check");
    check(`[${label}] tilt: labelled as a reflection, not a diagnosis`, /not a diagnosis/.test(await txt(tc.locator("[data-not-diagnosis]"))));
    check(`[${label}] tilt: starts steady`, /Carry on with your plan/.test(await txt(tc)));
    await tc.locator("[data-prompt='1']").getByText("Very much").click();
    check(`[${label}] tilt: a broken rule alone suggests a pause`, /Pause/.test(await readout(tc, "Suggested next step")));

    // L10 checklist builder (saved in this browser)
    await page.goto(BASE + H.lessonUrl("psy-checklists-journal"), { waitUntil: "networkidle" });
    let cb = widget("Pre-trade checklist builder");
    check(`[${label}] checklist: says it is saved only in this browser`, /Saved only in this browser/.test(await txt(cb.locator("[data-storage-note]"))));
    await cb.getByLabel("New checklist item").fill("My own e2e rule");
    await cb.getByRole("button", { name: "Add" }).click();
    check(`[${label}] checklist: a new item is added and saved`, /My own e2e rule/.test(await txt(cb)) && /saved in this browser/.test(await status(cb)));
    await page.reload({ waitUntil: "networkidle" });
    cb = widget("Pre-trade checklist builder");
    check(`[${label}] checklist: the item survives a reload`, /My own e2e rule/.test(await txt(cb)));
    const boxes = cb.locator("[data-check] input[type=checkbox]");
    for (let i = 0; i < (await boxes.count()); i++) await boxes.nth(i).check();
    check(`[${label}] checklist: every item ticked says it is not a prediction`, /not a prediction/.test(await status(cb)));
    await cb.getByRole("button", { name: "Reset to defaults" }).click();
    check(`[${label}] checklist: reset removes the item`, !/My own e2e rule/.test(await txt(cb)));

    // L11 expectations
    await page.goto(BASE + H.lessonUrl("psy-expectations"), { waitUntil: "networkidle" });
    const ex = widget("Zero-edge traders after costs");
    const ahead = async () => Number(((await readout(ex, "Ahead after costs")).match(/^\s*([\d,]+) of/) || [])[1]?.replace(/,/g, "") ?? NaN);
    const a100 = await ahead();
    await ex.getByRole("slider", { name: "Trades per trader" }).fill("500");
    const a500 = await ahead();
    check(`[${label}] expectations: some zero-edge traders are ahead by luck, fewer as costs add up (${a100} → ${a500})`, a100 > 0 && a100 < 500 && a500 < a100);

    // L12 plan template (saved in this browser)
    await page.goto(BASE + H.lessonUrl("psy-trading-plan"), { waitUntil: "networkidle" });
    let pl = widget("Trading plan template");
    await pl.getByLabel("Risk per trade and position sizing").fill("1% per trade, sized from the stop");
    check(`[${label}] plan: counts filled sections`, /1 of 8 sections filled/.test(await status(pl)));
    await page.reload({ waitUntil: "networkidle" });
    pl = widget("Trading plan template");
    check(`[${label}] plan: text survives a reload`, (await pl.getByLabel("Risk per trade and position sizing").inputValue()) === "1% per trade, sized from the stop");
    await pl.getByRole("button", { name: "Clear the plan" }).click();
    check(`[${label}] plan: clearing empties it`, /0 of 8 sections filled/.test(await status(pl)));

    check(`[${label}] no console errors during the interaction checks`, logs.length === 0, logs.slice(0, 4).join(" | "));
    await ctx.close();
  }

  // ── 3. Storage blocked: the checklist and plan still work and say so.
  {
    const ctx = await browser.newContext(H.DESKTOP);
    const page = await ctx.newPage();
    const logs = []; H.watchConsole(page, logs);
    await unlock(page);
    await page.addInitScript(() => {
      const set = Storage.prototype.setItem, get = Storage.prototype.getItem;
      Storage.prototype.setItem = function (k, v) { if (String(k).startsWith("trader-os:psy-")) throw new Error("blocked"); return set.call(this, k, v); };
      Storage.prototype.getItem = function (k) { if (String(k).startsWith("trader-os:psy-")) throw new Error("blocked"); return get.call(this, k); };
    });
    await page.goto(BASE + H.lessonUrl("psy-checklists-journal"), { waitUntil: "networkidle" });
    const cb = page.locator("[data-widget]").filter({ has: page.locator("p[id]", { hasText: "Pre-trade checklist builder" }) }).first();
    await cb.getByLabel("New checklist item").fill("Blocked storage rule");
    await cb.getByRole("button", { name: "Add" }).click();
    const s = (await cb.locator("[role=status]").first().textContent()) || "";
    check("blocked storage: the checklist still adds items and says saving was blocked", /Blocked storage rule/.test((await cb.textContent()) || "") && /blocked saving/.test(s), s);
    await page.goto(BASE + H.lessonUrl("psy-trading-plan"), { waitUntil: "networkidle" });
    const pl = page.locator("[data-widget]").filter({ has: page.locator("p[id]", { hasText: "Trading plan template" }) }).first();
    await pl.getByLabel("Daily and weekly loss stops").fill("−3R a day");
    check("blocked storage: the plan still accepts text and says saving was blocked", /blocked saving/.test((await pl.locator("[role=status]").first().textContent()) || ""));
    check("blocked storage: no page errors", logs.filter((l) => /pageerror/.test(l)).length === 0, logs.join(" | "));
    await ctx.close();
  }

  await browser.close();
  H.summary();
})().catch((e) => { console.error(e); process.exitCode = 2; process.exit(2); });
