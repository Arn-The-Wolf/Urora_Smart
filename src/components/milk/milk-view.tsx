"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { useFarmData } from "@/lib/offline/provider";
import { cowLabel, formatLiters } from "@/lib/format";
import { formatShortDate, sessionLabel, todayInKigali } from "@/lib/dates";
import { cn } from "@/lib/utils";

export function MilkView() {
  const { milkings, cowById, summary } = useFarmData();
  const [date, setDate] = useState(todayInKigali());
  const rows = useMemo(() => milkings.filter((row) => row.date === date), [milkings, date]);
  const total = rows.reduce((sum, row) => sum + row.liters, 0);

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between animate-fade-up">
        <div>
          <h1 className="font-heading text-3xl tracking-tight">Milk</h1>
          <p className="text-muted-foreground">{formatLiters(summary.todayLiters)} logged today</p>
        </div>
        <Link href="/milk/new" className={cn(buttonVariants(), "h-10")}>
          <Plus className="size-4" />
          Log
        </Link>
      </div>

      <input
        type="date"
        value={date}
        onChange={(event) => setDate(event.target.value)}
        className="h-12 w-full rounded-2xl border border-input bg-card px-3 text-base"
      />

      <div className="rounded-3xl bg-canopy p-5 text-primary-foreground animate-scale-in delay-1">
        <p className="text-sm text-primary-foreground/70">{formatShortDate(date)}</p>
        <p className="font-heading text-5xl">{formatLiters(total)}</p>
      </div>

      <div className="stagger-in space-y-2">
        {rows.map((row) => {
          const cow = cowById(row.cowId);
          return (
            <div key={row.id} className="flex items-center justify-between rounded-2xl bg-card px-4 py-3 ring-1 ring-foreground/8">
              <div>
                <p className="font-semibold">{cow ? cowLabel(cow) : "Cow"}</p>
                <p className="text-sm text-muted-foreground">{sessionLabel(row.session)}</p>
                {row.notes ? <p className="mt-1 text-sm text-earth">{row.notes}</p> : null}
              </div>
              <p className="font-heading text-xl">{formatLiters(row.liters)}</p>
            </div>
          );
        })}
      </div>

      {rows.length === 0 ? (
        <div className="rounded-3xl border border-dashed px-4 py-12 text-center">
          <p className="font-heading text-xl">No milkings on this day</p>
          <p className="mt-1 text-sm text-muted-foreground">Log the first session when you get back from the kraal.</p>
        </div>
      ) : null}
    </div>
  );
}
