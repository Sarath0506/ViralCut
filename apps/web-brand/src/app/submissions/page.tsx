"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/status-pill";
import { brandApi } from "@/lib/api";
import { formatInr } from "@/lib/format";
import { useAuth } from "@/providers/auth-provider";

export default function SubmissionsPage() {
  const { getToken } = useAuth();
  const token = getToken();

  const { data: submissions, isLoading } = useQuery({
    queryKey: ["submissions"],
    queryFn: () => brandApi.submissions.list(token!),
    enabled: Boolean(token),
  });

  const pending = submissions?.filter((s) =>
    ["draft_submitted", "under_review"].includes(s.status),
  );

  return (
    <DashboardShell title="Submissions">
      {isLoading && <p className="text-muted">Loading queue…</p>}

      {!isLoading && submissions?.length === 0 && (
        <Card className="text-center">
          <p className="font-semibold">No submissions yet</p>
          <p className="mt-2 text-sm text-muted">
            When creators submit work, they appear here for review.
          </p>
        </Card>
      )}

      {pending && pending.length > 0 && (
        <p className="mb-4 text-sm font-medium text-warning">
          {pending.length} awaiting review
        </p>
      )}

      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-variant text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3">Creator</th>
              <th className="px-4 py-3">Campaign</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Est. earnings</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {submissions?.map((s) => (
              <tr key={s.id} className="border-t border-border bg-surface">
                <td className="px-4 py-3 font-medium">{s.creatorName}</td>
                <td className="px-4 py-3 text-muted">{s.campaignTitle}</td>
                <td className="px-4 py-3">
                  <StatusPill status={s.status} />
                </td>
                <td className="px-4 py-3 font-medium text-money">
                  {formatInr(s.estimatedPaise)}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/submissions/${s.id}`}
                    className="font-semibold text-primary hover:underline"
                  >
                    Review
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardShell>
  );
}
