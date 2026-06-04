import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Building2,
  Inbox,
  LayoutDashboard,
  Megaphone,
  Settings,
} from "lucide-react";

export type PortalNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Match nested routes (e.g. /campaigns/:id) */
  matchNested?: boolean;
};

export const portalNavItems: PortalNavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  {
    href: "/brands",
    label: "Brands",
    icon: Building2,
    matchNested: true,
  },
  {
    href: "/campaigns",
    label: "Campaigns",
    icon: Megaphone,
    matchNested: true,
  },
  {
    href: "/submissions",
    label: "Submissions",
    icon: Inbox,
    matchNested: true,
  },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  {
    href: "/settings/brand",
    label: "Settings",
    icon: Settings,
  },
];

export function resolvePortalTitle(pathname: string): string {
  if (pathname === "/dashboard") return "Dashboard";
  if (pathname === "/brands") return "Brands";
  if (pathname === "/brands/new") return "New brand";
  if (pathname === "/campaigns") return "Campaigns";
  if (pathname.startsWith("/campaigns/new")) return "Create campaign";
  if (/^\/campaigns\/[^/]+$/.test(pathname)) return "Campaign";
  if (pathname === "/submissions") return "Submissions";
  if (/^\/submissions\/[^/]+$/.test(pathname)) return "Review submission";
  if (pathname === "/analytics") return "Analytics";
  if (pathname === "/settings/brand") return "Settings";
  return "Agency Portal";
}

export function isNavItemActive(
  pathname: string,
  item: PortalNavItem,
): boolean {
  if (pathname === item.href) return true;
  if (!item.matchNested) return false;
  return pathname.startsWith(`${item.href}/`);
}
