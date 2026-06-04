import { useMutation, useQuery } from "@tanstack/react-query";
import { User } from "lucide-react";
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { AuthPasswordField } from "@/components/auth/auth-password-field";
import { AuthPrimaryButton } from "@/components/auth/auth-primary-button";
import { AuthTextField } from "@/components/auth/auth-text-field";
import { Card, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/toaster";
import { ApiError, authApi } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";

export function AcceptInvitePage() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const { auth } = useAuth();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");

  const previewQuery = useQuery({
    queryKey: ["brand-invite-preview", token],
    queryFn: () => authApi.previewBrandInvite(token),
    enabled: token.length > 0,
  });

  const acceptMutation = useMutation({
    mutationFn: (body: {
      token: string;
      password?: string;
      displayName?: string;
    }) => authApi.acceptBrandInvite(body),
    onSuccess: () => {
      toast("Invite accepted. You can manage this brand workspace.", "success");
      window.location.href = "/dashboard";
    },
    onError: (err) => {
      toast(err instanceof ApiError ? err.message : "Accept failed", "error");
    },
  });

  if (!token) {
    return (
      <Card className="mx-auto max-w-md">
        <CardTitle>Invalid invite link</CardTitle>
        <p className="mt-2 text-sm text-muted">Missing token in the URL.</p>
      </Card>
    );
  }

  if (previewQuery.isLoading) {
    return <p className="text-sm text-muted">Loading invite…</p>;
  }

  const preview = previewQuery.data;
  if (!preview?.valid) {
    return (
      <Card className="mx-auto max-w-md">
        <CardTitle>
          {preview?.expired ? "Invite expired" : "Invite unavailable"}
        </CardTitle>
        <p className="mt-2 text-sm text-muted">
          Ask your agency to send a new invitation.
        </p>
        <Link className="mt-4 inline-block text-sm text-primary" to="/login">
          Go to sign in
        </Link>
      </Card>
    );
  }

  const isLoggedInBrand = auth?.user.role === "brand";

  return (
    <Card className="mx-auto max-w-md">
      <CardTitle>Accept brand workspace invite</CardTitle>
      <p className="mt-2 text-sm text-muted">
        <strong>{preview.agencyName}</strong> invited you to manage{" "}
        <strong>{preview.brandName}</strong>
        {preview.email ? ` (${preview.email})` : ""}.
      </p>

      {isLoggedInBrand ? (
        <div className="mt-6">
          <p className="mb-3 text-sm text-muted">
            Signed in as {auth.user.email}.
          </p>
          <AuthPrimaryButton
            type="button"
            loading={acceptMutation.isPending}
            onClick={() => acceptMutation.mutate({ token })}
          >
            Accept invite
          </AuthPrimaryButton>
        </div>
      ) : (
        <form
          className="mt-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            acceptMutation.mutate({
              token,
              password,
              displayName: displayName.trim() || undefined,
            });
          }}
        >
          <AuthTextField
            id="invite-display-name"
            label="Display name"
            icon={User}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your name"
          />
          <AuthPasswordField
            id="invite-password"
            label="Create password"
            value={password}
            onChange={setPassword}
            autoComplete="new-password"
          />
          <AuthPrimaryButton type="submit" loading={acceptMutation.isPending}>
            Accept and create account
          </AuthPrimaryButton>
          <p className="text-center text-sm text-muted">
            Already have a brand account?{" "}
            <Link
              to={`/login?next=${encodeURIComponent(`/invite/accept?token=${token}`)}`}
            >
              Sign in first
            </Link>
          </p>
        </form>
      )}
    </Card>
  );
}
