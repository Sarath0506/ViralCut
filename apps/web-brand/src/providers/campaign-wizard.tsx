"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

export type CampaignDraft = {
  title: string;
  category: string;
  platform: string;
  brief: string;
  doRules: string;
  avoidRules: string;
  productUrl: string;
  ratePer1kRupees: string;
  maxPayoutRupees: string;
  budgetRupees: string;
  endsAt: string;
};

const empty: CampaignDraft = {
  title: "",
  category: "",
  platform: "instagram_reels",
  brief: "",
  doRules: "",
  avoidRules: "",
  productUrl: "",
  ratePer1kRupees: "50",
  maxPayoutRupees: "50000",
  budgetRupees: "100000",
  endsAt: "",
};

const STORAGE_KEY = "viralcut_campaign_draft";

type WizardContext = {
  draft: CampaignDraft;
  update: (patch: Partial<CampaignDraft>) => void;
  reset: () => void;
};

const WizardContext = createContext<WizardContext | null>(null);

export function CampaignWizardProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [draft, setDraft] = useState<CampaignDraft>(() => {
    if (typeof window === "undefined") return empty;
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return empty;
    try {
      return { ...empty, ...JSON.parse(raw) };
    } catch {
      return empty;
    }
  });

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
    () => ({ draft, update, reset }),
    [draft, update, reset],
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
