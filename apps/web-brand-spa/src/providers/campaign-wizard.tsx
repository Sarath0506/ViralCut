import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

import { campaignToDraft } from "@/features/campaigns/lib/campaign-from-api";
import {
  parseReferenceAssetsFromText,
  type ReferenceAsset,
} from "@/features/campaigns/lib/reference-assets";
import { getWizardPaths, type WizardPaths } from "@/features/campaigns/lib/wizard-paths";
import { ApiError, brandApi } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";

export type CampaignDraft = {
  campaignId: string | null;
  coverImageUrl: string;
  title: string;
  category: string;
  platforms: string[];
  startDate: string;
  briefHook: string;
  productFocus: string;
  toneOfVoice: string[];
  doRules: string;
  avoidRules: string;
  referenceAssets: ReferenceAsset[];
  brief: string;
  productUrl: string;
  ratePer1kRupees: string;
  maxPayoutRupees: string;
  budgetRupees: string;
};

const empty: CampaignDraft = {
  campaignId: null,
  coverImageUrl: "",
  title: "",
  category: "",
  platforms: ["instagram_reels"],
  startDate: "",
  briefHook: "",
  productFocus: "",
  toneOfVoice: ["energetic"],
  doRules: "",
  avoidRules: "",
  referenceAssets: [],
  brief: "",
  productUrl: "",
  ratePer1kRupees: "50",
  maxPayoutRupees: "50000",
  budgetRupees: "100000",
};

const STORAGE_KEY = "viralcut_campaign_draft";

function hydrateDraft(raw: string | null): CampaignDraft {
  if (!raw) return empty;
  try {
    const parsed = JSON.parse(raw) as Partial<CampaignDraft> & {
      referenceAssetLinks?: string;
    };
    const merged: CampaignDraft = {
      ...empty,
      ...parsed,
      referenceAssets: Array.isArray(parsed.referenceAssets)
        ? parsed.referenceAssets.map((asset) => ({
            id: asset.id ?? crypto.randomUUID(),
            type: asset.type ?? "link",
            url: asset.url ?? "",
            label: asset.label ?? "",
          }))
        : [],
    };

    if (
      merged.referenceAssets.length === 0 &&
      typeof parsed.referenceAssetLinks === "string" &&
      parsed.referenceAssetLinks.trim()
    ) {
      return {
        ...merged,
        referenceAssets: parseReferenceAssetsFromText(parsed.referenceAssetLinks),
      };
    }

    return merged;
  } catch {
    return empty;
  }
}

type WizardContext = {
  draft: CampaignDraft;
  paths: WizardPaths;
  loading: boolean;
  loadError: string | null;
  update: (patch: Partial<CampaignDraft>) => void;
  reset: () => void;
};

const WizardContext = createContext<WizardContext | null>(null);

export function CampaignWizardProvider({
  editCampaignId,
  children,
}: {
  editCampaignId?: string;
  children: React.ReactNode;
}) {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const [draft, setDraft] = useState<CampaignDraft>(() =>
    editCampaignId ? empty : hydrateDraft(sessionStorage.getItem(STORAGE_KEY)),
  );
  const [loading, setLoading] = useState(Boolean(editCampaignId));
  const [loadError, setLoadError] = useState<string | null>(null);

  const paths = useMemo(
    () => getWizardPaths(editCampaignId ?? draft.campaignId),
    [editCampaignId, draft.campaignId],
  );

  useEffect(() => {
    if (!editCampaignId) return;

    let cancelled = false;
    async function loadCampaign() {
      const campaignId = editCampaignId as string;
      const token = getToken();
      if (!token) {
        if (!cancelled) {
          setLoadError("Your session expired. Please log in again.");
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      setLoadError(null);
      try {
        const campaign = await brandApi.campaigns.get(token, campaignId);
        if (campaign.status !== "draft") {
          if (!cancelled) {
            navigate(`/campaigns/${campaignId}`, { replace: true });
          }
          return;
        }
        if (!cancelled) {
          const next = campaignToDraft(campaign);
          setDraft(next);
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(
            error instanceof ApiError
              ? error.message
              : "Could not load campaign draft.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadCampaign();
    return () => {
      cancelled = true;
    };
  }, [editCampaignId, getToken, navigate]);

  const update = useCallback((patch: Partial<CampaignDraft>) => {
    setDraft((d) => {
      const next = { ...d, ...patch };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY);
    setDraft(empty);
  }, []);

  const value = useMemo(
    () => ({ draft, paths, loading, loadError, update, reset }),
    [draft, paths, loading, loadError, update, reset],
  );

  return (
    <WizardContext.Provider value={value}>{children}</WizardContext.Provider>
  );
}

export function useCampaignWizard() {
  const ctx = useContext(WizardContext);
  if (!ctx) {
    throw new Error("useCampaignWizard requires CampaignWizardProvider");
  }
  return ctx;
}
