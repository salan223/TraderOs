import type { Metadata } from "next";
import Link from "next/link";
import { AuthLayout, NotConfigured } from "@/components/auth/auth-ui";
import { SignupForm } from "@/components/auth/signup-form";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { safeNext } from "@/lib/auth/routes";

export const metadata: Metadata = { title: "Create an account" };

type Search = Promise<Record<string, string | string[] | undefined>>;

export default async function SignupPage({ searchParams }: { searchParams: Search }) {
  const sp = await searchParams;
  const next = safeNext(Array.isArray(sp.next) ? sp.next[0] : sp.next);
  return (
    <AuthLayout
      title="Create your account"
      subtitle="Free. Any progress you made as a guest in this browser is carried into your account."
      footer={isSupabaseConfigured ? <>Already have an account? <Link href={`/login?next=${encodeURIComponent(next)}`} className="text-accent-strong hover:underline">Log in</Link></> : undefined}
    >
      {isSupabaseConfigured ? <SignupForm next={next} /> : <NotConfigured />}
    </AuthLayout>
  );
}
