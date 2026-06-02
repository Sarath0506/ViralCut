import { Link } from "react-router-dom";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { useBrandStats } from "@/features/dashboard/hooks/use-brand-stats";
import { formatInr, formatViews } from "@/lib/format";

export function DashboardPage() {
  const { data: stats } = useBrandStats();

  return (
    <>
      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted sm:text-base">
          Monitor live campaigns, review queue, and spend.
        </p>
      </header>

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
            to="/submissions"
            className={buttonVariants({ variant: "secondary" })}
          >
            Review submissions
          </Link>
          <Link to="/campaigns" className={buttonVariants({ variant: "outline" })}>
            View campaigns
          </Link>
        </div>
      </Card>
    </>
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
  return href ? <Link to={href}>{inner}</Link> : inner;
}
