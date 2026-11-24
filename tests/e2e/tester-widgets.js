// Tester round 5: hostile use of the 16 Academy widgets (tracks 2 and 3).
// Run with: NODE_PATH=$(npm root -g) node tests/e2e/tester-widgets.js   (server on BASE, default :3300)
// Optional: SHOTS=dir to save widget screenshots at 390 and 1440.
const fs = require("fs");
const H = require("./helpers");
const { chromium, BASE, check } = H;
const NEW = H.ALL_LESSONS.filter((l) => l.trackId !== "market-foundations");
const SHOTS = process.env.SHOTS;
const BADTEXT = /NaN|Infinity|undefined|null|\[object/;

(async () => {
  const browser = await chromium.launch();
  const status = (w) => w.locator("[role=status]").first().textContent();

  // ── 1. Every widget at 320 / 390 / 1440: all sliders to both extremes, every choice clicked,
  //       no bad text, no overflow, no horizontal page scroll, no console errors.
  for (const [label, opts] of [["w320", H.NARROW], ["w390", H.PHONE], ["w1440", H.DESKTOP]]) {
    const ctx = await browser.newContext(opts);
    const page = await ctx.newPage();
    page.setDefaultTimeout(8000);
    await H.unlockTracks(page); // Phase 2 step 1: tracks 2 and 3 unlock after Market Foundations is passed
    const logs = []; H.watchConsole(page, logs);
    const bad = [], overflow = [], hs = [], badge = [];
    let count = 0;
    for (const l of NEW) {
      await page.goto(BASE + l.url, { waitUntil: "networkidle" });
      const ws = page.locator("[data-widget]");
      const n = await ws.count();
      for (let i = 0; i < n; i++) {
        const w = ws.nth(i);
        count++;
        const title = ((await w.locator("p[id]").first().textContent()) || "").replace("(interactive illustration)", "").trim();
        // Track 6 widgets draw seeded simulated prices and are badged "Simulated".
        const b = await w.locator("span[title]").filter({ hasText: /^(Sample|Computed|Simulated)/ }).count();
        if (b !== 1) badge.push(`${title}: ${b} badges`);
        if (SHOTS && label !== "w320") {
          fs.mkdirSync(SHOTS, { recursive: true });
          await w.scrollIntoViewIfNeeded();
          await w.screenshot({ path: `${SHOTS}/${label}-${l.id}-${i}.png` });
        }
        // radios: click every option of every group (keyboard: focus + Space)
        const radios = w.locator("input[type=radio]");
        for (let k = 0; k < (await radios.count()); k++) {
          await radios.nth(k).focus();
          await page.keyboard.press("Space");
          const t = (await w.textContent()) || "";
          if (BADTEXT.test(t)) bad.push(`${title} radio ${k}: ${t.match(BADTEXT)[0]}`);
        }
        // sliders: Home and End
        const sl = w.locator("input[type=range]");
        for (let k = 0; k < (await sl.count()); k++) {
          for (const key of ["End", "Home"]) {
            await sl.nth(k).focus();
            await page.keyboard.press(key);
            const t = (await w.textContent()) || "";
            if (BADTEXT.test(t)) bad.push(`${title} slider ${k} ${key}: …${t.slice(Math.max(0, t.search(BADTEXT) - 40), t.search(BADTEXT) + 20)}`);
          }
        }
        const ov = await w.evaluate((el) => {
          const r = el.getBoundingClientRect();
          const vw = document.documentElement.clientWidth;
          const kids = [...el.querySelectorAll("*")].filter((c) => { const q = c.getBoundingClientRect(); return q.width > 0 && (q.right > r.right + 1 || q.left < r.left - 1); }).map((c) => c.tagName + "." + String(c.className).slice(0, 40));
          return { right: r.right, vw, kids: kids.slice(0, 3) };
        });
        if (ov.right > ov.vw + 1 || ov.kids.length) overflow.push(`${title}: right ${Math.round(ov.right)}/${ov.vw} ${ov.kids.join(",")}`);
      }
      const h = await H.noHScroll(page);
      if (h.over > 0) hs.push(`${l.id}: +${h.over}px ${h.culprit}`);
    }
    // 16 widgets in tracks 2–3 plus 12 in track 6 (Chart Reading).
    check(`[${label}] 28 widgets found, each with exactly one Sample/Computed/Simulated badge (${count})`, count === 28 && badge.length === 0, badge.join("; "));
    check(`[${label}] no NaN/Infinity/undefined after every choice and every slider extreme`, bad.length === 0, bad.slice(0, 6).join(" | "));
    check(`[${label}] nothing inside a widget sticks out of it`, overflow.length === 0, overflow.slice(0, 6).join(" | "));
    check(`[${label}] no horizontal page scroll after interaction`, hs.length === 0, hs.join(" | "));
    check(`[${label}] no console errors / hydration warnings`, logs.length === 0, logs.slice(0, 4).join(" | "));
    await ctx.close();
  }

  const ctx = await browser.newContext(H.DESKTOP);
  const page = await ctx.newPage();
  await H.unlockTracks(page); // Phase 2 step 1: tracks 2 and 3 unlock after Market Foundations is passed
  page.setDefaultTimeout(8000);
  const logs = []; H.watchConsole(page, logs);
  const W = (t) => page.locator("[data-widget]", { hasText: t });

  // ── 2. Number inputs: typing, clearing, junk, out of range, comma decimals
  {
    await page.goto(BASE + H.lessonUrl("fx-pips-lots"), { waitUntil: "networkidle" });
    const w = W("Position size from risk");
    const inp = w.getByLabel("Account balance (USD)");
    const res = async () => (await w.locator("dl").textContent()) + " | " + (await status(w));
    const cases = [];
    await inp.fill("10000"); cases.push(["10000", await res()]);
    check("number: typing 10000 → 1% risk = $100.00", /\$100\.00/.test(cases[0][1]), cases[0][1].slice(0, 120));
    await inp.fill(""); const cleared = await res();
    check("number: clearing keeps the last valid result (no NaN)", !BADTEXT.test(cleared) && /\$100\.00/.test(cleared), cleared.slice(0, 120));
    await inp.blur(); check("number: blur after clearing restores the shown value", (await inp.inputValue()) === "10000", await inp.inputValue());
    await inp.fill("-500"); const neg = await res();
    check("number: negative is clamped to 0 → 'Enter a balance above zero'", /Enter a balance above zero/.test(neg), neg.slice(-120));
    await inp.blur(); check("number: blur shows the clamped value 0", (await inp.inputValue()) === "0", await inp.inputValue());
    await inp.fill("99999999999"); const huge = await res();
    check("number: above max clamps to $10,000,000 → risk $100,000.00", /\$100,000\.00/.test(huge), huge.slice(0, 120));
    const shownBeforeBlur = await inp.inputValue();
    await inp.blur();
    check("number: over-max text is corrected on blur", (await inp.inputValue()) === "10000000", `before blur "${shownBeforeBlur}", after "${await inp.inputValue()}"`);
    // type=number: browsers reject letters and commas; make sure nothing breaks
    await inp.fill("2500");
    await inp.focus(); await page.keyboard.press("Control+A"); await page.keyboard.type("12,5");
    const comma = await res();
    check("number: '12,5' (comma decimal) does not produce NaN or a crash", !BADTEXT.test(comma), comma.slice(0, 120));
    await inp.blur();
    await inp.focus(); await page.keyboard.press("Control+A"); await page.keyboard.type("abc");
    const junk = await res();
    check("number: letters are ignored (no NaN)", !BADTEXT.test(junk), junk.slice(0, 120));
    await inp.blur();
    await inp.fill("1e3"); const sci = await res();
    check("number: '1e3' parses as 1,000 → $10.00 risk", /\$10\.00/.test(sci), sci.slice(0, 80));
    // ETF basket amount and rate converter amount
    await page.goto(BASE + H.lessonUrl("si-funds"), { waitUntil: "networkidle" });
    const e = W("Inside a fund");
    await e.getByLabel("Amount held (USD)").fill("0");
    check("ETF: amount 0 → $0.00 fees, no NaN", /\$0\.00 in the first year/.test(await status(e)), await status(e));
    await e.getByLabel("Amount held (USD)").fill("1000000");
    check("ETF: $1,000,000 at 0.20% → $2,000.00 first year", /\$2,000\.00 in the first year/.test(await status(e)), await status(e));
  }

  // ── 3. Keyboard-only: Tab reaches every control in a widget, and arrow keys move radios
  {
    await page.goto(BASE + H.lessonUrl("fx-costs"), { waitUntil: "networkidle" });
    const w = W("What does this trade really cost?");
    const controls = await w.locator("input, select, button").count();
    await w.locator("input").first().focus();
    const seen = new Set();
    for (let k = 0; k < 60; k++) {
      const inside = await page.evaluate(() => { const a = document.activeElement; const f = a && a.closest("[data-widget]"); return f ? (a.id || a.name + ":" + a.value) : null; });
      if (inside) seen.add(inside);
      await page.keyboard.press("Tab");
    }
    // radios in a group take one Tab stop each group
    const groups = await w.locator("fieldset").count();
    const nonRadio = await w.locator("input:not([type=radio]), select, button").count();
    check(`keyboard: Tab reaches every slider and each radio group in the cost calculator (${seen.size} stops)`, seen.size >= nonRadio + groups, `seen ${seen.size}, want ≥ ${nonRadio + groups} of ${controls} controls`);
    const focusRing = await w.locator("label:has(input[type=radio])").first().evaluate((el) => { el.querySelector("input").focus(); return getComputedStyle(el).outlineStyle; });
    check("keyboard: a focused segmented choice shows an outline", focusRing !== "none", focusRing);
    const short = w.getByText("Short (sell EUR)");
    await w.locator("input[type=radio]").first().focus();
    await page.keyboard.press("ArrowRight");
    check("keyboard: ArrowRight in the Direction group selects Short", /Short EUR\/USD/.test(await status(w)), (await status(w)).slice(0, 60));
    void short;
  }

  // ── 4. Reduced motion: transitions are off
  {
    const r = await browser.newContext({ ...H.DESKTOP, reducedMotion: "reduce" });
    const p = await r.newPage();
    await H.unlockTracks(p); // Phase 2 step 1: tracks 2 and 3 unlock after Market Foundations is passed
    await p.goto(BASE + H.lessonUrl("fx-quotes"), { waitUntil: "networkidle" });
    const durs = await p.locator("[data-widget] [class*='motion-reduce']").evaluateAll((els) => els.map((e) => getComputedStyle(e).transitionDuration));
    check(`reduced motion: ${durs.length} animated elements all have 0s transitions`, durs.length > 0 && durs.every((d) => d.split(",").every((x) => parseFloat(x) < 0.001)), durs.slice(0, 5).join(" "));
    await r.close();
  }

  // ── 5. Margin simulator: pause/resume, settings mid-animation, navigate away mid-animation
  {
    const c = await browser.newContext(H.DESKTOP);
    await c.addInitScript(() => {
      const live = new Set();
      const si = window.setInterval, ci = window.clearInterval;
      window.setInterval = (...a) => { const id = si(...a); live.add(id); return id; };
      window.clearInterval = (id) => { live.delete(id); return ci(id); };
      window.__liveIntervals = () => live.size;
    });
    const p = await c.newPage();
    await H.unlockTracks(p); // Phase 2 step 1: tracks 2 and 3 unlock after Market Foundations is passed
    const plogs = []; H.watchConsole(p, plogs);
    await p.goto(BASE + H.lessonUrl("fx-leverage-margin"), { waitUntil: "networkidle" });
    const w = p.locator("[data-widget]", { hasText: "Leverage and margin simulator" });
    const moveVal = async () => w.getByRole("slider", { name: /Price move/ }).inputValue();
    const base = await p.evaluate(() => window.__liveIntervals());
    await w.getByRole("button", { name: /Play a falling market/ }).click();
    await p.waitForTimeout(400);
    await w.getByRole("button", { name: /Pause/ }).click();
    const paused1 = +(await moveVal());
    await p.waitForTimeout(500);
    const paused2 = +(await moveVal());
    check("margin sim: pause stops the price mid-way", paused1 < 0 && paused1 === paused2 && !/Stop-out/.test(await status(w)), `${paused1} → ${paused2}`);
    check("margin sim: no interval left running while paused", (await p.evaluate(() => window.__liveIntervals())) === base);
    await w.getByRole("button", { name: /Play a falling market/ }).click();
    await p.waitForTimeout(150);
    const resumed = +(await moveVal());
    check("margin sim: resume continues from the paused point (not from 0)", resumed <= paused2, `${paused2} → ${resumed}`);
    await p.waitForTimeout(3500);
    const end = await status(w);
    check("margin sim: resumed play ends in a stop-out", /Stop-out/.test(end), end.slice(0, 80));
    check("margin sim: play ends with no interval left", (await p.evaluate(() => window.__liveIntervals())) === base);
    // the stop-out readout should match: 0.2 lot 1:30 → 317 pips
    check("margin sim: stop-out distance 317 pips, margin call 133 (0.2 lot, 1:30, $1,000)", /317 pips/.test(await w.textContent()) && /Margin call after 133/.test(await w.textContent()));
    // changing leverage mid-animation
    await w.getByRole("button", { name: /Play a falling market/ }).click();
    await p.waitForTimeout(300);
    await w.getByText("1:100", { exact: true }).click();
    await p.waitForTimeout(300);
    const afterLev = +(await moveVal());
    check("margin sim: changing leverage mid-play stops and resets to 0", afterLev === 0 && /Play a falling market/.test(await w.textContent()), String(afterLev));
    // moving the position size slider mid-play
    await w.getByRole("button", { name: /Play a falling market/ }).click();
    await p.waitForTimeout(250);
    await w.getByRole("slider", { name: /Position size/ }).focus();
    await p.keyboard.press("ArrowRight");
    await p.waitForTimeout(300);
    check("margin sim: changing size mid-play stops and resets", +(await moveVal()) === 0 && (await p.evaluate(() => window.__liveIntervals())) === base);
    // dragging the move slider mid-play
    await w.getByRole("button", { name: /Play a falling market/ }).click();
    await p.waitForTimeout(250);
    await w.getByRole("slider", { name: /Price move/ }).focus();
    await p.keyboard.press("End");
    await p.waitForTimeout(300);
    check("margin sim: touching the move slider mid-play pauses at the user's value (+200)", +(await moveVal()) === 200 && /Play a falling market/.test(await w.textContent()), await moveVal());
    // 1:10 with a tiny size: stop-out lies beyond the slider's −500 pips
    await w.getByText("1:10", { exact: true }).click();
    await w.getByRole("slider", { name: /Position size/ }).focus(); await p.keyboard.press("Home");
    const r = await browser.newContext({ ...H.DESKTOP, reducedMotion: "reduce" });
    void r; await r.close();
    await w.getByRole("button", { name: /Play a falling market/ }).click();
    await p.waitForTimeout(4500);
    const farEnd = await status(w);
    const farMove = +(await moveVal());
    check("margin sim: 0.01 lot at 1:10 (stop-out ~9,450 pips) stops at −500 without a stop-out, with an explanation", farMove === -500 && !/Stop-out:/.test(farEnd) && /500|beyond|further|range/i.test(farEnd), `move ${farMove}; result: ${farEnd.slice(0, 160)}`);
    // navigate away mid-animation (client-side link) and with a full navigation
    await w.getByRole("button", { name: "Reset" }).click();
    await w.getByText("1:30", { exact: true }).click();
    await w.getByRole("button", { name: /Play a falling market/ }).click();
    await p.waitForTimeout(200);
    await p.locator("a[href='/academy']").first().click();
    await p.waitForURL(/\/academy$/);
    await p.waitForTimeout(800);
    check("margin sim: client-side navigation mid-play leaves no interval running", (await p.evaluate(() => window.__liveIntervals())) === base, String(await p.evaluate(() => window.__liveIntervals())));
    await p.goBack(); await p.waitForTimeout(500);
    await p.goto(BASE + "/", { waitUntil: "networkidle" });
    check("margin sim: no errors from navigating away mid-play", plogs.length === 0, plogs.slice(0, 3).join(" | "));
    await c.close();
  }

  // ── 6. Order book: many orders, drain a side, a limit across the spread
  {
    await page.goto(BASE + H.lessonUrl("si-exchanges"), { waitUntil: "networkidle" });
    const w = W("Send an order into the book");
    const send = () => w.getByRole("button", { name: "Send order" }).click();
    const qty = w.getByRole("slider", { name: "Shares" });
    // drain the asks: market buy 3,000 (asks total 2,800)
    await qty.focus(); await page.keyboard.press("End");
    await send();
    let t = await status(w);
    check("order book: market buy 3,000 vs 2,800 offered → 'Book ran out', 200 not filled", /Book ran out/.test(t) && /bought 2800/.test(t) && /remaining 200/.test(t), t);
    check("order book: empty ask side says 'No sellers left' and spread '—'", /No sellers left/.test(await w.textContent()) && /Spread —/.test(await w.textContent()));
    await send(); t = await status(w);
    check("order book: market buy into an empty side → nothing filled", /Nothing on the other side/.test(t), t);
    // limit buy with no sellers rests
    await w.getByText("Limit", { exact: true }).click();
    await send(); t = await status(w);
    check("order book: limit buy with no asks rests", /Resting/.test(t), t.slice(0, 80));
    // reset, then a limit buy across the spread: 1,000 @ 50.03 → 800 fill, 200 rest at 50.03
    await w.getByRole("button", { name: "Reset book" }).click();
    await qty.focus(); await page.keyboard.press("Home"); for (let k = 0; k < 9; k++) await page.keyboard.press("ArrowRight");
    const lim = w.getByRole("slider", { name: "Limit price" });
    await lim.focus(); await page.keyboard.press("Home"); for (let k = 0; k < 18; k++) await page.keyboard.press("ArrowRight"); // 49.85 + 0.18 = 50.03
    check("order book: limit slider reads $50.03", (await lim.getAttribute("aria-valuetext")) === "$50.03", await lim.getAttribute("aria-valuetext"));
    await send(); t = await status(w);
    check("order book: limit buy 1,000 @ $50.03 across the spread → 800 filled, 200 rest as a bid", /Partly filled/.test(t) && /bought 800/.test(t) && /other 200 now wait/.test(t), t);
    const book = await w.locator("ul[aria-label=Bids] li").first().textContent();
    check("order book: the new best bid is $50.03 × 200 and the spread is $0.02", /\$50\.03\s*200/.test(book) && /Spread \$0\.02/.test(await w.textContent()), book);
    // many orders: 40 alternating limit orders, the book must never cross
    let crossed = 0, errs = 0;
    const side = (s) => w.getByText(s, { exact: true }).click();
    for (let k = 0; k < 40; k++) {
      await side(k % 2 ? "Buy" : "Sell");
      await lim.focus(); await page.keyboard.press("Home");
      for (let j = 0; j < (k * 7) % 31; j++) await page.keyboard.press("ArrowRight");
      await send();
      const bb = await w.locator("ul[aria-label=Bids] li span.relative").first().textContent().catch(() => null);
      const ba = await w.locator("ul[aria-label=Asks] li span.relative").filter({ hasText: "$" }).last().textContent().catch(() => null);
      if (bb && ba && bb.startsWith("$") && ba.startsWith("$") && parseFloat(ba.slice(1)) <= parseFloat(bb.slice(1))) crossed++;
      if (BADTEXT.test(await status(w))) errs++;
    }
    check("order book: 40 mixed limit orders never leave a crossed book", crossed === 0 && errs === 0, `${crossed} crossed, ${errs} bad`);
    const rows = await w.locator("li").count();
    const h = await w.evaluate((el) => el.getBoundingClientRect().height);
    check(`order book: after many orders the book stays readable (${rows} rows, ${Math.round(h)}px tall)`, h < 2000, `${Math.round(h)}px`);
  }

  // ── 7. Index builder: hand-computed results, split and cap toggles
  {
    await page.goto(BASE + H.lessonUrl("si-index-calc"), { waitUntil: "networkidle" });
    const w = W("Index builder");
    const read = async () => (await w.locator("dl").first().textContent()) || "";
    let r = await read();
    // price: (20 − 0.8 + 0 + 0.6)/525 = +3.77%; float: 34/123 = +0.28%; equal: +1.00%
    check("index builder: start values price +3.77%, float +0.28%, equal +1.00%", /Price-weighted\+3\.77%/.test(r) && /Float-adjusted cap\+0\.28%/.test(r) && /Equal-weighted\+1\.00%/.test(r), r);
    await w.getByLabel(/4-for-1 share split/).check();
    r = await read();
    check("index builder: after the split price-weighted = 4.8/225 = +2.13%, others unchanged", /Price-weighted\+2\.13%/.test(r) && /Float-adjusted cap\+0\.28%/.test(r) && /Equal-weighted\+1\.00%/.test(r), r);
    await w.getByLabel(/4-for-1 share split/).uncheck();
    await w.getByLabel(/Cap any one member at 35%/).check();
    r = await read();
    // capped: birch .35, others × .65/75: (20×5 + 25×0 + 30×1)×.65/75 − .7 = 0.4267%
    check("index builder: cap at 35% → float-adjusted +0.43%", /Float-adjusted cap\+0\.43%/.test(r), r);
    const bars = await w.locator(".space-y-2 > div").allTextContents();
    check("index builder: with the cap Birch shows 35.0% and nothing exceeds it", bars.some((b) => /Birch Retail35\.0%/.test(b)) && bars.every((b) => parseFloat((b.match(/([\d.]+)%$/) || [0, 0])[1]) <= 35.05), bars.join(" | "));
    await w.getByText("Price-weighted", { exact: true }).last().click();
    const pbars = await w.locator(".space-y-2 > div").allTextContents();
    check("index builder: cap toggle does not change price-weighted bars (Alto 400/525 = 76.2%)", pbars.some((b) => /Alto Motors76\.2%/.test(b)), pbars.join(" | "));
    // all members to −10% → every method −10%
    for (const s of await w.getByRole("slider").all()) { await s.focus(); await page.keyboard.press("Home"); }
    r = await read();
    check("index builder: all members −10% → all methods −10.00%", (r.match(/−10\.00%/g) || []).length === 3, r);
  }

  // ── 8. Cost calculator triple swap labelling
  {
    await page.goto(BASE + H.lessonUrl("fx-costs"), { waitUntil: "networkidle" });
    const w = W("What does this trade really cost?");
    await w.getByText("Wed", { exact: true }).click();
    const hold = w.getByRole("slider", { name: "Hold for" });
    await hold.focus(); await page.keyboard.press("Home"); for (let k = 0; k < 5; k++) await page.keyboard.press("ArrowRight");
    const txt = await w.textContent();
    const st = await status(w);
    check("cost calc: Wed + 5 nights lists Wed ×3, Sat ×0, Sun ×0", /Wed ×3/.test(txt) && /Sat ×0/.test(txt) && /Sun ×0/.test(txt), (txt.match(/Rollovers:[^A-Z]*[^.]*/) || [""])[0]);
    check("cost calc: Wed + 5 nights still explains the Wednesday triple swap", /Wednesday rollover counts three days/.test(st), st.slice(-140));
    // default long: (2 − 4 − 0.5)% × 110,000 / 365 = −$7.53 per night
    await page.reload({ waitUntil: "networkidle" });
    const w2 = W("What does this trade really cost?");
    check("cost calc: default swap per night −$7.53", /Swap per night−\$7\.53/.test(await w2.textContent()));
  }

  // ── 9. Futures and corporate actions spot checks
  {
    await page.goto(BASE + H.lessonUrl("si-funds"), { waitUntil: "networkidle" });
    const w = W("Futures exposure and leverage");
    let t = await w.textContent();
    check("futures: default 5,000 × $50 = $250,000 notional, 10× leverage, −50 pts = −$2,500", /\$250,000/.test(t) && /10\.0×/.test(t) && /−\$2,500/.test(t), t.slice(0, 300));
    await w.getByText("$5 per point (micro style)").click();
    t = await w.textContent();
    check("futures: micro → $25,000 notional, $2,500 margin, still 10×, −$250", /\$25,000/.test(t) && /\$2,500/.test(t) && /10\.0×/.test(t) && /−\$250/.test(t), t.slice(0, 300));
  }

  check("desktop behaviour checks: no console errors", logs.length === 0, logs.slice(0, 4).join(" | "));
  await ctx.close();
  await browser.close();
  H.summary();
})().catch((e) => { console.error(e); process.exitCode = 2; });
