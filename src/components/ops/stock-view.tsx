"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/forms/field";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { StockItem } from "@/lib/types";
import { addDays, todayInKigali } from "@/lib/dates";

const categories = [
  ["medicine", "Veterinary medicine"],
  ["salt", "Salt"],
  ["mineral", "Minerals"],
  ["acaricide", "Tick chemical"],
  ["disinfectant", "Disinfectant"],
  ["feed_supplement", "Feed supplement"],
  ["other", "Other"],
] as const;

function stockBadges(item: StockItem, today: string, until: string) {
  const badges: { label: string; variant?: "secondary" | "destructive" | "outline" }[] = [];
  if (item.quantity <= item.reorderLevel) {
    badges.push({ label: item.quantity <= 0 ? "Out" : "Reorder", variant: "secondary" });
  }
  if (item.expiresOn && item.expiresOn < today && item.quantity > 0) {
    badges.push({ label: "Expired", variant: "destructive" });
  } else if (item.expiresOn && item.expiresOn <= until && item.quantity > 0) {
    badges.push({ label: "Expiring", variant: "outline" });
  }
  return badges;
}

export function StockView({ items }: { items: StockItem[] }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [moving, setMoving] = useState<{ item: StockItem; kind: "in" | "out" } | null>(null);
  const [qty, setQty] = useState("1");
  const [reason, setReason] = useState("");
  const today = todayInKigali();
  const until = addDays(today, 30);
  const low = items.filter((item) => item.quantity <= item.reorderLevel);
  const expired = items.filter((item) => item.expiresOn && item.expiresOn < today && item.quantity > 0);

  async function addItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(form.entries())),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Could not save");
      toast.success("Stock item added");
      event.currentTarget.reset();
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save");
    } finally {
      setSaving(false);
    }
  }

  async function submitMove(event: FormEvent) {
    event.preventDefault();
    if (!moving) return;
    const quantity = Number(qty);
    if (!quantity || quantity <= 0) {
      toast.error("Enter a quantity greater than 0");
      return;
    }
    setSaving(true);
    try {
      const response = await fetch("/api/stock", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: moving.item.id,
          kind: moving.kind,
          quantity,
          date: todayInKigali(),
          reason:
            reason ||
            (moving.kind === "out" ? "Used on farm" : "Purchase / restock"),
        }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Could not update stock");
      toast.success(moving.kind === "out" ? "Stock taken out" : "Stock received");
      setMoving(null);
      setQty("1");
      setReason("");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update stock");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[10px] font-bold tracking-[1.5px] text-[#7a9184]">STORE</p>
        <h1 className="text-[28px] tracking-[-1px]">
          Medicines, salt & supplies{" "}
          <span className="ml-2 rounded-full bg-[#faefd9] px-2 py-0.5 text-xs text-[#ad7731]">
            {low.length} low
          </span>
          {expired.length ? (
            <span className="ml-2 rounded-full bg-[#f9e3df] px-2 py-0.5 text-xs text-[#a95343]">
              {expired.length} expired
            </span>
          ) : null}
        </h1>
        <p className="text-sm text-muted-foreground">
          Reorder alerts fire at the threshold — before stock hits zero. Track batch and expiry on medicines and disinfectants.
        </p>
      </div>

      <form
        onSubmit={addItem}
        className="grid gap-3 rounded-[15px] border border-border bg-card p-5 md:grid-cols-2"
      >
        <Field label="Item name">
          <Input name="name" required placeholder="Salt blocks" className="h-12 bg-input" />
        </Field>
        <Field label="Category">
          <select name="category" className="h-12 rounded-[9px] border border-border bg-input px-3">
            {categories.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Unit">
          <Input name="unit" required placeholder="L, vials, blocks, kg" className="h-12 bg-input" />
        </Field>
        <Field label="Quantity on hand">
          <Input name="quantity" type="number" step="0.1" required className="h-12 bg-input" />
        </Field>
        <Field label="Reorder when at">
          <Input name="reorderLevel" type="number" step="0.1" defaultValue="2" className="h-12 bg-input" />
        </Field>
        <Field label="Batch / lot code">
          <Input name="batchCode" placeholder="Optional · e.g. LOT-2408" className="h-12 bg-input" />
        </Field>
        <Field label="Expiry date">
          <Input name="expiresOn" type="date" className="h-12 bg-input" />
        </Field>
        <Button type="submit" disabled={saving} className="h-11 self-end">
          {saving ? "Saving…" : "Add to store"}
        </Button>
      </form>

      <div className="overflow-hidden rounded-[15px] border border-border bg-card">
        {items.map((item) => {
          const badges = stockBadges(item, today, until);
          return (
            <div
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-3 border-t border-[#edf1ed] px-4 py-3 first:border-t-0"
            >
              <div>
                <b className="block text-sm">{item.name}</b>
                <p className="text-xs text-muted-foreground">
                  {item.category.replace("_", " ")}
                  {item.batchCode ? ` · batch ${item.batchCode}` : ""}
                  {item.expiresOn ? ` · expires ${item.expiresOn}` : ""}
                  {!item.batchCode && !item.expiresOn ? ` · ${item.notes || item.unit}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <strong>
                  {item.quantity} {item.unit}
                </strong>
                {badges.map((badge) => (
                  <Badge key={badge.label} variant={badge.variant ?? "secondary"}>
                    {badge.label}
                  </Badge>
                ))}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setMoving({ item, kind: "in" });
                    setQty("1");
                    setReason("Purchase / restock");
                  }}
                >
                  In
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setMoving({ item, kind: "out" });
                    setQty("1");
                    setReason("Used on farm");
                  }}
                >
                  Out
                </Button>
              </div>
            </div>
          );
        })}
        {items.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">Store is empty — add the first item.</p>
        ) : null}
      </div>

      <Dialog open={Boolean(moving)} onOpenChange={(open) => !open && setMoving(null)}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {moving?.kind === "out" ? "Take out" : "Receive"} {moving?.item.name}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={submitMove} className="grid gap-3">
            <Field label={`Quantity (${moving?.item.unit ?? ""})`}>
              <Input
                type="number"
                step="0.1"
                min="0.1"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                className="h-12 bg-input"
                required
              />
            </Field>
            <Field label="Reason">
              <Input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="h-12 bg-input"
                placeholder="Treatment, restock, salt for trough…"
              />
            </Field>
            <Button type="submit" disabled={saving} className="h-11">
              {saving ? "Saving…" : "Confirm"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
