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
import { formatShortDate } from "@/lib/dates";
import type { Cow, HealthEvent } from "@/lib/types";

export function HealthView({ events, cows }: { events: HealthEvent[]; cows: Cow[] }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const sick = events.filter((event) => event.kind === "illness" && (event.status === "open" || event.status === "recovering"));
  const cowName = (id: string) => {
    const cow = cows.find((item) => item.id === id);
    return cow ? cowLabel(cow) : id;
  };

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/health", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cowId: form.get("cowId"),
          date: form.get("date"),
          kind: form.get("kind"),
          status: form.get("kind") === "illness" ? "open" : "due",
          diagnosis: form.get("diagnosis"),
          treatment: form.get("treatment"),
          medicineName: form.get("medicineName"),
          isolated: form.get("isolated") === "on",
          notes: form.get("notes"),
        }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Could not save");
      toast.success("Health record saved");
      event.currentTarget.reset();
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save");
    } finally {
      setSaving(false);
    }
  }

  async function setStatus(id: string, status: HealthEvent["status"]) {
    await fetch("/api/health", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[10px] font-bold tracking-[1.5px] text-[#7a9184]">HERD WELLNESS</p>
        <h1 className="text-[28px] tracking-[-1px]">Health & sick animals <span className="ml-2 rounded-full bg-[#dfeee0] px-2 py-0.5 text-xs text-[#3a7552]">{sick.length} sick</span></h1>
        <p className="text-sm text-muted-foreground">Isolate, treat, and keep milk from a sick cow out of the can until she recovers.</p>
      </div>

      <form onSubmit={onSubmit} className="grid gap-3 rounded-[15px] border border-border bg-card p-5 md:grid-cols-2">
        <Field label="Animal">
          <select name="cowId" required className="h-12 rounded-[9px] border border-border bg-input px-3">
            {cows.filter((cow) => cow.status === "active").map((cow) => <option key={cow.id} value={cow.id}>{cowLabel(cow)}</option>)}
          </select>
        </Field>
        <Field label="Date"><Input name="date" type="date" required /></Field>
        <Field label="Type">
          <select name="kind" className="h-12 rounded-[9px] border border-border bg-input px-3">
            <option value="illness">Illness / sick</option>
            <option value="treatment">Treatment</option>
            <option value="vaccination">Vaccination</option>
            <option value="deworming">Deworming</option>
            <option value="vet_check">Vet check</option>
            <option value="injury">Injury</option>
          </select>
        </Field>
        <Field label="Medicine from store"><Input name="medicineName" placeholder="Oxytetracycline 20%" /></Field>
        <Field label="Diagnosis"><Input name="diagnosis" placeholder="Mastitis, ECF, wound…" /></Field>
        <Field label="Treatment"><Input name="treatment" placeholder="What you did today" /></Field>
        <label className="flex items-center gap-2 text-sm md:col-span-2"><input type="checkbox" name="isolated" className="accent-primary" /> Isolate from the milking line / other cows</label>
        <Field label="Notes" className="md:col-span-2"><Textarea name="notes" /></Field>
        <Button type="submit" disabled={saving} className="h-11 md:col-span-2">{saving ? "Saving…" : "Save health record"}</Button>
      </form>

      <div className="overflow-hidden rounded-[15px] border border-border bg-card">
        {events.map((event) => (
          <div key={event.id} className="flex flex-wrap items-center justify-between gap-3 border-t border-[#edf1ed] px-4 py-3 first:border-t-0">
            <div>
              <b className="block text-sm">{cowName(event.cowId)} · {event.kind.replace("_", " ")}</b>
              <p className="text-xs text-muted-foreground">{formatShortDate(event.date)} · {event.diagnosis || event.treatment || event.notes || "No extra notes"}</p>
            </div>
            <div className="flex items-center gap-2">
              {event.isolated ? <Badge variant="destructive">Isolated</Badge> : null}
              <Badge variant={event.status === "open" || event.status === "due" ? "secondary" : "default"}>{event.status}</Badge>
              {event.status === "open" ? <button className="text-xs font-bold text-primary" onClick={() => void setStatus(event.id, "recovering")}>Recovering</button> : null}
              {event.status === "recovering" || event.status === "due" ? <button className="text-xs font-bold text-primary" onClick={() => void setStatus(event.id, event.kind === "illness" ? "resolved" : "completed")}>Done</button> : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
