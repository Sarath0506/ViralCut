import { ArrowLeft, Mail } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import { AuthPrimaryButton } from "@/components/auth/auth-primary-button";
import {
  authFooterLinkClass,
  authFormClass,
  authMutedFooterClass,
} from "@/components/auth/auth-styles";
import { AuthTextField } from "@/components/auth/auth-text-field";
import {
  AuthMobileBrandMark,
  AuthPageHeader,
  AuthSplitLayout,
  AuthTrustBadges,
} from "@/components/layout/auth-split-layout";
import { useToast } from "@/components/ui/toaster";
import { authApi, ApiError } from "@/lib/api";

export function ForgotPasswordPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      toast("If that email exists, we sent reset instructions.");
    } catch (err) {
      toast(
        err instanceof ApiError ? err.message : "Request failed",
        "error",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthSplitLayout heroVariant="login" footer={<AuthTrustBadges />}>
      <AuthMobileBrandMark />

      <AuthPageHeader
        title="Forgot password?"
        description="Enter your agency work email and we'll send a link to reset your password."
      />

      <form onSubmit={onSubmit} className={authFormClass}>
        <AuthTextField
          id="email"
          label="Work email"
          icon={Mail}
          type="email"
          autoComplete="email"
          placeholder="name@company.in"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <AuthPrimaryButton
          loading={loading}
          loadingText="Sending…"
          trailingIcon={<Mail className="size-4" />}
        >
          Send reset link
        </AuthPrimaryButton>
      </form>

      <p className={authMutedFooterClass}>
        <Link
          to="/login"
          className={`inline-flex items-center justify-center gap-1.5 ${authFooterLinkClass}`}
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to sign in
        </Link>
      </p>
    </AuthSplitLayout>
  );
}
