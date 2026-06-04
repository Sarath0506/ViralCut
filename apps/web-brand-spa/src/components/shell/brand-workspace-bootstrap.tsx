import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { brandApi } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";
import { useSelectedBrand } from "@/providers/selected-brand-provider";

/** Picks a default workspace when none is stored (single workspace or agency-linked). */
export function BrandWorkspaceBootstrap() {
  const { getToken } = useAuth();
  const { brandProfileId, setBrand } = useSelectedBrand();
  const token = getToken();

  const { data: me } = useQuery({
    queryKey: ["me"],
    queryFn: () => brandApi.me(token!),
    enabled: Boolean(token),
  });

  useEffect(() => {
    const workspaces = me?.workspaces ?? [];
    if (workspaces.length === 0) return;

    const pickDefault = () => {
      const preferred =
        workspaces.find((w) => w.linkedAgency) ?? workspaces[0];
      if (preferred) {
        setBrand(preferred.brandProfileId, preferred.companyName);
      }
    };

    if (!brandProfileId) {
      pickDefault();
      return;
    }

    const stillValid = workspaces.some(
      (w) => w.brandProfileId === brandProfileId,
    );
    if (!stillValid) {
      pickDefault();
    }
  }, [brandProfileId, me, setBrand]);

  return null;
}
