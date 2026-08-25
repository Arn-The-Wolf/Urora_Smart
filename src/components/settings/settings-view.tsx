"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/forms/field";
import { useFarmData } from "@/lib/offline/provider";
import type { Kraal } from "@/modules/kraals/service";

export function SettingsView({ kraals }: { kraals: Kraal[] }) {
  const router = useRouter();
  const { farm, user, pending, online, syncNow } = useFarmData();
  const [name, setName] = useState(farm.name);
  const [location, setLocation] = useState(farm.location ?? "");
  const [digestPhone, setDigestPhone] = useState(farm.digestPhone ?? "");
  const [digestChannel, setDigestChannel] = useState(farm.digestChannel ?? "none");
  const [kraalName, setKraalName] = useState("");
  const [saving, setSaving] = useState(false);

  async function onSave(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await fetch("/api/farm", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          location: location || null,
          digestPhone: digestPhone || null,
          digestChannel: digestChannel === "none" ? null : digestChannel,
        }),
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

  async function addKraal(event: FormEvent) {
    event.preventDefault();
    if (!kraalName.trim()) return;
    const response = await fetch("/api/kraals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: kraalName }),
    });
    const data = (await response.json()) as { error?: string };
    if (!response.ok) {
      toast.error(data.error ?? "Could not add kraal");
      return;
    }
    toast.success("Kraal added");
    setKraalName("");
    router.refresh();
  }

  async function onLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Farm, kraals, digests, and sync.</p>
      </div>

      <form onSubmit={onSave} className="space-y-4 rounded-3xl bg-card p-5 ring-1 ring-foreground/8">
        <Field label="Farm name">
          <Input value={name} onChange={(event) => setName(event.target.value)} className="h-12" />
        </Field>
        <Field label="Location">
          <Input
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            className="h-12"
            placeholder="Nyagatare, Rwanda"
          />
        </Field>
        <Field label="Owner phone (SMS / WhatsApp digests)">
          <Input
            value={digestPhone}
            onChange={(event) => setDigestPhone(event.target.value)}
            className="h-12"
            placeholder="+2507…"
          />
        </Field>
        <Field label="Digest channel">
          <select
            value={digestChannel}
            onChange={(e) => setDigestChannel(e.target.value)}
            className="h-12 w-full rounded-[9px] border border-border bg-input px-3"
          >
            <option value="none">Off for now</option>
            <option value="sms">SMS (ready when gateway connected)</option>
            <option value="whatsapp">WhatsApp (ready when gateway connected)</option>
          </select>
        </Field>
        <p className="text-xs text-muted-foreground">
          Digests will send daily milk totals and critical alerts. Wire a provider (Africa’s Talking / Twilio) with env keys to go live.
        </p>
        <Button type="submit" disabled={saving} className="h-11 w-full">
          {saving ? "Saving…" : "Save farm"}
        </Button>
      </form>

      <section className="space-y-3 rounded-3xl bg-card p-5 ring-1 ring-foreground/8">
        <h2 className="text-sm font-semibold">Kraals / sites</h2>
        <p className="text-xs text-muted-foreground">Multiple kraals under one farm — assign cows later as needed.</p>
        <ul className="space-y-2">
          {kraals.map((kraal) => (
            <li key={kraal.id} className="rounded-xl border border-border px-3 py-2 text-sm">
              <b>{kraal.name}</b>
            </li>
          ))}
          {kraals.length === 0 ? <li className="text-sm text-muted-foreground">No kraals yet.</li> : null}
        </ul>
        <form onSubmit={addKraal} className="flex gap-2">
          <Input
            value={kraalName}
            onChange={(e) => setKraalName(e.target.value)}
            placeholder="Main kraal / young stock…"
            className="h-11"
          />
          <Button type="submit" className="h-11 shrink-0">
            Add
          </Button>
        </form>
      </section>

      <section className="rounded-3xl bg-card p-5 ring-1 ring-foreground/8">
        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Signed in</p>
        <p className="mt-1 font-heading text-xl">{user.name}</p>
        <p className="text-sm text-muted-foreground">{user.email}</p>
        <p className="mt-3 text-sm">
          {online ? "Online" : "Offline"} · {pending} change{pending === 1 ? "" : "s"} waiting to sync
        </p>
        {pending > 0 && online ? (
          <Button className="mt-3 h-10" variant="outline" onClick={() => void syncNow()}>
            Sync now
          </Button>
        ) : null}
      </section>

      <Button variant="outline" className="h-11 w-full" onClick={() => void onLogout()}>
        Sign out
      </Button>
    </div>
  );
}
