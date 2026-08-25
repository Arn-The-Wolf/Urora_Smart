"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/forms/field";
import { MultiPhotoUpload } from "@/components/forms/photo-upload";
import { Badge } from "@/components/ui/badge";
import { cowLabel } from "@/lib/format";
import { addDays, formatShortDate, todayInKigali } from "@/lib/dates";
import type { Cow, HealthEvent, HealthKind, HealthStatus } from "@/lib/types";

export function HealthView({ events, cows }: { events: HealthEvent[]; cows: Cow[] }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [withholdDays, setWithholdDays] = useState("3");
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [editing, setEditing] = useState<HealthEvent | null>(null);
  const today = todayInKigali();
  const sick = events.filter((event) => event.kind === "illness" && (event.status === "open" || event.status === "recovering"));
  const activeWithholds = events.filter(
    (event) => event.milkWithholdUntil && event.milkWithholdUntil >= today && event.status !== "resolved" && event.status !== "completed",
  );
  const cowName = (id: string) => {
    const cow = cows.find((item) => item.id === id);
    return cow ? cowLabel(cow) : id;
  };

  function startEdit(event: HealthEvent) {
    setEditing(event);
    setPhotoUrls(event.photoUrls?.length ? event.photoUrls : event.photoUrl ? [event.photoUrl] : []);
    if (event.milkWithholdUntil && event.date) {
      const start = new Date(`${event.date}T12:00:00`);
      const end = new Date(`${event.milkWithholdUntil}T12:00:00`);
      const days = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86_400_000));
      setWithholdDays(String(days));
    } else {
      setWithholdDays("3");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function clearForm(form?: HTMLFormElement) {
    form?.reset();
    setEditing(null);
    setPhotoUrls([]);
    setWithholdDays("3");
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    const form = new FormData(event.currentTarget);
    const kind = String(form.get("kind")) as HealthKind;
    const date = String(form.get("date"));
    const days = Number(withholdDays);
    const milkWithholdUntil = form.get("setWithhold") === "on" && days > 0 ? addDays(date || today, days) : null;
    const payload = {
      id: editing?.id,
      cowId: form.get("cowId"),
      date,
      kind,
      status: (form.get("status") as HealthStatus) || (editing?.status ?? (kind === "illness" ? "open" : "due")),
      diagnosis: form.get("diagnosis"),
      treatment: form.get("treatment"),
      medicineName: form.get("medicineName"),
      isolated: form.get("isolated") === "on",
      milkWithholdUntil,
      photoUrl: photoUrls[0] ?? null,
      photoUrls,
      notes: form.get("notes"),
    };
    try {
      if (!navigator.onLine) {
        const { enqueue } = await import("@/lib/offline/sync");
        await enqueue({ entity: "health", op: "upsert", record: payload });
        toast.success("Saved offline — will sync when you’re back online");
      } else {
        const response = await fetch("/api/health", {
          method: editing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = (await response.json()) as { error?: string };
        if (!response.ok) throw new Error(data.error ?? "Could not save");
        toast.success(
          editing
            ? "Health record updated"
            : milkWithholdUntil
              ? `Saved · milk withhold until ${milkWithholdUntil}`
              : "Health record saved",
        );
      }
      clearForm(event.currentTarget);
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

  async function onDelete(id: string) {
    if (!confirm("Delete this health record and its photos?")) return;
    const response = await fetch(`/api/health?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    const data = (await response.json()) as { error?: string };
    if (!response.ok) {
      toast.error(data.error ?? "Could not delete");
      return;
    }
    toast.success("Health record deleted");
    if (editing?.id === id) clearForm();
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[10px] font-bold tracking-[1.5px] text-[#7a9184]">HERD WELLNESS</p>
        <h1 className="text-[28px] tracking-[-1px]">
          Health & sick animals{" "}
          <span className="ml-2 rounded-full bg-[#dfeee0] px-2 py-0.5 text-xs text-[#3a7552]">{sick.length} sick</span>
          {activeWithholds.length ? (
            <span className="ml-2 rounded-full bg-[#f9e3df] px-2 py-0.5 text-xs text-[#a95343]">
              {activeWithholds.length} withhold
            </span>
          ) : null}
        </h1>
        <p className="text-sm text-muted-foreground">
          Create, edit, or delete treatments with photos. After antibiotics, set a milk withhold so milk cannot be logged until withdrawal ends.
        </p>
      </div>

      <form onSubmit={onSubmit} className="grid gap-3 rounded-[15px] border border-border bg-card p-5 md:grid-cols-2">
        <div className="md:col-span-2 flex items-center justify-between gap-2">
          <p className="text-sm font-semibold">{editing ? "Edit health record" : "New health record"}</p>
          {editing ? (
            <button type="button" className="text-xs font-bold text-primary" onClick={() => clearForm()}>
              Cancel edit
            </button>
          ) : null}
        </div>
        <Field label="Animal">
          <select
            name="cowId"
            required
            defaultValue={editing?.cowId}
            key={editing?.id ?? "new-cow"}
            className="h-12 rounded-[9px] border border-border bg-input px-3"
          >
            {cows.filter((cow) => cow.status === "active").map((cow) => (
              <option key={cow.id} value={cow.id}>
                {cowLabel(cow)}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Date">
          <Input name="date" type="date" required defaultValue={editing?.date ?? today} key={`date-${editing?.id ?? "new"}`} />
        </Field>
        <Field label="Type">
          <select name="kind" defaultValue={editing?.kind ?? "illness"} key={`kind-${editing?.id ?? "new"}`} className="h-12 rounded-[9px] border border-border bg-input px-3">
            <option value="illness">Illness / sick</option>
            <option value="treatment">Treatment</option>
            <option value="vaccination">Vaccination</option>
            <option value="deworming">Deworming</option>
            <option value="vet_check">Vet check</option>
            <option value="injury">Injury</option>
          </select>
        </Field>
        <Field label="Status">
          <select
            name="status"
            defaultValue={editing?.status ?? "open"}
            key={`status-${editing?.id ?? "new"}`}
            className="h-12 rounded-[9px] border border-border bg-input px-3"
          >
            <option value="open">Open</option>
            <option value="recovering">Recovering</option>
            <option value="resolved">Resolved</option>
            <option value="due">Due</option>
            <option value="completed">Completed</option>
          </select>
        </Field>
        <Field label="Medicine from store">
          <Input name="medicineName" defaultValue={editing?.medicineName ?? ""} placeholder="Oxytetracycline 20%" key={`med-${editing?.id ?? "new"}`} />
        </Field>
        <Field label="Diagnosis">
          <Input name="diagnosis" defaultValue={editing?.diagnosis ?? ""} placeholder="Mastitis, ECF, wound…" key={`dx-${editing?.id ?? "new"}`} />
        </Field>
        <Field label="Treatment" className="md:col-span-2">
          <Input name="treatment" defaultValue={editing?.treatment ?? ""} placeholder="What you did today" key={`tx-${editing?.id ?? "new"}`} />
        </Field>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="isolated" className="accent-primary" defaultChecked={editing?.isolated} key={`iso-${editing?.id ?? "new"}`} /> Isolate from the milking line / other cows
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="setWithhold"
            className="accent-primary"
            defaultChecked={Boolean(editing?.milkWithholdUntil) || !editing}
            key={`wh-${editing?.id ?? "new"}`}
          />{" "}
          Milk withhold (antibiotics)
        </label>
        <Field label="Withhold days from treatment date">
          <Input
            type="number"
            min="1"
            max="60"
            value={withholdDays}
            onChange={(e) => setWithholdDays(e.target.value)}
            className="h-12 bg-input"
          />
        </Field>
        <MultiPhotoUpload
          label="Support photos"
          values={photoUrls}
          onChange={setPhotoUrls}
          className="md:col-span-2"
          hint="Sick cow, medicine bottle, wound — add, replace, or remove photos."
        />
        <Field label="Notes" className="md:col-span-2">
          <Textarea name="notes" defaultValue={editing?.notes ?? ""} key={`notes-${editing?.id ?? "new"}`} />
        </Field>
        <Button type="submit" disabled={saving} className="h-11 md:col-span-2">
          {saving ? "Saving…" : editing ? "Update health record" : "Save health record"}
        </Button>
      </form>

      <div className="overflow-hidden rounded-[15px] border border-border bg-card">
        {events.map((event) => (
          <div
            key={event.id}
            className="flex flex-wrap items-center justify-between gap-3 border-t border-[#edf1ed] px-4 py-3 first:border-t-0"
          >
            <div className="flex min-w-0 items-center gap-3">
              {(event.photoUrls?.[0] || event.photoUrl) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={event.photoUrls?.[0] || event.photoUrl || ""}
                  alt=""
                  className="size-12 shrink-0 rounded-lg object-cover ring-1 ring-border"
                />
              ) : null}
              <div>
                <b className="block text-sm">
                  {cowName(event.cowId)} · {event.kind.replace("_", " ")}
                </b>
                <p className="text-xs text-muted-foreground">
                  {formatShortDate(event.date)} · {event.diagnosis || event.treatment || event.notes || "No extra notes"}
                  {event.milkWithholdUntil ? ` · withhold until ${event.milkWithholdUntil}` : ""}
                  {event.photoUrls?.length ? ` · ${event.photoUrls.length} photo${event.photoUrls.length === 1 ? "" : "s"}` : ""}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {event.isolated ? <Badge variant="destructive">Isolated</Badge> : null}
              {event.milkWithholdUntil && event.milkWithholdUntil >= today ? (
                <Badge variant="destructive">Withhold</Badge>
              ) : null}
              <Badge variant={event.status === "open" || event.status === "due" ? "secondary" : "default"}>
                {event.status}
              </Badge>
              <button type="button" className="inline-flex items-center gap-1 text-xs font-bold text-primary" onClick={() => startEdit(event)}>
                <Pencil className="size-3.5" /> Edit
              </button>
              <button type="button" className="inline-flex items-center gap-1 text-xs font-bold text-destructive" onClick={() => void onDelete(event.id)}>
                <Trash2 className="size-3.5" /> Delete
              </button>
              {event.status === "open" ? (
                <button className="text-xs font-bold text-primary" onClick={() => void setStatus(event.id, "recovering")}>
                  Recovering
                </button>
              ) : null}
              {event.status === "recovering" || event.status === "due" ? (
                <button
                  className="text-xs font-bold text-primary"
                  onClick={() => void setStatus(event.id, event.kind === "illness" ? "resolved" : "completed")}
                >
                  Done
                </button>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
