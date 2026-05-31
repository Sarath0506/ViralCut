"use client";

import { useQuery } from "@tanstack/react-query";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardTitle } from "@/components/ui/card";
import { brandApi } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";

export default function BrandSettingsPage() {
  const { getToken, auth } = useAuth();
  const token = getToken();

  const { data: me } = useQuery({
    queryKey: ["me"],
    queryFn: () => brandApi.me(token!),
    enabled: Boolean(token),
  });

  return (
    <DashboardShell title="Brand profile">
      <Card className="max-w-lg">
        <CardTitle>Account</CardTitle>
        <dl className="mt-4 space-y-3 text-sm">
          <div>
            <dt className="text-muted">Company</dt>
            <dd className="font-semibold">{me?.companyName ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-muted">Email</dt>
            <dd className="font-semibold">{me?.email ?? auth?.user.email}</dd>
          </div>
          <div>
            <dt className="text-muted">Display name</dt>
            <dd className="font-semibold">{me?.displayName ?? "—"}</dd>
          </div>
        </dl>
      </Card>
    </DashboardShell>
  );
}
