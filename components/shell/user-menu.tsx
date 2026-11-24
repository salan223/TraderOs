"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { LogIn, LogOut, Settings, UserRound } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { cn } from "@/lib/cn";

/** Account button for the top bar: sign in when signed out, a menu with sign-out when signed in. */
export function UserMenu() {
  const { configured, status, user, signOut } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!configured) {
    return (
      <span className="rounded-full border border-line px-2.5 py-1 text-[11px] text-fg-subtle" title="Accounts are not set up on this copy, so progress is saved in this browser only.">
        Guest
      </span>
    );
  }
  if (status === "loading") return <span className="size-8 rounded-full border border-line" aria-hidden />;
  if (status === "signed-out") {
    return (
      <Link href={`/login?next=${encodeURIComponent(pathname)}`} className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-line-strong bg-raised px-2.5 text-[12px] text-fg hover:bg-hover">
        <LogIn className="size-3.5" strokeWidth={1.75} />
        Sign in
      </Link>
    );
  }

  const email = user?.email ?? "Your account";
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((o) => !o)}
        className={cn("flex size-8 items-center justify-center rounded-full border text-fg-muted hover:text-fg", open ? "border-accent bg-accent-soft" : "border-line-strong bg-raised")}
        title={email}
      >
        <UserRound className="size-4" strokeWidth={1.75} />
        <span className="sr-only">Account menu</span>
      </button>
      {open && (
        <div id={menuId} role="menu" className="absolute right-0 top-10 z-50 w-60 rounded-lg border border-line-strong bg-panel p-1 shadow-xl animate-fade-in">
          <p className="truncate px-2.5 py-2 text-[12px] text-fg-subtle" title={email}>{email}</p>
          <Link role="menuitem" href="/settings" className="flex h-8 items-center gap-2 rounded-md px-2.5 text-[13px] text-fg-muted hover:bg-raised hover:text-fg">
            <Settings className="size-3.5" strokeWidth={1.75} />
            Settings
          </Link>
          <button
            role="menuitem"
            type="button"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              await signOut();
              setBusy(false);
            }}
            className="flex h-8 w-full items-center gap-2 rounded-md px-2.5 text-left text-[13px] text-fg-muted hover:bg-raised hover:text-fg disabled:opacity-50"
          >
            <LogOut className="size-3.5" strokeWidth={1.75} />
            {busy ? "Signing out…" : "Sign out"}
          </button>
        </div>
      )}
    </div>
  );
}
