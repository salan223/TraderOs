"use client";

import { useId } from "react";
import { niceTicks } from "@/lib/academy/charts";
import { useWidth } from "@/components/academy/charts/candle-chart";

/*
  A small SVG line plot for the Risk Management widgets: one or more series
  over a shared x axis, optional horizontal reference lines and point markers.
  The viewBox matches the measured pixel width, so text stays at 11px.
*/

export type PlotTone = "accent" | "up" | "down" | "warn" | "muted";
export type PlotSeries = { values: readonly number[]; tone?: PlotTone; width?: number; opacity?: number; label?: string };
export type PlotLine = { y: number; label: string; tone?: PlotTone; dashed?: boolean };
export type PlotMarker = { x: number; y: number; label?: string; tone?: PlotTone };

const STROKE: Record<PlotTone, string> = {
  accent: "var(--color-accent)",
  up: "var(--color-up)",
  down: "var(--color-down)",
  warn: "var(--color-warn)",
  muted: "var(--color-fg-subtle)",
};

export function LinePlot({
  series,
  label,
  height = 180,
  xLabel,
  yFormat = (n) => String(n),
  xFormat = (n) => String(n),
  lines = [],
  markers = [],
  yMin,
  yMax,
  xValues,
}: {
  series: readonly PlotSeries[];
  /** Accessible description of the plot. */
  label: string;
  height?: number;
  xLabel?: string;
  yFormat?: (n: number) => string;
  xFormat?: (n: number) => string;
  lines?: readonly PlotLine[];
  markers?: readonly PlotMarker[];
  yMin?: number;
  yMax?: number;
  /** x value of each index (default: the index itself). */
  xValues?: readonly number[];
}) {
  const id = useId();
  const [ref, w] = useWidth<HTMLDivElement>();
  const n = Math.max(1, ...series.map((s) => s.values.length));
  const xs = xValues ?? Array.from({ length: n }, (_, i) => i);
  const all = [...series.flatMap((s) => s.values.filter(Number.isFinite)), ...lines.map((l) => l.y), ...markers.map((m) => m.y)];
  let lo = yMin ?? Math.min(...all), hi = yMax ?? Math.max(...all);
  if (!Number.isFinite(lo) || !Number.isFinite(hi)) { lo = 0; hi = 1; }
  if (hi === lo) { hi = lo + 1; lo = lo - 1; }
  const padL = 52, padR = 10, padT = 10, padB = xLabel ? 34 : 22;
  const W = Math.max(200, w), H = height;
  const x0 = xs[0], x1 = xs[xs.length - 1] === x0 ? x0 + 1 : xs[xs.length - 1];
  const X = (x: number) => padL + ((x - x0) / (x1 - x0)) * (W - padL - padR);
  const Y = (y: number) => padT + (1 - (Math.min(hi, Math.max(lo, y)) - lo) / (hi - lo)) * (H - padT - padB);
  const yt = niceTicks(lo, hi, 4).filter((t) => t >= lo && t <= hi);
  const xt = niceTicks(x0, x1, Math.max(2, Math.min(6, Math.floor(W / 90)))).filter((t) => t >= x0 && t <= x1);
  const path = (vals: readonly number[]) =>
    vals.map((v, i) => (Number.isFinite(v) ? `${i === 0 || !Number.isFinite(vals[i - 1]) ? "M" : "L"}${X(xs[i] ?? i).toFixed(1)},${Y(v).toFixed(1)}` : "")).join("");
  return (
    <div ref={ref} className="w-full min-w-0">
      <svg role="img" aria-labelledby={`${id}-l`} viewBox={`0 0 ${W} ${H}`} width="100%" height={H} className="block text-fg-subtle" style={{ fontSize: 11 }}>
        <title id={`${id}-l`}>{label}</title>
        {yt.map((t) => (
          <g key={`y${t}`}>
            <line x1={padL} x2={W - padR} y1={Y(t)} y2={Y(t)} stroke="var(--color-line)" strokeWidth={1} />
            <text x={padL - 6} y={Y(t)} dy="0.32em" textAnchor="end" fill="currentColor">{yFormat(t)}</text>
          </g>
        ))}
        {xt.map((t) => (
          <text key={`x${t}`} x={X(t)} y={H - padB + 14} textAnchor="middle" fill="currentColor">{xFormat(t)}</text>
        ))}
        {xLabel && <text x={padL + (W - padL - padR) / 2} y={H - 4} textAnchor="middle" fill="currentColor">{xLabel}</text>}
        {lines.map((l, i) => (
          <g key={`l${i}`}>
            <line x1={padL} x2={W - padR} y1={Y(l.y)} y2={Y(l.y)} stroke={STROKE[l.tone ?? "warn"]} strokeWidth={1.25} strokeDasharray={l.dashed === false ? undefined : "4 3"} />
            <text x={W - padR - 2} y={Y(l.y) - 4} textAnchor="end" fill={STROKE[l.tone ?? "warn"]}>{l.label}</text>
          </g>
        ))}
        {series.map((s, i) => (
          <path key={`s${i}`} d={path(s.values)} fill="none" stroke={STROKE[s.tone ?? "accent"]} strokeWidth={s.width ?? 1.75} strokeOpacity={s.opacity ?? 1} strokeLinejoin="round" />
        ))}
        {markers.map((m, i) => (
          <g key={`m${i}`}>
            <circle cx={X(m.x)} cy={Y(m.y)} r={4} fill={STROKE[m.tone ?? "accent"]} />
            {m.label && <text x={Math.min(W - padR - 2, X(m.x) + 7)} y={Y(m.y) - 7} textAnchor={X(m.x) > W - 120 ? "end" : "start"} fill="var(--color-fg)">{m.label}</text>}
          </g>
        ))}
      </svg>
    </div>
  );
}
