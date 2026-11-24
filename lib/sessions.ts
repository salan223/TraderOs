/**
 * Major trading sessions, computed from the device clock.
 * Approximate: ignores public holidays and early closes.
 */
export type SessionDef = {
  id: string;
  name: string;
  timeZone: string;
  open: [number, number];  // local hour, minute
  close: [number, number];
  note: string;
};

export const SESSIONS: SessionDef[] = [
  { id: "sydney", name: "Sydney", timeZone: "Australia/Sydney", open: [7, 0], close: [16, 0], note: "Forex week begins here." },
  { id: "tokyo", name: "Tokyo", timeZone: "Asia/Tokyo", open: [9, 0], close: [18, 0], note: "Yen pairs are most active." },
  { id: "london", name: "London", timeZone: "Europe/London", open: [8, 0], close: [17, 0], note: "Largest share of forex volume." },
  { id: "newyork", name: "New York", timeZone: "America/New_York", open: [8, 0], close: [17, 0], note: "Overlaps London in its morning." },
];

export const US_STOCKS: SessionDef = {
  id: "nyse", name: "US stocks (NYSE/Nasdaq)", timeZone: "America/New_York", open: [9, 30], close: [16, 0],
  note: "Regular hours only. S&P 500 and Nasdaq 100 are calculated during these hours.",
};

type Parts = { y: number; m: number; d: number; h: number; min: number; weekday: number };

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Building an Intl.DateTimeFormat is slow; the session timeline in the Academy
// samples hundreds of instants, so formatters are cached per time zone.
const FORMATTERS = new Map<string, Intl.DateTimeFormat>();
function formatterFor(timeZone: string) {
  let f = FORMATTERS.get(timeZone);
  if (!f) {
    f = new Intl.DateTimeFormat("en-US", {
      timeZone, year: "numeric", month: "numeric", day: "numeric",
      hour: "numeric", minute: "numeric", weekday: "short", hourCycle: "h23",
    });
    FORMATTERS.set(timeZone, f);
  }
  return f;
}

function partsIn(date: Date, timeZone: string): Parts {
  const f = formatterFor(timeZone);
  const p: Record<string, string> = {};
  for (const { type, value } of f.formatToParts(date)) p[type] = value;
  return { y: +p.year, m: +p.month, d: +p.day, h: +p.hour % 24, min: +p.minute, weekday: WEEKDAYS.indexOf(p.weekday) };
}

function offsetMs(date: Date, timeZone: string) {
  const p = partsIn(date, timeZone);
  const asUtc = Date.UTC(p.y, p.m - 1, p.d, p.h, p.min);
  return asUtc - Math.floor(date.getTime() / 60000) * 60000;
}

/** Convert a wall-clock time in `timeZone` to a real instant. */
function zonedToDate(y: number, m: number, d: number, h: number, min: number, timeZone: string) {
  const guess = Date.UTC(y, m - 1, d, h, min);
  const off1 = offsetMs(new Date(guess), timeZone);
  let t = guess - off1;
  const off2 = offsetMs(new Date(t), timeZone);
  if (off2 !== off1) t = guess - off2;
  return new Date(t);
}

export type SessionStatus = { open: boolean; nextChange: Date };

const isWeekday = (wd: number) => wd >= 1 && wd <= 5;

export function sessionStatus(s: SessionDef, now: Date): SessionStatus {
  const today = partsIn(now, s.timeZone);
  for (let i = 0; i < 8; i++) {
    const base = new Date(Date.UTC(today.y, today.m - 1, today.d + i));
    const y = base.getUTCFullYear(), m = base.getUTCMonth() + 1, d = base.getUTCDate();
    if (!isWeekday(base.getUTCDay())) continue;
    const open = zonedToDate(y, m, d, s.open[0], s.open[1], s.timeZone);
    const close = zonedToDate(y, m, d, s.close[0], s.close[1], s.timeZone);
    if (now < open) return { open: false, nextChange: open };
    if (now < close) return { open: true, nextChange: close };
  }
  return { open: false, nextChange: now };
}

/** Next time the forex week opens (Sunday 17:00 New York). */
export function nextForexOpen(now: Date) {
  const p = partsIn(now, "America/New_York");
  const daysToSunday = (7 - p.weekday) % 7;
  return zonedToDate(p.y, p.m, p.d + daysToSunday, 17, 0, "America/New_York");
}

/** Forex sessions only count as open while the global forex week is open. */
export function forexSessionStatus(s: SessionDef, now: Date): SessionStatus {
  const st = sessionStatus(s, now);
  if (forexWeekOpen(now)) return st;
  const reopen = nextForexOpen(now);
  return { open: false, nextChange: st.open || st.nextChange < reopen ? reopen : st.nextChange };
}

/** Spot forex trades from Sunday 17:00 to Friday 17:00 New York time. */
export function forexWeekOpen(now: Date) {
  const p = partsIn(now, "America/New_York");
  const minutes = p.h * 60 + p.min;
  if (p.weekday === 6) return false;
  if (p.weekday === 0) return minutes >= 17 * 60;
  if (p.weekday === 5) return minutes < 17 * 60;
  return true;
}

export function formatCountdown(ms: number) {
  const total = Math.max(0, Math.round(ms / 60000));
  const d = Math.floor(total / 1440), h = Math.floor((total % 1440) / 60), m = total % 60;
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

/** The forex sessions open at an instant (none while the forex week is closed). */
export function openForexSessions(at: Date): SessionDef[] {
  return SESSIONS.filter((s) => forexSessionStatus(s, at).open);
}
