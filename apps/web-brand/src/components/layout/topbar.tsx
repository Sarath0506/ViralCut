"use client";

import { Moon, Sun, LogOut, Bell } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/auth-provider";

export function Topbar({ title }: { title: string }) {
  const { theme, setTheme } = useTheme();
  const { auth, logout } = useAuth();

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-surface px-6">
      <h1 className="font-display text-xl font-bold text-foreground">{title}</h1>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" aria-label="Notifications">
          <Bell className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>
        <span className="hidden text-sm text-muted sm:inline">
          {auth?.user.displayName ?? auth?.user.email}
        </span>
        <Button variant="outline" size="sm" onClick={logout}>
          <LogOut className="h-4 w-4" />
          Log out
        </Button>
      </div>
    </header>
  );
}
