"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { StatusPill } from "@/components/ui/status-pill";
import { brandApi } from "@/lib/api";
import { formatInr } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";

export default function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { getToken } = useAuth();
  const token = getToken();

  const { data: campaign } = useQuery({
    queryKey: ["campaign", id],
    queryFn: () => brandApi.campaigns.get(token!, id),
    enabled: Boolean(token && id),
  });

  if (!campaign) {
    return (
      <DashboardShell title="Campaign">
        <p className="text-muted">Loading…</p>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell title={campaign.title}>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <StatusPill status={campaign.status} />
        <span className="text-sm font-semibold text-money">
          {campaign.ratePer1kDisplay}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardTitle>Campaign brief</CardTitle>
          <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed">
            {campaign.brief}
          </p>
          {campaign.productUrl && (
            <a
              href={campaign.productUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
            >
              Product page
            </a>
          )}
        </Card>

        <Card>
          <CardTitle>Budget pool</CardTitle>
          <p className="mt-2 text-2xl font-bold">
            {formatInr(campaign.budgetUsedPaise)}{" "}
            <span className="text-base font-normal text-muted">
              / {formatInr(campaign.budgetPaise)}
            </span>
          </p>
          <ProgressBar
            className="mt-4"
            percent={campaign.poolPercent}
            variant={campaign.poolPercent > 80 ? "warning" : "default"}
          />
          <p className="mt-2 text-sm text-muted">
            {campaign.poolRemainingPercent}% remaining
          </p>
          <p className="mt-4 text-sm text-muted">
            {campaign.submissionCount ?? 0} submissions
          </p>
          <Link
            href="/submissions"
            className={cn(buttonVariants(), "mt-4 inline-flex w-full justify-center")}
          >
            Review submissions
          </Link>
        </Card>
      </div>
    </DashboardShell>
  );
}
