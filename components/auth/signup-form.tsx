"use client";

import { useState, type FormEvent } from "react";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { authErrorMessage, callbackUrl } from "@/lib/auth/messages";
import { Field, Notice, SubmitButton } from "./auth-ui";

const MIN_PASSWORD = 8;

export function SignupForm({ next }: { next: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState<"password" | "link" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ password?: string; confirm?: string }>({});

  const checkEmail = (how: "confirm" | "link") => {
    window.location.assign(`/check-email?email=${encodeURIComponent(email.trim())}&kind=${how}&next=${encodeURIComponent(next)}`);
  };

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const fe: typeof fieldErrors = {};
    if (password.length < MIN_PASSWORD) fe.password = `Use at least ${MIN_PASSWORD} characters.`;
    if (confirm !== password) fe.confirm = "The two passwords do not match.";
    setFieldErrors(fe);
    if (fe.password || fe.confirm) return;
    const supabase = getBrowserSupabase();
    if (!supabase) return;
    setBusy("password");
    setError(null);
    try {
      const { data, error } = await supabase.auth.signUp({ email: email.trim(), password, options: { emailRedirectTo: callbackUrl(next) } });
      if (error) throw error;
      // With email confirmation switched off, Supabase signs the user in straight away.
      if (data.session) {
        window.location.assign(next);
        return;
      }
      checkEmail("confirm");
      return;
    } catch (err) {
      setError(authErrorMessage(err));
    }
    setBusy(null);
  }

  async function sendLink() {
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("Enter your email address first.");
      return;
    }
    const supabase = getBrowserSupabase();
    if (!supabase) return;
    setBusy("link");
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOtp({ email: email.trim(), options: { emailRedirectTo: callbackUrl(next), shouldCreateUser: true } });
      if (error) throw error;
      checkEmail("link");
      return;
    } catch (err) {
      setError(authErrorMessage(err));
    }
    setBusy(null);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && <Notice tone="error">{error}</Notice>}
      <Field id="email" label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" disabled={!!busy} />
      <Field id="password" label="Password" type="password" value={password} onChange={setPassword} autoComplete="new-password" minLength={MIN_PASSWORD} hint={`At least ${MIN_PASSWORD} characters.`} error={fieldErrors.password} disabled={!!busy} />
      <Field id="confirm" label="Confirm password" type="password" value={confirm} onChange={setConfirm} autoComplete="new-password" error={fieldErrors.confirm} disabled={!!busy} />
      <SubmitButton busy={busy === "password"} busyLabel="Creating account…">Create account</SubmitButton>
      <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.08em] text-fg-subtle" aria-hidden>
        <span className="h-px flex-1 bg-line" />or<span className="h-px flex-1 bg-line" />
      </div>
      <button
        type="button"
        onClick={sendLink}
        disabled={!!busy}
        className="inline-flex h-10 w-full items-center justify-center rounded-lg border border-line-strong bg-raised text-sm text-fg hover:bg-hover disabled:opacity-60"
      >
        {busy === "link" ? "Sending link…" : "Sign up with an email link instead"}
      </button>
    </form>
  );
}
