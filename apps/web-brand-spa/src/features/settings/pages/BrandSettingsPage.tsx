import { useQuery } from "@tanstack/react-query";

import { Card, CardTitle } from "@/components/ui/card";
import { brandApi } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";

export function BrandSettingsPage() {
  const { auth, getToken } = useAuth();
  const token = getToken();

  const { data: me } = useQuery({
    queryKey: ["me"],
    queryFn: () => brandApi.me(token!),
    enabled: Boolean(token),
  });

  return (
    <>
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold text-foreground">
          Settings
        </h2>
        <p className="mt-1 text-sm text-muted">
          Brand profile and account preferences.
        </p>
      </div>
      <Card className="max-w-lg">
        <CardTitle>Account</CardTitle>
        <dl className="mt-4 space-y-3 text-sm">
          <div>
            <dt className="text-muted">Company</dt>
            <dd className="font-semibold">{me?.companyName ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-muted">Email</dt>
            <dd className="font-semibold">{me?.email ?? auth?.user.email}</dd>
          </div>
          <div>
            <dt className="text-muted">Display name</dt>
            <dd className="font-semibold">{me?.displayName ?? "—"}</dd>
          </div>
        </dl>
      </Card>
    </>
  );
}
