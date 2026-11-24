"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { NAV, isActive, isBuilt } from "@/lib/nav";
import { cn } from "@/lib/cn";
import { appHref } from "@/lib/auth/routes";
import { LogoMark } from "./logo";

export function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const pathname = usePathname();
  const main = NAV.filter((n) => n.href !== "/settings");
  const settings = NAV.find((n) => n.href === "/settings")!;

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-line bg-surface transition-[width] duration-200 md:flex",
        collapsed ? "w-[64px]" : "w-[232px]",
      )}
    >
      <div className={cn("flex h-14 items-center border-b border-line", collapsed ? "justify-center px-0" : "gap-2.5 px-4")}>
        <LogoMark />
        {!collapsed && (
          <div className="leading-tight">
            <div className="text-[13px] font-semibold tracking-tight">Trader OS</div>
            <div className="text-[10px] uppercase tracking-[0.08em] text-fg-subtle">Learn · Practise · Review</div>
          </div>
        )}
      </div>

      <nav aria-label="Main" className="flex-1 overflow-y-auto px-2 py-3">
        <ul className="space-y-0.5">
          {main.map((item) => (
            <li key={item.href}>
              <SideLink item={item} active={isActive(pathname, appHref(item.href))} collapsed={collapsed} />
            </li>
          ))}
        </ul>
      </nav>

      <div className="space-y-0.5 border-t border-line px-2 py-3">
        <SideLink item={settings} active={isActive(pathname, appHref(settings.href))} collapsed={collapsed} />
        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={cn(
            "flex h-9 w-full items-center gap-3 rounded-lg px-2.5 text-[13px] text-fg-subtle hover:bg-raised hover:text-fg",
            collapsed && "justify-center px-0",
          )}
        >
          {collapsed ? <PanelLeftOpen className="size-4" strokeWidth={1.75} /> : <PanelLeftClose className="size-4" strokeWidth={1.75} />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}

function SideLink({ item, active, collapsed }: { item: (typeof NAV)[number]; active: boolean; collapsed: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={appHref(item.href)}
      title={collapsed ? item.label : undefined}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex h-9 items-center gap-3 rounded-lg px-2.5 text-[13px] transition-colors",
        collapsed && "justify-center px-0",
        active ? "bg-raised text-fg" : "text-fg-muted hover:bg-raised/60 hover:text-fg",
      )}
    >
      {active && <span className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-accent" aria-hidden />}
      <Icon className={cn("size-4 shrink-0", active ? "text-accent-strong" : "text-fg-subtle group-hover:text-fg-muted")} strokeWidth={1.75} />
      {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
      {!collapsed && !isBuilt(item) && (
        <span className="rounded border border-line px-1 text-[10px] tabular text-fg-subtle" title={`Built in phase ${item.phase}`}>
          P{item.phase}
        </span>
      )}
    </Link>
  );
}
