"use client";

import { useRouter } from "next/navigation";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { WizardStepper } from "@/components/campaigns/wizard-stepper";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCampaignWizard } from "@/providers/campaign-wizard";

export default function CampaignBriefPage() {
  const router = useRouter();
  const { draft, update } = useCampaignWizard();

  return (
    <DashboardShell title="Create campaign">
      <WizardStepper currentPath="/campaigns/new/brief" />
      <Card>
        <CardTitle>Step 2 — Brief & rules</CardTitle>
        <div className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="brief">Campaign brief</Label>
            <textarea
              id="brief"
              className="min-h-[120px] w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm"
              value={draft.brief}
              onChange={(e) => update({ brief: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="do">Do this</Label>
            <textarea
              id="do"
              className="min-h-[80px] w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm"
              value={draft.doRules}
              onChange={(e) => update({ doRules: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="avoid">Avoid this</Label>
            <textarea
              id="avoid"
              className="min-h-[80px] w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm"
              value={draft.avoidRules}
              onChange={(e) => update({ avoidRules: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="product">Product URL</Label>
            <Input
              id="product"
              type="url"
              value={draft.productUrl}
              onChange={(e) => update({ productUrl: e.target.value })}
            />
          </div>
        </div>
        <div className="mt-6 flex justify-between">
          <Button variant="outline" onClick={() => router.back()}>
            Back
          </Button>
          <Button
            onClick={() => router.push("/campaigns/new/payout")}
            disabled={draft.brief.length < 20}
          >
            Continue
          </Button>
        </div>
      </Card>
    </DashboardShell>
  );
}
