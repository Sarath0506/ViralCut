import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/toaster";
import { ApiError, brandApi } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";

export function BrandSettingsPage() {
  const { auth, getToken } = useAuth();
  const token = getToken();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: me } = useQuery({
    queryKey: ["me"],
    queryFn: () => brandApi.me(token!),
    enabled: Boolean(token),
  });

  const { data: agencyLink } = useQuery({
    queryKey: ["brand-agency"],
    queryFn: () => brandApi.agency.get(token!),
    enabled: Boolean(token),
  });

  const revokeMutation = useMutation({
    mutationFn: () => brandApi.agency.revoke(token!),
    onSuccess: () => {
      toast("Agency disconnected.", "success");
      void queryClient.invalidateQueries({ queryKey: ["brand-agency"] });
    },
    onError: (err) => {
      toast(
        err instanceof ApiError ? err.message : "Could not disconnect agency",
        "error",
      );
    },
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
      <Card className="mb-4 max-w-lg">
        <CardTitle>Account</CardTitle>
        <dl className="mt-4 space-y-3 text-sm">
          <div>
            <dt className="text-muted">Company</dt>
            <dd className="font-semibold">
              {me?.brandProfile?.companyName ?? me?.companyName ?? "—"}
            </dd>
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

      <Card className="max-w-lg">
        <CardTitle>Agency access</CardTitle>
        {agencyLink?.agency ? (
          <div className="mt-4 space-y-3 text-sm">
            <p>
              <span className="text-muted">Managed by </span>
              <span className="font-semibold">
                {agencyLink.agency.companyName}
              </span>
            </p>
            <p className="text-muted">
              Campaigns remain with your brand if you disconnect the agency.
            </p>
            <Button
              variant="outline"
              size="sm"
              disabled={revokeMutation.isPending}
              onClick={() => {
                if (
                  window.confirm(
                    "Disconnect this agency? They will lose access immediately.",
                  )
                ) {
                  revokeMutation.mutate();
                }
              }}
            >
              Disconnect agency
            </Button>
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted">
            No agency is linked to this brand workspace.
          </p>
        )}
      </Card>
    </>
  );
}
