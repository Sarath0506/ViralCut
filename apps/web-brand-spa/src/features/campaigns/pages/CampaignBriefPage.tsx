import { useNavigate } from "react-router-dom";
import { AlertTriangle, ArrowRight, CheckCircle2 } from "lucide-react";

import { Card, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import {
  CampaignWizardFooter,
  CampaignWizardHeader,
} from "@/features/campaigns/components/campaign-wizard-layout";
import { ReferenceAssetsEditor } from "@/features/campaigns/components/reference-assets-editor";
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
        <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
          <Card>
            <CardTitle>Creative Brief</CardTitle>
            <div className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label
                  className="text-sm font-bold normal-case tracking-normal text-foreground"
                  htmlFor="hook"
                >
                  The Hook (first 3 seconds)
                </Label>
                <textarea
                  id="hook"
                  className="min-h-[96px] w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm"
                  value={draft.briefHook}
                  onChange={(e) => update({ briefHook: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label
                  className="text-sm font-bold normal-case tracking-normal text-foreground"
                  htmlFor="productFocus"
                >
                  Product Focus
                </Label>
                <textarea
                  id="productFocus"
                  className="min-h-[96px] w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm"
                  value={draft.productFocus}
                  onChange={(e) => update({ productFocus: e.target.value })}
                />
              </div>
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
                            : "border-border bg-surface text-foreground hover:bg-surface-variant",
                        )}
                      >
                        {tone}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-bold normal-case tracking-normal text-foreground">
                  Reference Assets
                </Label>
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
            </div>
          </Card>
          <div className="space-y-4">
            <Card className="bg-emerald-50/60">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                <CheckCircle2 className="h-4 w-4" />
                Do this
              </div>
              <textarea
                id="do"
                className="mt-3 min-h-[120px] w-full rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm"
                value={draft.doRules}
                onChange={(e) => update({ doRules: e.target.value })}
              />
            </Card>
            <Card className="bg-rose-50/60">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-rose-700">
                <AlertTriangle className="h-4 w-4" />
                Avoid this
              </div>
              <textarea
                id="avoid"
                className="mt-3 min-h-[120px] w-full rounded-xl border border-rose-200 bg-white px-4 py-3 text-sm"
                value={draft.avoidRules}
                onChange={(e) => update({ avoidRules: e.target.value })}
              />
            </Card>
          </div>
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
                  draft.briefHook.trim().length < 10 ||
                  draft.productFocus.trim().length < 10,
              },
            },
          ]}
        />
      </div>
    </>
  );
}
