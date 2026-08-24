import Link from "next/link";
import { ClipboardList, Droplets, Package, Settings, SprayCan } from "lucide-react";

const links = [
  { href: "/milk", label: "Milking records", icon: Droplets, text: "Sessions and daily totals" },
  { href: "/stock", label: "Store", icon: Package, text: "Medicines, salt, acaricide" },
  { href: "/wash", label: "Wash & dip", icon: SprayCan, text: "Chemically treated water" },
  { href: "/schedule", label: "Schedule", icon: ClipboardList, text: "Today’s farm checklist" },
  { href: "/settings", label: "Settings", icon: Settings, text: "Farm profile and sign out" },
];

export default function MorePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-[28px] tracking-[-1px]">More</h1>
      <div className="grid gap-3">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <Link key={link.href} href={link.href} className="flex items-center gap-3 rounded-[15px] border border-border bg-card p-4">
              <span className="grid size-10 place-items-center rounded-[11px] bg-[#e4f0e4] text-primary"><Icon className="size-5" /></span>
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
