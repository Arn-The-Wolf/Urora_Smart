"use client";

import { formatShortDate } from "@/lib/dates";
import type { ActivityLogEntry } from "@/lib/types";

export function ActivityView({ entries }: { entries: ActivityLogEntry[] }) {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-[10px] font-bold tracking-[1.5px] text-[#7a9184]">ACCOUNTABILITY</p>
        <h1 className="text-[28px] tracking-[-1px]">Worker activity</h1>
        <p className="text-sm text-muted-foreground">Who logged what — health, breeding, milk sales, expenses, and more.</p>
      </div>
      <div className="overflow-hidden rounded-[15px] border border-border bg-card">
        {entries.map((entry) => (
          <div key={entry.id} className="border-t border-[#edf1ed] px-4 py-3 first:border-t-0">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <b className="text-sm text-[#274b3a]">
                {entry.userName || "Someone"} · {entry.action} {entry.entity.replace("_", " ")}
              </b>
              <span className="text-[11px] text-[#84938a]">{formatShortDate(entry.createdAt.slice(0, 10))}</span>
            </div>
            {entry.detail ? <p className="mt-1 text-xs text-muted-foreground">{entry.detail}</p> : null}
          </div>
        ))}
        {entries.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">No activity logged yet.</p>
        ) : null}
      </div>
    </div>
  );
}
