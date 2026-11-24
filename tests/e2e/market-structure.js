// Track 13 (Market Structure): gating, every lesson at three widths, badges, diagrams, the order book simulator and the tools.
// Run with: NODE_PATH=$(npm root -g) BASE=http://localhost:3700 node tests/e2e/market-structure.js
const H = require("./helpers");
const { chromium, BASE, check } = H;
const TA = H.ALL_LESSONS.filter((l) => l.trackId === "market-structure");
const BADTEXT = /NaN|Infinity|undefined|null|\[object/;
const unlock = (page) => H.unlockTracks(page, ["market-foundations", "stocks-indices"]);

(async () => {
  const browser = await chromium.launch();

  // ── 0. Gating: needs Stocks and Indices.
  {
    const ctx = await browser.newContext(H.DESKTOP);
    const page = await ctx.newPage();
    await page.goto(BASE + H.lessonUrl("ms-venues"), { waitUntil: "networkidle" });
    check("fresh browser: Market Structure lesson is locked (no widget rendered)", (await page.locator("[data-widget]").count()) === 0);
    check("the locked page names Stocks and Indices", /Stocks and Indices/.test((await page.locator("main").textContent()) || ""));
    await unlock(page);
    await page.goto(BASE + H.lessonUrl("ms-venues"), { waitUntil: "networkidle" });
    check("after passing Stocks and Indices the lesson renders its widgets", (await page.locator("[data-widget]").count()) >= 1);
    await page.goto(BASE + "/academy/market-structure", { waitUntil: "networkidle" });
    const hrefs = await page.locator("main a[href^='/academy/market-structure/ms-']").evaluateAll((as) => [...new Set(as.map((a) => a.getAttribute("href")))]);
    check(`track page lists the 11 lessons in order (${hrefs.length})`, TA.length === 11 && JSON.stringify(hrefs) === JSON.stringify(TA.map((l) => l.url)), hrefs.join(","));
    await page.goto(BASE + "/academy/market-structure/assessment", { waitUntil: "networkidle" });
    const at = (await page.locator("main").textContent()) || "";
    check("assessment page opens for Market Structure", /Market Structure: track assessment/.test(at), at.slice(0, 200));
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
    check(`[${label}] every Market Structure lesson renders at least one tool`, missing.length === 0, missing.join(", "));
    check(`[${label}] every tool carries exactly one data badge`, badges.length === 0, badges.join(", "));
    check(`[${label}] every lesson has a labelled 'Not real data' diagram`, figs.length === 0, figs.join(", "));
    check(`[${label}] every lesson shows the A–L section parts`, parts.length === 0, parts.slice(0, 6).join(", "));
    check(`[${label}] all research cards are verified`, research.length === 0, research.join(", "));
    check(`[${label}] no NaN/undefined/null text in the tools`, bad.length === 0, bad.join(" | "));
    check(`[${label}] no horizontal page scroll on any lesson`, hs.length === 0, hs.join(" | "));
    check(`[${label}] no console errors or hydration warnings`, logs.length === 0, logs.slice(0, 4).join(" | "));
    await ctx.close();
  }

  // ── 2. The order book simulator and the tools (desktop and 390px).
  for (const [label, opts] of [["w1440", H.DESKTOP], ["w390", H.PHONE]]) {
    const ctx = await browser.newContext(opts);
    const page = await ctx.newPage();
    page.setDefaultTimeout(8000);
    const logs = []; H.watchConsole(page, logs);
    await unlock(page);
    const widget = (title) => page.locator("[data-widget]").filter({ has: page.locator("p[id]", { hasText: title }) }).first();
    const txt = async (w) => (await w.textContent()) || "";
    const status = (w) => w.locator("[role=status]").first().textContent();

    await page.goto(BASE + H.lessonUrl("ms-order-book"), { waitUntil: "networkidle" });
    const sim = widget("Order book simulator");
    check(`[${label}] simulator: badge is Simulated`, /Simulated/.test((await sim.locator("span[title]").first().textContent()) || ""));
    check(`[${label}] simulator: ladder shows asks and bids`, (await sim.locator("[data-ladder] tr[data-side=ask]").count()) >= 3 && (await sim.locator("[data-ladder] tr[data-side=bid]").count()) >= 3);
    // A passive limit buy rests, shows a queue position, and can be cancelled.
    await sim.getByText("Limit", { exact: true }).click();
    await sim.getByRole("slider", { name: "Limit price" }).fill("-4");
    await sim.getByRole("button", { name: "Send order" }).click();
    check(`[${label}] simulator: a limit buy below the touch rests in the book`, /resting in the book/i.test(await status(sim)), await status(sim));
    check(`[${label}] simulator: your resting order shows its queue position`, /queue position \d+/.test(await txt(sim.locator("[data-my-orders]"))));
    check(`[${label}] simulator: the ladder marks your price`, (await sim.locator("[data-ladder]").textContent()).includes("●"));
    await sim.locator("[data-my-orders]").getByRole("button", { name: "Cancel" }).first().click();
    check(`[${label}] simulator: cancelling removes the resting order`, (await sim.locator("[data-my-orders]").count()) === 0);
    // Iceberg: only the shown size is visible.
    await sim.getByRole("slider", { name: "Quantity (shares)" }).fill("500");
    await sim.getByText("Iceberg (show only part)").click();
    await sim.getByRole("slider", { name: "Shown size" }).fill("50");
    await sim.getByRole("button", { name: "Send order" }).click();
    check(`[${label}] simulator: an iceberg rests showing only part of its size`, /showing 50/.test(await txt(sim.locator("[data-my-orders]"))), await txt(sim.locator("[data-my-orders]")));
    await sim.getByText("Iceberg (show only part)").click();
    // FOK larger than the touch is killed.
    await sim.getByText("FOK", { exact: true }).click();
    await sim.getByRole("slider", { name: "Quantity (shares)" }).fill("2000");
    await sim.getByRole("slider", { name: "Limit price" }).fill("1");
    await sim.getByRole("button", { name: "Send order" }).click();
    check(`[${label}] simulator: an oversized FOK trades nothing`, /not filled, cancelled/i.test(await status(sim)) && /Fill-or-kill/.test(await status(sim)), await status(sim));
    // A large market buy walks the book: preview, partial fills and the tape.
    await sim.getByText("Market", { exact: true }).click();
    await sim.getByRole("slider", { name: "Quantity (shares)" }).fill("800");
    check(`[${label}] simulator: market order preview shows average price and slippage`, /beyond the touch/.test(await txt(sim.locator("[data-preview]"))));
    const tape0 = await txt(sim.locator("[data-tape]"));
    await sim.getByRole("button", { name: "Send order" }).click();
    check(`[${label}] simulator: the market order fills across several levels`, /fills\)/.test(await txt(sim.locator("[data-fill-log]"))) && /worse than the touch/.test(await status(sim)), await status(sim));
    check(`[${label}] simulator: your trades appear on the time-and-sales tape`, (await txt(sim.locator("[data-tape]"))) !== tape0 && /You/.test(await txt(sim.locator("[data-tape]"))));
    // Simulated participants trade.
    const tape1 = await txt(sim.locator("[data-tape]"));
    await sim.getByRole("button", { name: "×10" }).click();
    check(`[${label}] simulator: other participants trade when asked`, (await txt(sim.locator("[data-tape]"))) !== tape1 && /round/.test(await status(sim)));
    // Stops wait for their trigger.
    await sim.getByText("Stop", { exact: true }).click();
    await sim.getByText("Sell", { exact: true }).click();
    await sim.getByRole("button", { name: "Send order" }).click();
    check(`[${label}] simulator: a stop waits for its trigger`, /waiting for its trigger/i.test(await status(sim)) || /triggered/i.test(await txt(sim.locator("[data-fill-log]"))), await status(sim));
    // Thin liquidity: wider spread.
    const spreadOf = async () => Number(((await sim.locator("dl").first().textContent()) || "").match(/Spread(\d+)¢/)?.[1] ?? NaN);
    await sim.getByText("Deep", { exact: true }).click();
    await sim.getByText("Normal", { exact: true }).click();
    const normal = await spreadOf();
    await sim.getByText("Thin", { exact: true }).click();
    const thin = await spreadOf();
    check(`[${label}] simulator: a thin book has a wider spread (${normal}¢ → ${thin}¢)`, Number.isFinite(normal) && thin > normal);
    check(`[${label}] simulator: no NaN`, !BADTEXT.test(await txt(sim)));

    await page.goto(BASE + H.lessonUrl("ms-auctions"), { waitUntil: "networkidle" });
    const au = widget("Call auction");
    const p0 = await txt(au.locator("dl"));
    await au.getByText("Market", { exact: true }).click();
    check(`[${label}] auction: a 1,000-share market buy moves the auction price`, (await txt(au.locator("dl"))) !== p0);

    await page.goto(BASE + H.lessonUrl("ms-fragmentation"), { waitUntil: "networkidle" });
    const nb = widget("Routing across venues");
    check(`[${label}] routing: best-price routing never trades through`, !/worse than a better price/.test(await txt(nb.locator("[data-route]"))));
    await nb.getByText("Only Exchange A", { exact: true }).click();
    check(`[${label}] routing: one-venue routing trades through better quotes`, /worse than a better price/.test(await txt(nb.locator("[data-route]"))));

    await page.goto(BASE + H.lessonUrl("ms-hft"), { waitUntil: "networkidle" });
    const lt = widget("Latency race and the spread");
    await lt.getByRole("slider", { name: /Fast firms racing/ }).fill("1");
    check(`[${label}] latency: a quoter that never loses the race needs no spread`, /0\.00¢/.test(await txt(lt.locator("dl"))));

    await page.goto(BASE + H.lessonUrl("ms-halts"), { waitUntil: "networkidle" });
    const ht = widget("US halt calculator");
    await ht.getByText("Tier 2", { exact: true }).click();
    check(`[${label}] halts: a $50 Tier 2 stock has a ±10% band`, /±10%/.test(await txt(ht)));
    await ht.getByRole("slider", { name: /S&P 500 fall/ }).fill("8");
    check(`[${label}] halts: an 8% fall before 3:25 p.m. is level 1`, /Level 1/.test(await txt(ht)) && /15-minute/.test(await txt(ht)));

    await page.goto(BASE + H.lessonUrl("ms-dark-pools"), { waitUntil: "networkidle" });
    const dp = widget("Dark pool or lit book");
    const d0 = await txt(dp.locator("dl"));
    await dp.getByRole("slider", { name: /drift against you/ }).fill("10");
    check(`[${label}] dark pool: drift changes the average cost`, (await txt(dp.locator("dl"))) !== d0 && !BADTEXT.test(await txt(dp)));

    check(`[${label}] no console errors during the interaction checks`, logs.length === 0, logs.slice(0, 4).join(" | "));
    await ctx.close();
  }

  await browser.close();
  H.summary();
})().catch((e) => { console.error(e); process.exitCode = 2; process.exit(2); });
