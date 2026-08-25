import type { Cow, HealthEvent, MilkingRecord, StockItem, SyncMutation, WashRecord } from "@/lib/types";
import {
  listCowsChangedSince,
  upsertCowFromSync,
} from "@/modules/cattle/service";
import {
  listMilkingsChangedSince,
  upsertMilkingFromSync,
} from "@/modules/milk/service";
import { createHealth } from "@/modules/health/service";
import { createStock } from "@/modules/inventory/service";
import { createWash } from "@/modules/wash/service";

function isCow(record: unknown): record is Cow {
  return Boolean(record && typeof record === "object" && "tagNumber" in record);
}

function isMilking(record: unknown): record is MilkingRecord {
  return Boolean(record && typeof record === "object" && "liters" in record && "session" in record);
}

export async function applySync(farmId: string, lastPulledAt: string | null, mutations: SyncMutation[]) {
  let applied = 0;
  const conflicts: { entity: string; id: string; reason?: string; resolvedId?: string }[] = [];

  for (const mutation of mutations) {
    if (mutation.entity === "cow" && isCow(mutation.record)) {
      const record =
        mutation.op === "delete"
          ? { ...mutation.record, deletedAt: mutation.record.deletedAt ?? mutation.record.updatedAt }
          : mutation.record;
      const result = await upsertCowFromSync(farmId, record);
      if (result.applied) applied += 1;
      else conflicts.push({ entity: "cow", id: record.id });
    }
    if (mutation.entity === "milking" && isMilking(mutation.record)) {
      const record =
        mutation.op === "delete"
          ? { ...mutation.record, deletedAt: mutation.record.deletedAt ?? mutation.record.updatedAt }
          : mutation.record;
      const result = await upsertMilkingFromSync(farmId, record);
      if (result.applied) applied += 1;
      if (result.conflict || !result.applied) {
        conflicts.push({
          entity: "milking",
          id: record.id,
          reason: "reason" in result ? String(result.reason ?? "server_newer") : "server_newer",
          resolvedId: "current" in result && result.current ? result.current.id : record.id,
        });
      }
    }
    if (mutation.entity === "health" && mutation.op === "upsert") {
      try {
        await createHealth(farmId, mutation.record as Partial<HealthEvent>);
        applied += 1;
      } catch {
        conflicts.push({ entity: "health", id: String((mutation.record as { id?: string })?.id ?? "unknown"), reason: "apply_failed" });
      }
    }
    if (mutation.entity === "stock" && mutation.op === "upsert") {
      try {
        await createStock(farmId, mutation.record as Partial<StockItem>);
        applied += 1;
      } catch {
        conflicts.push({ entity: "stock", id: String((mutation.record as { id?: string })?.id ?? "unknown"), reason: "apply_failed" });
      }
    }
    if (mutation.entity === "wash" && mutation.op === "upsert") {
      try {
        await createWash(farmId, mutation.record as Partial<WashRecord>);
        applied += 1;
      } catch {
        conflicts.push({ entity: "wash", id: String((mutation.record as { id?: string })?.id ?? "unknown"), reason: "apply_failed" });
      }
    }
  }

  const [cows, milkings] = await Promise.all([
    listCowsChangedSince(farmId, lastPulledAt),
    listMilkingsChangedSince(farmId, lastPulledAt),
  ]);

  return {
    serverTime: new Date().toISOString(),
    applied,
    conflicts,
    cows,
    milkings,
  };
}
