import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

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
    acceptTerms: true;
  }) => Promise<void>;
  logout: () => void;
  getToken: () => string | null;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
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
      navigate("/dashboard", { replace: true });
    },
    [persist, navigate],
  );

  const register = useCallback(
    async (data: {
      email: string;
      password: string;
      companyName: string;
      displayName?: string;
      acceptTerms: true;
    }) => {
      const res = await authApi.registerBrand(data);
      persist(res);
      navigate("/dashboard", { replace: true });
    },
    [persist, navigate],
  );

  const logout = useCallback(() => {
    const refresh = auth?.tokens.refreshToken;
    if (refresh) {
      void fetch(
        `${import.meta.env.VITE_API_URL ?? "http://localhost:3001"}/auth/logout`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken: refresh }),
        },
      ).catch(() => undefined);
    }
    clearStoredAuth();
    setAuth(null);
    navigate("/login", { replace: true });
  }, [auth, navigate]);

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
