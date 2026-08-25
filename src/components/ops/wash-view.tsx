"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/forms/field";
import { formatShortDate, todayInKigali, addDays } from "@/lib/dates";
import type { WashRecord } from "@/lib/types";

export function WashView({ washes }: { washes: WashRecord[] }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    try {
      if (!navigator.onLine) {
        const { enqueue } = await import("@/lib/offline/sync");
        await enqueue({ entity: "wash", op: "upsert", record: payload });
        toast.success("Saved offline — will sync when you’re back online");
      } else {
        const response = await fetch("/api/wash", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = (await response.json()) as { error?: string };
        if (!response.ok) throw new Error(data.error ?? "Could not save");
        toast.success("Wash / dip recorded");
      }
      event.currentTarget.reset();
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[10px] font-bold tracking-[1.5px] text-[#7a9184]">TICK & HYGIENE</p>
        <h1 className="text-[28px] tracking-[-1px]">Wash in chemically treated water</h1>
        <p className="text-sm text-muted-foreground">Mix acaricide in a dedicated drum or spray race. Never use the drinking trough. Keep animals off treated water until it is dry.</p>
      </div>

      <div className="rounded-[15px] bg-[#e7f1e5] p-4 text-sm text-[#61776b]">
        Typical mix: Amitraz 12.5% at <b>1:500</b> in clean water. Spray or dip the whole herd every 7 days in tick season, 14 days in the dry season.
      </div>

      <form onSubmit={onSubmit} className="grid gap-3 rounded-[15px] border border-border bg-card p-5 md:grid-cols-2">
        <Field label="Date"><Input name="date" type="date" required defaultValue={todayInKigali()} /></Field>
        <Field label="Method">
          <select name="method" className="h-12 rounded-[9px] border border-border bg-input px-3">
            <option value="spray">Spray race / hand spray</option>
            <option value="dip">Plunge dip</option>
            <option value="hand_wash">Hand wash</option>
            <option value="footbath">Footbath</option>
          </select>
        </Field>
        <Field label="Chemical"><Input name="chemicalName" required defaultValue="Amitraz 12.5%" /></Field>
        <Field label="Mix ratio"><Input name="mixRatio" defaultValue="1:500 in treated spray water" /></Field>
        <Field label="Next due"><Input name="nextDue" type="date" defaultValue={addDays(todayInKigali(), 7)} /></Field>
        <Field label="Animals"><Input name="animalScope" defaultValue="herd" placeholder="herd, or tag numbers" /></Field>
        <Field label="Notes" className="md:col-span-2"><Textarea name="notes" placeholder="Weather, missed animals, drum rinsed after use…" /></Field>
        <Button type="submit" disabled={saving} className="h-11 md:col-span-2">{saving ? "Saving…" : "Save wash record"}</Button>
      </form>

      <div className="overflow-hidden rounded-[15px] border border-border bg-card">
        {washes.map((wash) => (
          <div key={wash.id} className="border-t border-[#edf1ed] px-4 py-3 first:border-t-0">
            <b className="block text-sm">{formatShortDate(wash.date)} · {wash.method.replace("_", " ")}</b>
            <p className="text-xs text-muted-foreground">{wash.chemicalName} · {wash.mixRatio} · next {wash.nextDue ? formatShortDate(wash.nextDue) : "not set"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
