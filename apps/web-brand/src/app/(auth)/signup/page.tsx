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

export default function SignupPage() {
  const { register } = useAuth();
  const { toast } = useToast();
  const [form, setForm] = useState({
    email: "",
    password: "",
    companyName: "",
    displayName: "",
  });
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await register({
        email: form.email,
        password: form.password,
        companyName: form.companyName,
        displayName: form.displayName || undefined,
      });
      toast("Account created!");
    } catch (err) {
      toast(
        err instanceof ApiError ? err.message : "Signup failed",
        "error",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardTitle className="mb-1">Brand sign up</CardTitle>
      <p className="mb-6 text-sm text-muted">
        Post campaigns. Pay creators per 1K views.
      </p>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="company">Company name</Label>
          <Input
            id="company"
            value={form.companyName}
            onChange={(e) =>
              setForm((f) => ({ ...f, companyName: e.target.value }))
            }
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Work email</Label>
          <Input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            minLength={8}
            value={form.password}
            onChange={(e) =>
              setForm((f) => ({ ...f, password: e.target.value }))
            }
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creating…" : "Create account"}
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Log in
        </Link>
      </p>
    </Card>
  );
}
