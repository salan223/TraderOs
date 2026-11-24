import type { Metadata } from "next";
import { AuthLayout, NotConfigured } from "@/components/auth/auth-ui";
import { ResetPasswordForm } from "@/components/auth/password-forms";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = { title: "Choose a new password" };

/** Reached from the password-reset email, via /auth/callback, which signs the user in first. */
export default function ResetPasswordPage() {
  return (
    <AuthLayout title="Choose a new password">
      {isSupabaseConfigured ? <ResetPasswordForm /> : <NotConfigured />}
    </AuthLayout>
  );
}
