import { useQuery } from "@tanstack/react-query";
import { ChevronDown } from "lucide-react";

import { brandApi } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";
import { useSelectedBrand } from "@/providers/selected-brand-provider";

export function WorkspaceSwitcher() {
  const { getToken } = useAuth();
  const { brandProfileId, companyName, setBrand } = useSelectedBrand();
  const token = getToken();

  const { data: me } = useQuery({
    queryKey: ["me"],
    queryFn: () => brandApi.me(token!),
    enabled: Boolean(token),
  });

  const workspaces = me?.workspaces ?? [];
  if (workspaces.length === 0) {
    return companyName ? (
      <span className="truncate text-sm text-muted">
        <span className="font-medium text-foreground">{companyName}</span>
      </span>
    ) : null;
  }

  if (workspaces.length === 1) {
    const only = workspaces[0]!;
    return (
      <span className="truncate text-sm text-muted">
        Workspace:{" "}
        <span className="font-medium text-foreground">{only.companyName}</span>
      </span>
    );
  }

  return (
    <label className="flex min-w-0 items-center gap-2 text-sm text-muted">
      <span className="hidden shrink-0 sm:inline">Workspace</span>
      <span className="relative min-w-0 flex-1">
        <select
          className="w-full max-w-[14rem] cursor-pointer appearance-none truncate rounded-lg border border-border bg-surface py-1.5 pl-3 pr-8 text-sm font-medium text-foreground"
          value={brandProfileId ?? ""}
          onChange={(e) => {
            const next = workspaces.find(
              (w) => w.brandProfileId === e.target.value,
            );
            if (next) {
              setBrand(next.brandProfileId, next.companyName);
            }
          }}
        >
          {!brandProfileId ? (
            <option value="" disabled>
              Select workspace
            </option>
          ) : null}
          {workspaces.map((w) => (
            <option key={w.brandProfileId} value={w.brandProfileId}>
              {w.companyName}
              {w.linkedAgency ? " (agency)" : ""}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-4 -translate-y-1/2 text-muted" />
      </span>
    </label>
  );
}
