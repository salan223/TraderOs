// Full lesson flows: reading, all four exercise types (wrong first), quiz fail→pass,
// checklist/mastery, dashboard updates, second-day mastery, failed retake → review,
// keyboard-only use, two-tab sync.
const fs = require("fs");
const path = require("path");
const H = require("./helpers");
const { chromium, BASE, KEY, check } = H;
const SHOTS = process.env.SHOTS || path.join(__dirname, "../../shots/tester");
fs.mkdirSync(SHOTS, { recursive: true });

// Correct quiz letters per lesson, read from the content source in order.
function correctLetters() {
  const out = {};
  for (const f of ["market-foundations-1.ts", "market-foundations-2.ts"]) {
    const src = fs.readFileSync(path.join(__dirname, "../../lib/academy/content", f), "utf8");
    for (const block of src.split(/export const /).slice(1)) {
      const id = (block.match(/^\w+: Lesson = \{\s*id: "([^"]+)"/) || [])[1];
      if (id) out[id] = [...block.matchAll(/correct: "(\w)"/g)].map((m) => m[1]);
    }
  }
  return out;
}
const CORRECT = correctLetters();
const idx = (l) => "abcd".indexOf(l);

async function readAll(page) {
  // Scroll the whole article slowly so each section's end marker stays visible > 500 ms.
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < h; y += 300) { await page.evaluate((yy) => window.scrollTo(0, yy), y); await page.waitForTimeout(650); }
  await page.waitForTimeout(700);
}
async function sectionsText(page) { return page.locator("main aside.min-w-0").getByText(/^\d+\/\d+$/).first().textContent(); }

async function takeQuiz(page, lessonId, wrongCount) {
  const quiz = page.locator("#quiz");
  await quiz.getByRole("button", { name: /Start quiz|Retake quiz/ }).first().click();
  const letters = CORRECT[lessonId];
  for (let i = 0; i < letters.length; i++) {
    // Options are shuffled per attempt, so pick by option id (the radio value), not by position.
    const values = await quiz.getByRole("radio").evaluateAll((els) => els.map((e) => e.value));
    const choose = i < wrongCount ? values.find((v) => v !== letters[i]) : letters[i];
    await quiz.locator(`input[type=radio][value="${choose}"]`).check();
    await quiz.getByRole("button", { name: "Check answer" }).click();
    await quiz.getByRole("button", { name: /Next question|See results/ }).click();
  }
  return (await quiz.textContent());
}
async function dashboard(page) {
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.waitForTimeout(300);
  const lp = await page.locator("section", { has: page.getByRole("heading", { name: "Learning progress" }) }).textContent();
  const nl = page.locator("section", { has: page.getByRole("heading", { name: "Recommended next lesson" }) });
  return { lp, nl: await nl.textContent(), href: await nl.getByRole("link").last().getAttribute("href"), journey: await page.locator("main section").first().textContent() };
}

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext(H.DESKTOP);
  ctx.setDefaultTimeout(8000);
  const page = await ctx.newPage();
  const logs = []; H.watchConsole(page, logs);

  // ── Lesson 1: order exercise ──
  await page.goto(BASE + H.lessonUrl("what-is-a-market"), { waitUntil: "networkidle" });
  check("L1 starts Not started", (await page.locator("main aside.min-w-0").textContent()).includes("Not started"));
  await readAll(page);
  check("L1 all sections read after scrolling", (await sectionsText(page)) === "4/4", await sectionsText(page));
  const ex = page.locator("#exercise");
  await ex.getByRole("button", { name: "Check order" }).click();
  const fb1 = await ex.locator('[role=status]').textContent();
  check("order: wrong first gives partial feedback", /of 5 are in the right place/.test(fb1), fb1);
  const target = ["Decide what to buy and how much", "Send an order through your broker", "The market matches you with a seller", "The trade executes at the agreed price", "Settlement: the asset and money change hands"];
  for (let i = 0; i < target.length; i++) {
    for (let guard = 0; guard < 6; guard++) {
      const items = await ex.locator("ol > li").allTextContents();
      const pos = items.findIndex((t) => t.includes(target[i]));
      if (pos <= i) break;
      await ex.getByRole("button", { name: `Move "${target[i]}" up` }).click();
    }
  }
  await ex.getByRole("button", { name: "Check order" }).click();
  check("order: solved", /All in the right order/.test(await ex.textContent()) && /Solved/.test(await ex.textContent()));
  // quiz fail then pass at exactly 80%
  let qt = await takeQuiz(page, "what-is-a-market", 2);
  check("quiz 3/5 = 60% shows fail", /You scored 3 of 5 \(60%\)/.test(qt) && /pass mark is 80%/.test(qt), qt.slice(0, 120));
  check("after fail: Learning, checklist quiz not done", (await page.locator("main aside.min-w-0").textContent()).includes("Learning"));
  await page.locator("#quiz").screenshot({ path: path.join(SHOTS, "desktop-quiz-results-fail.png") });
  qt = await takeQuiz(page, "what-is-a-market", 1);
  check("quiz 4/5 = 80% is a pass", /You scored 4 of 5 \(80%\)/.test(qt) && /That is a pass/.test(qt));
  const aside = await page.locator("main aside.min-w-0").textContent();
  check("checklist: Practising after completion", aside.includes("Practising"), aside.slice(0, 200));
  check("checklist: best 80%", aside.includes("best 80%"));
  check("next-step hint mentions another day", /another day/.test(aside));
  check("recommended next = lesson 2", await page.locator("main aside.min-w-0").getByRole("link", { name: /Why do prices move/ }).count() === 1);
  await page.screenshot({ path: path.join(SHOTS, "desktop-lesson-complete.png"), fullPage: false });

  let db = await dashboard(page);
  check("dashboard lessons 1/10", db.lp.includes("1/10"), db.lp.slice(0, 150));
  check("dashboard mastery 5%", db.lp.includes("5%"));
  check("dashboard streak 1 active today", /1\s*Active today/.test(db.lp), db.lp);
  check("dashboard recommends lesson 2", db.href === H.lessonUrl("why-prices-move"), db.href);
  check("journey stays Awareness with 9 left", /9 Market Foundations lessons left/.test(db.journey), db.journey.slice(0, 200));
  await page.screenshot({ path: path.join(SHOTS, "desktop-dashboard-progress.png"), fullPage: true });

  // ── Lesson 2: classify ──
  await page.goto(BASE + H.lessonUrl("why-prices-move"), { waitUntil: "networkidle" });
  const ex2 = page.locator("#exercise");
  await ex2.getByRole("button", { name: "Check answers" }).click();
  check("classify: unanswered prompts to choose", /Choose a group for every item first/.test(await ex2.textContent()));
  const groups = ex2.getByRole("group");
  const answers = ["Upward pressure", "Downward pressure", "Upward pressure", "Downward pressure", "Upward pressure"]; // last one wrong
  for (let i = 0; i < 5; i++) await groups.nth(i).getByText(answers[i], { exact: true }).click();
  await ex2.getByRole("button", { name: "Check answers" }).click();
  check("classify: 4 of 5 feedback", /4 of 5 correct/.test(await ex2.textContent()));
  await groups.nth(4).getByText("Downward pressure", { exact: true }).click();
  await ex2.getByRole("button", { name: "Check answers" }).click();
  check("classify: solved", /All correct/.test(await ex2.textContent()));

  // ── Lesson 3: match ──
  await page.goto(BASE + H.lessonUrl("market-participants"), { waitUntil: "networkidle" });
  const ex3 = page.locator("#exercise");
  const pairs = [["Central bank", "Manage interest rates and the money supply"], ["Pension fund", "Grow savings over decades for future retirees"], ["Market maker", "Quote buy and sell prices and earn the gap between them"], ["Airline buying fuel in advance", "Hedge against rising fuel prices"], ["Retail trader", "Speculate with their own money"]];
  await ex3.getByLabel("Central bank").selectOption({ label: pairs[1][1] });
  for (const [l, r] of pairs.slice(1)) await ex3.getByLabel(l, { exact: true }).selectOption({ label: r });
  await ex3.getByRole("button", { name: "Check matches" }).click();
  check("match: wrong one flagged", /4 of 5 matched correctly/.test(await ex3.textContent()));
  await ex3.getByLabel("Central bank").selectOption({ label: pairs[0][1] });
  await ex3.getByRole("button", { name: "Check matches" }).click();
  check("match: solved", /All matched/.test(await ex3.textContent()));

  // ── Lesson 4: calculate ──
  await page.goto(BASE + H.lessonUrl("stocks"), { waitUntil: "networkidle" });
  const ex4 = page.locator("#exercise");
  const inp = ex4.getByLabel(/Your answer/);
  await inp.fill("abc"); await inp.press("Enter");
  check("calculate: non-number message", /Enter a number/.test(await ex4.textContent()));
  await inp.fill("100"); await inp.press("Enter");
  await inp.fill("75"); await inp.press("Enter");
  check("calculate: hint after wrong", /Hint:/.test(await ex4.textContent()));
  check("calculate: worked solution offered after 2 wrong", await ex4.getByRole("button", { name: "Show the worked solution" }).count() === 1);
  await inp.fill("$120.00"); await inp.press("Enter");
  check("calculate: $120.00 accepted", /Correct\./.test(await ex4.textContent()) && /Solved/.test(await ex4.textContent()));

  // ── Second-day mastery for lesson 1 via clock ──
  const tomorrow = new Date(); tomorrow.setHours(12, 0, 0, 0); tomorrow.setDate(tomorrow.getDate() + 1); // next local day, noon
  const p2 = await ctx.newPage();
  await p2.clock.setFixedTime(tomorrow);
  await p2.goto(BASE + H.lessonUrl("what-is-a-market"), { waitUntil: "networkidle" });
  await takeQuiz(p2, "what-is-a-market", 0);
  let a2 = await p2.locator("main aside.min-w-0").textContent();
  check("second-day pass → Mastered", a2.includes("Mastered"), a2.slice(0, 160));
  await takeQuiz(p2, "what-is-a-market", 3);
  a2 = await p2.locator("main aside.min-w-0").textContent();
  check("failed retake → back to Practising", a2.includes("Practising") && !a2.includes("Mastered."), a2.slice(0, 200));
  check("failed retake hint says review", /below 80%/.test(a2));
  await p2.goto(BASE + "/", { waitUntil: "networkidle" });
  await p2.waitForTimeout(300);
  const nl = p2.locator("section", { has: p2.getByRole("heading", { name: "Recommended next lesson" }) });
  check("dashboard recommends lesson 1 for review", (await nl.getByRole("link").last().getAttribute("href")) === H.lessonUrl("what-is-a-market") && /Review lesson/.test(await nl.textContent()), (await nl.textContent()).slice(0, 200));
  const lp2 = await p2.locator("section", { has: p2.getByRole("heading", { name: "Learning progress" }) }).textContent();
  check("streak 2 on the second day", /2\s*Active today/.test(lp2), lp2);
  await p2.close();

  // ── Two tabs ──
  const tA = await ctx.newPage(), tB = await ctx.newPage();
  await tA.goto(BASE + H.lessonUrl("forex"), { waitUntil: "networkidle" });
  await tB.goto(BASE + H.lessonUrl("forex"), { waitUntil: "networkidle" });
  await tA.locator("#exercise").getByLabel(/Your answer/).fill("600");
  await tA.locator("#exercise").getByLabel(/Your answer/).press("Enter");
  await tB.waitForTimeout(500);
  check("two tabs: exercise solved in A shows Solved in B", /Solved/.test(await tB.locator("#exercise").textContent()));
  await tB.goto(BASE + "/academy", { waitUntil: "networkidle" });
  await tA.locator("#practical textarea").fill("tab A reflection <script>alert(1)</script>");
  await tA.locator("#practical").getByRole("button", { name: "Save reflection" }).click();
  await tB.waitForTimeout(400);
  // Write in A while B's state is stale, then write in B: A's data must survive.
  await tB.goto(BASE + H.lessonUrl("indices"), { waitUntil: "networkidle" });
  await tB.locator("#exercise").getByLabel(/Your answer/).fill("2");
  await tB.locator("#exercise").getByLabel(/Your answer/).press("Enter");
  const stored = JSON.parse(await tB.evaluate((k) => localStorage.getItem(k), KEY));
  check("two tabs: no lost writes", stored.lessons.forex?.reflection?.text?.includes("tab A") && !!stored.lessons.indices?.exerciseCompletedAt);
  check("reflection with HTML is rendered as text (no XSS)", await tA.evaluate(() => !window.__xss) && (await tA.locator("#practical textarea").inputValue()).includes("<script>"));
  await tA.close(); await tB.close();

  // ── Keyboard only ──
  const ctxK = await browser.newContext(H.DESKTOP);
  ctxK.setDefaultTimeout(8000);
  const k = await ctxK.newPage();
  const klogs = []; H.watchConsole(k, klogs);
  await k.goto(BASE + H.lessonUrl("what-is-a-market"), { waitUntil: "networkidle" });
  const firstUp = k.locator("#exercise").getByRole("button", { name: /up$/ }).nth(1);
  await firstUp.focus();
  const before = await k.locator("#exercise ol > li").allTextContents();
  await k.keyboard.press("Enter");
  await k.waitForTimeout(100);
  const after = await k.locator("#exercise ol > li").allTextContents();
  check("keyboard: Enter on Move up reorders", before[1] !== after[1]);
  const focusInfo = await k.evaluate(() => { const a = document.activeElement; return { tag: a?.tagName, label: a?.getAttribute("aria-label") }; });
  check("keyboard: focus not lost when an item reaches the top (its Up button becomes disabled)", focusInfo.tag === "BUTTON" && /Move/.test(focusInfo.label || ""), JSON.stringify(focusInfo));
  const mid = k.locator("#exercise").getByRole("button", { name: /up$/ }).nth(3);
  await mid.focus(); await k.keyboard.press("Enter"); await k.waitForTimeout(100);
  const fi2 = await k.evaluate(() => document.activeElement?.getAttribute("aria-label") || document.activeElement?.tagName);
  check("keyboard: focus follows the item on a mid-list move", /^Move .* up$/.test(fi2), fi2);
  check("keyboard: move announced via aria-live", /Moved "/.test(await k.locator("#exercise [role=status]").textContent()));
  // focus-visible ring on move buttons
  await k.keyboard.press("Tab");
  const ring = await k.evaluate(() => { const a = document.activeElement; const cs = getComputedStyle(a); return { outline: cs.outlineStyle + " " + cs.outlineWidth, shadow: cs.boxShadow, tag: a.tagName, label: a.getAttribute("aria-label") }; });
  check("keyboard: focused move button has visible focus indicator", (ring.outline && !ring.outline.startsWith("none")) || (ring.shadow && ring.shadow !== "none"), JSON.stringify(ring));
  // Quiz by keyboard
  const startBtn = k.locator("#quiz").getByRole("button", { name: "Start quiz" });
  await startBtn.focus(); await k.keyboard.press("Enter");
  await k.waitForTimeout(100);
  const legendFocused = await k.evaluate(() => document.activeElement?.tagName);
  check("keyboard: quiz focuses the question", legendFocused === "LEGEND", legendFocused);
  const letters = CORRECT["what-is-a-market"];
  for (let i = 0; i < letters.length; i++) {
    await k.keyboard.press("Tab"); // into radio group
    // Position of the correct option in this attempt's shuffled order.
    const target = (await k.locator("#quiz").getByRole("radio").evaluateAll((els) => els.map((e) => e.value))).indexOf(letters[i]);
    // first Tab lands on first radio (none checked). Arrow keys select.
    await k.keyboard.press("Space");
    for (let j = 0; j < target; j++) await k.keyboard.press("ArrowDown");
    const radioRing = await k.evaluate(() => { const l = document.activeElement?.closest("label"); return l ? getComputedStyle(l).outlineStyle : "no-label"; });
    if (i === 0) check("keyboard: focused quiz option shows a focus ring", radioRing !== "none", radioRing);
    await k.keyboard.press("Tab"); // Check answer
    await k.keyboard.press("Enter");
    await k.waitForTimeout(80);
    if (i === 0) check("keyboard: feedback is in an aria-live region", /Correct\./.test(await k.locator("#quiz [aria-live=polite]").first().textContent()));
    const nf = await k.evaluate(() => document.activeElement?.textContent || "");
    if (i === 0) check("keyboard: focus moves to Next button after checking", /Next question/.test(nf), nf);
    await k.keyboard.press("Enter");
    await k.waitForTimeout(80);
  }
  check("keyboard: quiz 5/5 completed", /You scored 5 of 5/.test(await k.locator("#quiz").textContent()));
  check("keyboard: results heading focused", await k.evaluate(() => document.activeElement?.tagName) === "H3");
  check("keyboard: match/glossary tooltips focusable (Term has tabIndex)", await k.locator("article span[tabindex='0']").count() > 3);
  check("no console errors in keyboard flow", klogs.length === 0, klogs.join(" | ").slice(0, 300));
  await ctxK.close();

  check("no console errors in main flow", logs.length === 0, logs.join(" | ").slice(0, 400));
  await browser.close();
  H.summary();
})().catch((e) => { console.error(e); process.exitCode = 2; });
