"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { authErrorMessage, callbackUrl } from "@/lib/auth/messages";
import { DASHBOARD_PATH } from "@/lib/auth/routes";
import { Field, Notice, SubmitButton } from "./auth-ui";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const supabase = getBrowserSupabase();
    if (!supabase) return;
    setBusy(true);
    setError(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: callbackUrl("/reset-password") });
    setBusy(false);
    if (error) setError(authErrorMessage(error));
    else setSent(true);
  }

  if (sent) {
    return (
      <Notice tone="success">
        <p className="font-medium">Check your email</p>
        <p className="mt-1 text-fg-muted">If an account exists for {email.trim()}, we have sent a link to choose a new password. Open it in this browser.</p>
      </Notice>
    );
  }
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && <Notice tone="error">{error}</Notice>}
      <Field id="email" label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" disabled={busy} />
      <SubmitButton busy={busy} busyLabel="Sending…">Send reset link</SubmitButton>
    </form>
  );
}

export function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSession, setHasSession] = useState<boolean | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const supabase = getBrowserSupabase();
    supabase?.auth.getSession().then(({ data }) => setHasSession(Boolean(data.session)));
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (password.length < 8) return setError("Use at least 8 characters.");
    if (password !== confirm) return setError("The two passwords do not match.");
    const supabase = getBrowserSupabase();
    if (!supabase) return;
    setBusy(true);
    setError(null);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) setError(authErrorMessage(error));
    else setDone(true);
  }

  if (hasSession === false) {
    return (
      <Notice tone="error">
        This reset link has expired or was opened in a different browser. <Link href="/forgot-password" className="text-accent-strong underline">Request a new one</Link>.
      </Notice>
    );
  }
  if (done) {
    return (
      <div className="space-y-4">
        <Notice tone="success">Your password has been changed.</Notice>
        <Link href={DASHBOARD_PATH} className="inline-flex h-10 w-full items-center justify-center rounded-lg border border-accent bg-accent text-sm font-medium text-white hover:bg-accent-strong">Go to your dashboard</Link>
      </div>
    );
  }
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && <Notice tone="error">{error}</Notice>}
      <Field id="password" label="New password" type="password" value={password} onChange={setPassword} autoComplete="new-password" minLength={8} hint="At least 8 characters." disabled={busy || hasSession === null} />
      <Field id="confirm" label="Confirm new password" type="password" value={confirm} onChange={setConfirm} autoComplete="new-password" disabled={busy || hasSession === null} />
      <SubmitButton busy={busy} busyLabel="Saving…">Save new password</SubmitButton>
    </form>
  );
}

export function ResendConfirmation({ email, kind, next }: { email: string; kind: "confirm" | "link"; next: string }) {
  const [state, setState] = useState<"idle" | "busy" | "sent" | "error">("idle");
  const [msg, setMsg] = useState<string | null>(null);
  if (!email) return null;
  async function resend() {
    const supabase = getBrowserSupabase();
    if (!supabase) return;
    setState("busy");
    const { error } =
      kind === "confirm"
        ? await supabase.auth.resend({ type: "signup", email, options: { emailRedirectTo: callbackUrl(next) } })
        : await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: callbackUrl(next) } });
    if (error) {
      setMsg(authErrorMessage(error));
      setState("error");
    } else setState("sent");
  }
  return (
    <div className="space-y-3">
      {state === "sent" && <Notice tone="success">Sent again. It can take a minute or two to arrive.</Notice>}
      {state === "error" && msg && <Notice tone="error">{msg}</Notice>}
      <button type="button" onClick={resend} disabled={state === "busy"} className="inline-flex h-10 w-full items-center justify-center rounded-lg border border-line-strong bg-raised text-sm text-fg hover:bg-hover disabled:opacity-60">
        {state === "busy" ? "Sending…" : "Send the email again"}
      </button>
    </div>
  );
}
