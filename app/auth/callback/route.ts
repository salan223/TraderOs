import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { getServerSupabase } from "@/lib/supabase/server";
import { safeNext } from "@/lib/auth/routes";

/*
  Where Supabase email links land: sign-up confirmation, magic links and
  password-reset links. Two link styles are handled:
  - ?code=…            (PKCE, the default for @supabase/ssr)
  - ?token_hash=…&type=… (if the email templates are changed to send these)
  On success the session cookie is set and the user goes to ?next (a local
  path only). On failure they go to /login with a readable error.
*/
const OTP_TYPES: EmailOtpType[] = ["signup", "magiclink", "recovery", "invite", "email_change", "email"];

export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const type = url.searchParams.get("type");
  const next = safeNext(url.searchParams.get("next"), type === "recovery" ? "/reset-password" : undefined);
  const fail = (message: string) => {
    const to = new URL("/login", url.origin);
    to.searchParams.set("error", message);
    return NextResponse.redirect(to);
  };

  const providerError = url.searchParams.get("error_description") ?? url.searchParams.get("error");
  if (providerError) return fail(providerError);

  const supabase = await getServerSupabase();
  if (!supabase) return fail("Accounts are not set up on this copy of Trader OS.");

  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return fail("That link has expired or was opened in a different browser. Request a new one and open it in this browser.");
    return NextResponse.redirect(new URL(next, url.origin));
  }
  if (tokenHash && type && (OTP_TYPES as string[]).includes(type)) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: type as EmailOtpType });
    if (error) return fail("That link has expired or has already been used. Request a new one.");
    return NextResponse.redirect(new URL(next, url.origin));
  }
  return fail("That sign-in link is incomplete. Request a new one.");
}
