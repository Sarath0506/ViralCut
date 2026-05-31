"use client";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardTitle } from "@/components/ui/card";

export default function AnalyticsPage() {
  return (
    <DashboardShell title="Analytics">
      <Card>
        <CardTitle>Coming soon</CardTitle>
        <p className="mt-2 text-sm text-muted">
          Campaign views, spend, and creator performance charts will appear here.
        </p>
      </Card>
    </DashboardShell>
  );
}
