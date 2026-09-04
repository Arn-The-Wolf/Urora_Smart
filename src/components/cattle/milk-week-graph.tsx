"use client";

import { useEffect, useState } from "react";
import { formatLiters } from "@/lib/format";
import { formatShortDate, todayInKigali } from "@/lib/dates";
import { cn } from "@/lib/utils";

type DayPoint = { date: string; liters: number };

/** Weekly milk bars — skeleton first, then animate in. */
export function MilkWeekGraph({
  days,
  className,
  compact = false,
}: {
  days: DayPoint[];
  className?: string;
  compact?: boolean;
}) {
  const [ready, setReady] = useState(false);
  const today = todayInKigali();
  const maxBar = Math.max(...days.map((d) => d.liters), 1);
  const weekTotal = days.reduce((sum, d) => sum + d.liters, 0);

  useEffect(() => {
    const id = window.setTimeout(() => setReady(true), compact ? 180 : 320);
    return () => window.clearTimeout(id);
  }, [compact, days]);

  if (!ready) {
    return (
      <div className={cn(compact ? "space-y-1.5" : "space-y-3", className)} role="status" aria-label="Loading milk chart">
        {!compact ? (
          <div className="flex items-center justify-between">
            <div className="skeleton-shine h-5 w-28 rounded-full" />
            <div className="skeleton-shine h-4 w-16 rounded-full" />
          </div>
        ) : null}
        <div className={cn("flex items-end gap-1.5", compact ? "h-10" : "h-32")}>
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="skeleton-shine flex-1 rounded-md" style={{ height: `${30 + ((i * 17) % 50)}%` }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn(compact ? "space-y-1" : "space-y-3", className)}>
      {!compact ? (
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="font-heading text-xl">Milk this week</h2>
          <span className="text-sm font-semibold text-primary">{formatLiters(weekTotal)}</span>
        </div>
      ) : null}
      <div className={cn("flex items-end gap-1.5", compact ? "h-10" : "h-36")}>
        {days.map((day, index) => {
          const h = Math.max(compact ? 12 : 10, (day.liters / maxBar) * 100);
          return (
            <div key={day.date} className="flex flex-1 flex-col items-center gap-1.5">
              {!compact ? (
                <span className="text-[10px] font-semibold text-[#5f7368] animate-fade-in" style={{ animationDelay: `${80 + index * 40}ms` }}>
                  {day.liters ? day.liters.toFixed(day.liters % 1 ? 1 : 0) : "—"}
                </span>
              ) : null}
              <div className={cn("flex w-full items-end rounded-md bg-[#eef3ee]", compact ? "h-10" : "h-28")}>
                <div
                  className={cn(
                    "w-full origin-bottom rounded-md transition-[height] duration-700 ease-out",
                    day.date === today ? "bg-[#2f7a52]" : "bg-[#9fc5a8]",
                  )}
                  style={{
                    height: `${h}%`,
                    transitionDelay: `${index * 55}ms`,
                  }}
                  title={`${formatShortDate(day.date)}: ${formatLiters(day.liters)}`}
                />
              </div>
              {!compact ? (
                <span className="text-[10px] font-bold uppercase text-muted-foreground">
                  {formatShortDate(day.date).slice(0, 3)}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
      {compact ? (
        <p className="text-[10px] text-muted-foreground">
          Week · <span className="font-semibold text-foreground">{formatLiters(weekTotal)}</span>
        </p>
      ) : null}
    </div>
  );
}
