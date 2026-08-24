import { nowIso } from "@/lib/dates";
import { offlineDb, getMeta, setMeta } from "@/lib/offline/db";
import type { Cow, MilkingRecord, SyncMutation } from "@/lib/types";

export async function cacheCows(cows: Cow[]) {
  await offlineDb.cows.bulkPut(cows);
}

export async function cacheMilkings(milkings: MilkingRecord[]) {
  await offlineDb.milkings.bulkPut(milkings);
}

export async function readCachedCows() {
  const rows = await offlineDb.cows.toArray();
  return rows
    .filter((row) => !row.deletedAt)
    .sort((a, b) => a.tagNumber.localeCompare(b.tagNumber, undefined, { numeric: true }));
}

export async function readCachedMilkings() {
  const rows = await offlineDb.milkings.toArray();
  return rows
    .filter((row) => !row.deletedAt)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export async function enqueue(mutation: SyncMutation) {
  await offlineDb.queue.add({ ...mutation, queuedAt: nowIso() });
}

export async function pendingCount() {
  return offlineDb.queue.count();
}

export async function flushQueue() {
  const mutations = await offlineDb.queue.orderBy("id").toArray();
  const lastPulledAt = await getMeta("lastPulledAt");
  const payload = {
    lastPulledAt,
    mutations: mutations.map(({ entity, op, record }) => ({ entity, op, record })),
  };

  const response = await fetch("/api/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(data?.error ?? "Sync failed");
  }
  const result = (await response.json()) as {
    serverTime: string;
    cows: Cow[];
    milkings: MilkingRecord[];
    conflicts?: { entity: string; id: string; reason?: string; resolvedId?: string }[];
    applied?: number;
  };
  if (result.cows.length) await cacheCows(result.cows);
  if (result.milkings.length) await cacheMilkings(result.milkings);
  await setMeta("lastPulledAt", result.serverTime);
  if (mutations.length) {
    const ids = mutations.map((item) => item.id).filter((id): id is number => typeof id === "number");
    await offlineDb.queue.bulkDelete(ids);
  }
  return result;
}
