"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BusyButton } from "@/components/loading/busy-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/forms/field";
import { CardSkeleton } from "@/components/loading/page-loader";
import { todayInKigali } from "@/lib/dates";
import { formatLiters } from "@/lib/format";
import type { DailyReport, MonthlyReport } from "@/lib/types";

export function ReportsView() {
  const [kind, setKind] = useState<"daily" | "monthly">("daily");
  const [date, setDate] = useState(todayInKigali());
  const [month, setMonth] = useState(todayInKigali().slice(0, 7));
  const [daily, setDaily] = useState<DailyReport | null>(null);
  const [monthly, setMonthly] = useState<MonthlyReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [booting, setBooting] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const query = kind === "daily" ? `kind=daily&date=${date}` : `kind=monthly&month=${month}`;
      const response = await fetch(`/api/reports?${query}`);
      const data = (await response.json()) as { report?: DailyReport & MonthlyReport; error?: string };
      if (!response.ok) throw new Error(data.error ?? "Could not load report");
      if (kind === "daily") setDaily(data.report as DailyReport);
      else setMonthly(data.report as MonthlyReport);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load report");
    } finally {
      setLoading(false);
      setBooting(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="page-enter space-y-5">
      <div>
        <p className="text-[10px] font-bold tracking-[1.5px] text-[#7a9184]">OWNER VIEW</p>
        <h1 className="text-[28px] tracking-[-1px]">Farm reports</h1>
        <p className="text-sm text-muted-foreground">
          See how the farm is working — daily milk, sick animals, stock pressure, and the month as a whole.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant={kind === "daily" ? "default" : "outline"} onClick={() => setKind("daily")}>
          Daily
        </Button>
        <Button variant={kind === "monthly" ? "default" : "outline"} onClick={() => setKind("monthly")}>
          Monthly
        </Button>
      </div>

      <div className="grid gap-3 rounded-[15px] border border-border bg-card p-5 md:grid-cols-3">
        {kind === "daily" ? (
          <Field label="Date">
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-12 bg-input" />
          </Field>
        ) : (
          <Field label="Month">
            <Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="h-12 bg-input" />
          </Field>
        )}
        <BusyButton className="h-12 self-end" busy={loading} busyLabel="Building…" onClick={() => void load()}>
          Generate report
        </BusyButton>
        <Button
          className="h-12 self-end"
          variant="outline"
          disabled={loading || (kind === "daily" ? !daily : !monthly)}
          onClick={() => {
            const rows =
              kind === "daily" && daily
                ? [
                    ["metric", "value"],
                    ["date", daily.date],
                    ["milk_liters", String(daily.milkLiters)],
                    ["sessions", String(daily.sessionsLogged)],
                    ["active_cows", String(daily.activeCows)],
                    ["sick_cows", String(daily.sickCows)],
                    ["low_stock", String(daily.lowStockCount)],
                    ["expired_stock", String(daily.expiredStockCount)],
                    ["open_tasks", String(daily.openTasks)],
                    ["top_cow", daily.topCow ? `${daily.topCow.tagNumber}|${daily.topCow.liters}` : ""],
                  ]
                : monthly
                  ? [
                      ["metric", "value"],
                      ["month", monthly.month],
                      ["milk_liters", String(monthly.milkLiters)],
                      ["milking_days", String(monthly.milkingDays)],
                      ["avg_daily_liters", String(monthly.averageDailyLiters)],
                      ["active_cows", String(monthly.activeCows)],
                      ["health_events", String(monthly.healthEvents)],
                      ["washes", String(monthly.washesDone)],
                      ["stock_outs", String(monthly.stockMovementsOut)],
                      ...monthly.byDay.map((d) => [`day_${d.date}`, String(d.liters)]),
                    ]
                  : [];
            const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
            const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = kind === "daily" ? `urora-daily-${date}.csv` : `urora-monthly-${month}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success("CSV downloaded");
          }}
        >
          Export CSV
        </Button>
      </div>

      {booting || (loading && !daily && !monthly) ? (
        <div className="grid gap-3 md:grid-cols-3">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : null}

      {kind === "daily" && daily ? (
        <div className="grid gap-3 md:grid-cols-3">
          <Stat title="Milk collected" value={formatLiters(daily.milkLiters)} meta={`${daily.sessionsLogged} sessions`} />
          <Stat title="Active cows" value={String(daily.activeCows)} meta={`${daily.sickCows} sick`} />
          <Stat title="Stock pressure" value={String(daily.lowStockCount + daily.expiredStockCount)} meta={`${daily.lowStockCount} low · ${daily.expiredStockCount} expired`} />
          <Stat title="Open tasks due" value={String(daily.openTasks)} meta={daily.washDue ? `Wash due ${daily.washDue}` : "No wash due"} />
          <Stat title="Top producer" value={daily.topCow ? formatLiters(daily.topCow.liters) : "—"} meta={daily.topCow ? `${daily.topCow.name || daily.topCow.tagNumber}` : "No milk yet"} />
        </div>
      ) : null}

      {kind === "monthly" && monthly ? (
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            <Stat title="Month milk" value={formatLiters(monthly.milkLiters)} meta={`${monthly.milkingDays} milking days`} />
            <Stat title="Daily average" value={formatLiters(monthly.averageDailyLiters)} meta={`${monthly.activeCows} active cows`} />
            <Stat title="Operations" value={String(monthly.healthEvents + monthly.washesDone)} meta={`${monthly.healthEvents} health · ${monthly.washesDone} washes · ${monthly.stockMovementsOut} stock outs`} />
          </div>
          <div className="rounded-[15px] border border-border bg-card p-5">
            <h2 className="text-sm font-semibold">Milk by day</h2>
            <div className="mt-3 flex h-36 items-end gap-1">
              {monthly.byDay.map((day) => {
                const max = Math.max(...monthly.byDay.map((d) => d.liters), 1);
                return (
                  <div key={day.date} className="flex flex-1 flex-col items-center gap-1">
                    <div className="w-full rounded-t bg-primary/80" style={{ height: `${Math.max(8, (day.liters / max) * 100)}%` }} title={`${day.date}: ${day.liters}L`} />
                    <span className="text-[9px] text-muted-foreground">{day.date.slice(8)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Stat({ title, value, meta }: { title: string; value: string; meta: string }) {
  return (
    <div className="rounded-[15px] border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground">{title}</p>
      <p className="mt-1 text-2xl font-semibold tracking-[-1px]">{value}</p>
      <p className="mt-1 text-[11px] text-[#718079]">{meta}</p>
    </div>
  );
}
