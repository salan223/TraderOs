import Link from "next/link";
import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { LogoMark } from "@/components/shell/logo";
import { cn } from "@/lib/cn";

/** Centred card layout for the sign-in pages (no app shell). */
export function AuthLayout({ title, subtitle, children, footer }: { title: string; subtitle?: ReactNode; children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col bg-canvas">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_40%_at_50%_0%,var(--color-accent-soft),transparent_70%)]" />
      <header className="relative mx-auto flex h-14 w-full max-w-6xl items-center px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <LogoMark />
          <span className="text-sm font-semibold tracking-tight">Trader OS</span>
        </Link>
      </header>
      <main className="relative flex flex-1 items-start justify-center px-4 pb-16 pt-8 md:pt-16">
        <div className="w-full max-w-[400px]">
          <div className="rounded-[var(--radius-panel)] border border-line bg-panel p-5 sm:p-6">
            <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
            {subtitle && <p className="mt-1.5 text-sm text-fg-muted">{subtitle}</p>}
            <div className="mt-5">{children}</div>
          </div>
          {footer && <div className="mt-4 text-center text-[13px] text-fg-muted">{footer}</div>}
          <p className="mt-6 text-center text-[11px] leading-relaxed text-fg-subtle">Education only. Trader OS never places real orders and gives no signals or advice.</p>
        </div>
      </main>
    </div>
  );
}

export function Notice({ tone = "info", children, id }: { tone?: "info" | "error" | "success"; children: ReactNode; id?: string }) {
  const Icon = tone === "error" ? AlertTriangle : tone === "success" ? CheckCircle2 : Info;
  return (
    <div
      id={id}
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-2 rounded-lg border px-3 py-2.5 text-[13px] leading-snug",
        tone === "error" && "border-down/40 bg-down-soft text-fg",
        tone === "success" && "border-up/40 bg-up-soft text-fg",
        tone === "info" && "border-info/30 bg-info-soft text-fg",
      )}
    >
      <Icon className={cn("mt-0.5 size-4 shrink-0", tone === "error" ? "text-down" : tone === "success" ? "text-up" : "text-info")} strokeWidth={1.75} />
      <div className="min-w-0">{children}</div>
    </div>
  );
}

/** Shown on every auth page when no Supabase URL and key are set. */
export function NotConfigured() {
  return (
    <div className="space-y-4">
      <Notice tone="info">
        <p className="font-medium">Accounts are not set up on this copy of Trader OS.</p>
        <p className="mt-1 text-fg-muted">
          Everything still works in guest mode: your progress is saved in this browser. To turn on sign-in, add <code className="font-mono text-[12px]">NEXT_PUBLIC_SUPABASE_URL</code> and <code className="font-mono text-[12px]">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to <code className="font-mono text-[12px]">.env.local</code> (see the README) and restart.
        </p>
      </Notice>
      <Link href="/dashboard" className="inline-flex h-10 w-full items-center justify-center rounded-lg border border-accent bg-accent text-sm font-medium text-white hover:bg-accent-strong">
        Continue as a guest
      </Link>
    </div>
  );
}

export function Field({
  id, label, type = "text", value, onChange, autoComplete, required = true, hint, error, minLength, disabled,
}: {
  id: string; label: string; type?: string; value: string; onChange: (v: string) => void; autoComplete?: string;
  required?: boolean; hint?: string; error?: string | null; minLength?: number; disabled?: boolean;
}) {
  const describedBy = [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(" ") || undefined;
  return (
    <div>
      <label htmlFor={id} className="block text-[13px] font-medium text-fg">{label}</label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        required={required}
        minLength={minLength}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(
          "mt-1.5 block h-10 w-full rounded-lg border bg-surface px-3 text-sm text-fg placeholder:text-fg-subtle focus:outline-2 focus:outline-offset-0 focus:outline-accent disabled:opacity-50",
          error ? "border-down/60" : "border-line-strong",
        )}
      />
      {hint && <p id={`${id}-hint`} className="mt-1 text-[11px] text-fg-subtle">{hint}</p>}
      {error && <p id={`${id}-error`} className="mt-1 text-[12px] text-down">{error}</p>}
    </div>
  );
}

export function SubmitButton({ busy, children, busyLabel }: { busy: boolean; children: ReactNode; busyLabel: string }) {
  return (
    <button
      type="submit"
      disabled={busy}
      aria-busy={busy || undefined}
      className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-accent bg-accent text-sm font-medium text-white hover:bg-accent-strong disabled:cursor-wait disabled:opacity-60"
    >
      {busy && <span aria-hidden className="size-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
      {busy ? busyLabel : children}
    </button>
  );
}
