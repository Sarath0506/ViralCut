"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { useAuth } from "@/providers/auth-provider";

export function DashboardShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const { auth, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !auth) {
      router.replace("/login");
    }
  }, [auth, isLoading, router]);

  if (isLoading || !auth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted">Loading…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar title={title} />
        <main className="flex-1 overflow-auto p-6">
          <div className="mx-auto max-w-[1200px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
