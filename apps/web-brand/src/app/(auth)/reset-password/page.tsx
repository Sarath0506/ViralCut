"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
      <Card>
        <CardTitle className="mb-1">Invalid reset link</CardTitle>
        <p className="mb-6 text-sm text-muted">
          Request a new link from the forgot password page.
        </p>
        <Link
          href="/forgot-password"
          className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          Request reset link
        </Link>
      </Card>
    );
  }

  return (
    <Card>
      <CardTitle className="mb-1">Set new password</CardTitle>
      <p className="mb-6 text-sm text-muted">
        Choose a new password for your brand account.
      </p>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">New password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm">Confirm password</Label>
          <Input
            id="confirm"
            type="password"
            autoComplete="new-password"
            minLength={8}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Saving…" : "Update password"}
        </Button>
      </form>
      <p className="mt-4 text-center text-sm">
        <Link href="/login" className="text-primary hover:underline">
          Back to login
        </Link>
      </p>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <Card>
          <CardTitle className="mb-1">Set new password</CardTitle>
          <p className="text-sm text-muted">Loading…</p>
        </Card>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
