"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { BusyButton } from "@/components/loading/busy-button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/forms/field";
import { useFarmData } from "@/lib/offline/provider";
import { canManageFarm, roleLabel } from "@/lib/roles";
import type { Farm } from "@/lib/types";
import type { Kraal } from "@/modules/kraals/service";

export function SettingsView({ kraals }: { kraals: Kraal[] }) {
  const router = useRouter();
  const { farm, user, pending, online, syncNow } = useFarmData();
  const owner = canManageFarm(user.role);
  const [name, setName] = useState(farm.name);
  const [location, setLocation] = useState(farm.location ?? "");
  const [digestPhone, setDigestPhone] = useState(farm.digestPhone ?? "");
  const [digestChannel, setDigestChannel] = useState(farm.digestChannel ?? "none");
  const [kraalName, setKraalName] = useState("");
  const [saving, setSaving] = useState(false);
  const [ownedFarms, setOwnedFarms] = useState<Farm[]>([]);
  const [newFarmName, setNewFarmName] = useState("");
  const [newFarmLocation, setNewFarmLocation] = useState("");
  const [farmBusy, setFarmBusy] = useState(false);

  useEffect(() => {
    if (!owner) return;
    void fetch("/api/farms")
      .then((res) => res.json())
      .then((data: { farms?: Farm[] }) => setOwnedFarms(data.farms ?? []))
      .catch(() => setOwnedFarms([]));
  }, [owner, farm.id]);

  async function onSave(event: FormEvent) {
    event.preventDefault();
    if (!owner) return;
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
    if (!owner || !kraalName.trim()) return;
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

  async function createFarm(event: FormEvent) {
    event.preventDefault();
    if (!owner || !newFarmName.trim()) return;
    setFarmBusy(true);
    try {
      const response = await fetch("/api/farms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newFarmName, location: newFarmLocation || null }),
      });
      const data = (await response.json()) as { error?: string; farm?: Farm };
      if (!response.ok) throw new Error(data.error ?? "Could not create farm");
      toast.success(`Switched to ${data.farm?.name ?? "new farm"}`);
      setNewFarmName("");
      setNewFarmLocation("");
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create farm");
    } finally {
      setFarmBusy(false);
    }
  }

  async function switchFarm(farmId: string) {
    if (!owner || farmId === farm.id) return;
    setFarmBusy(true);
    try {
      const response = await fetch("/api/farms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "switch", farmId }),
      });
      const data = (await response.json()) as { error?: string; farm?: Farm };
      if (!response.ok) throw new Error(data.error ?? "Could not switch farm");
      toast.success(`Now viewing ${data.farm?.name ?? "farm"}`);
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not switch farm");
    } finally {
      setFarmBusy(false);
    }
  }

  async function onLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="page-enter space-y-6">
      <div>
        <h1 className="font-heading text-3xl tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          {owner
            ? "Farm profile, create another farm, kraals, digests, and sync."
            : "Your account and sync. Farm profile is managed by the owner."}
        </p>
      </div>

      {owner ? (
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
          <BusyButton type="submit" busy={saving} busyLabel="Saving…" className="h-11 w-full">
            Save farm
          </BusyButton>
        </form>
      ) : (
        <section className="space-y-2 rounded-3xl bg-card p-5 ring-1 ring-foreground/8">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">This farm</p>
          <p className="font-heading text-xl">{farm.name}</p>
          <p className="text-sm text-muted-foreground">{farm.location ?? "Location not set"}</p>
          <p className="pt-2 text-xs text-muted-foreground">Ask the farm owner to change farm details or kraals.</p>
        </section>
      )}

      {owner ? (
        <section className="space-y-3 rounded-3xl bg-card p-5 ring-1 ring-foreground/8">
          <h2 className="text-sm font-semibold">Your farms</h2>
          <p className="text-xs text-muted-foreground">
            Owners can create another farm and switch between them. Operators stay on the farm they were invited to.
          </p>
          <ul className="space-y-2">
            {ownedFarms.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-2 rounded-xl border border-border px-3 py-2 text-sm">
                <div className="min-w-0">
                  <b className="block truncate">{item.name}</b>
                  <span className="text-xs text-muted-foreground">{item.location ?? "No location"}</span>
                </div>
                {item.id === farm.id ? (
                  <span className="text-xs font-bold text-primary">Active</span>
                ) : (
                  <BusyButton type="button" size="sm" variant="outline" busy={farmBusy} busyLabel="…" onClick={() => void switchFarm(item.id)}>
                    Switch
                  </BusyButton>
                )}
              </li>
            ))}
          </ul>
          <form onSubmit={createFarm} className="space-y-2 border-t border-border pt-3">
            <p className="text-xs font-semibold">Create another farm</p>
            <Input
              value={newFarmName}
              onChange={(e) => setNewFarmName(e.target.value)}
              placeholder="New farm name"
              className="h-11"
              required
            />
            <Input
              value={newFarmLocation}
              onChange={(e) => setNewFarmLocation(e.target.value)}
              placeholder="Location (optional)"
              className="h-11"
            />
            <BusyButton type="submit" busy={farmBusy} busyLabel="Working…" disabled={!newFarmName.trim()} className="h-11 w-full">
              Create farm & switch
            </BusyButton>
          </form>
        </section>
      ) : null}

      <section className="space-y-3 rounded-3xl bg-card p-5 ring-1 ring-foreground/8">
        <h2 className="text-sm font-semibold">Kraals / sites</h2>
        <p className="text-xs text-muted-foreground">
          {owner ? "Multiple kraals under one farm — assign cows later as needed." : "Sites on this farm (view only)."}
        </p>
        <ul className="space-y-2">
          {kraals.map((kraal) => (
            <li key={kraal.id} className="rounded-xl border border-border px-3 py-2 text-sm">
              <b>{kraal.name}</b>
            </li>
          ))}
          {kraals.length === 0 ? <li className="text-sm text-muted-foreground">No kraals yet.</li> : null}
        </ul>
        {owner ? (
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
        ) : null}
      </section>

      <section className="rounded-3xl bg-card p-5 ring-1 ring-foreground/8">
        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Signed in</p>
        <p className="mt-1 font-heading text-xl">{user.name}</p>
        <p className="text-sm text-muted-foreground">
          {user.email} · {roleLabel(user.role)}
        </p>
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
