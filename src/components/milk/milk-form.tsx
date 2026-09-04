"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { BusyButton } from "@/components/loading/busy-button";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/forms/field";
import { useFarmData } from "@/lib/offline/provider";
import { cowLabel } from "@/lib/format";
import { currentSession, sessionLabel, todayInKigali } from "@/lib/dates";
import type { MilkSession } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export function MilkForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { cows, saveMilking } = useFarmData();
  const milkers = cows.filter((cow) => cow.gender === "female" && cow.status === "active");
  const [cowId, setCowId] = useState(searchParams.get("cowId") ?? milkers[0]?.id ?? "");
  const [session, setSession] = useState<MilkSession>(currentSession());
  const [date, setDate] = useState(todayInKigali());
  const [liters, setLiters] = useState(8);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selected = useMemo(() => milkers.find((cow) => cow.id === cowId), [cowId, milkers]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!cowId) {
      setError("Choose a cow first");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await saveMilking({ cowId, date, session, liters, notes });
      toast.success(`Logged ${liters} L for ${selected ? cowLabel(selected) : "cow"}`);
      router.push("/milk");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save milking");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="animate-fade-up">
        <h1 className="font-heading text-3xl tracking-tight">Log milk</h1>
        <p className="text-muted-foreground">The daily action. Keep it accurate, keep it quick.</p>
      </div>

      <div className="animate-fade-up delay-1">
        <p className="mb-2 text-sm font-medium">Cow</p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {milkers.map((cow) => (
            <button
              key={cow.id}
              type="button"
              onClick={() => setCowId(cow.id)}
              className={cn(
                "min-w-28 shrink-0 rounded-2xl px-3 py-3 text-left ring-1",
                cowId === cow.id ? "bg-primary text-primary-foreground ring-primary" : "bg-card ring-foreground/10",
              )}
            >
              <p className="font-mono text-[11px] font-bold opacity-80">{cow.tagNumber}</p>
              <p className="font-semibold">{cow.name ?? "Unnamed"}</p>
            </button>
          ))}
        </div>
      </div>

      <Field label="Date">
        <Input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="h-12" />
      </Field>

      <div className="animate-fade-up delay-2">
        <p className="mb-2 text-sm font-medium">Session</p>
        <div className="grid grid-cols-3 gap-2">
          {(["morning", "midday", "evening"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setSession(value)}
              className={cn(
                "h-14 rounded-2xl text-sm font-semibold",
                session === value ? "bg-primary text-primary-foreground" : "bg-card ring-1 ring-foreground/10",
              )}
            >
              {sessionLabel(value)}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-3xl bg-card p-5 text-center ring-1 ring-foreground/8 animate-scale-in delay-3">
        <p className="text-sm font-semibold text-muted-foreground">Liters</p>
        <div className="mt-3 flex items-center justify-center gap-5">
          <button
            type="button"
            className="grid size-12 place-items-center rounded-full bg-muted"
            onClick={() => setLiters((value) => Math.max(0.5, Math.round((value - 0.5) * 10) / 10))}
            aria-label="Decrease"
          >
            <Minus className="size-5" />
          </button>
          <p className="font-heading min-w-24 text-6xl leading-none">{liters.toFixed(1)}</p>
          <button
            type="button"
            className="grid size-12 place-items-center rounded-full bg-primary text-primary-foreground"
            onClick={() => setLiters((value) => Math.min(50, Math.round((value + 0.5) * 10) / 10))}
            aria-label="Increase"
          >
            <Plus className="size-5" />
          </button>
        </div>
      </div>

      <Field label="Notes (optional)">
        <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Less than usual, seemed unwell…" rows={3} />
      </Field>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <BusyButton type="submit" busy={saving} busyLabel="Saving…" disabled={milkers.length === 0} className="h-12 w-full text-base">
        Save milking
      </BusyButton>
    </form>
  );
}
