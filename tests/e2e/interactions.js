// Generic interactions: keyboard-only use, aria-live feedback, 320px, reduced motion.
// Run with: NODE_PATH=$(npm root -g) node tests/e2e/interactions.js   (server on BASE, default http://localhost:3300)
const H = require("./helpers");
const { chromium, BASE, check, summary } = H;

(async () => {
  const browser = await chromium.launch();
  const errors = [];
  try {
    const ctx = await browser.newContext({ ...H.NARROW, reducedMotion: "reduce" });
    ctx.setDefaultTimeout(8000);
    const page = await ctx.newPage();
    H.watchConsole(page, errors);
    await page.goto(BASE + "/academy/interactions", { waitUntil: "networkidle" });
    const box = (id) => page.locator(`section[aria-labelledby="${id}-title"]`);

    const kinds = await page.locator("[data-interaction]").evaluateAll((els) => els.map((e) => e.getAttribute("data-interaction")));
    check("every interaction kind is on the page", ["single", "true-false", "numeric", "multi-select", "scenario", "find-error", "chart-annotate", "flashcards", "reveal", "steps"].every((k) => kinds.includes(k)), kinds.join(","));
    const hs = await H.noHScroll(page);
    check("320px: no horizontal scroll", hs.over <= 0, hs.culprit || "");

    // Single choice, keyboard only: focus the first radio, arrow to the right one, Tab to the button, Enter.
    {
      const b = box("sample-single");
      await b.locator("input[type=radio]").first().focus();
      // Move with the arrow keys until the ask option ($20.04) is checked.
      for (let i = 0; i < 4; i++) {
        if (await b.locator('[data-option="b"] input').isChecked()) break;
        await page.keyboard.press("ArrowDown");
      }
      check("single: arrow keys select an option", await b.locator('[data-option="b"] input').isChecked());
      await b.getByRole("button", { name: "Check answer" }).focus();
      await page.keyboard.press("Enter");
      const live = b.locator('[role="status"]');
      check("single: feedback announced in a live region", /Correct\./.test(await live.textContent()));
    }
    // True/false, wrong first: explanation and a retry.
    {
      const b = box("sample-tf");
      await b.locator('[data-option="true"] input').focus();
      await page.keyboard.press("Space");
      await b.getByRole("button", { name: "Check answer" }).click();
      check("true/false: wrong answer explained", /Not quite\./.test(await b.locator('[role="status"]').textContent()) && /next available price/.test(await b.locator('[role="status"]').textContent()));
      await b.getByRole("button", { name: "Try again" }).click();
      await b.locator('[data-option="false"] input').check();
      await b.getByRole("button", { name: "Check answer" }).click();
      check("true/false: retry then correct", /Correct\./.test(await b.locator('[role="status"]').textContent()));
    }
    // Numeric with a forgiving parse.
    {
      const b = box("sample-num");
      await b.locator("input[inputmode=decimal]").fill("$5.00");
      await b.getByRole("button", { name: "Check answer" }).click();
      check("numeric: '$5.00' accepted within tolerance", /Correct\./.test(await b.locator('[role="status"]').textContent()));
    }
    // Multi-select with Space on checkboxes.
    {
      const b = box("sample-multi");
      for (const id of ["a", "b", "d"]) { await b.locator(`[data-option="${id}"] input`).focus(); await page.keyboard.press("Space"); }
      await b.getByRole("button", { name: "Check answer" }).click();
      check("multi-select: keyboard selection graded right", /Correct\./.test(await b.locator('[role="status"]').textContent()));
    }
    // Scenario: process feedback and the outcome note.
    {
      const b = box("sample-scenario");
      await b.locator('[data-option="a"] input').check();
      await b.getByRole("button", { name: "Check answer" }).click();
      const t = await b.locator('[role="status"]').textContent();
      check("scenario: scored on process ('Partly sound'), with an outcome note", /Partly sound/.test(t) && /About outcomes/.test(t), t.slice(0, 80));
    }
    // Find the error.
    {
      const b = box("sample-error");
      await b.locator('[data-option="l2"] input').check();
      await b.getByRole("button", { name: "Check answer" }).click();
      check("find-error: the faulty line found", /Correct\./.test(await b.locator('[role="status"]').textContent()));
    }
    // Chart annotation by keyboard.
    {
      const b = box("sample-chart");
      const svg = b.locator("[data-chart-annotate]");
      await svg.focus();
      for (let i = 0; i < 30; i++) {
        const v = Number(await svg.getAttribute("aria-valuenow"));
        if (v && Math.abs(v - 9.8) < 0.01) break;
        await page.keyboard.press(v && v < 9.8 ? "ArrowUp" : "ArrowDown");
      }
      check("chart: aria-valuetext describes the marked level", /Level 9\.8/.test(await svg.getAttribute("aria-valuetext")));
      await b.getByRole("button", { name: "Check answer" }).click();
      check("chart: keyboard-marked level graded right", /Correct\./.test(await b.locator('[role="status"]').textContent()));
    }
    // Flashcards.
    {
      const b = box("sample-cards");
      const card = b.locator("button[aria-pressed]");
      await card.focus();
      await page.keyboard.press("Enter");
      check("flashcards: Enter flips (aria-pressed) and shows the back", (await card.getAttribute("aria-pressed")) === "true" && /gap between the bid and the ask/.test(await card.textContent()));
      await b.getByRole("button", { name: "Next" }).click();
      check("flashcards: next card shows its front", /Leverage/.test(await card.textContent()) && (await card.getAttribute("aria-pressed")) === "false");
      const td = await card.evaluate((el) => getComputedStyle(el).transitionDuration);
      check("reduced motion: card transitions are off (≤ 0.01s)", parseFloat(td) <= 0.01, td);
    }
    // Reveal.
    {
      const b = box("sample-reveal");
      const btn = b.getByRole("button", { name: "Show the answer" });
      check("reveal: hidden at first", !(await b.locator("[id][hidden]").first().isVisible()));
      await btn.focus();
      await page.keyboard.press("Enter");
      check("reveal: Enter shows the content (aria-expanded)", (await b.getByRole("button", { name: "Hide" }).getAttribute("aria-expanded")) === "true" && /spread is lost/.test(await b.textContent()));
    }
    // Steps with a gating check.
    {
      const b = box("sample-steps");
      await b.getByRole("button", { name: "Next step" }).click();
      check("steps: the check blocks the next step", await b.getByRole("button", { name: "Next step" }).isDisabled());
      await b.locator("input[inputmode=decimal]").fill("0.5");
      await b.getByRole("button", { name: "Check this step" }).click();
      check("steps: after a right answer the next step opens", await b.getByRole("button", { name: "Next step" }).isEnabled());
      await b.getByRole("button", { name: "Next step" }).click();
      check("steps: focus moves to the new step heading", /Step 3 of 3/.test(await page.evaluate(() => document.activeElement?.textContent || "")));
    }
    const hs2 = await H.noHScroll(page);
    check("320px after interacting: still no horizontal scroll", hs2.over <= 0, hs2.culprit || "");
    check("interactions page records nothing", !(await page.evaluate((k) => localStorage.getItem(k), H.KEY)));
  } catch (e) {
    check("script ran without exceptions", false, e.message.split("\n")[0]);
  }
  check("no console errors", errors.length === 0, errors.slice(0, 3).join(" | "));
  await browser.close();
  summary();
})();
