import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "@/providers/auth-provider";

export function GuestRoute() {
  const { auth, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (auth) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
