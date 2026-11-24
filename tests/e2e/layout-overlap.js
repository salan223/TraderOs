// Detects overlapping panels and runaway panel heights on every route at phone, tablet and desktop widths.
const H = require("./helpers");
const { chromium, BASE, check } = H;
const ROUTES = ["/", "/academy", "/academy/glossary", ...H.WRITTEN_TRACKS.map((t) => `/academy/${t.id}`), "/academy/macro-news", "/settings", "/market-desk", "/strategy-lab", "/paper-trading", "/journal", "/mentor", "/analytics", ...H.ALL_LESSON_IDS.map(H.lessonUrl)]; // every written lesson, from the content sources
(async () => {
  const browser = await chromium.launch();
  for (const [label, opts] of [["w320", H.NARROW], ["phone", H.PHONE], ["tablet-800", H.TABLET], ["desktop", H.DESKTOP]]) {
    const ctx = await browser.newContext(opts);
    const page = await ctx.newPage();
    // Tracks 2, 3 and 6 are locked until Market Foundations is passed; seed that so their lessons render in full.
    await H.unlockTracks(page);
    for (const url of ROUTES) {
      await page.goto(BASE + url, { waitUntil: "networkidle" });
      await page.waitForTimeout(700);
      const r = await page.evaluate(() => {
        const els = [...document.querySelectorAll("main section, main article, main aside")].filter((e) => !e.parentElement.closest("section, article, aside"));
        const boxes = els.map((e) => { const b = e.getBoundingClientRect(); return { name: (e.querySelector("h2,h3")?.textContent || e.tagName).slice(0, 30), t: b.top + scrollY, b: b.bottom + scrollY, l: b.left, r: b.right, content: e.scrollHeight }; });
        const overlaps = [];
        for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
          const a = boxes[i], c = boxes[j];
          const ov = Math.min(a.b, c.b) - Math.max(a.t, c.t);
          const hov = Math.min(a.r, c.r) - Math.max(a.l, c.l);
          if (ov > 4 && hov > 4) overlaps.push(`"${a.name}" × "${c.name}" (${Math.round(ov)}px)`);
        }
        // runaway height: a panel section whose body is mostly empty (taller than 1.8x its children)
        const tall = [];
        for (const s of document.querySelectorAll("main section.rounded-\\[var\\(--radius-panel\\)\\]")) {
          const h = s.getBoundingClientRect().height;
          const inner = [...s.children].reduce((acc, c) => acc + [...c.children].reduce((a2, cc) => a2 + cc.getBoundingClientRect().height, 0) + (c.tagName === "HEADER" ? c.getBoundingClientRect().height : 0), 0);
          if (h > 1500 && h > inner * 2.5) tall.push(`"${s.querySelector("h2")?.textContent}" h=${Math.round(h)} content≈${Math.round(inner)}`);
        }
        return { overlaps, tall };
      });
      check(`[${label}] ${url} no overlapping panels`, r.overlaps.length === 0, r.overlaps.slice(0, 3).join("; "));
      check(`[${label}] ${url} no runaway empty panel heights`, r.tall.length === 0, r.tall.slice(0, 3).join("; "));
    }
    await ctx.close();
  }
  await browser.close();
  H.summary();
})().catch((e) => { console.error(e); process.exitCode = 2; });
