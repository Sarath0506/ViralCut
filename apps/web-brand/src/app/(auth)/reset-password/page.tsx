"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import { AuthPasswordField } from "@/components/auth/auth-password-field";
import { AuthPrimaryButton } from "@/components/auth/auth-primary-button";
import {
  authFooterLinkClass,
  authFormClass,
  authMutedFooterClass,
  authPrimaryButtonClass,
} from "@/components/auth/auth-styles";
import { cn } from "@/lib/utils";
import {
  AuthMobileBrandMark,
  AuthPageHeader,
  AuthSplitLayout,
  AuthTrustBadges,
} from "@/components/layout/auth-split-layout";
import { authApi, ApiError } from "@/lib/api";
import { useToast } from "@/components/ui/toaster";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) {
      toast("Reset link is invalid or missing.", "error");
      return;
    }
    if (password !== confirm) {
      toast("Passwords do not match.", "error");
      return;
    }
    setLoading(true);
    try {
      await authApi.resetPassword({ token, password });
      toast("Password updated. You can log in now.");
      router.replace("/login");
    } catch (err) {
      toast(
        err instanceof ApiError ? err.message : "Reset failed",
        "error",
      );
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <>
        <AuthMobileBrandMark />

        <AuthPageHeader
          title="Invalid reset link"
          description="This link may have expired. Request a new password reset email."
        />

        <Link
          href="/forgot-password"
          className={cn(
            authPrimaryButtonClass,
            "inline-flex items-center justify-center bg-primary text-primary-foreground hover:opacity-90",
          )}
        >
          Request reset link
        </Link>

        <p className={authMutedFooterClass}>
          <Link
            href="/login"
            className={`inline-flex items-center justify-center gap-1.5 ${authFooterLinkClass}`}
          >
            <ArrowLeft className="size-4" aria-hidden />
            Back to sign in
          </Link>
        </p>
      </>
    );
  }

  return (
    <>
      <AuthMobileBrandMark />

      <AuthPageHeader
        title="Set new password"
        description="Choose a new password for your brand account."
      />

      <form onSubmit={onSubmit} className={authFormClass}>
        <AuthPasswordField
          id="password"
          label="New password"
          autoComplete="new-password"
          value={password}
          onChange={setPassword}
        />

        <AuthPasswordField
          id="confirm"
          label="Confirm password"
          autoComplete="new-password"
          value={confirm}
          onChange={setConfirm}
        />

        <AuthPrimaryButton loading={loading} loadingText="Saving…">
          Update password
        </AuthPrimaryButton>
      </form>

      <p className={authMutedFooterClass}>
        <Link
          href="/login"
          className={`inline-flex items-center justify-center gap-1.5 ${authFooterLinkClass}`}
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to sign in
        </Link>
      </p>
    </>
  );
}

function ResetPasswordFallback() {
  return (
    <>
      <AuthMobileBrandMark />
      <AuthPageHeader
        title="Set new password"
        description="Loading your reset link…"
      />
      <p className="text-sm text-muted">Please wait.</p>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthSplitLayout heroVariant="login" footer={<AuthTrustBadges />}>
      <Suspense fallback={<ResetPasswordFallback />}>
        <ResetPasswordForm />
      </Suspense>
    </AuthSplitLayout>
  );
}
