import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import { Card, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import {
  CampaignWizardFooter,
  CampaignWizardHeader,
} from "@/features/campaigns/components/campaign-wizard-layout";
import { ReferenceAssetsEditor } from "@/features/campaigns/components/reference-assets-editor";
import { RulePointsEditor } from "@/features/campaigns/components/rule-points-editor";
import { meetsMinimumRuleText } from "@/features/campaigns/lib/rule-points";
import { WizardStepper } from "@/features/campaigns/components/wizard-stepper";
import { normalizeUploadUrl } from "@/lib/media-url";
import { ApiError, brandApi } from "@/lib/api";
import { useCampaignDraftSave } from "@/features/campaigns/hooks/use-campaign-draft-save";
import { useCampaignWizard } from "@/providers/campaign-wizard";
import { useAuth } from "@/providers/auth-provider";

const toneOptions = ["Energetic", "Educational", "Minimalist", "Humorous"];

export function CampaignBriefPage() {
  const navigate = useNavigate();
  const { draft, paths, update } = useCampaignWizard();
  const { getToken } = useAuth();
  const { toast } = useToast();
  const { saveDraftWithFeedback, saving } = useCampaignDraftSave();
  const uploadReferenceAsset = async (
    file: File,
    expectedType: "image" | "video",
  ): Promise<string> => {
    const token = getToken();
    if (!token) {
      throw new Error("Your session expired. Please log in again.");
    }
    const uploaded = await brandApi.campaigns.uploadReferenceAsset(token, file);
    if (uploaded.type !== expectedType) {
      throw new Error(`Please upload a valid ${expectedType} file.`);
    }
    return normalizeUploadUrl(uploaded);
  };

  const selectedTones = new Set(draft.toneOfVoice);

  const toggleTone = (tone: string) => {
    const normalized = tone.toLowerCase();
    if (selectedTones.has(normalized)) {
      update({
        toneOfVoice: draft.toneOfVoice.filter((item) => item !== normalized),
      });
      return;
    }
    update({ toneOfVoice: [...draft.toneOfVoice, normalized] });
  };

  return (
    <>
      <WizardStepper />
      <div className="pb-20">
        <CampaignWizardHeader
          title="Campaign Brief & Rules"
          subtitle="Define the creative direction and campaign guardrails."
        />
        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.18fr)_minmax(0,0.82fr)]">
          <div className="space-y-4">
            <Card>
              <CardTitle className="text-base">Reference Assets</CardTitle>
              <p className="mt-1 text-xs text-muted">
                Add links, images, or videos creators should follow.
              </p>
              <div className="mt-4">
                <ReferenceAssetsEditor
                  assets={draft.referenceAssets}
                  onChange={(referenceAssets) => update({ referenceAssets })}
                  onUploadFile={async (file, type) => {
                    try {
                      const url = await uploadReferenceAsset(file, type);
                      toast("Reference file uploaded.", "success");
                      return url;
                    } catch (error) {
                      toast(
                        error instanceof ApiError
                          ? error.message
                          : error instanceof Error
                            ? error.message
                            : "Failed to upload file",
                        "error",
                      );
                      throw error;
                    }
                  }}
                />
              </div>
            </Card>

            <RulePointsEditor
              variant="do"
              title="Do this"
              description="Add each instruction as its own point."
              addLabel="Add do point"
              placeholder="e.g. Show the product in the first 3 seconds"
              emptyHint="No do points yet. Add what creators should include."
              value={draft.doRules}
              onChange={(doRules) => update({ doRules })}
            />

            <RulePointsEditor
              variant="avoid"
              title="Avoid this"
              description="Add each restriction as its own point."
              addLabel="Add avoid point"
              placeholder="e.g. Do not mention competitor names"
              emptyHint="No avoid points yet. Add what creators must skip."
              value={draft.avoidRules}
              onChange={(avoidRules) => update({ avoidRules })}
            />
          </div>

          <Card className="h-fit self-start">
            <CardTitle>Creative Brief</CardTitle>
            <div className="mt-4 space-y-4">
              <RulePointsEditor
                variant="hook"
                title="The Hook (first 3 seconds)"
                description="Add each opening idea as its own point."
                addLabel="Add hook point"
                placeholder="e.g. Open with a bold question about the product"
                emptyHint="No hook points yet. Add how creators should start the video."
                value={draft.briefHook}
                onChange={(briefHook) => update({ briefHook })}
              />
              <RulePointsEditor
                variant="focus"
                title="Product Focus"
                description="Add each product message as its own point."
                addLabel="Add focus point"
                placeholder="e.g. Highlight the main benefit in the first 5 seconds"
                emptyHint="No focus points yet. Add what creators should emphasize."
                value={draft.productFocus}
                onChange={(productFocus) => update({ productFocus })}
              />
              <div className="space-y-2">
                <Label className="text-sm font-bold normal-case tracking-normal text-foreground">
                  Tone of Voice
                </Label>
                <div className="flex flex-wrap gap-2">
                  {toneOptions.map((tone) => {
                    const normalized = tone.toLowerCase();
                    const isActive = selectedTones.has(normalized);
                    return (
                      <button
                        key={tone}
                        type="button"
                        onClick={() => toggleTone(tone)}
                        className={cn(
                          "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                          isActive
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-background text-foreground hover:bg-surface-variant",
                        )}
                      >
                        {tone}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </Card>
        </div>
        <CampaignWizardFooter
          leftAction={{
            id: "back",
            label: "Back",
            onClick: () => navigate(-1),
            buttonProps: { size: "sm", variant: "outline" },
          }}
          rightActions={[
            {
              id: "save-draft",
              label: saving ? "Saving..." : "Save as Draft",
              onClick: () => void saveDraftWithFeedback(toast),
              buttonProps: { size: "sm", variant: "ghost", disabled: saving },
            },
            {
              id: "next",
              label: "Next",
              onClick: () => navigate(paths.payout),
              icon: <ArrowRight className="h-4 w-4" />,
              buttonProps: {
                size: "sm",
                disabled:
                  !meetsMinimumRuleText(draft.briefHook) ||
                  !meetsMinimumRuleText(draft.productFocus),
              },
            },
          ]}
        />
      </div>
    </>
  );
}
