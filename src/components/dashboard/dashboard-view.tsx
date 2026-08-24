"use client";

import Link from "next/link";
import { Bell, HeartPulse, Package, Plus, SprayCan } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { useFarmData } from "@/lib/offline/provider";
import { formatLiters, cowLabel } from "@/lib/format";
import { formatShortDate, sessionLabel, todayInKigali } from "@/lib/dates";
import { roleLabel } from "@/lib/roles";
import type { FarmTask, HealthEvent, StockItem } from "@/lib/types";
import { cn } from "@/lib/utils";

export function DashboardView({
  sick,
  lowStock,
  washDue,
  openTasks,
  alertCount,
  criticalAlerts,
}: {
  sick: HealthEvent[];
  lowStock: StockItem[];
  washDue: string | null;
  openTasks: FarmTask[];
  alertCount: number;
  criticalAlerts: number;
}) {
  const { user, summary, recent, cowById } = useFarmData();
  const today = todayInKigali();
  const delta = summary.todayLiters - summary.yesterdayLiters;
  const maxBar = Math.max(...summary.last7Days.map((d) => d.liters), 1);
  const firstName = user.name.split(" ")[0];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="live-pill"><span /> LIVE FARM OVERVIEW</p>
          <h1 className="mt-2 text-[28px] tracking-[-1px] text-[#18382d]">Good day, {firstName}</h1>
          <p className="text-sm text-muted-foreground">
            {formatShortDate(today)} · {roleLabel(user.role)} · kraal at a glance.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/alerts"
            className={cn(buttonVariants({ variant: "outline" }), "h-11 rounded-[9px] px-4 font-bold")}
          >
            <Bell className="size-4" />
            Alerts{alertCount ? ` (${alertCount})` : ""}
          </Link>
          <Link href="/milk/new" className={cn(buttonVariants(), "h-11 rounded-[9px] px-4 font-bold shadow-[0_3px_8px_#176b4525]")}>
            <Plus className="size-4" /> Log milking
          </Link>
        </div>
      </div>

      {alertCount > 0 ? (
        <Link
          href="/alerts"
          className="flex items-center gap-3 rounded-[15px] border border-[#e5c9b8] bg-[#fff8f3] px-4 py-3"
        >
          <span className="grid size-9 place-items-center rounded-[9px] bg-[#f9e3df] text-[#a95343]">
            <Bell className="size-4" />
          </span>
          <div className="flex-1">
            <b className="block text-sm text-[#274b3a]">
              {alertCount} alert{alertCount === 1 ? "" : "s"} need attention
            </b>
            <span className="text-[11px] text-[#718079]">
              {criticalAlerts ? `${criticalAlerts} critical · ` : ""}
              Reorder, expiry, sick cows, milk, washes
            </span>
          </div>
        </Link>
      ) : null}

      <section className="flex flex-wrap items-center justify-between gap-4 rounded-[18px] bg-[#dfeee0] px-6 py-6">
        <div>
          <div className="live-pill"><span /> TODAY</div>
          <h2 className="mt-1 text-[23px] tracking-[-0.5px]">Your farm, at a glance.</h2>
          <p className="text-[13px] text-[#718079]">Milk, sick animals, stock, and the next tick wash.</p>
        </div>
        <div className="flex items-center gap-3.5">
          <span className="text-[30px] font-bold text-[#c58136]">24°</span>
          <div>
            <b className="block text-[13px]">Nyagatare</b>
            <small className="text-[11px] text-[#718079]">Good spray conditions</small>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3.5 md:grid-cols-4">
        <Stat label="Milk today" value={`${summary.todayLiters.toFixed(1)} L`} meta={`${formatLiters(Math.abs(delta))} vs yesterday`} />
        <Stat label="Active cows" value={String(summary.activeCows)} meta={`${summary.totalCows} in the herd`} />
        <Stat label="Sick / isolated" value={String(sick.length)} meta={sick[0] ? cowLabel(cowById(sick[0].cowId) ?? { tagNumber: "—", name: null }) : "None isolated"} />
        <Stat label="Open tasks" value={String(openTasks.length)} meta={washDue === today ? "Tick spray due today" : washDue ? `Next wash ${washDue}` : "No wash due"} />
      </section>

      <section className="grid gap-5 md:grid-cols-[1.5fr_1fr]">
        <div className="rounded-[15px] border border-border bg-card p-5 shadow-[0_4px_18px_#193d2a08]">
          <h3 className="text-[15px] font-semibold">Milk collection · 7 days</h3>
          <div className="mt-5 flex h-32 items-end gap-2">
            {summary.last7Days.map((day) => (
              <div key={day.date} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex h-24 w-full items-end rounded-[6px] bg-[#eef2ee]">
                  <div className={cn("w-full rounded-[6px]", day.date === today ? "bg-[#347d55]" : "bg-[#a7c9ae]")} style={{ height: `${Math.max(8, (day.liters / maxBar) * 100)}%` }} />
                </div>
                <span className="text-[10px] text-[#819087]">{formatShortDate(day.date).slice(0, 3)}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[15px] border border-border bg-[#f8fbf7] p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-[15px] font-semibold">Needs attention</h3>
            <Link href="/alerts" className="text-[11px] font-semibold text-primary">All alerts</Link>
          </div>
          <Link href="/health" className="mt-3 flex items-center gap-3 rounded-xl border border-border bg-[#e9f4e9] p-3">
            <span className="grid size-9 place-items-center rounded-[9px] bg-[#d0e7d2] text-primary"><HeartPulse className="size-5" /></span>
            <div className="flex-1"><b className="block text-[13px]">{sick.length} sick animal{sick.length === 1 ? "" : "s"}</b><span className="text-[10px] text-[#718079]">Treat and keep milk out of the can if needed</span></div>
          </Link>
          <Link href="/stock" className="mt-3 flex items-center gap-3 rounded-xl border border-border bg-[#e9f0f3] p-3">
            <span className="grid size-9 place-items-center rounded-[9px] bg-[#d2e1e8] text-[#467286]"><Package className="size-5" /></span>
            <div className="flex-1"><b className="block text-[13px]">{lowStock.length} stock item{lowStock.length === 1 ? "" : "s"} low</b><span className="text-[10px] text-[#718079]">Reorder before zero · check expiry</span></div>
          </Link>
          <Link href="/wash" className="mt-3 flex items-center gap-3 rounded-xl border border-border p-3">
            <span className="grid size-9 place-items-center rounded-[9px] bg-[#f7efdf] text-[#b48642]"><SprayCan className="size-5" /></span>
            <div className="flex-1"><b className="block text-[13px]">Chemically treated wash</b><span className="text-[10px] text-[#718079]">{washDue ? `Next due ${formatShortDate(washDue)}` : "Log the next tick spray"}</span></div>
          </Link>
        </div>
      </section>

      <section className="rounded-[15px] border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-[15px] font-semibold">Recent milkings</h3>
          <Link href="/milk" className="text-[11px] font-semibold text-primary">View all</Link>
        </div>
        <div className="mt-3 space-y-0">
          {recent.slice(0, 5).map((row) => {
            const cow = cowById(row.cowId);
            return (
              <div key={row.id} className="flex items-center justify-between border-t border-[#edf1ed] py-3">
                <div>
                  <b className="block text-xs">{cow ? cowLabel(cow) : "Cow"}</b>
                  <span className="text-[10px] text-[#84938a]">{sessionLabel(row.session)} · {formatShortDate(row.date)}</span>
                </div>
                <strong className="text-sm text-[#397c52]">{formatLiters(row.liters)}</strong>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value, meta }: { label: string; value: string; meta: string }) {
  return (
    <div className="min-h-[130px] rounded-[15px] border border-border bg-card p-4 shadow-[0_4px_18px_#193d2a08]">
      <p className="text-xs text-[#718079]">{label}</p>
      <strong className="mt-1 block text-[25px] tracking-[-1px]">{value}</strong>
      <small className="text-[11px] text-[#8a9991]">{meta}</small>
    </div>
  );
}
