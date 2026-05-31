"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { brandApi } from "@/lib/api";
import { formatInr, formatViews } from "@/lib/format";
import { useAuth } from "@/providers/auth-provider";

export default function DashboardPage() {
  const { getToken } = useAuth();
  const token = getToken();

  const { data: stats } = useQuery({
    queryKey: ["brand-stats"],
    queryFn: () => brandApi.stats(token!),
    enabled: Boolean(token),
  });

  return (
    <DashboardShell title="Dashboard">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-muted">
          Monitor live campaigns, review queue, and spend.
        </p>
        <Link href="/campaigns/new" className={buttonVariants()}>
          Create campaign
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Live campaigns" value={String(stats?.liveCampaigns ?? 0)} />
        <KpiCard
          label="Pending reviews"
          value={String(stats?.pendingReviews ?? 0)}
          href="/submissions"
        />
        <KpiCard
          label="Budget used"
          value={formatInr(stats?.budgetUsedPaise ?? 0)}
        />
        <KpiCard
          label="Total views"
          value={formatViews(stats?.totalViews ?? 0)}
        />
      </div>

      <Card className="mt-6">
        <CardTitle>Quick actions</CardTitle>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/submissions"
            className={buttonVariants({ variant: "secondary" })}
          >
            Review submissions
          </Link>
          <Link href="/campaigns" className={buttonVariants({ variant: "outline" })}>
            View campaigns
          </Link>
        </div>
      </Card>
    </DashboardShell>
  );
}

function KpiCard({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href?: string;
}) {
  const inner = (
    <Card className={href ? "transition-shadow hover:shadow-md" : ""}>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">
        {label}
      </p>
      <p className="mt-2 font-display text-2xl font-bold text-foreground">
        {value}
      </p>
    </Card>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}
