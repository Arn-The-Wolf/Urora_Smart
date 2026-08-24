import type { Cow, MilkingRecord, SyncMutation } from "@/lib/types";
import {
  listCowsChangedSince,
  upsertCowFromSync,
} from "@/modules/cattle/service";
import {
  listMilkingsChangedSince,
  upsertMilkingFromSync,
} from "@/modules/milk/service";

function isCow(record: Cow | MilkingRecord): record is Cow {
  return "tagNumber" in record;
}

export async function applySync(farmId: string, lastPulledAt: string | null, mutations: SyncMutation[]) {
  let applied = 0;
  const conflicts: { entity: string; id: string }[] = [];

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
    if (mutation.entity === "milking" && !isCow(mutation.record)) {
      const record =
        mutation.op === "delete"
          ? { ...mutation.record, deletedAt: mutation.record.deletedAt ?? mutation.record.updatedAt }
          : mutation.record;
      const result = await upsertMilkingFromSync(farmId, record);
      if (result.applied) applied += 1;
      else conflicts.push({ entity: "milking", id: record.id });
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
