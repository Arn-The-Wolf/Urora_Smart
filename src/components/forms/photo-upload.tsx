"use client";

import { useRef, useState } from "react";
import { Camera, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MAX_BYTES = 450_000;

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
  const dataUrl = canvas.toDataURL("image/jpeg", 0.82);
  if (dataUrl.length > MAX_BYTES * 1.4) throw new Error("Image is too large — try a smaller photo");
  return dataUrl;
}

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
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onPick(file: File | null) {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const dataUrl = await fileToDataUrl(file);
      onChange(dataUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not use this image");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium">{label}</p>
        {value ? (
          <button type="button" className="text-xs font-semibold text-destructive" onClick={() => onChange(null)}>
            Remove
          </button>
        ) : null}
      </div>
      <div className="flex flex-wrap items-start gap-3">
        {value ? (
          <div className="relative overflow-hidden rounded-xl border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="" className="size-28 object-cover" />
            <button
              type="button"
              aria-label="Remove photo"
              className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-black/50 text-white"
              onClick={() => onChange(null)}
            >
              <X className="size-3.5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="grid size-28 place-items-center rounded-xl border border-dashed border-[#b9cbbd] bg-[#f6faf5] text-[#718079] transition hover:border-primary hover:text-primary"
          >
            <Camera className="size-6" />
          </button>
        )}
        <div className="min-w-0 flex-1 space-y-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => void onPick(e.target.files?.[0] ?? null)}
          />
          <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => inputRef.current?.click()}>
            {busy ? "Processing…" : value ? "Replace photo" : "Upload photo"}
          </Button>
          <p className="text-xs text-muted-foreground">{hint ?? "Ear tag, sick cow, or medicine bottle — stored on this farm."}</p>
          {error ? <p className="text-xs text-destructive">{error}</p> : null}
        </div>
      </div>
    </div>
  );
}
