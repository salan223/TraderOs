// Tester round 5: the forex session timeline in unusual time zones and DST weeks.
// The widget's coloured cells are compared with an independent calculation
// (Intl, session hours 08–17 London/NY, 07–16 Sydney, 09–18 Tokyo, weekdays only).
// Run with: NODE_PATH=$(npm root -g) node tests/e2e/tester-sessions.js   (server on BASE, default :3300)
const H = require("./helpers");
const { chromium, BASE, check } = H;

const SESS = [
  { name: "Sydney", tz: "Australia/Sydney", open: 7, close: 16 },
  { name: "Tokyo", tz: "Asia/Tokyo", open: 9, close: 18 },
  { name: "London", tz: "Europe/London", open: 8, close: 17 },
  { name: "New York", tz: "America/New_York", open: 8, close: 17 },
];
function wall(t, tz) {
  const p = Object.fromEntries(new Intl.DateTimeFormat("en-US", { timeZone: tz, hourCycle: "h23", weekday: "short", hour: "numeric", minute: "numeric" }).formatToParts(new Date(t)).map((x) => [x.type, x.value]));
  return { wd: p.weekday, mins: (+p.hour % 24) * 60 + +p.minute };
}
function isOpen(s, t) {
  const w = wall(t, s.tz);
  if (w.wd === "Sat" || w.wd === "Sun") return false;
  return w.mins >= s.open * 60 && w.mins < s.close * 60;
}

const CASES = [
  // [viewer zone, fixed "now" (UTC), note]
  ["Europe/London", "2026-11-23T12:00:00Z", "normal week (both on standard time)"],
  ["America/New_York", "2026-03-09T15:00:00Z", "US already on summer time, UK not yet (DST gap week)"],
  ["Europe/London", "2026-03-10T12:00:00Z", "DST gap week seen from London"],
  ["Europe/London", "2026-10-28T12:00:00Z", "autumn gap week (UK back on GMT 25 Oct, US on 1 Nov)"],
  ["Asia/Kathmandu", "2026-11-23T06:00:00Z", "UTC+5:45"],
  ["Australia/Lord_Howe", "2026-10-07T00:00:00Z", "UTC+10:30/+11 (half-hour DST), week after its switch"],
  ["America/St_Johns", "2026-11-25T03:00:00Z", "UTC−3:30, late on a Tuesday locally"],
  ["Pacific/Chatham", "2026-04-08T00:00:00Z", "UTC+12:45, week after its DST end"],
  ["Pacific/Kiritimati", "2026-11-23T00:00:00Z", "UTC+14"],
  ["America/Los_Angeles", "2026-03-08T12:00:00Z", "the US DST switch day itself (a Sunday)"],
];

// Phase 2 step 1: Forex Foundations is locked until Market Foundations is passed. These checks
// only read the session widget under a fixed clock, so they open the lesson in read-only Preview.
(async () => {
  const browser = await chromium.launch();
  for (const [tz, now, note] of CASES) {
    const ctx = await browser.newContext({ ...H.DESKTOP, timezoneId: tz });
    const page = await ctx.newPage();
    page.setDefaultTimeout(8000);
    const logs = []; H.watchConsole(page, logs);
    await page.clock.setFixedTime(new Date(now));
    await page.goto(BASE + H.previewUrl("fx-sessions"), { waitUntil: "networkidle" });
    const w = page.locator("[data-widget]", { hasText: "24-hour session timeline" });
    await w.locator("svg[role=img]").waitFor();
    const got = await w.evaluate((el) => {
      const svg = el.querySelector("svg[role=img]");
      const X0 = 64, cell = (300 - 64 + 40) / 96;
      const rows = [0, 1, 2, 3].map(() => new Array(96).fill(false));
      for (const r of svg.querySelectorAll("rect")) {
        const cls = r.getAttribute("class") || "";
        if (cls.includes("fill-raised")) continue;
        const i = Math.round((+r.getAttribute("y") - 12) / 28);
        const k = Math.round((+r.getAttribute("x") - X0) / cell);
        if (i >= 0 && i < 4 && k >= 0 && k < 96) rows[i][k] = true;
      }
      const labels = [...svg.querySelectorAll("text")].filter((t) => +t.getAttribute("y") === 134).map((t) => t.textContent);
      const intro = [...el.querySelectorAll("p")].find((p) => /Times are in/.test(p.textContent))?.textContent || "";
      return { rows, labels, intro };
    });
    // Independent: the reference Wednesday at local midnight in the viewer zone.
    const ref = await page.evaluate(() => {
      const n = new Date();
      const d = new Date(n.getFullYear(), n.getMonth(), n.getDate());
      d.setDate(d.getDate() + ((3 - d.getDay() + 7) % 7));
      const mid = d.getTime();
      const next = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).getTime();
      const fmt = (h, m) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), h, m).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      return { mid, hours: (next - mid) / 3600e3, wantLabels: [fmt(0, 0), fmt(6, 0), fmt(12, 0), fmt(18, 0), fmt(24, 0)], date: d.toDateString() };
    });
    const mism = [];
    SESS.forEach((s, i) => {
      for (let k = 0; k < 96; k++) {
        const want = isOpen(s, ref.mid + k * 15 * 60e3);
        if (want !== got.rows[i][k]) mism.push(`${s.name}@${k}`);
      }
    });
    const firstOpen = (i) => got.rows[i].indexOf(true);
    const span = (i) => got.rows[i].filter(Boolean).length / 4;
    const lnOverlap = got.rows[2].filter((o, k) => o && got.rows[3][k]).length / 4;
    check(`[${tz}] ${note}: cells match independent session hours (${ref.date})`, mism.length === 0, mism.slice(0, 6).join(", "));
    check(`[${tz}] axis labels are local midnight…midnight`, JSON.stringify(got.labels) === JSON.stringify(ref.wantLabels), `${got.labels.join(" ")} vs ${ref.wantLabels.join(" ")}`);
    check(`[${tz}] intro names the zone`, (got.intro.includes(tz) || got.intro.includes(tz.replace("Kathmandu", "Katmandu"))), got.intro.slice(0, 80));
    console.log(`      London opens cell ${firstOpen(2)}, NY ${firstOpen(3)}; spans ${[0, 1, 2, 3].map(span).join("/")}h; London–NY overlap ${lnOverlap}h; local day ${ref.hours}h`);
    check(`[${tz}] no console errors`, logs.length === 0, logs.slice(0, 2).join(" | "));
    await ctx.close();
  }

  // DST day itself: force the reference day onto a 23-hour day by stubbing Date.getDay
  // so the widget thinks the switch Sunday is a Wednesday. This isolates the
  // programmer's admitted "an hour out on clock-change days" behaviour.
  {
    const ctx = await browser.newContext({ ...H.DESKTOP, timezoneId: "America/New_York" });
    await ctx.addInitScript(() => {
      const g = Date.prototype.getDay;
      Date.prototype.getDay = function () { const r = g.call(this); return this.getFullYear() === 2026 && this.getMonth() === 2 && this.getDate() === 8 ? 3 : r; };
    });
    const page = await ctx.newPage();
    await page.clock.setFixedTime(new Date("2026-03-08T12:00:00Z"));
    await page.goto(BASE + H.previewUrl("fx-sessions"), { waitUntil: "networkidle" });
    const w = page.locator("[data-widget]", { hasText: "24-hour session timeline" });
    const labels = await w.evaluate((el) => [...el.querySelectorAll("svg[role=img] text")].filter((t) => +t.getAttribute("y") === 134).map((t) => t.textContent));
    console.log(`      forced 23-hour day labels: ${labels.join(" | ")}`);
    // Changed by the programmer (round 5, fix 8): this used to assert the admitted
    // limitation (last label an hour past midnight). The coordinator asked for the axis
    // to run from local midnight to the next local midnight in real elapsed time, so on a
    // 23-hour day the last label is midnight again and the day is drawn as 92 quarter-hours.
    const cells = await w.evaluate((el) => el.querySelector("input[type=range]").max);
    check("[simulated DST day] the axis runs local midnight → next midnight over 23 real hours", labels[4] === labels[0] && labels[2] === new Date(2026, 2, 8, 12).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) && +cells === 91, `${labels.join(" ")}; slider max ${cells}`);
    await ctx.close();
  }
  await browser.close();
  H.summary();
})().catch((e) => { console.error(e); process.exitCode = 2; });
