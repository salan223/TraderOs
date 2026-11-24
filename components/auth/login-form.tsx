"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { authErrorMessage, callbackUrl } from "@/lib/auth/messages";
import { Field, Notice, SubmitButton } from "./auth-ui";
import { cn } from "@/lib/cn";

type Mode = "password" | "link";

export function LoginForm({ next, initialError }: { next: string; initialError?: string | null }) {
  const [mode, setMode] = useState<Mode>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const supabase = getBrowserSupabase();
    if (!supabase) return;
    setBusy(true);
    setError(null);
    try {
      if (mode === "password") {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        // A full navigation, so the server and proxy see the new session cookie straight away.
        window.location.assign(next);
        return;
      }
      const { error } = await supabase.auth.signInWithOtp({ email: email.trim(), options: { emailRedirectTo: callbackUrl(next), shouldCreateUser: false } });
      if (error) throw error;
      setSent(true);
    } catch (err) {
      setError(authErrorMessage(err));
    }
    setBusy(false);
  }

  if (sent) {
    return (
      <div className="space-y-4">
        <Notice tone="success">
          <p className="font-medium">Check your email</p>
          <p className="mt-1 text-fg-muted">If an account exists for {email.trim()}, we have sent a sign-in link. Open it in this browser. It expires after a while; you can request another.</p>
        </Notice>
        <button type="button" onClick={() => setSent(false)} className="text-[13px] text-accent-strong hover:underline">Use a different email</button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate={false} className="space-y-4" aria-describedby={error ? "login-error" : undefined}>
      <div role="tablist" aria-label="Sign-in method" className="grid grid-cols-2 gap-1 rounded-lg border border-line bg-surface p-1">
        {(["password", "link"] as const).map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={mode === m}
            onClick={() => { setMode(m); setError(null); }}
            className={cn("h-8 rounded-md text-[13px]", mode === m ? "bg-raised text-fg" : "text-fg-muted hover:text-fg")}
          >
            {m === "password" ? "Password" : "Email me a link"}
          </button>
        ))}
      </div>
      {error && <Notice tone="error" id="login-error">{error}</Notice>}
      <Field id="email" label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" disabled={busy} />
      {mode === "password" ? (
        <div>
          <Field id="password" label="Password" type="password" value={password} onChange={setPassword} autoComplete="current-password" disabled={busy} />
          <p className="mt-1.5 text-right text-[12px]"><Link href="/forgot-password" className="text-accent-strong hover:underline">Forgot your password?</Link></p>
        </div>
      ) : (
        <p className="text-[12px] text-fg-subtle">We will email you a one-time link that signs you in. No password needed.</p>
      )}
      <SubmitButton busy={busy} busyLabel={mode === "password" ? "Signing in…" : "Sending link…"}>{mode === "password" ? "Log in" : "Send sign-in link"}</SubmitButton>
    </form>
  );
}
