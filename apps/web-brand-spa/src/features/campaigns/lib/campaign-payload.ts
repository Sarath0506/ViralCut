import { toApiReferenceAssets, type ReferenceAsset } from "@/features/campaigns/lib/reference-assets";
import type { CampaignDraft } from "@/providers/campaign-wizard";

export type CampaignWizardDraft = CampaignDraft & {
  campaignId: string | null;
};

export function composeCampaignBrief(draft: CampaignDraft): string {
  return [
    draft.briefHook && `HOOK:\n${draft.briefHook}`,
    draft.productFocus && `\nPRODUCT FOCUS:\n${draft.productFocus}`,
    draft.toneOfVoice.length > 0 && `\nTONE:\n${draft.toneOfVoice.join(", ")}`,
    draft.doRules && `\n\nDO:\n${draft.doRules}`,
    draft.avoidRules && `\n\nAVOID:\n${draft.avoidRules}`,
  ]
    .filter(Boolean)
    .join("");
}

export function hasInvalidReferenceAssets(assets: ReferenceAsset[]): boolean {
  return assets.some(
    (asset) =>
      (asset.type === "image" || asset.type === "video") &&
      asset.url.trim().length === 0,
  );
}

export function buildCampaignBody(
  draft: CampaignDraft,
  status: "draft" | "live",
): Record<string, unknown> {
  const referenceAssets = toApiReferenceAssets(draft.referenceAssets);
  const brief = composeCampaignBrief(draft);

  return {
    title: draft.title.trim(),
    status,
    category: draft.category || undefined,
    platforms: draft.platforms.length > 0 ? draft.platforms : ["instagram_reels"],
    startDate: draft.startDate || undefined,
    briefHook: draft.briefHook || undefined,
    productFocus: draft.productFocus || undefined,
    toneOfVoice: draft.toneOfVoice,
    doRules: draft.doRules || undefined,
    avoidRules: draft.avoidRules || undefined,
    referenceAssets: referenceAssets.length > 0 ? referenceAssets : undefined,
    coverImageUrl: draft.coverImageUrl || undefined,
    brief: brief || undefined,
    productUrl: draft.productUrl || undefined,
    ratePer1kPaise: Math.round(Number(draft.ratePer1kRupees || 50) * 100),
    maxPayoutPaise: Math.round(Number(draft.maxPayoutRupees || 50000) * 100),
    budgetPaise: Math.round(Number(draft.budgetRupees || 100000) * 100),
  };
}
