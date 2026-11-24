import type { Metadata } from "next";
import Link from "next/link";
import { AuthLayout, Notice, NotConfigured } from "@/components/auth/auth-ui";
import { ResendConfirmation } from "@/components/auth/password-forms";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { safeNext } from "@/lib/auth/routes";

export const metadata: Metadata = { title: "Check your email" };

type Search = Promise<Record<string, string | string[] | undefined>>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export default async function CheckEmailPage({ searchParams }: { searchParams: Search }) {
  const sp = await searchParams;
  const email = one(sp.email).slice(0, 254);
  const kind = one(sp.kind) === "link" ? "link" : "confirm";
  const next = safeNext(one(sp.next));
  return (
    <AuthLayout title="Check your email" footer={<Link href="/login" className="text-accent-strong hover:underline">Back to log in</Link>}>
      {isSupabaseConfigured ? (
        <div className="space-y-4">
          <Notice tone="success">
            <p>
              We sent {kind === "link" ? "a sign-in link" : "a confirmation link"} to <strong className="font-medium">{email || "your email address"}</strong>.
            </p>
            <p className="mt-1 text-fg-muted">Open it in this browser to finish. If it does not arrive within a few minutes, check your spam folder.</p>
          </Notice>
          <ResendConfirmation email={email} kind={kind} next={next} />
        </div>
      ) : (
        <NotConfigured />
      )}
    </AuthLayout>
  );
}
