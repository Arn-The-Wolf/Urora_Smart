"use client";

import { useRef, useState } from "react";
import { Camera, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MAX_BYTES = 420_000;
const DEFAULT_MAX = 6;

async function fileToDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Please choose an image file (JPEG, PNG, WebP)");
  if (file.size <= MAX_BYTES) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("Could not read image"));
      reader.readAsDataURL(file);
    });
  }

  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  const scale = Math.min(1, Math.sqrt(MAX_BYTES / file.size));
  canvas.width = Math.max(320, Math.round(bitmap.width * scale));
  canvas.height = Math.max(240, Math.round(bitmap.height * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not process image");
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
  if (dataUrl.length > MAX_BYTES * 1.4) throw new Error("Image is too large — try a smaller photo");
  return dataUrl;
}

/** Single photo — create / replace / delete. */
export function PhotoUpload({
  label,
  value,
  onChange,
  hint,
  className,
}: {
  label: string;
  value?: string | null;
  onChange: (url: string | null) => void;
  hint?: string;
  className?: string;
}) {
  return (
    <MultiPhotoUpload
      label={label}
      values={value ? [value] : []}
      onChange={(next) => onChange(next[0] ?? null)}
      hint={hint}
      className={className}
      max={1}
    />
  );
}

/** Multiple photos with add / replace-all / remove-one CRUD. */
export function MultiPhotoUpload({
  label,
  values,
  onChange,
  hint,
  className,
  max = DEFAULT_MAX,
}: {
  label: string;
  values: string[];
  onChange: (urls: string[]) => void;
  hint?: string;
  className?: string;
  max?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onPick(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setError(null);
    try {
      const room = Math.max(0, max - values.length);
      if (room === 0) throw new Error(`You can add up to ${max} photos`);
      const picked = Array.from(files).slice(0, room);
      const urls: string[] = [];
      for (const file of picked) {
        urls.push(await fileToDataUrl(file));
      }
      onChange([...values, ...urls]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not use this image");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function removeAt(index: number) {
    onChange(values.filter((_, i) => i !== index));
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium">
          {label}
          {max > 1 ? (
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              {values.length}/{max}
            </span>
          ) : null}
        </p>
        {values.length ? (
          <button type="button" className="text-xs font-semibold text-destructive" onClick={() => onChange([])}>
            Remove all
          </button>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-3">
        {values.map((url, index) => (
          <div key={`${index}-${url.slice(0, 24)}`} className="relative overflow-hidden rounded-xl border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="size-28 object-cover" />
            <button
              type="button"
              aria-label="Remove photo"
              className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-black/50 text-white"
              onClick={() => removeAt(index)}
            >
              <X className="size-3.5" />
            </button>
          </div>
        ))}
        {values.length < max ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="grid size-28 place-items-center rounded-xl border border-dashed border-[#b9cbbd] bg-[#f6faf5] text-[#718079] transition hover:border-primary hover:text-primary"
          >
            <Camera className="size-6" />
          </button>
        ) : null}
      </div>
      <div className="space-y-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          multiple={max > 1}
          className="hidden"
          onChange={(e) => void onPick(e.target.files)}
        />
        {values.length < max ? (
          <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => inputRef.current?.click()}>
            {busy ? "Processing…" : values.length ? "Add more photos" : "Upload photo"}
          </Button>
        ) : null}
        <p className="text-xs text-muted-foreground">
          {hint ?? (max > 1 ? "Add several photos — ear tag, side view, any notes that help." : "Stored on this farm.")}
        </p>
        {error ? <p className="text-xs text-destructive">{error}</p> : null}
      </div>
    </div>
  );
}
