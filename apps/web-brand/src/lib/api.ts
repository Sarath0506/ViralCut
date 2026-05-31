const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export type ApiEnvelope<T> = {
  success: boolean;
  data: T | null;
  error: { code: string; message: string; details?: Record<string, unknown> } | null;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
};

export type AuthUser = {
  id: string;
  role: string;
  email: string | null;
  phone: string | null;
  displayName: string | null;
};

export type AuthResponse = {
  tokens: AuthTokens;
  user: AuthUser;
};

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { accessToken?: string } = {},
): Promise<T> {
  const { accessToken, ...init } = options;
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  const body = (await res.json()) as ApiEnvelope<T>;

  if (!res.ok || !body.success || body.data === null) {
    throw new ApiError(
      body.error?.code ?? "INTERNAL_ERROR",
      body.error?.message ?? "Request failed",
    );
  }

  return body.data;
}

export const authApi = {
  registerBrand: (payload: {
    email: string;
    password: string;
    companyName: string;
    displayName?: string;
  }) =>
    apiFetch<AuthResponse>("/auth/brand/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  loginBrand: (payload: { email: string; password: string }) =>
    apiFetch<AuthResponse>("/auth/brand/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  forgotPassword: (email: string) =>
    apiFetch<{ sent: boolean }>("/auth/brand/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  resetPassword: (payload: { token: string; password: string }) =>
    apiFetch<{ reset: boolean }>("/auth/brand/reset-password", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  refresh: (refreshToken: string) =>
    apiFetch<AuthResponse>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    }),
};

export type Campaign = {
  id: string;
  title: string;
  category: string | null;
  platform: string;
  status: string;
  brief: string;
  productUrl: string | null;
  ratePer1kPaise: number;
  ratePer1kDisplay: string;
  maxPayoutPaise: number;
  budgetPaise: number;
  budgetUsedPaise: number;
  poolPercent: number;
  poolRemainingPercent: number;
  endsAt: string | null;
  createdAt: string;
  submissionCount?: number;
};

export type SubmissionListItem = {
  id: string;
  status: string;
  mediaType: string;
  campaignId: string;
  campaignTitle: string;
  creatorName: string;
  eligibleViews: number;
  estimatedPaise: number;
  submittedAt: string;
};

export type BrandStats = {
  liveCampaigns: number;
  pendingReviews: number;
  budgetUsedPaise: number;
  totalViews: number;
};

export const brandApi = {
  me: (token: string) =>
    apiFetch<{
      id: string;
      role: string;
      email: string | null;
      displayName: string | null;
      companyName: string | null;
    }>("/users/me", { accessToken: token }),

  stats: (token: string) =>
    apiFetch<BrandStats>("/submissions/stats", { accessToken: token }),

  campaigns: {
    list: (token: string) =>
      apiFetch<Campaign[]>("/campaigns", { accessToken: token }),
    get: (token: string, id: string) =>
      apiFetch<Campaign & { submissionCount: number }>(`/campaigns/${id}`, {
        accessToken: token,
      }),
    create: (token: string, body: Record<string, unknown>) =>
      apiFetch<Campaign>("/campaigns", {
        method: "POST",
        accessToken: token,
        body: JSON.stringify(body),
      }),
    update: (token: string, id: string, body: Record<string, unknown>) =>
      apiFetch<Campaign>(`/campaigns/${id}`, {
        method: "PATCH",
        accessToken: token,
        body: JSON.stringify(body),
      }),
  },

  submissions: {
    list: (token: string, params?: { status?: string }) => {
      const q = params?.status ? `?status=${params.status}` : "";
      return apiFetch<SubmissionListItem[]>(`/submissions${q}`, {
        accessToken: token,
      });
    },
    get: (token: string, id: string) =>
      apiFetch<Record<string, unknown>>(`/submissions/${id}`, {
        accessToken: token,
      }),
    review: (
      token: string,
      id: string,
      body: { action: "approve" | "reject"; rejectionReason?: string },
    ) =>
      apiFetch<{ id: string; status: string }>(`/submissions/${id}/review`, {
        method: "PATCH",
        accessToken: token,
        body: JSON.stringify(body),
      }),
  },
};
