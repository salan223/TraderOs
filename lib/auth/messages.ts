/** Turn a Supabase auth error into plain words. Unknown errors keep their own message. */
export function authErrorMessage(error: unknown): string {
  const raw = error instanceof Error ? error.message : typeof error === "object" && error && "message" in error ? String((error as { message: unknown }).message) : String(error ?? "");
  const m = raw.toLowerCase();
  if (m.includes("invalid login credentials")) return "That email and password do not match an account. Check them, or reset your password.";
  if (m.includes("email not confirmed")) return "Please confirm your email first. Check your inbox for the link we sent, or sign up again to get a new one.";
  if (m.includes("user already registered") || m.includes("already been registered")) return "An account with this email already exists. Log in instead, or reset your password.";
  if (m.includes("password should be") || m.includes("weak password")) return "That password is too weak. Use at least 8 characters, mixing letters, numbers or symbols.";
  if (m.includes("rate limit") || m.includes("too many") || m.includes("security purposes")) return "Too many attempts. Please wait a minute and try again.";
  if (m.includes("signups not allowed") || m.includes("signup is disabled")) return "New sign-ups are switched off for this site.";
  if (m.includes("otp") && m.includes("expired")) return "That link has expired. Request a new one.";
  if (m.includes("failed to fetch") || m.includes("network")) return "Could not reach the server. Check your connection and try again.";
  return raw || "Something went wrong. Please try again.";
}

/** The site's own address, for links in emails. */
export function siteOrigin(): string {
  return typeof window === "undefined" ? "" : window.location.origin;
}

export function callbackUrl(next: string): string {
  return `${siteOrigin()}/auth/callback?next=${encodeURIComponent(next)}`;
}
