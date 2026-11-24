"use client";

import { usePathname } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { NAV, isActive } from "@/lib/nav";
import { LogoMark } from "./logo";
import { UserMenu } from "./user-menu";
import { appHref } from "@/lib/auth/routes";

export function Topbar() {
  const pathname = usePathname();
  const current = NAV.find((n) => isActive(pathname, appHref(n.href)));

  return (
    <header data-overlay="top" className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-line bg-canvas/85 px-4 backdrop-blur md:px-6">
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="md:hidden">
          <LogoMark className="size-6" />
        </span>
        <h1 className="truncate text-sm font-medium">{current?.label ?? "Trader OS"}</h1>
      </div>
      <div className="flex items-center gap-2">
      <div
        className="flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1 text-[11px] text-fg-muted"
        title="Trader OS never connects to a broker or sends real orders. All trading here is simulated."
      >
        <ShieldCheck className="size-3.5 text-up" strokeWidth={1.75} />
        <span className="hidden sm:inline">Education mode · no real orders</span>
        <span className="sm:hidden">No real orders</span>
      </div>
        <UserMenu />
      </div>
    </header>
  );
}
