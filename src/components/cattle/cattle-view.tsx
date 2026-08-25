"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { useFarmData } from "@/lib/offline/provider";
import { ageLabel, statusLabel } from "@/lib/format";
import type { CowStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const filters: { id: "all" | CowStatus; label: string }[] = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "sold", label: "Sold" },
  { id: "dead", label: "Dead" },
];

export function CattleView() {
  const { cows } = useFarmData();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | CowStatus>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return cows.filter((cow) => {
      if (status !== "all" && cow.status !== status) return false;
      if (!q) return true;
      return [cow.tagNumber, cow.name, cow.breed].some((value) => value?.toLowerCase().includes(q));
    });
  }, [cows, query, status]);

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-3 animate-fade-up">
        <div>
          <h1 className="font-heading text-3xl tracking-tight">Herd</h1>
          <p className="text-muted-foreground">{cows.length} animals on this farm</p>
        </div>
        <Link href="/cattle/new" className={cn(buttonVariants(), "h-10")}>
          <Plus className="size-4" />
          Add cow
        </Link>
      </div>

      <div className="relative animate-fade-up delay-1">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search tag, name, breed"
          className="h-12 rounded-2xl pl-9"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 animate-fade-up delay-2">
        {filters.map((filter) => (
          <button
            key={filter.id}
            type="button"
            onClick={() => setStatus(filter.id)}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm font-semibold whitespace-nowrap",
              status === filter.id ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground ring-1 ring-foreground/10",
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="stagger-in grid gap-3 md:grid-cols-2">
        {filtered.map((cow) => (
          <Link
            key={cow.id}
            href={`/cattle/${cow.id}`}
            className="flex items-center justify-between gap-3 rounded-2xl bg-card p-4 ring-1 ring-foreground/8 transition hover:ring-primary/30"
          >
            <div className="flex min-w-0 items-center gap-3">
              {cow.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={cow.photoUrl} alt="" className="size-14 shrink-0 rounded-xl object-cover ring-1 ring-foreground/8" />
              ) : (
                <span className="grid size-14 shrink-0 place-items-center rounded-xl bg-[#e4f0e4] text-lg font-bold text-primary">
                  {(cow.name?.[0] ?? cow.tagNumber.slice(-2)).toUpperCase()}
                </span>
              )}
              <div className="min-w-0">
                <p className="font-mono text-xs font-bold tracking-wide text-primary">{cow.tagNumber}</p>
                <p className="truncate font-heading text-xl">{cow.name ?? "Unnamed"}</p>
                <p className="text-sm text-muted-foreground">
                  {[cow.breed, cow.gender === "female" ? "Female" : "Male", ageLabel(cow.birthDate)].filter(Boolean).join(" · ")}
                </p>
              </div>
            </div>
            <Badge variant={cow.status === "active" ? "default" : "secondary"}>{statusLabel(cow.status)}</Badge>
          </Link>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed px-4 py-12 text-center">
          <p className="font-heading text-xl">No cows match</p>
          <p className="mt-1 text-sm text-muted-foreground">Try another search, or add the first animal to this farm.</p>
        </div>
      ) : null}
    </div>
  );
}
