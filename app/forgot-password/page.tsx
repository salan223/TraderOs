import type { Metadata } from "next";
import Link from "next/link";
import { AuthLayout, NotConfigured } from "@/components/auth/auth-ui";
import { ForgotPasswordForm } from "@/components/auth/password-forms";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = { title: "Reset your password" };

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter the email you signed up with and we will send you a link to choose a new password."
      footer={<Link href="/login" className="text-accent-strong hover:underline">Back to log in</Link>}
    >
      {isSupabaseConfigured ? <ForgotPasswordForm /> : <NotConfigured />}
    </AuthLayout>
  );
}
