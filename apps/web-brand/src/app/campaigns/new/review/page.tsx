"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { WizardStepper } from "@/components/campaigns/wizard-stepper";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { ApiError, brandApi } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";
import { useCampaignWizard } from "@/providers/campaign-wizard";
import { useToast } from "@/components/ui/toaster";

export default function CampaignReviewPage() {
  const router = useRouter();
  const { getToken } = useAuth();
  const { draft, reset } = useCampaignWizard();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const fullBrief = [
    draft.brief,
    draft.doRules && `\n\nDO:\n${draft.doRules}`,
    draft.avoidRules && `\n\nAVOID:\n${draft.avoidRules}`,
  ]
    .filter(Boolean)
    .join("");

  async function publish() {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    try {
      const campaign = await brandApi.campaigns.create(token, {
        title: draft.title,
        category: draft.category || undefined,
        platform: draft.platform,
        brief: fullBrief,
        productUrl: draft.productUrl || undefined,
        ratePer1kPaise: Math.round(Number(draft.ratePer1kRupees) * 100),
        maxPayoutPaise: Math.round(Number(draft.maxPayoutRupees) * 100),
        budgetPaise: Math.round(Number(draft.budgetRupees) * 100),
        endsAt: draft.endsAt
          ? new Date(draft.endsAt).toISOString()
          : undefined,
      });
      reset();
      toast("Campaign published!");
      router.push(`/campaigns/${campaign.id}`);
    } catch (err) {
      toast(
        err instanceof ApiError ? err.message : "Failed to publish",
        "error",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <DashboardShell title="Create campaign">
      <WizardStepper currentPath="/campaigns/new/review" />
      <Card>
        <CardTitle>Step 4 — Review & publish</CardTitle>
        <dl className="mt-4 space-y-3 text-sm">
          <div>
            <dt className="text-muted">Title</dt>
            <dd className="font-semibold">{draft.title}</dd>
          </div>
          <div>
            <dt className="text-muted">CPV</dt>
            <dd className="font-semibold text-money">
              ₹{draft.ratePer1kRupees} / 1K views
            </dd>
          </div>
          <div>
            <dt className="text-muted">Budget</dt>
            <dd className="font-semibold">₹{draft.budgetRupees}</dd>
          </div>
          <div>
            <dt className="text-muted">Brief</dt>
            <dd className="whitespace-pre-wrap">{fullBrief}</dd>
          </div>
        </dl>
        <div className="mt-6 flex justify-between">
          <Button variant="outline" onClick={() => router.back()}>
            Back
          </Button>
          <Button onClick={publish} disabled={loading}>
            {loading ? "Publishing…" : "Publish campaign"}
          </Button>
        </div>
      </Card>
    </DashboardShell>
  );
}
