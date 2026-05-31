"use client";

import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";
import { useToast } from "@/components/ui/toaster";

export default function LoginPage() {
  const { login } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast("Welcome back!");
    } catch (err) {
      toast(
        err instanceof ApiError ? err.message : "Login failed",
        "error",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardTitle className="mb-1">Brand login</CardTitle>
      <p className="mb-6 text-sm text-muted">
        Manage campaigns and review creator clips.
      </p>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Work email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing in…" : "Log in"}
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-muted">
        <Link href="/forgot-password" className="text-primary hover:underline">
          Forgot password?
        </Link>
      </p>
      <p className="mt-2 text-center text-sm text-muted">
        New brand?{" "}
        <Link href="/signup" className="font-semibold text-primary hover:underline">
          Request access
        </Link>
      </p>
    </Card>
  );
}
