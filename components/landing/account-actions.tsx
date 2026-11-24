"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { cn } from "@/lib/cn";

/*
  The landing page's account buttons. Signed-in visitors (who reach the
  landing page from the logo) get a way back to their dashboard instead of
  Log in / Sign up.
*/

const BTN = "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all";
const PRIMARY = cn(
  BTN,
  "h-12 px-6 text-[15px] text-white bg-linear-to-b from-accent-strong to-accent shadow-[0_10px_30px_-10px_rgba(123,110,246,0.8)] ring-1 ring-inset ring-white/15 hover:brightness-110",
);
const SECONDARY = cn(BTN, "h-12 px-6 text-[15px] border border-line-strong bg-raised/70 text-fg hover:bg-hover");
const HEADER_PRIMARY =
  "rounded-lg bg-linear-to-b from-accent-strong to-accent px-4 py-2 text-[14px] font-medium text-white ring-1 ring-inset ring-white/15 transition hover:brightness-110";
const HEADER_LINK = "rounded-lg px-3 py-2 text-[14px] font-medium text-fg-muted transition-colors hover:text-fg";

export function HeaderActions() {
  const { status } = useAuth();
  if (status === "signed-in") {
    return (
      <Link href="/dashboard" className={HEADER_PRIMARY}>
        Go to dashboard
      </Link>
    );
  }
  return (
    <>
      <Link href="/login" className={HEADER_LINK}>
        Log in
      </Link>
      <Link href="/signup" className={HEADER_PRIMARY}>
        Sign up
      </Link>
    </>
  );
}

export function Ctas({ className, center }: { className?: string; center?: boolean }) {
  const { status, configured } = useAuth();
  const wrap = cn("flex flex-wrap items-center gap-3", center && "justify-center", className);
  if (status === "signed-in") {
    return (
      <div className={wrap}>
        <Link href="/dashboard" className={PRIMARY}>
          Continue to your dashboard <ArrowRight className="size-4" strokeWidth={2} />
        </Link>
        <Link href="/academy" className={SECONDARY}>
          Open the Academy
        </Link>
      </div>
    );
  }
  return (
    <div className={wrap}>
      <Link href="/signup" className={PRIMARY}>
        Start learning free <ArrowRight className="size-4" strokeWidth={2} />
      </Link>
      {configured ? (
        <Link href="/login" className={SECONDARY}>
          Log in
        </Link>
      ) : (
        <Link href="/dashboard" className={SECONDARY}>
          Try it as a guest
        </Link>
      )}
    </div>
  );
}
