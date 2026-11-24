// Shared chart: drag-to-pan and wheel-zoom (ctrl+wheel, and plain wheel only once focused).
// Run with: NODE_PATH=$(npm root -g) node tests/e2e/chart-panzoom.js   (server on BASE, default :3300)
const H = require("./helpers");
const { chromium, BASE, check } = H;

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext(H.DESKTOP);
  const page = await ctx.newPage();
  page.setDefaultTimeout(8000);
  const logs = []; H.watchConsole(page, logs);
  await H.unlockTracks(page);
  await page.goto(BASE + H.lessonUrl("cr-candle-patterns"), { waitUntil: "networkidle" });
  const w = page.locator("[data-widget]").filter({ has: page.locator("p[id]", { hasText: "Pattern lab" }) }).first();
  const svg = w.locator("[data-chart] svg[data-from]").first();
  await svg.scrollIntoViewIfNeeded();
  const view = async () => ({ from: +(await svg.getAttribute("data-from")), to: +(await svg.getAttribute("data-to")) });
  const v0 = await view();
  check(`starts on the last 120 bars (${v0.from}-${v0.to})`, v0.to - v0.from === 120);
  check("shows the drag/zoom hint", /Drag to move/.test(await w.locator("[data-chart-hint]").first().textContent()));

  const box = await svg.boundingBox();
  const cx = box.x + box.width / 2, cy = box.y + box.height / 2;
  await page.mouse.move(cx, cy);
  await page.mouse.down();
  await page.mouse.move(cx + 120, cy, { steps: 6 });
  await page.mouse.up();
  const v1 = await view();
  check(`drag right pans to earlier bars (${v1.from}-${v1.to})`, v1.from < v0.from && v1.to - v1.from === v0.to - v0.from);

  // Plain wheel without focus must not zoom (page scroll is left alone).
  await page.evaluate(() => document.activeElement && document.activeElement.blur());
  const sy = await page.evaluate(() => scrollY);
  await page.mouse.move(cx, cy);
  await page.mouse.wheel(0, -200);
  await page.waitForTimeout(150);
  const v2 = await view();
  check("plain wheel over an unfocused chart does not zoom", v2.to - v2.from === v1.to - v1.from);
  check("plain wheel still scrolls the page", (await page.evaluate(() => scrollY)) !== sy);

  // ctrl + wheel zooms in around the cursor.
  const box2 = await svg.boundingBox();
  await page.mouse.move(box2.x + box2.width / 2, box2.y + box2.height / 2);
  await page.keyboard.down("Control");
  await page.mouse.wheel(0, -300);
  await page.keyboard.up("Control");
  await page.waitForTimeout(150);
  const v3 = await view();
  check(`ctrl+wheel zooms in (${v3.to - v3.from} bars)`, v3.to - v3.from < v2.to - v2.from);
  check("zoom keeps the cursor area in view", v3.from >= v2.from && v3.to <= v2.to);

  await svg.dblclick({ position: { x: box2.width / 2, y: box2.height / 2 } });
  const v4 = await view();
  check(`double-click resets the view (${v4.from}-${v4.to})`, v4.from === v0.from && v4.to === v0.to);
  check("zoom buttons still work", await (async () => { await w.getByRole("button", { name: "Zoom in" }).click(); const v = await view(); return v.to - v.from < 120; })());
  check("no console errors", logs.length === 0, logs.slice(0, 3).join(" | "));
  await ctx.close();
  await browser.close();
  H.summary();
})().catch((e) => { console.error(e); process.exitCode = 2; });
