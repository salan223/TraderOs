"use client";

import { useId, useMemo, useState, type KeyboardEvent, type PointerEvent } from "react";
import { linearScale, niceTicks, type Bar } from "@/lib/academy/charts";
import { PanZoomHint, fmtPrice, usePanZoom, useWidth, type Annotation, type Overlay, type Tone } from "@/components/academy/charts/candle-chart";
import { cn } from "@/lib/cn";

/*
  A price chart with indicator panes underneath that share ONE view: drag,
  ctrl/cmd + wheel, pinch, the keyboard and double-click move the price
  pane and every indicator pane together, so a value in a pane always sits
  under its candle. It reuses the shared pan-and-zoom hook and the same
  paddings, fonts and colours as CandleChart (components/academy/charts),
  which draws a single pane and cannot share its view.
*/

const FONT = 11;
const PAD_L = 6, PAD_R = FONT * 5.2, PAD_T = 8, GAP = 8;
const STROKE: Record<Tone, string> = { up: "stroke-up", down: "stroke-down", accent: "stroke-accent", warn: "stroke-warn", info: "stroke-info", muted: "stroke-fg-subtle" };
const FILL: Record<Tone, string> = { up: "fill-up", down: "fill-down", accent: "fill-accent", warn: "fill-warn", info: "fill-info", muted: "fill-fg-subtle" };

export type PaneSpec = {
  /** Short name drawn in the pane, e.g. "RSI 14". */
  title: string;
  lines: readonly { values: readonly (number | null)[]; tone?: Tone; label: string }[];
  hist?: readonly (number | null)[];
  /** Dashed reference lines, e.g. 30 and 70. They also become the axis ticks. */
  levels?: readonly number[];
  min?: number;
  max?: number;
  decimals?: number;
  /** Straight segments between two bars (e.g. divergence lines), in series indices. */
  segs?: readonly { i0: number; v0: number; i1: number; v1: number; tone?: Tone }[];
};

export function SyncedChart({
  bars, label, overlays = [], annotations = [], panes = [], height = 200, paneHeight = 96, decimals = 2, barLabel = (i) => `Bar ${i + 1}`, initialWindow,
}: {
  bars: readonly Bar[];
  label: string;
  overlays?: readonly Overlay[];
  annotations?: readonly Annotation[];
  panes?: readonly PaneSpec[];
  height?: number;
  paneHeight?: number;
  decimals?: number;
  barLabel?: (i: number) => string;
  initialWindow?: number;
}) {
  const id = useId();
  const [boxRef, width] = useWidth<HTMLDivElement>();
  const n = bars.length;
  const pz = usePanZoom(n, initialWindow ?? n);
  const { from, to } = pz;
  const [cursor, setCursor] = useState<number | null>(null);
  const visible = useMemo(() => bars.slice(from, to), [bars, from, to]);
  const plotW = Math.max(40, width - PAD_L - PAD_R);
  const step = plotW / Math.max(1, visible.length);
  const xOf = (i: number) => PAD_L + (i - from + 0.5) * step;
  pz.setPlot(PAD_L, plotW);

  const { lo, hi } = useMemo(() => {
    let lo = Infinity, hi = -Infinity;
    for (const b of visible) { lo = Math.min(lo, b.l); hi = Math.max(hi, b.h); }
    for (const o of overlays) for (let i = from; i < to; i++) { const v = o.values[i]; if (v != null && Number.isFinite(v)) { lo = Math.min(lo, v); hi = Math.max(hi, v); } }
    for (const a of annotations) if (a.kind === "hline") { lo = Math.min(lo, a.price); hi = Math.max(hi, a.price); }
    if (!Number.isFinite(lo)) { lo = 0; hi = 1; }
    if (hi - lo < 1e-9) { lo -= 1; hi += 1; }
    const p = (hi - lo) * 0.06;
    return { lo: lo - p, hi: hi + p };
  }, [visible, overlays, annotations, from, to]);
  const y = linearScale(lo, hi, PAD_T + height - 4, PAD_T);
  const ticks = niceTicks(lo, hi, Math.max(3, Math.round(height / 45)));

  const paneTop = (k: number) => PAD_T + height + GAP + k * (paneHeight + GAP);
  const axisH = FONT + 8;
  const totalH = (panes.length ? paneTop(panes.length) - GAP : PAD_T + height) + axisH;
  const paneScales = panes.map((p, k) => {
    let plo = p.min ?? Infinity, phi = p.max ?? -Infinity;
    if (p.min === undefined || p.max === undefined) {
      const vals = [...p.lines.flatMap((l) => l.values.slice(from, to)), ...(p.hist?.slice(from, to) ?? []), ...(p.levels ?? [])];
      for (const v of vals) if (v != null && Number.isFinite(v)) { if (p.min === undefined) plo = Math.min(plo, v); if (p.max === undefined) phi = Math.max(phi, v); }
      if (!Number.isFinite(plo) || !Number.isFinite(phi)) { plo = 0; phi = 1; }
      if (phi - plo < 1e-9) { plo -= 1; phi += 1; }
      const pad = (phi - plo) * 0.08;
      if (p.min === undefined) plo -= pad;
      if (p.max === undefined) phi += pad;
    }
    const top = paneTop(k);
    return { y: linearScale(plo, phi, top + paneHeight - 4, top + 4), top, ticks: p.levels?.length ? p.levels : niceTicks(plo, phi, 3) };
  });

  const path = (vals: readonly (number | null)[], yy: (v: number) => number) => {
    let d = "", pen = false;
    for (let i = from; i < to; i++) {
      const v = vals[i];
      if (v == null || !Number.isFinite(v)) { pen = false; continue; }
      d += `${pen ? "L" : "M"}${xOf(i).toFixed(1)},${yy(v).toFixed(1)}`;
      pen = true;
    }
    return d;
  };

  const zoom = (k: number) => pz.zoomAt(k, cursor !== null ? (cursor - from) / Math.max(1, to - from) : 0.5);
  const idxAt = (px: number) => Math.max(from, Math.min(to - 1, from + Math.floor((px - PAD_L) / step)));
  const onMove = (e: PointerEvent<SVGSVGElement>) => {
    pz.bind.onPointerMove(e);
    const r = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - r.left;
    if (x >= PAD_L && x <= PAD_L + plotW) setCursor(idxAt(x));
  };
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const c = cursor ?? to - 1;
    let handled = true;
    if (e.key === "ArrowLeft") { const nc = Math.max(0, c - 1); setCursor(nc); if (nc < from) pz.panBy(-1); }
    else if (e.key === "ArrowRight") { const nc = Math.min(n - 1, c + 1); setCursor(nc); if (nc >= to) pz.panBy(1); }
    else if (e.key === "Home") setCursor(from);
    else if (e.key === "End") setCursor(to - 1);
    else if (e.key === "+" || e.key === "=") zoom(0.6);
    else if (e.key === "-") zoom(1 / 0.6);
    else handled = false;
    if (handled) e.preventDefault();
  };

  const bodyW = Math.max(1, Math.min(14, step * 0.66));
  const xEvery = Math.max(1, Math.ceil((FONT * 6.5) / step));
  const cb = cursor !== null && cursor >= from && cursor < to ? bars[cursor] : undefined;
  const paneRead = cb ? panes.map((p) => `${p.lines.map((l) => `${l.label} ${fmtPrice(l.values[cursor!] ?? NaN, p.decimals ?? 1)}`).join(" · ")}`).filter(Boolean).join(" · ") : "";

  return (
    <div className="min-w-0" data-chart data-synced-chart>
      <div
        ref={pz.wrapRef}
        role="group"
        aria-label={`${label}. The indicator panes move with the price chart. Use the left and right arrow keys to move the cursor, plus and minus to zoom.`}
        aria-describedby={`${id}-read`}
        tabIndex={0}
        onKeyDown={onKey}
        className="min-w-0 rounded-md focus-visible:outline-2 focus-visible:outline-accent"
      >
        <div ref={boxRef} className="relative min-w-0 rounded-md border border-line bg-panel">
          <svg
            width={width}
            height={totalH}
            viewBox={`0 0 ${width} ${totalH}`}
            className={cn("block w-full select-none", pz.dragging ? "cursor-grabbing" : "cursor-grab")}
            style={{ fontSize: `${FONT}px`, height: totalH, touchAction: "pan-y" }}
            onPointerDown={pz.bind.onPointerDown}
            onPointerMove={onMove}
            onPointerUp={pz.bind.onPointerUp}
            onPointerCancel={pz.bind.onPointerCancel}
            onPointerLeave={() => setCursor(null)}
            onDoubleClick={() => { pz.reset(); setCursor(null); }}
            aria-hidden
          >
            {ticks.map((t) => (
              <g key={`pt${t}`}>
                <line x1={PAD_L} x2={PAD_L + plotW} y1={y(t)} y2={y(t)} className="stroke-line" strokeWidth={1} />
                <text x={PAD_L + plotW + 4} y={y(t) + FONT / 3} className="fill-fg-subtle tabular">{fmtPrice(t, t >= 1000 ? 0 : decimals)}</text>
              </g>
            ))}
            {visible.map((b, k) => {
              const i = from + k, x = xOf(i), up = b.c >= b.o;
              return (
                <g key={i}>
                  <line x1={x} x2={x} y1={y(b.h)} y2={y(b.l)} className={up ? "stroke-up" : "stroke-down"} strokeWidth={1} />
                  <rect x={x - bodyW / 2} width={bodyW} y={Math.min(y(b.o), y(b.c))} height={Math.max(1, Math.abs(y(b.o) - y(b.c)))} className={up ? "fill-up" : "fill-down"} />
                </g>
              );
            })}
            {overlays.map((o, k) => <path key={`o${k}`} d={path(o.values, y)} className={cn("fill-none", STROKE[o.tone ?? "accent"])} strokeWidth={1.5} />)}
            {annotations.map((a, k) => {
              const tone = a.tone ?? "accent";
              if (a.kind === "hline") return (
                <g key={`a${k}`}>
                  <line x1={PAD_L} x2={PAD_L + plotW} y1={y(a.price)} y2={y(a.price)} className={STROKE[tone]} strokeWidth={1.25} strokeDasharray={a.dashed ? "5 4" : undefined} />
                  {a.label && <text x={PAD_L + 4} y={y(a.price) - 4} className={FILL[tone]}>{a.label}</text>}
                </g>
              );
              if (a.kind === "line") return <line key={`a${k}`} x1={xOf(a.i0)} x2={xOf(a.i1)} y1={y(a.p0)} y2={y(a.p1)} className={STROKE[tone]} strokeWidth={1.75} />;
              if (a.kind === "vline") return a.index >= from && a.index < to ? <line key={`a${k}`} x1={xOf(a.index)} x2={xOf(a.index)} y1={PAD_T} y2={totalH - axisH} className={STROKE[tone]} strokeDasharray="3 3" /> : null;
              if (a.kind === "marker" && a.index >= from && a.index < to) {
                const above = (a.pos ?? "above") === "above";
                return (
                  <g key={`a${k}`}>
                    <circle cx={xOf(a.index)} cy={y(a.price)} r={3.5} className={cn(FILL[tone], "stroke-panel")} strokeWidth={1} />
                    <text x={xOf(a.index)} y={above ? y(a.price) - 9 : y(a.price) + 7 + FONT - 2} textAnchor="middle" className={cn(FILL[tone], "font-medium")}>{a.label}</text>
                  </g>
                );
              }
              return null;
            })}
            {panes.map((p, k) => {
              const s = paneScales[k];
              const bw = Math.max(1, Math.min(10, step * 0.66));
              return (
                <g key={`p${k}`} data-pane={p.title}>
                  <line x1={0} x2={width} y1={s.top - GAP / 2} y2={s.top - GAP / 2} className="stroke-line-strong" strokeWidth={1} />
                  {s.ticks.map((t) => (
                    <g key={`t${t}`}>
                      <line x1={PAD_L} x2={PAD_L + plotW} y1={s.y(t)} y2={s.y(t)} className="stroke-line" strokeDasharray={p.levels?.length ? "4 3" : undefined} />
                      <text x={PAD_L + plotW + 4} y={s.y(t) + FONT / 3} className="fill-fg-subtle tabular">{fmtPrice(t, p.decimals ?? 0)}</text>
                    </g>
                  ))}
                  {p.hist && visible.map((_, j) => {
                    const i = from + j, v = p.hist![i];
                    if (v == null || !Number.isFinite(v)) return null;
                    return <rect key={`h${i}`} x={xOf(i) - bw / 2} width={bw} y={Math.min(s.y(v), s.y(0))} height={Math.max(0.5, Math.abs(s.y(v) - s.y(0)))} className={v >= 0 ? "fill-up" : "fill-down"} opacity={0.5} />;
                  })}
                  {p.lines.map((l, j) => <path key={`l${j}`} d={path(l.values, s.y)} className={cn("fill-none", STROKE[l.tone ?? "accent"])} strokeWidth={1.5} />)}
                  {(p.segs ?? []).map((g, j) => <line key={`g${j}`} x1={xOf(g.i0)} x2={xOf(g.i1)} y1={s.y(g.v0)} y2={s.y(g.v1)} className={STROKE[g.tone ?? "warn"]} strokeWidth={2} />)}
                  <text x={PAD_L + 4} y={s.top + FONT + 2} className="fill-fg-muted font-medium">{p.title}</text>
                </g>
              );
            })}
            {visible.map((_, k) => {
              const i = from + k;
              if (k % xEvery !== 0) return null;
              return <text key={`x${i}`} x={Math.min(Math.max(xOf(i), PAD_L + FONT * 2), PAD_L + plotW - FONT * 2)} y={totalH - 4} textAnchor="middle" className="fill-fg-subtle">{barLabel(i)}</text>;
            })}
            {cb && <line x1={xOf(cursor!)} x2={xOf(cursor!)} y1={PAD_T} y2={totalH - axisH} className="stroke-fg-muted" strokeDasharray="2 3" pointerEvents="none" />}
          </svg>
        </div>
      </div>
      <p id={`${id}-read`} className="mt-1 min-h-[1.25rem] font-mono text-[11px] leading-snug text-fg-muted tabular [overflow-wrap:anywhere]" aria-live="polite">
        {cb
          ? `${barLabel(cursor!)} · O ${fmtPrice(cb.o, decimals)} · H ${fmtPrice(cb.h, decimals)} · L ${fmtPrice(cb.l, decimals)} · C ${fmtPrice(cb.c, decimals)}${paneRead ? ` · ${paneRead}` : ""}`
          : `${to - from} of ${n} bars shown. Point at a bar, or focus the chart and use the arrow keys, to read its values.`}
      </p>
      <PanZoomHint nudge={pz.nudge} />
    </div>
  );
}
