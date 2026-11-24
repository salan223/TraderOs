"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { getGlossaryEntry, inlineLabel } from "@/lib/academy/glossary";

const MARGIN = 8; // minimum gap between the tooltip and the viewport edge / fixed bars
const GAP = 8; // gap between the term and its tooltip
const MAX_WIDTH = 256;
const OPEN_EVENT = "traderos:term-open";

/**
 * The visible area a tooltip may use: the viewport minus fixed or sticky bars
 * marked with data-overlay="top" (the top bar) or data-overlay="bottom" (the
 * phone navigation).
 */
function safeArea() {
  let top = 0;
  let bottom = window.innerHeight;
  for (const el of document.querySelectorAll<HTMLElement>("[data-overlay]")) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0 || getComputedStyle(el).display === "none") continue;
    if (el.dataset.overlay === "top") top = Math.max(top, r.bottom);
    else if (el.dataset.overlay === "bottom") bottom = Math.min(bottom, r.top);
  }
  return { top, bottom, vw: document.documentElement.clientWidth };
}

type Pos = { left: number; top: number; width: number };

/**
 * Inline glossary term. Hover, keyboard focus or a tap shows a plain-English
 * definition, so jargon is never left unexplained. Tap outside or press
 * Escape to close. Only one tooltip is open at a time. The definition is
 * linked with aria-describedby, so screen readers announce it with the term.
 *
 *   <Term id="spread" />                 looks the definition up in the glossary
 *   <Term id="spread">the spread</Term>  custom shown text, glossary definition
 *   <Term def="...">word</Term>          one-off definition (prefer adding to the glossary)
 */
export function Term({ children, def, id }: { children?: ReactNode; def?: string; id?: string }) {
  const entry = id ? getGlossaryEntry(id) : undefined;
  const definition = def ?? entry?.def;
  const label = children ?? (entry ? inlineLabel(entry) : id);
  const tipId = useId();
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<Pos | null>(null);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const wrapRef = useRef<HTMLSpanElement>(null);
  const tipRef = useRef<HTMLSpanElement>(null);
  const pointer = useRef<{ type: string; down: boolean }>({ type: "mouse", down: false });

  // Fixed positioning relative to the viewport: escapes any overflow clipping, and is
  // placed above the term, or below it, whichever fits between the top bar and the nav.
  const place = useCallback((closeIfHidden = false) => {
    const trigger = triggerRef.current;
    const tip = tipRef.current;
    if (!trigger || !tip) return;
    const { top: minY, bottom: maxY, vw } = safeArea();
    const r = trigger.getBoundingClientRect();
    // The term scrolled out of view (or under a bar): close rather than float detached.
    if (closeIfHidden && (r.bottom <= minY || r.top >= maxY || r.right <= 0 || r.left >= vw)) {
      setOpen(false);
      return;
    }
    const width = Math.min(MAX_WIDTH, vw - MARGIN * 2);
    tip.style.width = `${width}px`;
    const h = tip.offsetHeight;
    const left = Math.min(Math.max(r.left, MARGIN), vw - MARGIN - width);
    const above = r.top - GAP - h;
    const below = r.bottom + GAP;
    let top: number;
    if (above >= minY + MARGIN) top = above;
    else if (below + h <= maxY - MARGIN) top = below;
    else top = Math.min(Math.max(below, minY + MARGIN), maxY - MARGIN - h); // last resort: inside the safe area
    setPos({ left, top, width });
  }, []);

  useLayoutEffect(() => {
    if (open) place();
    else setPos(null);
  }, [open, place]);

  useEffect(() => {
    if (!open) return;
    // Only one tooltip at a time: tell the others, and close if another one opens.
    window.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: tipId }));
    const onOther = (e: Event) => (e as CustomEvent<string>).detail !== tipId && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onDown = (e: PointerEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    let frame = 0;
    const onMove = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => place(true));
    };
    window.addEventListener(OPEN_EVENT, onOther);
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    window.addEventListener("scroll", onMove, true);
    window.addEventListener("resize", onMove);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener(OPEN_EVENT, onOther);
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
      window.removeEventListener("scroll", onMove, true);
      window.removeEventListener("resize", onMove);
    };
  }, [open, place, tipId]);

  if (!definition) return <>{label}</>;

  return (
    <span
      ref={wrapRef}
      className="relative inline-block"
      onPointerEnter={(e) => e.pointerType === "mouse" && setOpen(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && setOpen(false)}
    >
      <span
        ref={triggerRef}
        tabIndex={0}
        role="button"
        aria-expanded={open}
        aria-describedby={tipId}
        onPointerDown={(e) => {
          pointer.current = { type: e.pointerType, down: true };
        }}
        onFocus={() => {
          // Keyboard focus opens it; a tap or click is handled by onClick below.
          if (!pointer.current.down) setOpen(true);
        }}
        onBlur={() => {
          pointer.current.down = false;
          setOpen(false);
        }}
        onClick={() => {
          const { type } = pointer.current;
          pointer.current.down = false;
          if (type === "mouse") setOpen(true);
          else setOpen((o) => !o);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen((o) => !o);
          }
        }}
        className="cursor-help border-b border-dotted border-fg-subtle text-fg outline-none focus-visible:border-accent"
      >
        {label}
      </span>
      <span
        ref={tipRef}
        id={tipId}
        role="tooltip"
        style={pos ? { left: pos.left, top: pos.top, width: pos.width } : { left: 0, top: 0 }}
        className={[
          "pointer-events-none fixed z-[60] w-64 max-w-[calc(100vw-1rem)] rounded-lg border border-line-strong bg-raised px-3 py-2 text-left text-xs font-normal normal-case leading-relaxed tracking-normal text-fg-muted shadow-xl shadow-black/40",
          open ? (pos ? "block" : "invisible block") : "hidden",
        ].join(" ")}
      >
        {entry && !def ? <span className="mb-0.5 block font-medium text-fg">{entry.term}</span> : null}
        {definition}
      </span>
    </span>
  );
}
