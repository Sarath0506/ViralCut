"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import { authApi, type AuthResponse } from "@/lib/api";
import {
  clearStoredAuth,
  getStoredAuth,
  setStoredAuth,
} from "@/lib/auth-storage";

type AuthContextValue = {
  auth: AuthResponse | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    companyName: string;
    displayName?: string;
  }) => Promise<void>;
  logout: () => void;
  getToken: () => string | null;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [auth, setAuth] = useState<AuthResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setAuth(getStoredAuth());
    setIsLoading(false);
  }, []);

  const persist = useCallback((next: AuthResponse) => {
    setStoredAuth(next);
    setAuth(next);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await authApi.loginBrand({ email, password });
      persist(res);
      router.push("/dashboard");
    },
    [persist, router],
  );

  const register = useCallback(
    async (data: {
      email: string;
      password: string;
      companyName: string;
      displayName?: string;
    }) => {
      const res = await authApi.registerBrand(data);
      persist(res);
      router.push("/dashboard");
    },
    [persist, router],
  );

  const logout = useCallback(() => {
    const refresh = auth?.tokens.refreshToken;
    if (refresh) {
      void fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"}/auth/logout`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken: refresh }),
        },
      ).catch(() => undefined);
    }
    clearStoredAuth();
    setAuth(null);
    router.push("/login");
  }, [auth, router]);

  const value = useMemo(
    () => ({
      auth,
      isLoading,
      login,
      register,
      logout,
      getToken: () => auth?.tokens.accessToken ?? null,
    }),
    [auth, isLoading, login, register, logout],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
