"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Beef, HeartPulse, House, Plus, Settings, Wallet } from "lucide-react";
import { useFarmData } from "@/lib/offline/provider";
import { canViewOwnerInsights } from "@/lib/roles";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();
  const { user } = useFarmData();
  const owner = canViewOwnerInsights(user.role);

  const items = owner
    ? [
        { href: "/dashboard", label: "Home", icon: House },
        { href: "/cattle", label: "Herd", icon: Beef },
        { href: "/finance", label: "Money", icon: Wallet },
        { href: "/settings", label: "Farms", icon: Settings },
      ]
    : [
        { href: "/dashboard", label: "Home", icon: House },
        { href: "/cattle", label: "Cows", icon: Beef },
        { href: "/milk/new", label: "Log", icon: Plus, primary: true },
        { href: "/health", label: "Health", icon: HeartPulse },
        { href: "/more", label: "More", icon: Settings },
      ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white px-1 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_-5px_20px_#173d3112] md:hidden">
      <ul className={cn("grid", owner ? "grid-cols-4" : "grid-cols-5")}>
        {items.map((item) => {
          const Icon = item.icon;
          const primary = "primary" in item && item.primary;
          const active = primary
            ? pathname.startsWith("/milk/new")
            : pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href) && !pathname.startsWith("/milk/new"));
          if (primary) {
            return (
              <li key={item.href} className="flex justify-center">
                <Link href={item.href} aria-label="Log milk" className="-mt-5 grid size-12 place-items-center rounded-full bg-primary text-white shadow-[0_8px_18px_#176b4526]">
                  <Icon className="size-5" />
                </Link>
              </li>
            );
          }
          return (
            <li key={item.href}>
              <Link href={item.href} className={cn("flex flex-col items-center gap-0.5 py-1 text-[10px]", active ? "font-bold text-[#277047]" : "text-[#8b9991]")}>
                <Icon className="size-5" />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
