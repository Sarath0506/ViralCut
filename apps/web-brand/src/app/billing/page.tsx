"use client";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardTitle } from "@/components/ui/card";

export default function BillingPage() {
  return (
    <DashboardShell title="Billing & invoices">
      <Card>
        <CardTitle>Coming soon</CardTitle>
        <p className="mt-2 text-sm text-muted">
          Invoices and budget top-ups will be available in a later release.
        </p>
      </Card>
    </DashboardShell>
  );
}
