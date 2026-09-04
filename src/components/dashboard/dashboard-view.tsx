"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Beef, Droplets, LandPlot, Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { useFarmData } from "@/lib/offline/provider";
import { formatLiters } from "@/lib/format";
import { formatShortDate, todayInKigali } from "@/lib/dates";
import { canViewOwnerInsights, roleLabel } from "@/lib/roles";
import type { CowStatus, Farm, FarmTask, HealthEvent, StockItem } from "@/lib/types";
import { cn } from "@/lib/utils";

const STATUS_COLORS: Record<CowStatus, string> = {
  active: "#347d55",
  sold: "#9aa89f",
  dead: "#b07060",
};

export function DashboardView({
  sick,
  lowStock,
  washDue,
  openTasks,
  alertCount,
  criticalAlerts,
  ownedFarms,
}: {
  sick: HealthEvent[];
  lowStock: StockItem[];
  washDue: string | null;
  openTasks: FarmTask[];
  alertCount: number;
  criticalAlerts: number;
  ownedFarms: Farm[];
}) {
  const { user, farm, summary, cows } = useFarmData();
  const today = todayInKigali();
  const delta = summary.todayLiters - summary.yesterdayLiters;
  const maxBar = Math.max(...summary.last7Days.map((d) => d.liters), 1);
  const firstName = user.name.split(" ")[0];
  const owner = canViewOwnerInsights(user.role);

  if (owner) {
    const byStatus = (["active", "sold", "dead"] as CowStatus[]).map((status) => ({
      status,
      count: cows.filter((c) => c.status === status).length,
    }));
    const herdTotal = Math.max(cows.length, 1);
    const weekMax = Math.max(...summary.last7Days.map((d) => d.liters), 1);

    return (
      <div className="page-enter space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="live-pill">
              <span /> OWNER
            </p>
            <h1 className="mt-2 text-[28px] tracking-[-1px] text-[#18382d]">Good day, {firstName}</h1>
            <p className="text-sm text-muted-foreground">
              {formatShortDate(today)} · {farm.name}
            </p>
          </div>
          <Link href="/milk/new" className={cn(buttonVariants(), "h-11 rounded-[9px] px-4 font-bold")}>
            <Plus className="size-4" /> Log milking
          </Link>
        </div>

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Kpi
            icon={<Droplets className="size-4" />}
            label="Milk today"
            value={`${summary.todayLiters.toFixed(1)} L`}
            meta={`${delta >= 0 ? "+" : "−"}${formatLiters(Math.abs(delta))} vs yesterday`}
          />
          <Kpi
            icon={<Beef className="size-4" />}
            label="Herd"
            value={String(summary.activeCows)}
            meta={`${summary.totalCows} total · ${sick.length} sick`}
          />
          <Kpi
            icon={<LandPlot className="size-4" />}
            label="Farms"
            value={String(ownedFarms.length || 1)}
            meta={ownedFarms.length > 1 ? "Across your portfolio" : farm.location ?? "Current farm"}
          />
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-[16px] border border-border bg-card p-5 shadow-[0_4px_18px_#193d2a08]">
            <div className="flex items-baseline justify-between gap-2">
              <h2 className="text-[15px] font-semibold">Milk · 7 days</h2>
              <span className="text-xs text-muted-foreground">{formatLiters(summary.weekLiters)} this week</span>
            </div>
            <div className="mt-6 flex h-44 items-end gap-2.5">
              {summary.last7Days.map((day) => {
                const h = Math.max(10, (day.liters / weekMax) * 100);
                return (
                  <div key={day.date} className="flex flex-1 flex-col items-center gap-2">
                    <span className="text-[10px] font-semibold text-[#5f7368]">{day.liters ? day.liters.toFixed(0) : "—"}</span>
                    <div className="flex h-32 w-full items-end rounded-lg bg-[#eef3ee]">
                      <div
                        className={cn(
                          "w-full rounded-lg transition-[height] duration-500",
                          day.date === today ? "bg-[#2f7a52]" : "bg-[#9fc5a8]",
                        )}
                        style={{ height: `${h}%` }}
                        title={`${formatShortDate(day.date)}: ${formatLiters(day.liters)}`}
                      />
                    </div>
                    <span className="text-[10px] text-[#819087]">{formatShortDate(day.date).slice(0, 3)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-[16px] border border-border bg-card p-5 shadow-[0_4px_18px_#193d2a08]">
            <h2 className="text-[15px] font-semibold">Cows by status</h2>
            <div className="mt-5 flex items-center gap-5">
              <div
                className="relative size-28 shrink-0 rounded-full"
                style={{
                  background: conicGradient(byStatus, herdTotal),
                }}
                aria-hidden
              >
                <div className="absolute inset-[22%] grid place-items-center rounded-full bg-card">
                  <span className="text-lg font-bold tracking-tight">{cows.length}</span>
                </div>
              </div>
              <ul className="min-w-0 flex-1 space-y-2.5">
                {byStatus.map((row) => (
                  <li key={row.status} className="flex items-center justify-between gap-2 text-sm">
                    <span className="flex items-center gap-2 capitalize text-[#4a5c52]">
                      <i className="size-2.5 rounded-full" style={{ background: STATUS_COLORS[row.status] }} />
                      {row.status}
                    </span>
                    <b>{row.count}</b>
                  </li>
                ))}
              </ul>
            </div>
            <Link href="/cattle" className="mt-5 inline-block text-xs font-semibold text-primary">
              Open herd →
            </Link>
          </div>
        </section>

        <section className="rounded-[16px] border border-border bg-card p-5 shadow-[0_4px_18px_#193d2a08]">
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="text-[15px] font-semibold">Your farms</h2>
            <Link href="/settings" className="text-xs font-semibold text-primary">
              Manage
            </Link>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {(ownedFarms.length ? ownedFarms : [farm]).map((item) => {
              const active = item.id === farm.id;
              return (
                <div
                  key={item.id}
                  className={cn(
                    "rounded-xl border px-4 py-3",
                    active ? "border-[#2f7a52]/40 bg-[#f3faf5]" : "border-border bg-[#fafbfa]",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <b className="block truncate text-sm">{item.name}</b>
                      <span className="text-[11px] text-muted-foreground">{item.location ?? "No location"}</span>
                    </div>
                    {active ? <span className="shrink-0 text-[10px] font-bold text-primary">ACTIVE</span> : null}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {alertCount > 0 ? (
          <Link
            href="/alerts"
            className="flex items-center justify-between rounded-[14px] border border-[#e5c9b8] bg-[#fff8f3] px-4 py-3 text-sm"
          >
            <span>
              <b>
                {alertCount} alert{alertCount === 1 ? "" : "s"}
              </b>
              {criticalAlerts ? ` · ${criticalAlerts} critical` : ""}
            </span>
            <span className="font-semibold text-[#a95343]">View</span>
          </Link>
        ) : null}
      </div>
    );
  }

  // Operator: keep a lean field dashboard
  return (
    <div className="page-enter space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="live-pill">
            <span /> OPERATOR
          </p>
          <h1 className="mt-2 text-[28px] tracking-[-1px] text-[#18382d]">Good day, {firstName}</h1>
          <p className="text-sm text-muted-foreground">
            {formatShortDate(today)} · {roleLabel(user.role)} · log cows, milk, health, and stock
          </p>
        </div>
        <Link href="/milk/new" className={cn(buttonVariants(), "h-11 rounded-[9px] px-4 font-bold")}>
          <Plus className="size-4" /> Log milking
        </Link>
      </div>

      <section className="grid grid-cols-2 gap-3.5 md:grid-cols-4">
        <Kpi label="Milk today" value={`${summary.todayLiters.toFixed(1)} L`} meta={`${formatLiters(Math.abs(delta))} vs yesterday`} />
        <Kpi label="Active cows" value={String(summary.activeCows)} meta={`${summary.totalCows} in the herd`} />
        <Kpi label="Sick" value={String(sick.length)} meta={lowStock.length ? `${lowStock.length} low stock` : "Herd stable"} />
        <Kpi
          label="Tasks"
          value={String(openTasks.length)}
          meta={washDue === today ? "Wash due today" : washDue ? `Wash ${washDue}` : "No wash due"}
        />
      </section>

      <section className="rounded-[15px] border border-border bg-card p-5">
        <h3 className="text-[15px] font-semibold">Milk · 7 days</h3>
        <div className="mt-5 flex h-32 items-end gap-2">
          {summary.last7Days.map((day) => (
            <div key={day.date} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex h-24 w-full items-end rounded-[6px] bg-[#eef2ee]">
                <div
                  className={cn("w-full rounded-[6px]", day.date === today ? "bg-[#347d55]" : "bg-[#a7c9ae]")}
                  style={{ height: `${Math.max(8, (day.liters / maxBar) * 100)}%` }}
                />
              </div>
              <span className="text-[10px] text-[#819087]">{formatShortDate(day.date).slice(0, 3)}</span>
            </div>
          ))}
        </div>
      </section>

      {alertCount > 0 ? (
        <Link href="/alerts" className="block rounded-[14px] border border-[#e5c9b8] bg-[#fff8f3] px-4 py-3 text-sm font-semibold text-[#274b3a]">
          {alertCount} alert{alertCount === 1 ? "" : "s"} need attention
        </Link>
      ) : null}
    </div>
  );
}

function Kpi({
  label,
  value,
  meta,
  icon,
}: {
  label: string;
  value: string;
  meta: string;
  icon?: ReactNode;
}) {
  return (
    <div className="min-h-[104px] rounded-[15px] border border-border bg-card p-4 shadow-[0_4px_18px_#193d2a08]">
      <p className="flex items-center gap-1.5 text-xs text-[#718079]">
        {icon}
        {label}
      </p>
      <strong className="mt-1 block text-[25px] tracking-[-1px]">{value}</strong>
      <small className="text-[11px] text-[#8a9991]">{meta}</small>
    </div>
  );
}

function conicGradient(rows: { status: CowStatus; count: number }[], total: number) {
  let start = 0;
  const parts: string[] = [];
  for (const row of rows) {
    const slice = (row.count / total) * 100;
    const end = start + slice;
    parts.push(`${STATUS_COLORS[row.status]} ${start}% ${end}%`);
    start = end;
  }
  if (start < 100) parts.push(`#e8eee8 ${start}% 100%`);
  return `conic-gradient(${parts.join(", ")})`;
}
