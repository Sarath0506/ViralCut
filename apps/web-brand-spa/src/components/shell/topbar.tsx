import { Bell, Menu } from "lucide-react";

import { AccountMenu } from "@/components/shell/account-menu";
import { PortalSearch } from "@/components/shell/portal-search";
import { Button } from "@/components/ui/button";

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="sticky top-0 z-30 flex h-[4.25rem] shrink-0 items-center gap-3 border-b border-border bg-surface px-4 sm:gap-4 sm:px-6">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="shrink-0 lg:hidden"
        onClick={onMenuClick}
        aria-label="Open navigation"
      >
        <Menu className="size-5" />
      </Button>

      <div className="hidden min-w-0 flex-1 md:block md:max-w-xl lg:max-w-2xl">
        <PortalSearch />
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-muted"
          aria-label="Notifications"
        >
          <Bell className="size-5" />
        </Button>
        <AccountMenu />
      </div>
    </header>
  );
}
