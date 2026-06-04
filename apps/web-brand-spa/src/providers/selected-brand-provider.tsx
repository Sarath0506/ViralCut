import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const STORAGE_KEY = "viralcut.brand.selectedBrandProfileId";

type SelectedBrandContextValue = {
  brandProfileId: string | null;
  companyName: string | null;
  setBrand: (brandProfileId: string, companyName: string) => void;
  clearBrand: () => void;
};

const SelectedBrandContext = createContext<SelectedBrandContextValue | null>(
  null,
);

export function SelectedBrandProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [brandProfileId, setBrandProfileId] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as {
          brandProfileId: string;
          companyName: string;
        };
        setBrandProfileId(parsed.brandProfileId);
        setCompanyName(parsed.companyName);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const setBrand = useCallback((nextId: string, nextName: string) => {
    setBrandProfileId(nextId);
    setCompanyName(nextName);
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ brandProfileId: nextId, companyName: nextName }),
    );
  }, []);

  const clearBrand = useCallback(() => {
    setBrandProfileId(null);
    setCompanyName(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const value = useMemo(
    () => ({ brandProfileId, companyName, setBrand, clearBrand }),
    [brandProfileId, companyName, setBrand, clearBrand],
  );

  return (
    <SelectedBrandContext.Provider value={value}>
      {children}
    </SelectedBrandContext.Provider>
  );
}

export function useSelectedBrand() {
  const ctx = useContext(SelectedBrandContext);
  if (!ctx) {
    throw new Error("useSelectedBrand must be used within SelectedBrandProvider");
  }
  return ctx;
}
