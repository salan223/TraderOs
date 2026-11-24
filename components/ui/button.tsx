import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-accent text-white hover:bg-accent-strong border border-accent",
  secondary: "bg-raised text-fg hover:bg-hover border border-line-strong",
  ghost: "text-fg-muted hover:text-fg hover:bg-raised border border-transparent",
};

const BASE =
  "inline-flex items-center justify-center gap-1.5 rounded-lg px-3 h-8 text-[13px] font-medium transition-colors disabled:pointer-events-none disabled:opacity-40";

export function Button({ variant = "secondary", className, ...props }: ComponentProps<"button"> & { variant?: Variant }) {
  return <button className={cn(BASE, VARIANTS[variant], className)} {...props} />;
}

export function LinkButton({
  href,
  variant = "secondary",
  className,
  children,
}: {
  href: string;
  variant?: Variant;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={cn(BASE, VARIANTS[variant], className)}>
      {children}
    </Link>
  );
}
