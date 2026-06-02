import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ImagePlus, Instagram, Loader2, Youtube } from "lucide-react";

import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import {
  CampaignWizardFooter,
  CampaignWizardHeader,
} from "@/features/campaigns/components/campaign-wizard-layout";
import { WizardStepper } from "@/features/campaigns/components/wizard-stepper";
import { useCampaignDraftSave } from "@/features/campaigns/hooks/use-campaign-draft-save";
import { normalizeUploadUrl, resolveMediaUrl } from "@/lib/media-url";
import { ApiError, brandApi } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";
import { useCampaignWizard } from "@/providers/campaign-wizard";

const platforms = [
  { value: "instagram_reels", label: "Instagram Reels", icon: Instagram },
  { value: "youtube_shorts", label: "YouTube Shorts", icon: Youtube },
];

const MAX_COVER_BYTES = 3 * 1024 * 1024;

export function CampaignNewBasicsPage() {
  const navigate = useNavigate();
  const { draft, paths, update } = useCampaignWizard();
  const { getToken } = useAuth();
  const { toast } = useToast();
  const { saveDraftWithFeedback, saving } = useCampaignDraftSave();
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const selectedPlatforms = new Set(draft.platforms);

  const onCoverSelected = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast("Cover must be an image (PNG, JPG, or WEBP).", "error");
      return;
    }
    if (file.size > MAX_COVER_BYTES) {
      toast("Cover image must be 3MB or smaller.", "error");
      return;
    }
    const token = getToken();
    if (!token) {
      toast("Your session expired. Please log in again.", "error");
      return;
    }
    setUploadingCover(true);
    try {
      const uploaded = await brandApi.campaigns.uploadCoverImage(token, file);
      update({ coverImageUrl: normalizeUploadUrl(uploaded) });
      toast("Cover image uploaded.", "success");
    } catch (error) {
      toast(
        error instanceof ApiError ? error.message : "Failed to upload cover image.",
        "error",
      );
    } finally {
      setUploadingCover(false);
    }
  };

  const togglePlatform = (value: string) => {
    if (selectedPlatforms.has(value)) {
      update({ platforms: draft.platforms.filter((item) => item !== value) });
      return;
    }
    update({ platforms: [...draft.platforms, value] });
  };

  return (
    <>
      <WizardStepper />
      <div className="space-y-6 pb-20">
        <CampaignWizardHeader
          title={draft.campaignId ? "Edit Campaign" : "Create New Campaign"}
          subtitle="Set up your performance-driven creator campaign."
        />
        <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
          <Card>
            <CardTitle className="text-base font-bold text-foreground">
              Campaign Identity
            </CardTitle>
            <div className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-bold normal-case tracking-normal text-foreground" htmlFor="title">
                  Campaign Name
                </Label>
                <Input
                  id="title"
                  value={draft.title}
                  onChange={(e) => update({ title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-bold normal-case tracking-normal text-foreground" htmlFor="category">
                  Category
                </Label>
                <Input
                  id="category"
                  value={draft.category}
                  onChange={(e) => update({ category: e.target.value })}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-sm font-bold normal-case tracking-normal text-foreground">
                    Target Platforms
                  </Label>
                  <div className="flex flex-col gap-2">
                    {platforms.map((platform) => {
                      const Icon = platform.icon;
                      const isSelected = selectedPlatforms.has(platform.value);
                      return (
                        <button
                          key={platform.value}
                          type="button"
                          onClick={() => togglePlatform(platform.value)}
                          className={cn(
                            "flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition",
                            isSelected
                              ? "border-primary bg-primary/10"
                              : "border-border bg-surface hover:bg-surface-variant",
                          )}
                        >
                          <span
                            className={cn(
                              "inline-flex h-8 w-8 items-center justify-center rounded-full",
                              isSelected ? "bg-primary/20 text-primary" : "bg-surface-variant text-muted",
                            )}
                          >
                            <Icon className="h-4 w-4" />
                          </span>
                          <span className="flex flex-col">
                            <span
                              className={cn(
                                "text-sm font-semibold",
                                isSelected ? "text-primary" : "text-foreground",
                              )}
                            >
                              {platform.label.includes("Instagram")
                                ? "Instagram"
                                : "YouTube"}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-surface p-3">
                  <Label
                    className="text-sm font-bold normal-case tracking-normal text-foreground"
                    htmlFor="startDate"
                  >
                    Campaign Timeline
                  </Label>
                  <div className="mt-2 space-y-2">
                    <Label
                      className="text-sm font-bold normal-case tracking-normal text-foreground"
                      htmlFor="startDate"
                    >
                      Start Date
                    </Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={draft.startDate}
                      onChange={(e) => update({ startDate: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>
          <div className="space-y-4">
            <Card className="border-dashed">
              <CardTitle className="text-base font-bold text-foreground">
                Campaign Cover Image
              </CardTitle>
              <button
                type="button"
                disabled={uploadingCover}
                onClick={() => coverInputRef.current?.click()}
                className={cn(
                  "relative mt-4 flex h-[320px] w-full flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-surface-variant/50 text-muted",
                  uploadingCover && "opacity-70",
                )}
              >
                {draft.coverImageUrl ? (
                  <img
                    src={resolveMediaUrl(draft.coverImageUrl)}
                    alt="Campaign cover preview"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <>
                    <ImagePlus className="h-7 w-7" />
                    <span className="mt-2 text-sm font-semibold">No file selected</span>
                  </>
                )}
                <span className="relative z-10 mt-2 rounded-full bg-background/90 px-3 py-1 text-xs font-semibold">
                  {uploadingCover ? (
                    <span className="inline-flex items-center gap-1">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Uploading...
                    </span>
                  ) : draft.coverImageUrl ? (
                    "Replace cover image"
                  ) : (
                    "PNG, JPG, WEBP up to 3MB"
                  )}
                </span>
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(e) => void onCoverSelected(e.target.files?.[0])}
                />
              </button>
            </Card>
          </div>
        </div>
        <CampaignWizardFooter
          leftAction={{
            id: "cancel",
            label: "Cancel",
            onClick: () => navigate("/campaigns"),
            buttonProps: { size: "sm", variant: "outline" },
          }}
          rightActions={[
            {
              id: "save-draft",
              label: saving ? "Saving..." : "Save as Draft",
              onClick: () => void saveDraftWithFeedback(toast),
              buttonProps: { size: "sm", variant: "outline", disabled: saving },
            },
            {
              id: "next",
              label: "Next",
              onClick: () => navigate(paths.brief),
              icon: <ArrowRight className="h-4 w-4" />,
              buttonProps: { size: "sm", disabled: !draft.title.trim() },
            },
          ]}
        />
      </div>
    </>
  );
}
