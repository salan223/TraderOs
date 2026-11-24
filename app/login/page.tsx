import type { Metadata } from "next";
import Link from "next/link";
import { AuthLayout, NotConfigured } from "@/components/auth/auth-ui";
import { LoginForm } from "@/components/auth/login-form";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { safeNext } from "@/lib/auth/routes";

export const metadata: Metadata = { title: "Log in" };

type Search = Promise<Record<string, string | string[] | undefined>>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? null;

export default async function LoginPage({ searchParams }: { searchParams: Search }) {
  const sp = await searchParams;
  const next = safeNext(one(sp.next));
  const error = one(sp.error);
  return (
    <AuthLayout
      title="Log in"
      subtitle="Welcome back. Your progress, notes and plans are kept in your account."
      footer={isSupabaseConfigured ? <>New to Trader OS? <Link href={`/signup?next=${encodeURIComponent(next)}`} className="text-accent-strong hover:underline">Create an account</Link></> : undefined}
    >
      {isSupabaseConfigured ? <LoginForm next={next} initialError={error ? error.slice(0, 300) : null} /> : <NotConfigured />}
    </AuthLayout>
  );
}
