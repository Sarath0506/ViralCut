"use client";

import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authApi, ApiError } from "@/lib/api";
import { useToast } from "@/components/ui/toaster";

export default function ForgotPasswordPage() {
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
    <Card>
      <CardTitle className="mb-1">Forgot password</CardTitle>
      <p className="mb-6 text-sm text-muted">
        Enter your brand account email.
      </p>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Work email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          Send reset link
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
