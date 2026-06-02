import type { ReferenceAsset } from "@/features/campaigns/lib/reference-assets";
import type { Campaign } from "@/lib/api";
import type { CampaignDraft } from "@/providers/campaign-wizard";

function toDateInputValue(iso: string | null): string {
  if (!iso) return "";
  return iso.slice(0, 10);
}

function mapReferenceAssets(
  assets: Campaign["referenceAssets"],
): ReferenceAsset[] {
  if (!assets || !Array.isArray(assets)) return [];
  return assets.map((asset) => ({
    id: crypto.randomUUID(),
    type: asset.type,
    url: asset.url,
    label: asset.label ?? "",
  }));
}

export function campaignToDraft(campaign: Campaign): CampaignDraft {
  return {
    campaignId: campaign.id,
    title: campaign.title,
    category: campaign.category ?? "",
    platforms:
      campaign.platforms.length > 0
        ? campaign.platforms
        : [campaign.platform],
    startDate: toDateInputValue(campaign.startDate),
    briefHook: campaign.briefHook ?? "",
    productFocus: campaign.productFocus ?? "",
    toneOfVoice: campaign.toneOfVoice ?? [],
    doRules: campaign.doRules ?? "",
    avoidRules: campaign.avoidRules ?? "",
    referenceAssets: mapReferenceAssets(campaign.referenceAssets),
    coverImageUrl: campaign.coverImageUrl ?? "",
    brief: campaign.brief,
    productUrl: campaign.productUrl ?? "",
    ratePer1kRupees: String(campaign.ratePer1kPaise / 100),
    maxPayoutRupees: String(campaign.maxPayoutPaise / 100),
    budgetRupees: String(campaign.budgetPaise / 100),
  };
}
