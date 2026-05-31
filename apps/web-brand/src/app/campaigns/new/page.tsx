"use client";

import { useRouter } from "next/navigation";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { WizardStepper } from "@/components/campaigns/wizard-stepper";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCampaignWizard } from "@/providers/campaign-wizard";

export default function CampaignNewBasicsPage() {
  const router = useRouter();
  const { draft, update } = useCampaignWizard();

  return (
    <DashboardShell title="Create campaign">
      <WizardStepper currentPath="/campaigns/new" />
      <Card>
        <CardTitle>Step 1 — Basics</CardTitle>
        <div className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Campaign title</Label>
            <Input
              id="title"
              value={draft.title}
              onChange={(e) => update({ title: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              placeholder="Electronics"
              value={draft.category}
              onChange={(e) => update({ category: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="platform">Platform</Label>
            <Input
              id="platform"
              value={draft.platform}
              onChange={(e) => update({ platform: e.target.value })}
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <Button
            onClick={() => router.push("/campaigns/new/brief")}
            disabled={!draft.title.trim()}
          >
            Continue
          </Button>
        </div>
      </Card>
    </DashboardShell>
  );
}
