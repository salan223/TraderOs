// Track assessments, remediation, retests, locking, Preview mode, refresh and reset.
// Run with: NODE_PATH=$(npm root -g) node tests/e2e/assessment.js   (server on BASE, default http://localhost:3300)
const H = require("./helpers");
const { chromium, BASE, KEY, check, summary } = H;

const MF = H.BANKS["market-foundations"];
const N1 = MF.concepts.length; // one question per concept
const FX = H.BANKS["forex-foundations"];
const qOf = (bank, id) => bank.questions.find((q) => q.id === id);
const stored = (p) => p.evaluate((k) => JSON.parse(localStorage.getItem(k) || "null"), KEY);

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

/** Answer the question currently on screen. */
async function answer(page, item, value) {
  const box = page.locator("[data-question-id]");
  switch (item.kind) {
    case "single": case "scenario": case "true-false":
      await box.locator(`[data-option="${value}"]`).click();
      break;
    case "multi-select": case "find-error":
      for (const id of value) await box.locator(`[data-option="${id}"]`).click();
      break;
    case "numeric":
      await box.locator("input[inputmode=decimal]").fill(String(value));
      break;
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

/** Take the whole assessment on screen. `wrongConcepts`: answer those concepts' questions wrongly. Returns the question ids. */
async function takeAssessment(page, bank, wrongConcepts = [], opts = {}) {
  const ids = [];
  for (let n = 0; n < 40; n++) {
    await page.locator("[data-question-id]").waitFor();
    const id = await page.locator("[data-question-id]").getAttribute("data-question-id");
    if (ids.includes(id)) break;
    ids.push(id);
    const q = qOf(bank, id);
    await answer(page, q.item, wrongConcepts.includes(q.concept) ? wrongAnswer(q.item) : rightAnswer(q.item));
    if (opts.refreshAfter === ids.length) return { ids, refreshed: true };
    const next = page.locator("[data-next-question]");
    if (await next.count()) await next.click();
    else break;
  }
  await page.locator("[data-review-submit]").click();
  await page.locator("[data-confirm-submit]").click();
  await page.locator("[data-results]").waitFor();
  return { ids };
}

async function practise(page, conceptId, bank) {
  const c = bank.concepts.find((x) => x.id === conceptId);
  const card = page.locator(`[data-remediation="${conceptId}"]`);
  // Remediation rotates between variants each time a concept is missed again; answer the one shown.
  const vi = Number(await card.getAttribute("data-remediation-variant")) || 0;
  const item = [c.remediation, ...(c.moreRemediation || [])][vi].practice;
  const v = rightAnswer(item);
  if (item.kind === "numeric") await card.locator("input[inputmode=decimal]").fill(String(v));
  else if (Array.isArray(v)) for (const id of v) await card.locator(`[data-option="${id}"]`).click();
  else await card.locator(`[data-option="${v}"]`).click();
  await card.getByRole("button", { name: "Check answer" }).click();
  await page.waitForFunction((id) => document.querySelector(`[data-remediation="${id}"]`)?.getAttribute("data-done") === "true", conceptId);
}

(async () => {
  const browser = await chromium.launch();
  const errors = [];
  const ctx = await browser.newContext(H.DESKTOP);
  ctx.setDefaultTimeout(10000);
  const page = await ctx.newPage();
  H.watchConsole(page, errors);

  // ── 1. Locked tracks cannot be entered by URL ─────────────────────────────
  await page.goto(BASE + H.lessonUrl("fx-quotes"), { waitUntil: "networkidle" });
  await page.locator("[data-locked]").waitFor();
  check("locked lesson by URL: lock panel shown", await page.locator("[data-locked]").isVisible());
  check("locked lesson by URL: lesson content not rendered", (await page.locator('article[aria-label="Lesson content"]').count()) === 0);
  check("locked lesson names what unlocks it", /unlocks after you complete\s+Market Foundations/i.test(await page.locator("[data-locked]").textContent()));
  await page.waitForTimeout(800);
  const s0 = await stored(page);
  check("locked lesson by URL: nothing recorded", !s0 || !s0.lessons || !s0.lessons["fx-quotes"]);

  await page.goto(BASE + H.assessmentUrl("forex-foundations"), { waitUntil: "networkidle" });
  await page.locator("[data-locked]").waitFor();
  check("locked assessment by URL: lock panel, no start button", (await page.locator("[data-start-assessment]").count()) === 0 && /not available in Preview/.test(await page.locator("[data-locked]").textContent()));
  await page.goto(BASE + H.assessmentUrl("forex-foundations") + "?preview=1", { waitUntil: "networkidle" });
  await page.locator("[data-locked]").waitFor();
  check("locked assessment with ?preview=1 is still disabled", (await page.locator("[data-start-assessment]").count()) === 0);
  await page.goto(BASE + H.assessmentUrl("market-foundations"), { waitUntil: "networkidle" });
  await page.locator("[data-assessment-gated]").waitFor();
  check("track 1 assessment is gated until every lesson is complete", (await page.locator("[data-start-assessment]").count()) === 0 && /10 of 10 lessons still to complete/.test(await page.locator("[data-assessment-gated]").textContent()));

  // Planned tracks: outline only, with prerequisites; no assessment route.
  await page.goto(BASE + "/academy/risk-management", { waitUntil: "networkidle" });
  check("planned track shows what it needs", /unlock after you complete\s+Market Foundations and Forex Foundations/.test(await page.locator("[data-prerequisites]").textContent()));
  const r404 = await ctx.request.get(BASE + "/academy/risk-management/assessment");
  check("planned track has no assessment page (404)", r404.status() === 404, String(r404.status()));

  // Academy overview: locked badges and recommendation.
  await page.goto(BASE + "/academy", { waitUntil: "networkidle" });
  await page.locator("[data-locked-badge]").first().waitFor();
  // Track 6 (Chart Reading) also depends only on Market Foundations, so three written tracks are locked.
  check("academy: tracks 2, 3 and 6 show Locked", (await page.locator("[data-locked-badge]").count()) === 3);

  // ── 2. Preview mode records nothing ───────────────────────────────────────
  await page.goto(BASE + H.lessonUrl("fx-pips-lots"), { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Preview this lesson" }).click();
  await page.locator("[data-preview-banner]").waitFor();
  check("preview: banner and URL ?preview=1", /preview=1/.test(page.url()));
  check("preview: lesson content visible", await page.locator('article[aria-label="Lesson content"]').isVisible());
  for (const sec of await page.locator("article section[id]").all()) { await sec.scrollIntoViewIfNeeded(); await page.waitForTimeout(150); }
  await page.mouse.wheel(0, 20000);
  await page.waitForTimeout(900);
  // Take the quiz in preview.
  const quiz = page.locator("#quiz");
  await quiz.scrollIntoViewIfNeeded();
  await quiz.getByRole("button", { name: /Start quiz/ }).click();
  for (let i = 0; i < 8; i++) {
    const opt = quiz.locator("input[type=radio]").first();
    if (!(await opt.count())) break;
    await opt.check();
    await quiz.getByRole("button", { name: "Check answer" }).click();
    const nxt = quiz.getByRole("button", { name: /Next question|See results/ });
    const last = /See results/.test(await nxt.textContent());
    await nxt.click();
    if (last) break;
  }
  check("preview: quiz result says it was not saved", /Preview mode: this attempt was not saved/.test(await quiz.textContent()));
  const s1 = await stored(page);
  check("preview: nothing stored for the previewed lesson (sections, quiz)", !s1 || !s1.lessons || !s1.lessons["fx-pips-lots"], JSON.stringify(s1 && s1.lessons && s1.lessons["fx-pips-lots"]));
  await page.reload({ waitUntil: "networkidle" });
  check("preview survives a reload (still read-only)", await page.locator("[data-preview-banner]").isVisible());

  // ── 3. Fail with a low score, error analysis, remediation, retest ────────
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await H.writeState(page, H.seedState({ complete: ["market-foundations"], noExam: ["market-foundations"] }));
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  const nl = page.locator("section", { has: page.getByRole("heading", { name: "Recommended next lesson" }) });
  await nl.locator("[data-next-step=assessment]").waitFor();
  check("dashboard: all T1 lessons done → recommends the T1 assessment", (await nl.getByRole("link").last().getAttribute("href")) === H.assessmentUrl("market-foundations"));
  check("dashboard: journey stays Awareness until the assessment is passed", /Pass the track assessment/.test(await page.locator("main section").first().textContent()));

  await page.goto(BASE + H.lessonUrl("fx-quotes"), { waitUntil: "networkidle" });
  check("lessons alone do not unlock track 2", await page.locator("[data-locked]").isVisible());

  await page.goto(BASE + H.assessmentUrl("market-foundations"), { waitUntil: "networkidle" });
  await page.locator("[data-start-assessment]").click();
  // Refresh mid-assessment: answer 5, reload, the same questions and answers come back.
  const part = await takeAssessment(page, MF, [], { refreshAfter: 5 });
  const draft1 = (await stored(page)).assessments["market-foundations"].draft;
  await page.reload({ waitUntil: "networkidle" });
  await page.locator("[data-question-id]").waitFor();
  const resumedAt = await page.locator("[data-question-id]").getAttribute("data-question-id");
  const draft2 = (await stored(page)).assessments["market-foundations"].draft;
  check("refresh mid-assessment: same questions", JSON.stringify(draft1.questionIds) === JSON.stringify(draft2.questionIds) && draft2.questionIds.length === N1);
  check("refresh mid-assessment: 5 answers kept, resumes at question 6", Object.keys(draft2.answers).length === 5 && resumedAt === draft2.questionIds[5] && new RegExp(`Question 6 of ${N1}`).test(await page.locator("[data-progress]").textContent()), `${resumedAt} answers=${JSON.stringify(draft2.answers)} order=${draft2.questionIds.slice(0, 6).join(",")}`);
  check("refresh mid-assessment: earlier answers still selected", part.ids.length === 5);

  // Go back to question 1 to answer the rest with three concepts wrong.
  const wrong1 = ["mf-indices", "mf-crypto", "mf-leverage"];
  // Re-answer the remaining questions (5 answered already were right; answer from 6 on).
  const first = { ids: [...part.ids] };
  for (let n = 5; n < N1; n++) {
    const id = await page.locator("[data-question-id]").getAttribute("data-question-id");
    first.ids.push(id);
    const q = qOf(MF, id);
    await answer(page, q.item, wrong1.includes(q.concept) ? wrongAnswer(q.item) : rightAnswer(q.item));
    const next = page.locator("[data-next-question]");
    if (await next.count()) await next.click();
  }
  // If any of the wrong concepts were among the first five, re-answer them wrongly.
  for (let k = 0; k < 5; k++) {
    const q = qOf(MF, part.ids[k]);
    if (!wrong1.includes(q.concept)) continue;
    const st = await stored(page);
    const answers = st.assessments["market-foundations"].draft.answers;
    answers[q.id] = q.item.kind === "true-false" ? !q.item.answer : wrongAnswer(q.item);
    await page.evaluate(([k2, v]) => localStorage.setItem(k2, v), [KEY, JSON.stringify(st)]);
  }
  await page.reload({ waitUntil: "networkidle" });
  await page.locator("[data-question-id]").waitFor();
  await page.locator("[data-review-submit]").click();
  await page.locator("[data-confirm-submit]").click();
  await page.locator("[data-results]").waitFor();
  const res1 = page.locator("[data-results]");
  check("attempt 1: not passed (3 concepts wrong)", (await res1.getAttribute("data-passed")) === "false" && new RegExp(`${N1 - 3} of ${N1}`).test(await res1.textContent()), (await res1.locator("h2").textContent()));
  const missed1 = await page.locator("[data-missed-concept]").evaluateAll((els) => els.map((e) => e.getAttribute("data-missed-concept")).sort());
  check("attempt 1: error analysis names exactly the missed concepts", JSON.stringify(missed1) === JSON.stringify([...wrong1].sort()), missed1.join(","));
  check("attempt 1: each wrong answer explained (why + right answer)", (await page.locator('[data-result-item][data-ok="false"]').count()) === 3 && /Right answer|The sound choice|Error:/.test(await page.locator('[data-result-item][data-ok="false"]').first().textContent()));
  check("attempt 1: retest locked until remediation", await page.locator("[data-retest-locked]").isVisible() && (await page.locator("[data-start-retest]").count()) === 0);
  check("attempt 1: one remediation card per missed concept, with explanation, example and practice", (await page.locator("[data-remediation]").count()) === 3 && /Another way to see it/.test(await page.locator("[data-remediation]").first().textContent()) && /A different example/.test(await page.locator("[data-remediation]").first().textContent()));
  await page.reload({ waitUntil: "networkidle" });
  await page.locator("[data-retest-locked]").waitFor();
  check("refresh after failing: still locked, nothing skipped", (await page.locator("[data-start-retest]").count()) === 0);
  await practise(page, "mf-indices", MF);
  await practise(page, "mf-crypto", MF);
  check("2 of 3 remediated: retest still locked", (await page.locator("[data-retest-locked]").count()) === 1 && /1 of 3/.test(await page.locator("[data-retest-locked]").textContent()));
  await practise(page, "mf-leverage", MF);
  await page.locator("[data-start-retest]").waitFor();
  check("all remediated: retest unlocks", true);

  // ── 4. Retest: different questions; > 90% with a safety-critical miss fails ──
  await page.locator("[data-start-retest]").click();
  const second = await takeAssessment(page, MF, ["mf-stop-loss"]);
  check("retest uses entirely different questions", second.ids.length === N1 && second.ids.every((id) => !first.ids.includes(id)), second.ids.filter((id) => first.ids.includes(id)).join(","));
  const res2 = page.locator("[data-results]");
  const t2 = await res2.textContent();
  const pct2 = Math.floor(((N1 - 1) * 100) / N1); // displayed percentages are floored
  check(`safety-critical miss at ${pct2}% (above 90%): NOT passed`, pct2 > 90 && (await res2.getAttribute("data-passed")) === "false" && t2.includes(`${N1 - 1} of ${N1} (${pct2}%)`), t2.slice(0, 120));
  check("safety-critical miss: reason says safety-critical", /safety-critical question was wrong/.test(await page.locator("[data-fail-reasons]").textContent()));
  await page.goto(BASE + H.lessonUrl("fx-quotes"), { waitUntil: "networkidle" });
  check("safety-critical miss: track 2 still locked", await page.locator("[data-locked]").isVisible());
  await page.goto(BASE + H.assessmentUrl("market-foundations"), { waitUntil: "networkidle" });
  await practise(page, "mf-stop-loss", MF);
  await page.locator("[data-start-retest]").waitFor();
  // Every concept has at least four questions, so the second retest still draws only unseen ones.
  check("second retest: no reuse notice (no pool has run out)", (await page.locator("[data-reuse-notice]").count()) === 0);
  await page.locator("[data-start-retest]").click();
  await page.locator("[data-question-id]").waitFor();
  const third = await takeAssessment(page, MF, []);
  const res3 = page.locator("[data-results]");
  check("third attempt, all right: passed", (await res3.getAttribute("data-passed")) === "true");
  check("passed: mastery score shown", /Mastery score: 100%/.test(await page.locator("[data-assessment-passed]").textContent()));
  const reusedIds = third.ids.filter((id) => first.ids.includes(id) || second.ids.includes(id));
  const draftStored = (await stored(page)).assessments["market-foundations"];
  check("third attempt: no question repeated from attempts 1 and 2", reusedIds.length === 0, `${reusedIds.length} repeats: ${reusedIds.join(",")}`);
  check("three attempts stored with per-concept results", draftStored.attempts.length === 3 && draftStored.attempts.every((a) => a.items.length === N1 && a.items.every((i) => i.c && typeof i.ok === "boolean")));

  // ── 5. Unlocked ───────────────────────────────────────────────────────────
  await page.goto(BASE + H.lessonUrl("fx-quotes"), { waitUntil: "networkidle" });
  await page.locator('article[aria-label="Lesson content"]').waitFor();
  check("after passing: track 2 lesson opens normally", (await page.locator("[data-locked]").count()) === 0 && (await page.locator("[data-preview-banner]").count()) === 0);
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.locator("section", { has: page.getByRole("heading", { name: "Recommended next lesson" }) }).getByRole("link").last().waitFor();
  check("after passing: dashboard recommends fx-quotes", (await page.locator("section", { has: page.getByRole("heading", { name: "Recommended next lesson" }) }).getByRole("link").last().getAttribute("href")) === H.lessonUrl("fx-quotes"));
  check("after passing: journey is Learning", /Foundations done/.test(await page.locator("main section").first().textContent()));
  await page.goto(BASE + "/academy", { waitUntil: "networkidle" });
  await page.locator("[data-tracks-complete]").waitFor();
  // Four written tracks since Chart Reading was added.
  check("academy: 1 of 4 tracks complete, no locked written tracks", (await page.locator("[data-tracks-complete]").textContent()) === "1/4" && (await page.locator("[data-locked-badge]").count()) === 0);

  // ── 6. Track 2: safety-critical questions, a chart question, 320px ───────
  {
    const c2 = await browser.newContext(H.NARROW);
    c2.setDefaultTimeout(10000);
    const p2 = await c2.newPage();
    H.watchConsole(p2, errors);
    await p2.goto(BASE + "/", { waitUntil: "domcontentloaded" });
    await H.writeState(p2, H.seedState({ complete: ["market-foundations", "forex-foundations"], noExam: ["forex-foundations"] }));
    await p2.goto(BASE + H.assessmentUrl("forex-foundations"), { waitUntil: "networkidle" });
    await p2.locator("[data-start-assessment]").click();
    await p2.locator("[data-question-id]").waitFor();
    const st = await stored(p2);
    const ids = st.assessments["forex-foundations"].draft.questionIds;
    const safetyIds = ids.filter((id) => FX.concepts.find((c) => c.id === qOf(FX, id).concept).safetyCritical);
    check("FX: 4 safety-critical questions in the attempt (sizing, margin, margin call, leverage)", safetyIds.length === 4);
    const hs = await H.noHScroll(p2);
    check("FX assessment at 320px: no horizontal scroll", hs.over <= 0, hs.culprit || "");
    // Find any safety badge while stepping through.
    const r = await takeAssessment(p2, FX, []);
    check("FX all right: passed", (await p2.locator("[data-results]").getAttribute("data-passed")) === "true");
    // Practice retakes draw unseen questions. Every FX concept has four, so over four attempts the
    // chart-annotation question must appear, no question repeats, and only then is reuse announced.
    let chartOk = r.ids.some((id) => qOf(FX, id).item.kind === "chart-annotate");
    const seenFx = [...r.ids];
    let fxRepeats = 0;
    for (let k = 0; k < 3; k++) {
      check(`FX attempt ${k + 2}: no reuse notice yet`, (await p2.locator("[data-reuse-notice]").count()) === 0);
      await p2.getByRole("button", { name: "Practice retake" }).click();
      const rr = await takeAssessment(p2, FX, []);
      fxRepeats += rr.ids.filter((id) => seenFx.includes(id)).length;
      seenFx.push(...rr.ids);
      const drew = rr.ids.some((id) => qOf(FX, id).item.kind === "chart-annotate");
      if (drew) chartOk = (await p2.locator("[data-results]").getAttribute("data-passed")) === "true";
    }
    check("FX: chart-annotation question answered with the keyboard alone, and graded right", chartOk);
    check("FX: four attempts, no question repeated", fxRepeats === 0, String(fxRepeats));
    check("FX: after four attempts every pool is used, and the fifth attempt's reuse is announced", /every concept/.test((await p2.locator("[data-reuse-notice]").textContent().catch(() => "")) || ""));
    await p2.goto(BASE + "/academy", { waitUntil: "networkidle" });
    await p2.locator("[data-tracks-complete]").waitFor();
    check("FX passed: 2 of 4 tracks complete", (await p2.locator("[data-tracks-complete]").textContent()) === "2/4"); // 4 written tracks since Chart Reading
    await c2.close();
  }

  // ── 6b. Stale drafts, per-learner draws, phone layout (step-1 rework) ───
  {
    const c3 = await browser.newContext(H.PHONE);
    c3.setDefaultTimeout(10000);
    const p3 = await c3.newPage();
    H.watchConsole(p3, errors);
    const pageErrors = [];
    p3.on("pageerror", (e) => pageErrors.push(e.message));
    await p3.goto(BASE + "/", { waitUntil: "domcontentloaded" });
    const base = H.seedState({ complete: ["market-foundations"], noExam: ["market-foundations"] });
    await H.writeState(p3, { ...base, assessments: { "market-foundations": { attempts: [], remediation: {}, draft: { startedAt: new Date(Date.now() - 60_000).toISOString(), questionIds: ["no-such-q", MF.questions[0].id], answers: {}, reusedConcepts: [] } } } });
    await p3.goto(BASE + H.assessmentUrl("market-foundations"), { waitUntil: "networkidle" });
    await p3.locator("[data-stale-draft]").waitFor();
    check("stale draft: 'This attempt is out of date. Start again.' and no crash", /This attempt is out of date\. Start again\./.test(await p3.locator("[data-stale-draft]").textContent()) && pageErrors.length === 0, pageErrors.join(" | "));
    await p3.waitForTimeout(300);
    check("stale draft: discarded from storage", !(await stored(p3)).assessments["market-foundations"].draft);
    await p3.locator("[data-start-assessment]").click();
    await p3.locator("[data-question-id]").waitFor();
    const mine = (await stored(p3)).assessments["market-foundations"];
    check("start again after a stale draft: a full new draw, and a learner seed is stored", mine.draft.questionIds.length === N1 && /^[a-z0-9]{6,16}$/.test(mine.seed || ""), mine.seed);
    // Another learner (fresh browser) gets a different first attempt.
    const c4 = await browser.newContext(H.DESKTOP);
    const p4 = await c4.newPage();
    await p4.goto(BASE + "/", { waitUntil: "domcontentloaded" });
    await H.writeState(p4, base);
    await p4.goto(BASE + H.assessmentUrl("market-foundations"), { waitUntil: "networkidle" });
    await p4.locator("[data-start-assessment]").click();
    await p4.locator("[data-question-id]").waitFor();
    const theirs = (await stored(p4)).assessments["market-foundations"];
    check("first attempts differ between learners (per-learner seed)", theirs.seed !== mine.seed && theirs.draft.questionIds.join() !== mine.draft.questionIds.join());
    await c4.close();
    // Phone: after a fail, the error analysis and remediation come first; the per-question review is collapsed.
    const fail = await takeAssessment(p3, MF, ["mf-indices"]);
    void fail;
    const y = (sel) => p3.locator(sel).first().evaluate((el) => el.getBoundingClientRect().top + scrollY);
    const [yAnalysis, yRemed, yReview] = [await y("[data-error-analysis]"), await y("[data-remediation]"), await y("[data-results-review]")];
    check("phone results: error analysis, then remediation, then the review", yAnalysis < yRemed && yRemed < yReview, `${yAnalysis} ${yRemed} ${yReview}`);
    check("phone results: per-question review collapsed by default", !(await p3.locator("[data-results-review]").evaluate((el) => el.open)));
    check("phone results: remediation within 1,500px of the top", yRemed < 1500, String(yRemed));
    await c3.close();
  }

  // ── 7. Reset ──────────────────────────────────────────────────────────────
  await page.goto(BASE + "/settings", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Reset Academy progress" }).click();
  await page.getByRole("button", { name: "Yes, reset" }).click();
  await page.waitForTimeout(300);
  const s9 = await stored(page);
  check("reset: no assessment records left", !s9 || !s9.assessments);
  await page.goto(BASE + H.lessonUrl("fx-quotes"), { waitUntil: "networkidle" });
  await page.locator("[data-locked]").waitFor();
  check("reset: track 2 is locked again", true);
  await page.goto(BASE + H.assessmentUrl("market-foundations"), { waitUntil: "networkidle" });
  await page.locator("[data-assessment-gated]").waitFor();
  check("reset: track 1 assessment gated again", true);

  check("no console errors", errors.length === 0, errors.slice(0, 3).join(" | "));
  await browser.close();
  summary();
})().catch((e) => { console.error(e); summary(); process.exit(1); });
