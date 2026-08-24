import Link from "next/link";
import { Bell, ClipboardList, Droplets, FileBarChart, Package, Settings, SprayCan } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { roleLabel } from "@/lib/roles";

export default async function MorePage() {
  const session = await getSession();
  const isBoss = session?.user.role === "boss";

  const links = [
    { href: "/alerts", label: "Alerts", icon: Bell, text: "Reorder, expiry, milk, cows, washes" },
    { href: "/milk", label: "Milking records", icon: Droplets, text: "Sessions and daily totals" },
    { href: "/stock", label: "Store", icon: Package, text: "Medicines, salt, acaricide + expiry" },
    { href: "/wash", label: "Wash & dip", icon: SprayCan, text: "Chemically treated water" },
    { href: "/schedule", label: "Schedule", icon: ClipboardList, text: "Today’s farm checklist" },
    ...(isBoss
      ? [{ href: "/reports", label: "Reports", icon: FileBarChart, text: "Daily and monthly farm reports" }]
      : []),
    { href: "/settings", label: "Settings", icon: Settings, text: "Farm profile and sign out" },
  ];

  return (
    <div className="space-y-4">
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
