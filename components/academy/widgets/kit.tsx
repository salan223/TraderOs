"use client";

import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from "react";
import { MousePointerClick } from "lucide-react";
import { DataBadge } from "@/components/ui/data-badge";
import { parseFieldNumber } from "@/lib/academy/shuffle";
import { cn } from "@/lib/cn";

/*
  Building blocks shared by the Academy's interactive illustrations.
  Everything is native form controls (range, radio, number), so each widget
  is keyboard-operable and labelled for screen readers without extra work.
  Results are announced through a polite live region (<Result>).
*/

/** The frame around every illustration: title, "Sample" badge, body and caption. */
export function WidgetFrame({
  title,
  caption,
  children,
  source = "sample",
}: {
  title: string;
  caption: string;
  children: ReactNode;
  source?: "sample" | "computed" | "simulated";
}) {
  const id = useId();
  return (
    <figure
      role="group"
      aria-labelledby={`${id}-t`}
      data-widget
      className="min-w-0 rounded-lg border border-accent/25 bg-surface p-3 sm:p-4"
    >
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <p id={`${id}-t`} className="t-subheading flex min-w-0 items-center gap-1.5 [overflow-wrap:anywhere]">
          <MousePointerClick className="size-3.5 shrink-0 text-accent-strong" strokeWidth={1.75} aria-hidden />
          <span className="min-w-0">{title}</span>
          <span className="sr-only">(interactive illustration)</span>
        </p>
        <span className="flex shrink-0 items-center gap-1.5">
          <span className="t-label text-[10px]">Illustrative</span>
          <DataBadge source={source} />
        </span>
      </div>
      <div className="min-w-0 space-y-4">{children}</div>
      <figcaption className="t-small mt-3 max-w-none border-t border-line pt-2">{caption}</figcaption>
    </figure>
  );
}

/** A labelled range slider with its current value shown and spoken. */
export function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format = (n) => String(n),
  hint,
}: {
  label: ReactNode;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (n: number) => void;
  format?: (n: number) => string;
  hint?: ReactNode;
}) {
  const id = useId();
  return (
    <div className="min-w-0">
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="min-w-0 text-xs text-fg-muted">{label}</label>
        <output htmlFor={id} className="shrink-0 font-mono text-xs tabular text-fg">{format(value)}</output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-valuetext={format(value)}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1.5 h-6 w-full cursor-pointer accent-accent"
      />
      {hint && <p className="mt-0.5 text-[11px] leading-snug text-fg-subtle">{hint}</p>}
    </div>
  );
}

/** A row of mutually exclusive choices (a radio group styled as segmented buttons). */
export function Choice<T extends string>({
  label,
  value,
  options,
  onChange,
  className,
}: {
  label: string;
  value: T;
  options: readonly { id: T; label: string }[];
  onChange: (v: T) => void;
  className?: string;
}) {
  const name = useId();
  return (
    <fieldset className={cn("min-w-0", className)}>
      <legend className="mb-1.5 text-xs text-fg-muted">{label}</legend>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => (
          <label
            key={o.id}
            className={cn(
              "inline-flex min-h-8 cursor-pointer items-center rounded-md border px-2.5 text-[13px] transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent",
              value === o.id ? "border-accent bg-accent-soft text-fg" : "border-line-strong bg-raised text-fg-muted hover:text-fg",
            )}
          >
            <input type="radio" name={name} value={o.id} checked={value === o.id} onChange={() => onChange(o.id)} className="sr-only" />
            {o.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/** A small labelled number input that ignores unparseable text instead of breaking the maths. */
export function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
}) {
  const id = useId();
  const hintId = `${id}-hint`;
  const clamp = (n: number) => Math.min(max ?? Infinity, Math.max(min ?? -Infinity, n));
  const [text, setText] = useState(String(value));
  const [invalid, setInvalid] = useState(false);
  // Follow outside changes to `value`, but never rewrite what the user is typing
  // when it already means the current value (e.g. "12,5" while value is 12.5).
  useEffect(() => {
    setText((t) => {
      const n = parseFieldNumber(t);
      return n !== null && clamp(n) === value ? t : String(value);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="block text-xs text-fg-muted">{label}</label>
      <div className="mt-1 flex items-center gap-1.5">
        <input
          id={id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          spellCheck={false}
          value={text}
          aria-invalid={invalid || undefined}
          aria-describedby={hintId}
          data-step={step}
          onChange={(e) => {
            setText(e.target.value);
            const n = parseFieldNumber(e.target.value);
            setInvalid(e.target.value.trim() !== "" && n === null);
            if (n !== null) onChange(clamp(n));
          }}
          onBlur={() => { setText(String(value)); setInvalid(false); }}
          className="h-9 w-full min-w-0 max-w-40 rounded-md border border-line-strong bg-raised px-2.5 font-mono text-sm tabular text-fg"
        />
        {suffix && <span className="shrink-0 text-xs text-fg-subtle">{suffix}</span>}
      </div>
      <p id={hintId} className={cn("mt-0.5 text-[11px] leading-snug", invalid ? "text-warn" : "text-fg-subtle")}>
        {invalid ? "Not a number: the last valid amount is still used." : `${min !== undefined ? `From ${min.toLocaleString("en-US")}` : "Any amount"}${max !== undefined ? ` to ${max.toLocaleString("en-US")}` : ""}.`}
      </p>
    </div>
  );
}

/** A labelled figure in a grid of results. */
export function Readout({ label, value, tone, sub }: { label: ReactNode; value: ReactNode; tone?: "up" | "down" | "warn" | "accent"; sub?: ReactNode }) {
  return (
    <div className="min-w-0 rounded-md border border-line bg-panel px-2.5 py-2">
      <dt className="text-[11px] leading-snug text-fg-subtle">{label}</dt>
      <dd
        className={cn(
          "mt-0.5 font-mono text-sm tabular [overflow-wrap:anywhere]",
          tone === "up" ? "text-up" : tone === "down" ? "text-down" : tone === "warn" ? "text-warn" : tone === "accent" ? "text-accent-strong" : "text-fg",
        )}
      >
        {value}
      </dd>
      {sub && <dd className="mt-0.5 text-[11px] leading-snug text-fg-subtle">{sub}</dd>}
    </div>
  );
}

export function Readouts({ children, cols = 2 }: { children: ReactNode; cols?: 2 | 3 | 4 }) {
  return (
    <dl className={cn("grid grid-cols-2 gap-2", cols === 3 && "sm:grid-cols-3", cols === 4 && "sm:grid-cols-4")}>
      {children}
    </dl>
  );
}

/** A sentence that explains the current result, announced when it changes. */
export function Result({ children, tone = "info" }: { children: ReactNode; tone?: "info" | "good" | "warn" | "bad" }) {
  return (
    <p
      role="status"
      aria-live="polite"
      className={cn(
        "rounded-md border px-3 py-2 text-[13px] leading-relaxed",
        tone === "good" ? "border-up/25 bg-up-soft text-fg" : tone === "warn" ? "border-warn/30 bg-warn-soft text-fg" : tone === "bad" ? "border-down/30 bg-down-soft text-fg" : "border-line bg-panel text-fg-muted",
      )}
    >
      {children}
    </p>
  );
}

/** A labelled horizontal bar (0–100%), used for weights, margin and similar. */
export function Bar({ label, pct, tone = "accent", value }: { label: ReactNode; pct: number; tone?: "accent" | "up" | "down" | "warn" | "muted"; value?: ReactNode }) {
  const w = Math.max(0, Math.min(100, Number.isFinite(pct) ? pct : 0));
  return (
    <div className="min-w-0">
      <div className="flex items-baseline justify-between gap-2 text-xs">
        <span className="min-w-0 truncate text-fg-muted">{label}</span>
        <span className="shrink-0 font-mono tabular text-fg">{value ?? `${w.toFixed(1)}%`}</span>
      </div>
      <div className="mt-1 h-2 overflow-hidden rounded-full bg-raised" aria-hidden>
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-300 ease-out motion-reduce:transition-none",
            tone === "up" ? "bg-up" : tone === "down" ? "bg-down" : tone === "warn" ? "bg-warn" : tone === "muted" ? "bg-fg-subtle" : "bg-accent",
          )}
          style={{ width: `${w}%` }}
        />
      </div>
    </div>
  );
}

/** True when the user asked the system for less motion. */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setReduced(mq.matches);
    on();
    mq.addEventListener?.("change", on);
    return () => mq.removeEventListener?.("change", on);
  }, []);
  return reduced;
}

/** True after the first client render. For widgets that depend on the device clock or time zone. */
export function useMounted() {
  const [m, setM] = useState(false);
  useEffect(() => setM(true), []);
  return m;
}

// ── Formatting ──────────────────────────────────────────────────────────────

const SYMBOLS: Record<string, string> = { USD: "$", EUR: "€", GBP: "£", JPY: "¥" };

/** Money with a currency symbol (or code), fixed decimals, en-US grouping so server and client agree. */
export function money(n: number | null | undefined, ccy = "USD", dp?: number): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return "—";
  const d = dp ?? (ccy === "JPY" ? 0 : 2);
  const s = Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
  const sym = SYMBOLS[ccy];
  const body = sym ? `${sym}${s}` : `${s} ${ccy}`;
  return n < 0 && Number(s.replace(/,/g, "")) !== 0 ? `−${body}` : body;
}

export function num(n: number | null | undefined, dp = 2): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return "—";
  const s = Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: dp, maximumFractionDigits: dp });
  return n < 0 && Number(s.replace(/,/g, "")) !== 0 ? `−${s}` : s;
}

export function signed(n: number | null | undefined, dp = 2, suffix = ""): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return "—";
  const s = num(n, dp);
  return (n > 0 && Number(s.replace(/,/g, "")) !== 0 ? "+" : "") + s + suffix;
}

/** Large amounts in words-style short form: $2.4bn, $350m. */
export function bigMoney(n: number | null | undefined): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return "—";
  const a = Math.abs(n);
  const sign = n < 0 ? "−" : "";
  if (a >= 1e12) return `${sign}$${(a / 1e12).toFixed(2)}tn`;
  if (a >= 1e9) return `${sign}$${(a / 1e9).toFixed(1)}bn`;
  if (a >= 1e6) return `${sign}$${(a / 1e6).toFixed(0)}m`;
  return money(n, "USD", 0);
}

/**
 * Keeps SVG diagram text at a readable, fixed on-screen size (about `px`
 * CSS pixels) whatever width the diagram is drawn at. SVG text normally
 * scales with the drawing, which made labels ~6px on phones and ~20px on
 * desktops. Put the returned ref and style on the <svg>; text inside inherits
 * the font size (use em units, e.g. text-[0.9em], for variations).
 */
export function useSvgText<T extends SVGSVGElement>(viewBoxWidth: number, px = 11): { ref: RefObject<T | null>; style: CSSProperties } {
  const ref = useRef<T>(null);
  const [k, setK] = useState(1);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const w = el.getBoundingClientRect().width;
      if (w > 0) setK(viewBoxWidth / w);
    };
    update();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [viewBoxWidth]);
  return { ref, style: { fontSize: `${(px * k).toFixed(3)}px` } };
}
