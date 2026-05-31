"use client";

import { useRouter } from "next/navigation";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { WizardStepper } from "@/components/campaigns/wizard-stepper";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCampaignWizard } from "@/providers/campaign-wizard";

export default function CampaignPayoutPage() {
  const router = useRouter();
  const { draft, update } = useCampaignWizard();

  return (
    <DashboardShell title="Create campaign">
      <WizardStepper currentPath="/campaigns/new/payout" />
      <Card>
        <CardTitle>Step 3 — Payout & budget</CardTitle>
        <p className="mt-2 text-sm text-muted">
          CPV is shown to creators as e.g. ₹50 / 1K views
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="rate">₹ per 1K views</Label>
            <Input
              id="rate"
              type="number"
              min={1}
              value={draft.ratePer1kRupees}
              onChange={(e) => update({ ratePer1kRupees: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="max">Max payout per creator (₹)</Label>
            <Input
              id="max"
              type="number"
              value={draft.maxPayoutRupees}
              onChange={(e) => update({ maxPayoutRupees: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="budget">Total campaign budget (₹)</Label>
            <Input
              id="budget"
              type="number"
              value={draft.budgetRupees}
              onChange={(e) => update({ budgetRupees: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ends">End date (optional)</Label>
            <Input
              id="ends"
              type="date"
              value={draft.endsAt}
              onChange={(e) => update({ endsAt: e.target.value })}
            />
          </div>
        </div>
        <div className="mt-6 flex justify-between">
          <Button variant="outline" onClick={() => router.back()}>
            Back
          </Button>
          <Button onClick={() => router.push("/campaigns/new/review")}>
            Continue
          </Button>
        </div>
      </Card>
    </DashboardShell>
  );
}
