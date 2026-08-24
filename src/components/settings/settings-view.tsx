"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/forms/field";
import { useFarmData } from "@/lib/offline/provider";

export function SettingsView() {
  const router = useRouter();
  const { farm, user, pending, online } = useFarmData();
  const [name, setName] = useState(farm.name);
  const [location, setLocation] = useState(farm.location ?? "");
  const [saving, setSaving] = useState(false);

  async function onSave(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await fetch("/api/farm", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, location: location || null }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Could not save farm");
      toast.success("Farm details saved");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save farm");
    } finally {
      setSaving(false);
    }
  }

  async function onLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="animate-fade-up">
        <h1 className="font-heading text-3xl tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Farm, account, and sync.</p>
      </div>

      <form onSubmit={onSave} className="space-y-4 rounded-3xl bg-card p-5 ring-1 ring-foreground/8 animate-fade-up delay-1">
        <Field label="Farm name">
          <Input value={name} onChange={(event) => setName(event.target.value)} className="h-12" />
        </Field>
        <Field label="Location">
          <Input value={location} onChange={(event) => setLocation(event.target.value)} className="h-12" placeholder="Nyagatare, Rwanda" />
        </Field>
        <Button type="submit" disabled={saving} className="h-11 w-full">
          {saving ? "Saving…" : "Save farm"}
        </Button>
      </form>

      <section className="rounded-3xl bg-card p-5 ring-1 ring-foreground/8 animate-fade-up delay-2">
        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Signed in</p>
        <p className="mt-1 font-heading text-xl">{user.name}</p>
        <p className="text-sm text-muted-foreground">{user.email}</p>
        <p className="mt-3 text-sm">
          {online ? "Online" : "Offline"} · {pending} change{pending === 1 ? "" : "s"} waiting to sync
        </p>
      </section>

      <section className="rounded-3xl bg-muted/60 p-5 text-sm leading-relaxed text-muted-foreground animate-fade-up delay-3">
        Cattle, milk, sick animals, vet stock, chemically treated washes, and the daily schedule are live. Breeding, expenses, and crops can still plug in later — every row already carries a farm ID.
      </section>

      <Button variant="outline" className="h-11 w-full" onClick={() => void onLogout()}>
        Sign out
      </Button>
    </div>
  );
}
