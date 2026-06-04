import { useQuery } from "@tanstack/react-query";

import { brandApi } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";

export function useBrandStats() {
  const { auth, getToken } = useAuth();
  const token = getToken();

  return useQuery({
    queryKey: ["brand-stats"],
    queryFn: () => brandApi.stats(token!),
    enabled: Boolean(auth && token),
  });
}
