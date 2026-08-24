import { and, eq, isNull } from "drizzle-orm";
import { cows } from "@/modules/cattle/schema";
import { getDb } from "@/lib/db";
import { nowIso } from "@/lib/dates";
import { createId } from "@/lib/id";
import type { Cow, CowStatus, Gender } from "@/lib/types";
import { cowInputSchema, type CowInput } from "@/modules/cattle/validators";

function toCow(row: typeof cows.$inferSelect): Cow {
  return {
    id: row.id,
    farmId: row.farmId,
    clientId: row.clientId,
    tagNumber: row.tagNumber,
    name: row.name,
    breed: row.breed,
    gender: row.gender as Gender,
    birthDate: row.birthDate,
    motherTag: row.motherTag,
    status: row.status as CowStatus,
    notes: row.notes,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    deletedAt: row.deletedAt,
  };
}

export async function listCows(farmId: string, status?: CowStatus) {
  const db = await getDb();
  const rows = await db
    .select()
    .from(cows)
    .where(
      status
        ? and(eq(cows.farmId, farmId), eq(cows.status, status), isNull(cows.deletedAt))
        : and(eq(cows.farmId, farmId), isNull(cows.deletedAt)),
    );
  return rows
    .map(toCow)
    .sort((a, b) => a.tagNumber.localeCompare(b.tagNumber, undefined, { numeric: true }));
}

export async function getCow(farmId: string, id: string) {
  const db = await getDb();
  const rows = await db
    .select()
    .from(cows)
    .where(and(eq(cows.id, id), eq(cows.farmId, farmId), isNull(cows.deletedAt)))
    .limit(1);
  return rows[0] ? toCow(rows[0]) : null;
}

export async function createCow(farmId: string, input: CowInput) {
  const parsed = cowInputSchema.parse(input);
  const db = await getDb();
  const existing = await db
    .select({ id: cows.id })
    .from(cows)
    .where(and(eq(cows.farmId, farmId), eq(cows.tagNumber, parsed.tagNumber)))
    .limit(1);
  if (existing[0]) {
    throw new Error("A cow with this tag number already exists");
  }
  const now = nowIso();
  const row = {
    id: parsed.id ?? createId(),
    farmId,
    clientId: parsed.clientId ?? createId(),
    tagNumber: parsed.tagNumber,
    name: parsed.name ?? null,
    breed: parsed.breed ?? null,
    gender: parsed.gender,
    birthDate: parsed.birthDate ?? null,
    motherTag: parsed.motherTag ?? null,
    status: parsed.status,
    notes: parsed.notes ?? null,
    createdAt: parsed.createdAt ?? now,
    updatedAt: parsed.updatedAt ?? now,
    deletedAt: null,
  };
  await db.insert(cows).values(row);
  return toCow(row as typeof cows.$inferSelect);
}

export async function updateCow(farmId: string, id: string, input: CowInput) {
  const parsed = cowInputSchema.parse(input);
  const current = await getCow(farmId, id);
  if (!current) throw new Error("Cow not found");
  const db = await getDb();
  const now = nowIso();
  const next = {
    tagNumber: parsed.tagNumber,
    name: parsed.name ?? null,
    breed: parsed.breed ?? null,
    gender: parsed.gender,
    birthDate: parsed.birthDate ?? null,
    motherTag: parsed.motherTag ?? null,
    status: parsed.status,
    notes: parsed.notes ?? null,
    updatedAt: parsed.updatedAt ?? now,
  };
  await db
    .update(cows)
    .set(next)
    .where(and(eq(cows.id, id), eq(cows.farmId, farmId)));
  return { ...current, ...next };
}

export async function deleteCow(farmId: string, id: string) {
  const current = await getCow(farmId, id);
  if (!current) throw new Error("Cow not found");
  const db = await getDb();
  const now = nowIso();
  await db
    .update(cows)
    .set({ deletedAt: now, updatedAt: now })
    .where(and(eq(cows.id, id), eq(cows.farmId, farmId)));
}

export async function upsertCowFromSync(farmId: string, record: Cow) {
  const db = await getDb();
  const existing = await db
    .select()
    .from(cows)
    .where(and(eq(cows.id, record.id), eq(cows.farmId, farmId)))
    .limit(1);
  if (existing[0] && existing[0].updatedAt > record.updatedAt) {
    return { applied: false, current: toCow(existing[0]) };
  }
  const row = { ...record, farmId };
  if (existing[0]) {
    await db.update(cows).set(row).where(eq(cows.id, record.id));
  } else {
    await db.insert(cows).values(row);
  }
  return { applied: true, current: row };
}

export async function listCowsChangedSince(farmId: string, since: string | null) {
  const db = await getDb();
  const rows = await db.select().from(cows).where(eq(cows.farmId, farmId));
  const mapped = rows.map(toCow);
  if (!since) return mapped;
  return mapped.filter((row) => row.updatedAt > since);
}
