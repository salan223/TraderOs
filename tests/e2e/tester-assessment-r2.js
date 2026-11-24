// Tester round 2 probes for the assessment rework: learner seed across tabs and reset, stale-draft
// validation, attempt-linked remediation under clock skew, variant rotation, the pool-exhaustion
// notice on the 5th attempt, and the practice-retake UX after a pass.
// Run with: NODE_PATH=$(npm root -g) node tests/e2e/tester-assessment-r2.js   (server on BASE, default http://localhost:3300)
const fs = require("fs");
const path = require("path");
const H = require("./helpers");
const { chromium, BASE, KEY, check, summary } = H;
const MF = H.BANKS["market-foundations"];
const N1 = MF.concepts.length;
const qOf = (bank, id) => bank.questions.find((q) => q.id === id);
const stored = (p) => p.evaluate((k) => JSON.parse(localStorage.getItem(k) || "null"), KEY);
const rawStored = (p) => p.evaluate(() => JSON.stringify(Object.fromEntries(Object.keys(localStorage).sort().map((k) => [k, localStorage.getItem(k)]))));
const SHOTS = process.env.SHOTS || "/tmp/claude-0/tester-shots";
fs.mkdirSync(SHOTS, { recursive: true });

function rightAnswer(item) {
  switch (item.kind) {
    case "single": return item.correct;
    case "scenario": return item.options.find((o) => o.process === "sound").id;
    case "true-false": return String(item.answer);
    case "numeric": return item.answer;
    case "multi-select": return item.correct;
    case "find-error": return item.lines.filter((l) => l.error).map((l) => l.id);
    case "chart-annotate": return item.target.value;
  }
}
function wrongAnswer(item) {
  switch (item.kind) {
    case "single": return item.options.find((o) => o.id !== item.correct).id;
    case "scenario": return item.options.find((o) => o.process === "unsound").id;
    case "true-false": return String(!item.answer);
    case "numeric": return item.answer + 1000;
    case "multi-select": return [item.options.find((o) => !item.correct.includes(o.id)).id];
    case "find-error": return [item.lines.find((l) => !l.error).id];
    case "chart-annotate": return item.target.value + item.target.tolerance * 20;
  }
}
async function answer(page, item, value) {
  const box = page.locator("[data-question-id]");
  switch (item.kind) {
    case "single": case "scenario": case "true-false":
      await box.locator(`[data-option="${value}"]`).click(); break;
    case "multi-select": case "find-error":
      for (const id of value) await box.locator(`[data-option="${id}"]`).click(); break;
    case "numeric":
      await box.locator("input[inputmode=decimal]").fill(String(value)); break;
    case "chart-annotate": {
      const svg = box.locator("[data-chart-annotate]");
      await svg.focus();
      const step = 10 ** -item.decimals;
      for (let i = 0; i < 400; i++) {
        const now = Number(await svg.getAttribute("aria-valuenow")) || item.series[item.series.length - 1];
        if (Math.abs(now - value) <= step / 2 + 1e-9 || (i > 0 && Math.abs(now - value) <= item.target.tolerance / 4)) break;
        await page.keyboard.press(now > value ? "ArrowDown" : "ArrowUp");
      }
      break;
    }
  }
}
/** Answer every question; stop before submitting when opts.noSubmit. */
async function answerAll(page, bank, wrongConcepts = [], opts = {}) {
  const ids = [];
  for (let n = 0; n < 40; n++) {
    await page.locator("[data-question-id]").waitFor();
    const id = await page.locator("[data-question-id]").getAttribute("data-question-id");
    if (ids.includes(id)) break;
    const q = qOf(bank, id);
    const isLast = !(await page.locator("[data-next-question]").count());
    if (opts.skipLast && isLast) { ids.push(id); break; }
    ids.push(id);
    await answer(page, q.item, wrongConcepts.includes(q.concept) ? wrongAnswer(q.item) : rightAnswer(q.item));
    if (isLast) break;
    await page.locator("[data-next-question]").click();
  }
  return ids;
}
async function submit(page) {
  await page.locator("[data-review-submit]").click();
  await page.locator("[data-confirm-submit]").click();
  await page.locator("[data-results]").waitFor();
}
async function practise(page, conceptId, bank) {
  const c = bank.concepts.find((x) => x.id === conceptId);
  const card = page.locator(`[data-remediation="${conceptId}"]`);
  // (Programmer, step-1 rework: remediation now rotates between variants each time a concept is
  // missed again (LOW 7), so the helper answers the variant the card shows, not always variant 0.)
  const vi = Number(await card.getAttribute("data-remediation-variant")) || 0;
  const item = [c.remediation, ...(c.moreRemediation || [])][vi].practice;
  const v = rightAnswer(item);
  if (item.kind === "numeric") await card.locator("input[inputmode=decimal]").fill(String(v));
  else if (Array.isArray(v)) for (const id of v) await card.locator(`[data-option="${id}"]`).click();
  else await card.locator(`[data-option="${v}"]`).click();
  await card.getByRole("button", { name: "Check answer" }).click();
  await page.waitForFunction((id) => document.querySelector(`[data-remediation="${id}"]`)?.getAttribute("data-done") === "true", conceptId);
}
const safety = MF.concepts.find((c) => c.safetyCritical).id;
const plain = MF.concepts.find((c) => !c.safetyCritical && !c.critical && !c.applied).id;
const pools = Object.fromEntries(MF.concepts.map((c) => [c.id, MF.questions.filter((q) => q.concept === c.id)]));
const itemFor = (q, ok) => {
  const c = MF.concepts.find((x) => x.id === q.concept);
  const it = { q: q.id, c: c.id, ok };
  if (c.safetyCritical) it.safety = true;
  if (c.critical || c.safetyCritical) it.critical = true;
  if (c.applied) it.applied = true;
  return it;
};
/** An attempt using question k of every pool, with `wrong` concepts wrong. */
const poolAttempt = (k, iso, wrong = []) => ({ at: iso, items: MF.concepts.map((c) => itemFor(pools[c.id][k], !wrong.includes(c.id))) });
const pageErrors = [];

(async () => {
  const browser = await chromium.launch();
  const errors = [];
  const newPage = async (opts = H.DESKTOP, ctxOpts = {}) => {
    const ctx = await browser.newContext({ ...opts, ...ctxOpts });
    ctx.setDefaultTimeout(10000);
    const p = await ctx.newPage();
    H.watchConsole(p, errors);
    p.on("pageerror", (e) => pageErrors.push(e.message));
    return { ctx, page: p };
  };
  const seedMF = (extra = {}) => H.seedState({ complete: ["market-foundations"], noExam: ["market-foundations"], iso: new Date(Date.now() - 86400_000).toISOString(), extra });

  // ── 1. Learner seed: two tabs start at once; reset drops it ────────────────
  {
    const { ctx, page: a } = await newPage();
    await a.goto(BASE + "/", { waitUntil: "domcontentloaded" });
    await H.writeState(a, seedMF());
    const b = await ctx.newPage();
    b.on("pageerror", (e) => pageErrors.push(e.message));
    await a.goto(BASE + H.assessmentUrl("market-foundations"), { waitUntil: "networkidle" });
    await b.goto(BASE + H.assessmentUrl("market-foundations"), { waitUntil: "networkidle" });
    // Tab B's button can vanish mid-click when tab A's start reaches it by a storage event; that is fine.
    await Promise.all([a.locator("[data-start-assessment]").click(), b.locator("[data-start-assessment]").click({ timeout: 3000 }).catch(() => {})]);
    await a.locator("[data-question-id]").waitFor();
    await b.locator("[data-question-id]").waitFor();
    await a.waitForTimeout(500);
    const st = (await stored(a)).assessments["market-foundations"];
    const qa = await a.locator("[data-question-id]").getAttribute("data-question-id");
    const qb = await b.locator("[data-question-id]").getAttribute("data-question-id");
    check("two tabs start together: one stored seed, one draft, both tabs on the same question", typeof st.seed === "string" && st.seed.length >= 4 && st.draft && qa === qb && qa === st.draft.questionIds[0], `${st.seed} ${qa} ${qb}`);
    const seed1 = st.seed, draw1 = st.draft.questionIds.join();
    await answerAll(a, MF, []);
    await submit(a);
    await b.waitForTimeout(600);
    check("seed unchanged after submitting", (await stored(b)).assessments["market-foundations"].seed === seed1);
    // Reset in tab A; tab B (stale view) does not resurrect the old seed.
    await a.goto(BASE + "/settings", { waitUntil: "networkidle" });
    await a.getByRole("button", { name: "Reset Academy progress" }).click();
    await a.getByRole("button", { name: "Yes, reset" }).click();
    await b.waitForTimeout(800);
    const afterReset = await stored(b);
    check("reset: the seed is gone in both tabs", !afterReset?.assessments?.["market-foundations"]?.seed);
    await H.writeState(a, { ...seedMF(), resetAt: afterReset?.resetAt });
    await a.goto(BASE + H.assessmentUrl("market-foundations"), { waitUntil: "networkidle" });
    await a.locator("[data-start-assessment]").click();
    await a.locator("[data-question-id]").waitFor();
    const st2 = (await stored(a)).assessments["market-foundations"];
    check("after reset: a new seed is drawn", st2.seed && st2.seed !== seed1, `${seed1} → ${st2.seed}`);
    console.log(`   info: first draw ${draw1 === st2.draft.questionIds.join() ? "identical" : "different"} after reseed`);
    // Second learner (fresh context) gets a different seed.
    const { ctx: c2, page: p2 } = await newPage();
    await p2.goto(BASE + "/", { waitUntil: "domcontentloaded" });
    await H.writeState(p2, seedMF());
    await p2.goto(BASE + H.assessmentUrl("market-foundations"), { waitUntil: "networkidle" });
    await p2.locator("[data-start-assessment]").click();
    await p2.locator("[data-question-id]").waitFor();
    const other = (await stored(p2)).assessments["market-foundations"];
    check("another learner: different seed and a different first draw", other.seed !== st2.seed && other.draft.questionIds.join() !== st2.draft.questionIds.join());
    await c2.close();
    await ctx.close();
  }

  // ── 2. Stale drafts ─────────────────────────────────────────────────────────
  {
    const { ctx, page } = await newPage(H.PHONE);
    await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
    const full = MF.concepts.map((c) => pools[c.id][0].id);
    const now = new Date(Date.now() - 60_000).toISOString();
    const drafts = {
      "unknown ids only": ["no-such-q", "also-gone"],
      "one concept missing": full.slice(1),
      "duplicate concept": [...full.slice(1), pools[MF.concepts[1].id][1].id],
      "valid plus an unknown id": [...full, "no-such-q"],
    };
    for (const [name, ids] of Object.entries(drafts)) {
      const before = pageErrors.length;
      await H.writeState(page, seedMF({ assessments: { "market-foundations": { attempts: [], remediation: {}, draft: { startedAt: now, questionIds: ids, answers: { [ids[0]]: "a" }, reusedConcepts: [] } } } }));
      await page.goto(BASE + H.assessmentUrl("market-foundations"), { waitUntil: "networkidle" });
      await page.locator("[data-stale-draft]").first().waitFor({ timeout: 5000 }).catch(() => {});
      const s = (await stored(page)).assessments["market-foundations"];
      check(`stale draft (${name}): out-of-date notice, draft discarded with a tombstone, no crash`, (await page.locator("[data-stale-draft]").count()) > 0 && !s.draft && !!s.draftClearedAt && pageErrors.length === before, `${pageErrors.slice(before).join("|")} draft=${!!s.draft}`);
      if (name === "duplicate concept") await page.screenshot({ path: path.join(SHOTS, "r2-stale-draft-phone.png") });
      await page.locator("[data-start-assessment]").click();
      await page.locator("[data-question-id]").waitFor();
      const s2 = (await stored(page)).assessments["market-foundations"];
      check(`stale draft (${name}): Start gives a fresh full draw`, s2.draft && s2.draft.questionIds.length === MF.concepts.length && (await page.locator("[data-stale-draft]").count()) === 0);
    }
    await ctx.close();
  }

  // ── 3. Clock skew (Playwright fake clock) ───────────────────────────────────
  {
    const { ctx, page } = await newPage();
    const T = new Date(Date.now() + 2 * 3600_000); // stay ahead of the seeded lesson stamps
    await page.clock.install({ time: T });
    await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
    await H.writeState(page, seedMF());
    await page.goto(BASE + H.assessmentUrl("market-foundations"), { waitUntil: "networkidle" });
    await page.locator("[data-start-assessment]").click();
    await answerAll(page, MF, [safety]);
    await submit(page);
    await page.locator("[data-retest-locked]").waitFor();
    // The device clock is corrected backwards by 90 minutes.
    await page.clock.setSystemTime(new Date(T.getTime() - 90 * 60_000));
    await page.reload({ waitUntil: "networkidle" });
    await page.locator("[data-results]").waitFor().catch(() => {});
    const visible = (await page.locator("[data-results]").count()) > 0 || (await page.locator("[data-retest-locked]").count()) > 0;
    check("clock moved back 90 min: the failed attempt (now 'in the future') is still shown", visible);
    if (await page.locator(`[data-remediation="${safety}"]`).count()) {
      await practise(page, safety, MF);
      await page.locator("[data-start-retest]").waitFor({ timeout: 5000 }).catch(() => {});
      check("clock moved back: remediation recorded afterwards unlocks the retest", (await page.locator("[data-start-retest]").count()) === 1);
    } else {
      check("clock moved back: remediation card available", false, (await page.locator("main").textContent()).slice(0, 200));
    }
    // A remediation stamped a day in the future (edited data) does not count.
    await page.clock.setSystemTime(new Date(T.getTime() + 10 * 60_000));
    const st = await stored(page);
    const a = st.assessments["market-foundations"];
    a.remediation[safety] = new Date(T.getTime() + 86400_000).toISOString();
    await page.evaluate(([k, v]) => localStorage.setItem(k, v), [KEY, JSON.stringify(st)]);
    await page.reload({ waitUntil: "networkidle" });
    await page.locator("[data-results]").waitFor();
    check("remediation stamped a day ahead: retest locked again, card not done", (await page.locator("[data-retest-locked]").count()) === 1 && (await page.locator(`[data-remediation="${safety}"]`).getAttribute("data-done")) === "false");
    await ctx.close();
  }

  // ── 3b. KNOWN BUG: clock moved back hides the failed attempt, so the retest unlocks unremediated ─
  {
    const { ctx, page } = await newPage();
    const T = new Date(Date.now() + 2 * 3600_000);
    await page.clock.install({ time: T });
    await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
    await H.writeState(page, seedMF({ assessments: { "market-foundations": { attempts: [poolAttempt(0, new Date(T.getTime() - 60_000).toISOString(), [safety])], remediation: {}, draft: null, seed: "abcd1234" } } }));
    await page.goto(BASE + H.assessmentUrl("market-foundations"), { waitUntil: "networkidle" });
    const lockedAtT = (await page.locator("[data-retest-locked]").count()) === 1;
    await page.clock.setSystemTime(new Date(T.getTime() - 90 * 60_000));
    await page.reload({ waitUntil: "networkidle" });
    await page.locator("[data-results]").waitFor();
    check("clock moved back 90 min, nothing remediated: retest stays locked (fixed in round 3)", lockedAtT && (await page.locator("[data-start-retest]").count()) === 0, `start-retest visible=${await page.locator("[data-start-retest]").count()}`);
    await ctx.close();
  }

  // ── 3c. KNOWN BUG (round 3): clock moved back, remediate, fail again, RELOAD → retest unlocks ─
  {
    const { ctx, page } = await newPage();
    const T = new Date(Date.now() + 2 * 3600_000);
    await page.clock.install({ time: new Date(T.getTime() - 70 * 60_000) });
    await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
    const a1 = poolAttempt(0, new Date(T.getTime() - 60_000).toISOString(), [safety]); // failed before the clock moved back
    const a2 = poolAttempt(1, new Date(T.getTime() - 80 * 60_000).toISOString(), [safety]); // retest failed after it
    await H.writeState(page, seedMF({ assessments: { "market-foundations": { attempts: [a1, a2], remediation: { [safety]: new Date(T.getTime() - 85 * 60_000).toISOString() }, remediationFor: { [safety]: a1.at }, draft: null, seed: "abcd1234" } } }));
    await page.goto(BASE + H.assessmentUrl("market-foundations"), { waitUntil: "networkidle" });
    await page.locator("[data-results]").waitFor();
    check("[KNOWN BUG] clock moved back, retest failed again, after a reload: retest stays locked until the new remediation", (await page.locator("[data-start-retest]").count()) === 0, `start-retest visible=${await page.locator("[data-start-retest]").count()}`);
    await ctx.close();
  }

  // ── 4. Variant rotation and the 5th-attempt exhaustion notice ───────────────
  {
    const { ctx, page } = await newPage();
    await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
    await H.writeState(page, seedMF());
    await page.goto(BASE + H.assessmentUrl("market-foundations"), { waitUntil: "networkidle" });
    const prompts = [];
    for (let k = 0; k < 2; k++) {
      await page.locator("[data-start-assessment], [data-start-retest]").first().click();
      await answerAll(page, MF, [safety]);
      await submit(page);
      const card = page.locator(`[data-remediation="${safety}"]`);
      prompts.push([await card.getAttribute("data-remediation-variant"), (await card.textContent()).replace(/\s+/g, " ")]);
      if (k === 0) await practise(page, safety, MF);
    }
    check("variant rotation: 1st miss shows variant 0, 2nd miss variant 1, with different text", prompts[0][0] === "0" && prompts[1][0] === "1" && prompts[0][1] !== prompts[1][1], prompts.map((p) => p[0]).join(","));
    await page.screenshot({ path: path.join(SHOTS, "r2-remediation-variant1-desktop.png"), fullPage: true });

    // Pool exhaustion: 4 earlier failed attempts, one per pool position, remediation done for the last.
    const t = (m) => new Date(Date.now() - 86400_000 + m * 60_000).toISOString();
    const atts = [0, 1, 2, 3].map((k) => poolAttempt(k, t(10 + k * 10), [safety]));
    await H.writeState(page, seedMF({ assessments: { "market-foundations": { attempts: atts, remediation: { [safety]: t(50) }, remediationFor: { [safety]: atts[3].at }, draft: null, seed: "fixedseed1" } } }));
    await page.goto(BASE + H.assessmentUrl("market-foundations"), { waitUntil: "networkidle" });
    await page.locator("[data-start-retest]").waitFor();
    const note = page.locator("[data-reuse-notice]");
    check("5th attempt: reuse notice shown and says every concept", (await note.count()) === 1 && /every concept/.test(await note.textContent()), (await note.count()) ? await note.textContent() : "none");
    await page.locator("[data-start-retest]").click();
    await page.locator("[data-question-id]").waitFor();
    const d = (await stored(page)).assessments["market-foundations"].draft;
    const firstSeen = atts.map((x) => x.items.map((i) => i.q)).flat();
    check("5th attempt: all questions are repeats from attempt 1 (oldest seen), marked as seen", d.questionIds.every((id) => atts[0].items.some((i) => i.q === id)) && d.reusedConcepts.length === MF.concepts.length && /seen this question before/i.test(await page.locator("[data-question-id]").textContent()));
    await page.screenshot({ path: path.join(SHOTS, "r2-reuse-question-desktop.png") });
    check("5th attempt: draft only uses known questions", d.questionIds.every((id) => firstSeen.includes(id)));
    await ctx.close();
  }

  // ── 5. Practice retake UX after a pass ──────────────────────────────────────
  {
    const { ctx, page } = await newPage(H.PHONE);
    await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
    await H.writeState(page, seedMF());
    await page.goto(BASE + H.assessmentUrl("market-foundations"), { waitUntil: "networkidle" });
    await page.locator("[data-start-assessment]").click();
    await answerAll(page, MF, [plain]);
    await submit(page);
    check("pass at 92% (floored display)", /Mastery score: 92%/.test(await page.locator("[data-assessment-passed]").textContent()));
    await page.getByRole("button", { name: "Practice retake" }).click();
    await answerAll(page, MF, MF.concepts.map((c) => c.id));
    await submit(page);
    const passed = page.locator("[data-assessment-passed]");
    check("failed practice retake: pass and mastery still shown", (await passed.count()) === 1 && /Mastery score: 92%/.test(await passed.textContent()));
    check("failed practice retake: labelled as practice, not a pass", /practice retake \(0 of 14, 0%, not a pass\)/i.test(await page.locator("[data-practice-result]").textContent()));
    check("failed practice retake: no retest lock; remediation optional; Practice retake still offered", (await page.locator("[data-retest-locked]").count()) === 0 && (await page.getByRole("button", { name: "Practice retake" }).isEnabled()));
    const summaryText = (await page.locator("[data-results]").textContent()).replace(/\s+/g, " ");
    check("failed practice retake: summary at top does not shout 'Not passed' without context", !/Not passed/.test(summaryText) || /practice/i.test(summaryText), summaryText.slice(0, 160));
    await page.screenshot({ path: path.join(SHOTS, "r2-practice-retake-phone.png"), fullPage: true });
    // Review is collapsed and below the remediation.
    const order = await page.evaluate(() => {
      const r = document.querySelector("[data-remediation]"), v = document.querySelector("[data-results-review]");
      return { reviewOpen: v?.hasAttribute("open"), remFirst: r && v ? !!(r.compareDocumentPosition(v) & Node.DOCUMENT_POSITION_FOLLOWING) : null };
    });
    check("results: per-question review collapsed and placed after remediation", order.reviewOpen === false && order.remFirst === true, JSON.stringify(order));
    const hs = await H.noHScroll(page);
    check("phone: no horizontal scroll on the practice-retake result", hs.over <= 0, hs.culprit || "");
    await page.getByRole("button", { name: "Practice retake" }).click();
    await page.locator("[data-question-id]").waitFor();
    check("another practice retake starts immediately", true);
    await ctx.close();
  }

  // ── 6. Desktop screenshots of a fail with the new layout ────────────────────
  {
    const { ctx, page } = await newPage();
    await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
    await H.writeState(page, seedMF());
    await page.goto(BASE + H.assessmentUrl("market-foundations"), { waitUntil: "networkidle" });
    await page.locator("[data-start-assessment]").click();
    await answerAll(page, MF, [safety, plain]);
    await submit(page);
    await page.screenshot({ path: path.join(SHOTS, "r2-results-fail-desktop.png"), fullPage: true });
    await ctx.close();
    const ph = await newPage(H.PHONE);
    await ph.page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
    await H.writeState(ph.page, seedMF());
    await ph.page.goto(BASE + H.assessmentUrl("market-foundations"), { waitUntil: "networkidle" });
    await ph.page.locator("[data-start-assessment]").click();
    await answerAll(ph.page, MF, [safety, plain]);
    await submit(ph.page);
    await ph.page.screenshot({ path: path.join(SHOTS, "r2-results-fail-phone.png"), fullPage: true });
    await ph.ctx.close();
  }

  check("no console errors", errors.length === 0, errors.slice(0, 3).join(" | "));
  check("no uncaught page errors", pageErrors.length === 0, pageErrors.slice(0, 3).join(" | "));
  await browser.close();
  summary();
})().catch((e) => { console.error(e); summary(); process.exit(1); });
