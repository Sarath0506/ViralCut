import { useQuery } from "@tanstack/react-query";

import { brandApi } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";

export function useSubmissions() {
  const { auth, getToken } = useAuth();
  const token = getToken();

  return useQuery({
    queryKey: ["submissions"],
    queryFn: () => brandApi.submissions.list(token!),
    enabled: Boolean(auth && token),
  });
}

export function useSubmission(id: string | undefined) {
  const { auth, getToken } = useAuth();
  const token = getToken();

  return useQuery({
    queryKey: ["submission", id],
    queryFn: () => brandApi.submissions.get(token!, id!),
    enabled: Boolean(auth && token && id),
  });
}
