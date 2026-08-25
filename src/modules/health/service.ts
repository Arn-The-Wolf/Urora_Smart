import { and, desc, eq } from "drizzle-orm";
import { healthEvents } from "@/modules/health/schema";
import { getDb } from "@/lib/db";
import { nowIso, todayInKigali } from "@/lib/dates";
import { createId } from "@/lib/id";
import { parsePhotoList, serializePhotoList } from "@/lib/photos";
import type { HealthEvent, HealthKind, HealthStatus } from "@/lib/types";
import { healthInputSchema } from "@/modules/ops/validators";
import { useNamedStock } from "@/modules/inventory/service";

function toEvent(row: typeof healthEvents.$inferSelect): HealthEvent {
  const photoUrls = parsePhotoList(row.photoUrls, row.photoUrl);
  return {
    id: row.id,
    farmId: row.farmId,
    cowId: row.cowId,
    date: row.date,
    kind: row.kind as HealthKind,
    status: row.status as HealthStatus,
    diagnosis: row.diagnosis,
    treatment: row.treatment,
    medicineName: row.medicineName,
    isolated: row.isolated === 1,
    milkWithholdUntil: row.milkWithholdUntil ?? null,
    photoUrl: photoUrls[0] ?? null,
    photoUrls,
    notes: row.notes,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function photosFromInput(parsed: { photoUrls?: string[]; photoUrl?: string | null }) {
  const fromList = parsed.photoUrls?.length ? parsed.photoUrls : parsed.photoUrl ? [parsed.photoUrl] : [];
  return serializePhotoList(fromList);
}

export async function listHealth(farmId: string) {
  const db = await getDb();
  const rows = await db.select().from(healthEvents).where(eq(healthEvents.farmId, farmId)).orderBy(desc(healthEvents.date));
  return rows.map(toEvent);
}

export async function listSickAnimals(farmId: string) {
  const rows = await listHealth(farmId);
  return rows.filter((row) => row.kind === "illness" && (row.status === "open" || row.status === "recovering"));
}

export async function listActiveWithholds(farmId: string, onDate = todayInKigali()) {
  const rows = await listHealth(farmId);
  return rows.filter(
    (row) =>
      row.milkWithholdUntil &&
      row.milkWithholdUntil >= onDate &&
      row.status !== "resolved" &&
      row.status !== "completed",
  );
}

export async function getCowWithholdUntil(farmId: string, cowId: string, onDate = todayInKigali()) {
  const active = (await listActiveWithholds(farmId, onDate)).filter((row) => row.cowId === cowId);
  if (!active.length) return null;
  return active.reduce((latest, row) => {
    if (!latest || (row.milkWithholdUntil && row.milkWithholdUntil > latest)) return row.milkWithholdUntil;
    return latest;
  }, null as string | null);
}

export async function createHealth(farmId: string, input: unknown) {
  const parsed = healthInputSchema.parse(input);
  const db = await getDb();
  const now = nowIso();
  const photos = photosFromInput(parsed);
  const row = {
    id: createId(),
    farmId,
    cowId: parsed.cowId,
    date: parsed.date,
    kind: parsed.kind,
    status: parsed.status,
    diagnosis: parsed.diagnosis ?? null,
    treatment: parsed.treatment ?? null,
    medicineName: parsed.medicineName ?? null,
    isolated: parsed.isolated ? 1 : 0,
    milkWithholdUntil: parsed.milkWithholdUntil ?? null,
    photoUrl: photos.photoUrl,
    photoUrls: photos.photoUrls,
    notes: parsed.notes ?? null,
    createdAt: now,
    updatedAt: now,
  };
  await db.insert(healthEvents).values(row);
  if (parsed.medicineName && (parsed.kind === "illness" || parsed.kind === "treatment" || parsed.kind === "deworming")) {
    await useNamedStock(farmId, parsed.medicineName, 1, `${parsed.kind} · treatment`);
  }
  return toEvent(row as typeof healthEvents.$inferSelect);
}

export async function updateHealth(farmId: string, id: string, input: unknown) {
  const parsed = healthInputSchema.parse(input);
  const db = await getDb();
  const existing = await db
    .select()
    .from(healthEvents)
    .where(and(eq(healthEvents.id, id), eq(healthEvents.farmId, farmId)))
    .limit(1);
  if (!existing[0]) throw new Error("Health record not found");
  const photos = photosFromInput(parsed);
  const next = {
    cowId: parsed.cowId,
    date: parsed.date,
    kind: parsed.kind,
    status: parsed.status,
    diagnosis: parsed.diagnosis ?? null,
    treatment: parsed.treatment ?? null,
    medicineName: parsed.medicineName ?? null,
    isolated: parsed.isolated ? 1 : 0,
    milkWithholdUntil: parsed.milkWithholdUntil ?? null,
    photoUrl: photos.photoUrl,
    photoUrls: photos.photoUrls,
    notes: parsed.notes ?? null,
    updatedAt: nowIso(),
  };
  await db.update(healthEvents).set(next).where(and(eq(healthEvents.id, id), eq(healthEvents.farmId, farmId)));
  return toEvent({ ...existing[0], ...next } as typeof healthEvents.$inferSelect);
}

export async function updateHealthStatus(farmId: string, id: string, status: HealthStatus) {
  const db = await getDb();
  await db
    .update(healthEvents)
    .set({ status, updatedAt: nowIso() })
    .where(and(eq(healthEvents.id, id), eq(healthEvents.farmId, farmId)));
}

export async function deleteHealth(farmId: string, id: string) {
  const db = await getDb();
  await db.delete(healthEvents).where(and(eq(healthEvents.id, id), eq(healthEvents.farmId, farmId)));
}
