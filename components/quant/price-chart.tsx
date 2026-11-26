"use client";

import { useId } from "react";

/*
  A price chart for the Options Lab and Forecast Lab: the visible past, an
  optional revealed future, moving-average overlays, horizontal reference
  lines (strike, break-even, target) and an optional forecast cone. Pure SVG
  with theme tokens.
*/

export type ChartLine = { y: number; label: string; tone: "accent" | "up" | "down" | "warn" | "muted"; dashed?: boolean };
export type Overlay = { values: readonly number[]; tone: "accent" | "up" | "down" | "warn" | "muted"; label: string };
export type Cone = { from: number; steps: number; lo1: number; hi1: number; lo2: number; hi2: number; mid?: number };

const COLOR: Record<ChartLine["tone"], string> = {
  accent: "var(--color-accent-strong)",
  up: "var(--color-up)",
  down: "var(--color-down)",
  warn: "var(--color-warn)",
  muted: "var(--color-fg-subtle)",
};

export function PriceChart({
  past,
  future = [],
  totalSteps,
  overlays = [],
  lines = [],
  cone,
  label,
  height = 300,
  marker,
  decimals = 2,
  nowLabel = "now",
}: {
  /** Closing prices up to "now", oldest first. */
  past: readonly number[];
  /** Closes revealed after "now". */
  future?: readonly number[];
  /** Width of the x-axis in bars (past + room for the future). */
  totalSteps?: number;
  overlays?: readonly Overlay[];
  lines?: readonly ChartLine[];
  cone?: Cone;
  label: string;
  height?: number;
  /** Bar index to mark (e.g. the entry day). */
  marker?: { index: number; label: string };
  decimals?: number;
  /** Label on the vertical line at the last visible bar. */
  nowLabel?: string;
}) {
  const id = useId();
  const W = 800, H = height, padL = 8, padR = 64, padT = 12, padB = 20;
  const n = past.length;
  const steps = Math.max(totalSteps ?? n + future.length, n + future.length, 2);
  const values = [
    ...past, ...future,
    ...overlays.flatMap((o) => o.values.filter(Number.isFinite)),
    ...lines.map((l) => l.y),
    ...(cone ? [cone.lo2, cone.hi2] : []),
  ].filter(Number.isFinite);
  let lo = Math.min(...values), hi = Math.max(...values);
  if (!Number.isFinite(lo) || !Number.isFinite(hi)) { lo = 0; hi = 1; }
  if (hi - lo < 1e-9) { hi += 1; lo -= 1; }
  const pad = (hi - lo) * 0.06;
  lo -= pad; hi += pad;
  const x = (i: number) => padL + (i / (steps - 1)) * (W - padL - padR);
  const y = (v: number) => padT + (1 - (v - lo) / (hi - lo)) * (H - padT - padB);
  const path = (vs: readonly number[], offset = 0) => {
    let d = "", pen = false;
    vs.forEach((v, k) => {
      if (!Number.isFinite(v)) { pen = false; return; }
      d += `${pen ? "L" : "M"}${x(k + offset).toFixed(1)},${y(v).toFixed(1)}`;
      pen = true;
    });
    return d;
  };
  const ticks = Array.from({ length: 5 }, (_, k) => lo + ((hi - lo) * k) / 4);
  const fmt = (v: number) => v.toLocaleString("en-US", { maximumFractionDigits: decimals, minimumFractionDigits: decimals });
  const nowX = x(n - 1);
  const conePoly = (a: number, b: number) =>
    cone
      ? `M${x(cone.from)},${y(past[cone.from] ?? past[n - 1])} L${x(cone.from + cone.steps)},${y(b)} L${x(cone.from + cone.steps)},${y(a)} Z`
      : "";

  return (
    <figure className="min-w-0" aria-labelledby={`${id}-cap`}>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={label}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={padL} x2={W - padR} y1={y(t)} y2={y(t)} stroke="var(--color-line)" strokeWidth={1} />
            <text x={W - padR + 6} y={y(t) + 4} fontSize={11} fill="var(--color-fg-subtle)" className="tabular">{fmt(t)}</text>
          </g>
        ))}
        {cone && (
          <>
            <path d={conePoly(cone.lo2, cone.hi2)} fill="var(--color-accent)" opacity={0.08} />
            <path d={conePoly(cone.lo1, cone.hi1)} fill="var(--color-accent)" opacity={0.16} />
            {cone.mid !== undefined && (
              <line x1={x(cone.from)} y1={y(past[cone.from] ?? past[n - 1])} x2={x(cone.from + cone.steps)} y2={y(cone.mid)} stroke="var(--color-accent-strong)" strokeDasharray="4 4" strokeWidth={1.5} />
            )}
          </>
        )}
        {lines.map((l, k) => (
          <g key={l.label}>
            <line x1={padL} x2={W - padR} y1={y(l.y)} y2={y(l.y)} stroke={COLOR[l.tone]} strokeWidth={1.2} strokeDasharray={l.dashed ? "5 4" : undefined} />
            {/* Labels are spread along the line so close levels stay readable. */}
            <text x={padL + 4 + k * 170} y={y(l.y) - 4} fontSize={11} fill={COLOR[l.tone]}>{l.label} {fmt(l.y)}</text>
          </g>
        ))}
        {overlays.map((o) => (
          <path key={o.label} d={path(o.values)} fill="none" stroke={COLOR[o.tone]} strokeWidth={1.3} opacity={0.85} />
        ))}
        <path d={path(past)} fill="none" stroke="var(--color-fg)" strokeWidth={1.6} />
        {future.length > 0 && <path d={path([past[n - 1], ...future], n - 1)} fill="none" stroke="var(--color-accent-strong)" strokeWidth={1.8} />}
        <line x1={nowX} x2={nowX} y1={padT} y2={H - padB} stroke="var(--color-line-strong)" strokeDasharray="3 3" />
        <text x={nowX + 4} y={H - 6} fontSize={11} fill="var(--color-fg-subtle)">{nowLabel}</text>
        {marker && Number.isFinite(past[marker.index] ?? future[marker.index - n]) && (
          <circle cx={x(marker.index)} cy={y(marker.index < n ? past[marker.index] : future[marker.index - n])} r={4} fill="var(--color-warn)" />
        )}
      </svg>
      {overlays.length > 0 && (
        <figcaption id={`${id}-cap`} className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-fg-subtle">
          <span className="inline-flex items-center gap-1"><span className="h-0.5 w-4 bg-fg" />Price</span>
          {overlays.map((o) => (
            <span key={o.label} className="inline-flex items-center gap-1"><span className="h-0.5 w-4" style={{ background: COLOR[o.tone] }} />{o.label}</span>
          ))}
          {future.length > 0 && <span className="inline-flex items-center gap-1"><span className="h-0.5 w-4 bg-accent-strong" />What happened next</span>}
        </figcaption>
      )}
    </figure>
  );
}
