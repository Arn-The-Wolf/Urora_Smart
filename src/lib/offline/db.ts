import Dexie, { type EntityTable } from "dexie";
import type { Cow, MilkingRecord, SyncMutation } from "@/lib/types";

export type QueuedMutation = SyncMutation & {
  id?: number;
  queuedAt: string;
};

export type MetaRow = {
  key: string;
  value: string;
};

class UroraDB extends Dexie {
  cows!: EntityTable<Cow, "id">;
  milkings!: EntityTable<MilkingRecord, "id">;
  queue!: EntityTable<QueuedMutation, "id">;
  meta!: EntityTable<MetaRow, "key">;

  constructor() {
    super("urora-farm");
    this.version(1).stores({
      cows: "id, farmId, clientId, tagNumber, status, updatedAt",
      milkings: "id, farmId, clientId, cowId, date, session, updatedAt",
      queue: "++id, queuedAt, entity",
      meta: "key",
    });
  }
}

export const offlineDb = new UroraDB();

export async function getMeta(key: string) {
  const row = await offlineDb.meta.get(key);
  return row?.value ?? null;
}

export async function setMeta(key: string, value: string) {
  await offlineDb.meta.put({ key, value });
}
