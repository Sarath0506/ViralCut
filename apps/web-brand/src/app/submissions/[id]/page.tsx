"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/status-pill";
import { ApiError, brandApi } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";
import { useToast } from "@/components/ui/toaster";

export default function SubmissionReviewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { getToken } = useAuth();
  const token = getToken();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [rejectReason, setRejectReason] = useState("");

  const { data: submission } = useQuery({
    queryKey: ["submission", id],
    queryFn: () => brandApi.submissions.get(token!, id),
    enabled: Boolean(token && id),
  });

  const reviewMutation = useMutation({
    mutationFn: (body: { action: "approve" | "reject"; rejectionReason?: string }) =>
      brandApi.submissions.review(token!, id, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["submissions"] });
      toast("Submission updated");
      router.push("/submissions");
    },
    onError: (err) => {
      toast(err instanceof ApiError ? err.message : "Review failed", "error");
    },
  });

  const s = submission as Record<string, unknown> | undefined;
  const canReview =
    s?.status === "draft_submitted" || s?.status === "under_review";

  return (
    <DashboardShell title="Review submission">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle>Creative</CardTitle>
          {s && (
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <StatusPill status={String(s.status)} />
                <span className="text-muted">
                  {(s.campaign as { title?: string })?.title}
                </span>
              </div>
              <p>
                <span className="text-muted">Creator: </span>
                {(s.creator as { displayName?: string })?.displayName ?? "—"}
              </p>
              {Boolean(s.draftDriveUrl) && (
                <a
                  href={String(s.draftDriveUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Open draft (Drive)
                </a>
              )}
              {Boolean(s.liveReelUrl) && (
                <a
                  href={String(s.liveReelUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  View live reel
                </a>
              )}
            </div>
          )}
        </Card>

        <Card>
          <CardTitle>Decision</CardTitle>
          <p className="mt-2 text-sm text-muted">
            Approve draft so creator can post and submit live reel link.
          </p>
          {canReview ? (
            <div className="mt-4 space-y-4">
              <Button
                className="w-full"
                onClick={() => reviewMutation.mutate({ action: "approve" })}
                disabled={reviewMutation.isPending}
              >
                Approve creative
              </Button>
              <textarea
                className="min-h-[80px] w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm"
                placeholder="Rejection reason (required to reject)"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
              <Button
                variant="destructive"
                className="w-full"
                onClick={() =>
                  reviewMutation.mutate({
                    action: "reject",
                    rejectionReason: rejectReason,
                  })
                }
                disabled={reviewMutation.isPending || !rejectReason.trim()}
              >
                Reject
              </Button>
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted">
              This submission is not in a reviewable state.
            </p>
          )}
        </Card>
      </div>
    </DashboardShell>
  );
}
