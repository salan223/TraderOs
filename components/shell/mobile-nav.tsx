"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Ellipsis, X } from "lucide-react";
import { NAV, isActive } from "@/lib/nav";
import { cn } from "@/lib/cn";
import { appHref } from "@/lib/auth/routes";

/** Bottom tab bar for phones, with a "More" sheet for the remaining sections. */
export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const primary = NAV.filter((n) => n.primary);
  const rest = NAV.filter((n) => !n.primary);
  const restActive = rest.some((n) => isActive(pathname, appHref(n.href)));

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 md:hidden" role="dialog" aria-modal="true" aria-label="More sections">
          <button className="absolute inset-0 bg-black/60" aria-label="Close menu" onClick={() => setOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 rounded-t-2xl border-t border-line-strong bg-surface p-3 pb-[calc(env(safe-area-inset-bottom)+5rem)] animate-fade-in">
            <div className="mb-2 flex items-center justify-between px-2">
              <span className="text-xs uppercase tracking-[0.08em] text-fg-subtle">More</span>
              <button onClick={() => setOpen(false)} aria-label="Close" className="rounded-md p-1 text-fg-subtle hover:text-fg">
                <X className="size-4" />
              </button>
            </div>
            <ul className="grid grid-cols-2 gap-1.5">
              {rest.map((item) => {
                const Icon = item.icon;
                const active = isActive(pathname, appHref(item.href));
                return (
                  <li key={item.href}>
                    <Link
                      href={appHref(item.href)}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-[13px]",
                        active ? "border-accent/40 bg-accent-soft text-fg" : "border-line bg-panel text-fg-muted",
                      )}
                    >
                      <Icon className="size-4" strokeWidth={1.75} />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}

      <nav
        aria-label="Main"
        data-overlay="bottom"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      >
        <ul className="grid grid-cols-5">
          {primary.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, appHref(item.href));
            return (
              <li key={item.href}>
                <Link
                  href={appHref(item.href)}
                  aria-current={active ? "page" : undefined}
                  className={cn("flex h-14 flex-col items-center justify-center gap-1 text-[10px]", active ? "text-fg" : "text-fg-subtle")}
                >
                  <Icon className={cn("size-[18px]", active && "text-accent-strong")} strokeWidth={1.75} />
                  {item.short}
                </Link>
              </li>
            );
          })}
          <li>
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              className={cn("flex h-14 w-full flex-col items-center justify-center gap-1 text-[10px]", open || restActive ? "text-fg" : "text-fg-subtle")}
            >
              <Ellipsis className={cn("size-[18px]", (open || restActive) && "text-accent-strong")} strokeWidth={1.75} />
              More
            </button>
          </li>
        </ul>
      </nav>
    </>
  );
}
