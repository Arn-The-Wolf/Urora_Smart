"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { BusyButton } from "@/components/loading/busy-button";
import { Input } from "@/components/ui/input";
import { useFarmData } from "@/lib/offline/provider";
import { cowLabel, formatLiters } from "@/lib/format";
import { formatShortDate, sessionLabel, todayInKigali } from "@/lib/dates";
import type { MilkSession, MilkingRecord } from "@/lib/types";
import { cn } from "@/lib/utils";

export function MilkView() {
  const { milkings, cowById, cows, summary, saveMilking, removeMilking } = useFarmData();
  const [date, setDate] = useState(todayInKigali());
  const [editing, setEditing] = useState<MilkingRecord | null>(null);
  const [liters, setLiters] = useState("");
  const [session, setSession] = useState<MilkSession>("morning");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const rows = useMemo(() => milkings.filter((row) => row.date === date), [milkings, date]);
  const total = rows.reduce((sum, row) => sum + row.liters, 0);

  function startEdit(row: MilkingRecord) {
    setEditing(row);
    setLiters(String(row.liters));
    setSession(row.session);
    setNotes(row.notes ?? "");
  }

  async function onSaveEdit() {
    if (!editing) return;
    setSaving(true);
    try {
      await saveMilking(
        {
          cowId: editing.cowId,
          date: editing.date,
          session,
          liters: Number(liters),
          notes: notes || null,
        },
        editing.id,
      );
      toast.success("Milking updated");
      setEditing(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this milking record?")) return;
    try {
      await removeMilking(id);
      toast.success("Milking deleted");
      if (editing?.id === id) setEditing(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete");
    }
  }

  return (
    <div className="page-enter space-y-5">
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

      {editing ? (
        <div className="space-y-3 rounded-2xl border border-border bg-card p-4">
          <p className="text-sm font-semibold">
            Edit · {cowById(editing.cowId) ? cowLabel(cowById(editing.cowId)!) : "Cow"}
          </p>
          <select
            value={session}
            onChange={(e) => setSession(e.target.value as MilkSession)}
            className="h-11 w-full rounded-xl border border-border bg-input px-3"
          >
            <option value="morning">Morning</option>
            <option value="midday">Midday</option>
            <option value="evening">Evening</option>
          </select>
          <Input type="number" step="0.1" min="0" value={liters} onChange={(e) => setLiters(e.target.value)} className="h-11" />
          <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes" className="h-11" />
          <div className="flex gap-2">
            <BusyButton type="button" busy={saving} busyLabel="Saving…" onClick={() => void onSaveEdit()} className="h-10">
              Save
            </BusyButton>
            <Button type="button" variant="outline" className="h-10" onClick={() => setEditing(null)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : null}

      <div className="stagger-in space-y-2">
        {rows.map((row) => {
          const cow = cowById(row.cowId);
          return (
            <div key={row.id} className="flex items-center justify-between gap-3 rounded-2xl bg-card px-4 py-3 ring-1 ring-foreground/8">
              <div className="min-w-0">
                <p className="font-semibold">{cow ? cowLabel(cow) : "Cow"}</p>
                <p className="text-sm text-muted-foreground">{sessionLabel(row.session)}</p>
                {row.notes ? <p className="mt-1 text-sm text-earth">{row.notes}</p> : null}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <p className="font-heading text-xl">{formatLiters(row.liters)}</p>
                <button type="button" aria-label="Edit milking" className="rounded-lg p-2 text-primary hover:bg-accent" onClick={() => startEdit(row)}>
                  <Pencil className="size-4" />
                </button>
                <button type="button" aria-label="Delete milking" className="rounded-lg p-2 text-destructive hover:bg-destructive/10" onClick={() => void onDelete(row.id)}>
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {rows.length === 0 ? (
        <div className="rounded-3xl border border-dashed px-4 py-12 text-center">
          <p className="font-heading text-xl">No milkings on this day</p>
          <p className="mt-1 text-sm text-muted-foreground">Log the first session when you get back from the kraal.</p>
          {cows.length === 0 ? <p className="mt-2 text-xs text-muted-foreground">Add cows first from the Herd page.</p> : null}
        </div>
      ) : null}
    </div>
  );
}
