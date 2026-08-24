import { desc, eq } from "drizzle-orm";
import { washRecords } from "@/modules/wash/schema";
import { getDb } from "@/lib/db";
import { nowIso } from "@/lib/dates";
import { createId } from "@/lib/id";
import type { WashMethod, WashRecord } from "@/lib/types";
import { washInputSchema } from "@/modules/ops/validators";
import { useNamedStock } from "@/modules/inventory/service";

function toWash(row: typeof washRecords.$inferSelect): WashRecord {
  return {
    id: row.id,
    farmId: row.farmId,
    date: row.date,
    method: row.method as WashMethod,
    chemicalName: row.chemicalName,
    mixRatio: row.mixRatio,
    nextDue: row.nextDue,
    animalScope: row.animalScope,
    notes: row.notes,
    createdAt: row.createdAt,
  };
}

export async function listWashes(farmId: string) {
  const db = await getDb();
  const rows = await db.select().from(washRecords).where(eq(washRecords.farmId, farmId)).orderBy(desc(washRecords.date));
  return rows.map(toWash);
}

export async function nextWashDue(farmId: string) {
  const rows = await listWashes(farmId);
  const dated = rows
    .filter((row) => row.nextDue)
    .sort((a, b) => (a.nextDue! > b.nextDue! ? 1 : -1));
  return dated[0] ?? null;
}

export async function createWash(farmId: string, input: unknown) {
  const parsed = washInputSchema.parse(input);
  const db = await getDb();
  const row = {
    id: createId(),
    farmId,
    date: parsed.date,
    method: parsed.method,
    chemicalName: parsed.chemicalName,
    mixRatio: parsed.mixRatio ?? null,
    nextDue: parsed.nextDue ?? null,
    animalScope: parsed.animalScope,
    notes: parsed.notes ?? null,
    createdAt: nowIso(),
  };
  await db.insert(washRecords).values(row);
  await useNamedStock(farmId, parsed.chemicalName, 1, `Tick/wash ${parsed.method}`);
  return toWash(row);
}
