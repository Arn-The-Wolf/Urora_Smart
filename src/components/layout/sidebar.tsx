"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Beef, ClipboardList, Droplets, HeartPulse, House, Package, Settings, SprayCan } from "lucide-react";
import { UroraWordmark } from "@/components/brand/logo";
import { SyncBadge } from "@/components/sync/sync-badge";
import { useFarmData } from "@/lib/offline/provider";
import { cn } from "@/lib/utils";

const workspace = [
  { href: "/dashboard", label: "Dashboard", icon: House },
  { href: "/cattle", label: "Cows", icon: Beef },
  { href: "/milk", label: "Milking", icon: Droplets },
  { href: "/health", label: "Health", icon: HeartPulse },
  { href: "/stock", label: "Stock", icon: Package },
  { href: "/wash", label: "Wash & dip", icon: SprayCan },
  { href: "/schedule", label: "Schedule", icon: ClipboardList },
];

export function Sidebar() {
  const pathname = usePathname();
  const { farm, user } = useFarmData();
  const initials = farm.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[246px] flex-col bg-[#173d31] px-4 pt-7 pb-5 text-[#d8e6dc] md:flex">
      <UroraWordmark light />
      <div className="mt-8 mb-6 flex items-center gap-2.5 border-y border-[#35604d] px-2 py-3.5">
        <span className="grid size-8 place-items-center rounded-full bg-[#e2b86f] text-[11px] font-bold text-[#294238]">{initials}</span>
        <div className="min-w-0">
          <b className="block truncate text-xs text-white">{farm.name}</b>
          <small className="block text-[11px] text-[#9cb9a8]">{farm.location?.split(",")[0] ?? "Farm"}</small>
        </div>
      </div>
      <p className="mx-2.5 mb-2 text-[10px] font-bold tracking-[1.5px] text-[#7da28f]">WORKSPACE</p>
      <nav className="grid">
        {workspace.map((link) => {
          const Icon = link.icon;
          const active = pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "my-0.5 flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm",
                active ? "bg-[#2b5d4a] text-white shadow-[inset_3px_0_#9bd4a9]" : "text-[#a9c3b2] hover:bg-[#2b5d4a] hover:text-white",
              )}
            >
              <Icon className="size-[19px]" />
              {link.label}
            </Link>
          );
        })}
      </nav>
      <p className="mx-2.5 mt-7 mb-2 text-[10px] font-bold tracking-[1.5px] text-[#7da28f]">MANAGE</p>
      <Link href="/settings" className={cn("flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm", pathname.startsWith("/settings") ? "bg-[#2b5d4a] text-white" : "text-[#a9c3b2] hover:bg-[#2b5d4a] hover:text-white")}>
        <Settings className="size-[19px]" /> Settings
      </Link>
      <div className="mt-auto">
        <div className="mb-4 border-t border-[#35604d] px-2 pt-3">
          <SyncBadge />
        </div>
        <div className="flex items-center gap-2 border-t border-[#35604d] px-2 pt-3">
          <span className="grid size-8 place-items-center rounded-full bg-[#e2b86f] text-[11px] font-bold text-[#294238]">{user.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}</span>
          <div>
            <b className="block text-[11px] text-white">{user.name}</b>
            <small className="text-[11px] text-[#9cb9a8]">Farm manager</small>
          </div>
        </div>
      </div>
    </aside>
  );
}
