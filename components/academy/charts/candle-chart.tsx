"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type MouseEvent, type PointerEvent, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import { linearScale, logScale, logTicks, niceTicks, type Bar, type Brick, type PfColumn } from "@/lib/academy/charts";
import { cn } from "@/lib/cn";

/*
  A small, dependency-free SVG price chart for the Academy. It draws
  candlesticks, OHLC bars or a line, an optional volume pane, overlays (for
  example moving averages) and annotations (levels, zones, markers, lines).
  It has a crosshair for the mouse and a keyboard cursor (arrow keys), zoom
  and pan buttons, and a linear or logarithmic price scale.

  The view can also be moved directly (usePanZoom): drag to pan, ctrl/cmd +
  wheel (or plain wheel once the chart has focus) to zoom at the cursor,
  two-finger pinch on touch screens, double-click to reset. touch-action:
  pan-y keeps vertical page scrolling working on phones.

  The SVG coordinate system matches its on-screen width in CSS pixels, so
  text stays at a fixed, readable size on phones and desktops alike. Only the
  visible window of bars is drawn, which keeps 500+ bars fast.
*/

export type Tone = "up" | "down" | "accent" | "warn" | "info" | "muted";

export type Annotation =
  | { kind: "hline"; price: number; label?: string; tone?: Tone; dashed?: boolean }
  | { kind: "zone"; lo: number; hi: number; label?: string; tone?: Tone }
  | { kind: "marker"; index: number; price: number; label: string; tone?: Tone; pos?: "above" | "below" }
  | { kind: "line"; i0: number; p0: number; i1: number; p1: number; label?: string; tone?: Tone }
  | { kind: "vline"; index: number; label?: string; tone?: Tone };

export type Overlay = { values: readonly (number | null)[]; label: string; tone?: Tone };

const STROKE: Record<Tone, string> = { up: "stroke-up", down: "stroke-down", accent: "stroke-accent", warn: "stroke-warn", info: "stroke-info", muted: "stroke-fg-subtle" };
const FILL: Record<Tone, string> = { up: "fill-up", down: "fill-down", accent: "fill-accent", warn: "fill-warn", info: "fill-info", muted: "fill-fg-subtle" };
const SOFT: Record<Tone, string> = { up: "fill-up-soft", down: "fill-down-soft", accent: "fill-accent-soft", warn: "fill-warn-soft", info: "fill-info-soft", muted: "fill-raised" };

/** The chart's on-screen width in CSS pixels (640 before the first measurement). */
export function useWidth<T extends Element>(): [React.RefObject<T | null>, number] {
  const ref = useRef<T>(null);
  const [w, setW] = useState(640);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => { const x = el.clientWidth || el.getBoundingClientRect().width; if (x > 0) setW(Math.floor(x)); };
    update();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, w];
}


// ── Pan and zoom ─────────────────────────────────────────────────────────────

export type View = { from: number; to: number };

/**
 * A window [from, to) over n items that the learner can drag, wheel-zoom and
 * pinch. Attach `wrapRef` to the focusable element that receives the wheel,
 * spread `bind` on the plot element, and call `setPlot` with the plot's
 * left edge and width (px) every render. `wasDrag()` is true straight after
 * a drag, so a click handler can ignore the click that ends it.
 */
export function usePanZoom(n: number, initialLen: number, minLen = 10) {
  const def = useCallback((): View => ({ from: Math.max(0, n - initialLen), to: n }), [n, initialLen]);
  const [win, setWin] = useState<View>(def);
  const touched = useRef(false);
  // Keep the window valid when the series changes; follow the series until the learner moves the view.
  useEffect(() => {
    setWin((w) => (!touched.current ? def() : w.to <= n && w.from < w.to ? w : def()));
  }, [n, def]);
  const from = Math.min(win.from, Math.max(0, n - 1)), to = Math.min(Math.max(win.to, from + 1), n);
  const min = Math.max(1, Math.min(minLen, n));
  const cur = useRef<View>({ from, to });
  cur.current = { from, to };
  const plot = useRef({ x0: 0, w: 1 });
  const setPlot = (x0: number, w: number) => { plot.current = { x0, w: Math.max(1, w) }; };

  const clamp = useCallback((f: number, len: number): View => {
    const l = Math.max(min, Math.min(n, Math.round(len)));
    const ff = Math.max(0, Math.min(n - l, Math.round(f)));
    return { from: ff, to: ff + l };
  }, [min, n]);
  const set = useCallback((v: View) => { touched.current = true; setWin(v); }, []);
  /** Zoom by factor k (<1 zooms in), keeping the item at fraction `frac` of the window still. */
  const zoomAt = useCallback((k: number, frac = 0.5) => {
    const { from: f, to: t } = cur.current;
    const len = t - f;
    let nl = Math.round(len * k);
    if (nl === len && k !== 1) nl += k < 1 ? -1 : 1;
    const anchor = f + frac * len;
    set(clamp(anchor - frac * Math.max(min, Math.min(n, nl)), nl));
  }, [clamp, set, min, n]);
  const panBy = useCallback((d: number) => {
    const { from: f, to: t } = cur.current;
    set(clamp(f + d, t - f));
  }, [clamp, set]);
  const reset = useCallback(() => { touched.current = false; setWin(def()); }, [def]);

  // Pointer gestures: one pointer drags, two pointers pinch.
  const pts = useRef(new Map<number, { x: number; y: number }>());
  const drag = useRef<{ x: number; view: View; moved: boolean } | null>(null);
  const pinch = useRef<{ d: number; view: View; frac: number } | null>(null);
  const moved = useRef(false);
  const [dragging, setDragging] = useState(false);
  const local = (e: PointerEvent<Element>) => { const r = e.currentTarget.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  const fracOf = (x: number) => Math.max(0, Math.min(1, (x - plot.current.x0) / plot.current.w));
  const startPinch = () => {
    const [a, b] = [...pts.current.values()];
    pinch.current = { d: Math.max(10, Math.hypot(a.x - b.x, a.y - b.y)), view: cur.current, frac: fracOf((a.x + b.x) / 2) };
    drag.current = null;
  };
  const bind = {
    onPointerDown: (e: PointerEvent<Element>) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      const p = local(e);
      pts.current.set(e.pointerId, p);
      moved.current = false;
      if (pts.current.size === 1) drag.current = { x: p.x, view: cur.current, moved: false };
      else if (pts.current.size === 2) startPinch();
      if (e.pointerType === "mouse") { try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* not capturable */ } }
    },
    onPointerMove: (e: PointerEvent<Element>) => {
      if (!pts.current.has(e.pointerId)) return;
      const p = local(e);
      pts.current.set(e.pointerId, p);
      if (pinch.current && pts.current.size >= 2) {
        const [a, b] = [...pts.current.values()];
        const d = Math.max(10, Math.hypot(a.x - b.x, a.y - b.y));
        const v = pinch.current.view, len = v.to - v.from;
        const nl = len * (pinch.current.d / d);
        const anchor = v.from + pinch.current.frac * len;
        moved.current = true;
        set(clamp(anchor - pinch.current.frac * Math.max(min, Math.min(n, nl)), nl));
        return;
      }
      const g = drag.current;
      if (!g) return;
      const dx = p.x - g.x;
      if (!g.moved && Math.abs(dx) < 4) return;
      if (!g.moved) { g.moved = true; setDragging(true); }
      moved.current = true;
      const len = g.view.to - g.view.from;
      const perItem = plot.current.w / Math.max(1, len);
      set(clamp(g.view.from - dx / perItem, len));
    },
    onPointerUp: (e: PointerEvent<Element>) => end(e.pointerId),
    onPointerCancel: (e: PointerEvent<Element>) => end(e.pointerId),
    onDoubleClick: () => reset(),
  };
  function end(id: number) {
    pts.current.delete(id);
    if (pts.current.size < 2) pinch.current = null;
    if (pts.current.size === 1) { const [p] = [...pts.current.values()]; drag.current = { x: p.x, view: cur.current, moved: true }; }
    if (pts.current.size === 0) { drag.current = null; setDragging(false); }
  }

  // Wheel: native listener so it can be non-passive. Without ctrl/cmd it only
  // zooms when the chart has focus, so the page still scrolls past it.
  const wrapRef = useRef<HTMLDivElement>(null);
  const [nudge, setNudge] = useState(false);
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    let acc = 0, timer: ReturnType<typeof setTimeout> | null = null;
    const onWheel = (e: WheelEvent) => {
      const focused = el.contains(document.activeElement);
      if (!(e.ctrlKey || e.metaKey || focused)) {
        setNudge(true);
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => setNudge(false), 1400);
        return;
      }
      e.preventDefault();
      const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 400 : 1;
      const r = el.getBoundingClientRect();
      // Horizontal trackpad swipes pan.
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && !e.ctrlKey) {
        const len = cur.current.to - cur.current.from;
        panBy((e.deltaX * unit) / (plot.current.w / Math.max(1, len)));
        return;
      }
      acc += e.deltaY * unit;
      if (Math.abs(acc) < 8) return;
      const k = Math.exp(Math.max(-0.5, Math.min(0.5, acc * 0.004)));
      acc = 0;
      zoomAt(k, fracOf(e.clientX - r.left));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => { el.removeEventListener("wheel", onWheel); if (timer) clearTimeout(timer); };
  }, [panBy, zoomAt]);

  return { from, to, setView: set, zoomAt, panBy, reset, bind, wrapRef, setPlot, dragging, nudge, wasDrag: () => moved.current, touched: touched.current };
}

/** The small "how to move this chart" line under a chart. */
export function PanZoomHint({ nudge, className }: { nudge: boolean; className?: string }) {
  return (
    <p className={cn("text-[11px] leading-snug transition-colors", nudge ? "text-accent-strong" : "text-fg-subtle", className)} data-chart-hint>
      {nudge ? "Hold ctrl (⌘ on a Mac) and scroll to zoom, or click the chart first" : "Drag to move · ctrl+scroll or pinch to zoom · double-click to reset"}
    </p>
  );
}

export const fmtPrice = (p: number, dp: number) =>
  Number.isFinite(p) ? p.toLocaleString("en-US", { minimumFractionDigits: dp, maximumFractionDigits: dp }) : "—";

const FONT = 11; // CSS px; the SVG is drawn 1 unit = 1 px

export type CandleChartProps = {
  bars: readonly Bar[];
  /** Accessible name, e.g. "Simulated daily candlestick chart". */
  label: string;
  mode?: "candles" | "ohlc" | "line";
  scale?: "linear" | "log";
  volume?: boolean;
  /** Height of the price pane in px. */
  height?: number;
  decimals?: number;
  annotations?: readonly Annotation[];
  overlays?: readonly Overlay[];
  /** Show zoom and pan buttons. */
  controls?: boolean;
  /** Bars visible at first (defaults to all). */
  initialWindow?: number;
  /** Called when the learner clicks the chart, or presses Enter on the keyboard cursor (price = that bar's close). */
  onPick?: (p: { index: number; price: number }) => void;
  /** Label for a bar on the x axis and in the readout (defaults to "Bar n"). */
  barLabel?: (index: number) => string;
  /** Bar indices drawn with a highlight ring. */
  highlight?: readonly number[];
  /** Bars after this index are drawn faded (e.g. "the future" not seen yet). */
  fadeAfter?: number;
  /** Extra text under the chart. */
  footer?: ReactNode;
};

export function CandleChart({
  bars, label, mode = "candles", scale = "linear", volume = false, height = 220, decimals = 2, annotations = [], overlays = [],
  controls = false, initialWindow, onPick, barLabel = (i) => `Bar ${i + 1}`, highlight = [], fadeAfter, footer,
}: CandleChartProps) {
  const id = useId();
  const [wrapRef, width] = useWidth<HTMLDivElement>();
  const n = bars.length;
  const full = Math.max(1, n);
  const pz = usePanZoom(n, initialWindow ?? n);
  const { from, to } = pz;
  const [cursor, setCursor] = useState<number | null>(null);
  useEffect(() => {
    setCursor((c) => (c !== null && c >= n ? null : c));
  }, [n]);
  const visible = useMemo(() => bars.slice(from, to), [bars, from, to]);

  const padL = 6, padR = FONT * 5.2, padT = 8;
  const volH = volume ? Math.round(height * 0.26) : 0;
  const axisH = FONT + 8;
  const totalH = height + (volume ? volH + 6 : 0) + axisH;
  const plotW = Math.max(40, width - padL - padR);
  const step = plotW / Math.max(1, visible.length);
  const xOf = (i: number) => padL + (i - from + 0.5) * step;

  const { lo, hi } = useMemo(() => {
    let lo = Infinity, hi = -Infinity;
    for (const b of visible) { if (b.l < lo) lo = b.l; if (b.h > hi) hi = b.h; }
    for (const o of overlays) for (let i = from; i < to; i++) { const v = o.values[i]; if (v != null) { lo = Math.min(lo, v); hi = Math.max(hi, v); } }
    for (const a of annotations) {
      if (a.kind === "hline") { lo = Math.min(lo, a.price); hi = Math.max(hi, a.price); }
      if (a.kind === "zone") { lo = Math.min(lo, a.lo); hi = Math.max(hi, a.hi); }
    }
    if (!Number.isFinite(lo)) { lo = 0; hi = 1; }
    if (hi - lo < 1e-9) { lo -= 1; hi += 1; }
    const pad = (hi - lo) * 0.06;
    return { lo: scale === "log" ? Math.max(lo - pad, lo * 0.97, 1e-6) : lo - pad, hi: hi + pad };
  }, [visible, overlays, annotations, from, to, scale]);

  const y = useMemo(() => (scale === "log" && lo > 0 ? logScale(lo, hi, padT + height - 4, padT) : linearScale(lo, hi, padT + height - 4, padT)), [scale, lo, hi, height]);
  const ticks = useMemo(() => {
    const t = scale === "log" ? logTicks(lo, hi) : niceTicks(lo, hi, Math.max(3, Math.round(height / 45)));
    return t.length ? t : niceTicks(lo, hi, 4);
  }, [scale, lo, hi, height]);
  const maxV = useMemo(() => Math.max(1, ...visible.map((b) => b.v)), [visible]);
  const volTop = padT + height + 6;
  const vy = (v: number) => volTop + volH - (v / maxV) * (volH - 2);

  pz.setPlot(padL, plotW);
  const zoom = (k: number) => {
    const len = to - from;
    const nl = Math.max(10, Math.min(n, Math.round(len * k)));
    const mid = cursor ?? Math.round((from + to) / 2);
    let f = Math.round(mid - nl / 2);
    f = Math.max(0, Math.min(n - nl, f));
    pz.setView({ from: f, to: f + nl });
  };
  const pan = (d: number) => {
    const len = to - from;
    const shift = Math.round(len * 0.25) * d || d;
    const f = Math.max(0, Math.min(n - len, from + shift));
    pz.setView({ from: f, to: f + len });
  };
  const reset = () => { pz.reset(); setCursor(null); };

  const idxAt = (px: number) => Math.max(from, Math.min(to - 1, from + Math.floor((px - padL) / step)));
  const pointer = (e: PointerEvent<SVGSVGElement> | MouseEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  const onMove = (e: PointerEvent<SVGSVGElement>) => { pz.bind.onPointerMove(e); const p = pointer(e); if (p.x >= padL && p.x <= padL + plotW) setCursor(idxAt(p.x)); };
  const onClick = (e: MouseEvent<SVGSVGElement>) => {
    if (!onPick || pz.wasDrag()) return;
    const p = pointer(e);
    if (p.y > padT + height || p.x < padL || p.x > padL + plotW) return;
    onPick({ index: idxAt(p.x), price: y.invert(p.y) });
  };
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const c = cursor ?? to - 1;
    let handled = true;
    if (e.key === "ArrowLeft") setCursor(Math.max(0, c - 1));
    else if (e.key === "ArrowRight") setCursor(Math.min(n - 1, c + 1));
    else if (e.key === "Home") setCursor(from);
    else if (e.key === "End") setCursor(to - 1);
    else if (e.key === "+" || e.key === "=") zoom(0.6);
    else if (e.key === "-") zoom(1 / 0.6);
    else if ((e.key === "Enter" || e.key === " ") && onPick && bars[c]) onPick({ index: c, price: bars[c].c });
    else handled = false;
    if (handled) e.preventDefault();
  };
  // Keep the keyboard cursor inside the window by panning to it.
  useEffect(() => {
    if (cursor === null) return;
    if (cursor < from || cursor >= to) {
      const len = to - from;
      const f = Math.max(0, Math.min(n - len, cursor < from ? cursor : cursor - len + 1));
      pz.setView({ from: f, to: f + len });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursor, from, to, n]);

  const cb = cursor !== null ? bars[cursor] : undefined;
  const bodyW = Math.max(1, Math.min(14, step * 0.66));
  const xEvery = Math.max(1, Math.ceil((FONT * 6.5) / step));
  const hl = new Set(highlight);

  const linePath = (vals: (number | null | undefined)[], offset: number) => {
    let d = "", pen = false;
    vals.forEach((v, k) => {
      if (v == null || !Number.isFinite(v) || (scale === "log" && v <= 0)) { pen = false; return; }
      d += `${pen ? "L" : "M"}${xOf(offset + k).toFixed(1)},${y(v).toFixed(1)}`;
      pen = true;
    });
    return d;
  };

  return (
    <div className="min-w-0" data-chart>
      <div
        ref={(el) => { wrapRef.current = el; pz.wrapRef.current = el; }}
        role="group"
        aria-label={`${label}. Use the left and right arrow keys to move the cursor${controls ? ", plus and minus to zoom" : ""}${onPick ? ", Enter to mark the cursor bar" : ""}.`}
        aria-describedby={`${id}-read`}
        tabIndex={0}
        onKeyDown={onKey}
        className="relative min-w-0 rounded-md border border-line bg-panel focus-visible:outline-2 focus-visible:outline-accent"
      >
        <svg
          width={width}
          height={totalH}
          viewBox={`0 0 ${width} ${totalH}`}
          className={cn("block w-full select-none", pz.dragging ? "cursor-grabbing" : onPick ? "cursor-crosshair" : "cursor-grab")}
          style={{ fontSize: `${FONT}px`, height: totalH, touchAction: "pan-y" }}
          onPointerDown={pz.bind.onPointerDown}
          onPointerMove={onMove}
          onPointerUp={pz.bind.onPointerUp}
          onPointerCancel={pz.bind.onPointerCancel}
          onDoubleClick={() => { pz.reset(); setCursor(null); }}
          onClick={onClick}
          data-from={from}
          data-to={to}
          aria-hidden
        >
          {/* grid and price axis */}
          {ticks.map((t) => (
            <g key={t}>
              <line x1={padL} x2={padL + plotW} y1={y(t)} y2={y(t)} className="stroke-line" strokeWidth={1} />
              <text x={padL + plotW + 4} y={y(t) + FONT / 3} className="fill-fg-subtle tabular">{fmtPrice(t, t >= 1000 ? 0 : decimals)}</text>
            </g>
          ))}
          {/* zones and levels behind the bars */}
          {annotations.map((a, k) => a.kind === "zone" ? (
            <g key={`z${k}`}>
              <rect x={padL} width={plotW} y={y(a.hi)} height={Math.max(1, y(a.lo) - y(a.hi))} className={SOFT[a.tone ?? "info"]} />
              {a.label && <text x={padL + 4} y={y(a.hi) + FONT} className={FILL[a.tone ?? "info"]}>{a.label}</text>}
            </g>
          ) : null)}
          {fadeAfter !== undefined && fadeAfter + 1 < to && (
            <rect x={xOf(Math.max(from, fadeAfter + 1)) - step / 2} width={padL + plotW - (xOf(Math.max(from, fadeAfter + 1)) - step / 2)} y={padT} height={height} className="fill-raised" opacity={0.55} />
          )}
          {/* price */}
          {mode === "line" ? (
            <path d={linePath(visible.map((b) => b.c), from)} className="fill-none stroke-fg" strokeWidth={1.5} />
          ) : visible.map((b, k) => {
            const i = from + k;
            const x = xOf(i);
            const tone = b.c >= b.o ? "up" : "down";
            const faded = fadeAfter !== undefined && i > fadeAfter;
            return (
              <g key={i} opacity={faded ? 0.25 : 1}>
                {hl.has(i) && <rect x={x - step / 2} width={step} y={padT} height={height} className="fill-accent-soft" />}
                <line x1={x} x2={x} y1={y(b.h)} y2={y(b.l)} className={STROKE[tone]} strokeWidth={1} />
                {mode === "candles" ? (
                  <rect x={x - bodyW / 2} width={bodyW} y={Math.min(y(b.o), y(b.c))} height={Math.max(1, Math.abs(y(b.o) - y(b.c)))} className={tone === "up" ? "fill-up" : "fill-down"} />
                ) : (
                  <>
                    <line x1={x - bodyW / 2} x2={x} y1={y(b.o)} y2={y(b.o)} className={STROKE[tone]} strokeWidth={1.5} />
                    <line x1={x} x2={x + bodyW / 2} y1={y(b.c)} y2={y(b.c)} className={STROKE[tone]} strokeWidth={1.5} />
                  </>
                )}
              </g>
            );
          })}
          {overlays.map((o, k) => (
            <path key={`o${k}`} d={linePath(o.values.slice(from, to) as (number | null)[], from)} className={cn("fill-none", STROKE[o.tone ?? "accent"])} strokeWidth={1.5} />
          ))}
          {annotations.map((a, k) => {
            const tone = a.tone ?? "accent";
            if (a.kind === "hline") return (
              <g key={`h${k}`}>
                <line x1={padL} x2={padL + plotW} y1={y(a.price)} y2={y(a.price)} className={STROKE[tone]} strokeWidth={1.25} strokeDasharray={a.dashed ? "5 4" : undefined} />
                {a.label && <text x={padL + 4} y={y(a.price) - 4} className={FILL[tone]}>{a.label}</text>}
              </g>
            );
            if (a.kind === "line") return (
              <g key={`l${k}`}>
                <line x1={xOf(a.i0)} x2={xOf(a.i1)} y1={y(a.p0)} y2={y(a.p1)} className={STROKE[tone]} strokeWidth={1.5} />
                {a.label && <text x={Math.min(xOf(a.i1), padL + plotW - FONT * 4)} y={y(a.p1) - 5} className={FILL[tone]}>{a.label}</text>}
              </g>
            );
            if (a.kind === "vline") return a.index >= from && a.index < to ? (
              <g key={`v${k}`}>
                <line x1={xOf(a.index)} x2={xOf(a.index)} y1={padT} y2={padT + height} className={STROKE[tone]} strokeWidth={1} strokeDasharray="3 3" />
                {a.label && <text x={Math.min(xOf(a.index) + 3, padL + plotW - FONT * 4)} y={padT + FONT} className={FILL[tone]}>{a.label}</text>}
              </g>
            ) : null;
            if (a.kind === "marker") {
              if (a.index < from || a.index >= to) return null;
              const above = (a.pos ?? "above") === "above";
              const yy = y(a.price) + (above ? -7 : 7);
              return (
                <g key={`m${k}`}>
                  <circle cx={xOf(a.index)} cy={y(a.price)} r={3.5} className={cn(FILL[tone], "stroke-panel")} strokeWidth={1} />
                  <text x={xOf(a.index)} y={above ? yy - 1 : yy + FONT - 2} textAnchor="middle" className={cn(FILL[tone], "font-medium")}>{a.label}</text>
                </g>
              );
            }
            return null;
          })}
          {/* volume */}
          {volume && visible.map((b, k) => {
            const i = from + k;
            return <rect key={`v${i}`} x={xOf(i) - bodyW / 2} width={bodyW} y={vy(b.v)} height={Math.max(0.5, volTop + volH - vy(b.v))} className={b.c >= b.o ? "fill-up" : "fill-down"} opacity={fadeAfter !== undefined && i > fadeAfter ? 0.2 : 0.55} />;
          })}
          {volume && <text x={padL + plotW + 4} y={volTop + FONT} className="fill-fg-subtle">Vol</text>}
          {/* x axis */}
          {visible.map((_, k) => {
            const i = from + k;
            if ((i - from) % xEvery !== 0) return null;
            return <text key={`x${i}`} x={Math.min(Math.max(xOf(i), padL + FONT * 2), padL + plotW - FONT * 2)} y={totalH - 4} textAnchor="middle" className="fill-fg-subtle">{barLabel(i)}</text>;
          })}
          {/* crosshair */}
          {cb && cursor! >= from && cursor! < to && (
            <g pointerEvents="none">
              <line x1={xOf(cursor!)} x2={xOf(cursor!)} y1={padT} y2={padT + height + (volume ? volH + 6 : 0)} className="stroke-fg-muted" strokeWidth={1} strokeDasharray="2 3" />
              <line x1={padL} x2={padL + plotW} y1={y(cb.c)} y2={y(cb.c)} className="stroke-fg-muted" strokeWidth={1} strokeDasharray="2 3" />
            </g>
          )}
        </svg>
      </div>
      <p id={`${id}-read`} className="mt-1 min-h-[1.25rem] font-mono text-[11px] leading-snug text-fg-muted tabular [overflow-wrap:anywhere]" aria-live="polite">
        {cb
          ? `${barLabel(cursor!)} · O ${fmtPrice(cb.o, decimals)} · H ${fmtPrice(cb.h, decimals)} · L ${fmtPrice(cb.l, decimals)} · C ${fmtPrice(cb.c, decimals)}${volume ? ` · Vol ${Math.round(cb.v).toLocaleString("en-US")}` : ""}`
          : `${to - from} of ${full} bars shown. Point at a bar, or focus the chart and use the arrow keys, to read its prices.`}
      </p>
      <PanZoomHint nudge={pz.nudge} />
      {controls && (
        <div className="mt-1.5 flex flex-wrap gap-1.5" role="toolbar" aria-label="Chart zoom and pan">
          <ChartButton label="Zoom in" onClick={() => zoom(0.6)} disabled={to - from <= 10}><ZoomIn className="size-3.5" aria-hidden /></ChartButton>
          <ChartButton label="Zoom out" onClick={() => zoom(1 / 0.6)} disabled={to - from >= n}><ZoomOut className="size-3.5" aria-hidden /></ChartButton>
          <ChartButton label="Earlier" onClick={() => pan(-1)} disabled={from <= 0}><ChevronLeft className="size-3.5" aria-hidden /></ChartButton>
          <ChartButton label="Later" onClick={() => pan(1)} disabled={to >= n}><ChevronRight className="size-3.5" aria-hidden /></ChartButton>
          <ChartButton label="Reset view" onClick={reset}><RotateCcw className="size-3.5" aria-hidden /></ChartButton>
        </div>
      )}
      {footer}
    </div>
  );
}

function ChartButton({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled?: boolean; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex h-8 items-center gap-1 rounded-md border border-line-strong bg-raised px-2 text-[12px] text-fg-muted hover:text-fg disabled:opacity-40"
    >
      {children}
      <span>{label}</span>
    </button>
  );
}

/** Wrapper shared by the Renko and point-and-figure charts: focusable, draggable and zoomable. */
function PannableFrame({ pz, label, count, children }: { pz: ReturnType<typeof usePanZoom>; label: string; count: string; children: ReactNode }) {
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const len = pz.to - pz.from;
    let handled = true;
    if (e.key === "ArrowLeft") pz.panBy(-Math.max(1, Math.round(len * 0.1)));
    else if (e.key === "ArrowRight") pz.panBy(Math.max(1, Math.round(len * 0.1)));
    else if (e.key === "+" || e.key === "=") pz.zoomAt(0.75);
    else if (e.key === "-") pz.zoomAt(1 / 0.75);
    else if (e.key === "0" || e.key === "Home") pz.reset();
    else handled = false;
    if (handled) e.preventDefault();
  };
  return (
    <div className="min-w-0" data-chart>
      <div
        ref={pz.wrapRef}
        role="group"
        tabIndex={0}
        onKeyDown={onKey}
        aria-label={`${label}: ${count}. Showing ${pz.to - pz.from}. Left and right arrows move, plus and minus zoom, 0 resets.`}
        className="min-w-0 rounded-md border border-line bg-panel focus-visible:outline-2 focus-visible:outline-accent"
      >
        {children}
      </div>
      <PanZoomHint nudge={pz.nudge} className="mt-1" />
    </div>
  );
}

/** Renko bricks: equal-sized boxes, one per box-size move, with no time axis. */
export function BrickChart({ bricks, label, height = 200, decimals = 2, max = 80 }: { bricks: readonly Brick[]; label: string; height?: number; decimals?: number; max?: number }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const pz = usePanZoom(bricks.length, Math.min(max, bricks.length), 8);
  const shown = bricks.slice(pz.from, pz.to);
  const lo = Math.min(...shown.map((b) => b.lo)), hi = Math.max(...shown.map((b) => b.hi));
  const padR = FONT * 5.2, plotW = Math.max(40, width - 6 - padR);
  pz.setPlot(6, plotW);
  const y = linearScale(shown.length ? lo : 0, shown.length ? hi : 1, height - 6, 6);
  const w = plotW / Math.max(8, shown.length);
  const ticks = shown.length ? niceTicks(lo, hi, 4) : [];
  return (
    <PannableFrame pz={pz} label={label} count={`${bricks.length} bricks`}>
      <div ref={ref}>
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className={cn("block w-full select-none", pz.dragging ? "cursor-grabbing" : "cursor-grab")} style={{ fontSize: `${FONT}px`, height, touchAction: "pan-y" }} aria-hidden {...pz.bind} data-from={pz.from} data-to={pz.to}>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={6} x2={6 + plotW} y1={y(t)} y2={y(t)} className="stroke-line" />
              <text x={6 + plotW + 4} y={y(t) + FONT / 3} className="fill-fg-subtle tabular">{fmtPrice(t, decimals)}</text>
            </g>
          ))}
          {shown.map((b, k) => (
            <rect key={k} x={6 + k * w + 0.5} width={Math.max(1, w - 1)} y={y(b.hi)} height={Math.max(1, y(b.lo) - y(b.hi))} className={b.dir === "up" ? "fill-up" : "fill-down"} opacity={0.85} />
          ))}
          {shown.length === 0 && <text x={12} y={height / 2} className="fill-fg-subtle">No brick yet: price has not moved one box.</text>}
        </svg>
      </div>
    </PannableFrame>
  );
}

/** Point-and-figure: columns of X (rising) and O (falling), one symbol per box. */
export function PfChart({ columns, box, label, height = 200, decimals = 2, max = 40 }: { columns: readonly PfColumn[]; box: number; label: string; height?: number; decimals?: number; max?: number }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const pz = usePanZoom(columns.length, Math.min(max, columns.length), 6);
  const shown = columns.slice(pz.from, pz.to);
  const lo = Math.min(...shown.map((c) => c.bottom)), hi = Math.max(...shown.map((c) => c.top));
  const rows = shown.length ? hi - lo + 1 : 1;
  const padR = FONT * 5.2, plotW = Math.max(40, width - 6 - padR);
  const cw = Math.min(16, plotW / Math.max(6, shown.length));
  pz.setPlot(6, Math.max(cw * shown.length, 1));
  const rh = Math.min(14, (height - 12) / rows);
  const yOf = (u: number) => 6 + (hi - u) * rh;
  const ticks = shown.length ? niceTicks(lo * box, hi * box, 4) : [];
  return (
    <PannableFrame pz={pz} label={label} count={`${columns.length} columns`}>
      <div ref={ref}>
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className={cn("block w-full select-none", pz.dragging ? "cursor-grabbing" : "cursor-grab")} style={{ fontSize: `${FONT}px`, height, touchAction: "pan-y" }} aria-hidden {...pz.bind} data-from={pz.from} data-to={pz.to}>
          {ticks.map((t) => (
            <text key={t} x={6 + plotW + 4} y={yOf(t / box) + rh / 2 + FONT / 3} className="fill-fg-subtle tabular">{fmtPrice(t, decimals)}</text>
          ))}
          {shown.map((c, k) => {
            const cells = [];
            for (let u = c.bottom; u <= c.top; u++) {
              const cx = 6 + k * cw + cw / 2, cy = yOf(u) + rh / 2, r = Math.max(1.5, Math.min(cw, rh) * 0.36);
              cells.push(c.dir === "X"
                ? <path key={u} d={`M${cx - r},${cy - r}L${cx + r},${cy + r}M${cx + r},${cy - r}L${cx - r},${cy + r}`} className="stroke-up" strokeWidth={1.4} />
                : <circle key={u} cx={cx} cy={cy} r={r} className="fill-none stroke-down" strokeWidth={1.4} />);
            }
            return <g key={k}>{cells}</g>;
          })}
          {shown.length === 0 && <text x={12} y={height / 2} className="fill-fg-subtle">No column yet: price has not moved one box.</text>}
        </svg>
      </div>
    </PannableFrame>
  );
}
