"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { useFarmData } from "@/lib/offline/provider";
import { ageLabel, cowLabel, formatLiters, statusLabel } from "@/lib/format";
import { addDays, formatShortDate, sessionLabel, todayInKigali } from "@/lib/dates";
import { cn } from "@/lib/utils";

export function CowDetailView({ cowId }: { cowId: string }) {
  const router = useRouter();
  const { cowById, milkings, removeCow } = useFarmData();
  const cow = cowById(cowId);
  const today = todayInKigali();
  const records = milkings.filter((row) => row.cowId === cowId);
  const last7 = Array.from({ length: 7 }, (_, index) => {
    const date = addDays(today, index - 6);
    return {
      date,
      liters: records.filter((row) => row.date === date).reduce((sum, row) => sum + row.liters, 0),
    };
  });
  const maxBar = Math.max(...last7.map((d) => d.liters), 1);

  if (!cow) {
    return (
      <div className="rounded-3xl bg-card p-8 text-center ring-1 ring-foreground/8">
        <p className="font-heading text-2xl">Cow not found</p>
        <Link href="/cattle" className="mt-3 inline-block text-sm font-semibold text-primary">
          Back to the herd
        </Link>
      </div>
    );
  }

  const current = cow;

  async function onDelete() {
    if (!confirm(`Remove ${cowLabel(current)} from the herd?`)) return;
    await removeCow(current.id);
    toast.success("Cow removed");
    router.push("/cattle");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="animate-fade-up">
        {cow.photoUrl ? (
          <div className="mb-4 overflow-hidden rounded-2xl border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cow.photoUrl} alt="" className="max-h-56 w-full object-cover" />
          </div>
        ) : null}
        <p className="font-mono text-sm font-bold text-primary">{cow.tagNumber}</p>
        <div className="mt-1 flex items-start justify-between gap-3">
          <h1 className="font-heading text-3xl tracking-tight">{cow.name ?? "Unnamed"}</h1>
          <Badge variant={cow.status === "active" ? "default" : "secondary"}>{statusLabel(cow.status)}</Badge>
        </div>
        <p className="mt-2 text-muted-foreground">
          {[cow.breed, cow.gender === "female" ? "Female" : "Male", ageLabel(cow.birthDate), cow.motherTag ? `Dam ${cow.motherTag}` : null]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </div>

      {cow.gender === "female" && cow.status === "active" ? (
        <section className="rounded-3xl bg-card p-5 ring-1 ring-foreground/8 animate-scale-in delay-1">
          <h2 className="font-heading text-xl">Milk this week</h2>
          <div className="mt-4 flex h-28 items-end gap-2">
            {last7.map((day) => (
              <div key={day.date} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className={cn("w-full rounded-full bg-primary/80 transition-all duration-700", day.date === today && "bg-primary")}
                  style={{ height: `${Math.max(8, (day.liters / maxBar) * 100)}%` }}
                />
                <span className="text-[10px] font-bold uppercase text-muted-foreground">{formatShortDate(day.date).slice(0, 3)}</span>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {cow.notes ? (
        <section className="rounded-3xl bg-accent/60 p-5 animate-fade-up delay-2">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Notes</p>
          <p className="mt-1 leading-relaxed">{cow.notes}</p>
        </section>
      ) : null}

      <div className="flex gap-2">
        <Link href={`/cattle/${cow.id}/edit`} className={cn(buttonVariants({ variant: "outline" }), "h-11 flex-1")}>
          <Pencil className="size-4" />
          Edit
        </Link>
        {cow.gender === "female" && cow.status === "active" ? (
          <Link href={`/milk/new?cowId=${cow.id}`} className={cn(buttonVariants(), "h-11 flex-1")}>
            Log milk
          </Link>
        ) : null}
      </div>

      <section className="space-y-3">
        <h2 className="font-heading text-xl">Milking history</h2>
        {records.slice(0, 12).map((row) => (
          <div key={row.id} className="flex items-center justify-between rounded-2xl bg-card px-4 py-3 ring-1 ring-foreground/8">
            <div>
              <p className="font-semibold">{sessionLabel(row.session)}</p>
              <p className="text-sm text-muted-foreground">{formatShortDate(row.date)}</p>
            </div>
            <p className="font-heading text-xl">{formatLiters(row.liters)}</p>
          </div>
        ))}
        {records.length === 0 ? <p className="text-sm text-muted-foreground">No milking records yet.</p> : null}
      </section>

      <Button variant="destructive" className="h-11 w-full" onClick={() => void onDelete()}>
        <Trash2 className="size-4" />
        Remove from herd
      </Button>
    </div>
  );
}
