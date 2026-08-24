"use client";

import Link from "next/link";
import { AlertTriangle, Bell, ChevronRight } from "lucide-react";
import type { FarmAlert } from "@/lib/types";
import { cn } from "@/lib/utils";

const tone = {
  critical: "bg-[#f9e3df] text-[#a95343]",
  warning: "bg-[#faefd9] text-[#ad7731]",
  info: "bg-[#e5eff2] text-[#4a8191]",
};

export function AlertsView({ alerts }: { alerts: FarmAlert[] }) {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-[10px] font-bold tracking-[1.5px] text-[#7a9184]">ALERTS</p>
        <h1 className="text-[28px] tracking-[-1px]">
          What needs attention{" "}
          <span className="ml-2 rounded-full bg-[#dfeee0] px-2 py-0.5 text-xs text-[#3a7552]">{alerts.length}</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          Reorder thresholds fire before stock hits zero. Expired medicines, sick cows, milk drops, overdue washes, and missed sessions all land here.
        </p>
      </div>

      {alerts.length === 0 ? (
        <div className="rounded-[15px] border border-border bg-card px-5 py-12 text-center">
          <Bell className="mx-auto size-8 text-[#4c9b65]" />
          <p className="mt-3 font-semibold">All clear for now</p>
          <p className="text-sm text-muted-foreground">No low stock, expired medicines, or overdue work.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-[15px] border border-border bg-card">
          {alerts.map((alert) => (
            <Link
              key={alert.id}
              href={alert.href}
              className="flex items-start gap-3 border-t border-[#edf1ed] px-4 py-3.5 first:border-t-0 hover:bg-[#f6faf5]"
            >
              <span className={cn("mt-0.5 grid size-8 place-items-center rounded-[9px]", tone[alert.severity])}>
                <AlertTriangle className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <b className="text-sm text-[#274b3a]">{alert.title}</b>
                  <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold capitalize", tone[alert.severity])}>
                    {alert.severity}
                  </span>
                </div>
                <p className="mt-1 text-xs text-[#718079]">{alert.detail}</p>
              </div>
              <ChevronRight className="mt-1 size-4 text-[#9ca9a1]" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
