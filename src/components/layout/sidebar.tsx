"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Beef,
  Bell,
  ClipboardList,
  Droplets,
  Heart,
  HeartPulse,
  History,
  House,
  Package,
  Settings,
  SprayCan,
  Wallet,
} from "lucide-react";
import { UroraWordmark } from "@/components/brand/logo";
import { SyncBadge } from "@/components/sync/sync-badge";
import { useFarmData } from "@/lib/offline/provider";
import { roleLabel, canViewOwnerInsights } from "@/lib/roles";
import { cn } from "@/lib/utils";

/** Operator field toolkit. */
const operatorNav = [
  { href: "/dashboard", label: "Dashboard", icon: House },
  { href: "/cattle", label: "Cows", icon: Beef },
  { href: "/milk", label: "Milking", icon: Droplets },
  { href: "/health", label: "Health", icon: HeartPulse },
  { href: "/breeding", label: "Breeding", icon: Heart },
  { href: "/stock", label: "Stock", icon: Package },
  { href: "/wash", label: "Wash & dip", icon: SprayCan },
  { href: "/schedule", label: "Schedule", icon: ClipboardList },
  { href: "/alerts", label: "Alerts", icon: Bell },
  { href: "/settings", label: "Settings", icon: Settings },
];

/** Owner — high-level only (no field clutter). */
const ownerNav = [
  { href: "/dashboard", label: "Overview", icon: House },
  { href: "/cattle", label: "Herd", icon: Beef },
  { href: "/finance", label: "Money", icon: Wallet },
  { href: "/activity", label: "Team", icon: History },
  { href: "/settings", label: "Farms", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { farm, user } = useFarmData();
  const owner = canViewOwnerInsights(user.role);
  const links = owner ? ownerNav : operatorNav;
  const initials = farm.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-30 hidden w-[246px] flex-col bg-[#173d31] text-[#d8e6dc] md:flex",
        owner ? "px-3.5 pt-5 pb-5" : "px-3 pt-4 pb-4",
      )}
    >
      <Link
        href="/dashboard"
        className={cn("shrink-0 rounded-lg px-1 transition hover:opacity-90", owner && "px-1.5")}
        aria-label="Spring Farms home"
      >
        <UroraWordmark light compact />
      </Link>

      <div
        className={cn(
          "flex items-center gap-2 rounded-[10px] border border-[#35604d]",
          owner ? "mt-8 mb-1 px-3 py-3" : "mt-3 mb-2 px-2 py-2",
        )}
      >
        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#e2b86f] text-[10px] font-bold text-[#294238]">
          {initials}
        </span>
        <div className="min-w-0 leading-tight">
          <b className="block truncate text-[11px] text-white">{farm.name}</b>
          <small className="block truncate text-[10px] text-[#9cb9a8]">
            {farm.location?.split(",")[0] ?? "Farm"} · {roleLabel(user.role)}
          </small>
        </div>
      </div>

      <div className={cn("min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1", owner ? "mt-8" : "mt-0")}>
        <p className={cn("mx-2 font-bold tracking-[1.4px] text-[#7da28f]", owner ? "mb-3 text-[10px]" : "mb-1 text-[9px]")}>
          {owner ? "OWNER" : "YOUR WORK"}
        </p>
        <nav className={cn("grid", owner && "gap-1")}>
          {links.map((link) => {
            const Icon = link.icon;
            const active =
              pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-2.5 rounded-[9px] text-[13px]",
                  owner ? "px-3 py-2.5" : "my-0.5 px-2.5 py-2",
                  active
                    ? owner
                      ? "bg-[#2b5d4a] text-white shadow-[inset_3px_0_#e2b86f]"
                      : "bg-[#2b5d4a] text-white shadow-[inset_3px_0_#9bd4a9]"
                    : owner
                      ? "text-[#cbb892] hover:bg-[#2b5d4a] hover:text-white"
                      : "text-[#a9c3b2] hover:bg-[#2b5d4a] hover:text-white",
                )}
              >
                <Icon className="size-[17px] shrink-0" />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className={cn("shrink-0 border-t border-[#35604d]", owner ? "mt-6 pt-4" : "mt-2 pt-2")}>
        <div className="mb-2 px-1">
          <SyncBadge />
        </div>
        <div className="flex items-center gap-2 px-1">
          <span className="grid size-7 place-items-center rounded-full bg-[#e2b86f] text-[10px] font-bold text-[#294238]">
            {user.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)}
          </span>
          <div className="min-w-0 leading-tight">
            <b className="block truncate text-[11px] text-white">{user.name}</b>
            <small className="text-[10px] text-[#9cb9a8]">{roleLabel(user.role)}</small>
          </div>
        </div>
      </div>
    </aside>
  );
}
