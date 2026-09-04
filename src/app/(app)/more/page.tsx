import Link from "next/link";
import {
  Bell,
  ClipboardList,
  Droplets,
  Heart,
  History,
  Package,
  Settings,
  SprayCan,
  Wallet,
  Beef,
} from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { roleLabel, canViewOwnerInsights } from "@/lib/roles";

export default async function MorePage() {
  const session = await getSession();
  const owner = session ? canViewOwnerInsights(session.user.role) : false;

  const links = owner
    ? [
        { href: "/cattle", label: "Herd", icon: Beef, text: "Your cows at a glance" },
        { href: "/finance", label: "Money", icon: Wallet, text: "Sales and expenses" },
        { href: "/activity", label: "Team activity", icon: History, text: "What operators logged" },
        { href: "/settings", label: "Farms & settings", icon: Settings, text: "Switch farms, profile, digests" },
      ]
    : [
        { href: "/breeding", label: "Breeding & calving", icon: Heart, text: "Heat, AI, dry-off, calving dates" },
        { href: "/milk", label: "Milking records", icon: Droplets, text: "Sessions and daily totals" },
        { href: "/stock", label: "Store", icon: Package, text: "Feed, medicines, salt, expiry" },
        { href: "/wash", label: "Wash & dip", icon: SprayCan, text: "Chemically treated water" },
        { href: "/schedule", label: "Schedule", icon: ClipboardList, text: "Today’s farm checklist" },
        { href: "/alerts", label: "Alerts", icon: Bell, text: "Withhold, reorder, expiry, milk, cows" },
        { href: "/settings", label: "Settings", icon: Settings, text: "Account and sync" },
      ];

  return (
    <div className="space-y-4 page-enter">
      <div>
        <h1 className="text-[28px] tracking-[-1px]">More</h1>
        {session ? (
          <p className="text-sm text-muted-foreground">
            Signed in as {session.user.name} · {roleLabel(session.user.role)}
          </p>
        ) : null}
      </div>
      <div className="grid gap-3">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 rounded-[15px] border border-border bg-card p-4"
            >
              <span className="grid size-10 place-items-center rounded-[11px] bg-[#e4f0e4] text-primary">
                <Icon className="size-5" />
              </span>
              <div>
                <b className="block">{link.label}</b>
                <span className="text-sm text-muted-foreground">{link.text}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
