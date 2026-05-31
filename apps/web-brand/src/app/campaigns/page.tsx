"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { StatusPill } from "@/components/ui/status-pill";
import { brandApi } from "@/lib/api";
import { formatInr } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";

export default function CampaignsPage() {
  const { getToken } = useAuth();
  const token = getToken();

  const { data: campaigns, isLoading } = useQuery({
    queryKey: ["campaigns"],
    queryFn: () => brandApi.campaigns.list(token!),
    enabled: Boolean(token),
  });

  return (
    <DashboardShell title="Campaigns">
      <div className="mb-6 flex justify-end">
        <Link href="/campaigns/new" className={buttonVariants()}>
          Create campaign
        </Link>
      </div>

      {isLoading && <p className="text-muted">Loading campaigns…</p>}

      {!isLoading && campaigns?.length === 0 && (
        <Card className="text-center">
          <p className="text-lg font-semibold">No campaigns yet</p>
          <p className="mt-2 text-sm text-muted">
            Create your first CPV campaign for Indian creators.
          </p>
          <Link href="/campaigns/new" className={cn(buttonVariants(), "mt-4 inline-flex")}>
            Create campaign
          </Link>
        </Card>
      )}

      <div className="space-y-4">
        {campaigns?.map((c) => (
          <Card key={c.id} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/campaigns/${c.id}`}
                  className="font-display text-lg font-bold hover:text-primary"
                >
                  {c.title}
                </Link>
                <StatusPill status={c.status} />
              </div>
              <p className="mt-1 text-sm font-semibold text-money">
                {c.ratePer1kDisplay}
              </p>
              <p className="mt-2 text-sm text-muted line-clamp-2">{c.brief}</p>
              <div className="mt-3 max-w-xs">
                <div className="mb-1 flex justify-between text-xs text-muted">
                  <span>Pool used</span>
                  <span>{c.poolPercent}%</span>
                </div>
                <ProgressBar
                  percent={c.poolPercent}
                  variant={c.poolPercent > 80 ? "warning" : "default"}
                />
              </div>
            </div>
            <div className="text-right text-sm">
              <p className="text-muted">Max payout</p>
              <p className="font-semibold">{formatInr(c.maxPayoutPaise)}</p>
              <Link
                href={`/campaigns/${c.id}`}
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-3 inline-flex")}
              >
                View
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </DashboardShell>
  );
}
