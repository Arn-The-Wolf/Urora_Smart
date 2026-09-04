"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { BusyButton } from "@/components/loading/busy-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/forms/field";
import { MultiPhotoUpload } from "@/components/forms/photo-upload";
import { useFarmData } from "@/lib/offline/provider";
import type { Cow } from "@/lib/types";
import { cn } from "@/lib/utils";

export function CowForm({ cow }: { cow?: Cow }) {
  const router = useRouter();
  const { saveCow } = useFarmData();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gender, setGender] = useState(cow?.gender ?? "female");
  const [status, setStatus] = useState(cow?.status ?? "active");
  const [photoUrls, setPhotoUrls] = useState<string[]>(cow?.photoUrls?.length ? cow.photoUrls : cow?.photoUrl ? [cow.photoUrl] : []);

  async function onSubmit(formData: FormData) {
    setSaving(true);
    setError(null);
    try {
      if (!photoUrls.length) {
        throw new Error("Every cow needs at least one photo — upload the animal’s image");
      }
      const saved = await saveCow(
        {
          tagNumber: String(formData.get("tagNumber") ?? ""),
          name: String(formData.get("name") ?? ""),
          breed: String(formData.get("breed") ?? ""),
          gender,
          birthDate: String(formData.get("birthDate") ?? "") || null,
          motherTag: String(formData.get("motherTag") ?? ""),
          status,
          photoUrl: photoUrls[0] ?? null,
          photoUrls,
          notes: String(formData.get("notes") ?? ""),
        },
        cow?.id,
      );
      toast.success(cow ? "Cow updated" : "Cow added to the herd");
      router.push(`/cattle/${saved.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save cow");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void onSubmit(new FormData(event.currentTarget));
      }}
      className="space-y-5 animate-fade-up"
    >
      <Field label="Tag number" htmlFor="tagNumber" error={error ?? undefined}>
        <Input id="tagNumber" name="tagNumber" required defaultValue={cow?.tagNumber} className="h-12 font-mono" placeholder="RW-0142" />
      </Field>
      <Field label="Name (optional)" htmlFor="name">
        <Input id="name" name="name" defaultValue={cow?.name ?? ""} className="h-12" placeholder="Nyiramuhire" />
      </Field>
      <Field label="Breed" htmlFor="breed">
        <Input id="breed" name="breed" defaultValue={cow?.breed ?? ""} className="h-12" placeholder="Ankole, Friesian, Jersey…" />
      </Field>

      <div className="grid gap-2">
        <p className="text-sm font-medium">Gender</p>
        <div className="grid grid-cols-2 gap-2">
          {(["female", "male"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setGender(value)}
              className={cn(
                "h-12 rounded-2xl text-sm font-semibold capitalize",
                gender === value ? "bg-primary text-primary-foreground" : "bg-card ring-1 ring-foreground/10",
              )}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      <Field label="Birth date" htmlFor="birthDate">
        <Input id="birthDate" name="birthDate" type="date" defaultValue={cow?.birthDate ?? ""} className="h-12" />
      </Field>
      <Field label="Mother's tag" htmlFor="motherTag">
        <Input id="motherTag" name="motherTag" defaultValue={cow?.motherTag ?? ""} className="h-12 font-mono" placeholder="Optional" />
      </Field>

      <div className="grid gap-2">
        <p className="text-sm font-medium">Status</p>
        <div className="grid grid-cols-3 gap-2">
          {(["active", "sold", "dead"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setStatus(value)}
              className={cn(
                "h-12 rounded-2xl text-sm font-semibold capitalize",
                status === value ? "bg-primary text-primary-foreground" : "bg-card ring-1 ring-foreground/10",
              )}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      <MultiPhotoUpload
        label="Cow photo (required)"
        values={photoUrls}
        onChange={setPhotoUrls}
        hint="Upload this animal’s own photo — every cow must have at least one image."
      />
      {!photoUrls.length ? (
        <p className="text-xs font-semibold text-destructive">Add a photo before saving this cow.</p>
      ) : null}

      <Field label="Notes" htmlFor="notes">
        <Textarea id="notes" name="notes" defaultValue={cow?.notes ?? ""} rows={4} placeholder="Temperament, history, anything useful…" />
      </Field>

      <BusyButton type="submit" busy={saving} busyLabel="Saving…" disabled={!photoUrls.length} className="h-12 w-full text-base">
        {cow ? "Save changes" : "Add to herd"}
      </BusyButton>
    </form>
  );
}
