"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/forms/field";
import { Badge } from "@/components/ui/badge";
import { cowLabel } from "@/lib/format";
import { formatShortDate, todayInKigali } from "@/lib/dates";
import type { BreedingEvent, Cow } from "@/lib/types";

const kinds = [
  ["heat", "Heat / oestrus"],
  ["ai", "Artificial insemination"],
  ["natural_service", "Natural service"],
  ["pregnancy_check", "Pregnancy check"],
  ["dry_off", "Dry-off"],
  ["calving", "Calving"],
] as const;

export function BreedingView({ events, cows }: { events: BreedingEvent[]; cows: Cow[] }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const females = cows.filter((cow) => cow.gender === "female" && cow.status === "active");
  const upcoming = events.filter(
    (event) =>
      event.status !== "failed" &&
      event.status !== "completed" &&
      (event.expectedCalving || event.dryOffDate),
  );

  const cowName = (id: string) => {
    const cow = cows.find((item) => item.id === id);
    return cow ? cowLabel(cow) : id;
  };

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/breeding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(form.entries())),
      });
      const data = (await response.json()) as { error?: string; event?: BreedingEvent };
      if (!response.ok) throw new Error(data.error ?? "Could not save");
      toast.success(
        data.event?.expectedCalving
          ? `Saved · expected calving ${data.event.expectedCalving}`
          : "Breeding record saved",
      );
      event.currentTarget.reset();
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save");
    } finally {
      setSaving(false);
    }
  }

  async function setStatus(id: string, status: BreedingEvent["status"]) {
    await fetch("/api/breeding", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[10px] font-bold tracking-[1.5px] text-[#7a9184]">REPRODUCTION</p>
        <h1 className="text-[28px] tracking-[-1px]">
          Breeding & calving{" "}
          <span className="ml-2 rounded-full bg-[#dfeee0] px-2 py-0.5 text-xs text-[#3a7552]">
            {upcoming.length} upcoming
          </span>
        </h1>
        <p className="text-sm text-muted-foreground">
          Log heat and AI — Urora Smart suggests expected calving (~280 days) and dry-off (~60 days before).
        </p>
      </div>

      <form onSubmit={onSubmit} className="grid gap-3 rounded-[15px] border border-border bg-card p-5 md:grid-cols-2">
        <Field label="Cow">
          <select name="cowId" required className="h-12 rounded-[9px] border border-border bg-input px-3">
            {females.map((cow) => (
              <option key={cow.id} value={cow.id}>
                {cowLabel(cow)}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Date">
          <Input name="date" type="date" required defaultValue={todayInKigali()} />
        </Field>
        <Field label="Event">
          <select name="kind" className="h-12 rounded-[9px] border border-border bg-input px-3">
            {kinds.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Sire / bull tag">
          <Input name="sireTag" placeholder="Optional" className="h-12 bg-input" />
        </Field>
        <Field label="Expected calving (optional override)">
          <Input name="expectedCalving" type="date" className="h-12 bg-input" />
        </Field>
        <Field label="Dry-off date (optional override)">
          <Input name="dryOffDate" type="date" className="h-12 bg-input" />
        </Field>
        <Field label="Notes" className="md:col-span-2">
          <Textarea name="notes" />
        </Field>
        <Button type="submit" disabled={saving} className="h-11 md:col-span-2">
          {saving ? "Saving…" : "Save breeding event"}
        </Button>
      </form>

      <div className="overflow-hidden rounded-[15px] border border-border bg-card">
        {events.map((event) => (
          <div
            key={event.id}
            className="flex flex-wrap items-center justify-between gap-3 border-t border-[#edf1ed] px-4 py-3 first:border-t-0"
          >
            <div>
              <b className="block text-sm">
                {cowName(event.cowId)} · {event.kind.replace("_", " ")}
              </b>
              <p className="text-xs text-muted-foreground">
                {formatShortDate(event.date)}
                {event.sireTag ? ` · sire ${event.sireTag}` : ""}
                {event.expectedCalving ? ` · calving ${event.expectedCalving}` : ""}
                {event.dryOffDate ? ` · dry-off ${event.dryOffDate}` : ""}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{event.status}</Badge>
              {event.status === "recorded" ? (
                <button className="text-xs font-bold text-primary" onClick={() => void setStatus(event.id, "confirmed")}>
                  Confirm
                </button>
              ) : null}
              {event.status === "confirmed" || event.status === "recorded" ? (
                <button className="text-xs font-bold text-primary" onClick={() => void setStatus(event.id, "completed")}>
                  Done
                </button>
              ) : null}
            </div>
          </div>
        ))}
        {events.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">No breeding events yet.</p>
        ) : null}
      </div>
    </div>
  );
}
